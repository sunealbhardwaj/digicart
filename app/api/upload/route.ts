import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const contentType = req.headers.get('content-type') || '';

    // If multipart/form-data
    if (contentType.includes('multipart/form-data')) {
      const formData = await req.formData();
      const file = formData.get('file') as File | null;

      if (!file) {
        return NextResponse.json({ success: false, error: 'No file uploaded' }, { status: 400 });
      }

      if (!file.type.startsWith('image/')) {
        return NextResponse.json({ success: false, error: 'File must be an image' }, { status: 400 });
      }

      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const base64 = buffer.toString('base64');
      const dataUrl = `data:${file.type};base64,${base64}`;

      return NextResponse.json({
        success: true,
        url: dataUrl,
        name: file.name,
        size: `${Math.round(file.size / 1024)} KB`,
        type: file.type,
      });
    }

    // If JSON payload with dataUrl
    const body = await req.json();
    if (body.dataUrl) {
      return NextResponse.json({
        success: true,
        url: body.dataUrl,
        name: body.name || 'uploaded-image.png',
        size: body.size || 'Optimized',
      });
    }

    return NextResponse.json({ success: false, error: 'Invalid payload' }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message || 'Upload failed' }, { status: 500 });
  }
}
