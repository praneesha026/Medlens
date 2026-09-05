import React, { useState, useMemo, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import {
  FileText,
  Calendar,
  Building2,
  ArrowLeft,
  Printer,
  FileCheck,
  AlertCircle,
  UploadCloud,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  RefreshCw,
  FileCode2,
  Layers,
  Database
} from 'lucide-react';
import { usePatient } from '../context/PatientContext';
import { formatDate } from '../utils/formatters';
import { SafetyNotice } from '../components/SafetyNotice';
import { ExtractionStateBanner } from '../components/ExtractionStateBanner';
import { ExtractedResultsTable } from '../components/ExtractedResultsTable';
import { EditResultModal } from '../components/EditResultModal';
import { EdgeCaseTestPanel } from '../components/EdgeCaseTestPanel';
import {
  ExtractionProcessingState,
  ReportExtractionRecord,
  ExtractedResultItem
} from '../types';
import { GeminiService } from '../services/geminiService';
import { ExtractionStorage } from '../utils/extractionStorage';

export const ReportDetailsPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { reports } = usePatient();

  const reportIdParam = searchParams.get('reportId');
  const autoProcessParam = searchParams.get('autoProcess') === 'true';

  // Selected report state
  const selectedReport = useMemo(() => {
    if (reportIdParam) {
      const found = reports.find((r) => r.id === reportIdParam);
      if (found) return found;
    }
    return reports[0] || null;
  }, [reports, reportIdParam]);

  // Extraction State Machine
  const [processingState, setProcessingState] = useState<ExtractionProcessingState>('Ready');
  const [statusMessage, setStatusMessage] = useState<string>('');
  const [extractionRecord, setExtractionRecord] = useState<ReportExtractionRecord | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [extractionError, setExtractionError] = useState<string | null>(null);

  // Edit Modal State
  const [editingItem, setEditingItem] = useState<ExtractedResultItem | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);

  // Raw Document View Tab / Extracted View Tab
  const [activeTab, setActiveTab] = useState<'EXTRACTED' | 'RAW_PAYLOAD'>('EXTRACTED');

  // Load existing extraction from local storage on report change (Requirement 13: Avoid duplicate API calls)
  useEffect(() => {
    if (!selectedReport) {
      setExtractionRecord(null);
      setProcessingState('Ready');
      return;
    }

    const cached = ExtractionStorage.getExtraction(selectedReport.id);
    if (cached && cached.extractionStatus === 'COMPLETED') {
      setExtractionRecord(cached);
      setProcessingState('Extraction complete');
      setStatusMessage(`Loaded cached extraction results with ${cached.results.length} tests.`);
      setExtractionError(null);
    } else if (cached && cached.extractionStatus === 'FAILED') {
      setExtractionRecord(cached);
      setProcessingState('Extraction failed');
      setExtractionError(cached.error || 'Previous extraction failed.');
    } else {
      setExtractionRecord(null);
      setProcessingState('Ready');
      setStatusMessage('');
      setExtractionError(null);

      // If user came directly from upload with autoProcess=true
      if (autoProcessParam) {
        handleProcessReport();
      }
    }
  }, [selectedReport?.id, autoProcessParam]);

  const handleSelectReport = (id: string) => {
    setSearchParams({ reportId: id });
  };

  /**
   * Trigger Gemini AI Extraction Workflow
   */
  const handleProcessReport = async (forceReprocess: boolean = false) => {
    if (!selectedReport) return;

    setIsLoading(true);
    setExtractionError(null);
    setProcessingState('Processing report...');

    try {
      // Check for cached raw document / dataURL from session storage
      const sessionData = sessionStorage.getItem(`doc_content_${selectedReport.id}`);
      let inlineData: { mimeType: string; data: string } | undefined = undefined;

      if (sessionData && sessionData.startsWith('data:')) {
        const parts = sessionData.split(';base64,');
        if (parts.length === 2) {
          const mime = parts[0].replace('data:', '');
          inlineData = {
            mimeType: mime,
            data: parts[1]
          };
        }
      }

      const record = await GeminiService.extractReport(
        {
          reportId: selectedReport.id,
          fileName: selectedReport.fileName || selectedReport.title,
          fileType: selectedReport.fileType || selectedReport.type,
          textContent:
            selectedReport.summaryPlaceholder ||
            `Laboratory Report: ${selectedReport.title}. Date: ${selectedReport.date}. Provider: ${selectedReport.provider}. Facility: ${selectedReport.facility}`,
          inlineData,
          forceReprocess
        },
        (state, message) => {
          setProcessingState(state);
          if (message) setStatusMessage(message);
        }
      );

      setExtractionRecord(record);
      setProcessingState('Extraction complete');
    } catch (err: any) {
      console.error('Extraction handler error:', err);
      setProcessingState('Extraction failed');
      setExtractionError(err.message || 'Gemini report extraction failed.');
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Run Synthetic Edge-Case Test Preset (Requirement 12)
   */
  const handleRunSyntheticTest = async (presetKey: string) => {
    if (!selectedReport) return;

    setIsLoading(true);
    setExtractionError(null);
    setProcessingState('Processing report...');

    try {
      const record = await GeminiService.runSyntheticTest(
        selectedReport.id,
        presetKey,
        (state, message) => {
          setProcessingState(state);
          if (message) setStatusMessage(message);
        }
      );

      setExtractionRecord(record);
      setProcessingState('Extraction complete');
    } catch (err: any) {
      setProcessingState('Extraction failed');
      setExtractionError(err.message || 'Synthetic test failed.');
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Toggle Human Verification on a Result Item
   */
  const handleToggleVerify = (itemId: string, currentStatus: boolean) => {
    if (!selectedReport) return;
    const updatedRecord = ExtractionStorage.verifyResultItem(
      selectedReport.id,
      itemId,
      !currentStatus
    );
    if (updatedRecord) {
      setExtractionRecord({ ...updatedRecord });
    }
  };

  /**
   * Open Edit Modal for Result Item
   */
  const handleOpenEdit = (item: ExtractedResultItem) => {
    setEditingItem(item);
    setIsEditModalOpen(true);
  };

  /**
   * Save Item Edit (Marks as Human Verified)
   */
  const handleSaveEdit = (updatedFields: Partial<ExtractedResultItem>) => {
    if (!selectedReport || !editingItem) return;
    const updatedRecord = ExtractionStorage.updateResultItem(
      selectedReport.id,
      editingItem.id,
      updatedFields
    );
    if (updatedRecord) {
      setExtractionRecord({ ...updatedRecord });
    }
    setEditingItem(null);
    setIsEditModalOpen(false);
  };

  // Compute stats
  const resultsList = extractionRecord?.results || [];
  const verifiedCount = resultsList.filter((r) => r.isHumanVerified).length;
  const highConfidenceCount = resultsList.filter(
    (r) => r.confidenceLevel === 'High confidence'
  ).length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header & Navigation */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 sm:px-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <Link
            id="back-to-dashboard-link"
            to="/dashboard"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-600 hover:text-indigo-800 transition-colors mb-1"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Dashboard</span>
          </Link>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold text-slate-800 tracking-tight">
              Medical Report Details
            </h1>
            <span className="text-[10px] px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 font-mono font-bold border border-indigo-200">
              Step 4: Gemini AI Extraction
            </span>
          </div>
          <p className="text-xs text-slate-500">
            Structured clinical entity extraction, confidence auditing, and human verification.
          </p>
        </div>

        {/* Quick Report Switcher */}
        {reports.length > 1 && (
          <div className="flex items-center gap-3">
            <div className="flex flex-col text-right">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Switch Document
              </span>
              <select
                id="report-select-dropdown"
                value={selectedReport?.id || ''}
                onChange={(e) => handleSelectReport(e.target.value)}
                className="text-xs font-medium rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-slate-800 shadow-2xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              >
                {reports.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.fileName || r.title} ({r.uploadDate || r.date})
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Safety Notice: Persistent Clinical Disclaimer */}
      <SafetyNotice variant="compact" />

      {selectedReport ? (
        <div className="space-y-6">
          {/* Section: Report Information */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 sm:p-6 shadow-sm space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-700 flex items-center justify-center shrink-0 shadow-2xs">
                  <FileText className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-slate-400 uppercase tracking-wider">
                    Source Document Metadata
                  </h2>
                  <h3 className="text-lg sm:text-xl font-bold text-slate-900 mt-0.5">
                    {extractionRecord?.report?.fileName || selectedReport.fileName || selectedReport.title}
                  </h3>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span
                  className={`text-xs px-2.5 py-1 rounded-full font-bold uppercase tracking-wider ${
                    processingState === 'Extraction complete'
                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                      : processingState === 'Extraction failed'
                      ? 'bg-rose-100 text-rose-800 border border-rose-200'
                      : 'bg-indigo-100 text-indigo-800 border border-indigo-200'
                  }`}
                >
                  {processingState === 'Extraction complete' ? 'Extracted & Audited' : processingState}
                </span>

                <button
                  type="button"
                  onClick={() => window.print()}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-medium transition-colors shadow-2xs"
                >
                  <Printer className="w-3.5 h-3.5 text-slate-500" />
                  <span>Print</span>
                </button>
              </div>
            </div>

            {/* 4 Required Report Information Fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200/70 space-y-1">
                <span className="text-slate-400 block text-[11px] font-bold uppercase tracking-wider">
                  File Name
                </span>
                <span className="font-semibold text-slate-900 truncate block text-xs">
                  {extractionRecord?.report?.fileName || selectedReport.fileName || selectedReport.title}
                </span>
                {selectedReport.fileSize && (
                  <span className="text-[10px] text-slate-400 font-mono block">
                    Size: {selectedReport.fileSize}
                  </span>
                )}
              </div>

              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200/70 space-y-1">
                <span className="text-slate-400 block text-[11px] font-bold uppercase tracking-wider">
                  Report Date
                </span>
                <span className="font-semibold text-slate-900 flex items-center gap-1.5 text-xs">
                  <Calendar className="w-3.5 h-3.5 text-indigo-600" />
                  {formatDate(
                    extractionRecord?.report?.reportDate ||
                      selectedReport.uploadDate ||
                      selectedReport.date
                  )}
                </span>
                <span className="text-[10px] text-slate-400 font-mono block">
                  ISO: {extractionRecord?.report?.reportDate || selectedReport.uploadDate || selectedReport.date}
                </span>
              </div>

              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200/70 space-y-1">
                <span className="text-slate-400 block text-[11px] font-bold uppercase tracking-wider">
                  Report Type
                </span>
                <span className="font-semibold text-slate-900 truncate block text-xs">
                  {extractionRecord?.report?.reportType || selectedReport.fileType || selectedReport.type || 'Laboratory Panel'}
                </span>
                <span className="text-[10px] text-slate-400 block">
                  Format: {selectedReport.fileType || 'Medical Report'}
                </span>
              </div>

              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200/70 space-y-1">
                <span className="text-slate-400 block text-[11px] font-bold uppercase tracking-wider">
                  Source / Facility
                </span>
                <span className="font-semibold text-slate-900 flex items-center gap-1.5 text-xs">
                  <Building2 className="w-3.5 h-3.5 text-indigo-600" />
                  {extractionRecord?.report?.facility || selectedReport.facility || selectedReport.source || 'User Uploaded'}
                </span>
                <span className="text-[10px] text-slate-400 block">
                  Channel: {extractionRecord?.report?.source || selectedReport.source || 'Direct Client Ingestion'}
                </span>
              </div>
            </div>
          </div>

          {/* Section: Gemini AI Extraction State Machine Banner */}
          <ExtractionStateBanner
            state={processingState}
            statusMessage={statusMessage}
            hasCachedData={Boolean(extractionRecord && extractionRecord.results.length > 0)}
            totalResults={resultsList.length}
            verifiedResults={verifiedCount}
            onProcess={() => handleProcessReport(false)}
            onReprocess={() => handleProcessReport(true)}
            isLoading={isLoading}
          />

          {/* Error Details Card if Extraction Failed */}
          {processingState === 'Extraction failed' && extractionError && (
            <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-900 space-y-2">
              <div className="flex items-center gap-2 font-bold text-xs">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>Extraction Error Diagnostic</span>
              </div>
              <p className="text-xs text-rose-700 leading-relaxed font-mono bg-rose-100/70 p-2.5 rounded-lg">
                {extractionError}
              </p>
              <p className="text-[11px] text-rose-600">
                You can retry extraction, upload another document, or test standard edge-case fixtures below.
              </p>
            </div>
          )}

          {/* Section: Extracted Medical Information Content */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 sm:p-6 shadow-sm space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800 flex items-center gap-2">
                  <span>Extracted Medical Information</span>
                  {resultsList.length > 0 && (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 font-bold border border-indigo-200">
                      {resultsList.length} entities
                    </span>
                  )}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Structured laboratory analytes, reference intervals, confidence indicators, and human audit status.
                </p>
              </div>

              {/* View Toggle (Table vs Structured JSON) */}
              {resultsList.length > 0 && (
                <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg text-xs font-semibold">
                  <button
                    type="button"
                    onClick={() => setActiveTab('EXTRACTED')}
                    className={`px-3 py-1 rounded-md transition-all ${
                      activeTab === 'EXTRACTED'
                        ? 'bg-white text-indigo-700 shadow-2xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Table View
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('RAW_PAYLOAD')}
                    className={`px-3 py-1 rounded-md transition-all flex items-center gap-1.5 ${
                      activeTab === 'RAW_PAYLOAD'
                        ? 'bg-white text-indigo-700 shadow-2xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <FileCode2 className="w-3.5 h-3.5" />
                    <span>JSON Schema</span>
                  </button>
                </div>
              )}
            </div>

            {/* Display View: Extracted Results Table */}
            {activeTab === 'EXTRACTED' && (
              <>
                {resultsList.length > 0 ? (
                  <ExtractedResultsTable
                    results={resultsList}
                    onToggleVerify={handleToggleVerify}
                    onEditItem={handleOpenEdit}
                    reportFileName={selectedReport.fileName || selectedReport.title}
                  />
                ) : processingState === 'Ready' ? (
                  /* Clean Ready State Placeholder */
                  <div className="p-8 sm:p-12 rounded-xl bg-slate-50 border border-dashed border-slate-300 text-center space-y-4">
                    <div className="w-12 h-12 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-600 mx-auto flex items-center justify-center shadow-2xs">
                      <Sparkles className="w-6 h-6 text-indigo-600" />
                    </div>
                    <div className="space-y-1 max-w-md mx-auto">
                      <h4 className="text-base font-bold text-slate-800">
                        Ready for Gemini AI Extraction
                      </h4>
                      <p className="text-xs text-slate-500 leading-relaxed">
                        Click <strong>Process Report with Gemini</strong> above to extract laboratory results, exact reference ranges, and observations into structured data.
                      </p>
                    </div>

                    <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
                      <button
                        type="button"
                        onClick={() => handleProcessReport(false)}
                        disabled={isLoading}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs transition-colors"
                      >
                        <Sparkles className="w-4 h-4" />
                        <span>Process Report with Gemini</span>
                      </button>

                      <Link
                        to="/upload"
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-white hover:bg-slate-100 text-slate-700 text-xs font-medium border border-slate-200 transition-colors shadow-2xs"
                      >
                        <UploadCloud className="w-3.5 h-3.5 text-indigo-600" />
                        <span>Upload Another Report</span>
                      </Link>
                    </div>
                  </div>
                ) : processingState === 'Extraction failed' ? (
                  <div className="p-8 text-center text-slate-400 space-y-2">
                    <p className="text-xs">No extracted entities available due to extraction failure.</p>
                  </div>
                ) : null}
              </>
            )}

            {/* Display View: Raw Validated JSON Payload */}
            {activeTab === 'RAW_PAYLOAD' && extractionRecord && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs text-slate-500 font-mono">
                  <span>Structured Output Verified Against Medical Schema</span>
                  <span className="text-[10px] text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    Valid JSON
                  </span>
                </div>
                <pre className="p-4 bg-slate-900 text-slate-100 rounded-xl text-xs font-mono overflow-x-auto max-h-96 border border-slate-800">
                  {JSON.stringify(extractionRecord, null, 2)}
                </pre>
              </div>
            )}
          </div>

          {/* Section: Clinical Testing & Edge-Case Validator Panel (Requirement 12) */}
          <EdgeCaseTestPanel
            onRunTest={handleRunSyntheticTest}
            isLoading={isLoading}
          />
        </div>
      ) : (
        /* Empty Report State */
        <div className="p-12 text-center bg-white rounded-xl border border-slate-200 shadow-sm space-y-4">
          <FileText className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="text-base font-bold text-slate-800">No Medical Report Selected</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Please upload a report or choose a report from the dashboard to inspect and extract structured laboratory records.
          </p>
          <Link
            to="/upload"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-600 text-white text-xs font-semibold shadow-xs hover:bg-indigo-700 transition-colors"
          >
            <UploadCloud className="w-4 h-4" />
            <span>Upload New Report</span>
          </Link>
        </div>
      )}

      {/* Edit Result Modal */}
      <EditResultModal
        item={editingItem}
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setEditingItem(null);
        }}
        onSave={handleSaveEdit}
      />
    </div>
  );
};
