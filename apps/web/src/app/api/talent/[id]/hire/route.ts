import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { backendFetch } from '@/lib/cms/server/backend';
import crypto from 'crypto';

export async function POST(
  req: NextRequest,
  ctx: { params: Promise<{ id: string }> }
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
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature,
    } = body;

    if (!requesterName || !requesterPhone || !requesterEmail) {
      return NextResponse.json(
        { success: false, message: 'Name, phone number, and email are required for booking.' },
        { status: 400 }
      );
    }

    // ─────────────────────────────────────────────────────────────
    // STRICT PAYMENT VERIFICATION: WITHOUT SUCCESSFUL PAYMENT, NO MESSAGE SENDS
    // ─────────────────────────────────────────────────────────────
    if (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
      return NextResponse.json(
        {
          success: false,
          message:
            'Payment verification required: Booking and WhatsApp messages cannot be dispatched without successful Razorpay payment.',
        },
        { status: 400 }
      );
    }

    const keySecret = process.env.RAZORPAY_KEY_SECRET || 'K5NRM5QgWoUopxJllqu2wHAM';
    const expectedSignature = crypto
      .createHmac('sha256', keySecret)
      .update(`${razorpayOrderId}|${razorpayPaymentId}`)
      .digest('hex');

    if (expectedSignature !== razorpaySignature) {
      console.error('[Razorpay Signature Mismatch]', {
        expected: expectedSignature,
        received: razorpaySignature,
      });
      return NextResponse.json(
        {
          success: false,
          message:
            'Payment verification failed: Invalid Razorpay signature. Advance payment was not authenticated, so messages were not sent.',
        },
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

    // 2. Create HireRequest in Prisma with CONFIRMED status
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
        briefDescription: `[PAID BOOKING: ${numDays} Day(s) @ ₹${Number(dailyRate) || 4999}/day | Total: ${formattedFee}]\nRazorpay Payment ID: ${razorpayPaymentId}\nRazorpay Order ID: ${razorpayOrderId}\n${briefDescription || 'Direct website booking with advance payment.'}`,
        status: 'CONFIRMED',
        adminNote: `Verified Razorpay Payment: ${razorpayPaymentId} | Order: ${razorpayOrderId}`,
      },
    });

    // 3. Create SalesLead in Prisma (Stage: WON)
    try {
      await prisma.salesLead.create({
        data: {
          clientName: String(requesterName).trim(),
          email: String(requesterEmail).trim().toLowerCase(),
          phone: String(requesterPhone).trim(),
          source: 'WEBSITE',
          stage: 'WON',
          estimatedValue: calculatedFee * 100, // in paise
          notes: `[Confirmed Paid Booking: ${talentFullName}]\nPayment ID: ${razorpayPaymentId}\nDays: ${numDays} Day(s)\nAmount: ${formattedFee}\nCity: ${city || 'N/A'}\nDate: ${dateNeeded || 'Immediate'}\nBrief: ${briefDescription || 'N/A'}`,
        },
      });
    } catch (leadErr) {
      console.error('[HireRoute] Error creating sales lead:', leadErr);
    }

    // 4. Send WhatsApp Notification via InboxWA (ONLY SENT AFTER VERIFIED PAYMENT!)
    const adminPhone = '8310531309'; // Admin Contact Number specified by user
    const clientPhone = String(requesterPhone).replace(/[^0-9]/g, '');

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
      const clientMessage = `🎬 *MP PRODUCTION — PAYMENT & BOOKING CONFIRMED* 🎬\n\nDear *${requesterName}*,\nYour advance payment of *${formattedFee}* has been successfully received via Razorpay (Txn ID: ${razorpayPaymentId})!\n\n📋 *Confirmed Booking Summary*:\n• *Talent*: ${talentFullName}\n• *Duration*: ${numDays} Day(s)\n• *Total Amount Paid*: ${formattedFee}\n• *Project*: ${projectType}\n• *City*: ${city || 'Studio / Location'}\n• *Booking Ref*: ${hireRequest.trackingSlug || hireRequest.id.slice(-6).toUpperCase()}\n\nOur production supervisor will share the call-sheet and schedule within 24 hours.\n\n📞 *Admin Hotline*: +91 831 053 1309\n🌐 *Website*: https://mpproduction.com\n\nThank you for choosing MP Production Atelier!`;

      // Message to Admin (831 053 1309)
      const adminMessage = `🚨 *NEW PAID TALENT BOOKING RECEIVED* 🎬\n\n💰 *Payment Status*: PAID IN FULL (${formattedFee})\n💳 *Razorpay ID*: ${razorpayPaymentId}\n\n• *Talent*: ${talentFullName}\n• *Client*: ${requesterName}\n• *Phone*: ${requesterPhone}\n• *Email*: ${requesterEmail}\n• *Duration*: ${numDays} Day(s)\n• *Total Amount*: ${formattedFee}\n• *Project*: ${projectType}\n• *City*: ${city || 'N/A'}\n• *Date*: ${dateNeeded || 'Immediate'}\n• *Notes*: ${briefDescription || 'Direct day-wise paid booking'}\n\n👉 Login to Admin Studio to view call-sheet & schedule.`;

      // Dispatch async
      if (clientPhone) {
        sendWhatsApp(clientPhone, clientMessage);
      }
      sendWhatsApp(adminPhone, adminMessage);

      // Message to talent
      if (profile.user.phone) {
        const talentMsg = `🎬 *CONFIRMED PAID BOOKING*\nHi ${profile.user.firstName || 'Talent'}, your booking for ${numDays} day(s) from ${requesterName} is confirmed with successful advance payment (${formattedFee}). MP Productions team will share call-sheet shortly.`;
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
        razorpayPaymentId,
      }),
    }).catch(() => null);

    return NextResponse.json({
      success: true,
      message: 'Payment verified and booking confirmed successfully!',
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
        paymentId: razorpayPaymentId,
        orderId: razorpayOrderId,
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
