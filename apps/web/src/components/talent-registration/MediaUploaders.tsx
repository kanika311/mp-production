'use client';

import React, { useRef, useCallback, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface ImageUploaderProps {
  label: string;
  value?: string; // Preview URL
  onUpload: (file: File) => void;
  onRemove?: () => void;
  accept?: string;
  maxSizeMB?: number;
  aspectRatio?: string; // e.g., "1/1", "16/9", "3/4"
  circular?: boolean;
  error?: string;
  hint?: string;
}

export function ImageUploader({
  label,
  value,
  onUpload,
  onRemove,
  accept = 'image/jpeg,image/png,image/webp',
  maxSizeMB = 10,
  aspectRatio = '1/1',
  circular = false,
  error,
  hint,
}: ImageUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(value || null);

  React.useEffect(() => {
    setPreviewUrl(value || null);
  }, [value]);

  const handleFile = useCallback(
    (file: File) => {
      if (file.size > maxSizeMB * 1024 * 1024) {
        alert(`File size must be under ${maxSizeMB}MB`);
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
      onUpload(file);
    },
    [maxSizeMB, onUpload]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files[0];
      if (file && file.type.startsWith('image/')) {
        handleFile(file);
      }
    },
    [handleFile]
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  const remove = () => {
    setPreviewUrl(null);
    if (inputRef.current) inputRef.current.value = '';
    onRemove?.();
  };

  return (
    <div className="w-full">
      <label className="block text-[10px] font-semibold tracking-[0.15em] uppercase text-[var(--muted-foreground)] mb-3">
        {label}
      </label>

      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        onClick={() => !previewUrl && inputRef.current?.click()}
        className={`
          relative overflow-hidden cursor-pointer
          transition-all duration-300 ease-out
          ${circular ? 'rounded-full' : 'rounded-2xl'}
          ${previewUrl ? '' : 'border-2 border-dashed'}
          ${isDragging
            ? 'border-[var(--brand)] bg-[var(--brand)]/5 scale-[1.02]'
            : error
              ? 'border-[var(--destructive)]'
              : 'border-[var(--input)] hover:border-[var(--brand)]/50'
          }
        `}
        style={{ aspectRatio }}
      >
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          onChange={handleInputChange}
          className="hidden"
        />

        <AnimatePresence mode="wait">
          {previewUrl ? (
            <motion.div
              key="preview"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="absolute inset-0 group"
            >
              <img
                src={previewUrl}
                alt={label}
                className={`w-full h-full object-cover ${circular ? 'rounded-full' : 'rounded-2xl'}`}
              />
              {/* Hover overlay */}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-all duration-300 flex items-center justify-center gap-3 opacity-0 group-hover:opacity-100">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    inputRef.current?.click();
                  }}
                  className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-white hover:bg-white/30 transition-colors"
                  title="Replace"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12" />
                  </svg>
                </button>
                {onRemove && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      remove();
                    }}
                    className="w-10 h-10 rounded-full bg-red-500/80 backdrop-blur-sm flex items-center justify-center text-white hover:bg-red-500 transition-colors"
                    title="Remove"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
                    </svg>
                  </button>
                )}
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="dropzone"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center"
            >
              <motion.div
                animate={isDragging ? { scale: 1.1, y: -4 } : { scale: 1, y: 0 }}
                className="w-12 h-12 rounded-xl bg-[var(--surface)] flex items-center justify-center mb-3"
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-[var(--brand)]">
                  <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  <polyline points="17 8 12 3 7 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  <line x1="12" y1="3" x2="12" y2="15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </motion.div>
              <p className="text-sm font-medium text-[var(--foreground)] mb-1">
                {isDragging ? 'Drop image here' : 'Click or drag to upload'}
              </p>
              <p className="text-xs text-[var(--muted-foreground)]">
                JPG, PNG, WebP · Max {maxSizeMB}MB
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {hint && !error && (
        <p className="mt-2 text-xs text-[var(--muted-foreground)]">{hint}</p>
      )}
      {error && (
        <motion.p
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-2 text-xs text-[var(--destructive)] font-medium"
        >
          {error}
        </motion.p>
      )}
    </div>
  );
}

