import { PatientProfile, MedicalReport, TimelineEvent, LabResult } from '../types';

export const SYNTHETIC_DATA_NOTICE = "Demonstration dataset: All patient information and clinical metrics are synthetic and intended solely for UI workflow evaluation.";

export const initialPatientProfile: PatientProfile = {
  id: 'PT-88291',
  fullName: 'Eleanor Vance',
  age: 58,
  sex: 'Female',
  dob: '1968-04-12',
  mrn: 'MRN-449102-B',
  bloodType: 'A+',
  symptoms: [
    'Mild bilateral ankle swelling (evening onset)',
    'Intermittent fatigue during moderate exertion',
    'Post-prandial fullness and mild dyspepsia'
  ],
  existingConditions: [
    'Type 2 Diabetes Mellitus (Managed)',
    'Essential Hypertension (Stage 1)',
    'Hyperlipidemia (Mixed Dyslipidemia)',
    'Mild Osteoarthritis (Bilateral Knees)'
  ],
  allergies: [
    { allergen: 'Penicillin', reaction: 'Urticaria & facial angioedema', severity: 'Severe' },
    { allergen: 'Sulfa Drugs', reaction: 'Maculopapular rash', severity: 'Moderate' },
    { allergen: 'Contrast Dye (Iodine-based)', reaction: 'Mild pruritus & nausea', severity: 'Mild' }
  ],
  currentMedications: [
    {
      name: 'Metformin Hydrochloride',
      dosage: '500 mg',
      frequency: 'Twice daily with meals',
      indication: 'Glycemic regulation for Type 2 Diabetes',
      startDate: '2021-08-15',
      status: 'Active'
    },
    {
      name: 'Lisinopril',
      dosage: '10 mg',
      frequency: 'Once daily in morning',
      indication: 'Blood pressure control & renal protection',
      startDate: '2022-03-10',
      status: 'Active'
    },
    {
      name: 'Atorvastatin Calcium',
      dosage: '20 mg',
      frequency: 'Once daily at bedtime',
      indication: 'Lipid optimization & cardiovascular risk reduction',
      startDate: '2022-11-04',
      status: 'Active'
    },
    {
      name: 'Acetaminophen',
      dosage: '500 mg',
      frequency: 'As needed for joint discomfort (Max 2g/day)',
      indication: 'Knee osteoarthritis symptomatic relief',
      startDate: '2023-01-20',
      status: 'As Needed'
    }
  ],
  medicalHistory:
    'Patient has a 7-year history of Type 2 Diabetes under routine endocrine follow-up. Diagnosed with mild essential hypertension 4 years ago, well-managed on ACE inhibitor. No prior myocardial infarction, stroke, or peripheral artery disease. Surgical history includes laparoscopic cholecystectomy in 2014 without complications. Nonsmoker, reports moderate dietary sodium awareness, and walks 20-30 minutes 4 times per week.',
  lastUpdated: '2026-08-28',
  emergencyContact: {
    name: 'Robert Vance',
    relation: 'Spouse',
    phone: '(555) 382-9912'
  }
};

