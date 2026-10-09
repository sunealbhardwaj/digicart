'use client';

import React from 'react';
import { HardDriveDownload, ShieldCheck, Zap, RefreshCw } from 'lucide-react';

export const TrustSection: React.FC = () => {
  const pillars = [
    {
      icon: <HardDriveDownload className="w-6 h-6 text-blue-600" />,
      title: 'Instant Cloud Delivery',
      description:
        'Never wait for file links. Immediate Google Drive & Mega high-speed download links generated on screen and sent to your email right after checkout.',
    },
    {
      icon: <ShieldCheck className="w-6 h-6 text-indigo-600" />,
      title: 'Full Commercial License',
      description:
        'Use all digital assets, video templates, code boilerplates, and design mockups across unlimited client projects, YouTube channels, and client deliverables.',
    },
    {
      icon: <Zap className="w-6 h-6 text-sky-600" />,
      title: 'Direct High-Speed Servers',
      description:
        'All bundle zip files are hosted on redundant, high-bandwidth Google Cloud & Mega enterprise servers with no speed throttles or download caps.',
    },
    {
      icon: <RefreshCw className="w-6 h-6 text-blue-700" />,
      title: 'Lifetime Free Updates',
      description:
        'Whenever new assets, prompts, or templates are added to your purchased vault, access the updated Google Drive folder without paying extra.',
    },
  ];

  return (
    <section className="py-10 sm:py-12 border-b border-slate-200/80 bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-8">
          <div className="text-xs font-mono font-medium uppercase tracking-wider text-slate-500 mb-1">
            Delivery & Guarantee
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Why Creators & Agencies Trust Us
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {pillars.map((pillar, idx) => (
            <div
              key={idx}
              className="p-5 rounded-xl bg-white border border-slate-200 shadow-xs hover:border-blue-300 transition-colors flex flex-col justify-between"
            >
              <div>
                <div className="w-12 h-12 rounded-lg bg-blue-50 flex items-center justify-center mb-4 border border-blue-100">
                  {pillar.icon}
                </div>
                <h3 className="text-base font-bold text-slate-900 mb-2">{pillar.title}</h3>
                <p className="text-xs text-slate-600 leading-relaxed">{pillar.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
