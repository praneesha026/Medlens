import React, { useState } from 'react';
import { NavLink, Link } from 'react-router-dom';
import {
  Activity,
  FileText,
  UploadCloud,
  LayoutDashboard,
  UserPlus,
  Menu,
  X,
  RotateCcw,
  Sparkles,
  ChevronRight
} from 'lucide-react';
import { usePatient } from '../context/PatientContext';

export const Navbar: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { patient, resetToDefault } = usePatient();

  const navLinks = [
    { to: '/', label: 'Home', icon: Activity },
    { to: '/patient-intake', label: 'Patient Intake', icon: UserPlus },
    { to: '/upload', label: 'Upload Report', icon: UploadCloud },
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/report-details', label: 'Report Details', icon: FileText }
  ];

  return (
    <header className="sticky top-0 z-40 bg-slate-900 border-b border-slate-800 text-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <Link
            id="nav-brand-logo"
            to="/"
            className="flex items-center gap-3 group focus:outline-none"
          >
            <div className="w-8 h-8 bg-indigo-500 rounded-lg flex items-center justify-center text-white shadow-xs group-hover:bg-indigo-400 transition-colors">
              <Activity className="w-5 h-5 text-white stroke-[2.5]" />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-lg tracking-tight text-white">MedLens</span>
                <span className="text-[10px] font-semibold uppercase tracking-wider bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 px-1.5 py-0.5 rounded">
                  Intelligence
                </span>
              </div>
              <span className="text-[11px] text-slate-400 hidden sm:inline -mt-0.5 font-medium">
                Clinical Information Structuring
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  id={`nav-link-${item.label.toLowerCase().replace(/\s+/g, '-')}`}
                  className={({ isActive }) =>
                    `flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-slate-800 text-indigo-400 border border-slate-700/80 shadow-xs'
                        : 'text-slate-400 hover:text-white hover:bg-slate-800'
                    }`
                  }
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </NavLink>
              );
            })}
          </nav>

          {/* Right Action / Active Patient Tag & Clinician Badge */}
          <div className="hidden lg:flex items-center gap-3">
            <Link
              to="/dashboard"
              className="flex items-center gap-2.5 bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 hover:border-slate-600 px-3 py-1.5 rounded-md text-xs transition-colors"
              title="Active synthetic patient record"
            >
              <div className="w-5 h-5 rounded-full bg-slate-700 text-[10px] font-bold text-slate-200 flex items-center justify-center">
                {patient.fullName.charAt(0)}
              </div>
              <div className="flex flex-col text-left">
                <span className="font-medium text-slate-200 leading-tight">{patient.fullName}</span>
                <span className="text-[10px] text-slate-400 font-mono">ID: {patient.mrn}</span>
              </div>
              <span className="bg-green-100 text-green-700 text-[9px] px-1.5 py-0.2 rounded-full font-bold uppercase ml-1">
                Active
              </span>
              <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
            </Link>

            <button
              id="reset-demo-data-btn"
              onClick={resetToDefault}
              title="Reset synthetic state to default"
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-md transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>

          {/* Mobile Menu Toggle Button */}
          <div className="flex md:hidden items-center gap-2">
            <button
              id="mobile-menu-toggle"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-md text-slate-300 hover:text-white hover:bg-slate-800 focus:outline-none"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Dropdown Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-800 bg-slate-900 px-4 pt-3 pb-5 space-y-1">
          <div className="px-3 py-2 bg-slate-800 border border-slate-700 rounded-md mb-3 flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs">
              <span className="w-2 h-2 rounded-full bg-green-500" />
              <span className="font-medium text-slate-200">{patient.fullName}</span>
              <span className="text-slate-400">({patient.age} y/o)</span>
            </div>
            <button
              onClick={() => {
                resetToDefault();
                setMobileMenuOpen(false);
              }}
              className="text-[11px] text-indigo-400 font-medium hover:underline flex items-center gap-1"
            >
              <RotateCcw className="w-3 h-3" /> Reset Demo
            </button>
          </div>

          {navLinks.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={() => setMobileMenuOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3.5 py-2.5 rounded-md text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-slate-800 text-indigo-400 border border-slate-700'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800'
                  }`
                }
              >
                <Icon className="w-4 h-4 text-indigo-400" />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </div>
      )}
    </header>
  );
};
