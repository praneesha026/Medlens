import React from 'react';
import { Sparkles, MessageSquare, AlertCircle, Cpu, CheckCircle2, ChevronRight } from 'lucide-react';
import { PatientProfile } from '../../types';

interface AiSummaryPlaceholderProps {
  patient: PatientProfile;
}

export const AiSummaryPlaceholder: React.FC<AiSummaryPlaceholderProps> = ({ patient }) => {
  return (
    <div className="bg-indigo-900 text-white rounded-xl p-6 shadow-lg border border-indigo-800 space-y-6">
      {/* Header with status badge */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-indigo-800/80">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 bg-indigo-500/30 rounded-full flex items-center justify-center border border-indigo-400 shrink-0">
            <Sparkles className="w-6 h-6 text-indigo-200" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-semibold text-white">
                AI Intelligence Insight
              </h3>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-500/30 text-indigo-200 border border-indigo-400/40 font-bold uppercase">
                Consolidated Synthesis
              </span>
            </div>
            <p className="text-xs text-indigo-200 mt-0.5">
              Structured synthesis of patient symptoms, chronic conditions, and recent laboratory extractions.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs text-indigo-200 bg-indigo-950/60 px-3 py-1.5 rounded-md border border-indigo-700/60 self-start sm:self-center">
          <Cpu className="w-3.5 h-3.5 text-indigo-300" />
          <span>Prepared for Google Gemini API</span>
        </div>
      </div>

      {/* Main Structured Summary Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Col 1 & 2: Longitudinal Patient Synthesis */}
        <div className="lg:col-span-2 space-y-4">
          <div className="space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-300">
              Structured Overview for {patient.fullName} ({patient.age} / {patient.sex})
            </h4>
            <p className="text-xs leading-relaxed text-indigo-100/90">
              Patient exhibits stable chronic management for Type 2 Diabetes Mellitus and Stage 1 Essential Hypertension. Recent metabolic evaluation demonstrates controlled renal clearance (eGFR 84 mL/min) with mild glycemic elevation (HbA1c 6.8%, Fasting Glucose 128 mg/dL) and borderline LDL cholesterol (104 mg/dL). No acute cardiopulmonary findings on thoracic imaging.
            </p>
          </div>

          <div className="space-y-2 pt-1">
            <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-300">
              Key Observed Factors
            </h4>
            <ul className="space-y-2 text-xs text-indigo-100">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                <span>
                  <strong className="text-white">Endocrine:</strong> HbA1c at 6.8% reflects steady baseline glycemic regulation on Metformin 500mg BID.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                <span>
                  <strong className="text-white">Renal & Electrolytes:</strong> Serum creatinine (0.88 mg/dL) and potassium (4.4 mmol/L) remain normal while on Lisinopril.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                <span>
                  <strong className="text-white">Vitamins:</strong> 25-OH Vitamin D flagged as low (22 ng/mL; reference range: 30–100 ng/mL).
                </span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                <span>
                  <strong className="text-white">Symptoms:</strong> Bilateral evening ankle swelling reported; monitor alongside ACE inhibitor and diabetic profile.
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Col 3: Physician Discussion Talking Points */}
        <div className="bg-indigo-950/70 rounded-xl p-4 border border-indigo-700/60 space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold text-amber-300">
            <MessageSquare className="w-4 h-4" />
            <span>Suggested Questions for Next Visit</span>
          </div>
          <p className="text-[11px] text-indigo-300">
            Points organized to assist patient-physician dialogue:
          </p>
          <ul className="space-y-2 text-xs text-indigo-100">
            <li className="p-2.5 rounded bg-indigo-900/60 border border-indigo-700/50">
              1. Review Vitamin D supplementation strategy (current level: 22 ng/mL).
            </li>
            <li className="p-2.5 rounded bg-indigo-900/60 border border-indigo-700/50">
              2. Discuss bilateral ankle swelling timing in relation to blood pressure regimen.
            </li>
            <li className="p-2.5 rounded bg-indigo-900/60 border border-indigo-700/50">
              3. Evaluate LDL target optimization (current: 104 mg/dL).
            </li>
          </ul>
        </div>
      </div>

      {/* Integration Notice Footer */}
      <div className="pt-3 border-t border-indigo-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-[11px] text-indigo-300">
        <div className="flex items-center gap-2">
          <AlertCircle className="w-3.5 h-3.5 text-indigo-300" />
          <span>
            Demonstration preview. Full autonomous summarization activates upon Gemini API integration in Step 2.
          </span>
        </div>
        <span className="font-mono text-[10px] text-indigo-300 bg-indigo-950/60 px-2 py-0.5 rounded border border-indigo-800">
          Model target: Gemini 2.5 / 2.0 Flash
        </span>
      </div>
    </div>
  );
};
