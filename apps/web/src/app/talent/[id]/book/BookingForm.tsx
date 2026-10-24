'use client';

import { useState, useEffect } from 'react';
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
  Phone, 
  Mail, 
  User, 
  MapPin, 
  Briefcase,
  CreditCard,
  Lock
} from 'lucide-react';

interface BookingFormProps {
  talentProfileId: string;
  talentName?: string;
  talentAvatar?: string;
  categoryName?: string;
  dailyRate?: number;
}

// Dynamically load Razorpay checkout script
function loadRazorpayScript(): Promise<boolean> {
  return new Promise((resolve) => {
    if (typeof window === 'undefined') return resolve(false);
    if ((window as any).Razorpay) return resolve(true);

    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
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
  const [overrideRate, setOverrideRate] = useState<number | null>(null);

  // Pre-load Razorpay checkout script & check URL / localStorage rate
  useEffect(() => {
    loadRazorpayScript();

    if (typeof window !== 'undefined') {
      try {
        const urlParams = new URLSearchParams(window.location.search);
        const urlRate = urlParams.get('rate');
        if (urlRate) {
          const parsedRate = parseInt(urlRate, 10);
          if (!isNaN(parsedRate) && parsedRate > 0) {
            setOverrideRate(parsedRate);
            return;
          }
        }

        const keys = [
          `talent_profile_override_${talentProfileId}`,
          'talent_profile_override_draft',
          'talent_profile_override_me',
          'talent_profile_draft',
        ];
        for (const k of keys) {
          const raw = localStorage.getItem(k);
          if (raw) {
            const parsed = JSON.parse(raw);
            if (parsed.pricingAmount !== undefined && parsed.pricingAmount !== null && parsed.pricingAmount !== '') {
              const num = parseInt(String(parsed.pricingAmount).replace(/\D/g, ''), 10);
              if (!isNaN(num) && num > 0) {
                setOverrideRate(num);
                break;
              }
            } else if (parsed.pricing?.perDay) {
              const pd = Number(parsed.pricing.perDay);
              const p = pd >= 100 && pd % 100 === 0 ? pd / 100 : pd;
              if (p > 0) {
                setOverrideRate(p);
                break;
              }
            }
          }
        }
      } catch {}
    }
  }, [talentProfileId]);

  // Day-wise price calculation
  const effectiveDailyRate = overrideRate !== null ? overrideRate : (Number(dailyRate) || 4999);
  const totalAmount = days * effectiveDailyRate;

  const handlePaymentAndBook = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!name.trim() || !phone.trim() || !email.trim()) {
      setError('Please provide your Full Name, Phone Number, and Email.');
      setLoading(false);
      return;
    }

    try {
      // 1. Ensure Razorpay SDK is loaded
      const isLoaded = await loadRazorpayScript();
      if (!isLoaded || !(window as any).Razorpay) {
        throw new Error('Razorpay payment gateway failed to load. Please check your internet connection.');
      }

      // 2. Create Razorpay order on server for exact day-wise amount
      const orderRes = await fetch('/api/payment/razorpay/order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: totalAmount,
          currency: 'INR',
          receipt: `bk_${Date.now()}`,
          notes: {
            talentName,
            clientName: name,
            clientPhone: phone,
            days,
            shootDate: dateNeeded,
          },
        }),
      });

      const orderData = await orderRes.json();
      if (!orderRes.ok || !orderData.success) {
        throw new Error(orderData.message || 'Failed to initialize Razorpay payment order');
      }

      // 3. Launch Razorpay Checkout Modal
      const options = {
        key: orderData.key || 'rzp_live_Sk4qWthxF0XqKy',
        amount: orderData.amount,
        currency: orderData.currency || 'INR',
        name: 'MP Production Atelier',
        description: `Booking for ${talentName} (${days} Days)`,
        image: '/assets/mp-logo.png',
        order_id: orderData.orderId,
        prefill: {
          name: name.trim(),
          email: email.trim(),
          contact: phone.trim(),
        },
        theme: {
          color: '#E11D48',
        },
        handler: async function (response: any) {
          // PAYMENT WAS SUCCESSFUL ON RAZORPAY!
          // Now verify signature on server and confirm booking + dispatch WhatsApp
          try {
            const hireRes = await fetch(`/api/talent/${encodeURIComponent(talentProfileId)}/hire`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                requesterName: name.trim(),
                requesterPhone: phone.trim(),
                requesterEmail: email.trim(),
                days,
                dailyRate: effectiveDailyRate,
                totalAmount,
                dateNeeded,
                projectType,
                city: city.trim() || undefined,
                briefDescription: briefDescription.trim() || undefined,
                razorpayOrderId: response.razorpay_order_id,
                razorpayPaymentId: response.razorpay_payment_id,
                razorpaySignature: response.razorpay_signature,
              }),
            });

            const hireData = await hireRes.json();
            if (!hireRes.ok || !hireData.success) {
              throw new Error(hireData.message || 'Payment verification failed on server');
            }

            setBookingSummary(hireData.bookingSummary || {
              talentName,
              requesterName: name,
              requesterPhone: phone,
              requesterEmail: email,
              days,
              dailyRate: effectiveDailyRate,
              totalAmount,
              dateNeeded,
              city,
              paymentId: response.razorpay_payment_id,
              orderId: response.razorpay_order_id,
            });

            setSuccess(true);
          } catch (serverErr: any) {
            console.error('[Verification Error]:', serverErr);
            setError(serverErr.message || 'Payment verification failed. Please contact support.');
          } finally {
            setLoading(false);
          }
        },
        modal: {
          ondismiss: function () {
            setLoading(false);
            setError('Payment was not completed. Booking was NOT placed and no confirmation messages were sent. Please complete payment to confirm your booking.');
          },
        },
      };

      const rzpInstance = new (window as any).Razorpay(options);

      rzpInstance.on('payment.failed', function (failRes: any) {
        setLoading(false);
        setError(`Payment failed: ${failRes.error?.description || 'Transaction unsuccessful'}. No booking was placed and no messages were sent.`);
      });

      rzpInstance.open();
    } catch (err: any) {
      console.error('[Payment Init Error]:', err);
      setError(err.message || 'Unable to open payment modal. Please try again.');
      setLoading(false);
    }
  };

  // WhatsApp chat text for admin
  const whatsappAdminLink = `https://wa.me/918310531309?text=${encodeURIComponent(
    `Hi MP Production Atelier,\nI have completed the advance payment for *${talentName}* via Razorpay!\n\n📋 *Booking & Payment Details*:\n• Payment ID: ${bookingSummary?.paymentId || 'PAID'}\n• Client Name: ${name}\n• Phone: ${phone}\n• Email: ${email}\n• Duration: ${days} Day(s)\n• Dates: ${dateNeeded}\n• Total Amount Paid: ₹${totalAmount.toLocaleString('en-IN')}\n• Project: ${projectType}\n• City: ${city || 'N/A'}\n\nPlease share the shoot call-sheet and coordination schedule.`
  )}`;

  if (success) {
    return (
      <div className="py-8 text-center space-y-8 animate-in fade-in duration-500">
        <div className="w-20 h-20 bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 rounded-full flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/10">
          <CheckCircle2 className="w-10 h-10" />
        </div>

        <div>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 mb-3">
            <Sparkles className="w-3.5 h-3.5" /> Payment Verified &amp; Booking Confirmed
          </span>
          <h2 className="text-3xl md:text-4xl font-serif text-foreground font-medium mb-3">
            Payment Successful for {talentName}!
          </h2>
          <p className="text-muted-foreground font-light max-w-lg mx-auto text-sm md:text-base">
            Your advance payment has been verified via Razorpay. WhatsApp confirmations have been sent to you and the MP Production Atelier team.
          </p>
        </div>

        {/* Booking Summary Box */}
        <div className="bg-[var(--color-surface-hover)] border border-[var(--color-border)] rounded-2xl p-6 text-left max-w-xl mx-auto shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-[var(--color-border)] pb-3">
            <span className="text-xs font-semibold tracking-wider uppercase text-muted-foreground">Payment &amp; Booking Receipt</span>
            <span className="text-xs bg-emerald-500/10 text-emerald-600 px-2.5 py-1 rounded-md border border-emerald-500/20 font-mono font-semibold">
              PAID IN FULL
            </span>
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider">Razorpay Payment ID</p>
              <p className="font-mono text-xs text-foreground font-semibold mt-0.5 break-all">
                {bookingSummary?.paymentId || 'Verified'}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider">Amount Paid</p>
              <p className="font-bold text-emerald-600 text-base mt-0.5">₹{totalAmount.toLocaleString('en-IN')}</p>
            </div>
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
              <p className="text-xs text-muted-foreground uppercase tracking-wider">Client Contact</p>
              <p className="font-medium text-foreground mt-0.5">{phone}</p>
            </div>
          </div>

          {/* Instant Dispatch Badges */}
          <div className="pt-3 border-t border-[var(--color-border)] space-y-2">
            <div className="flex items-center gap-2 text-xs text-emerald-700 bg-emerald-50/50 dark:bg-emerald-950/20 px-3 py-2 rounded-lg border border-emerald-500/20">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
              <span>WhatsApp payment confirmation sent to your number (<strong>{phone}</strong>)</span>
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
    <form onSubmit={handlePaymentAndBook} className="space-y-8">
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
            <p className="font-semibold">Notice</p>
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
            <select
              value={days}
              onChange={(e) => setDays(Number(e.target.value))}
              className="w-full bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl px-4 py-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] transition-all cursor-pointer font-medium"
            >
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 14, 21, 30].map((num) => (
                <option key={num} value={num}>
                  {num} {num === 1 ? 'Day (1 Day Booking)' : `Days (${num} Days Booking)`}
                </option>
              ))}
            </select>
          </div>
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

      {/* Cart-Style Dynamic Price Summary */}
      <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4 space-y-2.5 shadow-xs text-xs">
        <div className="flex items-center justify-between text-muted-foreground">
          <span>Daily Booking Rate</span>
          <span className="font-semibold text-foreground">₹{effectiveDailyRate.toLocaleString('en-IN')} / Day</span>
        </div>
        <div className="flex items-center justify-between text-muted-foreground">
          <span>Selected Duration</span>
          <span className="font-semibold text-foreground">{days} {days === 1 ? 'Day' : 'Days'}</span>
        </div>
        <div className="pt-2 border-t border-[var(--color-border)] flex items-baseline justify-between">
          <div>
            <span className="font-bold text-sm text-foreground block">Total Payable Amount</span>
            <span className="text-[10px] text-muted-foreground">Escrow protected via Razorpay</span>
          </div>
          <span className="font-extrabold text-2xl text-[var(--color-primary)] tracking-tight">
            ₹{totalAmount.toLocaleString('en-IN')}
          </span>
        </div>
      </div>

      {/* Pay & Book Submit Button */}
      <div className="pt-2">
        <button
          type="submit"
          disabled={loading}
          className="w-full py-4 px-8 rounded-xl bg-gradient-to-r from-[var(--color-primary)] to-rose-600 hover:opacity-95 text-white font-semibold text-base tracking-wide flex items-center justify-center gap-3 shadow-xl shadow-[var(--color-primary)]/20 transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 cursor-pointer"
        >
          {loading ? (
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              <span>Initializing Razorpay Secure Checkout...</span>
            </div>
          ) : (
            <>
              <CreditCard className="w-5 h-5" />
              <span>Pay &amp; Confirm Booking • ₹{totalAmount.toLocaleString('en-IN')} ({days} {days === 1 ? 'Day' : 'Days'})</span>
              <ArrowRight className="w-5 h-5" />
            </>
          )}
        </button>

        <p className="text-center text-xs text-muted-foreground mt-3 flex items-center justify-center gap-2">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
          <span>Payment secured by Razorpay. Booking &amp; WhatsApp messages will only be dispatched after successful payment.</span>
        </p>
      </div>
    </form>
  );
}
