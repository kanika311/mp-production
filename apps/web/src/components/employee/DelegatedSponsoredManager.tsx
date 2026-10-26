'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { cms } from '@/lib/cms/client';
import { toast } from 'sonner';
import { 
  Sparkles, Plus, Trash2, Edit2, Check, X, 
  ExternalLink, Loader2, Save, Eye, RefreshCw 
} from 'lucide-react';
import Image from 'next/image';

export interface SponsoredPartner {
  id: string;
  title: string;
  tagline?: string;
  description: string;
  imageUrl: string;
  linkUrl: string;
  badge: string;
  ctaText: string;
  isPublished?: boolean;
}

const DEFAULT_ITEMS: SponsoredPartner[] = [
  {
    id: 'sp-1',
    title: 'RED Digital Cinema',
    tagline: 'Official 8K Camera Rental Partner',
    description: 'Special 15% equipment discount for all MP Production certified shoots, casting reels, and creators.',
    imageUrl: '/assets/project-commercial.webp',
    linkUrl: 'https://www.red.com',
    badge: 'OFFICIAL PARTNER',
    ctaText: 'Explore Gear ↗',
    isPublished: true,
  },
  {
    id: 'sp-2',
    title: 'DaVinci Resolve Studio',
    tagline: 'Hollywood Grade Color Suite',
    description: 'Industry-standard color grading and Fairlight audio post-production pipeline.',
    imageUrl: '/assets/service_post_production.webp',
    linkUrl: 'https://www.blackmagicdesign.com',
    badge: 'PROMO DEAL',
    ctaText: 'Learn More ↗',
    isPublished: true,
  },
  {
    id: 'sp-3',
    title: 'ARRI Alexa 35 Suite',
    tagline: 'Premium Cinema Prime Packages',
    description: 'Full anamorphic lens kits and high-speed motion rigs available on demand.',
    imageUrl: '/assets/service_production.webp',
    linkUrl: 'https://www.arri.com',
    badge: 'EXCLUSIVE GEAR',
    ctaText: 'View Packages ↗',
    isPublished: true,
  },
];

