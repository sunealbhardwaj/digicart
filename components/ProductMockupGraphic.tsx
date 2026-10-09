'use client';

import React, { useState } from 'react';
import {
  FolderArchive,
  Layers,
  Sparkles,
  Code2,
  Video,
  BookOpen,
  Mail,
  Briefcase,
  HardDriveDownload,
  ImageIcon,
  Bot,
  LayoutTemplate,
  Repeat,
  Flame,
} from 'lucide-react';
import { ProductCategory } from '@/lib/types';

interface ProductMockupGraphicProps {
  category: ProductCategory;
  theme?: 'obsidian' | 'emerald' | 'amber' | 'cyan' | 'purple' | 'rose';
  title: string;
  fileSize: string;
  fileFormat: string;
  imageUrl?: string;
  className?: string;
}

export const ProductMockupGraphic: React.FC<ProductMockupGraphicProps> = ({
  category,
  title,
  fileSize,
  fileFormat,
  imageUrl,
  className = '',
}) => {
  const [imageError, setImageError] = useState(false);

  // Category Icon helper
  const renderCategoryIcon = () => {
    switch (category) {
      case 'Content Creation':
        return <Sparkles className="w-4 h-4 text-blue-600" />;
      case 'Graphic Design':
        return <Layers className="w-4 h-4 text-indigo-600" />;
      case 'Business & Marketing':
        return <Briefcase className="w-4 h-4 text-blue-700" />;
      case 'Email Marketing':
        return <Mail className="w-4 h-4 text-sky-600" />;
      case 'Software & WordPress':
        return <Code2 className="w-4 h-4 text-blue-600" />;
      case 'Video & Audio':
        return <Video className="w-4 h-4 text-indigo-700" />;
      case 'Courses & Education':
        return <BookOpen className="w-4 h-4 text-sky-700" />;
      case 'ChatGPT Prompts':
      case 'AI Tools':
      case 'AI Content':
      case 'AI Graphics':
      case 'AI RESOURCES':
        return <Bot className="w-4 h-4 text-violet-600" />;
      case 'Canva':
      case 'Photoshop':
      case 'PowerPoint':
      case 'Excel':
      case 'WordPress':
      case 'Social Media':
      case 'TEMPLATES':
        return <LayoutTemplate className="w-4 h-4 text-emerald-600" />;
      case 'PLR Articles':
      case 'PLR Ebooks':
      case 'PLR Templates':
      case 'Resell Products':
      case 'Business Resources':
      case 'PLR / MRR':
        return <Repeat className="w-4 h-4 text-amber-600" />;
      case 'MEGA BUNDLES':
        return <Flame className="w-4 h-4 text-amber-600" />;
      default:
        return <FolderArchive className="w-4 h-4 text-blue-600" />;
    }
  };

  // When imageUrl is provided and not errored
  if (imageUrl && !imageError) {
    return (
      <div className={`relative w-full aspect-video sm:aspect-4/3 overflow-hidden bg-slate-100 ${className}`}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={imageUrl}
          alt={title}
          referrerPolicy="no-referrer"
          onError={() => setImageError(true)}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
        />

        {/* Soft readable contrast vignette */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/75 via-transparent to-slate-900/20 pointer-events-none" />

        {/* Top Header inside graphic */}
        <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between z-10 pointer-events-none">
          <div className="p-1.5 rounded-lg bg-white/95 border border-blue-100 shadow-sm backdrop-blur-md flex items-center gap-1.5">
            {renderCategoryIcon()}
            <span className="text-[10px] font-mono font-bold text-slate-800 uppercase tracking-wider hidden sm:inline">
              PRO VAULT
            </span>
          </div>
          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-white/95 border border-blue-100 shadow-sm backdrop-blur-md text-[10px] font-mono font-bold text-blue-700">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse" />
            <span>CLOUD VERIFIED</span>
          </div>
        </div>

        {/* Bottom Specs Bar */}
        <div className="absolute bottom-2.5 left-2.5 right-2.5 flex items-center justify-between text-[11px] font-mono z-10">
          <span className="flex items-center gap-1.5 bg-white/95 backdrop-blur-md px-2 py-0.5 rounded-md border border-slate-200/80 text-slate-800 font-semibold shadow-xs">
            <HardDriveDownload className="w-3 h-3 text-blue-600" />
            {fileSize}
          </span>
          <span className="bg-white/95 backdrop-blur-md px-2 py-0.5 rounded-md border border-slate-200/80 truncate max-w-[140px] text-slate-700 font-medium shadow-xs">
            {fileFormat}
          </span>
        </div>
      </div>
    );
  }

  // Modern White and Blue Vector Mockup Graphic (Fallback or Loading)
  return (
    <div
      className={`relative w-full aspect-video sm:aspect-4/3 overflow-hidden bg-gradient-to-br from-blue-50 via-white to-blue-100/60 flex flex-col justify-between p-4 border-b border-blue-100 select-none ${className}`}
    >
      {/* Background geometric grid pattern */}
      <div
        className="absolute inset-0 opacity-[0.4] pointer-events-none"
        style={{
          backgroundImage:
            'radial-gradient(#2563eb 0.75px, transparent 0.75px), radial-gradient(#3b82f6 0.75px, #f8fafc 0.75px)',
          backgroundSize: '24px 24px',
          backgroundPosition: '0 0, 12px 12px',
        }}
      />

      {/* Ambient soft blue glow */}
      <div className="absolute -top-8 -right-8 w-36 h-36 rounded-full bg-blue-400/15 blur-2xl pointer-events-none" />
      <div className="absolute -bottom-8 -left-8 w-36 h-36 rounded-full bg-indigo-400/15 blur-2xl pointer-events-none" />

      {/* Top bar inside graphic */}
      <div className="relative z-10 flex items-center justify-between">
        <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-white border border-blue-200 shadow-xs text-xs font-mono font-bold text-blue-700">
          {renderCategoryIcon()}
          <span className="truncate max-w-[130px] uppercase text-[10px] tracking-wide">
            SAMPLE ASSET
          </span>
        </div>

        <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-white border border-blue-200 shadow-xs text-[10px] font-mono font-bold text-blue-600">
          <ImageIcon className="w-3 h-3 text-blue-600" />
          <span>MOCKUP</span>
        </div>
      </div>

      {/* Central Visual Showcase */}
      <div className="relative z-10 my-auto text-center px-2 py-2 flex flex-col items-center">
        <div className="w-14 h-14 rounded-2xl bg-white border-2 border-blue-200 shadow-md shadow-blue-500/10 flex items-center justify-center mb-2 transform group-hover:scale-110 transition-transform duration-300">
          <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
            {renderCategoryIcon()}
          </div>
        </div>

        <div className="font-mono text-[10px] tracking-wider text-blue-700 uppercase font-extrabold px-2 py-0.5 rounded-full bg-blue-100/80 mb-1">
          {category}
        </div>
        <p className="text-xs font-bold text-slate-800 line-clamp-1 max-w-[220px]">
          {title}
        </p>
      </div>

      {/* Bottom specs */}
      <div className="relative z-10 flex items-center justify-between text-[11px] font-mono text-slate-700">
        <span className="flex items-center gap-1 bg-white px-2 py-0.5 rounded-md border border-blue-200 shadow-xs font-semibold">
          <HardDriveDownload className="w-3 h-3 text-blue-600" />
          {fileSize}
        </span>
        <span className="bg-white px-2 py-0.5 rounded-md border border-blue-200 shadow-xs truncate max-w-[130px] font-semibold text-slate-800">
          {fileFormat}
        </span>
      </div>
    </div>
  );
};