export const sampleLabResults: LabResult[] = [
  {
    id: 'LAB-01',
    testName: 'Hemoglobin A1c',
    category: 'Endocrine',
    value: '6.8',
    unit: '%',
    referenceRange: '< 5.7 (Normal), 5.7–6.4 (Prediabetes), ≥ 6.5 (Diabetes)',
    status: 'High',
    date: '2026-08-22',
    source: 'Quest Diagnostics Regional Hub',
    notes: 'Mild elevation consistent with ongoing type 2 diabetes management plan.'
  },
  {
    id: 'LAB-02',
    testName: 'Fasting Plasma Glucose',
    category: 'Metabolic',
    value: '128',
    unit: 'mg/dL',
    referenceRange: '70 – 99 mg/dL',
    status: 'High',
    date: '2026-08-22',
    source: 'Quest Diagnostics Regional Hub',
    notes: 'Fasting duration confirmed at 10 hours prior to venipuncture.'
  },
  {
    id: 'LAB-03',
    testName: 'Estimated GFR (eGFR)',
    category: 'Renal',
    value: '84',
    unit: 'mL/min/1.73m²',
    referenceRange: '≥ 60 mL/min/1.73m²',
    status: 'Normal',
    date: '2026-08-22',
    source: 'Quest Diagnostics Regional Hub',
    notes: 'Stable renal filtration function compared with previous assessment.'
  },
  {
    id: 'LAB-04',
    testName: 'Serum Creatinine',
    category: 'Renal',
    value: '0.88',
    unit: 'mg/dL',
    referenceRange: '0.50 – 1.10 mg/dL',
    status: 'Normal',
    date: '2026-08-22',
    source: 'Quest Diagnostics Regional Hub',
    notes: 'Well within expected reference parameters.'
  },
  {
    id: 'LAB-05',
    testName: 'Blood Urea Nitrogen (BUN)',
    category: 'Renal',
    value: '16',
    unit: 'mg/dL',
    referenceRange: '7 – 20 mg/dL',
    status: 'Normal',
    date: '2026-08-22',
    source: 'Quest Diagnostics Regional Hub'
  },
  {
    id: 'LAB-06',
    testName: 'Total Cholesterol',
    category: 'Lipids',
    value: '184',
    unit: 'mg/dL',
    referenceRange: '< 200 mg/dL',
    status: 'Normal',
    date: '2026-08-22',
    source: 'Quest Diagnostics Regional Hub',
    notes: 'Favorable response under current Atorvastatin 20mg regimen.'
  },
  {
    id: 'LAB-07',
    testName: 'LDL Cholesterol (Calculated)',
    category: 'Lipids',
    value: '104',
    unit: 'mg/dL',
    referenceRange: '< 100 mg/dL (Target for diabetic profile)',
    status: 'High',
    date: '2026-08-22',
    source: 'Quest Diagnostics Regional Hub',
    notes: 'Borderline elevated relative to stringent atherosclerotic risk goals.'
  },
  {
    id: 'LAB-08',
    testName: 'HDL Cholesterol',
    category: 'Lipids',
    value: '52',
    unit: 'mg/dL',
    referenceRange: '≥ 50 mg/dL (Females)',
    status: 'Normal',
    date: '2026-08-22',
    source: 'Quest Diagnostics Regional Hub'
  },
  {
    id: 'LAB-09',
    testName: 'Triglycerides',
    category: 'Lipids',
    value: '140',
    unit: 'mg/dL',
    referenceRange: '< 150 mg/dL',
    status: 'Normal',
    date: '2026-08-22',
    source: 'Quest Diagnostics Regional Hub'
  },
  {
    id: 'LAB-10',
    testName: 'Serum Potassium',
    category: 'Metabolic',
    value: '4.4',
    unit: 'mmol/L',
    referenceRange: '3.5 – 5.1 mmol/L',
    status: 'Normal',
    date: '2026-08-22',
    source: 'Quest Diagnostics Regional Hub',
    notes: 'Monitored due to concurrent Lisinopril administration.'
  },
  {
    id: 'LAB-11',
    testName: 'Serum Sodium',
    category: 'Metabolic',
    value: '139',
    unit: 'mmol/L',
    referenceRange: '135 – 145 mmol/L',
    status: 'Normal',
    date: '2026-08-22',
    source: 'Quest Diagnostics Regional Hub'
  },
  {
    id: 'LAB-12',
    testName: 'ALT (Alanine Aminotransferase)',
    category: 'Metabolic',
    value: '22',
    unit: 'U/L',
    referenceRange: '7 – 35 U/L',
    status: 'Normal',
    date: '2026-08-22',
    source: 'Quest Diagnostics Regional Hub'
  },
  {
    id: 'LAB-13',
    testName: 'White Blood Cell Count (WBC)',
    category: 'Hematology',
    value: '6.4',
    unit: 'x10³/µL',
    referenceRange: '4.0 – 11.0 x10³/µL',
    status: 'Normal',
    date: '2026-08-22',
    source: 'St. Jude Clinical Laboratories'
  },
  {
    id: 'LAB-14',
    testName: 'Hemoglobin',
    category: 'Hematology',
    value: '13.1',
    unit: 'g/dL',
    referenceRange: '12.0 – 15.5 g/dL',
    status: 'Normal',
    date: '2026-08-22',
    source: 'St. Jude Clinical Laboratories'
  },
  {
    id: 'LAB-15',
    testName: 'Platelet Count',
    category: 'Hematology',
    value: '245',
    unit: 'x10³/µL',
    referenceRange: '150 – 450 x10³/µL',
    status: 'Normal',
    date: '2026-08-22',
    source: 'St. Jude Clinical Laboratories'
  },
  {
    id: 'LAB-16',
    testName: '25-Hydroxy Vitamin D',
    category: 'Vitamins',
    value: '22',
    unit: 'ng/mL',
    referenceRange: '30 – 100 ng/mL',
    status: 'Low',
    date: '2026-08-22',
    source: 'Quest Diagnostics Regional Hub',
    notes: 'Mild insufficiency noted; potential dietary supplementation review indicated.'
  }
];

