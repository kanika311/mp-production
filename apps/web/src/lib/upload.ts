export type StorageBucket = 'mp-public' | 'mp-private' | 'mp-cms';

/**
 * Upload a file directly to Cloudinary via internal /api/upload.
 * Retains backward-compatible function name and signature so existing components work seamlessly.
 */
export async function uploadToSupabase({
  file,
  folder,
}: {
  file: File;
  bucket?: StorageBucket;
  folder: string;
}): Promise<string> {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('folder', folder || 'mdms/uploads');

  const res = await fetch('/api/upload', {
    method: 'POST',
    body: formData,
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Failed to upload media');
  }

  return data.url;
}
