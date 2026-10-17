'use client';

import React, { useRef, useCallback, useState } from 'react';
import { motion } from 'framer-motion';
import { ImageUploader, GalleryGrid } from './MediaUploaders';

interface PortfolioImage {
  id: string;
  url: string;
  file?: File;
}

interface StepPortfolioBuilderProps {
  data: {
    profilePhoto: File | null;
    profilePhotoPreview: string;
    coverBanner: File | null;
    coverBannerPreview: string;
    galleryImages: PortfolioImage[];
    introductionVideo: File | null;
    introductionVideoPreview: string;
    resume: File | null;
    resumeName: string;
    compCard: File | null;
    compCardName: string;
  };
  onChange: (data: Partial<StepPortfolioBuilderProps['data']>) => void;
  errors: Record<string, string>;
}

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08 } },
};
const item = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.4, 0, 0.2, 1] as any } },
};

export function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export function StepPortfolioBuilder({ data, onChange, errors }: StepPortfolioBuilderProps) {
  const videoInputRef = useRef<HTMLInputElement>(null);
  const resumeInputRef = useRef<HTMLInputElement>(null);
  const compCardInputRef = useRef<HTMLInputElement>(null);
  const [videoDragging, setVideoDragging] = useState(false);

  const handleGalleryAdd = useCallback(async (files: File[]) => {
    const newImages: PortfolioImage[] = await Promise.all(
      files.map(async (file) => {
        let url = '';
        try {
          url = await fileToDataUrl(file);
        } catch {
          url = URL.createObjectURL(file);
        }
        return {
          id: crypto.randomUUID(),
          url,
          file,
        };
      })
    );
    onChange({ galleryImages: [...data.galleryImages, ...newImages] });
  }, [data.galleryImages, onChange]);

  const handleGalleryRemove = useCallback((id: string) => {
    onChange({ galleryImages: data.galleryImages.filter((img) => img.id !== id) });
  }, [data.galleryImages, onChange]);

  const handleGalleryReorder = useCallback((images: PortfolioImage[]) => {
    onChange({ galleryImages: images });
  }, [onChange]);

  const handleVideoFile = useCallback((file: File) => {
    if (file.size > 100 * 1024 * 1024) {
      alert('Video file must be under 100MB');
      return;
    }
    onChange({
      introductionVideo: file,
      introductionVideoPreview: URL.createObjectURL(file),
    });
  }, [onChange]);

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-12">
      {/* Header */}
      <motion.div variants={item} className="text-center max-w-xl mx-auto">
        <div className="w-14 h-14 rounded-2xl bg-[var(--brand)]/10 flex items-center justify-center mx-auto mb-4">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-[var(--brand)]">
            <rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="1.5" />
            <circle cx="8.5" cy="8.5" r="1.5" stroke="currentColor" strokeWidth="1.5" />
            <path d="M21 15l-5-5L5 21" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <p className="text-sm text-[var(--muted-foreground)] leading-relaxed">
          Your portfolio is your first impression. Upload high-quality photos, videos, and documents to showcase your talent.
        </p>
      </motion.div>

      {/* Profile Photo & Cover Banner */}
      <motion.div variants={item}>
        <h3 className="text-[10px] font-semibold tracking-[0.2em] uppercase text-[var(--brand)] mb-6">
          Profile & Cover
        </h3>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Profile Photo */}
          <div>
            <ImageUploader
              label="Profile Photo"
              value={data.profilePhotoPreview}
              onUpload={async (file) => {
                let dataUrl = '';
                try {
                  dataUrl = await fileToDataUrl(file);
                } catch {
                  dataUrl = URL.createObjectURL(file);
                }
                onChange({
                  profilePhoto: file,
                  profilePhotoPreview: dataUrl,
                });
              }}
              onRemove={() => onChange({ profilePhoto: null, profilePhotoPreview: '' })}
              aspectRatio="1/1"
              circular
              maxSizeMB={10}
              error={errors.profilePhoto}
              hint="Face clearly visible, 500x500px minimum"
            />
          </div>

          {/* Cover Banner */}
          <div className="lg:col-span-2">
            <ImageUploader
              label="Cover Banner"
              value={data.coverBannerPreview}
              onUpload={async (file) => {
                let dataUrl = '';
                try {
                  dataUrl = await fileToDataUrl(file);
                } catch {
                  dataUrl = URL.createObjectURL(file);
                }
                onChange({
                  coverBanner: file,
                  coverBannerPreview: dataUrl,
                });
              }}
              onRemove={() => onChange({ coverBanner: null, coverBannerPreview: '' })}
              aspectRatio="16/6"
              maxSizeMB={15}
              error={errors.coverBanner}
              hint="Landscape image, 1920x720px recommended"
            />
          </div>
        </div>
      </motion.div>

      {/* Portfolio Gallery */}
      <motion.div variants={item}>
        <GalleryGrid
          images={data.galleryImages}
          onAdd={handleGalleryAdd}
          onRemove={handleGalleryRemove}
          onReorder={handleGalleryReorder}
          minImages={6}
          maxImages={20}
          error={errors.galleryImages}
        />
        <p className="mt-2 text-xs text-[var(--muted-foreground)]">
          Drag to reorder. The first image becomes your portfolio cover. Min 6, max 20 photos.
        </p>
      </motion.div>

      {/* Introduction Video */}
      <motion.div variants={item}>
        <h3 className="text-[10px] font-semibold tracking-[0.2em] uppercase text-[var(--brand)] mb-2">
          Introduction Video
        </h3>
        <p className="text-sm text-[var(--muted-foreground)] mb-4">
          Record a 30-60 second introduction to help clients get to know you. (Optional)
        </p>

        {data.introductionVideoPreview ? (
          <div className="relative rounded-2xl overflow-hidden border border-[var(--border)] bg-black">
            <video
              src={data.introductionVideoPreview}
              controls
              className="w-full max-h-[300px] object-contain"
            />
            <button
              onClick={() => onChange({ introductionVideo: null, introductionVideoPreview: '' })}
              className="absolute top-3 right-3 w-8 h-8 rounded-full bg-red-500/80 backdrop-blur-sm flex items-center justify-center text-white hover:bg-red-500 transition-colors"
            >
              <svg width="14" height="14" viewBox="0 0 8 8" fill="none">
                <path d="M1 1L7 7M7 1L1 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </button>
          </div>
        ) : (
          <div
            onDragOver={(e) => { e.preventDefault(); setVideoDragging(true); }}
            onDragLeave={() => setVideoDragging(false)}
            onDrop={(e) => {
              e.preventDefault();
              setVideoDragging(false);
              const file = e.dataTransfer.files[0];
              if (file?.type.startsWith('video/')) handleVideoFile(file);
            }}
            onClick={() => videoInputRef.current?.click()}
            className={`
              flex flex-col items-center justify-center gap-3 p-10 rounded-2xl border-2 border-dashed cursor-pointer
              transition-all duration-300
              ${videoDragging
                ? 'border-[var(--brand)] bg-[var(--brand)]/5'
                : 'border-[var(--input)] hover:border-[var(--brand)]/50'
              }
            `}
          >
            <div className="w-12 h-12 rounded-xl bg-[var(--surface)] flex items-center justify-center">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-[var(--brand)]">
                <polygon points="23 7 16 12 23 17 23 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                <rect x="1" y="5" width="15" height="14" rx="2" stroke="currentColor" strokeWidth="1.5" />
              </svg>
            </div>
            <p className="text-sm font-medium text-[var(--foreground)]">Upload Introduction Video</p>
            <p className="text-xs text-[var(--muted-foreground)]">MP4, MOV, WebM · Max 100MB</p>
          </div>
        )}
        <input
          ref={videoInputRef}
          type="file"
          accept="video/mp4,video/mov,video/webm"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleVideoFile(file);
          }}
          className="hidden"
        />
      </motion.div>

      {/* Documents */}
      <motion.div variants={item}>
        <h3 className="text-[10px] font-semibold tracking-[0.2em] uppercase text-[var(--brand)] mb-6">
          Documents
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Resume */}
          <div
            onClick={() => resumeInputRef.current?.click()}
            className={`
              flex items-center gap-4 p-4 rounded-xl border cursor-pointer transition-all duration-300
              ${data.resumeName
                ? 'border-[var(--brand)]/30 bg-[var(--brand)]/5'
                : 'border-[var(--input)] hover:border-[var(--brand)]/30'
              }
            `}
          >
            <div className="w-10 h-10 rounded-lg bg-[var(--surface)] flex items-center justify-center flex-shrink-0">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="text-[var(--brand)]">
                <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                <polyline points="14 2 14 8 20 8" stroke="currentColor" strokeWidth="1.5" />
              </svg>
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-[var(--foreground)]">
                {data.resumeName || 'Upload Resume'}
              </p>
              <p className="text-xs text-[var(--muted-foreground)]">PDF · Max 5MB</p>
            </div>
            {data.resumeName && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onChange({ resume: null, resumeName: '' });
                }}
                className="w-8 h-8 rounded-full flex items-center justify-center text-[var(--destructive)] hover:bg-[var(--destructive)]/10 transition-colors"
              >
                <svg width="14" height="14" viewBox="0 0 8 8" fill="none">
                  <path d="M1 1L7 7M7 1L1 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              </button>
            )}
          </div>
          <input
            ref={resumeInputRef}
            type="file"
            accept=".pdf"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) onChange({ resume: file, resumeName: file.name });
            }}
            className="hidden"
          />

          {/* Comp Card */}
          <div
            onClick={() => compCardInputRef.current?.click()}
            className={`
              flex items-center gap-4 p-4 rounded-xl border cursor-pointer transition-all duration-300
              ${data.compCardName
                ? 'border-[var(--brand)]/30 bg-[var(--brand)]/5'
                : 'border-[var(--input)] hover:border-[var(--brand)]/30'
              }
            `}
          >
            <div className="w-10 h-10 rounded-lg bg-[var(--surface)] flex items-center justify-center flex-shrink-0">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="text-[var(--brand)]">
                <rect x="2" y="3" width="20" height="18" rx="2" stroke="currentColor" strokeWidth="1.5" />
                <circle cx="8" cy="10" r="2" stroke="currentColor" strokeWidth="1.5" />
                <path d="M14 8h4M14 12h4M6 16h12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-[var(--foreground)]">
                {data.compCardName || 'Upload Comp Card'}
              </p>
              <p className="text-xs text-[var(--muted-foreground)]">PDF or Image · Max 10MB</p>
            </div>
            {data.compCardName && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onChange({ compCard: null, compCardName: '' });
                }}
                className="w-8 h-8 rounded-full flex items-center justify-center text-[var(--destructive)] hover:bg-[var(--destructive)]/10 transition-colors"
              >
                <svg width="14" height="14" viewBox="0 0 8 8" fill="none">
                  <path d="M1 1L7 7M7 1L1 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              </button>
            )}
          </div>
          <input
            ref={compCardInputRef}
            type="file"
            accept=".pdf,image/jpeg,image/png"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) onChange({ compCard: file, compCardName: file.name });
            }}
            className="hidden"
          />
        </div>
      </motion.div>
    </motion.div>
  );
}
