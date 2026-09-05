import React from 'react';
import {
  Sparkles,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  FileSearch,
  CheckCheck,
  ShieldAlert,
  Cpu
} from 'lucide-react';
import { ExtractionProcessingState } from '../types';

interface ExtractionStateBannerProps {
  state: ExtractionProcessingState;
  statusMessage?: string;
  hasCachedData: boolean;
  totalResults?: number;
  verifiedResults?: number;
  onProcess: () => void;
  onReprocess: () => void;
  isLoading: boolean;
}

export const ExtractionStateBanner: React.FC<ExtractionStateBannerProps> = ({
  state,
  statusMessage,
  hasCachedData,
  totalResults = 0,
  verifiedResults = 0,
  onProcess,
  onReprocess,
  isLoading
}) => {
  const steps: { name: ExtractionProcessingState; label: string }[] = [
    { name: 'Processing report...', label: '1. Ingestion & Pre-flight' },
    { name: 'Extracting information...', label: '2. Gemini AI Extraction' },
    { name: 'Validating results...', label: '3. Medical Schema Validation' },
    { name: 'Extraction complete', label: '4. Ready for Clinical Review' },
  ];

  const getStepStatus = (stepName: ExtractionProcessingState) => {
    if (state === 'Extraction failed') return 'error';
    if (state === 'Ready') return 'pending';
    if (state === 'Extraction complete') return 'completed';

    const order: ExtractionProcessingState[] = [
      'Processing report...',
      'Extracting information...',
      'Validating results...',
      'Extraction complete'
    ];
    const currentIndex = order.indexOf(state);
    const stepIndex = order.indexOf(stepName);

    if (stepIndex < currentIndex) return 'completed';
    if (stepIndex === currentIndex) return 'active';
    return 'pending';
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 sm:p-6 shadow-sm space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div
            className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 shadow-2xs ${
              state === 'Extraction complete'
                ? 'bg-emerald-50 border border-emerald-200 text-emerald-700'
                : state === 'Extraction failed'
                ? 'bg-rose-50 border border-rose-200 text-rose-700'
                : isLoading
                ? 'bg-indigo-50 border border-indigo-200 text-indigo-700 animate-pulse'
                : 'bg-slate-50 border border-slate-200 text-slate-700'
            }`}
          >
            {state === 'Extraction complete' ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            ) : state === 'Extraction failed' ? (
              <AlertCircle className="w-5 h-5 text-rose-600" />
            ) : isLoading ? (
              <Cpu className="w-5 h-5 text-indigo-600 animate-spin" />
            ) : (
              <Sparkles className="w-5 h-5 text-indigo-600" />
            )}
          </div>

          <div className="space-y-0.5">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-base font-bold text-slate-900">
                Gemini AI Clinical Extraction
              </h3>
              <span
                id="extraction-state-badge"
                className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
                  state === 'Extraction complete'
                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                    : state === 'Extraction failed'
                    ? 'bg-rose-100 text-rose-800 border border-rose-200'
                    : isLoading
                    ? 'bg-amber-100 text-amber-800 border border-amber-200 animate-pulse'
                    : 'bg-slate-100 text-slate-700 border border-slate-200'
                }`}
              >
                {state}
              </span>
            </div>
            <p className="text-xs text-slate-500">
              {statusMessage ||
                (state === 'Ready'
                  ? 'Extract structured laboratory results, reference ranges, and source observations.'
                  : state === 'Extraction complete'
                  ? `Structured data extracted. ${totalResults} tests cataloged (${verifiedResults} human verified).`
                  : state === 'Extraction failed'
                  ? 'The extraction pipeline encountered an issue. Review the diagnostic error below.'
                  : 'Processing document through structured clinical pipeline...')}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 self-start sm:self-center">
          {state === 'Ready' && (
            <button
              id="btn-process-report-gemini"
              type="button"
              onClick={onProcess}
              disabled={isLoading}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs transition-all disabled:opacity-50"
            >
              <Sparkles className="w-4 h-4" />
              <span>Process Report with Gemini</span>
            </button>
          )}

          {state === 'Extraction failed' && (
            <button
              id="btn-retry-extraction"
              type="button"
              onClick={onProcess}
              disabled={isLoading}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold shadow-xs transition-all"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
              <span>Retry Extraction</span>
            </button>
          )}

          {state === 'Extraction complete' && (
            <button
              id="btn-reprocess-report"
              type="button"
              onClick={onReprocess}
              disabled={isLoading}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-medium transition-colors shadow-2xs"
              title="Force re-extraction through Gemini API"
            >
              <RefreshCw className={`w-3 h-3 ${isLoading ? 'animate-spin' : ''}`} />
              <span>Re-process Document</span>
            </button>
          )}
        </div>
      </div>

      {/* 4-Step Processing Indicator */}
      {(isLoading || state === 'Extraction complete' || state === 'Extraction failed') && (
        <div className="pt-2 border-t border-slate-100">
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
            {steps.map((step, idx) => {
              const status = getStepStatus(step.name);
              return (
                <div
                  key={idx}
                  className={`p-2.5 rounded-lg border text-xs flex items-center gap-2 transition-all ${
                    status === 'completed'
                      ? 'bg-emerald-50/70 border-emerald-200 text-emerald-900 font-medium'
                      : status === 'active'
                      ? 'bg-indigo-50 border-indigo-300 text-indigo-900 font-semibold ring-1 ring-indigo-200'
                      : status === 'error' && state === 'Extraction failed' && idx === 1
                      ? 'bg-rose-50 border-rose-300 text-rose-900 font-semibold'
                      : 'bg-slate-50/60 border-slate-200/80 text-slate-400'
                  }`}
                >
                  <div className="shrink-0">
                    {status === 'completed' ? (
                      <CheckCheck className="w-3.5 h-3.5 text-emerald-600" />
                    ) : status === 'active' ? (
                      <RefreshCw className="w-3.5 h-3.5 text-indigo-600 animate-spin" />
                    ) : status === 'error' && idx === 1 ? (
                      <AlertCircle className="w-3.5 h-3.5 text-rose-600" />
                    ) : (
                      <div className="w-3.5 h-3.5 rounded-full border border-slate-300 flex items-center justify-center text-[9px] text-slate-400 font-mono">
                        {idx + 1}
                      </div>
                    )}
                  </div>
                  <span className="truncate text-[11px]">{step.label}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Safety Notice per requirement */}
      <div className="flex items-center gap-2 p-2.5 rounded-lg bg-amber-50/80 border border-amber-200/70 text-amber-900 text-xs">
        <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0" />
        <span className="text-[11px] font-medium leading-relaxed">
          <strong>Safety Notice:</strong> AI-extracted information should be verified against the original report. Gemini extracts only explicit data; it does not diagnose conditions or prescribe therapies.
        </span>
      </div>
    </div>
  );
};
