import { LabStatus } from '../types';

export function formatDate(dateString: string): string {
  try {
    const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
  } catch {
    return dateString;
  }
}

export function getStatusBadgeStyle(status: LabStatus): {
  bg: string;
  text: string;
  border: string;
  dot: string;
} {
  switch (status) {
    case 'Normal':
      return {
        bg: 'bg-green-100 text-green-700',
        text: 'text-green-700',
        border: 'border-green-200',
        dot: 'bg-green-500'
      };
    case 'High':
      return {
        bg: 'bg-red-100 text-red-700',
        text: 'text-red-700',
        border: 'border-red-200',
        dot: 'bg-red-500'
      };
    case 'Low':
      return {
        bg: 'bg-blue-100 text-blue-700',
        text: 'text-blue-700',
        border: 'border-blue-200',
        dot: 'bg-blue-500'
      };
    case 'Abnormal':
    case 'Critical':
      return {
        bg: 'bg-red-100 text-red-700',
        text: 'text-red-700',
        border: 'border-red-300',
        dot: 'bg-red-600'
      };
    default:
      return {
        bg: 'bg-slate-100 text-slate-700',
        text: 'text-slate-700',
        border: 'border-slate-200',
        dot: 'bg-slate-400'
      };
  }
}

export function getSeverityBadgeStyle(severity: 'Mild' | 'Moderate' | 'Severe'): string {
  switch (severity) {
    case 'Severe':
      return 'bg-red-100 text-red-700 border-red-200 font-bold';
    case 'Moderate':
      return 'bg-amber-100 text-amber-700 border-amber-200 font-bold';
    case 'Mild':
      return 'bg-slate-100 text-slate-700 border-slate-200 font-medium';
  }
}
