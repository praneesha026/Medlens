import React, { createContext, useContext, useState, useEffect } from 'react';
import { PatientProfile, MedicalReport, LabResult, TimelineEvent, ExtractedResultItem } from '../types';
import {
  initialPatientProfile,
  mockMedicalReports,
  sampleLabResults,
  sampleTimelineEvents
} from '../data/mockPatientData';
import {
  PatientService,
  StructuredPatient,
  fromStructuredFormat,
  toStructuredFormat
} from '../services/patientService';
import { ReportStorage, StoredReport } from '../utils/reportStorage';
import { ExtractionStorage } from '../utils/extractionStorage';
import { evaluateReferenceRange } from '../utils/referenceRangeEvaluator';

interface PatientContextType {
  patient: PatientProfile | null;
  hasPatientData: boolean;
  isCustomData: boolean;
  reports: MedicalReport[];
  labResults: LabResult[];
  timeline: TimelineEvent[];
  saveStructuredPatient: (data: StructuredPatient) => void;
  updatePatient: (profile: Partial<PatientProfile>) => void;
  clearPatientData: () => void;
  loadSampleProfile: () => void;
  addUploadedReport: (report: MedicalReport) => void;
  deleteUploadedReport: (reportId: string) => void;
  updateLabResultItem: (id: string, updated: Partial<LabResult | ExtractedResultItem>) => void;
  toggleVerifyLabResult: (id: string, currentVerified: boolean) => void;
  resetToDefault: () => void;
}

const PatientContext = createContext<PatientContextType | undefined>(undefined);

