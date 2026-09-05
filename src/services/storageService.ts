/**
 * MedLens Storage & Service Abstraction Layer
 * 
 * Architecture Requirement 9:
 * Decouples the React frontend from underlying persistence.
 * Currently proxies to structured local browser storage (localStorage).
 * Designed for immediate plug-and-play migration to FastAPI + PostgreSQL backend:
 * 
 * Frontend Component
 *       ↓
 * StorageService / API Client
 *       ↓ (Future HTTP / REST API routes: /api/v1/patients, /api/v1/reports, etc.)
 * FastAPI Backend
 *       ↓
 * PostgreSQL Database
 */

import {
  PatientProfile,
  MedicalReport,
  ReportExtractionRecord,
  ExtractedResultItem,
  PatientSummaryRecord,
  TimelineEvent
} from '../types';
import { PatientService, StructuredPatient, fromStructuredFormat, toStructuredFormat } from './patientService';
import { ReportStorage, StoredReport } from '../utils/reportStorage';
import { ExtractionStorage } from '../utils/extractionStorage';

const SUMMARY_STORAGE_PREFIX = 'medlens_summary_';
const AUDIT_STORAGE_KEY = 'medlens_audit_timeline';

export const StorageService = {
  // ==========================================
  // PATIENT REPOSITORY (Mapped to /api/v1/patients)
  // ==========================================
  patient: {
    async getPatient(): Promise<PatientProfile | null> {
      const stored = PatientService.getPatient();
      if (stored && stored.name && stored.name.trim().length > 0) {
        return fromStructuredFormat(stored);
      }
      return null;
    },

    async savePatient(patient: PatientProfile): Promise<PatientProfile> {
      const structured = toStructuredFormat(patient, true);
      if (structured) {
        PatientService.savePatient(structured);
      }
      return patient;
    },

    async clearPatient(): Promise<void> {
      PatientService.clearPatient();
    }
  },

  // ==========================================
  // MEDICAL REPORT REPOSITORY (Mapped to /api/v1/reports)
  // ==========================================
  reports: {
    async getAll(): Promise<MedicalReport[]> {
      const stored = ReportStorage.getReports();
      return stored.map((r) => ({
        id: r.id,
        title: r.title || r.fileName,
        type: r.fileType || 'Medical Report',
        date: r.uploadDate,
        uploadDate: r.uploadDate,
        provider: r.provider || 'Self-Uploaded',
        facility: r.facility || 'Patient Document Ingestion',
        fileName: r.fileName,
        fileSize: r.fileSize,
        fileType: r.fileType,
        source: r.source,
        status: r.status,
        summaryPlaceholder: 'Structured extraction available.',
        keyFindings: [],
        labResults: []
      }));
    },

    async save(report: MedicalReport): Promise<MedicalReport> {
      const stored: StoredReport = {
        id: report.id,
        fileName: report.fileName || report.title,
        fileType: report.fileType || report.type,
        fileSize: report.fileSize || 'Unknown size',
        uploadDate: report.uploadDate || report.date || new Date().toISOString().split('T')[0],
        status: (report.status as any) || 'READY_FOR_REVIEW',
        source: report.source || 'User Uploaded',
        title: report.title,
        facility: report.facility,
        provider: report.provider
      };
      ReportStorage.saveReport(stored);
      return report;
    },

    async delete(reportId: string): Promise<void> {
      ReportStorage.deleteReport(reportId);
      ExtractionStorage.deleteExtraction(reportId);
    }
  },

  // ==========================================
  // EXTRACTION REPOSITORY (Mapped to /api/v1/extractions)
  // ==========================================
  extractions: {
    async get(reportId: string): Promise<ReportExtractionRecord | null> {
      return ExtractionStorage.getExtraction(reportId);
    },

    async getAll(): Promise<Record<string, ReportExtractionRecord>> {
      return ExtractionStorage.getAllExtractions();
    },

    async save(record: ReportExtractionRecord): Promise<void> {
      ExtractionStorage.saveExtraction(record);
    },

    async updateItem(
      reportId: string,
      itemId: string,
      updatedFields: Partial<ExtractedResultItem>
    ): Promise<ReportExtractionRecord | null> {
      return ExtractionStorage.updateResultItem(reportId, itemId, updatedFields);
    },

    async verifyItem(
      reportId: string,
      itemId: string,
      isVerified: boolean,
      verifiedBy?: string
    ): Promise<ReportExtractionRecord | null> {
      return ExtractionStorage.verifyResultItem(reportId, itemId, isVerified, verifiedBy);
    }
  },

  // ==========================================
  // AI SUMMARY REPOSITORY (Mapped to /api/v1/summaries)
  // ==========================================
  summaries: {
    async get(patientId: string): Promise<PatientSummaryRecord | null> {
      try {
        const raw = localStorage.getItem(`${SUMMARY_STORAGE_PREFIX}${patientId}`);
        if (!raw) return null;
        return JSON.parse(raw);
      } catch (e) {
        console.error('Error reading summary from storage:', e);
        return null;
      }
    },

    async save(summary: PatientSummaryRecord): Promise<void> {
      try {
        localStorage.setItem(
          `${SUMMARY_STORAGE_PREFIX}${summary.patientId}`,
          JSON.stringify(summary)
        );
      } catch (e) {
        console.error('Error saving summary to storage:', e);
      }
    },

    async clear(patientId: string): Promise<void> {
      try {
        localStorage.removeItem(`${SUMMARY_STORAGE_PREFIX}${patientId}`);
      } catch (e) {
        console.error('Error clearing summary from storage:', e);
      }
    }
  },

  // ==========================================
  // CLINICAL TIMELINE & AUDIT LOG (Mapped to /api/v1/timeline)
  // ==========================================
  timeline: {
    async getCustomEvents(): Promise<TimelineEvent[]> {
      try {
        const raw = localStorage.getItem(AUDIT_STORAGE_KEY);
        if (!raw) return [];
        return JSON.parse(raw);
      } catch {
        return [];
      }
    },

    async addEvent(event: TimelineEvent): Promise<void> {
      try {
        const events = await this.getCustomEvents();
        const updated = [event, ...events.filter((e) => e.id !== event.id)];
        localStorage.setItem(AUDIT_STORAGE_KEY, JSON.stringify(updated.slice(0, 100)));
      } catch (e) {
        console.error('Error recording timeline event:', e);
      }
    },

    async clear(): Promise<void> {
      localStorage.removeItem(AUDIT_STORAGE_KEY);
    }
  }
};
