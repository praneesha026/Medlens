import React from 'react';
import { Link } from 'react-router-dom';
import { usePatient } from '../context/PatientContext';
import { PatientProfileCard } from '../components/dashboard/PatientProfileCard';
import { ClinicalFactorsCard } from '../components/dashboard/ClinicalFactorsCard';
import { MedicalHistoryCard } from '../components/dashboard/MedicalHistoryCard';
import { RecentReportsList } from '../components/dashboard/RecentReportsList';
import { LaboratoryResultsTable } from '../components/dashboard/LaboratoryResultsTable';
import { MedicalTimeline } from '../components/dashboard/MedicalTimeline';
import { AiSummaryCard } from '../components/dashboard/AiSummaryCard';
import { ReportComparisonCard } from '../components/dashboard/ReportComparisonCard';
import { SafetyNotice } from '../components/SafetyNotice';
import {
  Printer,
  UploadCloud,
  User,
  Plus,
  Sparkles,
  Edit3,
  FileText,
  Activity,
  AlertCircle
} from 'lucide-react';

export const PatientDashboardPage: React.FC = () => {
  const {
    patient,
    hasPatientData,
    isCustomData,
    reports,
    labResults,
    timeline,
    loadSampleProfile,
    updateLabResultItem,
    toggleVerifyLabResult
  } = usePatient();

  const handlePrint = () => {
    window.print();
  };

  // If no patient information has been entered or loaded yet
  if (!hasPatientData || !patient) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-6">
        <SafetyNotice variant="compact" />

        <div className="bg-white rounded-xl border border-slate-200 p-8 sm:p-14 text-center shadow-sm space-y-5">
          <div className="w-16 h-16 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-600 mx-auto flex items-center justify-center">
            <User className="w-8 h-8 text-indigo-500" />
          </div>

          <div className="space-y-1">
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
              No patient information available.
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto leading-relaxed">
              No active patient record has been entered or loaded yet. Fill out the clinical
              information intake to organize symptoms, conditions, allergies, and medications.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Link
              id="btn-intake-empty-state"
              to="/patient-intake"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Enter Patient Information</span>
            </Link>

            <button
              id="btn-load-demo-empty-state"
              type="button"
              onClick={loadSampleProfile}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-medium border border-slate-200 transition-colors"
            >
              <Sparkles className="w-4 h-4 text-indigo-600" />
              <span>Load Demo Record (Eleanor Vance)</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Console Header Bar */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 sm:px-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-0.5">
            <h1 className="text-lg font-semibold text-slate-900">
              Patient Intelligence Console
            </h1>
            <span
              className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                isCustomData
                  ? 'bg-indigo-100 text-indigo-700'
                  : 'bg-emerald-100 text-emerald-700'
              }`}
            >
              {isCustomData ? 'Custom User Record' : 'Synthetic Demo Case'}
            </span>
          </div>
          <p className="text-xs text-slate-500 font-mono">
            MRN: #{patient.mrn} &bull; Subject: {patient.fullName} &bull; Age: {patient.age} &bull;
            Sex: {patient.sex}
          </p>
        </div>

        <div className="flex items-center gap-2.5 sm:gap-3 flex-wrap">
          {/* Edit Patient Information Button */}
          <Link
            id="btn-edit-patient-topbar"
            to="/patient-intake"
            className="px-3.5 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg text-xs font-semibold transition-colors border border-indigo-200 flex items-center gap-1.5 shadow-2xs"
          >
            <Edit3 className="w-3.5 h-3.5 text-indigo-600" />
            <span>Edit Patient Information</span>
          </Link>

          <button
            onClick={handlePrint}
            className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-medium transition-colors border border-slate-200 flex items-center gap-1.5"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print / Export</span>
          </button>

          <Link
            to="/upload"
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors flex items-center gap-1.5"
          >
            <UploadCloud className="w-3.5 h-3.5" />
            <span>Process New Data</span>
          </Link>
        </div>
      </div>

      {/* Mandatory Safety Notice */}
      <SafetyNotice variant="compact" />

      {/* Section 1: Patient Profile Card (Includes Name, Age, Sex, Edit button) */}
      <PatientProfileCard patient={patient} />

      {/* Section 2: Clinical Factors (Symptoms, Existing Conditions, Allergies, Current Medications) */}
      <ClinicalFactorsCard patient={patient} />

      {/* Section 3: Documented Medical History */}
      <MedicalHistoryCard
        medicalHistory={patient.medicalHistory}
        lastUpdated={patient.lastUpdated}
      />

      {/* Section 4: Patient-Friendly AI Summary (Requirement 1 & 2: Non-diagnostic, cached, manual trigger) */}
      <AiSummaryCard
        patient={patient}
        labResults={labResults}
        reportCount={reports.length}
      />

      {/* Section 5: Report Comparison (Previous Report vs Current Report - Requirement 4) */}
      <ReportComparisonCard
        reports={reports}
        defaultLabResults={labResults}
      />

      {/* Section 6: Laboratory Results Table (Requirement 1, 3, 6, 7: Status calculation, confidence, human verification, editing) */}
      {labResults.length > 0 ? (
        <LaboratoryResultsTable
          labResults={labResults}
          onUpdateItem={updateLabResultItem}
          onToggleVerify={toggleVerifyLabResult}
        />
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 p-8 shadow-sm text-center space-y-3">
          <Activity className="w-8 h-8 text-slate-400 mx-auto" />
          <h3 className="text-sm font-bold text-slate-800">No Structured Laboratory Analytes Yet</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
            Upload medical reports or laboratory panels to automatically extract and populate
            structured lab test tables with source reference ranges and confidence scores.
          </p>
          <div className="pt-1">
            <Link
              to="/upload"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-700 transition-colors shadow-2xs"
            >
              <UploadCloud className="w-3.5 h-3.5" />
              <span>Upload Medical Report</span>
            </Link>
          </div>
        </div>
      )}

      {/* Section 7: Medical Reports & Longitudinal Timeline (Requirement 1, 5, 6) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RecentReportsList reports={reports} />
        <MedicalTimeline events={timeline} />
      </div>
    </div>
  );
};
