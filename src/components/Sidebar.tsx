import React from 'react';
import { NavLink, Link } from 'react-router-dom';
import {
  Activity,
  UserPlus,
  UploadCloud,
  LayoutDashboard,
  FileText,
  RotateCcw,
  ShieldAlert,
  ChevronRight,
  ExternalLink
} from 'lucide-react';
import { usePatient } from '../context/PatientContext';

interface SidebarProps {
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ onCloseMobile }) => {
  const { patient, resetToDefault } = usePatient();

  const navLinks = [
    { to: '/', label: 'Home Overview', icon: Activity },
    { to: '/dashboard', label: 'Clinical Dashboard', icon: LayoutDashboard },
    { to: '/patient-intake', label: 'Patient Intake', icon: UserPlus },
    { to: '/upload', label: 'Report Ingestion', icon: UploadCloud },
    { to: '/report-details', label: 'Structured Analytes', icon: FileText }
  ];

  const handleLinkClick = () => {
    if (onCloseMobile) {
      onCloseMobile();
    }
  };

  return (
    <aside className="w-64 border-r border-slate-200 bg-white flex flex-col h-full shrink-0 select-none">
      {/* Brand Header */}
      <div className="h-16 border-b border-slate-200 flex items-center px-5 gap-3 shrink-0">
        <Link
          to="/"
          onClick={handleLinkClick}
          className="flex items-center gap-2.5 group focus:outline-none"
        >
          <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white shadow-xs group-hover:bg-indigo-700 transition-colors shrink-0">
            <Activity className="w-4 h-4 text-white stroke-[2.5]" />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-slate-900 text-base leading-tight tracking-tight">
                MedLens
              </span>
              <span className="text-[9px] font-bold uppercase tracking-wider bg-indigo-50 text-indigo-700 border border-indigo-200/70 px-1 py-0.2 rounded">
                AI
              </span>
            </div>
            <p className="text-[11px] text-slate-500 font-medium -mt-0.5">
              Clinical Intelligence
            </p>
          </div>
        </Link>
      </div>

      {/* Navigation Section */}
      <div className="flex-1 overflow-y-auto p-4 space-y-1">
        <div className="px-3 pb-2 pt-1 text-[11px] font-bold uppercase tracking-wider text-slate-400">
          Navigation
        </div>

        {navLinks.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={handleLinkClick}
              id={`sidebar-link-${item.label.toLowerCase().replace(/\s+/g, '-')}`}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-semibold transition-colors ${
                  isActive
                    ? 'text-indigo-700 bg-indigo-50 border border-indigo-100 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <Icon
                    className={`w-4 h-4 shrink-0 transition-colors ${
                      isActive ? 'text-indigo-600' : 'text-slate-400'
                    }`}
                  />
                  <span className="truncate">{item.label}</span>
                  {isActive && (
                    <span className="ml-auto w-1.5 h-1.5 rounded-full bg-indigo-600 shrink-0" />
                  )}
                </>
              )}
            </NavLink>
          );
        })}

        <div className="pt-4 pb-2 px-3 text-[11px] font-bold uppercase tracking-wider text-slate-400">
          Workflows
        </div>

        <Link
          to="/upload"
          onClick={handleLinkClick}
          className="flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors"
        >
          <span className="flex items-center gap-2">
            <UploadCloud className="w-3.5 h-3.5 text-slate-400" />
            <span>Process PDF / Scan</span>
          </span>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
        </Link>

        <Link
          to="/patient-intake"
          onClick={handleLinkClick}
          className="flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors"
        >
          <span className="flex items-center gap-2">
            <UserPlus className="w-3.5 h-3.5 text-slate-400" />
            <span>Intake Form</span>
          </span>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
        </Link>
      </div>

      {/* Active Patient Card */}
      <div className="p-3 border-t border-slate-200 bg-slate-50/70">
        <div className="bg-white rounded-lg border border-slate-200 p-3 shadow-2xs">
          {patient ? (
            <>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Active Record
                </span>
                <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase text-green-700 bg-green-50 px-1.5 py-0.5 rounded border border-green-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                  Active
                </span>
              </div>

              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-full bg-indigo-100 text-indigo-800 text-xs font-bold flex items-center justify-center shrink-0">
                  {patient.fullName ? patient.fullName.charAt(0) : 'P'}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold text-slate-900 truncate">
                    {patient.fullName || 'Unnamed Patient'}
                  </p>
                  <p className="text-[10px] text-slate-500 font-mono">
                    MRN: {patient.mrn || 'N/A'}
                  </p>
                </div>
              </div>

              <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between">
                <button
                  id="sidebar-reset-demo-btn"
                  type="button"
                  onClick={resetToDefault}
                  className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-500 hover:text-rose-600 transition-colors"
                  title="Clear patient record"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Clear Record</span>
                </button>

                <Link
                  to="/dashboard"
                  onClick={handleLinkClick}
                  className="text-[11px] font-semibold text-indigo-600 hover:text-indigo-800"
                >
                  View Dashboard →
                </Link>
              </div>
            </>
          ) : (
            <div className="text-center py-2 space-y-2">
              <p className="text-xs font-semibold text-slate-600">No Patient Record</p>
              <p className="text-[10px] text-slate-400 leading-tight">
                No active patient currently selected.
              </p>
              <Link
                to="/patient-intake"
                onClick={handleLinkClick}
                className="inline-flex items-center justify-center gap-1 w-full py-1.5 px-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded text-xs font-medium transition-colors"
              >
                <UserPlus className="w-3 h-3" />
                <span>Add Patient</span>
              </Link>
            </div>
          )}
        </div>

        {/* Safety Micro Notice */}
        <div className="mt-2 text-[10px] text-slate-400 leading-tight px-1 flex items-start gap-1">
          <ShieldAlert className="w-3 h-3 text-amber-500 shrink-0 mt-0.5" />
          <span>Non-diagnostic tool. Clinical review required.</span>
        </div>
      </div>
    </aside>
  );
};
