import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file');
    const folder = (formData.get('folder') as string) || 'mdms/uploads';

    if (!file || !(file instanceof Blob)) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    const cloudName = process.env.CLOUDINARY_CLOUD_NAME || 'dd29usied';
    const apiKey = process.env.CLOUDINARY_API_KEY || '174528277852462';
    const apiSecret = process.env.CLOUDINARY_API_SECRET || '3yGMVTlV7jJ0PSmdJicG2Mf46sk';

    const timestamp = Math.floor(Date.now() / 1000);
    const paramsToSign = `folder=${folder}&timestamp=${timestamp}${apiSecret}`;
    const signature = crypto.createHash('sha1').update(paramsToSign).digest('hex');

    const cloudinaryFormData = new FormData();
    cloudinaryFormData.append('file', file);
    cloudinaryFormData.append('api_key', apiKey);
    cloudinaryFormData.append('timestamp', timestamp.toString());
    cloudinaryFormData.append('signature', signature);
    cloudinaryFormData.append('folder', folder);

    const uploadRes = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`, {
      method: 'POST',
      body: cloudinaryFormData,
    });

    const data = await uploadRes.json();
    if (!uploadRes.ok || data.error) {
      console.error('Cloudinary upload failure:', data.error);
      return NextResponse.json(
        { error: data.error?.message || 'Upload failed' },
        { status: 500 },
      );
    }

    const secureUrl = data.secure_url || data.url;
    return NextResponse.json({ url: secureUrl });
  } catch (err: any) {
    console.error('Upload API internal error:', err);
    return NextResponse.json(
      { error: err?.message || 'Internal upload error' },
      { status: 500 },
    );
  }
}
