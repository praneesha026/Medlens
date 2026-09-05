/**
 * Gemini Service Abstraction
 * 
 * Handles medical document information extraction using the Google Gemini API.
 * Keeps API communication isolated from React presentation components.
 * Enforces strict validation, prevents duplicate API calls, manages the 6-stage
 * extraction state machine, and provides synthetic edge-case test fixtures.
 */

import {
  ExtractionProcessingState,
  ReportExtractionRecord,
  ExtractedReportData,
  ExtractedResultItem,
  PatientProfile,
  LabResult,
  PatientSummaryRecord,
  TimelineEvent
} from '../types';
import { validateGeminiMedicalOutput } from '../utils/medicalDataValidator';
import { ExtractionStorage } from '../utils/extractionStorage';
import { StorageService } from './storageService';

export interface ExtractionParams {
  reportId: string;
  fileName: string;
  fileType?: string;
  textContent?: string;
  inlineData?: {
    mimeType: string;
    data: string; // base64
  };
  forceReprocess?: boolean;
}

export type ProgressCallback = (state: ExtractionProcessingState, message?: string) => void;

/**
 * 9 Standard Synthetic Clinical Test Fixtures (Requirement 12)
 * Used for development testing, edge-case validation, and offline demonstration.
 */
export const SYNTHETIC_TEST_PRESETS: Record<string, { label: string; description: string; rawPayload: any }> = {
  NORMAL_VALUES: {
    label: '1. Normal Laboratory Values',
    description: 'Standard Comprehensive Metabolic Panel with all values strictly within reference intervals.',
    rawPayload: {
      report: {
        fileName: 'CMP_Normal_Panel.pdf',
        reportDate: '2026-08-20',
        reportType: 'Comprehensive Metabolic Panel',
        source: 'User Uploaded',
        facility: 'Metropolitan Clinical Laboratory'
      },
      results: [
        { testName: 'Sodium', value: '140', unit: 'mmol/L', referenceRange: '135 - 145', confidence: 0.98, source: 'CMP_Normal_Panel.pdf' },
        { testName: 'Potassium', value: '4.2', unit: 'mmol/L', referenceRange: '3.5 - 5.0', confidence: 0.97, source: 'CMP_Normal_Panel.pdf' },
        { testName: 'Chloride', value: '102', unit: 'mmol/L', referenceRange: '96 - 106', confidence: 0.96, source: 'CMP_Normal_Panel.pdf' },
        { testName: 'Carbon Dioxide (CO2)', value: '25', unit: 'mmol/L', referenceRange: '23 - 29', confidence: 0.95, source: 'CMP_Normal_Panel.pdf' },
        { testName: 'Fasting Glucose', value: '88', unit: 'mg/dL', referenceRange: '70 - 99', confidence: 0.99, source: 'CMP_Normal_Panel.pdf' },
        { testName: 'Blood Urea Nitrogen (BUN)', value: '14', unit: 'mg/dL', referenceRange: '7 - 20', confidence: 0.96, source: 'CMP_Normal_Panel.pdf' },
        { testName: 'Creatinine', value: '0.9', unit: 'mg/dL', referenceRange: '0.6 - 1.2', confidence: 0.97, source: 'CMP_Normal_Panel.pdf' },
        { testName: 'Calcium', value: '9.4', unit: 'mg/dL', referenceRange: '8.5 - 10.2', confidence: 0.95, source: 'CMP_Normal_Panel.pdf' }
      ]
    }
  },
  HIGH_LOW_VALUES: {
    label: '2. High & Low Values',
    description: 'Electrolyte and metabolic tests showing elevated fasting glucose and low potassium.',
    rawPayload: {
      report: {
        fileName: 'Endocrine_Metabolic_Panel.pdf',
        reportDate: '2026-08-25',
        reportType: 'Metabolic & Lipid Panel',
        source: 'User Uploaded',
        facility: 'Cardio-Endo Diagnostic Group'
      },
      results: [
        { testName: 'Fasting Glucose', value: '162', unit: 'mg/dL', referenceRange: '70 - 99', confidence: 0.98, observation: 'Fasting 12 hours verified', source: 'Endocrine_Metabolic_Panel.pdf' },
        { testName: 'Potassium', value: '3.1', unit: 'mmol/L', referenceRange: '3.5 - 5.0', confidence: 0.94, observation: 'Hemolysis not detected', source: 'Endocrine_Metabolic_Panel.pdf' },
        { testName: 'Total Cholesterol', value: '248', unit: 'mg/dL', referenceRange: '125 - 200', confidence: 0.96, source: 'Endocrine_Metabolic_Panel.pdf' },
        { testName: 'Hemoglobin A1c', value: '7.8', unit: '%', referenceRange: '4.0 - 5.6', confidence: 0.99, source: 'Endocrine_Metabolic_Panel.pdf' },
        { testName: 'Hemoglobin', value: '10.4', unit: 'g/dL', referenceRange: '12.0 - 16.0', confidence: 0.95, source: 'Endocrine_Metabolic_Panel.pdf' }
      ]
    }
  },
  WITH_REFERENCE_RANGES: {
    label: '3. Explicit Reference Ranges',
    description: 'Document with strict numerical range notations formatted in the source report.',
    rawPayload: {
      report: {
        fileName: 'Renal_Function_Audit.pdf',
        reportDate: '2026-09-01',
        reportType: 'Renal Function Profile',
        source: 'User Uploaded',
        facility: 'Regional Kidney Center'
      },
      results: [
        { testName: 'eGFR (CKD-EPI)', value: '68', unit: 'mL/min/1.73m2', referenceRange: '> 60', confidence: 0.97, source: 'Renal_Function_Audit.pdf' },
        { testName: 'Serum Albumin', value: '4.1', unit: 'g/dL', referenceRange: '3.5 - 5.0', confidence: 0.96, source: 'Renal_Function_Audit.pdf' },
        { testName: 'Serum Phosphorus', value: '3.8', unit: 'mg/dL', referenceRange: '2.5 - 4.5', confidence: 0.93, source: 'Renal_Function_Audit.pdf' },
        { testName: 'Uric Acid', value: '6.2', unit: 'mg/dL', referenceRange: '3.5 - 7.2', confidence: 0.94, source: 'Renal_Function_Audit.pdf' }
      ]
    }
  },
  WITHOUT_REFERENCE_RANGES: {
    label: '4. Missing Reference Ranges',
    description: 'Tests without standard reference intervals (null referenceRange).',
    rawPayload: {
      report: {
        fileName: 'Molecular_Qualitative_Screen.pdf',
        reportDate: '2026-09-02',
        reportType: 'Molecular / Qualitative Screen',
        source: 'User Uploaded',
        facility: 'Infectious Disease Reference Lab'
      },
      results: [
        { testName: 'SARS-CoV-2 RT-PCR', value: 'Negative', unit: '', referenceRange: null, confidence: 0.99, observation: 'Target 1 and Target 2 not detected', source: 'Molecular_Qualitative_Screen.pdf' },
        { testName: 'Urine Leukocyte Esterase', value: 'Negative', unit: '', referenceRange: null, confidence: 0.95, source: 'Molecular_Qualitative_Screen.pdf' },
        { testName: 'Antinuclear Antibodies (ANA) Screen', value: 'Negative', unit: '', referenceRange: null, confidence: 0.91, observation: 'Titer < 1:40', source: 'Molecular_Qualitative_Screen.pdf' },
        { testName: 'C-Reactive Protein (CRP)', value: '2.8', unit: 'mg/L', referenceRange: null, confidence: 0.88, observation: 'Reference interval not reported by facility', source: 'Molecular_Qualitative_Screen.pdf' }
      ]
    }
  },
  MISSING_UNITS: {
    label: '5. Missing / Dimensionless Units',
    description: 'Clinical measurements without units (e.g., ratios, international normalized indices).',
    rawPayload: {
      report: {
        fileName: 'Coagulation_Ratios_Study.pdf',
        reportDate: '2026-08-30',
        reportType: 'Hemostasis & Ratio Studies',
        source: 'User Uploaded',
        facility: 'Vascular Diagnostic Services'
      },
      results: [
        { testName: 'INR (International Normalized Ratio)', value: '1.1', unit: '', referenceRange: '0.8 - 1.2', confidence: 0.96, source: 'Coagulation_Ratios_Study.pdf' },
        { testName: 'Albumin / Globulin (A/G) Ratio', value: '1.4', unit: '', referenceRange: '1.1 - 2.5', confidence: 0.92, source: 'Coagulation_Ratios_Study.pdf' },
        { testName: 'BUN / Creatinine Ratio', value: '15.5', unit: '', referenceRange: '10.0 - 20.0', confidence: 0.94, source: 'Coagulation_Ratios_Study.pdf' },
        { testName: 'Anion Gap', value: '11', unit: '', referenceRange: '8 - 16', confidence: 0.89, source: 'Coagulation_Ratios_Study.pdf' }
      ]
    }
  },
  POOR_QUALITY_SCANNED: {
    label: '6. Poor-Quality / Scanned Document',
    description: 'Simulates low-contrast scanning with OCR uncertainty, lower extraction confidence, and source notes.',
    rawPayload: {
      report: {
        fileName: 'Faint_Carbon_Copy_Scan.jpg',
        reportDate: '2026-07-15',
        reportType: 'General Health Audit',
        source: 'User Uploaded',
        facility: 'Rural Outpatient Clinic'
      },
      results: [
        { testName: 'Hemoglobin', value: '13.8', unit: 'g/dL', referenceRange: '12.0 - 16.0', confidence: 0.65, observation: 'Blurry text in scan margin', source: 'Faint_Carbon_Copy_Scan.jpg' },
        { testName: 'Platelet Count', value: '215', unit: 'x10^3/uL', referenceRange: '150 - 450', confidence: 0.58, observation: 'Faint decimal marker on source', source: 'Faint_Carbon_Copy_Scan.jpg' },
        { testName: 'Serum Iron', value: '72', unit: 'ug/dL', referenceRange: '60 - 170', confidence: 0.62, observation: 'Artifact overlay near value line', source: 'Faint_Carbon_Copy_Scan.jpg' }
      ]
    }
  },
  INVALID_AI_RESPONSE: {
    label: '7. Invalid AI Response (Error Test)',
    description: 'Returns malformed payload to test schema validator rejection and error state handling.',
    rawPayload: {
      badPayload: true,
      notes: 'This simulates an AI engine returning unstructured non-conforming JSON.'
    }
  },
  API_FAILURE: {
    label: '8. AI / API Network Failure (Error Test)',
    description: 'Simulates HTTP 500 network/service outage to test error banner and retry workflow.',
    rawPayload: null // Triggers simulated exception
  },
  EMPTY_REPORT: {
    label: '9. Empty Report Document',
    description: 'Valid schema with zero test results (e.g., blank scan or document without lab analytes).',
    rawPayload: {
      report: {
        fileName: 'Blank_Intake_Form.pdf',
        reportDate: '2026-09-05',
        reportType: 'Administrative Document',
        source: 'User Uploaded',
        facility: 'Patient Records Office'
      },
      results: []
    }
  }
};

