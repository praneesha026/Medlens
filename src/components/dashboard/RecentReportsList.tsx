import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  FileText,
  ArrowRight,
  UploadCloud,
  Calendar,
  Building2,
  Trash2,
  AlertTriangle,
  FileCheck,
  FileType,
  Search,
  Filter,
  Sparkles,
  Clock
} from 'lucide-react';
import { MedicalReport } from '../../types';
import { formatDate } from '../../utils/formatters';
import { usePatient } from '../../context/PatientContext';
import { ExtractionStorage } from '../../utils/extractionStorage';

interface RecentReportsListProps {
  reports: MedicalReport[];
}

export const RecentReportsList: React.FC<RecentReportsListProps> = ({ reports }) => {
  const { deleteUploadedReport } = usePatient();
  const [reportToDelete, setReportToDelete] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');

  const confirmDelete = () => {
    if (reportToDelete) {
      deleteUploadedReport(reportToDelete);
      setReportToDelete(null);
    }
  };

  // Extract available report types for filter dropdown
  const availableTypes = useMemo(() => {
    const set = new Set<string>();
    reports.forEach((r) => {
      const type = r.fileType || r.type || 'Medical Report';
      if (type) set.add(type);
    });
    return ['All', ...Array.from(set)];
  }, [reports]);

  // Filter reports by search, type, and status (Requirement 6)
  const filteredReports = useMemo(() => {
    return reports.filter((report) => {
      const name = (report.fileName || report.title || '').toLowerCase();
      const matchesSearch = name.includes(searchTerm.toLowerCase());

      const reportType = report.fileType || report.type || 'Medical Report';
      const matchesType = typeFilter === 'All' || reportType === typeFilter;

      const matchesStatus =
        statusFilter === 'All' ||
        (statusFilter === 'Processed' && (report.status === 'Processed' || report.status === 'READY_FOR_REVIEW')) ||
        (statusFilter === 'Processing' && report.status === 'Processing');

      return matchesSearch && matchesType && matchesStatus;
    });
  }, [reports, searchTerm, typeFilter, statusFilter]);

  return (
    <div
      id="recent-reports-card"
      className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-4"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
        <div>
          <h3 className="text-base font-semibold text-slate-900 flex items-center gap-2">
            <FileText className="w-4 h-4 text-indigo-600" />
            <span>Document & Medical Reports</span>
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Ingested medical records, laboratory panels, and diagnostic documents on file.
          </p>
        </div>

        <Link
          id="btn-upload-new-report"
          to="/upload"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs transition-colors self-start sm:self-center"
        >
          <UploadCloud className="w-3.5 h-3.5" />
          <span>Upload Document</span>
        </Link>
      </div>

      {/* Search and Filters for Reports (Requirement 6) */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            id="report-search-input"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search reports by filename or title..."
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-2xs"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            id="filter-report-type"
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 bg-white font-medium text-slate-700 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          >
            {availableTypes.map((t) => (
              <option key={t} value={t}>
                {t === 'All' ? 'All Document Types' : t}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {reportToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-xl max-w-sm w-full p-5 shadow-xl border border-slate-200 space-y-3">
            <div className="flex items-center gap-2.5 text-rose-600">
              <AlertTriangle className="w-5 h-5" />
              <h4 className="text-sm font-bold text-slate-900">Delete Medical Report?</h4>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Are you sure you want to remove this report from the patient record? Any associated AI
              extraction cache will also be purged.
            </p>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setReportToDelete(null)}
                className="px-3 py-1.5 text-xs font-semibold rounded-md text-slate-600 hover:bg-slate-100 border border-slate-200"
              >
                Cancel
              </button>
              <button
                type="button"
                id="btn-confirm-delete-report"
                onClick={confirmDelete}
                className="px-3 py-1.5 text-xs font-semibold rounded-md text-white bg-rose-600 hover:bg-rose-700 shadow-xs"
              >
                Delete Report
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reports List */}
      <div className="space-y-2.5">
        {filteredReports.length === 0 ? (
          <div className="p-8 rounded-xl bg-slate-50 border border-dashed border-slate-200 text-center space-y-2">
            <p className="text-xs text-slate-500 font-medium">
              {reports.length === 0
                ? 'No medical reports uploaded yet.'
                : 'No reports match current search/filter.'}
            </p>
            {reports.length === 0 && (
              <div className="pt-2">
                <Link
                  to="/upload"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-md text-xs font-medium border border-indigo-200 transition-colors"
                >
                  <UploadCloud className="w-3.5 h-3.5" />
                  <span>Upload First Report</span>
                </Link>
              </div>
            )}
          </div>
        ) : (
          filteredReports.map((report) => {
            const fileName = report.fileName || report.title || 'Untitled Document';
            const fileType = report.fileType || report.type || 'Medical Report';
            const uploadDate = report.uploadDate || report.date || 'Recent';
            const status = report.status || 'READY_FOR_REVIEW';

            // Check if extraction exists in storage
            const extraction = ExtractionStorage.getExtraction(report.id);
            const extractedCount = extraction?.results?.length || 0;

            return (
              <div
                key={report.id}
                className="p-3.5 rounded-xl border border-slate-200 hover:border-slate-300 hover:bg-slate-50/50 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 group bg-white shadow-2xs"
              >
                <div className="space-y-1.5 min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-xs sm:text-sm text-slate-900 truncate">
                      {fileName}
                    </span>
                    <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200 font-semibold">
                      {fileType}
                    </span>

                    {/* AI Extraction State Badge */}
                    {extractedCount > 0 ? (
                      <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded font-bold uppercase bg-purple-50 text-purple-700 border border-purple-200">
                        <Sparkles className="w-3 h-3 text-purple-500" />
                        <span>Extracted ({extractedCount} tests)</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded font-bold uppercase bg-slate-100 text-slate-600 border border-slate-200">
                        <Clock className="w-3 h-3 text-slate-400" />
                        <span>Ready for Review</span>
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-3 text-[11px] text-slate-500 flex-wrap">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      <span>Date: <strong className="text-slate-700">{uploadDate}</strong></span>
                    </span>
                    {report.fileSize && (
                      <>
                        <span className="w-1 h-1 rounded-full bg-slate-300" />
                        <span className="font-mono text-slate-500">Size: {report.fileSize}</span>
                      </>
                    )}
                    {report.source && (
                      <>
                        <span className="w-1 h-1 rounded-full bg-slate-300" />
                        <span className="text-slate-500">Source: {report.source}</span>
                      </>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                  {/* View Details / Extraction inspection Button */}
                  <Link
                    to={`/report-details?reportId=${report.id}`}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-700 hover:text-indigo-600 bg-slate-50 hover:bg-white px-3 py-1.5 rounded-md border border-slate-200 transition-colors shadow-2xs"
                  >
                    <span>{extractedCount > 0 ? 'View Extractions' : 'Process Report'}</span>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
                  </Link>

                  {/* Delete Button */}
                  <button
                    type="button"
                    onClick={() => setReportToDelete(report.id)}
                    className="inline-flex items-center gap-1 text-xs font-medium text-slate-400 hover:text-rose-600 hover:bg-rose-50 p-1.5 rounded-md border border-transparent hover:border-rose-200 transition-colors"
                    title="Delete report"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span className="sr-only">Delete</span>
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
