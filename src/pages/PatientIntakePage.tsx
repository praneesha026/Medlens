import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  User,
  Plus,
  Trash2,
  Save,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  AlertTriangle,
  Pill,
  Heart,
  FileText,
  RotateCcw,
  X,
  ChevronRight,
  LayoutDashboard
} from 'lucide-react';
import { usePatient } from '../context/PatientContext';
import { initialPatientProfile } from '../data/mockPatientData';
import { Allergy, Medication } from '../types';
import { SafetyNotice } from '../components/SafetyNotice';
import { StructuredPatient } from '../services/patientService';

interface ValidationErrors {
  fullName?: string;
  age?: string;
  sex?: string;
  symptoms?: string;
}

export const PatientIntakePage: React.FC = () => {
  const navigate = useNavigate();
  const { patient, saveStructuredPatient, clearPatientData } = usePatient();

  // Form State initialized from current patient if available
  const [fullName, setFullName] = useState(patient?.fullName || '');
  const [age, setAge] = useState<string>(patient?.age !== undefined ? String(patient.age) : '');
  const [sex, setSex] = useState<string>(patient?.sex || 'Prefer not to say');
  const [bloodType, setBloodType] = useState(patient?.bloodType || 'Unspecified');

  // Symptoms
  const [symptoms, setSymptoms] = useState<string[]>(patient?.symptoms || []);
  const [newSymptomInput, setNewSymptomInput] = useState('');

  // Conditions
  const [conditions, setConditions] = useState<string[]>(patient?.existingConditions || []);
  const [newConditionInput, setNewConditionInput] = useState('');

  // Allergies
  const [allergies, setAllergies] = useState<Allergy[]>(patient?.allergies || []);
  const [newAllergen, setNewAllergen] = useState('');
  const [newReaction, setNewReaction] = useState('');
  const [newSeverity, setNewSeverity] = useState<'Mild' | 'Moderate' | 'Severe'>('Mild');

  // Current Medications
  const [medications, setMedications] = useState<Medication[]>(patient?.currentMedications || []);
  const [newMedName, setNewMedName] = useState('');
  const [newMedDosage, setNewMedDosage] = useState('');
  const [newMedFreq, setNewMedFreq] = useState('');
  const [newMedIndication, setNewMedIndication] = useState('');

  // Medical History
  const [medicalHistory, setMedicalHistory] = useState(patient?.medicalHistory || '');

  // Validation and Status
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  // If patient in context updates externally, keep form synced if not dirty
  useEffect(() => {
    if (patient) {
      setFullName(patient.fullName || '');
      setAge(patient.age !== undefined ? String(patient.age) : '');
      setSex(patient.sex || 'Prefer not to say');
      setBloodType(patient.bloodType || 'Unspecified');
      setSymptoms(patient.symptoms || []);
      setConditions(patient.existingConditions || []);
      setAllergies(patient.allergies || []);
      setMedications(patient.currentMedications || []);
      setMedicalHistory(patient.medicalHistory || '');
    }
  }, [patient]);

  // Validation function
  const validateForm = (): boolean => {
    const newErrors: ValidationErrors = {};

    // Name validation
    if (!fullName.trim()) {
      newErrors.fullName = 'Patient Name is required.';
    } else if (fullName.trim().length < 2) {
      newErrors.fullName = 'Patient Name must be at least 2 characters.';
    }

    // Age validation
    if (!age.trim()) {
      newErrors.age = 'Age is required.';
    } else {
      const parsedAge = Number(age);
      if (isNaN(parsedAge) || !Number.isInteger(parsedAge) || parsedAge < 0 || parsedAge > 130) {
        newErrors.age = 'Please enter a valid age between 0 and 130.';
      }
    }

    // Sex validation
    if (!sex) {
      newErrors.sex = 'Please select a sex.';
    }

    // Symptoms validation (at least one symptom or explicit asymptomatic statement)
    if (symptoms.length === 0) {
      newErrors.symptoms = 'Please enter at least one symptom (or add "Asymptomatic / Routine").';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Load sample demo patient
  const handleLoadSample = () => {
    setFullName(initialPatientProfile.fullName);
    setAge(String(initialPatientProfile.age));
    setSex(initialPatientProfile.sex);
    setBloodType(initialPatientProfile.bloodType);
    setSymptoms([...initialPatientProfile.symptoms]);
    setConditions([...initialPatientProfile.existingConditions]);
    setAllergies([...initialPatientProfile.allergies]);
    setMedications([...initialPatientProfile.currentMedications]);
    setMedicalHistory(initialPatientProfile.medicalHistory);
    setErrors({});
  };

  // Clear all form inputs
  const handleClearForm = () => {
    setFullName('');
    setAge('');
    setSex('Prefer not to say');
    setBloodType('Unspecified');
    setSymptoms([]);
    setConditions([]);
    setAllergies([]);
    setMedications([]);
    setMedicalHistory('');
    setNewSymptomInput('');
    setNewConditionInput('');
    setNewAllergen('');
    setNewReaction('');
    setNewMedName('');
    setNewMedDosage('');
    setNewMedFreq('');
    setNewMedIndication('');
    setErrors({});
    setTouched({});
    setShowClearConfirm(false);
  };

  // Clear form and delete stored patient data
  const handleClearAndResetStorage = () => {
    handleClearForm();
    clearPatientData();
    setShowClearConfirm(false);
  };

  // Add / remove symptom
  const handleAddSymptom = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (newSymptomInput.trim()) {
      setSymptoms([...symptoms, newSymptomInput.trim()]);
      setNewSymptomInput('');
      if (errors.symptoms) {
        setErrors((prev) => ({ ...prev, symptoms: undefined }));
      }
    }
  };

  const handleQuickAddSymptom = (symptomText: string) => {
    if (!symptoms.includes(symptomText)) {
      setSymptoms([...symptoms, symptomText]);
      if (errors.symptoms) {
        setErrors((prev) => ({ ...prev, symptoms: undefined }));
      }
    }
  };

  const handleRemoveSymptom = (index: number) => {
    setSymptoms(symptoms.filter((_, i) => i !== index));
  };

  // Add / remove condition
  const handleAddCondition = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (newConditionInput.trim()) {
      setConditions([...conditions, newConditionInput.trim()]);
      setNewConditionInput('');
    }
  };

  const handleQuickAddCondition = (conditionText: string) => {
    if (!conditions.includes(conditionText)) {
      setConditions([...conditions, conditionText]);
    }
  };

  const handleRemoveCondition = (index: number) => {
    setConditions(conditions.filter((_, i) => i !== index));
  };

  // Add / remove allergy
  const handleAddAllergy = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (newAllergen.trim()) {
      setAllergies([
        ...allergies,
        {
          allergen: newAllergen.trim(),
          reaction: newReaction.trim() || 'Documented reaction',
          severity: newSeverity
        }
      ]);
      setNewAllergen('');
      setNewReaction('');
      setNewSeverity('Mild');
    }
  };

  const handleAddNKDA = () => {
    if (!allergies.some((a) => a.allergen.toLowerCase().includes('no known'))) {
      setAllergies([
        ...allergies,
        {
          allergen: 'No Known Drug Allergies (NKDA)',
          reaction: 'None reported',
          severity: 'Mild'
        }
      ]);
    }
  };

  const handleRemoveAllergy = (index: number) => {
    setAllergies(allergies.filter((_, i) => i !== index));
  };

  // Add / remove medication
  const handleAddMedication = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (newMedName.trim()) {
      setMedications([
        ...medications,
        {
          name: newMedName.trim(),
          dosage: newMedDosage.trim() || 'Standard Dose',
          frequency: newMedFreq.trim() || 'Daily',
          indication: newMedIndication.trim() || 'General health maintenance',
          status: 'Active'
        }
      ]);
      setNewMedName('');
      setNewMedDosage('');
      setNewMedFreq('');
      setNewMedIndication('');
    }
  };

  const handleAddNoMeds = () => {
    if (!medications.some((m) => m.name.toLowerCase().includes('no medication'))) {
      setMedications([
        ...medications,
        {
          name: 'No Current Medications',
          dosage: 'N/A',
          frequency: 'None',
          indication: 'No active prescriptions',
          status: 'Active'
        }
      ]);
    }
  };

  const handleRemoveMedication = (index: number) => {
    setMedications(medications.filter((_, i) => i !== index));
  };

  // Form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const isValid = validateForm();
    if (!isValid) {
      // Focus on first error element
      const firstErrorKey = Object.keys(errors)[0];
      if (firstErrorKey) {
        const element = document.getElementById(`field-${firstErrorKey}`);
        element?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }

    // Prepare structured patient payload per requirements:
    // { "patient": { "name": "", "age": "", "sex": "", "symptoms": [], "conditions": [], "allergies": [], "medications": [], "medicalHistory": "" } }
    const structuredData: StructuredPatient = {
      name: fullName.trim(),
      age: parseInt(age, 10),
      sex,
      symptoms,
      conditions,
      allergies,
      medications,
      medicalHistory: medicalHistory.trim(),
      bloodType: bloodType || 'Unspecified',
      id: patient?.id || `PT-${Date.now().toString().slice(-5)}`,
      mrn: patient?.mrn || `MRN-${Math.floor(100000 + Math.random() * 900000)}`,
      isCustom: true
    };

    saveStructuredPatient(structuredData);
    setSavedSuccess(true);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header Bar */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 sm:px-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
            <User className="w-3.5 h-3.5 text-indigo-600" />
            <span>Patient Information Intake</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-800 tracking-tight">
            {patient ? 'Edit Patient Information' : 'New Patient Information Record'}
          </h1>
          <p className="text-xs text-slate-500 mt-1 max-w-xl">
            Collect and organize baseline demographics, current symptoms, existing conditions, allergies, medications, and medical history.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            id="btn-load-sample-intake"
            onClick={handleLoadSample}
            className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium border border-slate-200 transition-colors shadow-2xs"
            title="Load synthetic sample patient data for testing"
          >
            <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
            <span>Load Sample (Eleanor Vance)</span>
          </button>

          <button
            type="button"
            id="btn-trigger-clear-form"
            onClick={() => setShowClearConfirm(true)}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-slate-600 hover:text-rose-600 hover:bg-rose-50 text-xs font-medium border border-slate-200 transition-colors"
            title="Clear all fields"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Clear Form</span>
          </button>
        </div>
      </div>

      {/* Clear Confirmation Modal */}
      {showClearConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-xl border border-slate-200 space-y-4">
            <div className="flex items-center gap-3 text-rose-600">
              <div className="w-10 h-10 rounded-full bg-rose-100 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Clear Patient Information?</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Choose how you want to reset the form.
                </p>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              You can clear the form fields for re-entry, or completely reset the saved local record.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setShowClearConfirm(false)}
                className="w-full sm:w-auto px-3.5 py-2 text-xs font-medium rounded-md text-slate-600 hover:bg-slate-100 border border-slate-200 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleClearForm}
                className="w-full sm:w-auto px-3.5 py-2 text-xs font-medium rounded-md text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-300 transition-colors"
              >
                Clear Inputs Only
              </button>
              <button
                type="button"
                id="btn-confirm-reset-all"
                onClick={handleClearAndResetStorage}
                className="w-full sm:w-auto px-3.5 py-2 text-xs font-medium rounded-md text-white bg-rose-600 hover:bg-rose-700 shadow-xs transition-colors"
              >
                Reset Saved Record
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Success Confirmation Banner */}
      {savedSuccess && (
        <div
          id="save-success-banner"
          className="p-5 rounded-xl bg-green-50 border border-green-200 text-green-900 shadow-sm animate-in fade-in space-y-3"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-green-100 flex items-center justify-center shrink-0 text-green-700">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-green-900">
                  Patient Information Saved Successfully!
                </h3>
                <p className="text-xs text-green-700 mt-0.5">
                  Record for <strong>{fullName}</strong> has been saved to local storage. You can now view the dashboard or proceed to upload medical reports.
                </p>
              </div>
            </div>
            <button
              onClick={() => setSavedSuccess(false)}
              className="text-green-600 hover:text-green-800 p-1"
              aria-label="Dismiss success notice"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="flex items-center gap-3 pt-2 pl-12 flex-wrap">
            <button
              type="button"
              id="btn-goto-dashboard-after-save"
              onClick={() => navigate('/dashboard')}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-green-700 hover:bg-green-800 text-white text-xs font-semibold shadow-xs transition-colors"
            >
              <LayoutDashboard className="w-3.5 h-3.5" />
              <span>View on Patient Dashboard</span>
            </button>
            <button
              type="button"
              onClick={() => navigate('/upload')}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-white hover:bg-green-100 text-green-800 text-xs font-medium border border-green-300 transition-colors"
            >
              <span>Upload Medical Reports</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Main Intake Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Section 1: Demographics */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 sm:p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h2 className="text-sm font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
              <User className="w-4 h-4 text-indigo-600" />
              <span>1. Patient Profile & Demographics</span>
            </h2>
            <span className="text-slate-400 text-[11px] font-medium">* Required fields</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Patient Name */}
            <div className="sm:col-span-2">
              <label
                htmlFor="field-fullName"
                className="block text-xs font-bold text-slate-700 mb-1"
              >
                Patient Full Name <span className="text-rose-500">*</span>
              </label>
              <input
                id="field-fullName"
                type="text"
                value={fullName}
                onChange={(e) => {
                  setFullName(e.target.value);
                  if (errors.fullName) setErrors((prev) => ({ ...prev, fullName: undefined }));
                }}
                onBlur={() => setTouched((prev) => ({ ...prev, fullName: true }))}
                placeholder="e.g. Johnathan Doe"
                className={`w-full px-3.5 py-2.5 rounded-lg border text-xs text-slate-900 focus:outline-none focus:ring-2 bg-white transition-colors ${
                  errors.fullName
                    ? 'border-rose-300 focus:border-rose-500 focus:ring-rose-200 bg-rose-50/20'
                    : 'border-slate-300 focus:border-indigo-500 focus:ring-indigo-100'
                }`}
              />
              {errors.fullName && (
                <p id="error-fullName" className="text-[11px] text-rose-600 font-medium mt-1 flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3 shrink-0" />
                  <span>{errors.fullName}</span>
                </p>
              )}
            </div>

            {/* Age */}
            <div>
              <label
                htmlFor="field-age"
                className="block text-xs font-bold text-slate-700 mb-1"
              >
                Age (Years) <span className="text-rose-500">*</span>
              </label>
              <input
                id="field-age"
                type="number"
                min="0"
                max="130"
                value={age}
                onChange={(e) => {
                  setAge(e.target.value);
                  if (errors.age) setErrors((prev) => ({ ...prev, age: undefined }));
                }}
                onBlur={() => setTouched((prev) => ({ ...prev, age: true }))}
                placeholder="e.g. 45"
                className={`w-full px-3.5 py-2.5 rounded-lg border text-xs text-slate-900 focus:outline-none focus:ring-2 bg-white transition-colors ${
                  errors.age
                    ? 'border-rose-300 focus:border-rose-500 focus:ring-rose-200 bg-rose-50/20'
                    : 'border-slate-300 focus:border-indigo-500 focus:ring-indigo-100'
                }`}
              />
              {errors.age && (
                <p id="error-age" className="text-[11px] text-rose-600 font-medium mt-1 flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3 shrink-0" />
                  <span>{errors.age}</span>
                </p>
              )}
            </div>

            {/* Sex */}
            <div>
              <label
                htmlFor="field-sex"
                className="block text-xs font-bold text-slate-700 mb-1"
              >
                Sex Assigned at Birth / Legal Sex <span className="text-rose-500">*</span>
              </label>
              <select
                id="field-sex"
                value={sex}
                onChange={(e) => {
                  setSex(e.target.value);
                  if (errors.sex) setErrors((prev) => ({ ...prev, sex: undefined }));
                }}
                className={`w-full px-3.5 py-2.5 rounded-lg border text-xs text-slate-900 focus:outline-none focus:ring-2 bg-white transition-colors ${
                  errors.sex
                    ? 'border-rose-300 focus:border-rose-500 focus:ring-rose-200'
                    : 'border-slate-300 focus:border-indigo-500 focus:ring-indigo-100'
                }`}
              >
                <option value="Female">Female</option>
                <option value="Male">Male</option>
                <option value="Other">Other</option>
                <option value="Prefer not to say">Prefer not to say</option>
              </select>
              {errors.sex && (
                <p className="text-[11px] text-rose-600 font-medium mt-1">{errors.sex}</p>
              )}
            </div>

            {/* Blood Type (Optional clinical baseline) */}
            <div>
              <label
                htmlFor="field-bloodType"
                className="block text-xs font-bold text-slate-700 mb-1"
              >
                Blood Type <span className="text-slate-400 font-normal">(Optional)</span>
              </label>
              <select
                id="field-bloodType"
                value={bloodType}
                onChange={(e) => setBloodType(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 bg-white"
              >
                <option value="Unspecified">Unspecified / Unknown</option>
                <option value="A+">A+</option>
                <option value="A-">A-</option>
                <option value="B+">B+</option>
                <option value="B-">B-</option>
                <option value="AB+">AB+</option>
                <option value="AB-">AB-</option>
                <option value="O+">O+</option>
                <option value="O-">O-</option>
              </select>
            </div>
          </div>
        </div>

        {/* Section 2: Symptoms */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 sm:p-6 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 gap-1">
            <h2 className="text-sm font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
              <Heart className="w-4 h-4 text-rose-500" />
              <span>2. Current Symptoms <span className="text-rose-500">*</span></span>
            </h2>
            <span className="text-slate-400 text-xs">
              {symptoms.length} symptom(s) documented
            </span>
          </div>

          <div className="flex gap-2">
            <input
              id="field-symptoms"
              type="text"
              value={newSymptomInput}
              onChange={(e) => setNewSymptomInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddSymptom();
                }
              }}
              placeholder="e.g. Mild headache, Shortness of breath on exertion, Knee stiffness..."
              className="flex-1 px-3.5 py-2 rounded-lg border border-slate-300 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 bg-white"
            />
            <button
              type="button"
              id="btn-add-symptom"
              onClick={() => handleAddSymptom()}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add</span>
            </button>
          </div>

          {errors.symptoms && (
            <p id="error-symptoms" className="text-[11px] text-rose-600 font-medium flex items-center gap-1">
              <AlertTriangle className="w-3 h-3 shrink-0" />
              <span>{errors.symptoms}</span>
            </p>
          )}

          {/* Quick Add Suggestions */}
          <div className="flex items-center gap-1.5 flex-wrap text-[11px] text-slate-500">
            <span className="font-semibold text-slate-600">Quick add:</span>
            {['Fatigue', 'Mild headache', 'Dizziness', 'Persistent cough', 'Ankle swelling', 'Asymptomatic / Routine'].map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => handleQuickAddSymptom(item)}
                className="px-2 py-0.5 rounded-full bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 border border-slate-200 transition-colors"
              >
                + {item}
              </button>
            ))}
          </div>

          {/* Active Symptoms List */}
          <div className="space-y-2 pt-1">
            {symptoms.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {symptoms.map((symptom, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-800"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="w-2 h-2 rounded-full bg-rose-500 shrink-0" />
                      <span className="font-medium truncate">{symptom}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveSymptom(idx)}
                      className="text-slate-400 hover:text-rose-600 p-1 transition-colors"
                      title="Remove symptom"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-400 italic py-2">
                No symptoms added yet. Type a symptom above and click Add or select a quick option.
              </p>
            )}
          </div>
        </div>

        {/* Section 3: Existing Conditions */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 sm:p-6 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 gap-1">
            <h2 className="text-sm font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
              <FileText className="w-4 h-4 text-indigo-600" />
              <span>3. Existing Conditions & Chronic Diagnoses</span>
            </h2>
            <span className="text-slate-400 text-xs">
              {conditions.length} condition(s)
            </span>
          </div>

          <div className="flex gap-2">
            <input
              id="field-conditions"
              type="text"
              value={newConditionInput}
              onChange={(e) => setNewConditionInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddCondition();
                }
              }}
              placeholder="e.g. Hypertension, Type 2 Diabetes, Mild Osteoarthritis, None..."
              className="flex-1 px-3.5 py-2 rounded-lg border border-slate-300 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 bg-white"
            />
            <button
              type="button"
              id="btn-add-condition"
              onClick={() => handleAddCondition()}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add</span>
            </button>
          </div>

          {/* Quick Add Suggestions */}
          <div className="flex items-center gap-1.5 flex-wrap text-[11px] text-slate-500">
            <span className="font-semibold text-slate-600">Common:</span>
            {['Hypertension', 'Type 2 Diabetes', 'Hyperlipidemia', 'Asthma', 'Osteoarthritis', 'No Chronic Conditions'].map((cond) => (
              <button
                key={cond}
                type="button"
                onClick={() => handleQuickAddCondition(cond)}
                className="px-2 py-0.5 rounded-full bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 border border-slate-200 transition-colors"
              >
                + {cond}
              </button>
            ))}
          </div>

          {/* Active Conditions List */}
          <div className="space-y-2 pt-1">
            {conditions.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {conditions.map((cond, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-800"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="w-2 h-2 rounded-full bg-indigo-500 shrink-0" />
                      <span className="font-medium truncate">{cond}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveCondition(idx)}
                      className="text-slate-400 hover:text-rose-600 p-1 transition-colors"
                      title="Remove condition"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-400 italic py-2">
                No existing conditions recorded. Add any relevant ongoing medical diagnoses above.
              </p>
            )}
          </div>
        </div>

        {/* Section 4: Allergies */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 sm:p-6 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 gap-1">
            <h2 className="text-sm font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-500" />
              <span>4. Allergies & Adverse Drug Reactions</span>
            </h2>
            <button
              type="button"
              onClick={handleAddNKDA}
              className="text-xs text-indigo-600 hover:text-indigo-800 font-medium underline"
            >
              + Mark No Known Drug Allergies (NKDA)
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-12 gap-2">
            <div className="sm:col-span-5">
              <input
                id="field-allergen"
                type="text"
                value={newAllergen}
                onChange={(e) => setNewAllergen(e.target.value)}
                placeholder="Allergen (e.g. Penicillin, Sulfa, Peanuts)"
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 bg-white"
              />
            </div>
            <div className="sm:col-span-4">
              <input
                id="field-allergy-reaction"
                type="text"
                value={newReaction}
                onChange={(e) => setNewReaction(e.target.value)}
                placeholder="Reaction (e.g. Hives, Swelling, Rash)"
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 bg-white"
              />
            </div>
            <div className="sm:col-span-2">
              <select
                id="field-allergy-severity"
                value={newSeverity}
                onChange={(e) => setNewSeverity(e.target.value as any)}
                className="w-full px-2.5 py-2 rounded-lg border border-slate-300 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 bg-white"
              >
                <option value="Mild">Mild</option>
                <option value="Moderate">Moderate</option>
                <option value="Severe">Severe</option>
              </select>
            </div>
            <div className="sm:col-span-1">
              <button
                type="button"
                id="btn-add-allergy"
                onClick={() => handleAddAllergy()}
                className="w-full h-full min-h-[36px] bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold flex items-center justify-center transition-colors shadow-xs"
                title="Add allergy entry"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Active Allergies List */}
          <div className="space-y-2 pt-1">
            {allergies.length > 0 ? (
              <div className="space-y-2">
                {allergies.map((allergy, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-3 rounded-lg bg-red-50/40 border border-red-200/80 text-xs"
                  >
                    <div>
                      <span className="font-bold text-red-800">{allergy.allergen}</span>
                      {allergy.reaction && (
                        <span className="text-slate-600 ml-2">Reaction: {allergy.reaction}</span>
                      )}
                    </div>
                    <div className="flex items-center gap-3">
                      <span
                        className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                          allergy.severity === 'Severe'
                            ? 'bg-rose-100 text-rose-800'
                            : allergy.severity === 'Moderate'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {allergy.severity}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleRemoveAllergy(idx)}
                        className="text-slate-400 hover:text-rose-600 p-1 transition-colors"
                        title="Remove allergy"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-400 italic py-2">
                No allergies documented. Record any known medication or food sensitivities above.
              </p>
            )}
          </div>
        </div>

        {/* Section 5: Current Medications */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 sm:p-6 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 gap-1">
            <h2 className="text-sm font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
              <Pill className="w-4 h-4 text-indigo-600" />
              <span>5. Current Medications</span>
            </h2>
            <button
              type="button"
              onClick={handleAddNoMeds}
              className="text-xs text-indigo-600 hover:text-indigo-800 font-medium underline"
            >
              + Mark No Current Medications
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-12 gap-2">
            <div className="sm:col-span-4">
              <input
                id="field-med-name"
                type="text"
                value={newMedName}
                onChange={(e) => setNewMedName(e.target.value)}
                placeholder="Medication name (e.g. Metformin)"
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 bg-white"
              />
            </div>
            <div className="sm:col-span-2">
              <input
                id="field-med-dosage"
                type="text"
                value={newMedDosage}
                onChange={(e) => setNewMedDosage(e.target.value)}
                placeholder="Dosage (e.g. 500mg)"
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 bg-white"
              />
            </div>
            <div className="sm:col-span-3">
              <input
                id="field-med-frequency"
                type="text"
                value={newMedFreq}
                onChange={(e) => setNewMedFreq(e.target.value)}
                placeholder="Frequency (e.g. Twice daily)"
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 bg-white"
              />
            </div>
            <div className="sm:col-span-2">
              <input
                id="field-med-indication"
                type="text"
                value={newMedIndication}
                onChange={(e) => setNewMedIndication(e.target.value)}
                placeholder="Purpose (e.g. Diabetes)"
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 bg-white"
              />
            </div>
            <div className="sm:col-span-1">
              <button
                type="button"
                id="btn-add-medication"
                onClick={() => handleAddMedication()}
                className="w-full h-full min-h-[36px] bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold flex items-center justify-center transition-colors shadow-xs"
                title="Add medication entry"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Active Medications List */}
          <div className="space-y-2 pt-1">
            {medications.length > 0 ? (
              <div className="space-y-2">
                {medications.map((med, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-3 rounded-lg bg-slate-50 border border-slate-200 text-xs"
                  >
                    <div>
                      <span className="font-bold text-slate-900">{med.name}</span>
                      <span className="text-slate-500 font-mono ml-2 font-normal">
                        ({med.dosage})
                      </span>
                      <span className="block text-slate-500 text-[11px] mt-0.5">
                        {med.frequency} • {med.indication}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-green-100 text-green-700">
                        {med.status || 'Active'}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleRemoveMedication(idx)}
                        className="text-slate-400 hover:text-rose-600 p-1 transition-colors"
                        title="Remove medication"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-400 italic py-2">
                No active medications recorded. Add ongoing prescriptions or over-the-counter supplements above.
              </p>
            )}
          </div>
        </div>

        {/* Section 6: Medical History */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 sm:p-6 shadow-sm space-y-3">
          <h2 className="text-sm font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
            <FileText className="w-4 h-4 text-indigo-600" />
            <span>6. Comprehensive Medical History</span>
          </h2>
          <p className="text-xs text-slate-500">
            Document prior surgeries, hospitalizations, family medical history, and relevant clinical trajectory.
          </p>

          <textarea
            id="field-medicalHistory"
            rows={4}
            value={medicalHistory}
            onChange={(e) => setMedicalHistory(e.target.value)}
            placeholder="e.g. Prior appendectomy in 2014. Family history of early-onset coronary artery disease (maternal). No history of tobacco or alcohol use..."
            className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 bg-white leading-relaxed"
          />
        </div>

        {/* Safety & Non-Diagnostic Notice */}
        <SafetyNotice variant="compact" />

        {/* Form Action Controls */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              type="button"
              id="btn-cancel-intake"
              onClick={() => navigate('/dashboard')}
              className="w-full sm:w-auto px-4 py-2.5 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-100 font-medium text-xs transition-colors"
            >
              Cancel / Return to Dashboard
            </button>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              type="submit"
              id="btn-save-patient"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs shadow-xs transition-colors group"
            >
              <Save className="w-4 h-4" />
              <span>Save Patient Information</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};
