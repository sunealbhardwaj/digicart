import Link from 'next/link';
import { Search, ArrowLeft, Sparkles } from 'lucide-react';

export default function ProductNotFound() {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl border border-slate-200 p-8 text-center shadow-lg">
        <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-4 border border-blue-100">
          <Search className="w-7 h-7" />
        </div>
        <span className="text-xs font-mono font-bold uppercase text-blue-600 tracking-wider">
          404 Not Found
        </span>
        <h1 className="text-xl sm:text-2xl font-black text-slate-900 mt-1 mb-2">
          Product Not Found
        </h1>
        <p className="text-xs text-slate-500 leading-relaxed mb-6">
          The digital asset or bundle you are looking for has been moved or is no longer available in our active catalog.
        </p>

        <div className="space-y-2">
          <Link
            href="/#catalog-section"
            className="w-full py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center justify-center gap-2 transition-colors shadow-sm"
          >
            <Sparkles className="w-4 h-4" />
            <span>Explore All Creator Vaults</span>
          </Link>
          <Link
            href="/"
            className="w-full py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Storefront</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
