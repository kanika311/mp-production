'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check, Copy, Share2, Smartphone, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';

export interface SocialShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  url?: string;
  image?: string;
  category?: string;
}

export const SocialShareModal: React.FC<SocialShareModalProps> = ({
  isOpen,
  onClose,
  title,
  description = 'Check out this profile on MP Production',
  url,
  image,
  category,
}) => {
  const [copied, setCopied] = useState(false);
  const [shareUrl, setShareUrl] = useState('');
  const [canNativeShare, setCanNativeShare] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setShareUrl(url || window.location.href);
      setCanNativeShare(typeof navigator !== 'undefined' && !!navigator.share);
    }
  }, [url, isOpen]);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const handleCopyLink = async () => {
    try {
      if (navigator?.clipboard) {
        await navigator.clipboard.writeText(shareUrl);
      } else {
        const textarea = document.createElement('textarea');
        textarea.value = shareUrl;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
      }
      setCopied(true);
      toast.success('Link copied to clipboard!');
      setTimeout(() => setCopied(false), 2500);
    } catch {
      toast.error('Failed to copy link.');
    }
  };

  const handleNativeShare = async () => {
    if (navigator?.share) {
      try {
        await navigator.share({
          title,
          text: `${title} - ${description}`,
          url: shareUrl,
        });
      } catch (err: any) {
        if (err?.name !== 'AbortError') {
          handleCopyLink();
        }
      }
    } else {
      handleCopyLink();
    }
  };

  const encodedUrl = encodeURIComponent(shareUrl);
  const shareText = encodeURIComponent(`${title} · MP Production\n${description ? description + '\n' : ''}`);

  const shareChannels = [
    {
      id: 'whatsapp',
      name: 'WhatsApp',
      color: 'bg-[#25D366] hover:bg-[#20ba59] text-white',
      badgeColor: 'bg-[#25D366]/10 text-[#25D366]',
      icon: (
        <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
          <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
        </svg>
      ),
      action: () => {
        window.open(`https://api.whatsapp.com/send?text=${shareText}%20${encodedUrl}`, '_blank');
      },
    },
    {
      id: 'instagram',
      name: 'Instagram',
      color: 'bg-gradient-to-tr from-[#f09433] via-[#dc2743] to-[#bc1888] hover:opacity-95 text-white',
      badgeColor: 'bg-[#dc2743]/10 text-[#dc2743]',
      icon: (
        <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
        </svg>
      ),
      action: async () => {
        await handleCopyLink();
        toast.info('Link copied! Open Instagram to paste in Stories or DM.', { duration: 4000 });
        window.open('https://www.instagram.com', '_blank');
      },
    },
    {
      id: 'facebook',
      name: 'Facebook',
      color: 'bg-[#1877F2] hover:bg-[#166fe5] text-white',
      badgeColor: 'bg-[#1877F2]/10 text-[#1877F2]',
      icon: (
        <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
        </svg>
      ),
      action: () => {
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`, '_blank');
      },
    },
    {
      id: 'twitter',
      name: 'X (Twitter)',
      color: 'bg-black hover:bg-neutral-800 text-white border border-white/10',
      badgeColor: 'bg-neutral-900 text-neutral-200',
      icon: (
        <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
        </svg>
      ),
      action: () => {
        window.open(`https://twitter.com/intent/tweet?url=${encodedUrl}&text=${shareText}`, '_blank');
      },
    },
    {
      id: 'linkedin',
      name: 'LinkedIn',
      color: 'bg-[#0A66C2] hover:bg-[#095196] text-white',
      badgeColor: 'bg-[#0A66C2]/10 text-[#0A66C2]',
      icon: (
        <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
          <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
        </svg>
      ),
      action: () => {
        window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`, '_blank');
      },
    },
    {
      id: 'telegram',
      name: 'Telegram',
      color: 'bg-[#229ED9] hover:bg-[#1e8bc0] text-white',
      badgeColor: 'bg-[#229ED9]/10 text-[#229ED9]',
      icon: (
        <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
          <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
        </svg>
      ),
      action: () => {
        window.open(`https://t.me/share/url?url=${encodedUrl}&text=${shareText}`, '_blank');
      },
    },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm cursor-pointer"
          />

          {/* Dialog Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            transition={{ type: 'spring', duration: 0.35, bounce: 0.15 }}
            className="relative w-full max-w-lg bg-card border border-border rounded-3xl shadow-2xl overflow-hidden z-10 text-foreground"
          >
            {/* Header */}
            <div className="px-6 pt-6 pb-4 flex items-center justify-between border-b border-border/80">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-brand/10 text-brand flex items-center justify-center">
                  <Share2 className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-foreground font-serif">
                    Share Profile
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Share via social apps or direct link
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-surface border border-border text-muted-foreground hover:text-foreground flex items-center justify-center hover:bg-muted transition-colors cursor-pointer"
                title="Close"
              >
                <X size={16} />
              </button>
            </div>

            {/* Content Body */}
            <div className="p-6 space-y-6">
              
              {/* Profile Card Preview */}
              <div className="flex items-center gap-3.5 p-3 rounded-2xl bg-surface/80 border border-border">
                {image ? (
                  <img
                    src={image}
                    alt={title}
                    className="w-12 h-12 rounded-xl object-cover object-top border border-border shrink-0 shadow-xs"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-xl bg-brand/10 text-brand flex items-center justify-center font-bold text-base font-serif shrink-0 border border-brand/20">
                    {title.charAt(0)}
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-bold text-foreground truncate font-serif">
                      {title}
                    </h4>
                    {category && (
                      <span className="px-2 py-0.5 rounded-full text-[9px] font-mono font-bold uppercase tracking-wider bg-brand/10 text-brand border border-brand/20 shrink-0">
                        {category}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground truncate font-light mt-0.5">
                    {description}
                  </p>
                </div>
              </div>

              {/* Social Channels Grid */}
              <div className="space-y-2.5">
                <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-muted-foreground">
                  Share Directly
                </span>
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2.5">
                  {shareChannels.map((channel) => (
                    <button
                      key={channel.id}
                      onClick={channel.action}
                      className="group flex flex-col items-center justify-center gap-2 p-2.5 rounded-2xl bg-surface hover:bg-muted border border-border/80 hover:border-brand/40 transition-all cursor-pointer shadow-xs hover:-translate-y-0.5"
                    >
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-md transition-transform group-hover:scale-105 ${channel.color}`}>
                        {channel.icon}
                      </div>
                      <span className="text-[11px] font-semibold text-foreground/80 group-hover:text-foreground truncate w-full text-center">
                        {channel.name}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Native Device Share Sheet (Mobile / Tablet / Compatible browsers) */}
              {canNativeShare && (
                <button
                  onClick={handleNativeShare}
                  className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-surface hover:bg-muted text-xs font-semibold text-foreground border border-border hover:border-brand/40 transition-all cursor-pointer"
                >
                  <Smartphone className="w-4 h-4 text-brand" />
                  <span>More apps &amp; options (Native Share Sheet)</span>
                  <ExternalLink className="w-3.5 h-3.5 text-muted-foreground ml-auto" />
                </button>
              )}

              {/* Copy Link Input Bar */}
              <div className="space-y-1.5 pt-1">
                <label className="text-[11px] font-mono font-bold uppercase tracking-wider text-muted-foreground">
                  Or Copy Profile Link
                </label>
                <div className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <input
                      type="text"
                      readOnly
                      value={shareUrl}
                      onClick={(e) => (e.target as HTMLInputElement).select()}
                      className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-border bg-surface text-foreground font-mono truncate focus:outline-none focus:ring-1 focus:ring-brand select-all"
                    />
                  </div>
                  <button
                    onClick={handleCopyLink}
                    className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer shadow-sm ${
                      copied
                        ? 'bg-emerald-600 text-white'
                        : 'bg-brand hover:bg-brand/90 text-white hover:shadow-brand/20'
                    }`}
                  >
                    {copied ? (
                      <>
                        <Check size={14} className="stroke-[3]" />
                        <span>Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy size={14} />
                        <span>Copy Link</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

            </div>

            {/* Modal Footer Note */}
            <div className="px-6 py-3.5 bg-surface/50 border-t border-border/80 flex items-center justify-between text-[11px] text-muted-foreground">
              <span>MP Production Talent Roster</span>
              <span className="font-mono text-[10px]">mp-production.com</span>
            </div>

          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
