import React from 'react';
import { Link } from 'react-router-dom';
import { User, Calendar, Edit3, CheckCircle2, Clock } from 'lucide-react';
import { PatientProfile } from '../../types';

interface PatientProfileCardProps {
  patient: PatientProfile;
}

export const PatientProfileCard: React.FC<PatientProfileCardProps> = ({ patient }) => {
  const initials = patient.fullName
    ? patient.fullName
        .split(' ')
        .filter(Boolean)
        .map((n) => n[0])
        .join('')
        .slice(0, 3)
    : 'PT';

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-4 border-b border-slate-100">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold text-lg shadow-xs shrink-0">
            {initials}
          </div>
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                Active Patient Profile
              </span>
              <span className="bg-green-100 text-green-700 text-[10px] px-2 py-0.5 rounded-full font-bold uppercase">
                Active Record
              </span>
            </div>
            <h2 className="text-xl font-bold text-slate-900 mt-0.5">{patient.fullName}</h2>
            <div className="flex items-center gap-2.5 text-xs text-slate-500 mt-0.5 flex-wrap font-medium">
              <span>
                Age: <strong className="text-slate-800">{patient.age}</strong>
              </span>
              <span className="w-1 h-1 rounded-full bg-slate-300" />
              <span>
                Sex: <strong className="text-slate-800">{patient.sex}</strong>
              </span>
              <span className="w-1 h-1 rounded-full bg-slate-300" />
              {patient.bloodType && patient.bloodType !== 'Unspecified' && (
                <>
                  <span>
                    Blood Type: <strong className="text-slate-800">{patient.bloodType}</strong>
                  </span>
                  <span className="w-1 h-1 rounded-full bg-slate-300" />
                </>
              )}
              <span className="font-mono text-slate-600">MRN: #{patient.mrn}</span>
            </div>
          </div>
        </div>

        {/* Edit Patient Information Button */}
        <Link
          id="btn-edit-patient-info"
          to="/patient-intake"
          className="self-start inline-flex items-center gap-2 px-3.5 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg text-xs font-semibold transition-colors border border-indigo-200 shadow-2xs"
          title="Open patient information form to edit existing details"
        >
          <Edit3 className="w-3.5 h-3.5 text-indigo-600" />
          <span>Edit Patient Information</span>
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
        <div className="flex items-center gap-2.5 text-slate-600">
          <User className="w-4 h-4 text-indigo-600 shrink-0" />
          <div>
            <span className="text-slate-400 block text-[11px] font-medium">Subject Identity</span>
            <span className="font-semibold text-slate-800">
              {patient.fullName} ({patient.age} y/o &bull; {patient.sex})
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2.5 text-slate-600">
          <Clock className="w-4 h-4 text-indigo-600 shrink-0" />
          <div>
            <span className="text-slate-400 block text-[11px] font-medium">Record Last Updated</span>
            <span className="font-semibold text-slate-800">{patient.lastUpdated}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
