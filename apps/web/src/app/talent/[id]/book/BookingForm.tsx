'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { 
  Calendar, 
  Clock, 
  CheckCircle2, 
  ShieldCheck, 
  Sparkles, 
  MessageCircle, 
  ArrowRight, 
  Minus, 
  Plus, 
  Phone, 
  Mail, 
  User, 
  MapPin, 
  Briefcase 
} from 'lucide-react';

interface BookingFormProps {
  talentProfileId: string;
  talentName?: string;
  talentAvatar?: string;
  categoryName?: string;
  dailyRate?: number;
}

export function BookingForm({
  talentProfileId,
  talentName = 'Talent Artist',
  talentAvatar,
  categoryName = 'Production Artist',
  dailyRate = 4999,
}: BookingFormProps) {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [bookingSummary, setBookingSummary] = useState<any>(null);

  // Form states
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [days, setDays] = useState(1);
  const [dateNeeded, setDateNeeded] = useState(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  });
  const [city, setCity] = useState('');
  const [projectType, setProjectType] = useState('Fashion Shoot & Campaign');
  const [briefDescription, setBriefDescription] = useState('');

  // Day-wise price calculation
  const effectiveDailyRate = Number(dailyRate) || 4999;
  const totalAmount = days * effectiveDailyRate;

  const handleDaysChange = (newDays: number) => {
    if (newDays >= 1 && newDays <= 30) {
      setDays(newDays);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const payload = {
      requesterName: name.trim(),
      requesterPhone: phone.trim(),
      requesterEmail: email.trim(),
      days,
      dailyRate: effectiveDailyRate,
      totalAmount,
      dateNeeded: dateNeeded || undefined,
      projectType: projectType || 'Commercial Shoot',
      city: city.trim() || undefined,
      briefDescription: briefDescription.trim() || undefined,
    };

    try {
      // 1. Submit to local Next.js BFF endpoint first
      let res = await fetch(`/api/talent/${encodeURIComponent(talentProfileId)}/hire`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      let data = await res.json().catch(() => ({}));

      // 2. If local route failed, fallback to external backend
      if (!res.ok || !data.success) {
        const { fetchAPI } = await import('@/lib/api-client');
        const fallbackRes = await fetchAPI(`/talent/${talentProfileId}/hire`, {
          method: 'POST',
          body: JSON.stringify({
            requesterName: payload.requesterName,
            requesterPhone: payload.requesterPhone,
            requesterEmail: payload.requesterEmail,
            projectType: payload.projectType,
            dateNeeded: payload.dateNeeded,
            city: payload.city,
            budgetRange: `₹${totalAmount.toLocaleString('en-IN')} (${days} Days @ ₹${effectiveDailyRate}/day)`,
            briefDescription: `[${days} Days Direct Booking] ${briefDescription}`,
          }),
        });

        if (fallbackRes?.data || fallbackRes?.success) {
          data = {
            success: true,
            bookingSummary: {
              talentName,
              requesterName: name,
              requesterPhone: phone,
              requesterEmail: email,
              days,
              dailyRate: effectiveDailyRate,
              totalAmount,
              dateNeeded,
              city,
            },
          };
        } else {
          throw new Error(data.message || fallbackRes?.message || 'Failed to submit booking inquiry');
        }
      }

      setBookingSummary(data.bookingSummary || {
        talentName,
        requesterName: name,
        requesterPhone: phone,
        requesterEmail: email,
        days,
        dailyRate: effectiveDailyRate,
        totalAmount,
        dateNeeded,
        city,
      });

      setSuccess(true);
    } catch (err: any) {
      console.error('[Booking Error]:', err);
      setError(err.message || 'Unable to complete booking. Please try again or contact WhatsApp +91 831 053 1309 directly.');
    } finally {
      setLoading(false);
    }
  };

  // WhatsApp chat text for admin
  const whatsappAdminLink = `https://wa.me/918310531309?text=${encodeURIComponent(
    `Hi MP Production Atelier,\nI just submitted a direct booking for *${talentName}*!\n\n📋 *Details*:\n• Client Name: ${name}\n• Phone: ${phone}\n• Email: ${email}\n• Duration: ${days} Day(s)\n• Dates: ${dateNeeded}\n• Total Estimated Fee: ₹${totalAmount.toLocaleString('en-IN')}\n• Project: ${projectType}\n• City: ${city || 'N/A'}\n\nPlease confirm booking schedule.`
  )}`;

  if (success) {
    return (
      <div className="py-8 text-center space-y-8 animate-in fade-in duration-500">
        <div className="w-20 h-20 bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 rounded-full flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/10">
          <CheckCircle2 className="w-10 h-10" />
        </div>

        <div>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 mb-3">
            <Sparkles className="w-3.5 h-3.5" /> Booking Received &amp; Verified
          </span>
          <h2 className="text-3xl md:text-4xl font-serif text-foreground font-medium mb-3">
            Booking Confirmed for {talentName}!
          </h2>
          <p className="text-muted-foreground font-light max-w-lg mx-auto text-sm md:text-base">
            Your booking details have been registered into the MP Productions system. WhatsApp confirmations have been dispatched to your phone and the production team.
          </p>
        </div>

        {/* Booking Summary Box */}
        <div className="bg-[var(--color-surface-hover)] border border-[var(--color-border)] rounded-2xl p-6 text-left max-w-xl mx-auto shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-[var(--color-border)] pb-3">
            <span className="text-xs font-semibold tracking-wider uppercase text-muted-foreground">Booking Summary</span>
            <span className="text-xs bg-[var(--color-surface)] px-2.5 py-1 rounded-md border border-[var(--color-border)] font-mono text-[var(--color-primary)]">
              Status: Verified
            </span>
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider">Talent Artist</p>
              <p className="font-semibold text-foreground mt-0.5">{talentName}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider">Duration</p>
              <p className="font-semibold text-foreground mt-0.5">{days} Day{days > 1 ? 's' : ''}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider">Start Date</p>
              <p className="font-semibold text-foreground mt-0.5">{dateNeeded || 'Immediate'}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider">Total Day-wise Fee</p>
              <p className="font-bold text-emerald-600 text-base mt-0.5">₹{totalAmount.toLocaleString('en-IN')}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider">Client Name</p>
              <p className="font-medium text-foreground mt-0.5">{name}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider">Client Contact</p>
              <p className="font-medium text-foreground mt-0.5">{phone}</p>
            </div>
          </div>

          {/* Instant Dispatch Badges */}
          <div className="pt-3 border-t border-[var(--color-border)] space-y-2">
            <div className="flex items-center gap-2 text-xs text-emerald-700 bg-emerald-50/50 dark:bg-emerald-950/20 px-3 py-2 rounded-lg border border-emerald-500/20">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
              <span>WhatsApp message dispatched to your number (<strong>{phone}</strong>)</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-sky-700 bg-sky-50/50 dark:bg-sky-950/20 px-3 py-2 rounded-lg border border-sky-500/20">
              <ShieldCheck className="w-4 h-4 text-sky-500 shrink-0" />
              <span>Admin studio notified at <strong>+91 831 053 1309</strong></span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 max-w-md mx-auto pt-2">
          <a
            href={whatsappAdminLink}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-sm rounded-xl shadow-lg shadow-emerald-600/20 transition-all hover:scale-[1.02]"
          >
            <MessageCircle className="w-4 h-4" />
            Chat with Admin on WhatsApp (+91 831 053 1309)
          </a>

          <Link
            href={`/talent/${talentProfileId}`}
            className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3.5 border border-[var(--color-border)] hover:bg-[var(--color-surface-hover)] text-foreground font-medium text-sm rounded-xl transition-colors"
          >
            Back to Profile
          </Link>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Talent Info Mini Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-xl bg-[var(--color-surface-hover)] border border-[var(--color-border)]">
        <div className="flex items-center gap-3.5">
          {talentAvatar ? (
            <div className="w-12 h-12 rounded-full overflow-hidden border border-[var(--color-border)] bg-muted shrink-0 relative">
              <Image src={talentAvatar} alt={talentName} fill className="object-cover" />
            </div>
          ) : (
            <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-[var(--color-primary)] to-amber-500 text-white flex items-center justify-center font-bold text-lg shrink-0">
              {talentName.charAt(0)}
            </div>
          )}
          <div>
            <h2 className="text-base font-semibold text-foreground tracking-tight">{talentName}</h2>
            <p className="text-xs text-muted-foreground">{categoryName} • Verified Roster Artist</p>
          </div>
        </div>

        <div className="text-right">
          <span className="text-[10px] uppercase tracking-wider text-muted-foreground block font-medium">Daily Roster Rate</span>
          <span className="text-lg font-bold text-foreground">
            ₹{effectiveDailyRate.toLocaleString('en-IN')} <span className="text-xs font-normal text-muted-foreground">/ day</span>
          </span>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/25 rounded-xl text-red-600 text-sm flex items-start gap-3">
          <div className="w-2 h-2 rounded-full bg-red-500 mt-1.5 shrink-0" />
          <div className="flex-1">
            <p className="font-semibold">Booking Notice</p>
            <p className="mt-0.5">{error}</p>
          </div>
        </div>
      )}

      {/* 1. Client Contact Details */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 border-b border-[var(--color-border)] pb-2.5">
          <User className="w-4 h-4 text-[var(--color-primary)]" />
          <h3 className="text-xs font-bold tracking-widest uppercase text-foreground">Your Contact Details</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-muted-foreground" /> Full Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="requesterName"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Kanika Aggarwal"
              required
              className="w-full bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl px-4 py-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] transition-all"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 text-muted-foreground" /> WhatsApp Phone Number <span className="text-red-500">*</span>
            </label>
            <input
              type="tel"
              name="requesterPhone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="e.g. 7895726762"
              required
              className="w-full bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl px-4 py-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] transition-all"
            />
            <p className="text-[11px] text-muted-foreground">Booking confirmation &amp; schedule details will be sent on WhatsApp.</p>
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
            <Mail className="w-3.5 h-3.5 text-muted-foreground" /> Email Address <span className="text-red-500">*</span>
          </label>
          <input
            type="email"
            name="requesterEmail"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="e.g. aggarwalkanika676@gmail.com"
            required
            className="w-full bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl px-4 py-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] transition-all"
          />
        </div>
      </div>

      {/* 2. Duration & Day-wise Booking Calculator */}
      <div className="space-y-4 pt-2">
        <div className="flex items-center gap-2 border-b border-[var(--color-border)] pb-2.5">
          <Calendar className="w-4 h-4 text-[var(--color-primary)]" />
          <h3 className="text-xs font-bold tracking-widest uppercase text-foreground">Booking Duration &amp; Date</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-muted-foreground" /> Shoot / Project Start Date <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              name="dateNeeded"
              value={dateNeeded}
              onChange={(e) => setDateNeeded(e.target.value)}
              required
              className="w-full bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl px-4 py-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] transition-all"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-muted-foreground" /> Number of Days Required <span className="text-red-500">*</span>
            </label>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => handleDaysChange(days - 1)}
                disabled={days <= 1}
                className="w-11 h-11 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] hover:bg-[var(--color-surface-hover)] disabled:opacity-40 flex items-center justify-center text-foreground transition-colors"
                title="Decrease days"
              >
                <Minus className="w-4 h-4" />
              </button>

              <div className="flex-1 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl py-2.5 px-4 text-center">
                <span className="text-lg font-bold text-foreground">{days}</span>
                <span className="text-xs text-muted-foreground ml-1.5">{days === 1 ? 'Day' : 'Days'}</span>
              </div>

              <button
                type="button"
                onClick={() => handleDaysChange(days + 1)}
                disabled={days >= 30}
                className="w-11 h-11 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] hover:bg-[var(--color-surface-hover)] disabled:opacity-40 flex items-center justify-center text-foreground transition-colors"
                title="Increase days"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Quick Day Pill Selector */}
        <div className="flex flex-wrap items-center gap-2 pt-1">
          <span className="text-xs text-muted-foreground mr-1">Quick Select:</span>
          {[1, 2, 3, 5, 7, 10].map((count) => (
            <button
              key={count}
              type="button"
              onClick={() => handleDaysChange(count)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                days === count
                  ? 'bg-[var(--color-primary)] text-white border-[var(--color-primary)] shadow-sm'
                  : 'bg-[var(--color-surface)] text-foreground border-[var(--color-border)] hover:bg-[var(--color-surface-hover)]'
              }`}
            >
              {count} {count === 1 ? 'Day' : 'Days'}
            </button>
          ))}
        </div>

        {/* DYNAMIC PRICE CALCULATION SUMMARY CARD */}
        <div className="rounded-2xl border-2 border-emerald-500/30 bg-emerald-50/40 dark:bg-emerald-950/20 p-5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-400 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" /> Day-Wise Calculation Breakdown
            </span>
            <span className="text-xs font-medium text-emerald-700 dark:text-emerald-300">
              ₹{effectiveDailyRate.toLocaleString('en-IN')} × {days} {days === 1 ? 'Day' : 'Days'}
            </span>
          </div>

          <div className="flex items-baseline justify-between pt-1 border-t border-emerald-500/20">
            <div>
              <p className="text-xs text-muted-foreground">Total Estimated Talent Fee</p>
              <p className="text-2xl md:text-3xl font-extrabold text-emerald-600 dark:text-emerald-400 tracking-tight">
                ₹{totalAmount.toLocaleString('en-IN')}
              </p>
            </div>
            <div className="text-right">
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20">
                <CheckCircle2 className="w-3 h-3" /> Direct Booking Rate
              </span>
            </div>
          </div>

          <p className="text-[11px] text-muted-foreground">
            Includes full day on-set availability, coordination with MP Productions studio, and immediate booking lock.
          </p>
        </div>
      </div>

      {/* 3. Optional Shoot & Project Details */}
      <div className="space-y-4 pt-2">
        <div className="flex items-center gap-2 border-b border-[var(--color-border)] pb-2.5">
          <Briefcase className="w-4 h-4 text-[var(--color-primary)]" />
          <h3 className="text-xs font-bold tracking-widest uppercase text-foreground">Project Details (Optional)</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
              <Briefcase className="w-3.5 h-3.5 text-muted-foreground" /> Project Type
            </label>
            <input
              type="text"
              name="projectType"
              value={projectType}
              onChange={(e) => setProjectType(e.target.value)}
              placeholder="e.g. Fashion Campaign, Music Video, Commercial"
              className="w-full bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl px-4 py-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] transition-all"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-muted-foreground" /> Shoot Location / City
            </label>
            <input
              type="text"
              name="city"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="e.g. Mumbai, Haridwar, Delhi or Studio"
              className="w-full bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl px-4 py-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] transition-all"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground">
            Special Requests / Brief Notes (Optional)
          </label>
          <textarea
            name="briefDescription"
            rows={3}
            value={briefDescription}
            onChange={(e) => setBriefDescription(e.target.value)}
            placeholder="Tell us any specific shoot schedule requirements, styling notes, or usage rights..."
            className="w-full bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-3.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] transition-all resize-none"
          />
        </div>
      </div>

      {/* Submit Button */}
      <div className="pt-4">
        <button
          type="submit"
          disabled={loading}
          className="w-full py-4 px-8 rounded-xl bg-[var(--color-primary)] hover:opacity-95 text-white font-semibold text-base tracking-wide flex items-center justify-center gap-3 shadow-xl shadow-[var(--color-primary)]/20 transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 cursor-pointer"
        >
          {loading ? (
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              <span>Confirming Booking &amp; Sending WhatsApp...</span>
            </div>
          ) : (
            <>
              <span>Book Directly • ₹{totalAmount.toLocaleString('en-IN')} for {days} {days === 1 ? 'Day' : 'Days'}</span>
              <ArrowRight className="w-5 h-5" />
            </>
          )}
        </button>

        <p className="text-center text-xs text-muted-foreground mt-3 flex items-center justify-center gap-2">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
          <span>Direct booking confirmation will be sent on WhatsApp. Admin hotline: <strong>+91 831 053 1309</strong></span>
        </p>
      </div>
    </form>
  );
}
