import React, { useState, useMemo } from 'react';
import {
  GitCompare,
  ArrowRight,
  AlertCircle,
  TrendingUp,
  TrendingDown,
  Minus,
  Info,
  ChevronDown,
  Calendar,
  FileText
} from 'lucide-react';
import { MedicalReport, ExtractedResultItem, LabResult } from '../../types';
import { ExtractionStorage } from '../../utils/extractionStorage';
import { parseNumericValue } from '../../utils/referenceRangeEvaluator';

interface ReportComparisonCardProps {
  reports: MedicalReport[];
  defaultLabResults?: LabResult[];
}

interface ComparedTestItem {
  testName: string;
  prevValue: string | null;
  prevUnit: string | null;
  prevRange: string | null;
  prevDate: string | null;
  currValue: string | null;
  currUnit: string | null;
  currRange: string | null;
  currDate: string | null;
  changeText: string;
  changeType: 'increase' | 'decrease' | 'neutral' | 'unreliable' | 'single';
  warning?: string;
}

export const ReportComparisonCard: React.FC<ReportComparisonCardProps> = ({
  reports,
  defaultLabResults = []
}) => {
  // We need at least 2 reports to compare, or synthetic comparison sets
  const availableReports = useMemo(() => {
    return reports.map((r) => {
      // Check if this report has extraction results in storage
      const extraction = ExtractionStorage.getExtraction(r.id);
      const results: (ExtractedResultItem | LabResult)[] =
        extraction?.results && extraction.results.length > 0
          ? extraction.results
          : r.labResults && r.labResults.length > 0
          ? r.labResults
          : [];

      return {
        ...r,
        results
      };
    });
  }, [reports]);

  const [prevReportId, setPrevReportId] = useState<string>(() => {
    if (availableReports.length >= 2) return availableReports[1].id;
    if (availableReports.length === 1) return availableReports[0].id;
    return '';
  });

  const [currReportId, setCurrReportId] = useState<string>(() => {
    if (availableReports.length >= 1) return availableReports[0].id;
    return '';
  });

  const prevReport = availableReports.find((r) => r.id === prevReportId);
  const currReport = availableReports.find((r) => r.id === currReportId);

  // If reports have no results directly attached, check defaultLabResults partitioned by date
  const prevResults: (ExtractedResultItem | LabResult)[] = useMemo(() => {
    if (prevReport?.results && prevReport.results.length > 0) {
      return prevReport.results;
    }
    // Fallback: if demo mode with defaultLabResults, use older tests
    return defaultLabResults.slice(Math.floor(defaultLabResults.length / 2));
  }, [prevReport, defaultLabResults]);

  const currResults: (ExtractedResultItem | LabResult)[] = useMemo(() => {
    if (currReport?.results && currReport.results.length > 0) {
      return currReport.results;
    }
    // Fallback: if demo mode with defaultLabResults, use newer tests
    return defaultLabResults.slice(0, Math.ceil(defaultLabResults.length / 2));
  }, [currReport, defaultLabResults]);

  // Merge and compare tests
  const comparisonItems: ComparedTestItem[] = useMemo(() => {
    const testMap = new Map<string, { prev?: any; curr?: any }>();

    prevResults.forEach((item) => {
      const key = item.testName.toLowerCase().trim();
      if (!testMap.has(key)) {
        testMap.set(key, {});
      }
      testMap.get(key)!.prev = item;
    });

    currResults.forEach((item) => {
      const key = item.testName.toLowerCase().trim();
      if (!testMap.has(key)) {
        testMap.set(key, {});
      }
      testMap.get(key)!.curr = item;
    });

    const items: ComparedTestItem[] = [];

    testMap.forEach((entry) => {
      const prev = entry.prev;
      const curr = entry.curr;
      const testName = curr?.testName || prev?.testName || 'Unknown Analyte';

      const prevValStr = prev ? String(prev.value) : null;
      const currValStr = curr ? String(curr.value) : null;
      const prevUnit = prev?.unit || '';
      const currUnit = curr?.unit || '';
      const prevRange = prev?.referenceRange || null;
      const currRange = curr?.referenceRange || null;
      const prevDate = prev?.date || prevReport?.date || null;
      const currDate = curr?.date || currReport?.date || null;

      let changeText = '—';
      let changeType: ComparedTestItem['changeType'] = 'neutral';
      let warning: string | undefined = undefined;

      if (prevValStr !== null && currValStr !== null) {
        // Both exist
        const prevNum = parseNumericValue(prevValStr);
        const currNum = parseNumericValue(currValStr);

        // Check if units differ
        const unitsDiffer =
          prevUnit.toLowerCase().trim() !== currUnit.toLowerCase().trim() &&
          prevUnit.trim().length > 0 &&
          currUnit.trim().length > 0;

        if (unitsDiffer) {
          changeText = 'Unit mismatch';
          changeType = 'unreliable';
          warning = 'Comparison may not be reliable because the source information differs.';
        } else if (prevNum !== null && currNum !== null) {
          const diff = Math.round((currNum - prevNum) * 100) / 100;
          const sign = diff > 0 ? '+' : '';
          const unitLabel = currUnit ? ` ${currUnit}` : '';

          if (diff > 0) {
            changeText = `${sign}${diff}${unitLabel}`;
            changeType = 'increase';
          } else if (diff < 0) {
            changeText = `${diff}${unitLabel}`;
            changeType = 'decrease';
          } else {
            changeText = `No change (0${unitLabel})`;
            changeType = 'neutral';
          }
        } else {
          // Non-numeric comparison
          if (prevValStr.toLowerCase() === currValStr.toLowerCase()) {
            changeText = 'Unchanged';
            changeType = 'neutral';
          } else {
            changeText = `${prevValStr} → ${currValStr}`;
            changeType = 'unreliable';
            warning = 'Qualitative change between report dates.';
          }
        }
      } else if (currValStr !== null) {
        changeText = 'New in current report';
        changeType = 'single';
      } else if (prevValStr !== null) {
        changeText = 'Not in current report';
        changeType = 'single';
      }

      items.push({
        testName,
        prevValue: prevValStr,
        prevUnit,
        prevRange,
        prevDate,
        currValue: currValStr,
        currUnit,
        currRange,
        currDate,
        changeText,
        changeType,
        warning
      });
    });

    return items;
  }, [prevResults, currResults, prevReport, currReport]);

  return (
    <div
      id="report-comparison-card"
      className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden space-y-4 p-5 sm:p-6"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-lg bg-teal-50 border border-teal-200/60 flex items-center justify-center text-teal-700 shrink-0">
            <GitCompare className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-slate-900">
              Report Comparison (Previous vs. Current)
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Side-by-side longitudinal analyte comparison across documented clinical reports.
            </p>
          </div>
        </div>

        <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 self-start sm:self-center">
          {comparisonItems.length} Analytes Evaluated
        </span>
      </div>

      {/* Selectors for Previous vs Current Reports */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50/80 p-4 rounded-xl border border-slate-200/70">
        {/* Previous Report Selector */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-slate-500" />
            <span>Previous Report (Baseline)</span>
          </label>
          <div className="relative">
            <select
              id="select-prev-report"
              value={prevReportId}
              onChange={(e) => setPrevReportId(e.target.value)}
              className="w-full appearance-none px-3 py-2 pr-8 text-xs bg-white border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500 font-medium"
            >
              {availableReports.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.title || r.fileName} ({r.date || r.uploadDate})
                </option>
              ))}
              {availableReports.length === 0 && (
                <option value="">Baseline Clinical Lab Panel (2026-08-20)</option>
              )}
            </select>
            <ChevronDown className="w-4 h-4 text-slate-400 absolute right-2.5 top-2.5 pointer-events-none" />
          </div>
        </div>

        {/* Current Report Selector */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-teal-600" />
            <span>Current Report (Latest)</span>
          </label>
          <div className="relative">
            <select
              id="select-curr-report"
              value={currReportId}
              onChange={(e) => setCurrReportId(e.target.value)}
              className="w-full appearance-none px-3 py-2 pr-8 text-xs bg-white border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500 font-medium"
            >
              {availableReports.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.title || r.fileName} ({r.date || r.uploadDate})
                </option>
              ))}
              {availableReports.length === 0 && (
                <option value="">Follow-up Metabolic & Lipid Panel (2026-08-25)</option>
              )}
            </select>
            <ChevronDown className="w-4 h-4 text-slate-400 absolute right-2.5 top-2.5 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Comparison Table */}
      <div className="overflow-x-auto rounded-lg border border-slate-200">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200 uppercase tracking-wider text-[11px]">
            <tr>
              <th className="py-3 px-3.5">Test Name</th>
              <th className="py-3 px-3.5">Previous Value</th>
              <th className="py-3 px-3.5">Previous Range</th>
              <th className="py-3 px-3.5">Current Value</th>
              <th className="py-3 px-3.5">Current Range</th>
              <th className="py-3 px-3.5">Observed Change</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
            {comparisonItems.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-8 text-center text-slate-400">
                  No overlapping test results found between the selected reports.
                </td>
              </tr>
            ) : (
              comparisonItems.map((item, idx) => (
                <tr key={idx} className="hover:bg-slate-50/70 transition-colors">
                  {/* Test Name */}
                  <td className="py-3 px-3.5 font-semibold text-slate-900">
                    {item.testName}
                  </td>

                  {/* Previous Value */}
                  <td className="py-3 px-3.5">
                    {item.prevValue !== null ? (
                      <div>
                        <span className="font-semibold text-slate-900">{item.prevValue}</span>{' '}
                        <span className="text-slate-500 text-[11px]">{item.prevUnit}</span>
                      </div>
                    ) : (
                      <span className="text-slate-400 italic">Not tested</span>
                    )}
                  </td>

                  {/* Previous Range */}
                  <td className="py-3 px-3.5 text-slate-500 font-mono text-[11px]">
                    {item.prevRange || 'Not provided'}
                  </td>

                  {/* Current Value */}
                  <td className="py-3 px-3.5">
                    {item.currValue !== null ? (
                      <div>
                        <span className="font-semibold text-slate-900">{item.currValue}</span>{' '}
                        <span className="text-slate-500 text-[11px]">{item.currUnit}</span>
                      </div>
                    ) : (
                      <span className="text-slate-400 italic">Not tested</span>
                    )}
                  </td>

                  {/* Current Range */}
                  <td className="py-3 px-3.5 text-slate-500 font-mono text-[11px]">
                    {item.currRange || 'Not provided'}
                  </td>

                  {/* Change */}
                  <td className="py-3 px-3.5">
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5">
                        {item.changeType === 'increase' && (
                          <span className="inline-flex items-center gap-1 text-rose-700 font-bold bg-rose-50 px-2 py-0.5 rounded text-[11px]">
                            <TrendingUp className="w-3.5 h-3.5" />
                            {item.changeText}
                          </span>
                        )}
                        {item.changeType === 'decrease' && (
                          <span className="inline-flex items-center gap-1 text-blue-700 font-bold bg-blue-50 px-2 py-0.5 rounded text-[11px]">
                            <TrendingDown className="w-3.5 h-3.5" />
                            {item.changeText}
                          </span>
                        )}
                        {item.changeType === 'neutral' && (
                          <span className="inline-flex items-center gap-1 text-slate-600 font-medium bg-slate-100 px-2 py-0.5 rounded text-[11px]">
                            <Minus className="w-3 h-3" />
                            {item.changeText}
                          </span>
                        )}
                        {item.changeType === 'single' && (
                          <span className="text-slate-400 italic text-[11px]">
                            {item.changeText}
                          </span>
                        )}
                        {item.changeType === 'unreliable' && (
                          <span className="inline-flex items-center gap-1 text-amber-800 font-semibold bg-amber-50 px-2 py-0.5 rounded text-[11px] border border-amber-200">
                            <AlertCircle className="w-3 h-3 text-amber-600" />
                            {item.changeText}
                          </span>
                        )}
                      </div>

                      {/* Warning notice if units differ */}
                      {item.warning && (
                        <p className="text-[10px] text-amber-700 leading-tight">
                          {item.warning}
                        </p>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Mandatory Non-Diagnostic Clinical Notice */}
      <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-600 flex items-start gap-2">
        <Info className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          <strong className="text-slate-800 font-medium">Notice regarding report comparison:</strong>{' '}
          Numerical changes represent mathematical differences between document dates and do not
          constitute a clinical diagnosis or treatment recommendation. If testing methodologies,
          equipment, or units vary between reporting laboratories, direct numerical comparison may
          not be clinically equivalent. Always review changes with a physician.
        </p>
      </div>
    </div>
  );
};
