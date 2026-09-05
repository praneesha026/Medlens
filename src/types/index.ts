export interface Allergy {
  allergen: string;
  reaction: string;
  severity: 'Mild' | 'Moderate' | 'Severe';
}

export interface Medication {
  name: string;
  dosage: string;
  frequency: string;
  indication: string;
  startDate?: string;
  status: 'Active' | 'Discontinued' | 'As Needed';
}

export interface PatientProfile {
  id: string;
  fullName: string;
  age: number;
  sex: 'Female' | 'Male' | 'Other' | 'Prefer not to say';
  dob: string;
  mrn: string;
  bloodType: string;
  symptoms: string[];
  existingConditions: string[];
  allergies: Allergy[];
  currentMedications: Medication[];
  medicalHistory: string;
  lastUpdated: string;
  emergencyContact: {
    name: string;
    relation: string;
    phone: string;
  };
}

export type LabStatus = 'Normal' | 'High' | 'Low' | 'Abnormal' | 'Critical';
export type CalculatedLabStatus = 'LOW' | 'NORMAL' | 'HIGH' | 'Not Determined';
export type VerificationState = 'AI Extracted' | 'Human Verified' | 'Edited by User';

export interface LabResult {
  id: string;
  testName: string;
  category: 'Metabolic' | 'Hematology' | 'Lipids' | 'Endocrine' | 'Renal' | 'Vitamins';
  value: string | number;
  unit: string;
  referenceRange: string | null;
  status: LabStatus | CalculatedLabStatus;
  date: string;
  source: string;
  notes?: string;
  confidence?: number;
  confidenceLevel?: 'High confidence' | 'Medium confidence' | 'Low confidence';
  isHumanVerified?: boolean;
  isEdited?: boolean;
  verificationStatus?: VerificationState;
  originalExtractedValue?: string;
}

export interface MedicalReport {
  id: string;
  title: string;
  type: 'Lab Panel' | 'Radiology' | 'Cardiology' | 'Clinical Encounter' | 'Pathology' | string;
  date: string;
  provider: string;
  facility: string;
  fileName?: string;
  fileSize?: string;
  fileType?: string;
  uploadDate?: string;
  source?: string;
  status: 'READY_FOR_REVIEW' | 'Processed' | 'Pending Review' | 'Processing' | 'UPLOADING' | 'ERROR' | string;
  summaryPlaceholder?: string;
  keyFindings?: string[];
  labResults?: LabResult[];
  rawContent?: string;
  mimeType?: string;
}

export type ExtractionProcessingState =
  | 'Ready'
  | 'Processing report...'
  | 'Extracting information...'
  | 'Validating results...'
  | 'Extraction complete'
  | 'Extraction failed';

export interface ExtractedResultItem {
  id: string;
  testName: string;
  value: string;
  unit: string;
  referenceRange: string | null;
  date: string;
  category?: string;
  observation?: string;
  source: string;
  confidence: number;
  confidenceLevel: 'High confidence' | 'Medium confidence' | 'Low confidence';
  isHumanVerified: boolean;
  isEdited?: boolean;
  verificationStatus?: VerificationState;
  verifiedAt?: string;
  verifiedBy?: string;
  originalExtractedValue?: string;
  calculatedStatus?: CalculatedLabStatus;
}

export interface ExtractedReportMetadata {
  fileName: string;
  reportDate: string;
  reportType: string;
  source: string;
  facility?: string;
}

export interface ExtractedReportData {
  report: ExtractedReportMetadata;
  results: ExtractedResultItem[];
}

export interface ReportExtractionRecord {
  reportId: string;
  extractionStatus: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
  extractedAt?: string;
  error?: string;
  report?: ExtractedReportMetadata;
  results: ExtractedResultItem[];
}

export interface PatientSummaryRecord {
  id: string;
  patientId: string;
  title?: string;
  overview: string;
  observedFindings: string[];
  missingOrUncertainInfo: string[];
  doctorDiscussionTopics: string[];
  generatedAt: string;
  isCached?: boolean;
}

export type TimelineEventType =
  | 'Patient Profile Update'
  | 'Report Upload'
  | 'AI Extraction & Processing'
  | 'Human Verification'
  | 'AI Summary Generated'
  | 'Encounter'
  | 'Lab'
  | 'Medication'
  | 'Diagnosis'
  | 'Imaging';

export interface TimelineEvent {
  id: string;
  date: string;
  time?: string;
  type: TimelineEventType | string;
  title: string;
  description: string;
  provider: string;
  facility?: string;
  statusBadge?: string;
  source?: string;
}
