import React, { useState, useMemo } from 'react';
import {
  Calendar,
  Stethoscope,
  FileSpreadsheet,
  Pill,
  HeartPulse,
  Scan,
  Activity,
  Sparkles,
  Upload,
  UserCheck,
  User,
  Clock,
  Filter,
  CheckCircle2
} from 'lucide-react';
import { TimelineEvent } from '../../types';
import { formatDate } from '../../utils/formatters';

interface MedicalTimelineProps {
  events: TimelineEvent[];
}

export const MedicalTimeline: React.FC<MedicalTimelineProps> = ({ events }) => {
  const [selectedFilter, setSelectedFilter] = useState<string>('All');

  const filterOptions = [
    'All',
    'Reports & Ingestion',
    'AI Extractions',
    'Human Verifications',
    'AI Summaries',
    'Clinical Encounters'
  ];

  const filteredEvents = useMemo(() => {
    return events.filter((evt) => {
      if (selectedFilter === 'All') return true;
      if (selectedFilter === 'Reports & Ingestion') {
        return evt.type === 'Report Upload' || evt.type === 'Lab' || evt.type === 'Imaging';
      }
      if (selectedFilter === 'AI Extractions') {
        return evt.type === 'AI Extraction & Processing';
      }
      if (selectedFilter === 'Human Verifications') {
        return evt.type === 'Human Verification';
      }
      if (selectedFilter === 'AI Summaries') {
        return evt.type === 'AI Summary Generated';
      }
      if (selectedFilter === 'Clinical Encounters') {
        return evt.type === 'Encounter' || evt.type === 'Patient Profile Update';
      }
      return true;
    });
  }, [events, selectedFilter]);

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'Patient Profile Update':
        return <User className="w-4 h-4 text-blue-600" />;
      case 'Report Upload':
        return <Upload className="w-4 h-4 text-indigo-600" />;
      case 'AI Extraction & Processing':
        return <Sparkles className="w-4 h-4 text-purple-600" />;
      case 'Human Verification':
        return <UserCheck className="w-4 h-4 text-emerald-600" />;
      case 'AI Summary Generated':
        return <Activity className="w-4 h-4 text-amber-600" />;
      case 'Encounter':
        return <Stethoscope className="w-4 h-4 text-teal-600" />;
      case 'Lab':
        return <FileSpreadsheet className="w-4 h-4 text-cyan-600" />;
      case 'Medication':
        return <Pill className="w-4 h-4 text-indigo-600" />;
      case 'Diagnosis':
        return <HeartPulse className="w-4 h-4 text-rose-600" />;
      case 'Imaging':
        return <Scan className="w-4 h-4 text-amber-600" />;
      default:
        return <Activity className="w-4 h-4 text-slate-600" />;
    }
  };

  const getEventBg = (type: string) => {
    switch (type) {
      case 'Patient Profile Update':
        return 'bg-blue-50 border-blue-200 text-blue-700';
      case 'Report Upload':
        return 'bg-indigo-50 border-indigo-200 text-indigo-700';
      case 'AI Extraction & Processing':
        return 'bg-purple-50 border-purple-200 text-purple-700';
      case 'Human Verification':
        return 'bg-emerald-50 border-emerald-200 text-emerald-700';
      case 'AI Summary Generated':
        return 'bg-amber-50 border-amber-200 text-amber-700';
      case 'Encounter':
        return 'bg-teal-50 border-teal-200 text-teal-700';
      case 'Lab':
        return 'bg-cyan-50 border-cyan-200 text-cyan-700';
      default:
        return 'bg-slate-50 border-slate-200 text-slate-700';
    }
  };

  return (
    <div
      id="medical-timeline-card"
      className="bg-white rounded-xl border border-slate-200 p-5 sm:p-6 shadow-sm space-y-5"
    >
      {/* Header & Filter Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
        <div>
          <h3 className="text-base font-semibold text-slate-900 flex items-center gap-2">
            <Calendar className="w-4 h-4 text-indigo-600" />
            <span>Clinical Intelligence Timeline</span>
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Chronological audit of patient intake, report uploads, AI extractions, verifications, and
            summaries.
          </p>
        </div>

        <span className="text-xs font-mono font-medium text-slate-600 bg-slate-100 px-2.5 py-1 rounded-md self-start sm:self-center">
          {filteredEvents.length} Events Documented
        </span>
      </div>

      {/* Filter Tabs (Requirement 6) */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
        <Filter className="w-3.5 h-3.5 text-slate-400 mr-1 shrink-0" />
        {filterOptions.map((opt) => (
          <button
            key={opt}
            type="button"
            onClick={() => setSelectedFilter(opt)}
            className={`px-2.5 py-1 rounded-md font-medium transition-colors whitespace-nowrap ${
              selectedFilter === opt
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            {opt}
          </button>
        ))}
      </div>

      {/* Vertical Timeline Nodes */}
      <div className="relative pl-7 space-y-5 before:absolute before:left-3.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
        {filteredEvents.length === 0 ? (
          <div className="py-8 text-center text-slate-400 text-xs italic">
            No clinical timeline events match the selected category.
          </div>
        ) : (
          filteredEvents.map((evt) => (
            <div key={evt.id} className="relative group">
              {/* Timeline Icon Node */}
              <div
                className={`absolute -left-7 top-0.5 w-7 h-7 rounded-full border-2 border-white shadow-2xs flex items-center justify-center ${getEventBg(
                  evt.type
                )}`}
              >
                {getEventIcon(evt.type)}
              </div>

              {/* Event Content Box */}
              <div className="p-4 rounded-xl border border-slate-200/90 bg-slate-50/60 hover:bg-slate-50 hover:border-slate-300 transition-colors space-y-2">
                {/* Event Heading & Date/Time */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h4 className="text-xs sm:text-sm font-bold text-slate-900">{evt.title}</h4>
                    <span
                      className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded border font-semibold ${getEventBg(
                        evt.type
                      )}`}
                    >
                      {evt.type}
                    </span>
                    {evt.statusBadge && (
                      <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold uppercase">
                        {evt.statusBadge}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium whitespace-nowrap">
                    <Clock className="w-3 h-3 text-slate-400" />
                    <span>{formatDate(evt.date)}</span>
                    {evt.time && <span className="text-slate-400">at {evt.time}</span>}
                  </div>
                </div>

                {/* Event Description */}
                <p className="text-xs text-slate-700 leading-relaxed">{evt.description}</p>

                {/* Event Metadata (Source, Provider, Facility) */}
                <div className="flex items-center gap-2 text-[11px] text-slate-500 flex-wrap pt-1 border-t border-slate-200/50">
                  <span className="font-semibold text-slate-800">Source: {evt.source || evt.provider}</span>
                  {evt.facility && (
                    <>
                      <span className="w-1 h-1 rounded-full bg-slate-300" />
                      <span>{evt.facility}</span>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
