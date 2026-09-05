/**
 * MedLens API & Service Interface
 *
 * Designed to seamlessly transition from local state / mock responses
 * to FastAPI backend endpoints and Google Gemini API in subsequent development phases.
 */

import { PatientProfile, MedicalReport, LabResult, TimelineEvent } from '../types';
import {
  initialPatientProfile,
  mockMedicalReports,
  sampleLabResults,
  sampleTimelineEvents
} from '../data/mockPatientData';

export interface DocumentUploadResponse {
  success: boolean;
  message: string;
  reportId?: string;
  extractedRecord?: Partial<MedicalReport>;
}

export interface ClinicalSummaryResponse {
  summary: string;
  keyConcerns: string[];
  suggestedTopicsForDoctorDiscussion: string[];
  lastCalculated: string;
}

export const ClinicalApiService = {
  /**
   * Fetch current patient record
   * (Will route to `GET /api/v1/patients/{patient_id}` in FastAPI backend)
   */
  async getPatientProfile(patientId?: string): Promise<PatientProfile> {
    // Simulated latency to mirror network behavior
    await new Promise((resolve) => setTimeout(resolve, 150));
    return initialPatientProfile;
  },

  /**
   * Update patient intake / demographic profile
   * (Will route to `PUT /api/v1/patients/{patient_id}` in FastAPI backend)
   */
  async updatePatientProfile(updated: Partial<PatientProfile>): Promise<PatientProfile> {
    await new Promise((resolve) => setTimeout(resolve, 250));
    return {
      ...initialPatientProfile,
      ...updated,
      lastUpdated: new Date().toISOString().split('T')[0]
    };
  },

  /**
   * Fetch structured medical reports
   * (Will route to `GET /api/v1/patients/{patient_id}/reports` in PostgreSQL / FastAPI)
   */
  async getReports(patientId?: string): Promise<MedicalReport[]> {
    await new Promise((resolve) => setTimeout(resolve, 150));
    return mockMedicalReports;
  },

  /**
   * Fetch specific report by ID
   */
  async getReportById(reportId: string): Promise<MedicalReport | undefined> {
    await new Promise((resolve) => setTimeout(resolve, 100));
    return mockMedicalReports.find((r) => r.id === reportId);
  },

  /**
   * Fetch consolidated laboratory analytes
   */
  async getLabResults(patientId?: string): Promise<LabResult[]> {
    await new Promise((resolve) => setTimeout(resolve, 150));
    return sampleLabResults;
  },

  /**
   * Fetch chronological clinical timeline
   */
  async getTimelineEvents(patientId?: string): Promise<TimelineEvent[]> {
    await new Promise((resolve) => setTimeout(resolve, 150));
    return sampleTimelineEvents;
  },

  /**
   * Upload and process medical document placeholder
   * (In Phase 2, this will send multipart/form-data to FastAPI -> OCR -> Gemini API)
   */
  async uploadReportPlaceholder(file: File): Promise<DocumentUploadResponse> {
    await new Promise((resolve) => setTimeout(resolve, 800));
    return {
      success: true,
      message: `Document '${file.name}' ingested successfully. Structured entity extraction queued.`,
      reportId: `REP-${Date.now().toString().slice(-4)}`,
      extractedRecord: {
        title: file.name.replace(/\.[^/.]+$/, '').replace(/_/g, ' '),
        date: new Date().toISOString().split('T')[0],
        fileName: file.name,
        fileSize: `${(file.size / (1024 * 1024)).toFixed(2)} MB`,
        status: 'Processed'
      }
    };
  }
};