interface GalleryGridProps {
  images: { id: string; url: string; file?: File }[];
  onAdd: (files: File[]) => void;
  onRemove: (id: string) => void;
  onReorder: (images: { id: string; url: string; file?: File }[]) => void;
  minImages?: number;
  maxImages?: number;
  error?: string;
}

export function GalleryGrid({
  images,
  onAdd,
  onRemove,
  onReorder,
  minImages = 6,
  maxImages = 20,
  error,
}: GalleryGridProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [draggedId, setDraggedId] = useState<string | null>(null);

  const handleFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const remaining = maxImages - images.length;
    onAdd(files.slice(0, remaining));
    if (inputRef.current) inputRef.current.value = '';
  };

  const handleDragStart = (id: string) => {
    setDraggedId(id);
  };

  const handleDragOver = (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    if (!draggedId || draggedId === targetId) return;

    const dragIdx = images.findIndex((img) => img.id === draggedId);
    const targetIdx = images.findIndex((img) => img.id === targetId);
    if (dragIdx === -1 || targetIdx === -1) return;

    const newImages = [...images];
    const [moved] = newImages.splice(dragIdx, 1);
    newImages.splice(targetIdx, 0, moved);
    onReorder(newImages);
  };

  const handleDragEnd = () => {
    setDraggedId(null);
  };

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-3">
        <label className="text-[10px] font-semibold tracking-[0.15em] uppercase text-[var(--muted-foreground)]">
          Portfolio Gallery
        </label>
        <span className="text-xs text-[var(--muted-foreground)]">
          {images.length}/{maxImages} · Min {minImages}
        </span>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        <AnimatePresence mode="popLayout">
          {images.map((img, index) => (
            <motion.div
              key={img.id}
              layout
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{
                opacity: draggedId === img.id ? 0.5 : 1,
                scale: 1,
              }}
              exit={{ opacity: 0, scale: 0.8 }}
              draggable
              onDragStart={() => handleDragStart(img.id)}
              onDragOver={(e) => handleDragOver(e as unknown as React.DragEvent, img.id)}
              onDragEnd={handleDragEnd}
              className="relative aspect-[3/4] rounded-xl overflow-hidden group cursor-grab active:cursor-grabbing border border-[var(--border)]"
            >
              <img
                src={img.url}
                alt={`Portfolio ${index + 1}`}
                className="w-full h-full object-cover"
                draggable={false}
              />
              {/* Order badge */}
              <div className="absolute top-2 left-2 w-6 h-6 rounded-full bg-black/60 backdrop-blur-sm flex items-center justify-center">
                <span className="text-[10px] font-bold text-white">{index + 1}</span>
              </div>
              {/* Remove button */}
              <button
                onClick={() => onRemove(img.id)}
                className="absolute top-2 right-2 w-7 h-7 rounded-full bg-red-500/80 backdrop-blur-sm flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500"
              >
                <svg width="12" height="12" viewBox="0 0 8 8" fill="none">
                  <path d="M1 1L7 7M7 1L1 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              </button>
              {/* Drag handle */}
              <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                {[0, 1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="w-1 h-1 rounded-full bg-white/60" />
                ))}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Add button */}
        {images.length < maxImages && (
          <motion.button
            layout
            onClick={() => inputRef.current?.click()}
            className="aspect-[3/4] rounded-xl border-2 border-dashed border-[var(--input)] hover:border-[var(--brand)]/50 flex flex-col items-center justify-center gap-2 transition-all duration-300 hover:bg-[var(--surface)]"
          >
            <div className="w-10 h-10 rounded-xl bg-[var(--surface)] flex items-center justify-center">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="text-[var(--brand)]">
                <line x1="12" y1="5" x2="12" y2="19" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                <line x1="5" y1="12" x2="19" y2="12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </div>
            <span className="text-xs font-medium text-[var(--muted-foreground)]">Add Photos</span>
          </motion.button>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        multiple
        onChange={handleFiles}
        className="hidden"
      />

      {error && (
        <motion.p
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-2 text-xs text-[var(--destructive)] font-medium"
        >
          {error}
        </motion.p>
      )}
    </div>
  );
}
