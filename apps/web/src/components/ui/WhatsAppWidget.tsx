'use client';

import React, { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, X, Send, Sparkles, CheckCircle2, ChevronRight } from 'lucide-react';

interface WhatsAppWidgetProps {
  phoneNumber?: string;
}

export const WhatsAppWidget: React.FC<WhatsAppWidgetProps> = ({
  phoneNumber: initialPhoneNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '919876543210',
}) => {
  const pathname = usePathname() || '';
  const [isOpen, setIsOpen] = useState(false);
  const [customMessage, setCustomMessage] = useState('');
  const [enabled, setEnabled] = useState<boolean>(true);
  const [phoneNumber, setPhoneNumber] = useState<string>(initialPhoneNumber);

  const isAdminOrPortal =
    pathname.startsWith('/admin') ||
    pathname.startsWith('/super-admin') ||
    pathname.startsWith('/sushant') ||
    pathname.startsWith('/sushnat') ||
    pathname.startsWith('/studio-8f2k') ||
    pathname.startsWith('/talent-dashboard') ||
    pathname.startsWith('/client-portal') ||
    pathname.startsWith('/editor-portal') ||
    pathname.startsWith('/employee-portal') ||
    pathname.startsWith('/project-manager');

  useEffect(() => {
    if (isAdminOrPortal) return;
    const checkStatus = async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://mp-backend-api.onrender.com/api/v1';
        const res = await fetch(`${apiUrl}/whatsapp/status`);
        if (res.ok) {
          const json = await res.json();
          if (json.success) {
            setEnabled(json.enabled !== false);
            if (json.phoneNumber) {
              setPhoneNumber(json.phoneNumber);
            }
          }
        }
      } catch (err) {
        // Fallback: keep enabled on fetch error
      }
    };

    checkStatus();
  }, [isAdminOrPortal]);

  if (!enabled || isAdminOrPortal) {
    return null;
  }

  const quickActions = [
    {
      id: 'book_talent',
      label: 'Book Talent / Model',
      icon: '🎬',
      text: 'Hi MP Production! I am interested in booking a talent/model for a project.',
    },
    {
      id: 'quote',
      label: 'Get Production Quote',
      icon: '💰',
      text: 'Hi! I would like to get a cost estimate for video production / editing.',
    },
    {
      id: 'project_status',
      label: 'Check Project Status',
      icon: '📁',
      text: 'Hi team, I want to check the status of my active project on MDMS.',
    },
    {
      id: 'general',
      label: 'Chat with WhatsApp Assistant',
      icon: '🤖',
      text: 'Hi! I have a general query about MP Production services.',
    },
  ];

  const handleOpenWhatsApp = (text: string) => {
    const cleanNumber = phoneNumber.replace(/[^0-9]/g, '');
    const encodedText = encodeURIComponent(text);
    const whatsappUrl = `https://wa.me/${cleanNumber}?text=${encodedText}`;
    window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
  };

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customMessage.trim()) return;
    handleOpenWhatsApp(customMessage);
    setCustomMessage('');
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      {/* Expanded Widget Popover */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="mb-4 w-80 sm:w-96 rounded-2xl border border-emerald-500/20 bg-slate-950/90 backdrop-blur-xl shadow-2xl overflow-hidden text-slate-100"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 p-4 text-white relative">
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <div className="w-10 h-10 rounded-full bg-white/10 backdrop-blur flex items-center justify-center border border-white/20">
                    <MessageSquare className="w-5 h-5 text-white" />
                  </div>
                  <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-400 border-2 border-emerald-800 rounded-full animate-pulse" />
                </div>
                <div>
                  <h4 className="font-semibold text-sm flex items-center gap-1.5">
                    MP Production WhatsApp
                    <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                  </h4>
                  <p className="text-xs text-emerald-100/90 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-emerald-300" />
                    Automated Assistant • Online
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="absolute top-3.5 right-3.5 p-1 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-colors"
                aria-label="Close WhatsApp Widget"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Content Body */}
            <div className="p-4 space-y-3 max-h-80 overflow-y-auto">
              <div className="bg-emerald-950/30 border border-emerald-500/20 rounded-xl p-3 text-xs text-slate-300">
                👋 Hello! How can we assist your production or booking today? Select a quick option or type a message below.
              </div>

              {/* Quick Actions */}
              <div className="space-y-2">
                <p className="text-[11px] font-medium text-slate-400 uppercase tracking-wider px-1">
                  Quick Actions
                </p>
                {quickActions.map((action) => (
                  <button
                    key={action.id}
                    onClick={() => handleOpenWhatsApp(action.text)}
                    className="w-full text-left p-2.5 rounded-xl bg-slate-900/60 hover:bg-emerald-950/40 border border-slate-800 hover:border-emerald-500/40 transition-all flex items-center justify-between group"
                  >
                    <span className="flex items-center space-x-2 text-xs font-medium text-slate-200 group-hover:text-emerald-400">
                      <span>{action.icon}</span>
                      <span>{action.label}</span>
                    </span>
                    <ChevronRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-emerald-400 group-hover:translate-x-0.5 transition-all" />
                  </button>
                ))}
              </div>

              {/* Custom Input Form */}
              <form onSubmit={handleCustomSubmit} className="pt-2 flex items-center space-x-2">
                <input
                  type="text"
                  value={customMessage}
                  onChange={(e) => setCustomMessage(e.target.value)}
                  placeholder="Type a custom message..."
                  className="flex-1 bg-slate-900 border border-slate-800 focus:border-emerald-500 rounded-xl px-3 py-2 text-xs text-slate-100 placeholder-slate-500 outline-none transition-colors"
                />
                <button
                  type="submit"
                  disabled={!customMessage.trim()}
                  className="bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white p-2 rounded-xl transition-colors flex items-center justify-center"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </form>
            </div>

            {/* Footer */}
            <div className="bg-slate-900/40 border-t border-slate-800/80 px-4 py-2 text-[10px] text-center text-slate-500">
              Powered by <span className="font-semibold text-emerald-400">InboxWA</span> WhatsApp Automation
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Trigger Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="relative group flex items-center justify-center w-14 h-14 rounded-full bg-gradient-to-tr from-emerald-600 to-teal-500 text-white shadow-lg hover:shadow-emerald-500/25 transition-all duration-300 border border-emerald-400/30"
        aria-label="Open WhatsApp Automation Chat"
      >
        <span className="absolute -top-1 -right-1 flex h-4 w-4">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-4 w-4 bg-emerald-500 border-2 border-slate-950"></span>
        </span>
        {isOpen ? (
          <X className="w-6 h-6" />
        ) : (
          <MessageSquare className="w-6 h-6 fill-current text-white" />
        )}
      </motion.button>
    </div>
  );
};
