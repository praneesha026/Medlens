import React from 'react';
import { Link } from 'react-router-dom';
import {
  Activity,
  ArrowRight,
  ShieldCheck,
  FileSpreadsheet,
  Clock,
  Sparkles,
  CheckCircle2,
  FolderOpen,
  Stethoscope,
  HeartPulse,
  Database,
  ArrowUpRight
} from 'lucide-react';
import { SafetyNotice } from '../components/SafetyNotice';

export const LandingPage: React.FC = () => {
  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-slate-950 via-slate-900 to-indigo-950 text-white pt-16 pb-20 px-4 sm:px-6 lg:px-8">
        {/* Subtle grid pattern background */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#4f46e512_1px,transparent_1px),linear-gradient(to_bottom,#4f46e512_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none" />

        <div className="relative max-w-5xl mx-auto text-center space-y-6">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 text-xs font-medium tracking-wide">
            <Activity className="w-3.5 h-3.5 text-indigo-400" />
            <span>MedLens Clinical Information Intelligence</span>
            <span className="w-1 h-1 rounded-full bg-indigo-400" />
            <span className="text-indigo-200">Phase 1 Architecture</span>
          </div>

          {/* Main Title & Tagline */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-white max-w-4xl mx-auto leading-[1.15]">
            Transform medical information into a{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-300 via-indigo-200 to-slate-100">
              clear, structured record.
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-lg sm:text-xl text-slate-300 max-w-2xl mx-auto font-normal leading-relaxed">
            MedLens helps organize scattered clinical notes, laboratory printouts, and diagnostic reports into an understandable, longitudinal patient record.
          </p>

          {/* Action CTAs */}
          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              id="landing-get-started-btn"
              to="/patient-intake"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-6 py-3 rounded-md bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm shadow-sm transition-all duration-200 group"
            >
              <span>Get Started</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </Link>

            <Link
              id="landing-explore-dashboard-btn"
              to="/dashboard"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-md bg-slate-800/90 hover:bg-slate-800 text-slate-200 border border-slate-700 font-medium text-sm hover:text-white transition-all duration-200"
            >
              <span>Explore Demo Dashboard</span>
              <ArrowUpRight className="w-4 h-4 text-slate-400" />
            </Link>
          </div>

          {/* Quick Metrics Bar */}
          <div className="pt-8 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto text-left">
            <div className="bg-slate-900/80 border border-slate-800 rounded-lg p-3">
              <span className="text-xs text-slate-400 block">Organization</span>
              <span className="text-sm font-semibold text-indigo-300">Single Source Record</span>
            </div>
            <div className="bg-slate-900/80 border border-slate-800 rounded-lg p-3">
              <span className="text-xs text-slate-400 block">Extracted Analytes</span>
              <span className="text-sm font-semibold text-indigo-300">Lab Reference Ranges</span>
            </div>
            <div className="bg-slate-900/80 border border-slate-800 rounded-lg p-3">
              <span className="text-xs text-slate-400 block">Chronology</span>
              <span className="text-sm font-semibold text-indigo-300">Longitudinal Timeline</span>
            </div>
            <div className="bg-slate-900/80 border border-slate-800 rounded-lg p-3">
              <span className="text-xs text-slate-400 block">Architecture</span>
              <span className="text-sm font-semibold text-indigo-300">FastAPI & AI Ready</span>
            </div>
          </div>
        </div>
      </section>

      {/* Safety Notice Callout Section */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 -mt-6 w-full relative z-10">
        <SafetyNotice variant="card" />
      </section>

      {/* Feature Pillars */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
            A Clean Framework for Clinical Data
          </h2>
          <p className="mt-3 text-sm sm:text-base text-slate-600 leading-relaxed">
            Medical information is often fragmented across portals, physical printouts, and different laboratories. MedLens bridges the gap with structured information organization.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1 */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:border-slate-300 transition-colors">
            <div className="w-10 h-10 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 mb-5">
              <FolderOpen className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900 mb-2">Structured Patient Records</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Consolidate symptoms, current medications, existing conditions, known allergies, and clinical history into a structured profile card.
            </p>
            <div className="mt-4 pt-4 border-t border-slate-100 flex items-center text-xs font-semibold text-indigo-600">
              <Link to="/patient-intake" className="inline-flex items-center gap-1 hover:underline">
                View intake form <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* Card 2 */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:border-slate-300 transition-colors">
            <div className="w-10 h-10 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 mb-5">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900 mb-2">Normalized Lab Data</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Turn dense laboratory tables into structured rows with test names, units, standard reference ranges, and color-coded status indicators.
            </p>
            <div className="mt-4 pt-4 border-t border-slate-100 flex items-center text-xs font-semibold text-indigo-600">
              <Link to="/report-details" className="inline-flex items-center gap-1 hover:underline">
                Inspect lab tables <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* Card 3 */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:border-slate-300 transition-colors">
            <div className="w-10 h-10 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 mb-5">
              <Clock className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900 mb-2">Chronological Timeline</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Understand medical milestones across visits, lab draws, prescription changes, and imaging procedures without getting lost in papers.
            </p>
            <div className="mt-4 pt-4 border-t border-slate-100 flex items-center text-xs font-semibold text-indigo-600">
              <Link to="/dashboard" className="inline-flex items-center gap-1 hover:underline">
                Explore timeline <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 4-Step Application Flow */}
      <section className="bg-slate-100/70 border-y border-slate-200 py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-600">Application Architecture</span>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 mt-1">
              Step 1 Frontend & Future Roadmap
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
              <div className="text-xs font-mono font-bold text-indigo-600 mb-2">STEP 1 • COMPLETED</div>
              <h4 className="font-semibold text-slate-900 text-sm mb-1">Patient Profile Form</h4>
              <p className="text-xs text-slate-600">
                Collects symptoms, active conditions, allergies, and medication history in a clean, accessible UI.
              </p>
            </div>

            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
              <div className="text-xs font-mono font-bold text-indigo-600 mb-2">STEP 2 • COMPLETED</div>
              <h4 className="font-semibold text-slate-900 text-sm mb-1">Report Upload Simulation</h4>
              <p className="text-xs text-slate-600">
                Drag-and-drop document intake UI ready for PDF/image ingestion with simulated pipeline status.
              </p>
            </div>

            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
              <div className="text-xs font-mono font-bold text-indigo-600 mb-2">STEP 3 • COMPLETED</div>
              <h4 className="font-semibold text-slate-900 text-sm mb-1">Clinical Dashboard</h4>
              <p className="text-xs text-slate-600">
                Comprehensive patient profile, chronological event timeline, and structured laboratory table.
              </p>
            </div>

            <div className="bg-slate-50 p-5 rounded-xl border border-dashed border-slate-300">
              <div className="text-xs font-mono font-bold text-slate-500 mb-2">FUTURE PHASE</div>
              <h4 className="font-semibold text-slate-800 text-sm mb-1">FastAPI + Gemini AI</h4>
              <p className="text-xs text-slate-500">
                Live document OCR, Python FastAPI backend, PostgreSQL database, and Gemini summarization.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Launch CTA Banner */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 py-16 w-full">
        <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-indigo-950 border border-slate-800 rounded-2xl p-8 sm:p-10 text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl">
          <div className="space-y-2 text-center md:text-left">
            <h3 className="text-2xl font-bold tracking-tight">Ready to view the patient record?</h3>
            <p className="text-slate-300 text-sm max-w-lg">
              Navigate into the live interactive prototype using our comprehensive synthetic patient Eleanor Vance (58F).
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link
              to="/dashboard"
              className="px-5 py-2.5 rounded-md bg-white text-slate-900 hover:bg-slate-100 font-semibold text-sm transition-colors shadow-sm"
            >
              Open Dashboard
            </Link>
            <Link
              to="/patient-intake"
              className="px-5 py-2.5 rounded-md bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-sm transition-colors"
            >
              New Patient Intake
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};
