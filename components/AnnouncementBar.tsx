'use client';

import React, { useState, useEffect } from 'react';
import { X, Clock } from 'lucide-react';
import { StoreSettings } from '@/lib/types';

interface AnnouncementBarProps {
  settings: StoreSettings;
}

export const AnnouncementBar: React.FC<AnnouncementBarProps> = ({ settings }) => {
  const [visible, setVisible] = useState(true);
  const [timeLeft, setTimeLeft] = useState({ hours: 11, minutes: 42, seconds: 19 });

  useEffect(() => {
    if (!settings.countdownActive) return;

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 };
        }
        if (prev.minutes > 0) {
          return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        }
        if (prev.hours > 0) {
          return { ...prev, hours: prev.hours - 1, minutes: 59, seconds: 59 };
        }
        return { hours: 12, minutes: 0, seconds: 0 };
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [settings.countdownActive]);

  if (!visible || !settings.announcementActive) return null;

  const pad = (n: number) => n.toString().padStart(2, '0');

  return (
    <div className="relative z-50 bg-slate-950 text-slate-200 text-xs py-1.5 px-4 border-b border-slate-800">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
        <div className="flex-1 flex items-center justify-center gap-2 text-center flex-wrap">
          <span className="font-medium tracking-tight text-slate-100">
            {settings.announcementText}
          </span>

          {settings.countdownActive && (
            <div className="inline-flex items-center gap-1 text-[11px] font-mono text-slate-400">
              <Clock className="w-3 h-3 text-slate-400" />
              <span>Ends in</span>
              <span className="tabular-nums font-semibold text-slate-200" suppressHydrationWarning>
                {pad(timeLeft.hours)}:{pad(timeLeft.minutes)}:{pad(timeLeft.seconds)}
              </span>
            </div>
          )}
        </div>

        <button
          onClick={() => setVisible(false)}
          className="text-slate-400 hover:text-slate-200 transition-colors p-0.5 rounded cursor-pointer shrink-0"
          aria-label="Dismiss Announcement"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
