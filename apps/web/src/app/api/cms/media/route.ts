import { NextRequest, NextResponse } from 'next/server';
import { backendFetch } from '@/lib/cms/server/backend';
import { requireAdmin } from '@/lib/cms/server/guard';
import fs from 'fs/promises';
import path from 'path';

export async function GET(req: NextRequest) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
  }

  const query = req.nextUrl.searchParams.toString();
  const result = await backendFetch(`/files/assets?${query}`);
  return NextResponse.json(result, { status: result.ok ? 200 : result.status });
}

export async function POST(req: NextRequest) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
  }

  let formData: FormData;
  try {
    formData = await req.formData();
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: 'Invalid form data' }, { status: 400 });
  }

  // 1. Try backend API S3 upload first
  try {
    const result = await backendFetch('/files/upload', {
      method: 'POST',
      body: formData,
    });
    if (result.ok && (result.data as any)?.url) {
      return NextResponse.json(result, { status: 200 });
    }
  } catch (err) {
    // Backend offline or S3 error, proceed to local public/uploads fallback
  }

  // 2. Resilient local fallback: save directly to public/uploads
  try {
    const file = formData.get('file') as File | null;
    if (!file || typeof file.arrayBuffer !== 'function') {
      return NextResponse.json({ ok: false, error: 'No file uploaded' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
    await fs.mkdir(uploadsDir, { recursive: true });

    const originalName = file.name || 'image.webp';
    const isWebP = originalName.toLowerCase().endsWith('.webp');
    const ext = isWebP ? '.webp' : path.extname(originalName) || '.webp';
    const safeBase = path.basename(originalName, ext).replace(/[^a-zA-Z0-9_-]/g, '_');
    const filename = `${Date.now()}-${safeBase}${ext}`;
    const filePath = path.join(uploadsDir, filename);

    await fs.writeFile(filePath, buffer);

    const publicUrl = `/uploads/${filename}`;
    return NextResponse.json({
      ok: true,
      data: {
        url: publicUrl,
        filename,
        originalName,
        size: file.size,
        mimeType: file.type || 'image/webp',
      },
    }, { status: 200 });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err.message || 'Upload failed' }, { status: 500 });
  }
}

