import React from 'react';
import { FileText, Clock, UserCheck } from 'lucide-react';

interface MedicalHistoryCardProps {
  medicalHistory: string;
  lastUpdated?: string;
}

export const MedicalHistoryCard: React.FC<MedicalHistoryCardProps> = ({
  medicalHistory,
  lastUpdated
}) => {
  const hasHistory = Boolean(medicalHistory && medicalHistory.trim().length > 0);

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-3">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <FileText className="w-4 h-4 text-indigo-600" />
          <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider">
            Documented Medical History
          </h3>
        </div>
        {lastUpdated && (
          <span className="text-[11px] text-slate-400 flex items-center gap-1 font-mono">
            <Clock className="w-3 h-3" />
            <span>Updated: {lastUpdated}</span>
          </span>
        )}
      </div>

      {hasHistory ? (
        <div className="p-4 rounded-lg bg-slate-50 border border-slate-200/80 text-xs text-slate-700 leading-relaxed whitespace-pre-wrap">
          {medicalHistory}
        </div>
      ) : (
        <div className="p-4 rounded-lg bg-slate-50/60 border border-dashed border-slate-200 text-center py-6">
          <p className="text-xs text-slate-400 italic">
            No past surgical interventions, hospitalizations, or family history recorded for this patient.
          </p>
        </div>
      )}
    </div>
  );
};
