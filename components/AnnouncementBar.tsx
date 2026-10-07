'use client';

import React, { useState, useEffect } from 'react';
import { Zap, X, Clock } from 'lucide-react';
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
    <div className="relative z-50 bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-700 text-white font-medium text-xs sm:text-sm py-2 px-4 shadow-sm">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
        <div className="flex-1 flex items-center justify-center gap-2 text-center flex-wrap">
          <span className="flex items-center gap-1.5 font-bold tracking-tight">
            <Zap className="w-4 h-4 fill-amber-300 text-amber-300" />
            {settings.announcementText}
          </span>

          {settings.countdownActive && (
            <div className="inline-flex items-center gap-1.5 bg-white/20 text-white px-2 py-0.5 rounded font-mono text-xs font-semibold backdrop-blur-xs">
              <Clock className="w-3 h-3" />
              <span>Ends in</span>
              <span className="tabular-nums font-bold">
                {pad(timeLeft.hours)}:{pad(timeLeft.minutes)}:{pad(timeLeft.seconds)}
              </span>
            </div>
          )}
        </div>

        <button
          onClick={() => setVisible(false)}
          className="text-white/80 hover:text-white transition-colors p-1 rounded hover:bg-white/10 shrink-0"
          aria-label="Close Announcement"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
