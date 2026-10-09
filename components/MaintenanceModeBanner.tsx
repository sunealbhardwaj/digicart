'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { AlertTriangle, Power, ExternalLink, ShieldCheck, Check } from 'lucide-react';
import { StoreSettings } from '@/lib/types';
import { saveStoredSettings } from '@/lib/store';

interface MaintenanceModeBannerProps {
  settings: StoreSettings;
  onSettingsUpdated?: (newSettings: StoreSettings) => void;
  onExitBypass?: () => void;
}

export const MaintenanceModeBanner: React.FC<MaintenanceModeBannerProps> = ({
  settings,
  onSettingsUpdated,
  onExitBypass,
}) => {
  const [isUpdating, setIsUpdating] = useState(false);
  const [successMsg, setSuccessMsg] = useState(false);

  const handleDisableMaintenance = async () => {
    setIsUpdating(true);
    const updated: StoreSettings = {
      ...settings,
      maintenanceMode: false,
    };

    // Save locally
    saveStoredSettings(updated);

    // Save to server API
    try {
      await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated),
      });
    } catch {
      // ignore
    }

    if (onSettingsUpdated) {
      onSettingsUpdated(updated);
    }

    setSuccessMsg(true);
    setIsUpdating(false);
    setTimeout(() => setSuccessMsg(false), 3000);
  };

  return (
    <div className="bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 text-slate-950 px-4 py-2 text-xs font-mono font-bold shadow-md sticky top-0 z-50 border-b border-amber-600/30 flex flex-wrap items-center justify-between gap-3">
      <div className="flex items-center gap-2">
        <span className="w-2.5 h-2.5 rounded-full bg-slate-950 animate-pulse shrink-0" />
        <AlertTriangle className="w-4 h-4 text-slate-950 shrink-0" />
        <span className="tracking-tight">
          MAINTENANCE MODE ACTIVE — Public visitors see the maintenance screen.
        </span>
        <span className="hidden md:inline-flex items-center gap-1 bg-slate-950/10 border border-slate-950/20 px-2 py-0.5 rounded text-[11px]">
          <ShieldCheck className="w-3 h-3" />
          Admin Bypass Mode
        </span>
      </div>

      <div className="flex items-center gap-2">
        {successMsg ? (
          <span className="flex items-center gap-1 bg-emerald-800 text-white px-2.5 py-1 rounded text-xs font-bold">
            <Check className="w-3.5 h-3.5" />
            Maintenance Mode Disabled!
          </span>
        ) : (
          <button
            onClick={handleDisableMaintenance}
            disabled={isUpdating}
            className="bg-slate-950 hover:bg-slate-900 text-white px-3 py-1 rounded text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-xs active:scale-95 disabled:opacity-50"
          >
            <Power className="w-3 h-3 text-amber-400" />
            <span>{isUpdating ? 'Disabling...' : 'Disable Maintenance Mode'}</span>
          </button>
        )}

        <Link
          href="/admin"
          className="bg-white/80 hover:bg-white text-slate-900 px-3 py-1 rounded text-xs font-bold transition-all border border-slate-950/20 flex items-center gap-1"
        >
          <span>Admin Portal</span>
          <ExternalLink className="w-3 h-3" />
        </Link>

        {onExitBypass && (
          <button
            onClick={onExitBypass}
            className="text-slate-800 hover:text-slate-950 text-[11px] underline underline-offset-2 ml-1 cursor-pointer"
          >
            Exit Bypass
          </button>
        )}
      </div>
    </div>
  );
};