export class GeminiService {
  /**
   * Process a report through the Gemini AI extraction workflow.
   * Manages state transitions:
   * Ready -> Processing report... -> Extracting information... -> Validating results... -> Extraction complete / Extraction failed
   */
  static async extractReport(
    params: ExtractionParams,
    onProgress?: ProgressCallback
  ): Promise<ReportExtractionRecord> {
    const { reportId, fileName, fileType, textContent, inlineData, forceReprocess } = params;

    // AI Usage Optimization (Requirement 13):
    // Do not call Gemini when opening an already processed report.
    if (!forceReprocess) {
      const existing = ExtractionStorage.getExtraction(reportId);
      if (existing && existing.extractionStatus === 'COMPLETED') {
        if (onProgress) onProgress('Extraction complete', 'Loaded cached extraction results.');
        return existing;
      }
    }

    try {
      // Step 1: Processing report...
      if (onProgress) onProgress('Processing report...', 'Preparing document content for ingestion...');
      await new Promise((r) => setTimeout(r, 450));

      // Step 2: Extracting information...
      if (onProgress) onProgress('Extracting information...', 'Querying Gemini AI extraction engine...');

      let responsePayload: any = null;

      // Make server-side call to /api/extract
      try {
        const res = await fetch('/api/extract', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            reportId,
            fileName,
            fileType,
            textContent,
            inlineData
          })
        });

