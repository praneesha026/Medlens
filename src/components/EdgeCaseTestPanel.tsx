import React, { useState } from 'react';
import {
  FlaskConical,
  Play,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  AlertTriangle,
  FileCheck,
  Shield
} from 'lucide-react';
import { SYNTHETIC_TEST_PRESETS } from '../services/geminiService';

interface EdgeCaseTestPanelProps {
  onRunTest: (presetKey: string) => void;
  isLoading: boolean;
}

export const EdgeCaseTestPanel: React.FC<EdgeCaseTestPanelProps> = ({
  onRunTest,
  isLoading
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedPreset, setSelectedPreset] = useState<string>('NORMAL_VALUES');

  const presetKeys = Object.keys(SYNTHETIC_TEST_PRESETS);

  const handleRun = () => {
    onRunTest(selectedPreset);
  };

  return (
    <div className="bg-white rounded-xl border border-indigo-100 shadow-2xs overflow-hidden">
      <button
        type="button"
        id="btn-toggle-edge-case-panel"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-5 py-3.5 bg-indigo-50/50 hover:bg-indigo-50/90 text-left flex items-center justify-between transition-colors"
      >
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center">
            <FlaskConical className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-indigo-950 uppercase tracking-wider flex items-center gap-2">
              <span>Clinical Test Fixtures & Edge-Case Suite</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-200/60 text-indigo-900 font-mono font-normal">
                Requirement 12 • 9 Scenarios
              </span>
            </h4>
            <p className="text-[11px] text-indigo-700/80 mt-0.5">
              Execute standard synthetic medical documents through the validator without consuming Gemini quota.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-indigo-700">
          <span className="text-xs font-semibold">{isOpen ? 'Hide Tests' : 'Show Tests'}</span>
          {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </div>
      </button>

      {isOpen && (
        <div className="p-5 border-t border-indigo-100 bg-white space-y-4">
          <div className="flex items-center gap-2 text-[11px] text-slate-500">
            <Shield className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
            <span>
              All test suites use 100% synthetic laboratory data. Demonstrates normal/abnormal ranges, missing units, OCR uncertainty, and schema error handling.
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {presetKeys.map((key) => {
              const preset = SYNTHETIC_TEST_PRESETS[key];
              const isSelected = selectedPreset === key;
              const isErrorTest = key === 'INVALID_AI_RESPONSE' || key === 'API_FAILURE';

              return (
                <div
                  key={key}
                  onClick={() => setSelectedPreset(key)}
                  className={`p-3 rounded-lg border text-left cursor-pointer transition-all ${
                    isSelected
                      ? 'border-indigo-600 bg-indigo-50/50 ring-1 ring-indigo-500'
                      : 'border-slate-200 hover:border-slate-300 bg-slate-50/50'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-slate-900">{preset.label}</span>
                        {isErrorTest && (
                          <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-rose-100 text-rose-700 uppercase">
                            Error Test
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-500 leading-relaxed">
                        {preset.description}
                      </p>
                    </div>
                    <div
                      className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 mt-0.5 ${
                        isSelected ? 'border-indigo-600 bg-indigo-600 text-white' : 'border-slate-300'
                      }`}
                    >
                      {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-t border-slate-100">
            <span className="text-xs text-slate-600">
              Selected: <strong>{SYNTHETIC_TEST_PRESETS[selectedPreset]?.label}</strong>
            </span>
            <button
              type="button"
              id="btn-run-synthetic-test"
              onClick={handleRun}
              disabled={isLoading}
              className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs transition-colors disabled:opacity-50"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Run Selected Test Scenario</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
