'use client';

import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import {
  Upload,
  Loader2,
  Image as ImageIcon,
  Plus,
  X,
  GraduationCap,
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/Button';
import { MediaLibrary } from '@/components/admin/MediaLibrary';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export type CourseFormValues = Record<string, unknown>;

const CATEGORIES = [
  { value: 'YOUTUBER', label: 'YouTube Masterclass', badge: 'bg-red-600 text-white' },
  { value: 'REELER', label: 'Instagram Reels', badge: 'bg-gradient-to-r from-purple-600 to-pink-600 text-white' },
  { value: 'CREATOR', label: 'Content Creator', badge: 'bg-emerald-600 text-white' },
  { value: 'INFLUENCER', label: 'Influencer & Brand', badge: 'bg-amber-600 text-white' },
  { value: 'EDITING', label: 'Editing & Color', badge: 'bg-cyan-600 text-white' },
  { value: 'MONETIZATION', label: 'Monetization', badge: 'bg-violet-600 text-white' },
] as const;

const LEVELS = ['Beginner', 'Creator', 'Pro Master'] as const;

function slugify(title: string) {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
}

function formatInr(n: number) {
  if (!Number.isFinite(n) || n <= 0) return '';
  return `₹${n.toLocaleString('en-IN')}`;
}

function asString(v: unknown, fallback = '') {
  if (v === undefined || v === null) return fallback;
  return String(v);
}

function asTopics(v: unknown): string[] {
  if (Array.isArray(v)) return v.map(String).filter(Boolean);
  if (typeof v === 'string') {
    return v.split(',').map((t) => t.trim()).filter(Boolean);
  }
  return [];
}

interface CourseEditorFormProps {
  initial?: CourseFormValues | null;
  submitting?: boolean;
  onSubmit: (payload: CourseFormValues) => void;
  onCancel: () => void;
}

export function CourseEditorForm({
  initial,
  submitting,
  onSubmit,
  onCancel,
}: CourseEditorFormProps) {
  const isEdit = Boolean(initial?.id || initial?.slug);

  const [title, setTitle] = useState(asString(initial?.title));
  const [slug, setSlug] = useState(asString(initial?.slug));
  const [slugTouched, setSlugTouched] = useState(Boolean(initial?.slug));
  const [category, setCategory] = useState(asString(initial?.category, 'YOUTUBER'));
  const [level, setLevel] = useState(asString(initial?.level, 'Creator'));
  const [duration, setDuration] = useState(asString(initial?.duration, '4 Hours'));
  const [lessonsCount, setLessonsCount] = useState(asString(initial?.lessonsCount, '12'));
  const [rating, setRating] = useState(asString(initial?.rating, '5'));
  const [enrolledCount, setEnrolledCount] = useState(asString(initial?.enrolledCount, '0'));
  const [numericPrice, setNumericPrice] = useState(asString(initial?.numericPrice, '4999'));
  const [originalNumeric, setOriginalNumeric] = useState(() => {
    const raw = asString(initial?.originalPrice).replace(/[^\d]/g, '');
    return raw || '12999';
  });
  const [image, setImage] = useState(asString(initial?.image));
  const [trailerVideoUrl, setTrailerVideoUrl] = useState(asString(initial?.trailerVideoUrl));
  const [description, setDescription] = useState(asString(initial?.description));
  const [topics, setTopics] = useState<string[]>(asTopics(initial?.topics));
  const [topicDraft, setTopicDraft] = useState('');
  const [resources, setResources] = useState<string[]>(asTopics(initial?.resources));
  const [resourceDraft, setResourceDraft] = useState('');
  const [instructorName, setInstructorName] = useState(
    asString(initial?.instructorName, 'MP Instructor'),
  );
  const [instructorRole, setInstructorRole] = useState(asString(initial?.instructorRole));
  const [instructorAvatar, setInstructorAvatar] = useState(asString(initial?.instructorAvatar));
  const [instructorBio, setInstructorBio] = useState(asString(initial?.instructorBio));
  const [isPublished, setIsPublished] = useState(
    initial?.isPublished === undefined ? true : Boolean(initial.isPublished),
  );
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [uploading, setUploading] = useState(false);
  const [mediaOpen, setMediaOpen] = useState(false);
  const [mediaTarget, setMediaTarget] = useState<'image' | 'instructorAvatar'>('image');

  useEffect(() => {
    if (!slugTouched) setSlug(slugify(title));
  }, [title, slugTouched]);

  const categoryMeta = useMemo(
    () => CATEGORIES.find((c) => c.value === category) || CATEGORIES[0],
    [category],
  );

  const priceDisplay = formatInr(Number(numericPrice));
  const originalDisplay = formatInr(Number(originalNumeric));

  function addChip(
    draft: string,
    list: string[],
    setList: (v: string[]) => void,
    setDraft: (v: string) => void,
  ) {
    const next = draft.trim();
    if (!next) return;
    if (list.includes(next)) {
      setDraft('');
      return;
    }
    setList([...list, next]);
    setDraft('');
  }

  async function uploadFile(file: File, target: 'image' | 'instructorAvatar') {
    const formData = new FormData();
    formData.append('file', file);
    setUploading(true);
    try {
      const res = await fetch('/api/cms/media', { method: 'POST', body: formData });
      const data = await res.json().catch(() => null);
      const url =
        data?.data?.url ||
        data?.data?.secure_url ||
        data?.data?.mediaUrl ||
        data?.url ||
        data?.mediaUrl;
      if (!res.ok || !url || String(url).startsWith('blob:')) {
        toast.error(
          data?.error ||
            'Image upload failed. Paste a public image URL instead, or check API/media config.',
        );
        return;
      }
      if (target === 'image') setImage(String(url));
      else setInstructorAvatar(String(url));
      toast.success('Image uploaded');
    } catch {
      toast.error('Image upload failed');
    } finally {
      setUploading(false);
    }
  }

  function validate(): CourseFormValues | null {
    const next: Record<string, string> = {};
    if (!title.trim()) next.title = 'Title is required';
    if (!slug.trim()) next.slug = 'Slug is required';
    if (!description.trim()) next.description = 'Description is required';
    if (!image.trim() || image.startsWith('blob:')) {
      next.image = 'Upload a cover photo or paste a public image URL';
    }
    const priceNum = Number(numericPrice);
    if (!Number.isFinite(priceNum) || priceNum <= 0) next.numericPrice = 'Enter a valid price';
    if (!instructorName.trim()) next.instructorName = 'Instructor name is required';

    setErrors(next);
    if (Object.keys(next).length) return null;

    return {
      ...(initial?.id ? { id: initial.id } : {}),
      title: title.trim(),
      slug: slug.trim(),
      category,
      categoryLabel: categoryMeta.label,
      badgeColor: categoryMeta.badge,
      level,
      duration: duration.trim() || '4 Hours',
      lessonsCount: Number(lessonsCount) || 0,
      rating: Number(rating) || 5,
      enrolledCount: Number(enrolledCount) || 0,
      numericPrice: priceNum,
      price: priceDisplay || formatInr(priceNum),
      originalPrice: originalDisplay || formatInr(Number(originalNumeric) || priceNum * 2),
      image: image.trim(),
      trailerVideoUrl: trailerVideoUrl.trim() || null,
      description: description.trim(),
      topics,
      resources,
      instructorName: instructorName.trim(),
      instructorRole: instructorRole.trim() || null,
      instructorAvatar: instructorAvatar.trim() || null,
      instructorBio: instructorBio.trim() || null,
      isPublished,
      sortOrder: Number(initial?.sortOrder) || 0,
      modules: Array.isArray(initial?.modules) ? initial?.modules : [],
    };
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        const payload = validate();
        if (payload) onSubmit(payload);
      }}
      className="flex flex-col gap-6"
    >
      <div className="flex items-center gap-3 rounded-2xl border border-border bg-muted/30 px-4 py-3">
        <div className="size-10 rounded-xl bg-brand/15 text-brand flex items-center justify-center">
          <GraduationCap className="size-5" />
        </div>
        <div>
          <p className="text-sm font-semibold text-foreground">
            {isEdit ? 'Edit course' : 'Create new course'}
          </p>
          <p className="text-xs text-muted-foreground">
            Title, photo, price & description — published courses appear on Become-a-YouTuber.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 max-h-[65vh] overflow-y-auto pr-1">
        {/* Left: media */}
        <div className="lg:col-span-2 space-y-4">
          <div className="space-y-2">
            <Label>Cover photo *</Label>
            <div className="relative aspect-video rounded-2xl border border-dashed border-border bg-muted/40 overflow-hidden">
              {image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={image} alt="Course cover" className="absolute inset-0 size-full object-cover" />
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-muted-foreground">
                  <ImageIcon className="size-8 opacity-50" />
                  <p className="text-xs">Course thumbnail preview</p>
                </div>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              <label className="cursor-pointer inline-flex items-center gap-2 rounded-xl bg-brand px-3 py-2 text-xs font-bold text-white">
                {uploading ? <Loader2 className="size-3.5 animate-spin" /> : <Upload className="size-3.5" />}
                Upload photo
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) void uploadFile(file, 'image');
                  }}
                />
              </label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="rounded-xl"
                onClick={() => {
                  setMediaTarget('image');
                  setMediaOpen(true);
                }}
              >
                Media library
              </Button>
            </div>
            <Input
              value={image}
              placeholder="Or paste image URL…"
              onChange={(e) => setImage(e.target.value)}
            />
            {errors.image && <p className="text-xs text-destructive">{errors.image}</p>}
          </div>

          <div className="space-y-2">
            <Label>Trailer video URL (optional)</Label>
            <Input
              value={trailerVideoUrl}
              placeholder="https://…/trailer.mp4"
              onChange={(e) => setTrailerVideoUrl(e.target.value)}
            />
          </div>

          <div className="rounded-2xl border border-border p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <Label>Publish on website</Label>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Off = draft only in admin
                </p>
              </div>
              <Switch checked={isPublished} onCheckedChange={setIsPublished} />
            </div>
          </div>
        </div>

        {/* Right: details */}
        <div className="lg:col-span-3 space-y-5">
          <div className="space-y-2">
            <Label htmlFor="course-title">Course title *</Label>
            <Input
              id="course-title"
              value={title}
              placeholder="How to Become a YouTuber…"
              onChange={(e) => setTitle(e.target.value)}
            />
            {errors.title && <p className="text-xs text-destructive">{errors.title}</p>}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="course-slug">URL slug *</Label>
              <Input
                id="course-slug"
                value={slug}
                onChange={(e) => {
                  setSlugTouched(true);
                  setSlug(e.target.value);
                }}
                placeholder="course-youtuber"
              />
              {errors.slug && <p className="text-xs text-destructive">{errors.slug}</p>}
            </div>
            <div className="space-y-2">
              <Label>Category *</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((c) => (
                    <SelectItem key={c.value} value={c.value}>
                      {c.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="course-desc">Description *</Label>
            <Textarea
              id="course-desc"
              rows={5}
              value={description}
              placeholder="What will students learn? Keep it clear and benefit-focused…"
              onChange={(e) => setDescription(e.target.value)}
            />
            {errors.description && (
              <p className="text-xs text-destructive">{errors.description}</p>
            )}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="space-y-2">
              <Label>Level</Label>
              <Select value={level} onValueChange={setLevel}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {LEVELS.map((l) => (
                    <SelectItem key={l} value={l}>
                      {l}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Duration</Label>
              <Input value={duration} onChange={(e) => setDuration(e.target.value)} placeholder="4.5 Hours" />
            </div>
            <div className="space-y-2">
              <Label>Modules</Label>
              <Input
                type="number"
                min={0}
                value={lessonsCount}
                onChange={(e) => setLessonsCount(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Rating</Label>
              <Input
                type="number"
                min={0}
                max={5}
                step={0.1}
                value={rating}
                onChange={(e) => setRating(e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 rounded-2xl border border-border p-4 bg-card">
            <div className="space-y-2">
              <Label>Sale price (INR) *</Label>
              <Input
                type="number"
                min={1}
                value={numericPrice}
                onChange={(e) => setNumericPrice(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">Shows as {priceDisplay || '—'}</p>
              {errors.numericPrice && (
                <p className="text-xs text-destructive">{errors.numericPrice}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label>Original price (INR)</Label>
              <Input
                type="number"
                min={1}
                value={originalNumeric}
                onChange={(e) => setOriginalNumeric(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">Shows as {originalDisplay || '—'}</p>
            </div>
            <div className="space-y-2">
              <Label>Enrolled count</Label>
              <Input
                type="number"
                min={0}
                value={enrolledCount}
                onChange={(e) => setEnrolledCount(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>What you learn (topics)</Label>
            <div className="flex gap-2">
              <Input
                value={topicDraft}
                placeholder="e.g. Sony & Canon 10-Bit Log Setup"
                onChange={(e) => setTopicDraft(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addChip(topicDraft, topics, setTopics, setTopicDraft);
                  }
                }}
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => addChip(topicDraft, topics, setTopics, setTopicDraft)}
              >
                <Plus className="size-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {topics.map((t) => (
                <span
                  key={t}
                  className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30 px-2.5 py-1 text-xs"
                >
                  {t}
                  <button type="button" onClick={() => setTopics(topics.filter((x) => x !== t))}>
                    <X className="size-3" />
                  </button>
                </span>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Included resources</Label>
            <div className="flex gap-2">
              <Input
                value={resourceDraft}
                placeholder="e.g. LUT Pack, Checklist PDF"
                onChange={(e) => setResourceDraft(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addChip(resourceDraft, resources, setResources, setResourceDraft);
                  }
                }}
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => addChip(resourceDraft, resources, setResources, setResourceDraft)}
              >
                <Plus className="size-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {resources.map((t) => (
                <span
                  key={t}
                  className="inline-flex items-center gap-1 rounded-full bg-muted border border-border px-2.5 py-1 text-xs"
                >
                  {t}
                  <button
                    type="button"
                    onClick={() => setResources(resources.filter((x) => x !== t))}
                  >
                    <X className="size-3" />
                  </button>
                </span>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 rounded-2xl border border-border p-4">
            <div className="space-y-2 sm:col-span-2">
              <Label>Instructor name *</Label>
              <Input
                value={instructorName}
                onChange={(e) => setInstructorName(e.target.value)}
              />
              {errors.instructorName && (
                <p className="text-xs text-destructive">{errors.instructorName}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label>Instructor role</Label>
              <Input
                value={instructorRole}
                placeholder="Head of Cinematography"
                onChange={(e) => setInstructorRole(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Instructor photo</Label>
              <div className="flex gap-2">
                <Input
                  value={instructorAvatar}
                  placeholder="Image URL"
                  onChange={(e) => setInstructorAvatar(e.target.value)}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setMediaTarget('instructorAvatar');
                    setMediaOpen(true);
                  }}
                >
                  Pick
                </Button>
              </div>
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label>Instructor bio</Label>
              <Textarea
                rows={3}
                value={instructorBio}
                onChange={(e) => setInstructorBio(e.target.value)}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 border-t border-border pt-4">
        <Button type="button" variant="outline" onClick={onCancel} disabled={submitting}>
          Cancel
        </Button>
        <Button type="submit" disabled={submitting || uploading}>
          {submitting ? 'Saving…' : isPublished ? 'Save & publish' : 'Save draft'}
        </Button>
      </div>

      <MediaLibrary
        open={mediaOpen}
        onOpenChange={setMediaOpen}
        onSelect={(url) => {
          if (mediaTarget === 'image') setImage(url);
          else setInstructorAvatar(url);
          setMediaOpen(false);
        }}
      />
    </form>
  );
}
