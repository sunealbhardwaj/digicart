import { NextRequest, NextResponse } from 'next/server';
import { INITIAL_SETTINGS } from '@/lib/initialData';
import { StoreSettings } from '@/lib/types';
import { getDbSettings, saveDbSettings, isDbConfigured } from '@/lib/db';

let serverSettings: StoreSettings = { ...INITIAL_SETTINGS };

export async function GET() {
  if (isDbConfigured()) {
    try {
      const dbSettings = await getDbSettings();
      if (dbSettings) {
        serverSettings = dbSettings;
      }
    } catch {
      // Gracefully fall back to server cache
    }
  }
  return NextResponse.json({ success: true, settings: serverSettings });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    serverSettings = { ...serverSettings, ...body };

    // Try saving to MySQL only if database is configured
    if (isDbConfigured()) {
      saveDbSettings(serverSettings).catch(() => {});
    }

    return NextResponse.json({ success: true, settings: serverSettings });
  } catch {
    return NextResponse.json({ success: false, error: 'Invalid settings data' }, { status: 400 });
  }
}
