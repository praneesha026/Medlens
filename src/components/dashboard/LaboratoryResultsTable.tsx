import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Search,
  Filter,
  ExternalLink,
  ArrowUpDown,
  CheckCircle2,
  Edit3,
  Sparkles,
  ShieldCheck,
  UserCheck,
  AlertCircle,
  HelpCircle,
  Info
} from 'lucide-react';
import { LabResult, ExtractedResultItem, CalculatedLabStatus, VerificationState } from '../../types';
import { formatDate } from '../../utils/formatters';
import { evaluateReferenceRange } from '../../utils/referenceRangeEvaluator';
import { EditResultModal } from '../EditResultModal';

interface LaboratoryResultsTableProps {
  labResults: (LabResult | ExtractedResultItem)[];
  compact?: boolean;
  onUpdateItem?: (id: string, updated: Partial<ExtractedResultItem>) => void;
  onToggleVerify?: (id: string, currentVerified: boolean) => void;
}

export const LaboratoryResultsTable: React.FC<LaboratoryResultsTableProps> = ({
  labResults,
  compact = false,
  onUpdateItem,
  onToggleVerify
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedStatus, setSelectedStatus] = useState<string>('All');
  const [selectedVerification, setSelectedVerification] = useState<string>('All');
  const [sortField, setSortField] = useState<'name' | 'date' | 'status' | 'confidence'>('name');
  const [sortAsc, setSortAsc] = useState(true);

  // Edit modal state
  const [editingItem, setEditingItem] = useState<ExtractedResultItem | null>(null);

  const categories = ['All', 'Metabolic', 'Endocrine', 'Lipids', 'Renal', 'Hematology', 'Vitamins'];
  const statusOptions = ['All', 'LOW', 'NORMAL', 'HIGH', 'Not Determined'];
  const verificationOptions: ('All' | VerificationState)[] = [
    'All',
    'AI Extracted',
    'Human Verified',
    'Edited by User'
  ];

  // Normalize and evaluate each lab result item
  const processedResults = useMemo(() => {
    return labResults.map((item) => {
      const isExtractedItem = 'confidence' in item;
      const confidence = isExtractedItem ? (item as ExtractedResultItem).confidence : 0.95;
      const confidenceLevel = isExtractedItem
        ? (item as ExtractedResultItem).confidenceLevel
        : 'High confidence';

      // Determine verification state
      let verificationStatus: VerificationState = 'AI Extracted';
      if ((item as any).isEdited || (item as any).verificationStatus === 'Edited by User') {
        verificationStatus = 'Edited by User';
      } else if (
        (item as any).isHumanVerified ||
        (item as any).verificationStatus === 'Human Verified'
      ) {
        verificationStatus = 'Human Verified';
      }

      // Determine calculated reference-range status deterministically (Requirement 3)
      const rangeEvaluation = evaluateReferenceRange(item.value, item.referenceRange);
      const calculatedStatus: CalculatedLabStatus = rangeEvaluation.status;

      return {
        ...item,
        confidence,
        confidenceLevel,
        verificationStatus,
        calculatedStatus,
        originalExtractedValue: (item as any).originalExtractedValue || String(item.value),
        category: (item as any).category || 'Metabolic'
      };
    });
  }, [labResults]);

  // Apply search and filters (Requirement 6)
  const filteredResults = useMemo(() => {
    return processedResults
      .filter((lab) => {
        const matchesSearch =
          lab.testName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (lab.source && lab.source.toLowerCase().includes(searchTerm.toLowerCase()));

        const matchesCategory =
          selectedCategory === 'All' || lab.category === selectedCategory;

        const matchesStatus =
          selectedStatus === 'All' || lab.calculatedStatus === selectedStatus;

        const matchesVerification =
          selectedVerification === 'All' || lab.verificationStatus === selectedVerification;

        return matchesSearch && matchesCategory && matchesStatus && matchesVerification;
      })
      .sort((a, b) => {
        if (sortField === 'name') {
          return sortAsc
            ? a.testName.localeCompare(b.testName)
            : b.testName.localeCompare(a.testName);
        }
        if (sortField === 'date') {
          const dateA = a.date || '';
          const dateB = b.date || '';
          return sortAsc ? dateA.localeCompare(dateB) : dateB.localeCompare(dateA);
        }
        if (sortField === 'status') {
          return sortAsc
            ? a.calculatedStatus.localeCompare(b.calculatedStatus)
            : b.calculatedStatus.localeCompare(a.calculatedStatus);
        }
        if (sortField === 'confidence') {
          return sortAsc ? a.confidence - b.confidence : b.confidence - a.confidence;
        }
        return 0;
      });
  }, [
    processedResults,
    searchTerm,
    selectedCategory,
    selectedStatus,
    selectedVerification,
    sortField,
    sortAsc
  ]);

  const toggleSort = (field: 'name' | 'date' | 'status' | 'confidence') => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(true);
    }
  };

  // Helper for Status Badge styling
  const getCalculatedStatusBadge = (status: CalculatedLabStatus) => {
    switch (status) {
      case 'HIGH':
        return {
          bg: 'bg-rose-50 text-rose-800 border-rose-200',
          dot: 'bg-rose-500',
          label: 'HIGH'
        };
      case 'LOW':
        return {
          bg: 'bg-amber-50 text-amber-800 border-amber-200',
          dot: 'bg-amber-500',
          label: 'LOW'
        };
      case 'NORMAL':
        return {
          bg: 'bg-emerald-50 text-emerald-800 border-emerald-200',
          dot: 'bg-emerald-500',
          label: 'NORMAL'
        };
      case 'Not Determined':
      default:
        return {
          bg: 'bg-slate-100 text-slate-700 border-slate-200',
          dot: 'bg-slate-400',
          label: 'Not Determined'
        };
    }
  };

  // Helper for Verification Badge styling
  const getVerificationBadge = (status: VerificationState) => {
    switch (status) {
      case 'Human Verified':
        return {
          bg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
          icon: <CheckCircle2 className="w-3 h-3 text-emerald-600" />,
          label: 'Human Verified'
        };
      case 'Edited by User':
        return {
          bg: 'bg-blue-50 text-blue-700 border-blue-200',
          icon: <UserCheck className="w-3 h-3 text-blue-600" />,
          label: 'Edited by User'
        };
      case 'AI Extracted':
      default:
        return {
          bg: 'bg-slate-100 text-slate-600 border-slate-200',
          icon: <Sparkles className="w-3 h-3 text-amber-600" />,
          label: 'AI Extracted'
        };
    }
  };

  return (
    <div
      id="laboratory-results-card"
      className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col"
    >
      {/* Header & Title */}
      <div className="p-5 border-b border-slate-100 space-y-4 bg-slate-50/50">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-semibold text-slate-900">
                Consolidated Laboratory Results
              </h3>
              <span className="text-xs font-mono px-2 py-0.5 rounded bg-slate-200/70 text-slate-700 font-semibold">
                {labResults.length} Analytes
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Verified clinical analytes extracted from source medical reports with deterministic
              reference-range validation.
            </p>
          </div>

          <Link
            to="/report-details"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-600 hover:text-indigo-800 transition-colors self-start sm:self-center"
          >
            <span>Report Extraction & Inspection</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Search and Multi-Filter Controls (Requirement 6) */}
        <div className="space-y-3">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                id="lab-search-input"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by analyte (e.g. Glucose, Hemoglobin, Sodium) or source..."
                className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-2xs"
              />
            </div>

            {/* Status Filter */}
            <div className="flex items-center gap-1.5 text-xs text-slate-600">
              <span className="text-slate-400 font-medium">Status:</span>
              <select
                id="filter-status-select"
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="px-2 py-1.5 text-xs rounded-md border border-slate-200 bg-white font-medium text-slate-700 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              >
                {statusOptions.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt === 'All' ? 'All Statuses' : opt}
                  </option>
                ))}
              </select>
            </div>

            {/* Verification Status Filter (Requirement 6 & 7) */}
            <div className="flex items-center gap-1.5 text-xs text-slate-600">
              <span className="text-slate-400 font-medium">Verification:</span>
              <select
                id="filter-verification-select"
                value={selectedVerification}
                onChange={(e) => setSelectedVerification(e.target.value)}
                className="px-2 py-1.5 text-xs rounded-md border border-slate-200 bg-white font-medium text-slate-700 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              >
                {verificationOptions.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt === 'All' ? 'All Verification' : opt}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Category Filter Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
            <span className="text-slate-400 text-[11px] font-medium mr-1 shrink-0">Category:</span>
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors whitespace-nowrap ${
                  selectedCategory === cat
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Results Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="sticky top-0 bg-slate-50 border-b border-slate-200 text-slate-600 text-[11px] uppercase font-bold tracking-tight">
              <th
                className="py-3 px-3.5 cursor-pointer hover:text-slate-900"
                onClick={() => toggleSort('name')}
              >
                <div className="flex items-center gap-1">
                  <span>Test Name</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-400" />
                </div>
              </th>
              <th className="py-3 px-3.5">Reported Value</th>
              <th className="py-3 px-3.5">Unit</th>
              <th className="py-3 px-3.5">Source Reference Range</th>
              <th
                className="py-3 px-3.5 cursor-pointer hover:text-slate-900"
                onClick={() => toggleSort('status')}
              >
                <div className="flex items-center gap-1">
                  <span>Status</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-400" />
                </div>
              </th>
              <th
                className="py-3 px-3.5 cursor-pointer hover:text-slate-900"
                onClick={() => toggleSort('confidence')}
              >
                <div className="flex items-center gap-1">
                  <span>AI Confidence</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-400" />
                </div>
              </th>
              <th className="py-3 px-3.5">Verification</th>
              <th
                className="py-3 px-3.5 cursor-pointer hover:text-slate-900"
                onClick={() => toggleSort('date')}
              >
                <div className="flex items-center gap-1">
                  <span>Date</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-400" />
                </div>
              </th>
              {!compact && <th className="py-3 px-3.5">Source Document</th>}
              <th className="py-3 px-3.5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-700">
            {filteredResults.length === 0 ? (
              <tr>
                <td colSpan={compact ? 9 : 10} className="text-center py-10 text-slate-400 italic">
                  No laboratory tests match the current search/filter criteria.
                </td>
              </tr>
            ) : (
              filteredResults.map((item) => {
                const statusBadge = getCalculatedStatusBadge(item.calculatedStatus);
                const verBadge = getVerificationBadge(item.verificationStatus);

                return (
                  <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                    {/* Test Name & Category */}
                    <td className="py-3 px-3.5">
                      <div className="font-semibold text-slate-900">{item.testName}</div>
                      <span className="text-[10px] text-slate-400 font-mono">{item.category}</span>
                    </td>

                    {/* Reported Value (with original value tooltip if edited) */}
                    <td className="py-3 px-3.5">
                      <div className="font-mono font-bold text-slate-900 flex items-center gap-1.5">
                        <span>{item.value}</span>
                        {item.verificationStatus === 'Edited by User' &&
                          item.originalExtractedValue &&
                          item.originalExtractedValue !== String(item.value) && (
                            <span
                              className="text-[10px] text-blue-600 bg-blue-50 px-1 py-0.2 rounded font-normal font-sans"
                              title={`Original AI Extracted: ${item.originalExtractedValue}`}
                            >
                              (AI: {item.originalExtractedValue})
                            </span>
                          )}
                      </div>
                    </td>

                    {/* Unit */}
                    <td className="py-3 px-3.5 text-slate-600 font-mono">
                      {item.unit || '—'}
                    </td>

                    {/* Source Reference Range (Strictly exact, never invented) */}
                    <td className="py-3 px-3.5">
                      {item.referenceRange ? (
                        <span className="font-mono text-slate-700 text-[11px]">
                          {item.referenceRange}
                        </span>
                      ) : (
                        <span className="text-slate-400 italic text-[11px]">
                          Not provided in source report
                        </span>
                      )}
                    </td>

                    {/* Status Badge (Calculated deterministically) */}
                    <td className="py-3 px-3.5">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${statusBadge.bg}`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${statusBadge.dot}`} />
                        {statusBadge.label}
                      </span>
                    </td>

                    {/* AI Confidence (Requirement 1) */}
                    <td className="py-3 px-3.5">
                      <div className="flex items-center gap-1.5">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold border ${
                            item.confidence >= 0.85
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : item.confidence >= 0.6
                              ? 'bg-amber-50 text-amber-700 border-amber-200'
                              : 'bg-rose-50 text-rose-700 border-rose-200'
                          }`}
                        >
                          {Math.round(item.confidence * 100)}%
                        </span>
                        <span className="text-[10px] text-slate-400 hidden xl:inline">
                          {item.confidenceLevel}
                        </span>
                      </div>
                    </td>

                    {/* Verification Status Badge (Requirement 7) */}
                    <td className="py-3 px-3.5">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold border ${verBadge.bg}`}
                      >
                        {verBadge.icon}
                        <span>{verBadge.label}</span>
                      </span>
                    </td>

                    {/* Date */}
                    <td className="py-3 px-3.5 text-slate-500 whitespace-nowrap text-[11px]">
                      {formatDate(item.date)}
                    </td>

                    {/* Source Document */}
                    {!compact && (
                      <td className="py-3 px-3.5 text-slate-500 text-[11px] max-w-[160px] truncate">
                        {item.source}
                      </td>
                    )}

                    {/* Human Verification & Edit Actions */}
                    <td className="py-3 px-3.5 text-right">
                      <div className="inline-flex items-center gap-1">
                        {/* Verify / Unverify Toggle */}
                        {onToggleVerify && (
                          <button
                            type="button"
                            onClick={() =>
                              onToggleVerify(
                                item.id,
                                item.verificationStatus === 'Human Verified'
                              )
                            }
                            className={`p-1 rounded text-xs transition-colors ${
                              item.verificationStatus === 'Human Verified'
                                ? 'text-emerald-600 hover:bg-emerald-50'
                                : 'text-slate-400 hover:text-emerald-600 hover:bg-slate-100'
                            }`}
                            title={
                              item.verificationStatus === 'Human Verified'
                                ? 'Verified by human reviewer. Click to unverify.'
                                : 'Click to confirm human verification'
                            }
                          >
                            <CheckCircle2 className="w-4 h-4" />
                          </button>
                        )}

                        {/* Edit Result Modal Trigger */}
                        {onUpdateItem && (
                          <button
                            type="button"
                            onClick={() =>
                              setEditingItem({
                                id: item.id,
                                testName: item.testName,
                                value: String(item.value),
                                unit: item.unit,
                                referenceRange: item.referenceRange,
                                date: item.date,
                                source: item.source,
                                confidence: item.confidence,
                                confidenceLevel: item.confidenceLevel,
                                isHumanVerified: Boolean((item as any).isHumanVerified),
                                isEdited: Boolean((item as any).isEdited),
                                verificationStatus: item.verificationStatus,
                                originalExtractedValue: item.originalExtractedValue
                              })
                            }
                            className="p-1 rounded text-slate-400 hover:text-indigo-600 hover:bg-slate-100 transition-colors"
                            title="Edit test value, units, or reference range"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Footer with Summary & Regulatory Notice */}
      <div className="p-3.5 bg-slate-50 border-t border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-[11px] text-slate-500">
        <div>
          Showing <span className="font-semibold text-slate-700">{filteredResults.length}</span> of{' '}
          <span className="font-semibold text-slate-700">{labResults.length}</span> clinical analytes
        </div>

        <div className="flex items-center gap-1.5 text-slate-500">
          <Info className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <span>Status calculated via source report reference ranges. Not a clinical diagnosis.</span>
        </div>
      </div>

      {/* Edit Result Modal */}
      {editingItem && onUpdateItem && (
        <EditResultModal
          item={editingItem}
          isOpen={Boolean(editingItem)}
          onClose={() => setEditingItem(null)}
          onSave={(updated) => {
            onUpdateItem(editingItem.id, updated);
            setEditingItem(null);
          }}
        />
      )}
    </div>
  );
};
