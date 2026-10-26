'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { cms } from '@/lib/cms/client';
import { toast } from 'sonner';
import { 
  LayoutTemplate, Plus, Trash2, Save, 
  RefreshCw, Loader2, Globe, Mail, Phone, MapPin 
} from 'lucide-react';

interface FooterSocialLink {
  platform: string;
  url: string;
}

interface FooterConfig {
  companyName: string;
  tagline: string;
  copyrightText: string;
  contactEmail: string;
  contactPhone: string;
  contactAddress: string;
  socialLinks: FooterSocialLink[];
}

const DEFAULT_FOOTER: FooterConfig = {
  companyName: 'MP Production',
  tagline: 'Leading Film & Digital Production Studio in Mumbai',
  copyrightText: '© 2026 MP Production. All rights reserved.',
  contactEmail: 'contact@mpproduction.com',
  contactPhone: '+91 831 053 1309',
  contactAddress: 'Andheri West, Mumbai, Maharashtra 400053',
  socialLinks: [
    { platform: 'instagram', url: 'https://instagram.com/mpproduction' },
    { platform: 'youtube', url: 'https://youtube.com/@mpproduction' },
    { platform: 'facebook', url: 'https://facebook.com/mpproduction' },
    { platform: 'linkedin', url: 'https://linkedin.com/company/mpproduction' },
  ],
};

