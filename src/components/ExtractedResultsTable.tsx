import React, { useState } from 'react';
import {
  CheckCircle,
  Clock,
  Edit3,
  Bot,
  UserCheck,
  Search,
  Filter,
  AlertTriangle,
  Info,
  Check,
  X
} from 'lucide-react';
import { ExtractedResultItem } from '../types';

interface ExtractedResultsTableProps {
  results: ExtractedResultItem[];
  onToggleVerify: (itemId: string, currentStatus: boolean) => void;
  onEditItem: (item: ExtractedResultItem) => void;
  reportFileName?: string;
}

export const ExtractedResultsTable: React.FC<ExtractedResultsTableProps> = ({
  results,
  onToggleVerify,
  onEditItem,
  reportFileName
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'VERIFIED' | 'UNVERIFIED'>('ALL');

  const filteredResults = results.filter((item) => {
    const matchesSearch =
      item.testName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.value.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.observation && item.observation.toLowerCase().includes(searchTerm.toLowerCase()));

    if (statusFilter === 'VERIFIED') return matchesSearch && item.isHumanVerified;
    if (statusFilter === 'UNVERIFIED') return matchesSearch && !item.isHumanVerified;
    return matchesSearch;
  });

  const verifiedCount = results.filter((r) => r.isHumanVerified).length;

  return (
    <div className="space-y-4">
      {/* Table Controls & Filter Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs">
        <div className="relative flex-1 max-w-xs">
          <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
          <input
            id="search-extracted-tests"
            type="text"
            placeholder="Search test name or analyte..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-2xs"
          />
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1.5 bg-white px-2.5 py-1 rounded-lg border border-slate-200 shadow-2xs text-slate-600 font-medium">
            <Filter className="w-3 h-3 text-slate-400" />
            <span>Filter:</span>
            <button
              type="button"
              onClick={() => setStatusFilter('ALL')}
              className={`px-2 py-0.5 rounded text-[11px] font-semibold transition-colors ${
                statusFilter === 'ALL' ? 'bg-indigo-100 text-indigo-700' : 'hover:text-slate-900'
              }`}
            >
              All ({results.length})
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter('UNVERIFIED')}
              className={`px-2 py-0.5 rounded text-[11px] font-semibold transition-colors ${
                statusFilter === 'UNVERIFIED' ? 'bg-amber-100 text-amber-800' : 'hover:text-slate-900'
              }`}
            >
              AI Extracted ({results.length - verifiedCount})
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter('VERIFIED')}
              className={`px-2 py-0.5 rounded text-[11px] font-semibold transition-colors ${
                statusFilter === 'VERIFIED' ? 'bg-emerald-100 text-emerald-800' : 'hover:text-slate-900'
              }`}
            >
              Human Verified ({verifiedCount})
            </button>
          </div>
        </div>
      </div>

      {/* Main Extracted Results Table */}
      <div className="overflow-x-auto rounded-xl border border-slate-200 shadow-2xs bg-white">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-slate-50/90 text-slate-600 font-bold border-b border-slate-200 uppercase tracking-wider text-[11px]">
              <th className="py-3 px-4">Test</th>
              <th className="py-3 px-4">Value</th>
              <th className="py-3 px-4">Unit</th>
              <th className="py-3 px-4">Reference Range</th>
              <th className="py-3 px-4">
                <div className="flex items-center gap-1">
                  <span>AI Extraction Confidence</span>
                  <span
                    title="Model extraction certainty score. Does NOT represent clinical normality or diagnosis."
                    className="cursor-help"
                  >
                    <Info className="w-3 h-3 text-slate-400" />
                  </span>
                </div>
              </th>
              <th className="py-3 px-4">Source</th>
              <th className="py-3 px-4 text-right">Human Verification & Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredResults.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-8 text-center text-slate-400">
                  <p className="text-xs">No matching laboratory results found.</p>
                </td>
              </tr>
            ) : (
              filteredResults.map((item) => (
                <tr
                  key={item.id}
                  id={`extracted-row-${item.id}`}
                  className={`hover:bg-slate-50/80 transition-colors ${
                    item.isHumanVerified ? 'bg-emerald-50/20' : ''
                  }`}
                >
                  {/* Column 1: Test */}
                  <td className="py-3.5 px-4 font-semibold text-slate-900">
                    <div className="space-y-0.5">
                      <span className="block text-slate-900 font-bold text-xs">
                        {item.testName}
                      </span>
                      {item.observation && (
                        <span className="block text-[11px] text-slate-500 font-normal italic">
                          Obs: {item.observation}
                        </span>
                      )}
                      {item.date && (
                        <span className="block text-[10px] text-slate-400 font-mono">
                          Date: {item.date}
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Column 2: Value */}
                  <td className="py-3.5 px-4 font-mono font-bold text-slate-900 text-xs">
                    {item.value || (
                      <span className="text-amber-600 italic font-normal">Uncertain</span>
                    )}
                  </td>

                  {/* Column 3: Unit */}
                  <td className="py-3.5 px-4 text-slate-700 font-medium">
                    {item.unit ? (
                      <span>{item.unit}</span>
                    ) : (
                      <span className="text-slate-400 italic text-[11px]">—</span>
                    )}
                  </td>

                  {/* Column 4: Reference Range */}
                  <td className="py-3.5 px-4 text-slate-700">
                    {item.referenceRange ? (
                      <span className="font-mono text-slate-800 bg-slate-100 px-2 py-0.5 rounded text-[11px]">
                        {item.referenceRange}
                      </span>
                    ) : (
                      <span className="inline-flex items-center text-[11px] text-slate-400 italic">
                        Not provided in source report
                      </span>
                    )}
                  </td>

                  {/* Column 5: AI Extraction Confidence */}
                  <td className="py-3.5 px-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md font-bold text-[10px] uppercase tracking-wider ${
                            item.confidenceLevel === 'High confidence'
                              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                              : item.confidenceLevel === 'Medium confidence'
                              ? 'bg-amber-50 text-amber-800 border border-amber-200'
                              : 'bg-rose-50 text-rose-800 border border-rose-200'
                          }`}
                        >
                          {item.confidenceLevel}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">
                          {Math.round(item.confidence * 100)}%
                        </span>
                      </div>
                      <div className="w-20 bg-slate-100 h-1 rounded-full overflow-hidden">
                        <div
                          className={`h-full ${
                            item.confidenceLevel === 'High confidence'
                              ? 'bg-emerald-500'
                              : item.confidenceLevel === 'Medium confidence'
                              ? 'bg-amber-500'
                              : 'bg-rose-500'
                          }`}
                          style={{ width: `${Math.round(item.confidence * 100)}%` }}
                        />
                      </div>
                    </div>
                  </td>

                  {/* Column 6: Source */}
                  <td className="py-3.5 px-4 text-slate-500 text-[11px] max-w-[140px] truncate font-mono">
                    {item.source || reportFileName || 'Uploaded Document'}
                  </td>

                  {/* Column 7: Human Verification & Actions */}
                  <td className="py-3.5 px-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      {/* Distinguish AI Extracted vs Human Verified */}
                      {item.isHumanVerified ? (
                        <span
                          id={`badge-verified-${item.id}`}
                          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300"
                          title={`Verified at ${item.verifiedAt || 'Session review'}`}
                        >
                          <UserCheck className="w-3 h-3 text-emerald-700" />
                          <span>Human Verified</span>
                        </span>
                      ) : (
                        <span
                          id={`badge-unverified-${item.id}`}
                          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600 border border-slate-200"
                          title="Awaiting human confirmation against source document"
                        >
                          <Bot className="w-3 h-3 text-slate-400" />
                          <span>AI Extracted</span>
                        </span>
                      )}

                      {/* Toggle Verify Button */}
                      <button
                        type="button"
                        id={`btn-verify-${item.id}`}
                        onClick={() => onToggleVerify(item.id, item.isHumanVerified)}
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors shadow-2xs ${
                          item.isHumanVerified
                            ? 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200'
                            : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                        }`}
                        title={item.isHumanVerified ? 'Mark as unverified' : 'Confirm and verify this value'}
                      >
                        {item.isHumanVerified ? (
                          <>
                            <X className="w-3 h-3" />
                            <span>Unverify</span>
                          </>
                        ) : (
                          <>
                            <Check className="w-3 h-3" />
                            <span>Verify</span>
                          </>
                        )}
                      </button>

                      {/* Edit Button */}
                      <button
                        type="button"
                        id={`btn-edit-${item.id}`}
                        onClick={() => onEditItem(item)}
                        className="inline-flex items-center gap-1 px-2 py-1 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-medium transition-colors shadow-2xs"
                        title="Edit extracted value, unit, or range"
                      >
                        <Edit3 className="w-3 h-3 text-slate-500" />
                        <span>Edit</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Table Footer with Summary */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-slate-500 px-1">
        <p>
          Showing {filteredResults.length} of {results.length} total extracted entities.
        </p>
        <p className="font-medium text-slate-600">
          Verification progress: <strong>{verifiedCount}</strong> / {results.length} ({results.length > 0 ? Math.round((verifiedCount / results.length) * 100) : 0}%) confirmed.
        </p>
      </div>
    </div>
  );
};
