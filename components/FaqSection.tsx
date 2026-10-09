'use client';

import React, { useState } from 'react';
import { ChevronDown, HelpCircle } from 'lucide-react';

interface FaqItem {
  question: string;
  answer: string;
}

const FAQS: FaqItem[] = [
  {
    question: 'How do I receive my digital files after completing checkout?',
    answer:
      'Immediately upon payment completion, an instant order confirmation screen appears displaying your private Google Drive and Mega cloud folder links. You can download individual assets or the full ZIP vault with 1-click. A backup copy is also dispatched to your provided email address within 30 seconds.',
  },
  {
    question: 'Can I use these assets for client projects and commercial monetization?',
    answer:
      'Yes, absolutely! Every purchase comes with an unrestricted Lifetime Commercial License. You are free to use the templates, video footage, sound effects, code boilerplates, and design mockups for YouTube monetization, client deliverables, freelance gigs, social media ads, and commercial client websites.',
  },
  {
    question: 'What formats and software are compatible?',
    answer:
      'Our vaults are organized with industry-standard formats: Canva templates (free & pro), Figma auto-layout files, Adobe Photoshop (PSD), Premiere Pro / DaVinci Resolve (CUBE LUTs & PRPROJ), Notion workspace links, Next.js / React source code repositories, and lossless WAV/MP4 files. Most bundles can be accessed directly on mobile as well as desktop.',
  },
  {
    question: 'Will I receive future updates when new assets are added?',
    answer:
      'Yes. When we expand any bundle (e.g., adding fresh viral hooks, new UI components, or updated LUT packages), the master Google Drive and Mega folders update in real time. Your access link remains permanently active with zero monthly subscription fees.',
  },
  {
    question: 'What payment methods do you accept?',
    answer:
      'We accept all major payment methods including UPI (Google Pay, PhonePe, Paytm, QR code scan), Credit and Debit cards (Visa, Mastercard, RuPay, Amex), and PayPal for international customers.',
  },
  {
    question: 'What if I encounter an issue downloading or extracting files?',
    answer:
      'We provide 24/7 dedicated creator support. If you ever misplace your email or need an alternative cloud mirror, simply reach out to our team at support@apexdigital.store with your Order ID, and we will refresh your links instantly.',
  },
];

export const FaqSection: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggle = (idx: number) => {
    setOpenIndex(openIndex === idx ? null : idx);
  };

  return (
    <section id="faq" className="py-10 sm:py-12 border-b border-slate-200/80 bg-white">
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-8">
          <div className="text-xs font-mono font-medium uppercase tracking-wider text-slate-500 mb-1">
            Common Inquiries
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Frequently Asked Questions
          </h2>
          <p className="mt-1.5 text-xs text-slate-500">
            Details on licensing, instant cloud delivery, file formats, and lifetime access.
          </p>
        </div>

        <div className="space-y-3">
          {FAQS.map((faq, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div
                key={idx}
                className="rounded-xl bg-slate-50 border border-slate-200 overflow-hidden transition-colors"
              >
                <button
                  onClick={() => toggle(idx)}
                  className="w-full p-4 sm:p-5 text-left flex items-center justify-between gap-4 text-slate-900 hover:text-blue-600 transition-colors cursor-pointer"
                >
                  <span className="text-sm sm:text-base font-semibold leading-snug">
                    {faq.question}
                  </span>
                  <ChevronDown
                    className={`w-4 h-4 text-slate-400 shrink-0 transition-transform duration-200 ${
                      isOpen ? 'rotate-180 text-blue-600' : ''
                    }`}
                  />
                </button>

                {isOpen && (
                  <div className="px-4 pb-5 sm:px-5 text-xs sm:text-sm text-slate-600 leading-relaxed border-t border-slate-200/80 pt-3">
                    {faq.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