export function DelegatedSponsoredManager() {
  const [items, setItems] = useState<SponsoredPartner[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form state for new or edit
  const [formData, setFormData] = useState<SponsoredPartner>({
    id: '',
    title: '',
    tagline: '',
    description: '',
    imageUrl: '',
    linkUrl: '',
    badge: 'OFFICIAL PARTNER',
    ctaText: 'Learn More ↗',
    isPublished: true,
  });

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await cms.getConfig<any>('sponsored');
      if (res.ok && res.data) {
        const val = typeof res.data === 'string' ? JSON.parse(res.data) : res.data;
        const list = Array.isArray(val?.items) ? val.items : Array.isArray(val) ? val : [];
        if (list.length > 0) {
          setItems(list);
        } else {
          setItems(DEFAULT_ITEMS);
        }
      } else {
        setItems(DEFAULT_ITEMS);
      }
    } catch {
      setItems(DEFAULT_ITEMS);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSaveToBackend = async (newItems: SponsoredPartner[]) => {
    setSaving(true);
    try {
      const res = await cms.setConfig('sponsored', { items: newItems });
      if (res.ok) {
        toast.success('Sponsored campaigns saved successfully.');
      } else {
        toast.error(res.error || 'Failed to save changes.');
      }
    } catch (e: any) {
      toast.error(e?.message || 'Error communicating with CMS API.');
    } finally {
      setSaving(false);
    }
  };

  const startNew = () => {
    const newId = `sp-${Date.now()}`;
    setFormData({
      id: newId,
      title: '',
      tagline: '',
      description: '',
      imageUrl: '/assets/project-commercial.webp',
      linkUrl: 'https://',
      badge: 'SPONSORED',
      ctaText: 'Learn More ↗',
      isPublished: true,
    });
    setEditingId(newId);
  };

  const startEdit = (item: SponsoredPartner) => {
    setFormData({ ...item });
    setEditingId(item.id);
  };

  const cancelEdit = () => {
    setEditingId(null);
  };

  const saveFormItem = async () => {
    if (!formData.title.trim()) {
      toast.error('Title is required.');
      return;
    }

    let updated: SponsoredPartner[];
    const exists = items.some((it) => it.id === formData.id);
    if (exists) {
      updated = items.map((it) => (it.id === formData.id ? { ...formData } : it));
    } else {
      updated = [...items, { ...formData }];
    }

    setItems(updated);
    setEditingId(null);
    await handleSaveToBackend(updated);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this sponsored campaign?')) return;
    const updated = items.filter((it) => it.id !== id);
    setItems(updated);
    if (editingId === id) setEditingId(null);
    await handleSaveToBackend(updated);
  };

  const togglePublish = async (id: string) => {
    const updated = items.map((it) =>
      it.id === id ? { ...it, isPublished: !it.isPublished } : it
    );
    setItems(updated);
    await handleSaveToBackend(updated);
  };

  return (
    <div className="bg-card border border-border rounded-2xl p-5 shadow-xs space-y-6">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/70 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-pink-500" />
            <h3 className="font-serif font-bold text-lg text-foreground">
              Sponsored Ads & Brand Partnerships
            </h3>
            <span className="text-[10px] font-mono uppercase bg-emerald-500/10 text-emerald-500 font-bold px-2 py-0.5 rounded-full border border-emerald-500/20">
              Employee Delegated CRUD
            </span>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            Add, update, or unpublish sidebar sponsored creatives directly without super-admin credentials.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={loadData}
            disabled={loading || saving}
            className="text-xs"
          >
            <RefreshCw className={`w-3.5 h-3.5 mr-1 ${loading ? 'animate-spin' : ''}`} />
            Reload
          </Button>

          <Button
            type="button"
            size="sm"
            onClick={startNew}
            disabled={editingId !== null || saving}
            className="text-xs bg-amber-500 hover:bg-amber-400 text-black font-semibold"
          >
            <Plus className="w-3.5 h-3.5 mr-1" />
            Add New Partner
          </Button>
        </div>
      </div>

      {/* Editor Form Modal / Card */}
      {editingId && (
        <div className="p-5 bg-card/90 border-2 border-brand/40 rounded-2xl shadow-md space-y-4 animate-in fade-in duration-200">
          <div className="flex items-center justify-between border-b border-border pb-2.5">
            <h4 className="font-bold text-sm text-foreground flex items-center gap-2">
              <Edit2 className="w-4 h-4 text-brand" />
              <span>{items.some((i) => i.id === editingId) ? 'Edit Campaign' : 'Create New Campaign'}</span>
            </h4>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={cancelEdit}
              className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="sp-title" className="text-xs font-semibold">
                Partner Title / Brand Name *
              </Label>
              <Input
                id="sp-title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g. RED Digital Cinema"
                className="text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="sp-tagline" className="text-xs font-semibold">
                Tagline / Highlight
              </Label>
              <Input
                id="sp-tagline"
                value={formData.tagline || ''}
                onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
                placeholder="e.g. Official 8K Camera Rental Partner"
                className="text-xs"
              />
            </div>

            <div className="space-y-1.5 md:col-span-2">
              <Label htmlFor="sp-desc" className="text-xs font-semibold">
                Description Text
              </Label>
              <Textarea
                id="sp-desc"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Brief campaign overview, perks, or promotional offering..."
                rows={2}
                className="text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="sp-img" className="text-xs font-semibold">
                Background Image URL
              </Label>
              <Input
                id="sp-img"
                value={formData.imageUrl}
                onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                placeholder="/assets/project-commercial.webp or https://..."
                className="text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="sp-link" className="text-xs font-semibold">
                Destination Link URL *
              </Label>
              <Input
                id="sp-link"
                value={formData.linkUrl}
                onChange={(e) => setFormData({ ...formData, linkUrl: e.target.value })}
                placeholder="https://..."
                className="text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="sp-badge" className="text-xs font-semibold">
                Badge Label
              </Label>
              <Input
                id="sp-badge"
                value={formData.badge}
                onChange={(e) => setFormData({ ...formData, badge: e.target.value })}
                placeholder="OFFICIAL PARTNER / PROMO DEAL"
                className="text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="sp-cta" className="text-xs font-semibold">
                CTA Button Text
              </Label>
              <Input
                id="sp-cta"
                value={formData.ctaText}
                onChange={(e) => setFormData({ ...formData, ctaText: e.target.value })}
                placeholder="Explore Gear ↗"
                className="text-xs"
              />
            </div>
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-border">
            <label className="flex items-center gap-2 text-xs font-medium cursor-pointer">
              <input
                type="checkbox"
                checked={formData.isPublished !== false}
                onChange={(e) => setFormData({ ...formData, isPublished: e.target.checked })}
                className="rounded border-border accent-amber-500 w-4 h-4 cursor-pointer"
              />
              <span className="text-foreground">Published (Active on Website Sidebar)</span>
            </label>

            <div className="flex items-center gap-2">
              <Button type="button" variant="outline" size="sm" onClick={cancelEdit} className="text-xs">
                Cancel
              </Button>
              <Button
                type="button"
                size="sm"
                onClick={saveFormItem}
                disabled={saving}
                className="text-xs bg-brand hover:bg-brand/90 text-white font-semibold"
              >
                {saving ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-3.5 h-3.5 mr-1.5" />
                    Save Campaign
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Campaigns Listing */}
      {loading ? (
        <div className="py-12 flex flex-col items-center justify-center gap-2 text-muted-foreground">
          <Loader2 className="w-6 h-6 animate-spin text-brand" />
          <p className="text-xs">Loading active campaigns...</p>
        </div>
      ) : items.length === 0 ? (
        <div className="p-8 text-center border border-dashed border-border rounded-xl space-y-3">
          <Sparkles className="w-8 h-8 text-muted-foreground mx-auto" />
          <p className="text-xs text-muted-foreground">No sponsored ads configured yet.</p>
          <Button size="sm" onClick={startNew} className="text-xs">
            <Plus className="w-3.5 h-3.5 mr-1" /> Add First Partner
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map((item, idx) => (
            <div
              key={item.id || idx}
              className={`border rounded-2xl overflow-hidden transition-all flex flex-col justify-between ${
                item.isPublished !== false
                  ? 'border-border bg-card/60 shadow-xs hover:border-brand/40'
                  : 'border-dashed border-border/60 bg-muted/20 opacity-70'
              }`}
            >
              <div className="p-4 space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-500 border border-amber-500/20">
                    {item.badge || 'PARTNER'}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => togglePublish(item.id)}
                      title={item.isPublished !== false ? 'Click to unpublish' : 'Click to publish'}
                      className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold cursor-pointer transition-colors ${
                        item.isPublished !== false
                          ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                          : 'bg-zinc-800 text-zinc-400 border border-zinc-700'
                      }`}
                    >
                      {item.isPublished !== false ? '● Live' : '○ Paused'}
                    </button>
                  </div>
                </div>

                <div>
                  <h4 className="font-serif font-bold text-sm text-foreground line-clamp-1">
                    {item.title}
                  </h4>
                  {item.tagline && (
                    <p className="text-[11px] font-medium text-amber-500 line-clamp-1">
                      {item.tagline}
                    </p>
                  )}
                </div>

                <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                  {item.description || 'No description provided.'}
                </p>

                {item.imageUrl && (
                  <div className="relative w-full h-24 rounded-lg overflow-hidden bg-black/40 border border-border/40">
                    <Image
                      src={item.imageUrl}
                      alt={item.title}
                      fill
                      className="object-cover brightness-75 hover:scale-105 transition-transform"
                    />
                  </div>
                )}
              </div>

              {/* Action buttons footer */}
              <div className="p-3 bg-muted/30 border-t border-border flex items-center justify-between">
                <a
                  href={item.linkUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 text-[11px] text-muted-foreground hover:text-foreground font-mono"
                >
                  <span className="truncate max-w-[120px]">{item.linkUrl.replace(/^https?:\/\//, '')}</span>
                  <ExternalLink className="w-3 h-3" />
                </a>

                <div className="flex items-center gap-1">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => startEdit(item)}
                    className="h-7 px-2 text-xs hover:bg-brand/10 hover:text-brand"
                    title="Edit Partner"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(item.id)}
                    className="h-7 px-2 text-xs text-destructive hover:bg-destructive/10"
                    title="Delete Partner"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
