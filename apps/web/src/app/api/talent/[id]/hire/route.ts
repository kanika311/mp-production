import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { backendFetch } from '@/lib/cms/server/backend';

export async function POST(
  req: NextRequest,
  ctx: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    const resolvedParams = await ctx.params;
    const rawId = decodeURIComponent(resolvedParams.id || '').trim();

    if (!rawId) {
      return NextResponse.json(
        { success: false, message: 'Talent identifier is required' },
        { status: 400 }
      );
    }

    const body = await req.json().catch(() => ({}));
    const {
      requesterName,
      requesterPhone,
      requesterEmail,
      days = 1,
      dailyRate = 4999,
      totalAmount = 4999,
      dateNeeded,
      projectType = 'Production Campaign / Shoot',
      city,
      briefDescription,
    } = body;

    if (!requesterName || !requesterPhone || !requesterEmail) {
      return NextResponse.json(
        { success: false, message: 'Name, phone number, and email are required for booking.' },
        { status: 400 }
      );
    }

    // 1. Resolve Talent Profile by id, slug, or userId
    const slugHyphen = rawId.replace(/\s+/g, '-');
    const slugSpace = rawId.replace(/-/g, ' ');

    let profile = await prisma.talentProfile.findFirst({
      where: {
        OR: [
          { id: rawId },
          { slug: rawId },
          { slug: slugHyphen },
          { slug: slugSpace },
          { userId: rawId },
        ],
      },
      include: {
        user: true,
        pricing: true,
        userTalents: {
          include: { category: true },
        },
      },
    });

    // Fallback: if not found, find any matching user name or first available talent
    if (!profile) {
      profile = await prisma.talentProfile.findFirst({
        where: {
          OR: [
            { user: { firstName: { contains: rawId, mode: 'insensitive' } } },
            { user: { lastName: { contains: rawId, mode: 'insensitive' } } },
          ],
        },
        include: {
          user: true,
          pricing: true,
          userTalents: {
            include: { category: true },
          },
        },
      });
    }

    if (!profile) {
      return NextResponse.json(
        { success: false, message: 'Talent profile not found in our directory.' },
        { status: 404 }
      );
    }

    const talentFullName = `${profile.user.firstName || ''} ${profile.user.lastName || ''}`.trim() || profile.stageName || 'Talent';
    const numDays = Math.max(1, Number(days) || 1);
    const calculatedFee = Number(totalAmount) || (numDays * (Number(dailyRate) || 4999));
    const formattedFee = `₹${calculatedFee.toLocaleString('en-IN')}`;
    const budgetRangeStr = `${formattedFee} (${numDays} Day${numDays > 1 ? 's' : ''} @ ₹${(Number(dailyRate) || 4999).toLocaleString('en-IN')}/day)`;

    // 2. Create HireRequest in Prisma
    const hireRequest = await prisma.hireRequest.create({
      data: {
        talentId: profile.id,
        requesterName: String(requesterName).trim(),
        requesterPhone: String(requesterPhone).trim(),
        requesterEmail: String(requesterEmail).trim().toLowerCase(),
        projectType: String(projectType || 'Commercial / Shoot').trim(),
        city: city ? String(city).trim() : null,
        dateNeeded: dateNeeded ? new Date(dateNeeded) : new Date(),
        budgetRange: budgetRangeStr,
        briefDescription: `[Direct Day-wise Booking: ${numDays} Day(s) @ ₹${Number(dailyRate) || 4999}/day | Total: ${formattedFee}]\n${briefDescription || 'Direct website booking inquiry.'}`,
        status: 'NEW',
      },
    });

    // 3. Create SalesLead in Prisma
    try {
      await prisma.salesLead.create({
        data: {
          clientName: String(requesterName).trim(),
          email: String(requesterEmail).trim().toLowerCase(),
          phone: String(requesterPhone).trim(),
          source: 'WEBSITE',
          stage: 'NEW',
          estimatedValue: calculatedFee * 100, // in paise
          notes: `[Talent Booking: ${talentFullName}]\nDays: ${numDays} Day(s)\nFee: ${formattedFee}\nCity: ${city || 'N/A'}\nDate: ${dateNeeded || 'Immediate'}\nBrief: ${briefDescription || 'N/A'}`,
        },
      });
    } catch (leadErr) {
      console.error('[HireRoute] Error creating sales lead:', leadErr);
    }

    // 4. Send WhatsApp Notification via InboxWA / WhatsApp Integration
    const adminPhone = '8310531309'; // Admin Contact Number specified by user
    const clientPhone = String(requesterPhone).replace(/[^0-9]/g, '');

    // Read WhatsApp Configuration from SystemConfig
    try {
      const configRecord = await prisma.systemConfig.findUnique({
        where: { key: 'WHATSAPP_CONFIG' },
      });

      let inboxwaApiKey = process.env.INBOXWA_API_KEY || '';
      let inboxwaInstanceId = process.env.INBOXWA_INSTANCE_ID || '';
      let inboxwaBaseUrl = process.env.INBOXWA_BASE_URL || 'https://inboxwa.online/api/v1';

      if (configRecord?.value) {
        try {
          const parsed = JSON.parse(configRecord.value);
          if (parsed.inboxwaApiKey) inboxwaApiKey = parsed.inboxwaApiKey;
          if (parsed.inboxwaInstanceId) inboxwaInstanceId = parsed.inboxwaInstanceId;
          if (parsed.inboxwaBaseUrl) inboxwaBaseUrl = parsed.inboxwaBaseUrl;
        } catch {}
      }

      const sendWhatsApp = async (to: string, msg: string) => {
        if (!inboxwaApiKey || !inboxwaInstanceId) return;
        const cleanTo = to.replace(/[^0-9]/g, '');
        await fetch(`${inboxwaBaseUrl}/send-text`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${inboxwaApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            instance_id: inboxwaInstanceId,
            number: cleanTo,
            message: msg,
          }),
        }).catch((e) => console.error('[WhatsApp Send Error]:', e));
      };

      // Message to Client / Requester
      const clientMessage = `🎬 *MP PRODUCTION — BOOKING CONFIRMATION* 🎬\n\nDear *${requesterName}*,\nYour booking request for *${talentFullName}* has been received successfully!\n\n📋 *Booking Details*:\n• *Talent*: ${talentFullName}\n• *Duration*: ${numDays} Day(s)\n• *Total Estimated Fee*: ${formattedFee}\n• *Project*: ${projectType}\n• *City*: ${city || 'Studio / Location'}\n• *Booking Ref*: ${hireRequest.trackingSlug || hireRequest.id.slice(-6).toUpperCase()}\n\nOur production team is reviewing your schedule and will reach out to you within a few hours.\n\n📞 *Admin Hotline*: +91 831 053 1309\n🌐 *Website*: https://mpproduction.com\n\nThank you for choosing MP Production Atelier!`;

      // Message to Admin (831 053 1309)
      const adminMessage = `🚨 *NEW TALENT BOOKING RECEIVED* 🎬\n\n• *Talent*: ${talentFullName}\n• *Client*: ${requesterName}\n• *Phone*: ${requesterPhone}\n• *Email*: ${requesterEmail}\n• *Duration*: ${numDays} Day(s)\n• *Total Amount*: ${formattedFee}\n• *Project*: ${projectType}\n• *City*: ${city || 'N/A'}\n• *Date*: ${dateNeeded || 'Immediate'}\n• *Notes*: ${briefDescription || 'Direct day-wise booking'}\n\n👉 Login to Admin Studio to manage this booking.`;

      // Dispatch async without blocking the response
      if (clientPhone) {
        sendWhatsApp(clientPhone, clientMessage);
      }
      sendWhatsApp(adminPhone, adminMessage);

      // Also message talent if phone available
      if (profile.user.phone) {
        const talentMsg = `🎬 *NEW BOOKING INQUIRY*\nHi ${profile.user.firstName || 'Talent'}, you have a new ${numDays}-day booking inquiry from ${requesterName} for a ${projectType} project. MP Productions team will contact you shortly with full schedule details.`;
        sendWhatsApp(profile.user.phone, talentMsg);
      }
    } catch (waErr) {
      console.error('[HireRoute] WhatsApp dispatch warning:', waErr);
    }

    // 5. Also notify backend in background if running
    backendFetch(`/talent/${encodeURIComponent(profile.id)}/hire`, {
      method: 'POST',
      body: JSON.stringify({
        requesterName,
        requesterEmail,
        requesterPhone,
        projectType,
        city,
        dateNeeded,
        budgetRange: budgetRangeStr,
        briefDescription,
      }),
    }).catch(() => null);

    return NextResponse.json({
      success: true,
      message: 'Booking request submitted successfully!',
      data: hireRequest,
      bookingSummary: {
        id: hireRequest.id,
        trackingSlug: hireRequest.trackingSlug,
        talentName: talentFullName,
        requesterName,
        requesterPhone,
        requesterEmail,
        days: numDays,
        dailyRate: Number(dailyRate) || 4999,
        totalAmount: calculatedFee,
        formattedFee,
        dateNeeded,
        city,
        adminPhone: '+91 831 053 1309',
      },
    });
  } catch (error: any) {
    console.error('[HireRoute Error]:', error);
    return NextResponse.json(
      {
        success: false,
        message: error.message || 'Failed to submit booking request. Please try again.',
      },
      { status: 500 }
    );
  }
}
