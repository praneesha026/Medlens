import React from 'react';
import { AlertCircle, ShieldAlert } from 'lucide-react';

interface SafetyNoticeProps {
  variant?: 'banner' | 'card' | 'compact';
  className?: string;
}

export const SafetyNotice: React.FC<SafetyNoticeProps> = ({ variant = 'banner', className = '' }) => {
  const noticeText =
    "MedLens is an information organization and understanding tool. It does not provide medical diagnosis or treatment recommendations. Always consult a qualified healthcare professional for medical decisions.";

  if (variant === 'compact') {
    return (
      <div
        id="safety-notice-compact"
        className={`flex items-center gap-2.5 text-xs text-slate-500 bg-slate-100/70 border border-slate-200 px-3.5 py-2 rounded-lg ${className}`}
      >
        <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0" />
        <span className="leading-tight">{noticeText}</span>
      </div>
    );
  }

  if (variant === 'card') {
    return (
      <div
        id="safety-notice-card"
        className={`p-4 rounded-xl border border-slate-200 bg-white shadow-xs text-slate-700 ${className}`}
      >
        <div className="flex items-start gap-3">
          <div className="p-2 bg-amber-50 border border-amber-200 rounded-lg shrink-0 text-amber-700">
            <AlertCircle className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Clinical Scope & Information Notice</h4>
              <span className="text-[10px] bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded font-bold uppercase">Non-Diagnostic</span>
            </div>
            <p className="text-xs leading-relaxed text-slate-600">{noticeText}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      id="safety-notice-banner"
      className={`bg-slate-900 text-slate-300 text-xs px-4 py-2 border-b border-slate-800 ${className}`}
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <ShieldAlert className="w-3.5 h-3.5 text-amber-400 shrink-0" />
          <span className="font-semibold text-indigo-300">Clinical Disclaimer:</span>
          <span className="text-slate-300 hidden sm:inline">{noticeText}</span>
          <span className="text-slate-300 sm:hidden">Information organization tool only. Not for diagnosis.</span>
        </div>
        <span className="hidden md:inline-block text-[10px] text-slate-400 font-mono tracking-wider bg-slate-800 px-2 py-0.5 rounded border border-slate-700 uppercase font-bold">
          Synthetic Records
        </span>
      </div>
    </div>
  );
};
