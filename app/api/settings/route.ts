import { NextRequest, NextResponse } from 'next/server';
import { INITIAL_SETTINGS } from '@/lib/initialData';
import { StoreSettings } from '@/lib/types';
import { getDbSettings, saveDbSettings } from '@/lib/db';

let serverSettings: StoreSettings = { ...INITIAL_SETTINGS };

export async function GET() {
  try {
    const dbSettings = await getDbSettings();
    if (dbSettings) {
      serverSettings = dbSettings;
    }
  } catch (err) {
    console.warn('Falling back to memory cache for settings:', err);
  }
  return NextResponse.json({ success: true, settings: serverSettings });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    serverSettings = { ...serverSettings, ...body };

    saveDbSettings(serverSettings).catch((err) =>
      console.warn('Async MySQL settings save skipped:', err)
    );

    return NextResponse.json({ success: true, settings: serverSettings });
  } catch {
    return NextResponse.json({ success: false, error: 'Invalid settings data' }, { status: 400 });
  }
}
