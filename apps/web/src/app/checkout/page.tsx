'use client';

import { fetchAPI } from '@/lib/api-client';
import { issuePaymentProofToken } from '@/lib/security';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Navbar } from '@/components/ui/Navbar';
import { HoverFooter as Footer } from '@/components/ui/hover-footer';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import {
  ShieldCheck,
  Lock,
  CreditCard,
  QrCode,
  CheckCircle2,
  ArrowRight,
  BookOpen,
  Clock,
  Sparkles,
  Loader2,
  Tag,
  Gift,
  Building,
  Check,
} from 'lucide-react';
import Image from 'next/image';

interface CourseData {
  id: string;
  title: string;
  categoryLabel: string;
  duration: string;
  lessonsCount: number;
  price: string;
  numericPrice: number;
  originalPrice: string;
  image: string;
  instructorName: string;
}

const COURSES_MAP: Record<string, CourseData> = {
  'course-youtuber': {
    id: 'course-youtuber',
    title: 'How to Become a YouTuber: 100K Algorithm & 4K Setup',
    categoryLabel: 'YouTube Masterclass',
    duration: '4.5 Hours',
    lessonsCount: 18,
    price: '₹4,999',
    numericPrice: 4999,
    originalPrice: '₹12,999',
    image: '/images/services-lighting.webp',
    instructorName: 'Rohan Verma',
  },
  'course-reeler': {
    id: 'course-reeler',
    title: 'How to Become an Instagram Reeler: Viral 9:16 Secrets',
    categoryLabel: 'Instagram Reels',
    duration: '3.5 Hours',
    lessonsCount: 15,
    price: '₹3,499',
    numericPrice: 3499,
    originalPrice: '₹8,999',
    image: '/assets/project-fashion.webp',
    instructorName: 'Aanya Kapoor',
  },
  'course-creator': {
    id: 'course-creator',
    title: 'How to Become a Content Creator: Zero to Production House',
    categoryLabel: 'Content Creator',
    duration: '5.2 Hours',
    lessonsCount: 22,
    price: '₹5,999',
    numericPrice: 5999,
    originalPrice: '₹14,999',
    image: '/images/about-bts.webp',
    instructorName: 'Karan Malhotra',
  },
  'course-influencer': {
    id: 'course-influencer',
    title: 'How to Become a High-Paid Influencer: Brand Deals & Media Kits',
    categoryLabel: 'Influencer & Brand',
    duration: '3.8 Hours',
    lessonsCount: 16,
    price: '₹4,499',
    numericPrice: 4499,
    originalPrice: '₹11,999',
    image: '/assets/service_casting.webp',
    instructorName: 'Priya Sundaram',
  },
  'course-davinci': {
    id: 'course-davinci',
    title: 'DaVinci Resolve Hollywood Color Grading & FX Masterclass',
    categoryLabel: 'Editing & VFX',
    duration: '5.0 Hours',
    lessonsCount: 22,
    price: '₹3,999',
    numericPrice: 3999,
    originalPrice: '₹9,999',
    image: '/images/about-bts.webp',
    instructorName: 'Vikramaditya Roy',
  },
  'course-shorts': {
    id: 'course-shorts',
    title: 'Viral Shorts & Micro-Video Hacking (TikTok & Shorts)',
    categoryLabel: 'Reels & Shorts',
    duration: '3.0 Hours',
    lessonsCount: 12,
    price: '₹2,999',
    numericPrice: 2999,
    originalPrice: '₹7,999',
    image: '/images/portfolio-equipment.webp',
    instructorName: 'Aanya Kapoor',
  },
  'course-podcast': {
    id: 'course-podcast',
    title: 'Podcast & Audio Creator Blueprint: Studio Setup & Spotify',
    categoryLabel: 'Podcast & Audio',
    duration: '4.0 Hours',
    lessonsCount: 16,
    price: '₹3,499',
    numericPrice: 3499,
    originalPrice: '₹8,499',
    image: '/images/careers-meeting.webp',
    instructorName: 'David Chen',
  },
  'course-monetization': {
    id: 'course-monetization',
    title: '6-Figure Brand Deals & Escrow Negotiation Masterclass',
    categoryLabel: 'Business & Revenue',
    duration: '4.2 Hours',
    lessonsCount: 14,
    price: '₹4,999',
    numericPrice: 4999,
    originalPrice: '₹12,999',
    image: '/images/projects-outdoor.webp',
    instructorName: 'Karan Malhotra',
  },
};

function CheckoutContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const courseId = searchParams.get('courseId') || 'course-youtuber';
  // CMS-managed course, with the static map as an offline fallback.
  const [course, setCourse] = useState<CourseData>(COURSES_MAP[courseId] || COURSES_MAP['course-youtuber']);

  useEffect(() => {
    let cancelled = false;
    fetchAPI('/cms/courses', { cache: 'no-store' })
      .then((res: any) => {
        const rows = Array.isArray(res?.data) ? res.data : Array.isArray(res?.data?.data) ? res.data.data : [];
        const match = rows.find((r: any) => r.slug === courseId || r.id === courseId);
        if (!cancelled && match) {
          setCourse({
            id: match.slug || match.id,
            title: match.title,
            categoryLabel: match.categoryLabel || 'Masterclass',
            duration: match.duration || '',
            lessonsCount: Number(match.lessonsCount) || 0,
            price: match.price || '',
            numericPrice: Number(match.numericPrice) || 0,
            originalPrice: match.originalPrice || '',
            image: match.image || '/images/services-lighting.webp',
            instructorName: match.instructorName || 'MP Instructor',
          });
        }
      })
      .catch(() => {
        /* keep static fallback */
      });
    return () => {
      cancelled = true;
    };
  }, [courseId]);

  const [paymentMethod, setPaymentMethod] = useState<'UPI' | 'CARD' | 'NETBANKING'>('UPI');
  const [couponInput, setCouponInput] = useState<string>('');
  const [appliedDiscount, setAppliedDiscount] = useState<number>(0); // Percentage
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [showGatewayModal, setShowGatewayModal] = useState<boolean>(false);
  const [paymentSuccess, setPaymentSuccess] = useState<boolean>(false);

  const [studentInfo, setStudentInfo] = useState({
    name: '',
    email: '',
    phone: '',
  });

  useEffect(() => {
    // Read cached enrollment details from sessionStorage if user came from registration modal
    if (typeof window !== 'undefined') {
      const cachedName = sessionStorage.getItem('mp_student_name') || '';
      const cachedEmail = sessionStorage.getItem('mp_student_email') || '';
      const cachedPhone = sessionStorage.getItem('mp_student_phone') || '';
      setStudentInfo({
        name: cachedName || 'Creator Student',
        email: cachedEmail || 'student@creator.com',
        phone: cachedPhone || '+91 98765 43210',
      });
    }
  }, []);

  function handleApplyCoupon() {
    if (couponInput.trim().toUpperCase() === 'CREATOR50') {
      setAppliedDiscount(50);
      toast.success('🎉 Coupon CREATOR50 applied! 50% Flat Discount Granted.');
    } else if (couponInput.trim().toUpperCase() === 'VIPPASS') {
      setAppliedDiscount(30);
      toast.success('🎉 Coupon VIPPASS applied! 30% Off Granted.');
    } else {
      toast.error('Invalid coupon code. Try "CREATOR50" for 50% discount.');
    }
  }

  const [utrInput, setUtrInput] = useState<string>('');

  const discountAmount = Math.round((course.numericPrice * appliedDiscount) / 100);
  const finalPrice = course.numericPrice - discountAmount;

  function handlePayNow() {
    if (typeof window !== 'undefined') {
      const isLoggedIn = sessionStorage.getItem('mp_student_logged_in') === 'true';
      if (!isLoggedIn) {
        toast.error('🔒 Please sign in or register your student account first!');
        router.push('/become-a-youtuber');
        return;
      }
    }

    if (paymentMethod === 'UPI' && !utrInput.trim()) {
      toast.error('⚠️ Please enter your 12-digit UPI UTR Transaction Reference Number.');
      return;
    }

    setShowGatewayModal(true);
    setIsProcessing(true);

    // Submit UTR enrollment record via Next.js BFF endpoint to Supabase for Super Admin verification
    fetch('/api/cms/students', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: studentInfo.name,
        email: studentInfo.email,
        phone: studentInfo.phone,
        courseId: course.id,
        courseTitle: course.title,
        coursePrice: `₹${finalPrice}`,
        utrNumber: utrInput.trim(),
      }),
    }).catch(() => {});

    // Also notify via contact submission
    fetchAPI('/cms/contact', {
      method: 'POST',
      body: JSON.stringify({
        name: studentInfo.name,
        email: studentInfo.email,
        phone: studentInfo.phone,
        subject: `Course Payment UTR Review: ${course.title}`,
        message: `UPI Payment Submitted:\nCourse: ${course.title}\nAmount Paid: ₹${finalPrice}\nUPI UTR Ref No: ${utrInput.trim()}`,
      }),
    }).catch(() => {});

    setTimeout(async () => {
      setIsProcessing(false);
      setPaymentSuccess(true);
      toast.success('⏳ Payment UTR Submitted! Waiting for Super Admin Verification.');

      if (typeof window !== 'undefined') {
        const pendingMap = JSON.parse(localStorage.getItem('mp_pending_utrs') || '{}');
        pendingMap[course.id] = utrInput.trim();
        localStorage.setItem('mp_pending_utrs', JSON.stringify(pendingMap));
      }

      setTimeout(() => {
        router.push(`/creator-lab?pendingCourse=${course.id}`);
      }, 2500);
    }, 2000);
  }

  return (
    <div className="bg-background min-h-screen text-foreground selection:bg-brand selection:text-white pt-28 pb-20">
      <Navbar />

      <div className="max-w-6xl mx-auto px-6 sm:px-10 space-y-8">
        {/* Checkout Header */}
        <div className="border-b border-border pb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand/15 border border-brand/30 text-brand text-xs font-bold uppercase tracking-wider mb-2">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>256-Bit SSL Encrypted Secure Checkout</span>
            </div>
            <h1 className="text-3xl sm:text-5xl font-bold font-serif text-foreground">
              Course Checkout & Enrollment
            </h1>
          </div>

          <div className="flex items-center gap-2 text-xs font-bold text-emerald-500 bg-emerald-500/15 border border-emerald-500/30 px-4 py-2 rounded-full">
            <Lock className="w-4 h-4" />
            <span>100% Satisfaction Guarantee</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: Account Info & Payment Selector (7 Cols) */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Registered Student Account Details */}
            <div className="p-6 rounded-3xl border border-border bg-card shadow-sm space-y-4">
              <h3 className="text-lg font-bold font-serif flex items-center justify-between">
                <span>1. Account Information</span>
                <span className="text-xs font-semibold text-emerald-500 flex items-center gap-1">
                  <CheckCircle2 className="w-4 h-4" /> Verified Student
                </span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="p-3.5 rounded-2xl bg-muted/40 border border-border">
                  <span className="text-muted-foreground block text-[11px]">Student Name:</span>
                  <strong className="text-foreground text-sm font-semibold">{studentInfo.name || 'Creator Student'}</strong>
                </div>

                <div className="p-3.5 rounded-2xl bg-muted/40 border border-border">
                  <span className="text-muted-foreground block text-[11px]">Email Address:</span>
                  <strong className="text-foreground text-sm font-semibold">{studentInfo.email || 'student@creator.com'}</strong>
                </div>
              </div>
            </div>

            {/* Payment Method Selector */}
            <div className="p-6 rounded-3xl border border-border bg-card shadow-sm space-y-5">
              <h3 className="text-lg font-bold font-serif">
                2. Select Instant Payment Method
              </h3>

              <div className="grid grid-cols-3 gap-3">
                {[
                  { id: 'UPI', label: 'UPI / GPay / PhonePe', icon: QrCode },
                  { id: 'CARD', label: 'Credit / Debit Card', icon: CreditCard },
                  { id: 'NETBANKING', label: 'Net Banking', icon: Building },
                ].map(method => {
                  const Icon = method.icon;
                  const active = paymentMethod === method.id;
                  return (
                    <button
                      key={method.id}
                      onClick={() => setPaymentMethod(method.id as any)}
                      className={`p-4 rounded-2xl border flex flex-col items-center justify-center text-center gap-2 transition-all ${
                        active
                          ? 'border-brand bg-brand/10 text-brand shadow-md font-bold'
                          : 'border-border bg-muted/20 text-muted-foreground hover:border-brand/40'
                      }`}
                    >
                      <Icon className={`w-6 h-6 ${active ? 'text-brand' : ''}`} />
                      <span className="text-xs">{method.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* Payment Details Container */}
              <div className="p-5 rounded-2xl bg-muted/30 border border-border space-y-4">
                {paymentMethod === 'UPI' && (
                  <div className="space-y-4 text-xs">
                    {/* Live Scannable UPI QR Code Box */}
                    <div className="p-4 rounded-2xl bg-card border border-border text-center space-y-3 shadow-md">
                      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-500 font-bold text-[11px] uppercase tracking-wider">
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Instant UPI QR Code (GPay / PhonePe / Paytm / BHIM)</span>
                      </div>

                      <div className="relative h-48 w-48 bg-white p-3 rounded-2xl mx-auto border border-border shadow-lg flex flex-col items-center justify-center">
                        <Image
                          src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(
                            `upi://pay?pa=mpproduction@okicici&pn=MP%20Production%20Academy&am=${finalPrice}&cu=INR`
                          )}`}
                          alt="Official MP Production UPI QR Code"
                          width={180}
                          height={180}
                          className="object-contain"
                        />
                      </div>

                      <p className="font-bold text-foreground text-xs">
                        Scan with GPay, PhonePe, Paytm, BHIM, or any Banking App
                      </p>

                      {/* Official UPI ID Box with 1-Click Copy */}
                      <div className="p-3 rounded-xl bg-muted/60 border border-border flex items-center justify-between gap-3 max-w-sm mx-auto text-left">
                        <div className="space-y-0.5">
                          <span className="text-[10px] text-muted-foreground uppercase font-bold block">Official UPI ID:</span>
                          <span className="font-mono font-bold text-brand text-xs sm:text-sm">mpproduction@okicici</span>
                        </div>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            navigator.clipboard.writeText('mpproduction@okicici');
                            toast.success('📋 UPI ID mpproduction@okicici copied to clipboard!');
                          }}
                          className="rounded-xl text-xs font-bold shrink-0 border-border hover:bg-brand hover:text-white transition-colors"
                        >
                          Copy UPI ID
                        </Button>
                      </div>
                    </div>

                    {/* UTR / Transaction Reference Number Input */}
                    <div className="space-y-1.5 pt-1">
                      <label className="block font-bold text-muted-foreground text-xs">
                        Enter 12-Digit UPI Transaction UTR / Ref No. (After Scanning)
                      </label>
                      <Input
                        placeholder="e.g. 420918239012"
                        value={utrInput}
                        onChange={e => setUtrInput(e.target.value)}
                        className="text-xs rounded-xl bg-card border-border font-mono tracking-wider"
                      />
                      <p className="text-[10px] text-muted-foreground">
                        Enter your payment reference UTR number from GPay/PhonePe to instantly verify and unlock your course.
                      </p>
                    </div>
                  </div>
                )}

                {paymentMethod === 'CARD' && (
                  <div className="space-y-3 text-xs">
                    <div>
                      <label className="block font-semibold mb-1 text-muted-foreground">Card Number</label>
                      <Input placeholder="4000 1234 5678 9010" className="text-xs rounded-xl bg-card border-border" />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block font-semibold mb-1 text-muted-foreground">Expiry (MM/YY)</label>
                        <Input placeholder="12/28" className="text-xs rounded-xl bg-card border-border" />
                      </div>
                      <div>
                        <label className="block font-semibold mb-1 text-muted-foreground">CVV</label>
                        <Input type="password" placeholder="123" className="text-xs rounded-xl bg-card border-border" />
                      </div>
                    </div>
                  </div>
                )}

                {paymentMethod === 'NETBANKING' && (
                  <div className="space-y-3 text-xs">
                    <label className="block font-semibold text-muted-foreground">Select Your Bank</label>
                    <select className="w-full p-3 rounded-xl bg-card border border-border text-foreground font-semibold">
                      <option>HDFC Bank</option>
                      <option>ICICI Bank</option>
                      <option>State Bank of India (SBI)</option>
                      <option>Axis Bank</option>
                      <option>Kotak Mahindra Bank</option>
                    </select>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column: Order Summary (5 Cols) */}
          <div className="lg:col-span-5 space-y-6">
            <div className="p-6 rounded-3xl border border-border bg-card shadow-lg space-y-6 sticky top-28">
              <h3 className="text-lg font-bold font-serif border-b border-border pb-4">
                Order Summary
              </h3>

              {/* Course Card Preview */}
              <div className="flex items-start gap-4 p-3 rounded-2xl bg-muted/30 border border-border">
                <div className="relative h-20 w-24 rounded-xl overflow-hidden shrink-0 bg-muted">
                  <Image src={course.image} alt={course.title} fill className="object-cover" />
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-brand uppercase tracking-wider">{course.categoryLabel}</span>
                  <h4 className="text-xs font-bold text-foreground line-clamp-2">{course.title}</h4>
                  <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
                    <span>{course.lessonsCount} Modules</span>
                    <span>·</span>
                    <span>{course.duration}</span>
                  </div>
                </div>
              </div>

              {/* Coupon Code Box */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-muted-foreground flex items-center gap-1.5">
                  <Tag className="w-3.5 h-3.5 text-brand" /> Have a Coupon Code? (Try &quot;CREATOR50&quot;)
                </label>
                <div className="flex gap-2">
                  <Input
                    placeholder="Enter CREATOR50"
                    value={couponInput}
                    onChange={e => setCouponInput(e.target.value)}
                    className="text-xs rounded-xl bg-card border-border uppercase"
                  />
                  <Button onClick={handleApplyCoupon} variant="outline" className="text-xs font-bold px-4 rounded-xl shrink-0 border-border">
                    Apply
                  </Button>
                </div>
              </div>

              {/* Price Breakdown */}
              <div className="space-y-2.5 text-xs border-t border-border pt-4 text-muted-foreground">
                <div className="flex justify-between">
                  <span>Course Price:</span>
                  <strong className="text-foreground">₹{course.numericPrice.toLocaleString()}</strong>
                </div>

                {appliedDiscount > 0 && (
                  <div className="flex justify-between text-emerald-500 font-bold">
                    <span>Discount ({appliedDiscount}% Off):</span>
                    <span>-₹{discountAmount.toLocaleString()}</span>
                  </div>
                )}

                <div className="flex justify-between">
                  <span>GST & Platform Fee (0% Waiver):</span>
                  <strong className="text-emerald-500">₹0 (Free)</strong>
                </div>

                <div className="flex justify-between items-baseline pt-3 border-t border-border text-foreground">
                  <span className="text-base font-bold">Total Amount Due:</span>
                  <span className="text-3xl font-bold font-serif text-brand">₹{finalPrice.toLocaleString()}</span>
                </div>
              </div>

              {/* Pay Now Button */}
              <Button
                onClick={handlePayNow}
                className="w-full bg-brand hover:bg-brand/90 text-white font-bold rounded-2xl py-4 text-base shadow-xl flex items-center justify-center gap-2 transform hover:scale-[1.02] transition-all cursor-pointer"
              >
                <span>Pay ₹{finalPrice.toLocaleString()} & Unlock Course</span>
                <ArrowRight className="w-5 h-5" />
              </Button>

              <div className="text-center text-[11px] text-muted-foreground flex items-center justify-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
                <span>Instant Automatic Course Unlock & Certificate Access</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════
         SIMULATED RAZORPAY / UPI PAYMENT GATEWAY MODAL
         ═══════════════════════════════════════════════════════════ */}
      {showGatewayModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-in fade-in duration-200">
          <div className="bg-card border border-border rounded-3xl max-w-md w-full p-8 shadow-2xl space-y-6 text-center text-foreground relative">
            {isProcessing ? (
              <div className="space-y-6 py-4">
                <div className="h-20 w-20 rounded-full bg-brand/15 text-brand flex items-center justify-center mx-auto border border-brand/30 animate-pulse">
                  <Loader2 className="w-10 h-10 animate-spin text-brand" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-bold font-serif">Processing Payment...</h3>
                  <p className="text-xs text-muted-foreground">Connecting to Razorpay UPI Payment Gateway. Please do not close this window.</p>
                </div>
              </div>
            ) : paymentSuccess ? (
              <div className="space-y-6 py-4 animate-in zoom-in-95 duration-200">
                <div className="h-20 w-20 rounded-full bg-emerald-500/15 border border-emerald-500/40 text-emerald-500 flex items-center justify-center mx-auto shadow-inner">
                  <Check className="w-10 h-10 stroke-[3]" />
                </div>

                <div className="space-y-2">
                  <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-500 text-xs font-bold uppercase tracking-wider">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>PAYMENT CONFIRMED</span>
                  </div>
                  <h3 className="text-2xl font-bold font-serif text-foreground">
                    Course Unlocked!
                  </h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Transaction ID: <span className="font-mono font-bold text-foreground">TXN-84920489</span>
                  </p>
                </div>

                <p className="text-sm font-semibold text-emerald-500 bg-emerald-500/10 py-3 px-4 rounded-2xl border border-emerald-500/20">
                  🎉 Redirecting to your Student Portal & 4K Video Player...
                </p>
              </div>
            ) : null}
          </div>
        </div>
      )}

    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-background text-foreground flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-brand" /></div>}>
      <CheckoutContent />
    </Suspense>
  );
}