export const mockMedicalReports: MedicalReport[] = [
  {
    id: 'REP-2026-001',
    title: 'Comprehensive Metabolic Panel & Lipid Profile',
    type: 'Lab Panel',
    date: '2026-08-22',
    provider: 'Dr. Sarah Chen, MD (Internal Medicine)',
    facility: 'Metropolitan Ambulatory Health Pavilion',
    fileName: 'CMP_Lipid_Panel_EleanorVance_2026.pdf',
    fileSize: '1.4 MB',
    status: 'Processed',
    summaryPlaceholder:
      'Structured extraction complete: 12 analytes parsed. Key observations include mild HbA1c elevation (6.8%) and borderline LDL (104 mg/dL), with stable renal markers (eGFR 84) and normal liver transaminases.',
    keyFindings: [
      'Fasting glucose (128 mg/dL) and HbA1c (6.8%) reflect mild glycemic variance.',
      'Renal functional panel remains stable with eGFR of 84 mL/min and creatinine 0.88 mg/dL.',
      'Lipid values show improved baseline control; LDL borderline at 104 mg/dL.',
      '25-OH Vitamin D indicates mild insufficiency at 22 ng/mL.'
    ],
    labResults: sampleLabResults.slice(0, 12)
  },
  {
    id: 'REP-2026-002',
    title: 'Complete Blood Count (CBC) with Differential',
    type: 'Lab Panel',
    date: '2026-08-22',
    provider: 'Dr. Sarah Chen, MD (Internal Medicine)',
    facility: 'St. Jude Clinical Laboratories',
    fileName: 'CBC_Diff_EleanorVance_2026.pdf',
    fileSize: '840 KB',
    status: 'Processed',
    summaryPlaceholder:
      'Hematologic indices all fall within standard physiological reference boundaries. No sign of acute leukocytosis, anemia, or thrombocytopenia.',
    keyFindings: [
      'Total leukocyte count normal at 6.4 x10³/µL without left shift.',
      'Hemoglobin 13.1 g/dL and hematocrit 39.2% show robust normocytic indices.',
      'Platelet count preserved at 245 x10³/µL.'
    ],
    labResults: sampleLabResults.slice(12, 16)
  },
  {
    id: 'REP-2026-003',
    title: 'Posteroanterior & Lateral Chest Radiograph',
    type: 'Radiology',
    date: '2026-07-15',
    provider: 'Dr. Marcus Holloway, MD (Radiology)',
    facility: 'Advanced Imaging & Diagnostic Center',
    fileName: 'Chest_XRay_PA_LAT_VanceE.pdf',
    fileSize: '3.8 MB',
    status: 'Processed',
    summaryPlaceholder:
      'Diagnostic imaging assessment demonstrates clear lung fields bilaterally without focal consolidation, pleural effusion, or pneumothorax. Cardiothoracic ratio is normal (0.46).',
    keyFindings: [
      'No acute cardiopulmonary process identified.',
      'Cardiomediastinal silhouette and pulmonary vascular distribution within normal limits.',
      'Bony thorax demonstrates mild age-related thoracic spondylosis without fracture.'
    ],
    labResults: []
  }
];

export const sampleTimelineEvents: TimelineEvent[] = [
  {
    id: 'EVT-01',
    date: '2026-08-28',
    type: 'Encounter',
    title: 'Quarterly Chronic Disease Management Visit',
    description: 'Routine follow-up for Type 2 Diabetes and Hypertension with Dr. Sarah Chen. Blood pressure in clinic: 126/78 mmHg. BMI: 27.2.',
    provider: 'Dr. Sarah Chen, MD',
    facility: 'Metropolitan Ambulatory Health Pavilion',
    statusBadge: 'Routine Follow-up'
  },
  {
    id: 'EVT-02',
    date: '2026-08-22',
    type: 'Lab',
    title: 'Routine Bloodwork (CMP, CBC, Lipid Panel)',
    description: 'Annual panel collection completed. 16 laboratory tests analyzed across Quest Diagnostics & St. Jude Labs.',
    provider: 'Quest Diagnostics Phlebotomy Service',
    facility: 'Quest Regional Hub',
    statusBadge: '16 Tests Extracted'
  },
  {
    id: 'EVT-03',
    date: '2026-07-15',
    type: 'Imaging',
    title: 'Diagnostic Chest Radiograph (2 Views)',
    description: 'Ordered following brief viral bronchitis episode. Findings negative for infiltrate or cardiomegaly.',
    provider: 'Dr. Marcus Holloway, MD',
    facility: 'Advanced Imaging Center',
    statusBadge: 'Clear Study'
  },
  {
    id: 'EVT-04',
    date: '2026-03-12',
    type: 'Medication',
    title: 'Medication Review & Refill Authorization',
    description: 'Refills confirmed for Metformin 500mg BID and Lisinopril 10mg QD. Tolerating statin therapy well without myalgia.',
    provider: 'Dr. Sarah Chen, MD',
    facility: 'Metropolitan Ambulatory',
    statusBadge: 'Medication Maintained'
  },
  {
    id: 'EVT-05',
    date: '2025-11-18',
    type: 'Encounter',
    title: 'Annual Comprehensive Preventive Exam',
    description: 'Preventive screening completed: bilateral mammogram negative, colonoscopy surveillance updated, influenza vaccine administered.',
    provider: 'Dr. Sarah Chen, MD',
    facility: 'Metropolitan Ambulatory',
    statusBadge: 'Preventive'
  },
  {
    id: 'EVT-06',
    date: '2022-11-04',
    type: 'Diagnosis',
    title: 'Diagnosis & Initiation of Statin Therapy',
    description: 'Diagnosed with mixed hyperlipidemia; initiated on Atorvastatin 20mg daily for ASCVD risk reduction.',
    provider: 'Dr. Sarah Chen, MD',
    facility: 'Metropolitan Ambulatory',
    statusBadge: 'Clinical Milestone'
  }
];
