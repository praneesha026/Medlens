import React, { useState } from 'react';
import { Heart, FileText, AlertTriangle, Pill } from 'lucide-react';
import { PatientProfile } from '../../types';
import { getSeverityBadgeStyle } from '../../utils/formatters';

interface ClinicalFactorsCardProps {
  patient: PatientProfile;
}

export const ClinicalFactorsCard: React.FC<ClinicalFactorsCardProps> = ({ patient }) => {
  const [activeTab, setActiveTab] = useState<'all' | 'symptoms' | 'conditions' | 'allergies' | 'medications'>('all');

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
        <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider">
          Clinical Profile Factors
        </h3>

        {/* Filter Pills */}
        <div className="flex items-center gap-1 overflow-x-auto text-xs pb-1 sm:pb-0">
          {[
            { id: 'all', label: 'Overview' },
            { id: 'symptoms', label: `Symptoms (${patient.symptoms?.length || 0})` },
            { id: 'conditions', label: `Conditions (${patient.existingConditions?.length || 0})` },
            { id: 'allergies', label: `Allergies (${patient.allergies?.length || 0})` },
            { id: 'medications', label: `Meds (${patient.currentMedications?.length || 0})` }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Symptoms */}
        {(activeTab === 'all' || activeTab === 'symptoms') && (
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-wider">
              <Heart className="w-3.5 h-3.5 text-rose-500" />
              <span>Current Symptoms</span>
            </div>
            <div className="space-y-2">
              {patient.symptoms && patient.symptoms.length > 0 ? (
                patient.symptoms.map((symptom, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-lg bg-slate-50 border border-slate-200/80 text-xs text-slate-800 font-semibold flex items-center justify-between"
                  >
                    <span>{symptom}</span>
                    <span className="w-2 h-2 rounded-full bg-rose-500" />
                  </div>
                ))
              ) : (
                <p className="text-xs text-slate-400 italic">No symptoms reported.</p>
              )}
            </div>
          </div>
        )}

        {/* Existing Conditions */}
        {(activeTab === 'all' || activeTab === 'conditions') && (
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-wider">
              <FileText className="w-3.5 h-3.5 text-indigo-600" />
              <span>Existing Conditions</span>
            </div>
            <div className="space-y-2">
              {patient.existingConditions && patient.existingConditions.length > 0 ? (
                patient.existingConditions.map((cond, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-lg bg-slate-50 border border-slate-200/80 text-xs text-slate-800 font-semibold flex items-center justify-between"
                  >
                    <span>{cond}</span>
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-200 text-slate-700">
                      Chronic
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-xs text-slate-400 italic">No recorded conditions.</p>
              )}
            </div>
          </div>
        )}

        {/* Allergies */}
        {(activeTab === 'all' || activeTab === 'allergies') && (
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-wider">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
              <span>Allergies & Adverse Reactions</span>
            </div>
            <div className="space-y-2">
              {patient.allergies && patient.allergies.length > 0 ? (
                patient.allergies.map((allergy, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-lg bg-red-50/50 border border-red-200 text-xs flex items-center justify-between"
                  >
                    <div>
                      <span className="font-bold text-red-700">{allergy.allergen}</span>
                      <span className="text-slate-500 block text-[11px] mt-0.5">{allergy.reaction}</span>
                    </div>
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase border ${getSeverityBadgeStyle(
                        allergy.severity
                      )}`}
                    >
                      {allergy.severity}
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-xs text-slate-400 italic">No known drug allergies.</p>
              )}
            </div>
          </div>
        )}

        {/* Current Medications */}
        {(activeTab === 'all' || activeTab === 'medications') && (
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-wider">
              <Pill className="w-3.5 h-3.5 text-indigo-600" />
              <span>Current Medications</span>
            </div>
            <div className="space-y-2">
              {patient.currentMedications && patient.currentMedications.length > 0 ? (
                patient.currentMedications.map((med, idx) => (
                  <div
                    key={idx}
                    className="flex items-center space-x-3 p-3 bg-slate-50 border border-slate-200/80 rounded-lg justify-between"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-2 rounded-full bg-indigo-500 shrink-0" />
                      <div className="text-sm">
                        <p className="font-bold text-slate-800 text-xs">{med.name} <span className="text-slate-500 font-mono text-[11px] font-normal">({med.dosage})</span></p>
                        <p className="text-[11px] text-slate-500">{med.frequency} • {med.indication}</p>
                      </div>
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-green-100 text-green-700 font-bold uppercase shrink-0">
                      {med.status}
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-xs text-slate-400 italic">No medications recorded.</p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