export function DelegatedFooterManager() {
  const [footer, setFooter] = useState<FooterConfig>(DEFAULT_FOOTER);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await cms.getConfig<any>('footer');
      if (res.ok && res.data) {
        const val = typeof res.data === 'string' ? JSON.parse(res.data) : res.data;
        setFooter((prev) => ({
          companyName: val.companyName || prev.companyName,
          tagline: val.tagline || prev.tagline,
          copyrightText: val.copyright || val.copyrightText || prev.copyrightText,
          contactEmail: val.contactEmail || prev.contactEmail,
          contactPhone: val.contactPhone || prev.contactPhone,
          contactAddress: val.contactAddress || prev.contactAddress,
          socialLinks: Array.isArray(val.socialLinks)
            ? val.socialLinks
            : val.socialLinks
            ? Object.entries(val.socialLinks).map(([k, v]) => ({ platform: k, url: String(v) }))
            : prev.socialLinks,
        }));
      }
    } catch {
      // keep defaults
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    const linksObj: Record<string, string> = {};
    footer.socialLinks.forEach((l) => {
      if (l.platform && l.url) linksObj[l.platform.toLowerCase()] = l.url;
    });

    const payload = {
      ...footer,
      copyright: footer.copyrightText,
      socialLinks: linksObj,
    };

    try {
      const res = await cms.setConfig('footer', payload);
      if (res.ok) {
        toast.success('Footer details updated and live across the entire website.');
      } else {
        toast.error(res.error || 'Failed to update footer.');
      }
    } catch (e: any) {
      toast.error(e?.message || 'Error saving footer config.');
    } finally {
      setSaving(false);
    }
  };

  const addSocial = () => {
    setFooter((prev) => ({
      ...prev,
      socialLinks: [...prev.socialLinks, { platform: 'twitter', url: 'https://' }],
    }));
  };

  const removeSocial = (idx: number) => {
    setFooter((prev) => ({
      ...prev,
      socialLinks: prev.socialLinks.filter((_, i) => i !== idx),
    }));
  };

  const updateSocial = (idx: number, field: 'platform' | 'url', val: string) => {
    setFooter((prev) => {
      const copy = [...prev.socialLinks];
      copy[idx] = { ...copy[idx], [field]: val };
      return { ...prev, socialLinks: copy };
    });
  };

  return (
    <div className="bg-card border border-border rounded-2xl p-5 shadow-xs space-y-6">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/70 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <LayoutTemplate className="w-5 h-5 text-cyan-500" />
            <h3 className="font-serif font-bold text-lg text-foreground">
              Footer Details & Social Links CMS
            </h3>
            <span className="text-[10px] font-mono uppercase bg-cyan-500/10 text-cyan-500 font-bold px-2 py-0.5 rounded-full border border-cyan-500/20">
              Employee Delegated CRUD
            </span>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            Maintain public studio contacts, Mumbai headquarters address, social media links, and copyright text.
          </p>
        </div>

        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={loadData}
          disabled={loading || saving}
          className="text-xs self-start sm:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 mr-1 ${loading ? 'animate-spin' : ''}`} />
          Reload
        </Button>
      </div>

      {loading ? (
        <div className="py-12 flex flex-col items-center justify-center gap-2 text-muted-foreground">
          <Loader2 className="w-6 h-6 animate-spin text-brand" />
          <p className="text-xs">Loading current footer configuration...</p>
        </div>
      ) : (
        <form onSubmit={handleSave} className="space-y-6">
          {/* General Information */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground font-mono">
              General Identity & Legal
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="emp-footer-company" className="text-xs font-semibold">
                  Company / Studio Name *
                </Label>
                <Input
                  id="emp-footer-company"
                  value={footer.companyName}
                  onChange={(e) => setFooter({ ...footer, companyName: e.target.value })}
                  placeholder="MP Production"
                  required
                  className="text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="emp-footer-copy" className="text-xs font-semibold">
                  Copyright Notice
                </Label>
                <Input
                  id="emp-footer-copy"
                  value={footer.copyrightText}
                  onChange={(e) => setFooter({ ...footer, copyrightText: e.target.value })}
                  placeholder="© 2026 MP Production. All rights reserved."
                  className="text-xs"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="emp-footer-tagline" className="text-xs font-semibold">
                Studio Tagline / Mission
              </Label>
              <Textarea
                id="emp-footer-tagline"
                value={footer.tagline}
                onChange={(e) => setFooter({ ...footer, tagline: e.target.value })}
                placeholder="Leading Film & Digital Production Studio..."
                rows={2}
                className="text-xs"
              />
            </div>
          </div>

          {/* Contact Details */}
          <div className="space-y-4 pt-2 border-t border-border">
            <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground font-mono">
              Public Studio Contacts
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="emp-footer-email" className="text-xs font-semibold flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-muted-foreground" />
                  Contact Email
                </Label>
                <Input
                  id="emp-footer-email"
                  type="email"
                  value={footer.contactEmail}
                  onChange={(e) => setFooter({ ...footer, contactEmail: e.target.value })}
                  placeholder="contact@mpproduction.com"
                  className="text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="emp-footer-phone" className="text-xs font-semibold flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-muted-foreground" />
                  Phone / WhatsApp
                </Label>
                <Input
                  id="emp-footer-phone"
                  value={footer.contactPhone}
                  onChange={(e) => setFooter({ ...footer, contactPhone: e.target.value })}
                  placeholder="+91 831 053 1309"
                  className="text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="emp-footer-addr" className="text-xs font-semibold flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-muted-foreground" />
                  Mumbai Studio Address
                </Label>
                <Input
                  id="emp-footer-addr"
                  value={footer.contactAddress}
                  onChange={(e) => setFooter({ ...footer, contactAddress: e.target.value })}
                  placeholder="Andheri West, Mumbai, India"
                  className="text-xs"
                />
              </div>
            </div>
          </div>

          {/* Social Links */}
          <div className="space-y-4 pt-2 border-t border-border">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground font-mono">
                  Official Social Channel Handles
                </h4>
                <p className="text-[11px] text-muted-foreground">
                  Links displayed in the studio footer and mobile menu.
                </p>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addSocial}
                className="text-xs"
              >
                <Plus className="w-3.5 h-3.5 mr-1" /> Add Social Handle
              </Button>
            </div>

            <div className="space-y-2.5">
              {footer.socialLinks.map((link, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <Input
                    value={link.platform}
                    onChange={(e) => updateSocial(idx, 'platform', e.target.value)}
                    placeholder="platform (e.g. instagram, youtube)"
                    className="w-1/3 text-xs"
                  />
                  <Input
                    value={link.url}
                    onChange={(e) => updateSocial(idx, 'url', e.target.value)}
                    placeholder="https://..."
                    className="flex-1 text-xs"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeSocial(idx)}
                    className="h-8 w-8 p-0 text-destructive hover:bg-destructive/10 shrink-0"
                    title="Remove link"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              ))}
            </div>
          </div>

          {/* Save Button */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
            <Button
              type="submit"
              disabled={saving}
              className="bg-brand hover:bg-brand/90 text-white font-semibold text-xs px-5"
            >
              {saving ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 mr-2 animate-spin" />
                  Updating Footer Live...
                </>
              ) : (
                <>
                  <Save className="w-3.5 h-3.5 mr-2" />
                  Save Footer Changes
                </>
              )}
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}
