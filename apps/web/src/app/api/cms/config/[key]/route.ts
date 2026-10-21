import { NextRequest, NextResponse } from 'next/server';
import { backendFetch } from '@/lib/cms/server/backend';
import { requireAdmin } from '@/lib/cms/server/guard';

import fs from 'fs/promises';
import path from 'path';

type Ctx = { params: Promise<{ key: string }> };

// In-memory cache for ultra-fast response
const LOCAL_CONFIG_CACHE: Record<string, any> = {};

async function persistConfigToDisk(key: string, data: any) {
  try {
    const dir = path.join(process.cwd(), '.cms-cache');
    await fs.mkdir(dir, { recursive: true });
    await fs.writeFile(path.join(dir, `${key.replace(/[^a-zA-Z0-9_-]/g, '_')}.json`), JSON.stringify(data, null, 2), 'utf-8');
  } catch (e) {
    console.warn('Could not persist config to disk:', e);
  }
}

async function loadConfigFromDisk(key: string) {
  try {
    const file = path.join(process.cwd(), '.cms-cache', `${key.replace(/[^a-zA-Z0-9_-]/g, '_')}.json`);
    const content = await fs.readFile(file, 'utf-8');
    return JSON.parse(content);
  } catch {
    return null;
  }
}

export async function GET(_req: NextRequest, ctx: Ctx) {
  const { key } = await ctx.params;
  try {
    const result = await backendFetch(`/cms/config/${encodeURIComponent(key)}`);
    if (result.ok && result.data) {
      return NextResponse.json(result, { status: 200 });
    }
  } catch (err) {
    // API offline, fallback
  }

  if (LOCAL_CONFIG_CACHE[key] !== undefined) {
    return NextResponse.json({ ok: true, success: true, status: 200, data: LOCAL_CONFIG_CACHE[key] }, { status: 200 });
  }

  const diskData = await loadConfigFromDisk(key);
  if (diskData !== null) {
    LOCAL_CONFIG_CACHE[key] = diskData;
    return NextResponse.json({ ok: true, success: true, status: 200, data: diskData }, { status: 200 });
  }

  return NextResponse.json({ ok: false, status: 404, error: 'Config key not found' }, { status: 404 });
}

export async function POST(req: NextRequest, ctx: Ctx) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
  }
  const { key } = await ctx.params;
  const body = await req.json().catch(() => ({}));

  const valToSave = body.value !== undefined ? body.value : body;
  LOCAL_CONFIG_CACHE[key] = valToSave;
  await persistConfigToDisk(key, valToSave);

  try {
    const result = await backendFetch(`/cms/admin/config/${encodeURIComponent(key)}`, {
      method: 'POST',
      body: JSON.stringify(body),
    });
    if (result.ok) {
      return NextResponse.json(result, { status: 200 });
    }
  } catch (err) {
    // Backend offline, fallback to saved response
  }

  return NextResponse.json({ ok: true, success: true, status: 200, data: valToSave }, { status: 200 });
}

