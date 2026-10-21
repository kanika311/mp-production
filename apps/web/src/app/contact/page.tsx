"use client";

import { Navbar } from '@/components/ui/Navbar';
import { Container } from '@/components/ui/Container';
import { Button } from '@/components/ui/Button';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { fetchAPI } from '@/lib/api-client';
import { 
  MapPin, 
  Phone, 
  Mail, 
  Clock, 
  Send, 
  Sparkles, 
  MessageCircle, 
  CheckCircle2, 
  ArrowRight,
  ShieldCheck
} from 'lucide-react';

export default function Contact() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    inquiryType: 'Production Services',
    message: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // Synchronize contact info with footer CMS configuration
  const [footerConfig, setFooterConfig] = useState<{
    contactEmail?: string;
    contactPhone?: string;
    contactAddress?: string;
  }>({
    contactEmail: 'hello@mpproduction.com',
    contactPhone: '+91 831 053 1309',
    contactAddress: 'Mumbai, India',
  });

  useEffect(() => {
    fetchAPI('/cms/config/footer')
      .then((json) => {
        if (json?.success && json?.data) {
          const val =
            typeof json.data === 'string'
              ? JSON.parse(json.data)
              : typeof json.data.value === 'string'
              ? JSON.parse(json.data.value)
              : json.data.value || json.data;
          setFooterConfig((prev) => ({ ...prev, ...val }));
        }
      })
      .catch(() => {});
  }, []);

  const contactPhone = footerConfig?.contactPhone || '+91 831 053 1309';
  const contactEmail = footerConfig?.contactEmail || 'hello@mpproduction.com';
  const contactAddress = footerConfig?.contactAddress || 'Mumbai, India';
  const cleanPhone = contactPhone.replace(/\s+/g, '');
  const waPhone = cleanPhone.replace(/^\+/, '');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.firstName.trim() || !formData.email.trim() || !formData.message.trim()) {
      toast.error('Please fill in required fields: First Name, Email, and Message.');
      return;
    }

    setSubmitting(true);
    try {
      const json = await fetchAPI('/cms/contact', {
        method: 'POST',
        body: JSON.stringify({
          name: `${formData.firstName} ${formData.lastName}`.trim(),
          email: formData.email.trim(),
          phone: formData.phone.trim(),
          subject: formData.inquiryType,
          message: formData.message.trim()
        })
      });

      if (json?.success || json?.message) {
        toast.success(json?.message || 'Thank you! Your message has been sent successfully.');
        setSubmitted(true);
        setFormData({
          firstName: '',
          lastName: '',
          email: '',
          phone: '',
          inquiryType: 'Production Services',
          message: ''
        });
      } else {
        toast.error('Failed to submit inquiry. Please try again.');
      }
    } catch {
      toast.error('Network error while sending message. Please try again or reach out via direct phone/email.');
    } finally {
      setSubmitting(false);
    }
  };

  // High-contrast, crystal-clear input styles
  const inputStyle = 
    "w-full rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900/90 px-4 py-3.5 text-sm font-medium text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 dark:placeholder:text-neutral-500 shadow-xs hover:border-neutral-400 dark:hover:border-neutral-600 focus:border-brand focus:ring-2 focus:ring-brand/20 outline-none transition-all duration-200";

  return (
    <>
      <Navbar />

      <main className="min-h-screen bg-background text-foreground pt-28 sm:pt-36 pb-24 relative overflow-hidden">
        {/* Background Ambient Glows */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] bg-brand/5 blur-[120px] pointer-events-none rounded-full" />

        <Container className="relative z-10">
          

          {/* Main 2-Column Grid: Left Contact Info & Right Form */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
            
            {/* Left Column: Official Contact Details */}
            <div className="order-2 lg:order-1 lg:col-span-5 space-y-6">
              {/* Contact Info Cards */}
              <div className="bg-card border border-neutral-200 dark:border-neutral-800 rounded-2xl p-6 shadow-sm space-y-5">
                
                {/* Headquarters / Address */}
                <div className="flex items-start gap-4">
                  <div className="w-11 h-11 rounded-xl bg-brand/10 border border-brand/20 flex items-center justify-center shrink-0 text-brand">
                    <MapPin size={20} />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">
                      Global Headquarters
                    </h3>
                    <p className="text-foreground font-semibold text-base leading-snug">
                      {contactAddress}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                      Studio 4B, Film City Complex, Goregaon East, Mumbai, Maharashtra 400065, India
                    </p>
                  </div>
                </div>

                <div className="h-px bg-border/60" />

                {/* Direct Phone / WhatsApp */}
                <div className="flex items-start gap-4">
                  <div className="w-11 h-11 rounded-xl bg-brand/10 border border-brand/20 flex items-center justify-center shrink-0 text-brand">
                    <Phone size={20} />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">
                      Direct Production Line
                    </h3>
                    <a
                      href={`tel:${cleanPhone}`}
                      className="text-foreground font-semibold text-base hover:text-brand transition-colors block"
                    >
                      {contactPhone}
                    </a>
                    <div className="flex items-center gap-3 mt-2">
                      <a
                        href={`https://wa.me/${waPhone}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-600 dark:text-emerald-400 hover:underline"
                      >
                        <MessageCircle size={14} />
                        Chat on WhatsApp
                      </a>
                    </div>
                  </div>
                </div>

                <div className="h-px bg-border/60" />

                {/* Email Inquiries */}
                <div className="flex items-start gap-4">
                  <div className="w-11 h-11 rounded-xl bg-brand/10 border border-brand/20 flex items-center justify-center shrink-0 text-brand">
                    <Mail size={20} />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">
                      General & Casting Inquiries
                    </h3>
                    <a
                      href={`mailto:${contactEmail}`}
                      className="text-foreground font-semibold text-base hover:text-brand transition-colors"
                    >
                      {contactEmail}
                    </a>
                    <p className="text-xs text-muted-foreground mt-1">
                      Expect a response within 2–4 business hours.
                    </p>
                  </div>
                </div>

                <div className="h-px bg-border/60" />

                {/* Operating Timings */}
                <div className="flex items-start gap-4">
                  <div className="w-11 h-11 rounded-xl bg-brand/10 border border-brand/20 flex items-center justify-center shrink-0 text-brand">
                    <Clock size={20} />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">
                      Studio Hours
                    </h3>
                    <p className="text-foreground font-medium text-sm">
                      Monday – Saturday: 10:00 AM – 7:00 PM IST
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Emergency production lines active 24/7 for active client shoots.
                    </p>
                  </div>
                </div>

              </div>

              {/* Client Assurance Note */}
              <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-xs text-muted-foreground">
                <ShieldCheck size={18} className="text-brand shrink-0" />
                <span>NDA & Confidentiality guaranteed for all script and brand dispatches.</span>
              </div>

            </div>

            {/* Right Column: Direct Contact Form */}
            <div className="order-1 lg:order-2 lg:col-span-7">
              <div className="bg-card border border-neutral-300 dark:border-neutral-800 rounded-3xl p-6 sm:p-8 md:p-10 shadow-xl shadow-black/5">
                
                {submitted ? (
                  /* Success State */
                  <div className="py-12 text-center space-y-5">
                    <div className="w-16 h-16 rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 flex items-center justify-center mx-auto">
                      <CheckCircle2 size={36} />
                    </div>
                    <div className="space-y-2">
                      <h3 className="text-2xl font-serif font-medium text-foreground">
                        Message Dispatched Successfully!
                      </h3>
                      <p className="text-sm text-muted-foreground max-w-md mx-auto">
                        Thank you for reaching out to MP Production. Our producers have received your message and will contact you via email or phone within 24 hours.
                      </p>
                    </div>
                    <div className="pt-4">
                      <Button
                        type="button"
                        variant="secondary"
                        onClick={() => setSubmitted(false)}
                        className="rounded-xl px-6"
                      >
                        Send Another Inquiry
                      </Button>
                    </div>
                  </div>
                ) : (
                  /* Active Form */
                  <div>
                    <div className="mb-8">
                      <h2 className="text-2xl sm:text-3xl font-display font-light text-foreground mb-2">
                        Send a Direct Dispatch
                      </h2>
                      <p className="text-sm text-muted-foreground">
                        Tell us about your upcoming project, creative ideas, or booking inquiry.
                      </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                      
                      {/* Name Fields */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                        <div>
                          <label
                            className="block text-xs font-bold uppercase tracking-wider text-neutral-700 dark:text-neutral-300 mb-2"
                            htmlFor="firstName"
                          >
                            First Name <span className="text-brand">*</span>
                          </label>
                          <input
                            type="text"
                            id="firstName"
                            required
                            placeholder="e.g. Rahul"
                            value={formData.firstName}
                            onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                            className={inputStyle}
                          />
                        </div>

                        <div>
                          <label
                            className="block text-xs font-bold uppercase tracking-wider text-neutral-700 dark:text-neutral-300 mb-2"
                            htmlFor="lastName"
                          >
                            Last Name
                          </label>
                          <input
                            type="text"
                            id="lastName"
                            placeholder="e.g. Sharma"
                            value={formData.lastName}
                            onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                            className={inputStyle}
                          />
                        </div>
                      </div>

                      {/* Email & Phone */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                        <div>
                          <label
                            className="block text-xs font-bold uppercase tracking-wider text-neutral-700 dark:text-neutral-300 mb-2"
                            htmlFor="email"
                          >
                            Email Address <span className="text-brand">*</span>
                          </label>
                          <input
                            type="email"
                            id="email"
                            required
                            placeholder="you@company.com"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            className={inputStyle}
                          />
                        </div>

                        <div>
                          <label
                            className="block text-xs font-bold uppercase tracking-wider text-neutral-700 dark:text-neutral-300 mb-2"
                            htmlFor="phone"
                          >
                            Phone Number
                          </label>
                          <input
                            type="tel"
                            id="phone"
                            placeholder="+91 831 053 1309"
                            value={formData.phone}
                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                            className={inputStyle}
                          />
                        </div>
                      </div>

                      {/* Inquiry Type */}
                      <div>
                        <label
                          className="block text-xs font-bold uppercase tracking-wider text-neutral-700 dark:text-neutral-300 mb-2"
                          htmlFor="inquiryType"
                        >
                          Inquiry Type
                        </label>
                        <select
                          id="inquiryType"
                          value={formData.inquiryType}
                          onChange={(e) => setFormData({ ...formData, inquiryType: e.target.value })}
                          className={`${inputStyle} cursor-pointer`}
                        >
                          <option value="Production Services" className="bg-white dark:bg-neutral-900 text-foreground">
                            Production Services (Commercial / Narrative / Shoot)
                          </option>
                          <option value="Talent Representation" className="bg-white dark:bg-neutral-900 text-foreground">
                            Talent Representation & Casting
                          </option>
                          <option value="Brand Collaboration" className="bg-white dark:bg-neutral-900 text-foreground">
                            Brand Collaboration & Influencer Campaign
                          </option>
                          <option value="Post-Production & VFX" className="bg-white dark:bg-neutral-900 text-foreground">
                            Post-Production, Color Grading & VFX
                          </option>
                          <option value="Press / Media" className="bg-white dark:bg-neutral-900 text-foreground">
                            Press / Media & Speaking Inquiries
                          </option>
                          <option value="Other" className="bg-white dark:bg-neutral-900 text-foreground">
                            Other General Inquiries
                          </option>
                        </select>
                      </div>

                      {/* Message */}
                      <div>
                        <label
                          className="block text-xs font-bold uppercase tracking-wider text-neutral-700 dark:text-neutral-300 mb-2"
                          htmlFor="message"
                        >
                          Project Details / Message <span className="text-brand">*</span>
                        </label>
                        <textarea
                          id="message"
                          rows={5}
                          required
                          placeholder="Tell us about your project scope, timeline, deliverables, or questions..."
                          value={formData.message}
                          onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                          className={`${inputStyle} resize-y min-h-[140px]`}
                        />
                      </div>

                      {/* Submit CTA */}
                      <Button
                        type="submit"
                        disabled={submitting}
                        size="lg"
                        className="w-full justify-center text-base py-4 font-semibold shadow-lg shadow-brand/20 hover:shadow-brand/35 transition-all rounded-xl"
                      >
                        {submitting ? (
                          <span className="inline-flex items-center gap-2">
                            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            Dispatching Message...
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-2">
                            Send Message
                            <Send size={16} />
                          </span>
                        )}
                      </Button>

                      <p className="text-center text-xs text-muted-foreground mt-3">
                        By submitting, you agree to our{' '}
                        <a href="/privacy" className="underline hover:text-foreground">
                          Privacy Policy
                        </a>{' '}
                        and{' '}
                        <a href="/terms" className="underline hover:text-foreground">
                          Terms of Service
                        </a>.
                      </p>

                    </form>
                  </div>
                )}

              </div>
            </div>

          </div>
        </Container>
      </main>
    </>
  );
}
