'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface WizardProgressProps {
  currentStep: number;
  totalSteps: number;
  steps: { label: string; icon: React.ReactNode }[];
  completionPercent: number;
  completedStepNumbers?: number[];
  onStepClick?: (stepNum: number) => void;
}

export function WizardProgress({
  currentStep,
  totalSteps,
  steps,
  completionPercent,
  completedStepNumbers = [],
  onStepClick,
}: WizardProgressProps) {
  return (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="mb-6">
        <h2 className="text-lg font-serif text-[var(--foreground)] tracking-wide">
          MP <span className="text-[var(--brand)]">Productions</span>
        </h2>
        <p className="text-[10px] font-semibold tracking-[0.2em] uppercase text-[var(--muted-foreground)] mt-0.5">
          Talent Onboarding
        </p>
      </div>

      {/* Completion ring */}
      <div className="relative w-22 h-22 mx-auto mb-6">
        <svg className="w-24 h-24 -rotate-90" viewBox="0 0 96 96">
          <circle
            cx="48" cy="48" r="40"
            fill="none"
            stroke="var(--border)"
            strokeWidth="4"
          />
          <motion.circle
            cx="48" cy="48" r="40"
            fill="none"
            stroke="var(--brand)"
            strokeWidth="4"
            strokeLinecap="round"
            strokeDasharray={2 * Math.PI * 40}
            initial={{ strokeDashoffset: 2 * Math.PI * 40 }}
            animate={{ strokeDashoffset: 2 * Math.PI * 40 * (1 - completionPercent / 100) }}
            transition={{ duration: 0.8, ease: [0.4, 0, 0.2, 1] }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <motion.span
            key={completionPercent}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-lg font-bold text-[var(--foreground)]"
          >
            {completionPercent}%
          </motion.span>
          <span className="text-[9px] font-semibold tracking-wider uppercase text-[var(--muted-foreground)]">
            Complete
          </span>
        </div>
      </div>

      {/* Steps list */}
      <nav className="flex-1 space-y-1">
        {steps.map((step, index) => {
          const stepNum = index + 1;
          const isActive = stepNum === currentStep;
          const isCompleted = completedStepNumbers.includes(stepNum);
          const isSkipped = stepNum < currentStep && !isCompleted;
          const isFuture = stepNum > currentStep;

          return (
            <div
              key={stepNum}
              onClick={() => onStepClick?.(stepNum)}
              className={`
                relative flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300
                ${isActive ? 'bg-[var(--brand)]/10' : 'hover:bg-surface/80'}
                ${onStepClick ? 'cursor-pointer' : ''}
              `}
            >
              {/* Connector line */}
              {index < steps.length - 1 && (
                <div
                  className={`
                    absolute left-[1.65rem] top-[2.75rem] w-[2px] h-6
                    transition-colors duration-500
                    ${isCompleted ? 'bg-[var(--brand)]' : 'bg-[var(--border)]'}
                  `}
                />
              )}

              {/* Step circle */}
              <div
                className={`
                  relative z-10 w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0
                  transition-all duration-300 text-xs font-bold
                  ${isCompleted
                    ? 'bg-[var(--brand)] text-white shadow-sm'
                    : isActive
                      ? 'border-2 border-[var(--brand)] text-[var(--brand)] bg-[var(--brand)]/10 shadow-sm'
                      : isSkipped
                        ? 'border-2 border-dashed border-[var(--border)] text-[var(--muted-foreground)]/40 bg-transparent'
                        : 'border border-[var(--border)]/60 text-[var(--muted-foreground)]/40 bg-transparent'
                  }
                `}
              >
                {isCompleted ? (
                  <motion.svg
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                    width="14" height="14" viewBox="0 0 16 16" fill="none"
                  >
                    <path d="M3.5 8L6.5 11L12.5 5" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                  </motion.svg>
                ) : isSkipped ? (
                  null
                ) : (
                  <span>{step.icon}</span>
                )}
              </div>

              {/* Step label */}
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-1">
                  <p className={`
                    text-[10px] font-semibold tracking-wider uppercase
                    ${isActive
                      ? 'text-[var(--brand)]'
                      : isCompleted
                        ? 'text-[var(--muted-foreground)]'
                        : isSkipped
                          ? 'text-amber-500/90'
                          : 'text-[var(--muted-foreground)]/50'
                    }
                  `}>
                    Step {stepNum} {isSkipped && '• Skipped'}
                  </p>
                </div>
                <p className={`
                  text-sm font-medium truncate
                  ${isActive
                    ? 'text-[var(--brand)] font-semibold'
                    : isCompleted
                      ? 'text-[var(--foreground)] font-medium'
                      : 'text-[var(--muted-foreground)]'
                  }
                `}>
                  {step.label}
                </p>
              </div>
            </div>
          );
        })}
      </nav>

      {/* Bottom help */}
      <div className="mt-auto pt-6 border-t border-[var(--border)]">
        <p className="text-xs text-[var(--muted-foreground)] leading-relaxed">
          Your progress is saved automatically. You can return anytime to complete your profile.
        </p>
      </div>
    </div>
  );
}

interface WizardNavigationProps {
  currentStep: number;
  totalSteps: number;
  onPrev: () => void;
  onNext: () => void;
  onSaveDraft: () => void;
  isSubmitting?: boolean;
  isLastStep?: boolean;
  canProceed?: boolean;
}

export function WizardNavigation({
  currentStep,
  totalSteps,
  onPrev,
  onNext,
  onSaveDraft,
  isSubmitting = false,
  isLastStep = false,
  canProceed = true,
}: WizardNavigationProps) {
  return (
    <div className="bg-[var(--card)]/95 backdrop-blur-md w-full">
      <div className="max-w-4xl mx-auto w-full flex flex-wrap sm:flex-nowrap items-center justify-between gap-3 py-3 sm:py-4 px-4 sm:px-8 lg:px-12">
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {currentStep > 1 && (
            <button
              onClick={onPrev}
              disabled={isSubmitting}
              className="flex items-center gap-1 sm:gap-2 px-3 sm:px-5 py-2 sm:py-2.5 rounded-xl border border-[var(--border)] text-xs sm:text-sm font-medium text-[var(--foreground)] hover:border-[var(--brand)]/50 hover:text-[var(--brand)] transition-all duration-300 disabled:opacity-50 whitespace-nowrap"
            >
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none" className="shrink-0">
                <path d="M10 4L6 8L10 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span>Previous</span>
            </button>
          )}
        </div>

        <div className="flex items-center gap-2 sm:gap-3 shrink-0 ml-auto">
          <button
            onClick={onSaveDraft}
            disabled={isSubmitting}
            className="px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl text-[10px] sm:text-xs font-semibold tracking-wider uppercase text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--surface)] transition-all duration-300 disabled:opacity-50 whitespace-nowrap"
          >
            <span className="hidden sm:inline">Save & Continue Later</span>
            <span className="sm:hidden">Save Draft</span>
          </button>

          <button
            onClick={onNext}
            disabled={isSubmitting || !canProceed}
            className={`
              flex items-center gap-1.5 sm:gap-2 px-4 sm:px-6 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-300 whitespace-nowrap shrink-0
              ${isLastStep
                ? 'bg-[var(--brand)] text-white hover:opacity-90 shadow-glow'
                : 'bg-[var(--brand)] text-white hover:opacity-90'
              }
              disabled:opacity-50 disabled:cursor-not-allowed
            `}
          >
            {isSubmitting ? (
              <>
                <svg className="animate-spin w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" className="opacity-25" />
                  <path d="M4 12a8 8 0 018-8" stroke="currentColor" strokeWidth="3" strokeLinecap="round" className="opacity-75" />
                </svg>
                <span>{isLastStep ? 'Publishing...' : 'Saving...'}</span>
              </>
            ) : (
              <>
                <span>{isLastStep ? 'Publish Profile' : 'Continue'}</span>
                {!isLastStep && (
                  <svg width="14" height="14" viewBox="0 0 16 16" fill="none" className="shrink-0">
                    <path d="M6 4L10 8L6 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
