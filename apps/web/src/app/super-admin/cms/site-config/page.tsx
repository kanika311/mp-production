'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { cms } from '@/lib/cms/client';
import { toast } from 'sonner';
import { Loader2, Save, Plus, Trash2, X, Image as ImageIcon } from 'lucide-react';
import { MediaLibrary } from '@/components/admin/MediaLibrary';

type Tab = 'hero' | 'stats' | 'pricing' | 'navbar' | 'footer' | 'seo' | 'showreels' | 'sponsored';

function SiteConfigContent() {
  const searchParams = useSearchParams();
  const tabParam = searchParams ? searchParams.get('tab') : null;
  const validTabs: Tab[] = ['hero', 'stats', 'pricing', 'navbar', 'footer', 'seo', 'showreels', 'sponsored'];
  const initialTab: Tab = tabParam && validTabs.includes(tabParam as Tab) 
    ? (tabParam as Tab) 
    : 'hero';

  const [activeTab, setActiveTab] = useState<Tab>(initialTab);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  
  useEffect(() => {
    if (tabParam && validTabs.includes(tabParam as Tab)) {
      setActiveTab(tabParam as Tab);
    }
  }, [tabParam]);

  // Media library picker state
  const [mediaOpen, setMediaOpen] = useState(false);
  const [mediaTarget, setMediaTarget] = useState<string | null>(null);

  // Form states
  const [hero, setHero] = useState({
    heading: '',
    subheading: '',
    ctaText: '',
    ctaUrl: '',
    backgroundImage: '',
  });

  const [stats, setStats] = useState<Array<{ label: string; value: string }>>([]);

  const [pricing, setPricing] = useState<Array<{ name: string; price: string; period?: string; description?: string; highlighted?: boolean; cta?: string; features: string[] }>>([]);

  const [navbar, setNavbar] = useState({
    logoUrl: '/logo.png',
    siteTitle: 'MP Productions',
    sticky: true,
    links: [
      { label: 'HOME', href: '/' },
      { label: 'PORTFOLIO', href: '/portfolio' },
      { label: 'SERVICES', href: '/services' },
      { label: 'TALENT', href: '/talent' },
      { label: 'PROJECTS', href: '/projects' },
      { label: 'CONTACT', href: '/contact' },
    ] as Array<{ label: string; href: string }>,
    ctaText: 'Apply as Talent',
    ctaUrl: '/join/talent',
  });

  const [footer, setFooter] = useState({
    companyName: 'MP Production',
    tagline: 'Crafting Cinematic Excellence & Digital Legacies.',
    copyrightText: 'Powered By JCRM Technologies',
    contactEmail: 'hello@mpproduction.com',
    contactPhone: '+91 831 053 1309',
    contactAddress: 'Mumbai, India',
    socialLinks: [
      { platform: 'instagram', url: 'https://instagram.com/mpproduction' },
      { platform: 'linkedin', url: 'https://linkedin.com/company/mpproduction' },
      { platform: 'youtube', url: 'https://youtube.com/mpproduction' }
    ] as Array<{ platform: string; url: string }>,
    sections: [
      {
        title: "Company",
        links: [
          { label: "About Us", href: "/about" },
          { label: "Services", href: "/services" },
          { label: "Meet the Team", href: "/team" },
          { label: "Testimonials", href: "/testimonials" },
          { label: "Careers", href: "/careers" },
          { label: "Blog", href: "/blog" },
        ],
      },
      {
        title: "Network & Work",
        links: [
          { label: "Portfolio", href: "/portfolio" },
          { label: "Showreels", href: "/reel" },
          { label: "Pricing", href: "/pricing" },
          { label: "Talent Directory", href: "/talent/directory" },
          { label: "Join as Talent", href: "/join/talent" },
          { label: "Client Portal", href: "/client-portal" },
          { label: "Editor Portal", href: "/editor-portal" },
        ],
      },
      {
        title: "Support & Legal",
        links: [
          { label: "Contact Us", href: "/contact" },
          { label: "FAQs", href: "/faq" },
          { label: "Live Chat", href: "/contact" },
          { label: "Privacy Policy", href: "/privacy" },
          { label: "Terms of Service", href: "/terms" },
          { label: "Security & Compliance", href: "/security" },
          { label: "Help Center", href: "/help" },
        ],
      },
    ] as Array<{ title: string; links: Array<{ label: string; href: string }> }>,
  });

  const [seo, setSeo] = useState({
    siteTitle: '',
    metaDescription: '',
    keywords: '',
    ogImage: '',
  });

  const [showreels, setShowreels] = useState<Array<{
    id: string;
    title: string;
    category: string;
    description: string;
    videoUrl: string;
    coverImage: string;
    duration: string;
    camera: string;
    lenses: string;
    colorGrade: string;
  }>>([]);

  const [sponsored, setSponsored] = useState<Array<{
    id: string;
    title: string;
    tagline: string;
    description: string;
    imageUrl: string;
    linkUrl: string;
    badge: string;
    ctaText: string;
    isPublished: boolean;
  }>>([]);

  const loadConfig = async (tab: Tab) => {
    setLoading(true);
    try {
      const configKey = tab === 'navbar' ? 'navigation' : tab;
      const res = await cms.getConfig<any>(configKey);
      if (res.ok && res.data) {
        const val = typeof res.data === 'string' ? JSON.parse(res.data) : res.data;
        if (tab === 'hero') {
          setHero({
            heading: val.heading || '',
            subheading: val.subheading || '',
            ctaText: val.ctaText || '',
            ctaUrl: val.ctaUrl || '',
            backgroundImage: val.backgroundImage || '',
          });
        } else if (tab === 'stats') {
          setStats(Array.isArray(val) ? val : []);
        } else if (tab === 'pricing') {
          if (Array.isArray(val)) {
            setPricing(val);
          } else if (val && typeof val === 'object' && Array.isArray(val.tiers)) {
            setPricing(val.tiers);
          } else {
            setPricing([]);
          }
        } else if (tab === 'navbar') {
          if (Array.isArray(val)) {
            setNavbar(prev => ({
              ...prev,
              links: val.map((item: any) => ({ label: item.label || item.title || '', href: item.href || item.url || '/' }))
            }));
          } else if (val && typeof val === 'object') {
            setNavbar(prev => ({
              ...prev,
              ...val,
              links: Array.isArray(val.links) ? val.links.map((item: any) => ({ label: item.label || item.title || '', href: item.href || item.url || '/' })) : prev.links
            }));
          }
        } else if (tab === 'footer') {
          setFooter(prev => ({
            ...prev,
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
            sections: Array.isArray(val.sections) ? val.sections : prev.sections,
          }));
        } else if (tab === 'seo') {
          setSeo({
            siteTitle: val.siteTitle || '',
            metaDescription: val.metaDescription || '',
            keywords: val.keywords || '',
            ogImage: val.ogImage || '',
          });
        } else if (tab === 'showreels') {
          setShowreels(Array.isArray(val) ? val : []);
        } else if (tab === 'sponsored') {
          const list = Array.isArray(val?.items) ? val.items : Array.isArray(val) ? val : [];
          setSponsored(list);
        }
      }
    } catch {
      toast.error(`Failed to load ${tab} configuration.`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadConfig(activeTab);
  }, [activeTab]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    let payload: unknown = null;
    let configKey = activeTab as string;
    if (activeTab === 'hero') payload = hero;
    else if (activeTab === 'stats') payload = stats;
    else if (activeTab === 'pricing') payload = { tiers: pricing };
    else if (activeTab === 'navbar') {
      configKey = 'navigation';
      payload = navbar;
    }
    else if (activeTab === 'footer') {
      const linksObj: Record<string, string> = {};
      footer.socialLinks.forEach(l => {
        if (l.platform && l.url) linksObj[l.platform] = l.url;
      });
      payload = {
        ...footer,
        copyright: footer.copyrightText,
        socialLinks: linksObj,
      };
    }
    else if (activeTab === 'seo') payload = seo;
    else if (activeTab === 'showreels') payload = showreels;
    else if (activeTab === 'sponsored') payload = { items: sponsored };

    try {
      const res = await cms.setConfig(configKey, payload);
      if (res.ok) {
        toast.success(`Configuration for ${activeTab.toUpperCase()} updated successfully.`);
      } else {
        toast.error(res.error || 'Failed to save configuration.');
      }
    } catch {
      toast.error('Network error during save.');
    } finally {
      setSaving(false);
    }
  };

  const triggerMediaPicker = (field: string) => {
    setMediaTarget(field);
    setMediaOpen(true);
  };

  const handleMediaSelect = (url: string) => {
    if (mediaTarget === 'heroBg') {
      setHero(prev => ({ ...prev, backgroundImage: url }));
    } else if (mediaTarget === 'navbarLogo') {
      setNavbar(prev => ({ ...prev, logoUrl: url }));
    } else if (mediaTarget === 'seoOg') {
      setSeo(prev => ({ ...prev, ogImage: url }));
    } else if (mediaTarget?.startsWith('reelCover-')) {
      const idx = parseInt(mediaTarget.split('-')[1]);
      const copy = [...showreels];
      copy[idx].coverImage = url;
      setShowreels(copy);
    } else if (mediaTarget?.startsWith('sponsorImg-')) {
      const idx = parseInt(mediaTarget.split('-')[1]);
      const copy = [...sponsored];
      copy[idx].imageUrl = url;
      setSponsored(copy);
    }
    setMediaOpen(false);
    setMediaTarget(null);
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto p-4 sm:p-6">
      <div className="flex flex-col gap-2">
        <span className="text-primary tracking-widest text-xs uppercase font-semibold">Settings</span>
        <h1 className="text-3xl sm:text-4xl font-serif">Site Configuration</h1>
        <p className="text-muted-foreground text-sm font-light">
          Manage landing page copy, statistics, pricing tiers, social links, and metadata.
        </p>
      </div>

      {/* Tabs list */}
      <div className="flex border-b border-border overflow-x-auto gap-4 scrollbar-none">
        {(['hero', 'stats', 'pricing', 'navbar', 'footer', 'seo', 'showreels', 'sponsored'] as Tab[]).map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setActiveTab(tab)}
            className={`py-3 px-1 border-b-2 text-sm uppercase tracking-wider font-semibold transition-all whitespace-nowrap ${
              activeTab === tab
                ? 'border-primary text-primary font-bold'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            {tab === 'sponsored' ? 'Sponsored Partners' : tab}
          </button>
        ))}
      </div>

      {/* Forms Content */}
      <div className="bg-surface border border-border rounded-2xl p-6 shadow-sm">
        {loading ? (
          <div className="flex items-center justify-center py-20 text-muted-foreground">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : (
          <form onSubmit={handleSave} className="space-y-6">
            
            {/* HERO FORM */}
            {activeTab === 'hero' && (
              <div className="space-y-4">
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="hero-heading">Heading</Label>
                  <Input
                    id="hero-heading"
                    value={hero.heading}
                    onChange={(e) => setHero(prev => ({ ...prev, heading: e.target.value }))}
                    placeholder="Enter hero main heading"
                    required
                  />
                </div>
                
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="hero-subheading">Subheading</Label>
                  <Textarea
                    id="hero-subheading"
                    value={hero.subheading}
                    onChange={(e) => setHero(prev => ({ ...prev, subheading: e.target.value }))}
                    placeholder="Enter secondary details"
                    rows={4}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="hero-ctaText">CTA Button Text</Label>
                    <Input
                      id="hero-ctaText"
                      value={hero.ctaText}
                      onChange={(e) => setHero(prev => ({ ...prev, ctaText: e.target.value }))}
                      placeholder="e.g. Get Started"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="hero-ctaUrl">CTA Destination URL</Label>
                    <Input
                      id="hero-ctaUrl"
                      value={hero.ctaUrl}
                      onChange={(e) => setHero(prev => ({ ...prev, ctaUrl: e.target.value }))}
                      placeholder="e.g. /contact"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="hero-bgImage">Background Image URL</Label>
                  <div className="flex gap-2">
                    <Input
                      id="hero-bgImage"
                      value={hero.backgroundImage}
                      onChange={(e) => setHero(prev => ({ ...prev, backgroundImage: e.target.value }))}
                      placeholder="Select background image"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => triggerMediaPicker('heroBg')}
                      className="px-3"
                    >
                      <ImageIcon className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* STATS FORM */}
            {activeTab === 'stats' && (
              <div className="space-y-4">
                <div className="flex justify-between items-center pb-2 border-b border-border">
                  <h3 className="text-sm uppercase tracking-wider font-semibold">Stats Items</h3>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setStats(prev => [...prev, { label: '', value: '' }])}
                  >
                    <Plus className="w-4 h-4 mr-2" /> Add Stat
                  </Button>
                </div>
                
                {stats.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-6">No stats item added. Add one above.</p>
                ) : (
                  <div className="space-y-3">
                    {stats.map((s, idx) => (
                      <div key={idx} className="flex gap-4 items-end border border-border/50 p-4 rounded-xl relative group bg-background/30">
                        <div className="flex-1 grid grid-cols-2 gap-4">
                          <div className="flex flex-col gap-1.5">
                            <Label>Label</Label>
                            <Input
                              value={s.label}
                              onChange={(e) => {
                                const copy = [...stats];
                                copy[idx].label = e.target.value;
                                setStats(copy);
                              }}
                              placeholder="e.g. Projects Completed"
                              required
                            />
                          </div>
                          <div className="flex flex-col gap-1.5">
                            <Label>Value</Label>
                            <Input
                              value={s.value}
                              onChange={(e) => {
                                const copy = [...stats];
                                copy[idx].value = e.target.value;
                                setStats(copy);
                              }}
                              placeholder="e.g. 250+"
                              required
                            />
                          </div>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => setStats(prev => prev.filter((_, i) => i !== idx))}
                          className="text-destructive hover:bg-destructive/10"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* PRICING FORM */}
            {activeTab === 'pricing' && (
              <div className="space-y-4">
                <div className="flex justify-between items-center pb-2 border-b border-border">
                  <h3 className="text-sm uppercase tracking-wider font-semibold">Pricing Cards</h3>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setPricing(prev => [...prev, { name: '', price: '', period: '', description: '', highlighted: false, cta: 'Get Started', features: [''] }])}
                  >
                    <Plus className="w-4 h-4 mr-2" /> Add Tier
                  </Button>
                </div>

                {pricing.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-6">No pricing tiers added.</p>
                ) : (
                  <div className="space-y-4">
                    {pricing.map((tier, idx) => (
                      <div key={idx} className="border border-border p-4 rounded-xl space-y-4 bg-background/30 relative">
                        <div className="absolute top-4 right-4">
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => setPricing(prev => prev.filter((_, i) => i !== idx))}
                            className="text-destructive hover:bg-destructive/10"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-[85%]">
                          <div className="flex flex-col gap-1.5">
                            <Label>Tier Name</Label>
                            <Input
                              value={tier.name}
                              onChange={(e) => {
                                const copy = [...pricing];
                                copy[idx].name = e.target.value;
                                setPricing(copy);
                              }}
                              placeholder="e.g. Essential"
                              required
                            />
                          </div>
                          <div className="flex flex-col gap-1.5">
                            <Label>Price</Label>
                            <Input
                              value={tier.price}
                              onChange={(e) => {
                                const copy = [...pricing];
                                copy[idx].price = e.target.value;
                                setPricing(copy);
                              }}
                              placeholder="e.g. ₹1.5L"
                              required
                            />
                          </div>
                          <div className="flex flex-col gap-1.5">
                            <Label>Period <span className="text-muted-foreground text-xs">(optional)</span></Label>
                            <Input
                              value={tier.period || ''}
                              onChange={(e) => {
                                const copy = [...pricing];
                                copy[idx].period = e.target.value;
                                setPricing(copy);
                              }}
                              placeholder="e.g. per project"
                            />
                          </div>
                          <div className="flex flex-col gap-1.5">
                            <Label>CTA Button Text</Label>
                            <Input
                              value={tier.cta || ''}
                              onChange={(e) => {
                                const copy = [...pricing];
                                copy[idx].cta = e.target.value;
                                setPricing(copy);
                              }}
                              placeholder="e.g. Get Started"
                            />
                          </div>
                        </div>
                        <div className="max-w-[85%] space-y-4">
                          <div className="flex flex-col gap-1.5">
                            <Label>Description <span className="text-muted-foreground text-xs">(optional)</span></Label>
                            <Input
                              value={tier.description || ''}
                              onChange={(e) => {
                                const copy = [...pricing];
                                copy[idx].description = e.target.value;
                                setPricing(copy);
                              }}
                              placeholder="Short description of this tier"
                            />
                          </div>
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={tier.highlighted || false}
                              onChange={(e) => {
                                const copy = [...pricing];
                                copy[idx].highlighted = e.target.checked;
                                setPricing(copy);
                              }}
                              className="rounded border-border"
                            />
                            <span className="text-sm font-medium">Highlight this tier (show as recommended)</span>
                          </label>
                        </div>

                        {/* Features Repeater */}
                        <div className="space-y-2">
                          <div className="flex justify-between items-center">
                            <Label className="text-xs uppercase tracking-wider font-semibold">Features</Label>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                const copy = [...pricing];
                                copy[idx].features.push('');
                                setPricing(copy);
                              }}
                              className="text-xs py-1 px-2 h-7"
                            >
                              Add Feature
                            </Button>
                          </div>
                          {tier.features.map((feat, fidx) => (
                            <div key={fidx} className="flex gap-2 items-center">
                              <Input
                                value={feat}
                                onChange={(e) => {
                                  const copy = [...pricing];
                                  copy[idx].features[fidx] = e.target.value;
                                  setPricing(copy);
                                }}
                                placeholder="Feature details"
                                className="h-9 text-sm"
                                required
                              />
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                onClick={() => {
                                  const copy = [...pricing];
                                  copy[idx].features = copy[idx].features.filter((_, fi) => fi !== fidx);
                                  setPricing(copy);
                                }}
                                className="w-9 h-9 p-0 text-destructive hover:bg-destructive/10"
                                disabled={tier.features.length <= 1}
                              >
                                <X className="w-3.5 h-3.5" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* NAVBAR FORM */}
            {activeTab === 'navbar' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="navbar-logo">Logo Image URL</Label>
                    <div className="flex gap-2">
                      <Input
                        id="navbar-logo"
                        value={navbar.logoUrl}
                        onChange={(e) => setNavbar(prev => ({ ...prev, logoUrl: e.target.value }))}
                        placeholder="/logo.png"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => triggerMediaPicker('navbarLogo')}
                        className="px-3"
                      >
                        <ImageIcon className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="navbar-title">Site Brand Title</Label>
                    <Input
                      id="navbar-title"
                      value={navbar.siteTitle}
                      onChange={(e) => setNavbar(prev => ({ ...prev, siteTitle: e.target.value }))}
                      placeholder="MP Productions"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="navbar-cta-text">CTA Button Text</Label>
                    <Input
                      id="navbar-cta-text"
                      value={navbar.ctaText}
                      onChange={(e) => setNavbar(prev => ({ ...prev, ctaText: e.target.value }))}
                      placeholder="Apply as Talent"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="navbar-cta-url">CTA Button URL</Label>
                    <Input
                      id="navbar-cta-url"
                      value={navbar.ctaUrl}
                      onChange={(e) => setNavbar(prev => ({ ...prev, ctaUrl: e.target.value }))}
                      placeholder="/join/talent"
                    />
                  </div>
                </div>

                <div className="space-y-3 pt-2">
                  <div className="flex justify-between items-center border-b border-border pb-1.5">
                    <Label className="text-sm font-semibold">Navigation Links</Label>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setNavbar(prev => ({ ...prev, links: [...prev.links, { label: '', href: '/' }] }))}
                    >
                      <Plus className="w-4 h-4 mr-2" /> Add Link
                    </Button>
                  </div>

                  {navbar.links.length === 0 ? (
                    <p className="text-xs text-muted-foreground text-center py-4">No navigation items configured.</p>
                  ) : (
                    <div className="space-y-2">
                      {navbar.links.map((link, idx) => (
                        <div key={idx} className="flex gap-4 items-center">
                          <Input
                            value={link.label}
                            onChange={(e) => {
                              const copy = [...navbar.links];
                              copy[idx].label = e.target.value.toUpperCase();
                              setNavbar(prev => ({ ...prev, links: copy }));
                            }}
                            placeholder="e.g. PORTFOLIO"
                            className="w-[180px]"
                            required
                          />
                          <Input
                            value={link.href}
                            onChange={(e) => {
                              const copy = [...navbar.links];
                              copy[idx].href = e.target.value;
                              setNavbar(prev => ({ ...prev, links: copy }));
                            }}
                            placeholder="/portfolio"
                            className="flex-1"
                            required
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => setNavbar(prev => ({ ...prev, links: prev.links.filter((_, i) => i !== idx) }))}
                            className="text-destructive hover:bg-destructive/10"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* FOOTER FORM */}
            {activeTab === 'footer' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="footer-company">Company Name</Label>
                    <Input
                      id="footer-company"
                      value={footer.companyName}
                      onChange={(e) => setFooter(prev => ({ ...prev, companyName: e.target.value }))}
                      placeholder="Company Name"
                      required
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="footer-copyright">Copyright Text</Label>
                    <Input
                      id="footer-copyright"
                      value={footer.copyrightText}
                      onChange={(e) => setFooter(prev => ({ ...prev, copyrightText: e.target.value }))}
                      placeholder="e.g. © 2026 MP Production."
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="footer-email">Contact Email</Label>
                    <Input
                      id="footer-email"
                      value={footer.contactEmail}
                      onChange={(e) => setFooter(prev => ({ ...prev, contactEmail: e.target.value }))}
                      placeholder="hello@mpproduction.com"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="footer-phone">Contact Phone</Label>
                    <Input
                      id="footer-phone"
                      value={footer.contactPhone}
                      onChange={(e) => setFooter(prev => ({ ...prev, contactPhone: e.target.value }))}
                      placeholder="+91 831 053 1309"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="footer-address">Office Locations / Address</Label>
                    <Input
                      id="footer-address"
                      value={footer.contactAddress}
                      onChange={(e) => setFooter(prev => ({ ...prev, contactAddress: e.target.value }))}
                      placeholder="Mumbai, India"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="footer-tagline">Tagline</Label>
                  <Textarea
                    id="footer-tagline"
                    value={footer.tagline}
                    onChange={(e) => setFooter(prev => ({ ...prev, tagline: e.target.value }))}
                    placeholder="Enter footer tagline text"
                    rows={2}
                  />
                </div>

                {/* Social links list */}
                <div className="space-y-3 pt-2">
                  <div className="flex justify-between items-center border-b border-border pb-1.5">
                    <Label className="text-sm font-semibold">Social Links</Label>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setFooter(prev => ({ ...prev, socialLinks: [...prev.socialLinks, { platform: '', url: '' }] }))}
                    >
                      <Plus className="w-4 h-4 mr-2" /> Add Link
                    </Button>
                  </div>

                  {footer.socialLinks.length === 0 ? (
                    <p className="text-xs text-muted-foreground text-center py-4">No social profiles configured.</p>
                  ) : (
                    <div className="space-y-2">
                      {footer.socialLinks.map((link, idx) => (
                        <div key={idx} className="flex gap-4 items-center">
                          <Input
                            value={link.platform}
                            onChange={(e) => {
                              const copy = [...footer.socialLinks];
                              copy[idx].platform = e.target.value.toLowerCase();
                              setFooter(prev => ({ ...prev, socialLinks: copy }));
                            }}
                            placeholder="e.g. instagram"
                            className="w-[180px]"
                            required
                          />
                          <Input
                            value={link.url}
                            onChange={(e) => {
                              const copy = [...footer.socialLinks];
                              copy[idx].url = e.target.value;
                              setFooter(prev => ({ ...prev, socialLinks: copy }));
                            }}
                            placeholder="Profile URL"
                            className="flex-1"
                            required
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => setFooter(prev => ({ ...prev, socialLinks: prev.socialLinks.filter((_, i) => i !== idx) }))}
                            className="text-destructive hover:bg-destructive/10"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Footer Columns / Sections */}
                <div className="space-y-4 pt-4 border-t border-border">
                  <div className="flex justify-between items-center">
                    <Label className="text-sm font-semibold">Footer Navigation Columns</Label>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setFooter(prev => ({ ...prev, sections: [...prev.sections, { title: 'New Section', links: [] }] }))}
                    >
                      <Plus className="w-4 h-4 mr-2" /> Add Column
                    </Button>
                  </div>

                  <div className="grid grid-cols-1 gap-4">
                    {footer.sections.map((section, sIdx) => (
                      <div key={sIdx} className="bg-background border border-border rounded-xl p-4 space-y-3">
                        <div className="flex gap-3 items-center justify-between">
                          <Input
                            value={section.title}
                            onChange={(e) => {
                              const copy = [...footer.sections];
                              copy[sIdx].title = e.target.value;
                              setFooter(prev => ({ ...prev, sections: copy }));
                            }}
                            placeholder="Column Header (e.g. Company)"
                            className="font-bold max-w-xs"
                          />
                          <div className="flex gap-2">
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                const copy = [...footer.sections];
                                copy[sIdx].links.push({ label: '', href: '/' });
                                setFooter(prev => ({ ...prev, sections: copy }));
                              }}
                            >
                              <Plus className="w-3.5 h-3.5 mr-1" /> Add Link
                            </Button>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={() => setFooter(prev => ({ ...prev, sections: prev.sections.filter((_, i) => i !== sIdx) }))}
                              className="text-destructive hover:bg-destructive/10"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>

                        <div className="space-y-2 pl-2 border-l-2 border-primary/20">
                          {section.links.map((link, lIdx) => (
                            <div key={lIdx} className="flex gap-2 items-center">
                              <Input
                                value={link.label}
                                onChange={(e) => {
                                  const copy = [...footer.sections];
                                  copy[sIdx].links[lIdx].label = e.target.value;
                                  setFooter(prev => ({ ...prev, sections: copy }));
                                }}
                                placeholder="Link Label"
                                className="w-[180px] text-sm"
                              />
                              <Input
                                value={link.href}
                                onChange={(e) => {
                                  const copy = [...footer.sections];
                                  copy[sIdx].links[lIdx].href = e.target.value;
                                  setFooter(prev => ({ ...prev, sections: copy }));
                                }}
                                placeholder="/path"
                                className="flex-1 text-sm"
                              />
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                onClick={() => {
                                  const copy = [...footer.sections];
                                  copy[sIdx].links = copy[sIdx].links.filter((_, i) => i !== lIdx);
                                  setFooter(prev => ({ ...prev, sections: copy }));
                                }}
                                className="text-destructive h-8 w-8"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* SEO CONFIG FORM */}
            {activeTab === 'seo' && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="seo-title">Site Base Title</Label>
                    <Input
                      id="seo-title"
                      value={seo.siteTitle}
                      onChange={(e) => setSeo(prev => ({ ...prev, siteTitle: e.target.value }))}
                      placeholder="e.g. MP Production — Film Studio"
                      required
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="seo-keywords">Keywords (Comma Separated)</Label>
                    <Input
                      id="seo-keywords"
                      value={seo.keywords}
                      onChange={(e) => setSeo(prev => ({ ...prev, keywords: e.target.value }))}
                      placeholder="e.g. cinematic, virtual production, casting"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="seo-desc">Meta Description</Label>
                  <Textarea
                    id="seo-desc"
                    value={seo.metaDescription}
                    onChange={(e) => setSeo(prev => ({ ...prev, metaDescription: e.target.value }))}
                    placeholder="Enter site description for search engines"
                    rows={4}
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="seo-og">OpenGraph Cover Image URL</Label>
                  <div className="flex gap-2">
                    <Input
                      id="seo-og"
                      value={seo.ogImage}
                      onChange={(e) => setSeo(prev => ({ ...prev, ogImage: e.target.value }))}
                      placeholder="e.g. /images/og-main.jpg"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => triggerMediaPicker('seoOg')}
                      className="px-3"
                    >
                      <ImageIcon className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* SHOWREELS CONFIG FORM */}
            {activeTab === 'showreels' && (
              <div className="space-y-4">
                <div className="flex justify-between items-center pb-2 border-b border-border">
                  <h3 className="text-sm uppercase tracking-wider font-semibold">Showreels Config</h3>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setShowreels(prev => [...prev, {
                      id: 'reel-' + Date.now(),
                      title: 'New Reel',
                      category: 'Commercial',
                      description: 'Brand showcase',
                      videoUrl: '/videos/reel_1.mp4',
                      coverImage: '/images/portfolio-hero.jpg',
                      duration: '0:30',
                      camera: 'ARRI ALEXA 35',
                      lenses: 'Cooke Anamorphic /i',
                      colorGrade: 'Dolby Vision HDR'
                    }])}
                  >
                    <Plus className="w-4 h-4 mr-2" /> Add Showreel
                  </Button>
                </div>

                {showreels.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-6">No showreels added yet.</p>
                ) : (
                  <div className="space-y-6">
                    {showreels.map((reel, idx) => (
                      <div key={reel.id} className="border border-border p-5 rounded-xl space-y-4 bg-background/30 relative">
                        <div className="absolute top-4 right-4">
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => setShowreels(prev => prev.filter((_, i) => i !== idx))}
                            className="text-destructive hover:bg-destructive/10"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                          <div className="flex flex-col gap-1.5">
                            <Label>Reel Title</Label>
                            <Input
                              value={reel.title}
                              onChange={(e) => {
                                const copy = [...showreels];
                                copy[idx].title = e.target.value;
                                setShowreels(copy);
                              }}
                              placeholder="e.g. Master Reel 2026"
                              required
                            />
                          </div>
                          <div className="flex flex-col gap-1.5">
                            <Label>Category</Label>
                            <Input
                              value={reel.category}
                              onChange={(e) => {
                                const copy = [...showreels];
                                copy[idx].category = e.target.value;
                                setShowreels(copy);
                              }}
                              placeholder="e.g. Commercial & Narrative"
                              required
                            />
                          </div>
                          <div className="flex flex-col gap-1.5">
                            <Label>Duration (e.g. 0:30)</Label>
                            <Input
                              value={reel.duration}
                              onChange={(e) => {
                                const copy = [...showreels];
                                copy[idx].duration = e.target.value;
                                setShowreels(copy);
                              }}
                              placeholder="e.g. 0:39"
                              required
                            />
                          </div>
                          <div className="flex flex-col gap-1.5">
                            <Label>Video URL</Label>
                            <Input
                              value={reel.videoUrl}
                              onChange={(e) => {
                                const copy = [...showreels];
                                copy[idx].videoUrl = e.target.value;
                                setShowreels(copy);
                              }}
                              placeholder="e.g. /videos/reel_1.mp4"
                              required
                            />
                          </div>
                          <div className="flex flex-col gap-1.5">
                            <Label>Cover Image URL</Label>
                            <div className="flex gap-2">
                              <Input
                                value={reel.coverImage}
                                onChange={(e) => {
                                  const copy = [...showreels];
                                  copy[idx].coverImage = e.target.value;
                                  setShowreels(copy);
                                }}
                                placeholder="e.g. /images/portfolio-hero.jpg"
                                required
                              />
                              <Button
                                type="button"
                                variant="outline"
                                onClick={() => {
                                  setMediaTarget(`reelCover-${idx}`);
                                  setMediaOpen(true);
                                }}
                                className="px-2"
                              >
                                <ImageIcon className="w-3.5 h-3.5" />
                              </Button>
                            </div>
                          </div>
                          <div className="flex flex-col gap-1.5">
                            <Label>Camera Model</Label>
                            <Input
                              value={reel.camera}
                              onChange={(e) => {
                                const copy = [...showreels];
                                copy[idx].camera = e.target.value;
                                setShowreels(copy);
                              }}
                              placeholder="e.g. ARRI ALEXA 35"
                            />
                          </div>
                          <div className="flex flex-col gap-1.5">
                            <Label>Lenses</Label>
                            <Input
                              value={reel.lenses}
                              onChange={(e) => {
                                const copy = [...showreels];
                                copy[idx].lenses = e.target.value;
                                setShowreels(copy);
                              }}
                              placeholder="e.g. Cooke Anamorphic /i"
                            />
                          </div>
                          <div className="flex flex-col gap-1.5">
                            <Label>Color Grade</Label>
                            <Input
                              value={reel.colorGrade}
                              onChange={(e) => {
                                const copy = [...showreels];
                                copy[idx].colorGrade = e.target.value;
                                setShowreels(copy);
                              }}
                              placeholder="e.g. Dolby Vision HDR"
                            />
                          </div>
                        </div>

                        <div className="flex flex-col gap-1.5">
                          <Label>Description</Label>
                          <Textarea
                            value={reel.description}
                            onChange={(e) => {
                              const copy = [...showreels];
                              copy[idx].description = e.target.value;
                              setShowreels(copy);
                            }}
                            placeholder="Enter details about this showreel..."
                            rows={2}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'sponsored' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-medium text-foreground">Sponsored Partners &amp; Ads</h3>
                    <p className="text-sm text-muted-foreground">
                      Manage sponsored cards displayed in the right sidebar panel on the Services page.
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSponsored(prev => [
                        ...prev,
                        {
                          id: `sp-${Date.now()}`,
                          title: '',
                          tagline: '',
                          description: '',
                          imageUrl: '',
                          linkUrl: '',
                          badge: 'SPONSORED',
                          ctaText: 'Visit Partner ↗',
                          isPublished: true,
                        }
                      ]);
                    }}
                  >
                    <Plus className="w-4 h-4 mr-1" /> Add Partner
                  </Button>
                </div>

                {sponsored.length === 0 ? (
                  <div className="p-8 border border-dashed border-border rounded-xl text-center text-muted-foreground text-sm">
                    No sponsored partners added yet. Click &quot;Add Partner&quot; to create one.
                  </div>
                ) : (
                  <div className="space-y-6">
                    {sponsored.map((item, idx) => (
                      <div key={item.id || idx} className="p-5 border border-border rounded-xl space-y-4 bg-card/40 relative">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-mono font-bold tracking-wider uppercase text-primary">
                            Partner #{idx + 1}
                          </span>
                          <div className="flex items-center gap-3">
                            <label className="flex items-center gap-2 text-xs font-medium cursor-pointer">
                              <input
                                type="checkbox"
                                checked={item.isPublished}
                                onChange={(e) => {
                                  const copy = [...sponsored];
                                  copy[idx].isPublished = e.target.checked;
                                  setSponsored(copy);
                                }}
                                className="rounded border-border accent-primary w-4 h-4"
                              />
                              <span>Published on Site</span>
                            </label>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="text-destructive hover:bg-destructive/10"
                              onClick={() => {
                                setSponsored(prev => prev.filter((_, i) => i !== idx));
                              }}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="flex flex-col gap-1.5">
                            <Label>Partner / Brand Name</Label>
                            <Input
                              value={item.title}
                              onChange={(e) => {
                                const copy = [...sponsored];
                                copy[idx].title = e.target.value;
                                setSponsored(copy);
                              }}
                              placeholder="e.g. RED Digital Cinema"
                            />
                          </div>

                          <div className="flex flex-col gap-1.5">
                            <Label>Tagline / Promo Headline</Label>
                            <Input
                              value={item.tagline}
                              onChange={(e) => {
                                const copy = [...sponsored];
                                copy[idx].tagline = e.target.value;
                                setSponsored(copy);
                              }}
                              placeholder="e.g. Official 8K Camera Rental Partner"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="flex flex-col gap-1.5">
                            <Label>Badge Text</Label>
                            <Input
                              value={item.badge}
                              onChange={(e) => {
                                const copy = [...sponsored];
                                copy[idx].badge = e.target.value;
                                setSponsored(copy);
                              }}
                              placeholder="e.g. SPONSORED, OFFICIAL PARTNER, PROMO"
                            />
                          </div>

                          <div className="flex flex-col gap-1.5">
                            <Label>CTA Button Text</Label>
                            <Input
                              value={item.ctaText}
                              onChange={(e) => {
                                const copy = [...sponsored];
                                copy[idx].ctaText = e.target.value;
                                setSponsored(copy);
                              }}
                              placeholder="e.g. Visit Partner ↗"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="flex flex-col gap-1.5">
                            <Label>Destination Link URL</Label>
                            <Input
                              value={item.linkUrl}
                              onChange={(e) => {
                                const copy = [...sponsored];
                                copy[idx].linkUrl = e.target.value;
                                setSponsored(copy);
                              }}
                              placeholder="e.g. https://www.red.com"
                            />
                          </div>

                          <div className="flex flex-col gap-1.5">
                            <Label>Banner / Logo Image URL</Label>
                            <div className="flex gap-2">
                              <Input
                                value={item.imageUrl}
                                onChange={(e) => {
                                  const copy = [...sponsored];
                                  copy[idx].imageUrl = e.target.value;
                                  setSponsored(copy);
                                }}
                                placeholder="/assets/project-commercial.webp"
                              />
                              <Button
                                type="button"
                                variant="outline"
                                onClick={() => triggerMediaPicker(`sponsorImg-${idx}`)}
                              >
                                <ImageIcon className="w-4 h-4 mr-1" /> Browse
                              </Button>
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-col gap-1.5">
                          <Label>Description / Offer Details</Label>
                          <Textarea
                            value={item.description}
                            onChange={(e) => {
                              const copy = [...sponsored];
                              copy[idx].description = e.target.value;
                              setSponsored(copy);
                            }}
                            placeholder="e.g. Special 15% equipment discount for all MP Production certified shoots and creators."
                            rows={2}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Submit Action */}
            <div className="flex justify-end gap-2 border-t border-border pt-6">
              <Button type="submit" disabled={saving}>
                {saving ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" /> Save Config
                  </>
                )}
              </Button>
            </div>
          </form>
        )}
      </div>

      {/* Global MediaLibrary Drawer for file url picker */}
      <MediaLibrary
        open={mediaOpen}
        onOpenChange={setMediaOpen}
        onSelect={handleMediaSelect}
      />
    </div>
  );
}

export default function SiteConfigPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-muted-foreground">Loading site configuration...</div>}>
      <SiteConfigContent />
    </Suspense>
  );
}
