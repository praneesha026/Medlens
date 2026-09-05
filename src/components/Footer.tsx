import React from 'react';
import { Link } from 'react-router-dom';
import { Activity, ShieldCheck, Database, Cpu, Layers } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-900 text-slate-400 border-t border-slate-800 text-xs mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Col 1: Brand & Identity */}
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center gap-2 text-white">
              <div className="w-8 h-8 rounded-lg bg-indigo-500 flex items-center justify-center">
                <Activity className="w-4 h-4 text-white" />
              </div>
              <span className="font-bold text-base tracking-tight">MedLens</span>
              <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                Phase 1 Prototype
              </span>
            </div>
            <p className="text-slate-400 text-xs leading-relaxed max-w-lg">
              Transforming scattered clinical notes, laboratory printouts, and unstructured medical documents into a coherent, organized patient record and longitudinal timeline.
            </p>
            <div className="pt-2 flex flex-wrap gap-2 text-[11px] text-slate-400">
              <span className="inline-flex items-center gap-1.5 bg-slate-800/80 px-2.5 py-1 rounded border border-slate-700">
                <Layers className="w-3.5 h-3.5 text-indigo-400" /> React 19 + Tailwind CSS
              </span>
              <span className="inline-flex items-center gap-1.5 bg-slate-800/80 px-2.5 py-1 rounded border border-slate-700">
                <Database className="w-3.5 h-3.5 text-indigo-300" /> FastAPI / PostgreSQL Ready
              </span>
              <span className="inline-flex items-center gap-1.5 bg-slate-800/80 px-2.5 py-1 rounded border border-slate-700">
                <Cpu className="w-3.5 h-3.5 text-indigo-400" /> Prepared for Gemini Intelligence
              </span>
            </div>
          </div>

          {/* Col 2: Navigation */}
          <div>
            <h4 className="text-white font-semibold text-xs tracking-wider uppercase mb-3">Navigation</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="hover:text-indigo-400 transition-colors">Overview</Link>
              </li>
              <li>
                <Link to="/patient-intake" className="hover:text-indigo-400 transition-colors">Patient Information Intake</Link>
              </li>
              <li>
                <Link to="/upload" className="hover:text-indigo-400 transition-colors">Medical Report Ingestion</Link>
              </li>
              <li>
                <Link to="/dashboard" className="hover:text-indigo-400 transition-colors">Patient Dashboard</Link>
              </li>
              <li>
                <Link to="/report-details" className="hover:text-indigo-400 transition-colors">Structured Lab Analytes</Link>
              </li>
            </ul>
          </div>

          {/* Col 3: System Architecture */}
          <div>
            <h4 className="text-white font-semibold text-xs tracking-wider uppercase mb-3">Clinical Scope</h4>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              MedLens is an information organization and clinical summarization tool. It is NOT a medical diagnosis or treatment platform. Always consult a licensed healthcare provider for medical decisions.
            </p>
            <div className="mt-3 text-[11px] text-green-400 flex items-center gap-1.5 font-medium">
              <ShieldCheck className="w-4 h-4" /> HIPAA-conscious mock design
            </div>
          </div>
        </div>

        <div className="pt-6 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-slate-500 text-[11px]">
          <div>
            © {new Date().getFullYear()} MedLens Clinical Information Intelligence. All rights reserved.
          </div>
          <div className="font-mono text-[10px] bg-slate-800 px-2 py-1 rounded border border-slate-700 text-slate-400">
            DEMO VERSION • SYNTHETIC TEST SUBJECTS ONLY
          </div>
        </div>
      </div>

      {/* Polish design disclaimer subfooter */}
      <div className="bg-slate-950/80 border-t border-slate-800/80 px-4 py-2.5 flex items-center justify-center text-[11px] text-slate-500">
        <p className="font-medium text-center italic max-w-5xl">
          MedLens is an information organization and understanding tool. It does not provide medical diagnosis or treatment recommendations. Always consult a qualified healthcare professional for medical decisions.
        </p>
      </div>
    </footer>
  );
};
