import React, { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import {
  Menu,
  X,
  Activity,
  User,
  RotateCcw,
  Sparkles,
  ChevronRight,
  ShieldAlert,
  Bell
} from 'lucide-react';
import { Sidebar } from '../components/Sidebar';
import { Footer } from '../components/Footer';
import { SafetyNotice } from '../components/SafetyNotice';
import { usePatient } from '../context/PatientContext';

export const MainLayout: React.FC = () => {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const { patient, resetToDefault } = usePatient();
  const location = useLocation();

  // Page title / section mapping for header
  const getPageTitle = () => {
    switch (location.pathname) {
      case '/':
        return 'Overview & Features';
      case '/dashboard':
        return 'Patient Clinical Intelligence Dashboard';
      case '/patient-intake':
        return 'Clinical Intake & Demographics';
      case '/upload':
        return 'Medical Report Upload & Processing';
      case '/report-details':
        return 'Structured Laboratory Analytes';
      default:
        return 'MedLens Intelligence';
    }
  };

  return (
    <div className="min-h-screen flex bg-slate-50 text-slate-800 antialiased font-sans">
      {/* Desktop Sidebar */}
      <div className="hidden md:flex h-screen sticky top-0 shrink-0">
        <Sidebar />
      </div>

      {/* Mobile Drawer Backdrop & Sidebar */}
      {mobileSidebarOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden animate-in fade-in duration-200">
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
            onClick={() => setMobileSidebarOpen(false)}
            aria-hidden="true"
          />
          <div className="relative flex-1 flex flex-col max-w-xs w-full bg-white z-10 shadow-2xl">
            <div className="absolute top-3.5 right-3 z-20">
              <button
                type="button"
                onClick={() => setMobileSidebarOpen(false)}
                className="p-1.5 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                aria-label="Close navigation"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <Sidebar onCloseMobile={() => setMobileSidebarOpen(false)} />
          </div>
        </div>
      )}

      {/* Main Column */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen overflow-x-hidden">
        {/* Top Header Bar */}
        <header className="h-16 border-b border-slate-200 bg-white sticky top-0 z-30 flex items-center justify-between px-4 sm:px-6 lg:px-8 shadow-2xs">
          <div className="flex items-center gap-3">
            {/* Mobile Hamburger Button */}
            <button
              id="mobile-sidebar-toggle"
              type="button"
              onClick={() => setMobileSidebarOpen(true)}
              className="p-2 -ml-2 rounded-md text-slate-600 hover:text-slate-900 hover:bg-slate-100 md:hidden focus:outline-none"
              aria-label="Open navigation menu"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Mobile Brand snippet */}
            <div className="flex md:hidden items-center gap-2">
              <div className="w-7 h-7 rounded-md bg-indigo-600 flex items-center justify-center text-white">
                <Activity className="w-4 h-4" />
              </div>
              <span className="font-bold text-slate-900 text-sm">MedLens</span>
            </div>

            {/* Desktop Page Title / Breadcrumb */}
            <div className="hidden md:flex items-center gap-2 text-xs">
              <span className="font-bold uppercase tracking-wider text-slate-400">
                Workspace
              </span>
              <span className="text-slate-300">/</span>
              <span className="font-bold text-slate-800 text-sm">
                {getPageTitle()}
              </span>
            </div>
          </div>

          {/* Right Controls in Top Bar */}
          <div className="flex items-center gap-2.5 sm:gap-3">
            {/* Active Patient Badge or Add Patient CTA */}
            {patient ? (
              <Link
                to="/dashboard"
                className="flex items-center gap-2 bg-slate-50 hover:bg-indigo-50/60 border border-slate-200 hover:border-indigo-200 px-2.5 py-1.5 rounded-lg text-xs transition-colors group"
              >
                <div className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-700 text-[11px] font-bold flex items-center justify-center">
                  {patient.fullName ? patient.fullName.charAt(0) : 'P'}
                </div>
                <div className="hidden sm:flex flex-col text-left">
                  <span className="font-bold text-slate-800 text-xs leading-none group-hover:text-indigo-900">
                    {patient.fullName || 'Unnamed Patient'}
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono leading-none mt-0.5">
                    MRN: {patient.mrn || 'N/A'}
                  </span>
                </div>
                <span className="w-1.5 h-1.5 rounded-full bg-green-500 shrink-0" />
              </Link>
            ) : (
              <Link
                to="/patient-intake"
                className="inline-flex items-center gap-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-colors"
              >
                <User className="w-3.5 h-3.5 text-indigo-600" />
                <span>+ Intake Patient</span>
              </Link>
            )}

            {/* Reset / Clear Demo Button */}
            {patient && (
              <button
                id="topbar-reset-demo-btn"
                type="button"
                onClick={resetToDefault}
                title="Clear current patient data"
                className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-slate-200 text-slate-600 hover:text-rose-600 hover:border-slate-300 text-xs font-medium transition-colors bg-white shadow-2xs"
              >
                <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
                <span>Clear Record</span>
              </button>
            )}
          </div>
        </header>

        {/* Top Safety Banner */}
        <SafetyNotice variant="banner" />

        {/* Page Outlet */}
        <main className="flex-1">
          <Outlet />
        </main>

        {/* Footer */}
        <Footer />
      </div>
    </div>
  );
};

