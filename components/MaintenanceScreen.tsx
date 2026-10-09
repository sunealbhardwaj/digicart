'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { StoreSettings } from '@/lib/types';
import {
  Wrench,
  Clock,
  ShieldCheck,
  Mail,
  CheckCircle2,
  ExternalLink,
  Sparkles,
  Server,
  Zap,
  Lock,
  ArrowRight,
  Copy,
  Check,
} from 'lucide-react';

interface MaintenanceScreenProps {
  settings?: StoreSettings | null;
  onEnableBypass?: () => void;
}

export const MaintenanceScreen: React.FC<MaintenanceScreenProps> = ({
  settings,
  onEnableBypass,
}) => {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const [copiedEmail, setCopiedEmail] = useState(false);
  const [timeLeft, setTimeLeft] = useState<{ minutes: number; seconds: number }>({
    minutes: 24,
    seconds: 45,
  });
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);

  // Check if admin session exists
  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        const session = localStorage.getItem('apex_admin_session_v1');
        if (session) {
          setIsAdminLoggedIn(true);
        }
      } catch {
        // ignore
      }
    }, 0);

    return () => clearTimeout(timer);
  }, []);

  // Countdown timer effect
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 };
        } else if (prev.minutes > 0) {
          return { minutes: prev.minutes - 1, seconds: 59 };
        }
        return { minutes: 0, seconds: 0 };
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const handleNotifySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setSubscribed(true);
  };

  const handleCopySupport = () => {
    const supportEmail = settings?.supportEmail || 'support@apexdigital.store';
    navigator.clipboard.writeText(supportEmail);
    setCopiedEmail(true);
    setTimeout(() => setCopiedEmail(false), 2000);
  };

  const maintenanceMessage =
    settings?.maintenanceMessage ||
    'ApexDigital is currently undergoing scheduled infrastructure upgrades and asset cloud synchronization. Our marketplace will be back online shortly with faster downloads and new bundles.';

  const estimatedEndTime = settings?.maintenanceEstimatedEndTime || '~25 minutes';

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between selection:bg-blue-600 selection:text-white font-sans relative overflow-hidden">
      {/* Background Glows & Ambience */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-gradient-to-b from-blue-600/15 via-indigo-600/10 to-transparent blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[500px] h-[400px] bg-emerald-600/5 blur-3xl pointer-events-none" />

      {/* Top Header */}
      <header className="relative z-10 border-b border-slate-800/80 bg-slate-950/60 backdrop-blur-md px-4 sm:px-8 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center font-black text-white text-base shadow-lg shadow-blue-500/25">
            ⚡
          </div>
          <div>
            <span className="font-extrabold text-base tracking-tight text-white flex items-center gap-1.5">
              ApexDigital
              <span className="text-[10px] font-mono uppercase bg-blue-500/20 text-blue-400 border border-blue-500/30 px-1.5 py-0.5 rounded">
                Store
              </span>
            </span>
            <p className="text-[11px] font-mono text-slate-400">Digital Assets & Creator Vault</p>
          </div>
        </div>

        {/* Status Pill */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-mono font-bold">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
            <span className="w-2 h-2 rounded-full bg-amber-400 -ml-4" />
            <span>MAINTENANCE MODE ACTIVE</span>
          </div>
        </div>
      </header>

      {/* Main Hero & Content */}
      <main className="relative z-10 flex-1 max-w-4xl mx-auto w-full px-4 sm:px-6 py-12 flex flex-col justify-center">
        {/* Admin Bypass banner if logged in */}
        {isAdminLoggedIn && onEnableBypass && (
          <div className="mb-8 p-4 rounded-xl bg-blue-950/70 border border-blue-500/40 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-lg">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white shrink-0">
                <Lock className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-mono font-bold text-blue-300">
                  Administrator Session Detected
                </h4>
                <p className="text-xs text-slate-300">
                  You are authorized to bypass this maintenance screen and preview the storefront.
                </p>
              </div>
            </div>
            <button
              onClick={onEnableBypass}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-mono font-bold transition-all shadow-md shadow-blue-600/30 cursor-pointer flex items-center gap-1.5 shrink-0"
            >
              <span>Enter Storefront (Admin Bypass)</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Central Card */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 sm:p-10 shadow-2xl backdrop-blur-xl relative">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 font-mono text-xs font-semibold mb-6">
            <Wrench className="w-3.5 h-3.5 text-blue-400 animate-spin" style={{ animationDuration: '6s' }} />
            <span>Scheduled Infrastructure Upgrade</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight mb-4">
            We&apos;re Upgrading Our <br />
            <span className="bg-gradient-to-r from-blue-400 via-indigo-300 to-sky-400 bg-clip-text text-transparent">
              Digital Asset Cloud
            </span>
          </h1>

          <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-2xl mb-8">
            {maintenanceMessage}
          </p>

          {/* Countdown & ETA Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
            <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 shrink-0">
                <Clock className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[11px] font-mono uppercase text-slate-400 font-bold block">
                  Estimated Uptime
                </span>
                <div className="text-xl sm:text-2xl font-black font-mono text-white tracking-tight">
                  {String(timeLeft.minutes).padStart(2, '0')}m : {String(timeLeft.seconds).padStart(2, '0')}s
                </div>
                <span className="text-[11px] text-slate-500 font-mono">
                  Target window: {estimatedEndTime}
                </span>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[11px] font-mono uppercase text-slate-400 font-bold block">
                  Orders & Downloads
                </span>
                <span className="text-sm font-bold text-white block mt-0.5">
                  100% Protected & Available
                </span>
                <span className="text-[11px] text-slate-400 font-mono">
                  All previously purchased links remain live.
                </span>
              </div>
            </div>
          </div>

          {/* Infrastructure Health Live Ticker */}
          <div className="p-4 rounded-xl bg-slate-950/50 border border-slate-800/80 mb-8 space-y-3">
            <div className="flex items-center justify-between text-xs font-mono font-bold text-slate-400">
              <span className="flex items-center gap-2">
                <Server className="w-3.5 h-3.5 text-blue-400" />
                Live Upgrade Progression
              </span>
              <span className="text-blue-400">Overall: 94% Complete</span>
            </div>

            <div className="space-y-2">
              <div>
                <div className="flex justify-between text-[11px] font-mono text-slate-400 mb-1">
                  <span>High-Speed Cloudflare CDN Cache Migration</span>
                  <span className="text-emerald-400 font-bold">98% Done</span>
                </div>
                <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full w-[98%]" />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-[11px] font-mono text-slate-400 mb-1">
                  <span>Creator Asset Vault & Instant Delivery Link Sync</span>
                  <span className="text-blue-400 font-bold">92% Done</span>
                </div>
                <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-500 rounded-full w-[92%]" />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-[11px] font-mono text-slate-400 mb-1">
                  <span>SSL & Payment Gateway Security Check</span>
                  <span className="text-emerald-400 font-bold">100% Ready</span>
                </div>
                <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full w-[100%]" />
                </div>
              </div>
            </div>
          </div>

          {/* Notification Signup Form */}
          <div className="border-t border-slate-800 pt-6">
            <h3 className="text-sm font-bold text-white mb-2 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>Get Notified The Instant We Go Live</span>
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              Enter your email to receive an instant alert plus an exclusive{' '}
              <span className="text-amber-400 font-mono font-bold">30% OFF VIP voucher</span> when the store re-opens.
            </p>

            {subscribed ? (
              <div className="p-4 rounded-xl bg-emerald-950/60 border border-emerald-500/30 flex items-center gap-3 text-emerald-300 text-xs">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                <div>
                  <span className="font-bold block">You&apos;re on the VIP priority list!</span>
                  <span>We will email you the moment the store re-opens with your 30% discount code.</span>
                </div>
              </div>
            ) : (
              <form onSubmit={handleNotifySubmit} className="flex flex-col sm:flex-row gap-2.5">
                <div className="relative flex-1">
                  <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email address..."
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-mono font-bold transition-all shadow-lg shadow-blue-600/30 cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Zap className="w-3.5 h-3.5 fill-white" />
                  <span>Notify Me</span>
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Customer Helpdesk & Support Links */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400 font-mono">
          <div className="flex items-center gap-2">
            <span>Need urgent assistance with a prior order?</span>
            <button
              onClick={handleCopySupport}
              className="inline-flex items-center gap-1 text-blue-400 hover:text-blue-300 underline underline-offset-4 cursor-pointer"
            >
              {copiedEmail ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
              <span>{settings?.supportEmail || 'support@apexdigital.store'}</span>
            </button>
          </div>

          <div className="flex items-center gap-4">
            <a
              href={`mailto:${settings?.supportEmail || 'support@apexdigital.store'}`}
              className="hover:text-slate-200 transition-colors flex items-center gap-1"
            >
              <span>Email Support</span>
              <ExternalLink className="w-3 h-3" />
            </a>
            <span className="text-slate-700">·</span>
            <Link
              href="/admin"
              className="text-slate-500 hover:text-blue-400 transition-colors flex items-center gap-1"
            >
              <Lock className="w-3 h-3" />
              <span>Admin Portal</span>
            </Link>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-slate-800/80 bg-slate-950/80 px-4 sm:px-8 py-4 text-center text-xs font-mono text-slate-500">
        <p>© {new Date().getFullYear()} ApexDigital Marketplace. All rights reserved.</p>
      </footer>
    </div>
  );
};
