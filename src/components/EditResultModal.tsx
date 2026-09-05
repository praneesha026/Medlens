import React, { useState, useEffect } from 'react';
import { X, Save, AlertTriangle, ShieldCheck, Check } from 'lucide-react';
import { ExtractedResultItem } from '../types';
import { evaluateReferenceRange } from '../utils/referenceRangeEvaluator';

interface EditResultModalProps {
  item: ExtractedResultItem | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updated: Partial<ExtractedResultItem>) => void;
}

export const EditResultModal: React.FC<EditResultModalProps> = ({
  item,
  isOpen,
  onClose,
  onSave
}) => {
  const [testName, setTestName] = useState('');
  const [value, setValue] = useState('');
  const [unit, setUnit] = useState('');
  const [referenceRange, setReferenceRange] = useState('');
  const [observation, setObservation] = useState('');
  const [hasNoReferenceRange, setHasNoReferenceRange] = useState(false);

  useEffect(() => {
    if (item) {
      setTestName(item.testName || '');
      setValue(item.value || '');
      setUnit(item.unit || '');
      setObservation(item.observation || '');
      if (item.referenceRange === null || item.referenceRange === undefined) {
        setReferenceRange('');
        setHasNoReferenceRange(true);
      } else {
        setReferenceRange(item.referenceRange);
        setHasNoReferenceRange(false);
      }
    }
  }, [item]);

  if (!isOpen || !item) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!testName.trim()) return;

    const finalRefRange = hasNoReferenceRange || !referenceRange.trim() ? null : referenceRange.trim();
    const rangeEval = evaluateReferenceRange(value.trim(), finalRefRange);

    onSave({
      testName: testName.trim(),
      value: value.trim(),
      unit: unit.trim(),
      referenceRange: finalRefRange,
      observation: observation.trim() || undefined,
      isHumanVerified: true, // Marking as edited confirms human review
      isEdited: true,
      verificationStatus: 'Edited by User',
      originalExtractedValue: item.originalExtractedValue || item.value,
      calculatedStatus: rangeEval.status,
      verifiedAt: new Date().toISOString(),
      verifiedBy: 'Clinician / Patient Reviewer'
    });

    onClose();
  };

  return (
    <div
      id="edit-result-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 animate-in fade-in"
    >
      <div className="bg-white rounded-xl shadow-xl border border-slate-200 w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div>
            <h3 className="text-base font-bold text-slate-800">
              Verify & Edit Extracted Entity
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Review against source document. Saving will mark this item as <strong>Human Verified</strong>.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 overflow-y-auto">
          {/* Test Name */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700 block">
              Test Name / Analyte <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={testName}
              onChange={(e) => setTestName(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              placeholder="e.g. Fasting Glucose"
            />
          </div>

          {/* Value & Unit in 2 Columns */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 block">
                Reported Value <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={value}
                onChange={(e) => setValue(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:outline-none font-mono"
                placeholder="e.g. 98 or Negative"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 block">
                Unit of Measurement
              </label>
              <input
                type="text"
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                placeholder="e.g. mg/dL, mmol/L, %"
              />
            </div>
          </div>

          {/* Reference Range */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-700">
                Reference Range / Normal Interval
              </label>
              <label className="flex items-center gap-1.5 text-xs text-slate-600 cursor-pointer">
                <input
                  type="checkbox"
                  checked={hasNoReferenceRange}
                  onChange={(e) => {
                    setHasNoReferenceRange(e.target.checked);
                    if (e.target.checked) setReferenceRange('');
                  }}
                  className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                />
                <span>Not in source document</span>
              </label>
            </div>
            <input
              type="text"
              disabled={hasNoReferenceRange}
              value={hasNoReferenceRange ? '' : referenceRange}
              onChange={(e) => setReferenceRange(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:outline-none disabled:bg-slate-100 disabled:text-slate-400 font-mono"
              placeholder={
                hasNoReferenceRange ? 'Not provided in source report' : 'e.g. 70 - 99'
              }
            />
            <p className="text-[11px] text-slate-400">
              * Critical Rule: Never invent a reference range. If not present in source, leave unchecked or check "Not in source document".
            </p>
          </div>

          {/* Observation Note */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700 block">
              Clinical Observation / Source Note (Optional)
            </label>
            <input
              type="text"
              value={observation}
              onChange={(e) => setObservation(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              placeholder="e.g. Fasting sample verified; carbon copy faint"
            />
          </div>

          {/* Source Document Reference */}
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs text-slate-600 space-y-1">
            <div className="flex items-center justify-between text-[11px]">
              <span className="font-semibold text-slate-500 uppercase tracking-wider">Source Document:</span>
              <span className="font-mono text-slate-800">{item.source || 'Original Upload'}</span>
            </div>
            <div className="flex items-center justify-between text-[11px]">
              <span className="font-semibold text-slate-500 uppercase tracking-wider">AI Confidence:</span>
              <span className="font-semibold text-indigo-700">{item.confidenceLevel} ({Math.round(item.confidence * 100)}%)</span>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs transition-colors"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Save & Mark Verified</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