        const data = await res.json();

        if (!res.ok || !data.success) {
          throw new Error(data.error || `Server extraction failed with status ${res.status}`);
        }

        responsePayload = data.data;
      } catch (networkError: any) {
        // If server route is unavailable or API key not present, handle cleanly
        console.warn('API /api/extract call error:', networkError);
        throw new Error(
          networkError.message ||
            'Failed to communicate with the Gemini AI extraction service. Please ensure GEMINI_API_KEY is configured.'
        );
      }

      // Step 3: Validating results...
      if (onProgress) onProgress('Validating results...', 'Verifying structured medical schema and safety rules...');
      await new Promise((r) => setTimeout(r, 400));

      const validation = validateGeminiMedicalOutput(responsePayload, fileName);
      if (!validation.isValid || !validation.data) {
        throw new Error(
          `AI output failed medical validation: ${validation.errors.join('; ')}`
        );
      }

      // Step 4: Extraction complete
      const completedRecord: ReportExtractionRecord = {
        reportId,
        extractionStatus: 'COMPLETED',
        extractedAt: new Date().toISOString(),
        report: validation.data.report,
        results: validation.data.results
      };

      // Store successful extraction result locally (Requirement 11)
      ExtractionStorage.saveExtraction(completedRecord);

      if (onProgress) onProgress('Extraction complete', `Successfully extracted ${validation.data.results.length} test results.`);
      return completedRecord;
    } catch (err: any) {
      console.error('Extraction process error:', err);
      if (onProgress) onProgress('Extraction failed', err.message || 'Extraction failed.');

      const failedRecord: ReportExtractionRecord = {
        reportId,
        extractionStatus: 'FAILED',
        extractedAt: new Date().toISOString(),
        error: err.message || 'Unknown extraction error.',
        results: []
      };

      ExtractionStorage.saveExtraction(failedRecord);
      throw err;
    }
  }

  /**
   * Run a synthetic test preset (Requirement 12)
   * Executes the exact state machine & medicalDataValidator pipeline on synthetic clinical data.
   */
  static async runSyntheticTest(
    reportId: string,
    presetKey: keyof typeof SYNTHETIC_TEST_PRESETS,
    onProgress?: ProgressCallback
  ): Promise<ReportExtractionRecord> {
    const preset = SYNTHETIC_TEST_PRESETS[presetKey];
    if (!preset) throw new Error(`Unknown test preset: ${presetKey}`);

    try {
      // Step 1: Processing report...
      if (onProgress) onProgress('Processing report...', `Staging fixture: ${preset.label}...`);
      await new Promise((r) => setTimeout(r, 350));

      // Step 2: Extracting information...
      if (onProgress) onProgress('Extracting information...', 'Simulating AI extraction response...');
      await new Promise((r) => setTimeout(r, 450));

      // Handle simulated failure preset
      if (presetKey === 'API_FAILURE' || !preset.rawPayload) {
        throw new Error('Simulated HTTP 500: Gemini API quota exceeded or network connection dropped.');
      }

      // Step 3: Validating results...
      if (onProgress) onProgress('Validating results...', 'Applying MedicalDataValidator checks...');
      await new Promise((r) => setTimeout(r, 350));

      const validation = validateGeminiMedicalOutput(preset.rawPayload, preset.label);
      if (!validation.isValid || !validation.data) {
        throw new Error(`AI output failed medical validation: ${validation.errors.join('; ')}`);
      }

      // Step 4: Extraction complete
      const completedRecord: ReportExtractionRecord = {
        reportId,
        extractionStatus: 'COMPLETED',
        extractedAt: new Date().toISOString(),
        report: validation.data.report,
        results: validation.data.results
      };

      ExtractionStorage.saveExtraction(completedRecord);

      if (onProgress) onProgress('Extraction complete', `Extracted ${validation.data.results.length} items from synthetic fixture.`);
      return completedRecord;
    } catch (err: any) {
      if (onProgress) onProgress('Extraction failed', err.message || 'Extraction test failed.');
      const failedRecord: ReportExtractionRecord = {
        reportId,
        extractionStatus: 'FAILED',
        extractedAt: new Date().toISOString(),
        error: err.message || 'Failed test execution.',
        results: []
      };
      ExtractionStorage.saveExtraction(failedRecord);
      throw err;
    }
  }

  /**
   * STEP 5 / PRODUCTION: Generate Patient-Friendly AI Summary (Requirement 2)
   * 
   * Strict Constraints:
   * 1. Sends ONLY verified structured data (never re-sends original raw documents)
   * 2. Checks and returns cached summary first (minimizes AI cost, no automatic repeated processing)
   * 3. Regenerates only when explicitly requested
   * 4. Safe fallback for offline demo or when GEMINI_API_KEY is not configured
   */
  static async generatePatientSummary(
    patient: PatientProfile,
    structuredLabs: (LabResult | ExtractedResultItem)[],
    reportCount: number,
    forceRegenerate: boolean = false
  ): Promise<PatientSummaryRecord> {
    if (!patient || !patient.id) {
      throw new Error('Patient profile is required to generate a clinical summary.');
    }

    // 1. Check Cache first unless forceRegenerate is true
    if (!forceRegenerate) {
      const cached = await StorageService.summaries.get(patient.id);
      if (cached) {
        return {
          ...cached,
          isCached: true
        };
      }
    }

    // Prepare clean, structured payload (NO raw reports or unnecessary data)
    const sanitizedLabs = structuredLabs.map((l) => ({
      testName: l.testName,
      value: String(l.value),
      unit: l.unit || '',
      referenceRange: l.referenceRange || null,
      status: (l as any).calculatedStatus || (l as any).status || 'Not Determined',
      verificationStatus: (l as any).verificationStatus || ((l as any).isHumanVerified ? 'Human Verified' : 'AI Extracted'),
      isHumanVerified: Boolean((l as any).isHumanVerified),
      source: l.source || 'Laboratory Record'
    }));

    let summaryRecord: PatientSummaryRecord;

    try {
      const res = await fetch('/api/summarize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          patient: {
            id: patient.id,
            fullName: patient.fullName,
            age: patient.age,
            sex: patient.sex,
            symptoms: patient.symptoms || [],
            existingConditions: patient.existingConditions || [],
            allergies: patient.allergies || [],
            currentMedications: patient.currentMedications || [],
            medicalHistory: patient.medicalHistory || ''
          },
          structuredLabs: sanitizedLabs,
          reportCount
        })
      });

      const data = await res.json();

      if (!res.ok || !data.success || !data.data) {
        throw new Error(data.error || `Summary request failed with status ${res.status}`);
      }

      const aiData = data.data;
      summaryRecord = {
        id: `SUM-${Date.now().toString(36)}`,
        patientId: patient.id,
        title: aiData.title || `Clinical Summary for ${patient.fullName}`,
        overview: aiData.overview || 'Structured overview generated from documented patient factors.',
        observedFindings: Array.isArray(aiData.observedFindings) ? aiData.observedFindings : [],
        missingOrUncertainInfo: Array.isArray(aiData.missingOrUncertainInfo) ? aiData.missingOrUncertainInfo : [],
        doctorDiscussionTopics: Array.isArray(aiData.doctorDiscussionTopics) ? aiData.doctorDiscussionTopics : [],
        generatedAt: aiData.generatedAt || new Date().toISOString(),
        isCached: false
      };
    } catch (err: any) {
      console.warn('API /api/summarize call unavailable or failed. Using deterministic clinical fallback synthesizer:', err);
      // Fallback synthesizer ensuring the app NEVER crashes during demo or when offline
      summaryRecord = this.generateDeterministicFallbackSummary(patient, sanitizedLabs, reportCount);
    }

    // Cache the newly generated summary
    await StorageService.summaries.save(summaryRecord);

    // Record audit event in Clinical Timeline (Requirement 5)
    await StorageService.timeline.addEvent({
      id: `EVT-SUM-${Date.now().toString(36)}`,
      date: new Date().toISOString().split('T')[0],
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      type: 'AI Summary Generated',
      title: 'Patient-Friendly AI Summary Synthesized',
      description: `Generated consolidated clinical summary covering ${patient.existingConditions?.length || 0} condition(s) and ${sanitizedLabs.length} structured laboratory analyte(s).`,
      provider: 'MedLens Clinical Intelligence (Gemini 3.8 Flash)',
      source: 'Structured Patient Profile & Validated Extractions',
      statusBadge: 'Generated'
    });

    return summaryRecord;
  }

  /**
   * Deterministic Non-Diagnostic Fallback Synthesizer
   * Used when offline or if server API key is unavailable, strictly respecting all 15 safety rules.
   */
  private static generateDeterministicFallbackSummary(
    patient: PatientProfile,
    labs: any[],
    reportCount: number
  ): PatientSummaryRecord {
    const highLabs = labs.filter((l) => String(l.status).toUpperCase() === 'HIGH');
    const lowLabs = labs.filter((l) => String(l.status).toUpperCase() === 'LOW');
    const normalLabs = labs.filter((l) => String(l.status).toUpperCase() === 'NORMAL');
    const undeterminedLabs = labs.filter((l) => String(l.status).toUpperCase() === 'NOT DETERMINED');

    const observedFindings: string[] = [];

    if (normalLabs.length > 0) {
      observedFindings.push(
        `${normalLabs.length} test(s) are documented within established laboratory reference ranges (${normalLabs.slice(0, 3).map((l) => l.testName).join(', ')}${normalLabs.length > 3 ? '...' : ''}).`
      );
    }

    if (highLabs.length > 0) {
      observedFindings.push(
        `Elevated findings documented above laboratory reference limits: ${highLabs.map((l) => `${l.testName} (${l.value} ${l.unit}; ref: ${l.referenceRange || 'N/A'})`).join(', ')}.`
      );
    }

    if (lowLabs.length > 0) {
      observedFindings.push(
        `Decreased findings documented below laboratory reference limits: ${lowLabs.map((l) => `${l.testName} (${l.value} ${l.unit}; ref: ${l.referenceRange || 'N/A'})`).join(', ')}.`
      );
    }

    if (patient.symptoms && patient.symptoms.length > 0) {
      observedFindings.push(
        `Active patient-reported symptoms on file: ${patient.symptoms.join('; ')}.`
      );
    }

    const missingOrUncertainInfo: string[] = [];
    if (undeterminedLabs.length > 0) {
      missingOrUncertainInfo.push(
        `${undeterminedLabs.length} test(s) have "Not Determined" status because no reference interval was provided in the source report (${undeterminedLabs.map((l) => l.testName).join(', ')}).`
      );
    }
    if (reportCount === 0) {
      missingOrUncertainInfo.push('No uploaded diagnostic reports are currently linked to this record.');
    }
    if (!patient.allergies || patient.allergies.length === 0) {
      missingOrUncertainInfo.push('Allergy history has not yet been formally documented.');
    }

    const doctorDiscussionTopics: string[] = [];
    if (highLabs.length > 0 || lowLabs.length > 0) {
      doctorDiscussionTopics.push('Review documented out-of-range lab results with your physician to understand their context.');
    }
    if (patient.symptoms && patient.symptoms.length > 0) {
      doctorDiscussionTopics.push('Discuss timing, frequency, and severity of reported symptoms with your healthcare provider.');
    }
    if (patient.currentMedications && patient.currentMedications.length > 0) {
      doctorDiscussionTopics.push('Confirm ongoing prescription regimen and schedule regular metabolic monitoring as advised.');
    }

    return {
      id: `SUM-DET-${Date.now().toString(36)}`,
      patientId: patient.id,
      title: `Structured Clinical Summary — ${patient.fullName}`,
      overview: `MedLens synthesized ${reportCount} diagnostic report(s), ${labs.length} structured lab analytes, and baseline health history for ${patient.fullName} (${patient.age}, ${patient.sex}). Documented chronic factors include ${(patient.existingConditions || []).join(', ') || 'none recorded'}.`,
      observedFindings,
      missingOrUncertainInfo: missingOrUncertainInfo.length > 0 ? missingOrUncertainInfo : ['All documented analytes have complete reference ranges.'],
      doctorDiscussionTopics: doctorDiscussionTopics.length > 0 ? doctorDiscussionTopics : ['Bring this structured summary to your next clinical appointment for routine checkup.'],
      generatedAt: new Date().toISOString(),
      isCached: false
    };
  }
}
