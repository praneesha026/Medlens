/**
 * Patient Data Service
 * 
 * Provides an abstraction layer separating UI components from the underlying storage mechanism.
 * Currently uses browser localStorage. In future milestones, this can be seamlessly swapped
 * for REST calls to FastAPI / PostgreSQL without modifying the UI layer.
 */

import { PatientProfile, Allergy, Medication } from '../types';
import { initialPatientProfile } from '../data/mockPatientData';

const STORAGE_KEY = 'medlens_patient_data';

export interface StructuredPatient {
  name: string;
  age: number | string;
  sex: string;
  symptoms: string[];
  conditions: string[];
  allergies: Array<string | Allergy>;
  medications: Array<string | Medication>;
  medicalHistory: string;
  // Metadata fields
  id?: string;
  mrn?: string;
  dob?: string;
  bloodType?: string;
  lastUpdated?: string;
  isCustom?: boolean;
}

export interface PatientStorageContainer {
  patient: StructuredPatient | null;
}

/**
 * Format raw allergies into standardized display objects
 */
export function normalizeAllergies(allergies: Array<string | Allergy>): Allergy[] {
  if (!allergies || !Array.isArray(allergies)) return [];
  return allergies.map((item) => {
    if (typeof item === 'string') {
      return {
        allergen: item,
        reaction: 'Documented sensitivity',
        severity: 'Moderate'
      };
    }
    return item;
  });
}

/**
 * Format raw medications into standardized display objects
 */
export function normalizeMedications(medications: Array<string | Medication>): Medication[] {
  if (!medications || !Array.isArray(medications)) return [];
  return medications.map((item) => {
    if (typeof item === 'string') {
      return {
        name: item,
        dosage: 'As prescribed',
        frequency: 'Daily',
        indication: 'Documented therapy',
        status: 'Active'
      };
    }
    return item;
  });
}

/**
 * Convert internal PatientProfile to the required structured format
 */
export function toStructuredFormat(profile: PatientProfile | null, isCustom = true): StructuredPatient | null {
  if (!profile) return null;
  return {
    name: profile.fullName || '',
    age: profile.age ?? '',
    sex: profile.sex || 'Prefer not to say',
    symptoms: profile.symptoms || [],
    conditions: profile.existingConditions || [],
    allergies: profile.allergies || [],
    medications: profile.currentMedications || [],
    medicalHistory: profile.medicalHistory || '',
    id: profile.id,
    mrn: profile.mrn,
    dob: profile.dob,
    bloodType: profile.bloodType,
    lastUpdated: profile.lastUpdated || new Date().toISOString().split('T')[0],
    isCustom
  };
}

/**
 * Convert structured format to PatientProfile for component usage
 */
export function fromStructuredFormat(structured: StructuredPatient): PatientProfile {
  return {
    id: structured.id || `PT-${Date.now().toString().slice(-5)}`,
    fullName: structured.name,
    age: typeof structured.age === 'number' ? structured.age : parseInt(String(structured.age), 10) || 0,
    sex: (structured.sex as any) || 'Prefer not to say',
    dob: structured.dob || '',
    mrn: structured.mrn || `MRN-${Math.floor(100000 + Math.random() * 900000)}`,
    bloodType: structured.bloodType || 'Unspecified',
    symptoms: structured.symptoms || [],
    existingConditions: structured.conditions || [],
    allergies: normalizeAllergies(structured.allergies),
    currentMedications: normalizeMedications(structured.medications),
    medicalHistory: structured.medicalHistory || '',
    lastUpdated: structured.lastUpdated || new Date().toISOString().split('T')[0],
    emergencyContact: {
      name: 'Primary Contact',
      relation: 'Designated Contact',
      phone: 'Not provided'
    }
  };
}

export const PatientService = {
  /**
   * Retrieve stored patient record from localStorage
   */
  getPatient(): StructuredPatient | null {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return null;
      const container: PatientStorageContainer = JSON.parse(raw);
      return container?.patient || null;
    } catch (error) {
      console.error('Error reading patient data from storage:', error);
      return null;
    }
  },

  /**
   * Save patient record to localStorage in the required structured object format:
   * { "patient": { "name": "...", "age": "...", ... } }
   */
  savePatient(data: StructuredPatient): StructuredPatient {
    const enrichedData: StructuredPatient = {
      ...data,
      lastUpdated: new Date().toISOString().split('T')[0],
      isCustom: true
    };

    const container: PatientStorageContainer = {
      patient: enrichedData
    };

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(container));
    } catch (error) {
      console.error('Error saving patient data to storage:', error);
    }

    return enrichedData;
  },

  /**
   * Clear the patient record from storage
   */
  clearPatient(): void {
    try {
      localStorage.removeItem(STORAGE_KEY);
      // Also clear any legacy keys
      localStorage.removeItem('medlens_patient');
    } catch (error) {
      console.error('Error clearing patient data:', error);
    }
  },

  /**
   * Load the synthetic demo patient (Eleanor Vance)
   */
  loadSamplePatient(): StructuredPatient {
    const sample = toStructuredFormat(initialPatientProfile, false)!;
    const container: PatientStorageContainer = { patient: sample };
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(container));
    } catch (e) {
      console.warn(e);
    }
    return sample;
  },

  /**
   * Check if any patient data currently exists
   */
  hasPatient(): boolean {
    const current = this.getPatient();
    return current !== null && Boolean(current.name && current.name.trim().length > 0);
  }
};
