import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  UploadCloud,
  FileText,
  CheckCircle2,
  AlertCircle,
  Clock,
  ArrowRight,
  X,
  Sparkles,
  FileCheck,
  AlertTriangle,
  RotateCcw,
  FileType,
  Eye,
  ShieldCheck
} from 'lucide-react';
import { usePatient } from '../context/PatientContext';
import { MedicalReport } from '../types';
import { SafetyNotice } from '../components/SafetyNotice';
import {
  ReportStorage,
  StoredReport,
  validateMedicalFile,
  formatFileSize,
  getFriendlyFileType,
  MAX_FILE_SIZE_BYTES
} from '../utils/reportStorage';

type UploadState =
  | 'NO_FILE'
  | 'FILE_SELECTED'
  | 'UPLOADING'
  | 'PROCESSING'
  | 'READY_FOR_REVIEW'
  | 'ERROR';

export const ReportUploadPage: React.FC = () => {
  const navigate = useNavigate();
  const { addUploadedReport } = usePatient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const uploadTimerRef = useRef<NodeJS.Timeout | null>(null);
  const processingTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Core State Machine
  const [uploadState, setUploadState] = useState<UploadState>('NO_FILE');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [completedReport, setCompletedReport] = useState<MedicalReport | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number>(0);

  // Clean up timers on unmount
  useEffect(() => {
    return () => {
      if (uploadTimerRef.current) clearTimeout(uploadTimerRef.current);
      if (processingTimerRef.current) clearTimeout(processingTimerRef.current);
    };
  }, []);

  /**
   * Quick Sample Preset Selector for fast evaluation
   */
  const samplePresets = [
    {
      name: 'Comprehensive_Metabolic_Panel.pdf',
      mime: 'application/pdf',
      size: 1420000,
      description: 'PDF Document • 1.4 MB'
    },
    {
      name: 'Chest_XRay_Digital_Radiography.jpg',
      mime: 'image/jpeg',
      size: 2850000,
      description: 'JPEG Image • 2.9 MB'
    },
    {
      name: 'Twelve_Lead_ECG_Rhythm_Trace.png',
      mime: 'image/png',
      size: 840000,
      description: 'PNG Image • 840 KB'
    }
  ];

  /**
   * Handle File Ingestion with Full Validation
   */
  const processIncomingFile = (file: File) => {
    // Reset previous error or completed state
    setErrorMessage(null);
    setCompletedReport(null);
    setUploadProgress(0);

    // Validate type and size (10 MB limit)
    const validation = validateMedicalFile(file);
    if (!validation.valid) {
      setSelectedFile(file);
      setUploadState('ERROR');
      setErrorMessage(validation.error || 'Invalid file.');
      return;
    }

    // Valid file selected
    setSelectedFile(file);
    setUploadState('FILE_SELECTED');
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processIncomingFile(e.target.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processIncomingFile(e.dataTransfer.files[0]);
    }
  };

  /**
   * Cancel/Remove file
   */
  const handleRemoveFile = () => {
    if (uploadTimerRef.current) clearTimeout(uploadTimerRef.current);
    if (processingTimerRef.current) clearTimeout(processingTimerRef.current);

    setSelectedFile(null);
    setCompletedReport(null);
    setUploadState('NO_FILE');
    setErrorMessage(null);
    setUploadProgress(0);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  /**
   * Trigger Sample File for testing
   */
  const handleSelectSample = (preset: typeof samplePresets[0]) => {
    const dummyContent = `MedLens clinical source document header\nFile: ${preset.name}\nTimestamp: ${new Date().toISOString()}`;
    const blob = new Blob([dummyContent], { type: preset.mime });
    const file = new File([blob], preset.name, { type: preset.mime });
    // Simulate size property for testing
    Object.defineProperty(file, 'size', { value: preset.size, writable: false });
    processIncomingFile(file);
  };

  /**
   * Trigger Invalid File (Test error handling)
   */
  const handleTestInvalidType = () => {
    const file = new File(['text payload'], 'invalid_clinical_notes.exe', { type: 'application/x-msdownload' });
    processIncomingFile(file);
  };

  /**
   * Trigger Oversized File (Test 10MB limit error handling)
   */
  const handleTestOversized = () => {
    const file = new File(['huge payload'], 'oversized_radiology_scan.pdf', { type: 'application/pdf' });
    Object.defineProperty(file, 'size', { value: 12 * 1024 * 1024, writable: false }); // 12 MB
    processIncomingFile(file);
  };

  /**
   * Upload and Processing Flow
   */
  const handleStartUpload = () => {
    if (!selectedFile) {
      setUploadState('ERROR');
      setErrorMessage('Missing file. Please select a file before continuing.');
      return;
    }

    // Re-verify file validity before upload
    const validation = validateMedicalFile(selectedFile);
    if (!validation.valid) {
      setUploadState('ERROR');
      setErrorMessage(validation.error || 'Invalid file.');
      return;
    }

    // Phase 1: UPLOADING state (simulated progress)
    setUploadState('UPLOADING');
    setUploadProgress(25);

    uploadTimerRef.current = setTimeout(() => {
      setUploadProgress(75);

      uploadTimerRef.current = setTimeout(() => {
        setUploadProgress(100);

        // Phase 2: PROCESSING state (simulated UI state)
        setUploadState('PROCESSING');

        processingTimerRef.current = setTimeout(() => {
          // Construct required local report object metadata
          const reportId = `rep_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 6)}`;
          const today = new Date().toISOString().split('T')[0];
          const friendlyType = getFriendlyFileType(selectedFile);
          const formattedSize = formatFileSize(selectedFile.size);

          const reportMetadata: StoredReport = {
            id: reportId,
            fileName: selectedFile.name,
            fileType: friendlyType,
            fileSize: formattedSize,
            uploadDate: today,
            status: 'READY_FOR_REVIEW',
            source: 'User Uploaded'
          };

          try {
            // Save to LocalStorage via decoupled ReportStorage
            ReportStorage.saveReport(reportMetadata);

            // Store document data URL in sessionStorage for Gemini extraction
            try {
              const reader = new FileReader();
              reader.onload = () => {
                if (reader.result && typeof reader.result === 'string') {
                  try {
                    sessionStorage.setItem(`doc_content_${reportId}`, reader.result);
                  } catch (e) {
                    console.warn('Storage quota limit for document dataURL:', e);
                  }
                }
              };
              reader.readAsDataURL(selectedFile);
            } catch (err) {
              console.warn('Could not read file dataURL:', err);
            }

            // Create compatible MedicalReport for context
            const fullReport: MedicalReport = {
              id: reportId,
              title: selectedFile.name,
              type: friendlyType,
              date: today,
              uploadDate: today,
              provider: 'Self-Uploaded / Patient Record',
              facility: 'Patient Ingestion Portal',
              fileName: selectedFile.name,
              fileSize: formattedSize,
              fileType: friendlyType,
              source: 'User Uploaded',
              status: 'READY_FOR_REVIEW',
              summaryPlaceholder: 'AI extraction will be available in the next step.',
              keyFindings: [],
              labResults: []
            };

            addUploadedReport(fullReport);
            setCompletedReport(fullReport);
            setUploadState('READY_FOR_REVIEW');
          } catch (storageErr: any) {
            console.error('LocalStorage error:', storageErr);
            setUploadState('ERROR');
            setErrorMessage(
              storageErr.message ||
                'Storage error: Unable to save report metadata to browser local storage. Please check storage quota.'
            );
          }
        }, 900); // 900ms simulated processing
      }, 400);
    }, 400);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 sm:px-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
            <UploadCloud className="w-3.5 h-3.5 text-indigo-600" />
            <span>Document Ingestion Portal</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-800 tracking-tight">
            Medical Report Upload
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Upload PDF or image records (max 10 MB). Documents are organized locally as source records.
          </p>
        </div>

        {/* Upload State Ribbon */}
        <div className="flex items-center gap-2 self-start sm:self-center">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">State:</span>
          {uploadState === 'NO_FILE' && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200">
              <span className="w-2 h-2 rounded-full bg-slate-400" />
              1. No file selected
            </span>
          )}
          {uploadState === 'FILE_SELECTED' && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
              <span className="w-2 h-2 rounded-full bg-indigo-500" />
              2. File selected
            </span>
          )}
          {uploadState === 'UPLOADING' && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200 animate-pulse">
              <Clock className="w-3 h-3 animate-spin text-amber-600" />
              3. Uploading ({uploadProgress}%)
            </span>
          )}
          {uploadState === 'PROCESSING' && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-indigo-100 text-indigo-800 border border-indigo-300 animate-pulse">
              <Clock className="w-3 h-3 animate-spin text-indigo-600" />
              4. Processing
            </span>
          )}
          {uploadState === 'READY_FOR_REVIEW' && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-300">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              5. Ready for review
            </span>
          )}
          {uploadState === 'ERROR' && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-100 text-rose-800 border border-rose-300">
              <AlertCircle className="w-3.5 h-3.5 text-rose-600" />
              6. Error
            </span>
          )}
        </div>
      </div>

      {/* Safety Notice */}
      <SafetyNotice variant="compact" />

      {/* Quick Test Samples Bar */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm space-y-2.5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
            <span>Sample Documents for Rapid Evaluation</span>
          </span>
          <span className="text-[11px] text-slate-400">Click to stage synthetic file</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          {samplePresets.map((preset, idx) => (
            <button
              key={idx}
              type="button"
              id={`btn-sample-file-${idx}`}
              onClick={() => handleSelectSample(preset)}
              className="text-left p-2.5 rounded-lg border border-slate-200 hover:border-indigo-400 hover:bg-indigo-50/40 transition-colors group focus:outline-none"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-md bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0 group-hover:bg-indigo-100">
                  <FileText className="w-3.5 h-3.5" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-slate-800 truncate group-hover:text-indigo-900">
                    {preset.name}
                  </p>
                  <p className="text-[10px] text-slate-400">{preset.description}</p>
                </div>
              </div>
            </button>
          ))}
        </div>

        {/* Fast Edge-Case Test Links */}
        <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
          <span>Test Validation Handlers:</span>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleTestInvalidType}
              className="text-rose-600 hover:underline font-medium"
            >
              Test Invalid Type (.exe)
            </button>
            <span>&bull;</span>
            <button
              type="button"
              onClick={handleTestOversized}
              className="text-rose-600 hover:underline font-medium"
            >
              Test Oversized File (12 MB)
            </button>
          </div>
        </div>
      </div>

      {/* Drag and Drop Upload Box */}
      <div
        id="dropzone-upload-area"
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => {
          if (uploadState !== 'UPLOADING' && uploadState !== 'PROCESSING') {
            fileInputRef.current?.click();
          }
        }}
        className={`relative border-2 border-dashed rounded-xl p-8 sm:p-12 text-center cursor-pointer transition-all duration-200 ${
          isDragging
            ? 'border-indigo-500 bg-indigo-50/50 scale-[1.005]'
            : 'border-slate-300 hover:border-indigo-400 bg-white hover:bg-slate-50/50 shadow-sm'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          id="file-upload-input"
          accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png"
          className="hidden"
          onChange={handleFileChange}
        />

        <div className="flex flex-col items-center justify-center space-y-3">
          <div className="w-14 h-14 rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-700 flex items-center justify-center shadow-2xs">
            <UploadCloud className="w-7 h-7" />
          </div>

          <div className="space-y-1 max-w-sm">
            <h3 className="text-sm font-bold text-slate-800">
              {isDragging ? 'Drop file to stage' : 'Drag & drop medical report here'}
            </h3>
            <p className="text-xs text-slate-500">
              Supports <strong className="text-slate-700 font-semibold">PDF, JPG/JPEG, or PNG</strong> files
            </p>
            <p className="text-[11px] text-slate-400">
              Maximum allowed file size: 10 MB
            </p>
          </div>

          <button
            type="button"
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors mt-2 border border-slate-200"
          >
            Browse / Select File
          </button>
        </div>
      </div>

      {/* Error Alert Display */}
      {uploadState === 'ERROR' && errorMessage && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 flex items-start gap-3 text-rose-800 animate-in fade-in">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0">
            <h4 className="text-xs font-bold uppercase tracking-wider text-rose-900">
              Upload Error
            </h4>
            <p className="text-xs text-rose-700 mt-0.5 leading-relaxed">{errorMessage}</p>
          </div>
          <button
            type="button"
            onClick={handleRemoveFile}
            className="text-xs font-semibold text-rose-700 hover:text-rose-900 hover:underline shrink-0"
          >
            Clear & Try Again
          </button>
        </div>
      )}

      {/* Selected File Details & Actions Card */}
      {selectedFile && (
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
            <div className="flex items-center gap-3.5 min-w-0">
              <div className="w-12 h-12 rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-700 flex items-center justify-center shrink-0 shadow-2xs">
                <FileText className="w-6 h-6" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm font-bold text-slate-900 truncate">
                    {selectedFile.name}
                  </span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200 font-semibold">
                    {getFriendlyFileType(selectedFile)}
                  </span>
                  <span className="text-[10px] font-mono text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                    {formatFileSize(selectedFile.size)}
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  Source: User Uploaded &bull; Ready for ingestion
                </p>
              </div>
            </div>

            {/* Action Buttons: Remove & Upload/Continue */}
            <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
              {uploadState !== 'UPLOADING' && uploadState !== 'PROCESSING' && (
                <button
                  type="button"
                  id="btn-remove-file"
                  onClick={handleRemoveFile}
                  className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-600 hover:text-rose-600 hover:bg-rose-50 rounded-lg border border-slate-200 hover:border-rose-200 transition-colors"
                  title="Remove selected file"
                >
                  <X className="w-3.5 h-3.5" />
                  <span>Remove File</span>
                </button>
              )}

              {uploadState !== 'READY_FOR_REVIEW' && (
                <button
                  type="button"
                  id="btn-upload-continue"
                  onClick={handleStartUpload}
                  disabled={uploadState === 'UPLOADING' || uploadState === 'PROCESSING'}
                  className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg font-semibold text-xs transition-colors shadow-xs ${
                    uploadState === 'UPLOADING' || uploadState === 'PROCESSING'
                      ? 'bg-indigo-700 text-white cursor-wait opacity-85'
                      : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                  }`}
                >
                  {uploadState === 'UPLOADING' ? (
                    <>
                      <Clock className="w-4 h-4 animate-spin" />
                      <span>Uploading... ({uploadProgress}%)</span>
                    </>
                  ) : uploadState === 'PROCESSING' ? (
                    <>
                      <Clock className="w-4 h-4 animate-spin" />
                      <span>Processing (Simulated)...</span>
                    </>
                  ) : (
                    <>
                      <UploadCloud className="w-4 h-4" />
                      <span>Upload / Continue</span>
                    </>
                  )}
                </button>
              )}
            </div>
          </div>

          {/* Upload Progress Bar (when Uploading or Processing) */}
          {(uploadState === 'UPLOADING' || uploadState === 'PROCESSING') && (
            <div className="space-y-2 py-1">
              <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
                <span>
                  {uploadState === 'UPLOADING'
                    ? 'Transferring document data to local sandbox...'
                    : 'Validating metadata boundaries & structuring record...'}
                </span>
                <span className="font-mono text-indigo-700 font-bold">
                  {uploadState === 'UPLOADING' ? `${uploadProgress}%` : 'Simulating Ingestion'}
                </span>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-indigo-600 h-full transition-all duration-300 ease-out"
                  style={{
                    width: uploadState === 'PROCESSING' ? '100%' : `${uploadProgress}%`
                  }}
                />
              </div>
              <p className="text-[11px] text-slate-400 italic">
                * Note: In Step 3, processing is client-side simulated without external AI APIs.
              </p>
            </div>
          )}

          {/* Ready For Review State Card */}
          {uploadState === 'READY_FOR_REVIEW' && completedReport && (
            <div className="p-4 sm:p-5 rounded-xl bg-slate-900 text-white space-y-4 shadow-md animate-in fade-in">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      {completedReport.status}
                    </span>
                    <span className="text-xs text-slate-400 font-mono">
                      ID: {completedReport.id}
                    </span>
                  </div>
                  <h4 className="text-base font-bold text-white mt-1">
                    {completedReport.fileName}
                  </h4>
                  <div className="flex items-center gap-3 text-xs text-slate-300 flex-wrap">
                    <span>Type: <strong>{completedReport.fileType}</strong></span>
                    <span>&bull;</span>
                    <span>Size: <strong>{completedReport.fileSize}</strong></span>
                    <span>&bull;</span>
                    <span>Upload Date: <strong>{completedReport.uploadDate}</strong></span>
                    <span>&bull;</span>
                    <span>Source: <strong>{completedReport.source}</strong></span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleRemoveFile}
                    className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-200 border border-slate-700 transition-colors"
                  >
                    Upload Another
                  </button>
                </div>
              </div>

              {/* Extraction Next Step Notice */}
              <div className="p-3.5 rounded-lg bg-slate-800/80 border border-slate-700 text-xs text-slate-300 flex items-start gap-2.5">
                <ShieldCheck className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-white block">
                    Document cataloged & ready for Gemini AI extraction.
                  </span>
                  <span className="text-[11px] text-slate-400">
                    Document metadata is stored locally in your session. You can now run structured laboratory entity extraction and verify results in Step 4.
                  </span>
                </div>
              </div>

              {/* Navigation Action Links */}
              <div className="flex flex-col sm:flex-row items-center justify-end gap-2.5 pt-1">
                <Link
                  id="btn-process-with-gemini"
                  to={`/report-details?reportId=${completedReport.id}&autoProcess=true`}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-xs font-semibold text-white shadow-xs transition-colors"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Extract with Gemini AI</span>
                </Link>

                <Link
                  id="btn-view-report-details"
                  to={`/report-details?reportId=${completedReport.id}`}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-white border border-slate-700 transition-colors"
                >
                  <Eye className="w-3.5 h-3.5 text-slate-300" />
                  <span>View Details</span>
                </Link>

                <Link
                  id="btn-go-to-dashboard"
                  to="/dashboard"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 border border-slate-700 transition-colors"
                >
                  <span>Dashboard</span>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                </Link>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
