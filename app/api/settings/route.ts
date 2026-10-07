import { NextRequest, NextResponse } from 'next/server';
import { INITIAL_SETTINGS } from '@/lib/initialData';
import { StoreSettings } from '@/lib/types';

let serverSettings: StoreSettings = { ...INITIAL_SETTINGS };

export async function GET() {
  return NextResponse.json({ success: true, settings: serverSettings });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    serverSettings = { ...serverSettings, ...body };
    return NextResponse.json({ success: true, settings: serverSettings });
  } catch {
    return NextResponse.json({ success: false, error: 'Invalid settings data' }, { status: 400 });
  }
}
