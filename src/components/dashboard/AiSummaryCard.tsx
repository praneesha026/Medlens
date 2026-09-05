import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  RefreshCw,
  AlertTriangle,
  CheckCircle2,
  HelpCircle,
  MessageSquare,
  ShieldCheck,
  FileText,
  Clock,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { PatientProfile, LabResult, ExtractedResultItem, PatientSummaryRecord } from '../../types';
import { GeminiService } from '../../services/geminiService';
import { StorageService } from '../../services/storageService';

interface AiSummaryCardProps {
  patient: PatientProfile;
  labResults: (LabResult | ExtractedResultItem)[];
  reportCount: number;
}

export const AiSummaryCard: React.FC<AiSummaryCardProps> = ({
  patient,
  labResults,
  reportCount
}) => {
  const [summary, setSummary] = useState<PatientSummaryRecord | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isExpanded, setIsExpanded] = useState<boolean>(true);

  // Check storage for cached summary on mount or patient change
  useEffect(() => {
    let isMounted = true;
    const loadCached = async () => {
      if (!patient || !patient.id) return;
      const cached = await StorageService.summaries.get(patient.id);
      if (isMounted && cached) {
        setSummary({
          ...cached,
          isCached: true
        });
      } else if (isMounted) {
        setSummary(null);
      }
    };
    loadCached();
    return () => {
      isMounted = false;
    };
  }, [patient?.id]);

  const handleGenerateSummary = async (forceRegenerate: boolean = false) => {
    if (isLoading) return; // Prevent duplicate requests
    setIsLoading(true);
    setError(null);

    try {
      const result = await GeminiService.generatePatientSummary(
        patient,
        labResults,
        reportCount,
        forceRegenerate
      );
      setSummary(result);
    } catch (err: any) {
      console.error('Failed to generate summary:', err);
      setError(err.message || 'Unable to generate summary at this time. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      id="ai-summary-card"
      className="bg-white rounded-xl border border-indigo-200 shadow-sm overflow-hidden"
    >
      {/* Top Banner & Header */}
      <div className="bg-gradient-to-r from-indigo-900 via-indigo-800 to-slate-900 text-white p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start sm:items-center space-x-3.5">
            <div className="w-10 h-10 rounded-lg bg-indigo-500/20 border border-indigo-400/40 flex items-center justify-center text-indigo-200 shrink-0">
              <Sparkles className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-indigo-500/30 text-indigo-200 border border-indigo-400/40">
                  AI-Generated Summary
                </span>
                {summary && (
                  <span className="text-[11px] font-medium text-indigo-300 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {new Date(summary.generatedAt).toLocaleDateString([], {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric'
                    })}
                  </span>
                )}
                {summary?.isCached && (
                  <span className="text-[10px] font-medium bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 px-1.5 py-0.2 rounded">
                    Cached
                  </span>
                )}
              </div>
              <h3 className="text-base sm:text-lg font-semibold text-white mt-1">
                Clinical Information Synthesis
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-center">
            {summary && (
              <button
                id="btn-regenerate-summary"
                type="button"
                onClick={() => handleGenerateSummary(true)}
                disabled={isLoading}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-indigo-700/70 hover:bg-indigo-600 text-white border border-indigo-500/40 transition-colors disabled:opacity-50"
                title="Regenerate summary with latest laboratory data"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
                <span>{isLoading ? 'Synthesizing...' : 'Regenerate'}</span>
              </button>
            )}

            <button
              id="btn-toggle-summary-expand"
              type="button"
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-1.5 rounded-lg text-indigo-300 hover:text-white hover:bg-indigo-800/60 transition-colors"
              aria-label={isExpanded ? 'Collapse AI Summary' : 'Expand AI Summary'}
            >
              {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mandatory Prominent AI Disclaimer */}
        <div className="mt-4 p-3 rounded-lg bg-indigo-950/70 border border-indigo-700/50 flex items-start gap-2.5 text-xs text-indigo-200">
          <ShieldCheck className="w-4 h-4 text-amber-300 shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            <strong className="text-amber-200 font-semibold">Important Clinical Notice:</strong>{' '}
            AI-generated information should be verified against the original medical report and
            should not be used as a substitute for professional medical advice. MedLens organizes
            documented clinical information and does not diagnose conditions or prescribe
            treatments.
          </p>
        </div>
      </div>

      {/* Card Content Area */}
      {isExpanded && (
        <div className="p-5 sm:p-6 space-y-6">
          {/* State 1: Error state */}
          {error && (
            <div
              id="summary-error-banner"
              className="p-4 rounded-lg bg-rose-50 border border-rose-200 flex items-start justify-between gap-3 text-rose-800 text-sm"
            >
              <div className="flex items-start gap-2.5">
                <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-rose-900">Summary Generation Failed</h4>
                  <p className="text-xs text-rose-700 mt-0.5">{error}</p>
                </div>
              </div>
              <button
                id="btn-retry-summary"
                type="button"
                onClick={() => handleGenerateSummary(true)}
                className="px-3 py-1 bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold rounded shadow-sm shrink-0"
              >
                Retry
              </button>
            </div>
          )}

          {/* State 2: Loading State */}
          {isLoading && (
            <div
              id="summary-loading-indicator"
              className="py-12 flex flex-col items-center justify-center text-center space-y-3"
            >
              <div className="w-10 h-10 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
              <div>
                <p className="text-sm font-semibold text-slate-800">
                  Synthesizing Verified Clinical Data...
                </p>
                <p className="text-xs text-slate-500 mt-1 max-w-md">
                  Analyzing {labResults.length} laboratory test(s) and structured patient history with
                  Gemini AI. Raw documents are never re-sent.
                </p>
              </div>
            </div>
          )}

          {/* State 3: No Summary Generated Yet */}
          {!summary && !isLoading && !error && (
            <div
              id="summary-empty-prompt"
              className="py-8 px-4 rounded-xl border border-dashed border-indigo-200 bg-indigo-50/40 text-center space-y-4"
            >
              <div className="w-12 h-12 rounded-full bg-indigo-100 text-indigo-600 mx-auto flex items-center justify-center">
                <FileText className="w-6 h-6" />
              </div>
              <div className="max-w-md mx-auto space-y-1">
                <h4 className="text-sm font-semibold text-slate-900">
                  Ready to Generate Patient Summary
                </h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Synthesize {labResults.length} documented laboratory analytes, active symptoms, and
                  existing medical conditions into a plain-language summary for patient-physician
                  consultations.
                </p>
              </div>
              <div>
                <button
                  id="btn-generate-ai-summary"
                  type="button"
                  onClick={() => handleGenerateSummary(false)}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-sm transition-all hover:shadow"
                >
                  <Sparkles className="w-4 h-4 text-amber-300" />
                  <span>Generate AI Summary</span>
                </button>
              </div>
              <p className="text-[11px] text-slate-500">
                Summary generation is manual and cached to minimize AI usage.
              </p>
            </div>
          )}

          {/* State 4: Active Summary Display */}
          {summary && !isLoading && (
            <div className="space-y-6">
              {/* Overview Paragraph */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  Clinical Overview
                </h4>
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 text-xs sm:text-sm text-slate-800 leading-relaxed">
                  {summary.overview}
                </div>
              </div>

              {/* Observed Findings & Missing Info Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Observed Findings */}
                <div className="space-y-2.5">
                  <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-emerald-800">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Key Observed Findings</span>
                  </div>
                  <div className="p-4 rounded-xl bg-emerald-50/50 border border-emerald-200/70 space-y-2.5">
                    {summary.observedFindings && summary.observedFindings.length > 0 ? (
                      summary.observedFindings.map((finding, idx) => (
                        <div key={idx} className="flex items-start gap-2 text-xs text-slate-700">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 mt-1.5 shrink-0" />
                          <span className="leading-relaxed">{finding}</span>
                        </div>
                      ))
                    ) : (
                      <p className="text-xs text-slate-500 italic">
                        No specific findings noted in structured data.
                      </p>
                    )}
                  </div>
                </div>

                {/* Missing or Incomplete Information */}
                <div className="space-y-2.5">
                  <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-amber-800">
                    <HelpCircle className="w-4 h-4 text-amber-600" />
                    <span>Missing or Incomplete Information</span>
                  </div>
                  <div className="p-4 rounded-xl bg-amber-50/50 border border-amber-200/70 space-y-2.5">
                    {summary.missingOrUncertainInfo && summary.missingOrUncertainInfo.length > 0 ? (
                      summary.missingOrUncertainInfo.map((info, idx) => (
                        <div key={idx} className="flex items-start gap-2 text-xs text-slate-700">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-600 mt-1.5 shrink-0" />
                          <span className="leading-relaxed">{info}</span>
                        </div>
                      ))
                    ) : (
                      <p className="text-xs text-slate-500 italic">
                        All structured records include complete reference ranges.
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Physician Dialogue Points */}
              {summary.doctorDiscussionTopics && summary.doctorDiscussionTopics.length > 0 && (
                <div className="space-y-2.5">
                  <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-indigo-900">
                    <MessageSquare className="w-4 h-4 text-indigo-600" />
                    <span>Suggested Questions for Your Healthcare Provider</span>
                  </div>
                  <div className="p-4 rounded-xl bg-indigo-50/50 border border-indigo-100 space-y-2">
                    <p className="text-xs text-slate-600 mb-2">
                      Neutral discussion points to help structure your upcoming appointment:
                    </p>
                    <div className="space-y-2">
                      {summary.doctorDiscussionTopics.map((topic, idx) => (
                        <div
                          key={idx}
                          className="p-2.5 rounded-lg bg-white border border-indigo-100/80 text-xs text-slate-800 flex items-start gap-2.5"
                        >
                          <span className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-700 font-semibold text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                            {idx + 1}
                          </span>
                          <span className="leading-relaxed">{topic}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
