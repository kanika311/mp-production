'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { FloatingInput, FloatingSelect } from './FormInputs';

interface StepAccountCreationProps {
  data: {
    fullName: string;
    stageName: string;
    email: string;
    phone: string;
    password: string;
    confirmPassword: string;
    dateOfBirth: string;
    gender: string;
    country: string;
    state: string;
    city: string;
    acceptTerms: boolean;
  };
  onChange: (data: Partial<StepAccountCreationProps['data']>) => void;
  errors: Record<string, string>;
}

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.06 } },
};

const item = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.4, 0, 0.2, 1] as any } },
};

export function StepAccountCreation({ data, onChange, errors }: StepAccountCreationProps) {
  // Date of Birth must strictly be in the past (neither today nor any future date is allowed)
  const maxDobDate = React.useMemo(() => {
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);
    return yesterday.toISOString().split('T')[0];
  }, []);

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="space-y-8"
    >
      {/* Section: Identity */}
      <motion.div variants={item}>
        <h3 className="text-[10px] font-semibold tracking-[0.2em] uppercase text-[var(--brand)] mb-6">
          Personal Information
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FloatingInput
            label="Full Name"
            value={data.fullName}
            onChange={(e) => onChange({ fullName: e.target.value })}
            error={errors.fullName}
            icon={
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" strokeLinecap="round" strokeLinejoin="round" />
                <circle cx="12" cy="7" r="4" />
              </svg>
            }
          />
          <FloatingInput
            label="Stage Name (Optional)"
            value={data.stageName}
            onChange={(e) => onChange({ stageName: e.target.value })}
            icon={
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            }
          />
        </div>
      </motion.div>

      {/* Section: Contact */}
      <motion.div variants={item}>
        <h3 className="text-[10px] font-semibold tracking-[0.2em] uppercase text-[var(--brand)] mb-6">
          Contact Details
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FloatingInput
            label="Email Address"
            type="email"
            value={data.email}
            onChange={(e) => onChange({ email: e.target.value })}
            error={errors.email}
            icon={
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <rect x="2" y="4" width="20" height="16" rx="2" />
                <path d="M22 7l-8.97 5.7a1.94 1.94 0 01-2.06 0L2 7" />
              </svg>
            }
          />
          <FloatingInput
            label="Mobile Number"
            type="tel"
            value={data.phone}
            onChange={(e) => onChange({ phone: e.target.value })}
            error={errors.phone}
            icon={
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <rect x="5" y="2" width="14" height="20" rx="2" />
                <line x1="12" y1="18" x2="12.01" y2="18" />
              </svg>
            }
          />
        </div>
      </motion.div>

      {/* Section: Security */}
      <motion.div variants={item}>
        <h3 className="text-[10px] font-semibold tracking-[0.2em] uppercase text-[var(--brand)] mb-6">
          Security
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FloatingInput
            label="Password"
            type="password"
            autoComplete="new-password"
            value={data.password}
            onChange={(e) => onChange({ password: e.target.value })}
            error={errors.password}
            icon={
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <rect x="3" y="11" width="18" height="11" rx="2" />
                <path d="M7 11V7a5 5 0 0110 0v4" />
              </svg>
            }
          />
          <FloatingInput
            label="Confirm Password"
            type="password"
            autoComplete="new-password"
            value={data.confirmPassword}
            onChange={(e) => onChange({ confirmPassword: e.target.value })}
            error={errors.confirmPassword}
            icon={
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
            }
          />
        </div>
      </motion.div>

      {/* Section: Personal Details */}
      <motion.div variants={item}>
        <h3 className="text-[10px] font-semibold tracking-[0.2em] uppercase text-[var(--brand)] mb-6">
          Personal Details
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <FloatingInput
            label="Date of Birth"
            type="date"
            max={maxDobDate}
            min="1940-01-01"
            value={data.dateOfBirth}
            onChange={(e) => {
              const val = e.target.value;
              if (val) {
                const selected = new Date(val);
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                if (selected >= today) {
                  return; // Strictly reject today or future date
                }
              }
              onChange({ dateOfBirth: val });
            }}
            error={errors.dateOfBirth}
          />
          <FloatingSelect
            label="Gender"
            value={data.gender}
            onChange={(e) => onChange({ gender: e.target.value })}
            error={errors.gender}
            options={[
              { value: 'male', label: 'Male' },
              { value: 'female', label: 'Female' },
              { value: 'non-binary', label: 'Non-Binary' },
              { value: 'other', label: 'Other' },
              { value: 'prefer-not-to-say', label: 'Prefer Not to Say' },
            ]}
          />
          <FloatingInput
            label="Country"
            value={data.country}
            onChange={(e) => onChange({ country: e.target.value })}
            error={errors.country}
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <FloatingInput
            label="State"
            value={data.state}
            onChange={(e) => onChange({ state: e.target.value })}
          />
          <FloatingInput
            label="City"
            value={data.city}
            onChange={(e) => onChange({ city: e.target.value })}
            error={errors.city}
          />
        </div>
      </motion.div>

      {/* Terms & Conditions */}
      <motion.div variants={item} className={`p-4 rounded-xl border transition-all duration-300 ${errors.acceptTerms ? 'border-[var(--destructive)] bg-[var(--destructive)]/5 ring-2 ring-[var(--destructive)]/20' : 'border-[var(--border)] bg-[var(--card)]/40'}`}>
        <label className="flex items-center gap-3 cursor-pointer group">
          <div className="relative flex-shrink-0">
            <input
              type="checkbox"
              checked={data.acceptTerms}
              onChange={(e) => onChange({ acceptTerms: e.target.checked })}
              className="sr-only"
            />
            <div className={`
              w-6 h-6 rounded-lg border-2 transition-all duration-300 flex items-center justify-center shadow-sm
              ${data.acceptTerms
                ? 'bg-[var(--brand)] border-[var(--brand)]'
                : 'border-[var(--input)] group-hover:border-[var(--brand)]/60 bg-[var(--background)]'
              }
              ${errors.acceptTerms ? 'border-[var(--destructive)] ring-2 ring-[var(--destructive)]/30' : ''}
            `}>
              {data.acceptTerms && (
                <motion.svg
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  width="14" height="14" viewBox="0 0 16 16" fill="none"
                >
                  <path d="M3 8L6.5 11.5L13 4.5" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                </motion.svg>
              )}
            </div>
          </div>
          <span className="text-sm text-[var(--foreground)] font-medium leading-relaxed select-none">
            I agree to the{' '}
            <a href="/terms" onClick={(e) => e.stopPropagation()} className="text-[var(--brand)] font-semibold hover:underline" target="_blank" rel="noopener noreferrer">Terms & Conditions</a>
            {' '}and{' '}
            <a href="/privacy" onClick={(e) => e.stopPropagation()} className="text-[var(--brand)] font-semibold hover:underline" target="_blank" rel="noopener noreferrer">Privacy Policy</a>
          </span>
        </label>
        {errors.acceptTerms && (
          <p className="mt-2 text-xs text-[var(--destructive)] font-semibold flex items-center gap-1.5">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
            {errors.acceptTerms}
          </p>
        )}
      </motion.div>
    </motion.div>
  );
}