export const PatientProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Initialize patient from PatientService (localStorage)
  const [patient, setPatient] = useState<PatientProfile | null>(() => {
    const stored = PatientService.getPatient();
    if (stored && stored.name && stored.name.trim().length > 0) {
      return fromStructuredFormat(stored);
    }
    return null;
  });

  const [isCustomData, setIsCustomData] = useState<boolean>(() => {
    const stored = PatientService.getPatient();
    return Boolean(stored?.isCustom);
  });

  const [reports, setReports] = useState<MedicalReport[]>(() => {
    const stored = ReportStorage.getReports();
    return stored.map((r) => ({
      id: r.id,
      title: r.title || r.fileName,
      type: r.fileType || 'Medical Report',
      date: r.uploadDate,
      uploadDate: r.uploadDate,
      provider: r.provider || 'Self-Uploaded / Patient Record',
      facility: r.facility || 'Patient Document Ingestion',
      fileName: r.fileName,
      fileSize: r.fileSize,
      fileType: r.fileType,
      source: r.source,
      status: r.status,
      summaryPlaceholder: 'AI extraction will be available in the next step.',
      keyFindings: [],
      labResults: []
    }));
  });

  const [labResults, setLabResults] = useState<LabResult[]>([]);
  const [timeline, setTimeline] = useState<TimelineEvent[]>([]);

  // When patient or custom mode changes, update reports and timeline
  useEffect(() => {
    if (!patient) {
      // No patient data
      setTimeline([]);
      setLabResults([]);
      setReports(
        ReportStorage.getReports().map((r) => ({
          id: r.id,
          title: r.title || r.fileName,
          type: r.fileType || 'Medical Report',
          date: r.uploadDate,
          uploadDate: r.uploadDate,
          provider: r.provider || 'Self-Uploaded',
          facility: r.facility || 'Ingestion Portal',
          fileName: r.fileName,
          fileSize: r.fileSize,
          fileType: r.fileType,
          source: r.source,
          status: r.status,
          summaryPlaceholder: 'AI extraction will be available in the next step.',
          keyFindings: [],
          labResults: []
        }))
      );
      return;
    }

    if (!isCustomData) {
      // Demo / sample mode
      setReports(mockMedicalReports);
      setLabResults(sampleLabResults);
      setTimeline(sampleTimelineEvents);
    } else {
      // Custom user patient: load actual user-uploaded reports
      const stored = ReportStorage.getReports();
      const userReports: MedicalReport[] = stored.map((r) => ({
        id: r.id,
        title: r.title || r.fileName,
        type: r.fileType || 'Medical Report',
        date: r.uploadDate,
        uploadDate: r.uploadDate,
        provider: r.provider || 'Self-Uploaded',
        facility: r.facility || 'Ingestion Portal',
        fileName: r.fileName,
        fileSize: r.fileSize,
        fileType: r.fileType,
        source: r.source,
        status: r.status,
        summaryPlaceholder: 'AI extraction will be available in the next step.',
        keyFindings: [],
        labResults: []
      }));
      setReports(userReports);

      // Load any extracted lab results from ExtractionStorage for custom reports
      const allExtractions = ExtractionStorage.getAllExtractions();
      const extractedLabs: LabResult[] = [];

      Object.values(allExtractions).forEach((record) => {
        if (record.results && record.results.length > 0) {
          record.results.forEach((r) => {
            const rangeEval = evaluateReferenceRange(r.value, r.referenceRange);
            extractedLabs.push({
              id: r.id,
              testName: r.testName,
              value: r.value,
              unit: r.unit || '',
              referenceRange: r.referenceRange || 'Not provided in source report',
              status: rangeEval.status,
              category: r.category || 'Metabolic',
              date: r.date || record.extractedAt?.split('T')[0] || new Date().toISOString().split('T')[0],
              source: r.source || 'Uploaded Medical Document',
              confidence: r.confidence,
              confidenceLevel: r.confidenceLevel,
              isHumanVerified: Boolean(r.isHumanVerified),
              isEdited: Boolean(r.isEdited),
              verificationStatus: r.verificationStatus || (r.isHumanVerified ? 'Human Verified' : 'AI Extracted'),
              originalExtractedValue: r.originalExtractedValue || String(r.value),
              calculatedStatus: rangeEval.status
            } as any);
          });
        }
      });

      setLabResults(extractedLabs);

      // Initialize clinical timeline with intake event + any uploaded report events
      const userIntakeEvent: TimelineEvent = {
        id: `EVT-INTAKE-${patient.id}`,
        date: patient.lastUpdated || new Date().toISOString().split('T')[0],
        type: 'Patient Profile Update',
        title: 'Clinical Information Record Established',
        description: `Patient baseline documented for ${patient.fullName}. ${patient.symptoms.length} symptom(s) and ${patient.existingConditions.length} condition(s) noted.`,
        provider: 'MedLens Clinical Intake',
        facility: 'Patient Ingestion Portal',
        statusBadge: 'Documented'
      };

      const reportEvents: TimelineEvent[] = userReports.map((r) => ({
        id: `EVT-REP-${r.id}`,
        date: r.uploadDate || r.date,
        type: 'Report Upload',
        title: `Report Uploaded: ${r.fileName || r.title}`,
        description: `Document (${r.fileType || 'File'}, ${r.fileSize || 'Unknown size'}) uploaded to patient record. Status: ${r.status}.`,
        provider: r.source || 'User Uploaded',
        facility: r.facility,
        statusBadge: r.status
      }));

      // Check if extractions had events
      const extractionEvents: TimelineEvent[] = [];
      Object.values(allExtractions).forEach((rec) => {
        if (rec.results && rec.results.length > 0) {
          extractionEvents.push({
            id: `EVT-EXT-${rec.reportId}`,
            date: rec.extractedAt?.split('T')[0] || new Date().toISOString().split('T')[0],
            type: 'AI Extraction & Processing',
            title: `AI Structured Extraction Completed`,
            description: `Extracted ${rec.results.length} structured laboratory parameters from report ${rec.reportId}.`,
            provider: 'MedLens Clinical Intelligence (Gemini 3.8 Flash)',
            statusBadge: 'Processed'
          });
        }
      });

      setTimeline([userIntakeEvent, ...reportEvents, ...extractionEvents]);
    }
  }, [patient, isCustomData]);

  /**
   * Save structured patient object to localStorage and state
   */
  const saveStructuredPatient = (data: StructuredPatient) => {
    const saved = PatientService.savePatient(data);
    const converted = fromStructuredFormat(saved);
    setPatient(converted);
    setIsCustomData(true);
  };

  /**
   * Update patient profile partially
   */
  const updatePatient = (updated: Partial<PatientProfile>) => {
    if (!patient) {
      const dummyProfile: PatientProfile = {
        id: `PT-${Date.now().toString().slice(-5)}`,
        fullName: updated.fullName || '',
        age: updated.age || 0,
        sex: updated.sex || 'Prefer not to say',
        dob: updated.dob || '',
        mrn: updated.mrn || `MRN-${Math.floor(100000 + Math.random() * 900000)}`,
        bloodType: updated.bloodType || 'Unspecified',
        symptoms: updated.symptoms || [],
        existingConditions: updated.existingConditions || [],
        allergies: updated.allergies || [],
        currentMedications: updated.currentMedications || [],
        medicalHistory: updated.medicalHistory || '',
        lastUpdated: new Date().toISOString().split('T')[0],
        emergencyContact: {
          name: 'Primary Contact',
          relation: 'Designated Contact',
          phone: 'Not provided'
        }
      };
      const structured = toStructuredFormat(dummyProfile, true)!;
      saveStructuredPatient(structured);
      return;
    }

    const merged: PatientProfile = {
      ...patient,
      ...updated,
      lastUpdated: new Date().toISOString().split('T')[0]
    };
    const structured = toStructuredFormat(merged, true)!;
    saveStructuredPatient(structured);
  };

  /**
   * Clear patient data completely
   */
  const clearPatientData = () => {
    PatientService.clearPatient();
    ReportStorage.clearReports();
    setPatient(null);
    setIsCustomData(false);
    setReports([]);
    setLabResults([]);
    setTimeline([]);
  };

  /**
   * Load synthetic demo profile (Eleanor Vance)
   */
  const loadSampleProfile = () => {
    const sample = PatientService.loadSamplePatient();
    setPatient(fromStructuredFormat(sample));
    setIsCustomData(false);
    setReports(mockMedicalReports);
    setLabResults(sampleLabResults);
    setTimeline(sampleTimelineEvents);
  };

  /**
   * Add a newly uploaded report to storage and state
   */
  const addUploadedReport = (newReport: MedicalReport) => {
    // Persist to ReportStorage
    const storedItem: StoredReport = {
      id: newReport.id,
      fileName: newReport.fileName || newReport.title,
      fileType: newReport.fileType || newReport.type,
      fileSize: newReport.fileSize || 'Unknown size',
      uploadDate: newReport.uploadDate || newReport.date || new Date().toISOString().split('T')[0],
      status: (newReport.status as any) || 'READY_FOR_REVIEW',
      source: newReport.source || 'User Uploaded',
      title: newReport.title,
      facility: newReport.facility,
      provider: newReport.provider
    };

    ReportStorage.saveReport(storedItem);

    setReports((prev) => [newReport, ...prev.filter((r) => r.id !== newReport.id)]);

    const newTimelineEvent: TimelineEvent = {
      id: `EVT-REP-${newReport.id}`,
      date: newReport.uploadDate || newReport.date,
      type: 'Lab',
      title: `Report Uploaded: ${newReport.fileName || newReport.title}`,
      description: `Document (${newReport.fileType}, ${newReport.fileSize}) uploaded to patient record. Status: ${newReport.status}.`,
      provider: newReport.source || 'User Uploaded',
      facility: newReport.facility,
      statusBadge: newReport.status
    };
    setTimeline((prev) => [newTimelineEvent, ...prev]);

    if (newReport.labResults && newReport.labResults.length > 0) {
      setLabResults((prev) => [...newReport.labResults!, ...prev]);
    }
  };

  /**
   * Update an individual lab result item (Human Edit)
   */
  const updateLabResultItem = (id: string, updated: Partial<LabResult | ExtractedResultItem>) => {
    setLabResults((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const evalResult = evaluateReferenceRange(
            updated.value !== undefined ? updated.value : item.value,
            updated.referenceRange !== undefined ? updated.referenceRange : item.referenceRange
          );
          return {
            ...item,
            ...updated,
            calculatedStatus: evalResult.status,
            verificationStatus: 'Edited by User',
            isHumanVerified: true,
            isEdited: true,
            originalExtractedValue: (item as any).originalExtractedValue || String(item.value)
          } as any;
        }
        return item;
      })
    );

    // Also update in ExtractionStorage if present
    const allExtractions = ExtractionStorage.getAllExtractions();
    for (const [repId, record] of Object.entries(allExtractions)) {
      if (record.results.some((r) => r.id === id)) {
        const itemUpdates: Partial<ExtractedResultItem> = {
          ...(updated as any),
          value: updated.value !== undefined ? String(updated.value) : undefined,
          isHumanVerified: true,
          isEdited: true,
          verificationStatus: 'Edited by User'
        };
        ExtractionStorage.updateResultItem(repId, id, itemUpdates);
        break;
      }
    }

    // Add timeline audit event (Requirement 5 & 7)
    const auditEvent: TimelineEvent = {
      id: `EVT-EDIT-${Date.now().toString(36)}`,
      date: new Date().toISOString().split('T')[0],
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      type: 'Human Verification',
      title: 'Analyte Edited & Verified by User',
      description: `Test parameter was manually modified and confirmed by human reviewer.`,
      provider: 'Human Reviewer',
      source: 'Clinical Review Interface',
      statusBadge: 'Edited by User'
    };
    setTimeline((prev) => [auditEvent, ...prev]);
  };

  /**
   * Toggle verification status for a lab result
   */
  const toggleVerifyLabResult = (id: string, currentVerified: boolean) => {
    const newStatus = !currentVerified;
    setLabResults((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          return {
            ...item,
            isHumanVerified: newStatus,
            verificationStatus: newStatus ? 'Human Verified' : 'AI Extracted'
          } as any;
        }
        return item;
      })
    );

    // Also update in ExtractionStorage if present
    const allExtractions = ExtractionStorage.getAllExtractions();
    for (const [repId, record] of Object.entries(allExtractions)) {
      if (record.results.some((r) => r.id === id)) {
        ExtractionStorage.updateResultItem(repId, id, {
          isHumanVerified: newStatus,
          verificationStatus: newStatus ? 'Human Verified' : 'AI Extracted'
        });
        break;
      }
    }

    const auditEvent: TimelineEvent = {
      id: `EVT-VER-${Date.now().toString(36)}`,
      date: new Date().toISOString().split('T')[0],
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      type: 'Human Verification',
      title: newStatus ? 'Human Verification Confirmed' : 'Verification Reverted to AI',
      description: newStatus
        ? 'Clinical analyte was verified against source medical document by human reviewer.'
        : 'Analyte verification reset to unverified AI Extracted state.',
      provider: 'Human Reviewer',
      source: 'Clinical Review Interface',
      statusBadge: newStatus ? 'Human Verified' : 'AI Extracted'
    };
    setTimeline((prev) => [auditEvent, ...prev]);
  };

  /**
   * Delete a report by ID
   */
  const deleteUploadedReport = (reportId: string) => {
    ReportStorage.deleteReport(reportId);
    setReports((prev) => prev.filter((r) => r.id !== reportId));
    setTimeline((prev) => prev.filter((t) => t.id !== `EVT-REP-${reportId}`));
  };

  /**
   * Reset everything to empty
   */
  const resetToDefault = () => {
    clearPatientData();
  };

  const hasPatientData = Boolean(patient && patient.fullName && patient.fullName.trim().length > 0);

  return (
    <PatientContext.Provider
      value={{
        patient,
        hasPatientData,
        isCustomData,
        reports,
        labResults,
        timeline,
        saveStructuredPatient,
        updatePatient,
        clearPatientData,
        loadSampleProfile,
        addUploadedReport,
        deleteUploadedReport,
        updateLabResultItem,
        toggleVerifyLabResult,
        resetToDefault
      }}
    >
      {children}
    </PatientContext.Provider>
  );
};

export function usePatient(): PatientContextType {
  const context = useContext(PatientContext);
  if (!context) {
    throw new Error('usePatient must be used within a PatientProvider');
  }
  return context;
}
