/**
 * Medical Data Validator Utility
 * 
 * Validates and normalizes structured medical information returned by Gemini API.
 * Ensures strict schema compliance, prevents hallucinated reference ranges,
 * and guards against malformed AI outputs before display or storage.
 */

import { ExtractedReportData, ExtractedResultItem, ExtractedReportMetadata } from '../types';
import { evaluateReferenceRange } from './referenceRangeEvaluator';

export interface ValidationOutcome {
  isValid: boolean;
  data?: ExtractedReportData;
  errors: string[];
  rawText?: string;
}

/**
 * Determine human-readable AI Extraction Confidence level
 * Note: Reflects model extraction certainty, NOT clinical certainty.
 */
export function getConfidenceLevel(val: number): 'High confidence' | 'Medium confidence' | 'Low confidence' {
  // Normalize if val is on 0-100 scale vs 0-1 scale
  const normalized = val > 1 ? val / 100 : val;
  if (normalized >= 0.85) return 'High confidence';
  if (normalized >= 0.60) return 'Medium confidence';
  return 'Low confidence';
}

/**
 * Parse and validate Gemini extraction output
 */
export function validateGeminiMedicalOutput(
  rawInput: unknown,
  fallbackFileName: string = 'Uploaded_Report.pdf'
): ValidationOutcome {
  const errors: string[] = [];

  if (!rawInput) {
    return {
      isValid: false,
      errors: ['Extraction payload is null or undefined.'],
    };
  }

  let parsed: any = rawInput;

  // If raw string was provided, attempt JSON parsing
  if (typeof rawInput === 'string') {
    try {
      // Clean possible Markdown JSON fences
      let cleaned = rawInput.trim();
      if (cleaned.startsWith('```json')) {
        cleaned = cleaned.replace(/^```json\s*/, '').replace(/```\s*$/, '');
      } else if (cleaned.startsWith('```')) {
        cleaned = cleaned.replace(/^```\s*/, '').replace(/```\s*$/, '');
      }
      parsed = JSON.parse(cleaned.trim());
    } catch (err: any) {
      return {
        isValid: false,
        rawText: typeof rawInput === 'string' ? rawInput : undefined,
        errors: [`Invalid JSON formatting in AI response: ${err.message || 'Syntax error'}`],
      };
    }
  }

  if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
    return {
      isValid: false,
      errors: ['Extraction payload root must be an object with "report" and "results" keys.'],
    };
  }

  // Validate report metadata
  if (!parsed.report || typeof parsed.report !== 'object') {
    errors.push('Missing or invalid "report" metadata object in extraction response.');
  }

  const reportMeta: ExtractedReportMetadata = {
    fileName: (parsed.report?.fileName && String(parsed.report.fileName).trim()) || fallbackFileName,
    reportDate: (parsed.report?.reportDate && String(parsed.report.reportDate).trim()) || new Date().toISOString().split('T')[0],
    reportType: (parsed.report?.reportType && String(parsed.report.reportType).trim()) || 'Laboratory Report',
    source: (parsed.report?.source && String(parsed.report.source).trim()) || 'User Uploaded',
    facility: parsed.report?.facility ? String(parsed.report.facility).trim() : undefined,
  };

  // Validate results array
  if (!Array.isArray(parsed.results)) {
    errors.push('Missing "results" array in extraction response. Output must include a "results" list.');
    return {
      isValid: false,
      errors,
      rawText: JSON.stringify(parsed),
    };
  }

  const validatedResults: ExtractedResultItem[] = [];

  parsed.results.forEach((item: any, index: number) => {
    if (!item || typeof item !== 'object') {
      errors.push(`Result item at index ${index} is not an object.`);
      return;
    }

    // Rule: testName must exist
    if (!item.testName || String(item.testName).trim().length === 0) {
      errors.push(`Result item at index ${index} is missing a required test name.`);
      return;
    }

    const testName = String(item.testName).trim();

    // Value handling: preserve exact value, or mark uncertain if missing
    let value = '';
    if (item.value !== undefined && item.value !== null) {
      value = String(item.value).trim();
    } else {
      value = 'Uncertain';
    }

    // Unit handling
    const unit = item.unit ? String(item.unit).trim() : '';

    // Reference range handling:
    // Rule: Never invent reference ranges. If null/empty/missing in source, MUST be null.
    let referenceRange: string | null = null;
    if (
      item.referenceRange !== undefined &&
      item.referenceRange !== null &&
      String(item.referenceRange).trim().length > 0 &&
      String(item.referenceRange).toLowerCase() !== 'null' &&
      String(item.referenceRange).toLowerCase() !== 'none' &&
      String(item.referenceRange).toLowerCase() !== 'n/a' &&
      String(item.referenceRange).toLowerCase() !== 'not provided'
    ) {
      referenceRange = String(item.referenceRange).trim();
    }

    // Confidence handling
    let rawConfidence = 0.9;
    if (typeof item.confidence === 'number' && !isNaN(item.confidence)) {
      rawConfidence = item.confidence > 1 ? item.confidence / 100 : item.confidence;
      if (rawConfidence < 0) rawConfidence = 0;
      if (rawConfidence > 1) rawConfidence = 1;
    } else if (typeof item.confidence === 'string') {
      const parsedNum = parseFloat(item.confidence);
      if (!isNaN(parsedNum)) {
        rawConfidence = parsedNum > 1 ? parsedNum / 100 : parsedNum;
      }
    }

    const confidenceLevel = getConfidenceLevel(rawConfidence);
    const rangeEvaluation = evaluateReferenceRange(value, referenceRange);

    const resultItem: ExtractedResultItem = {
      id: `res-${index + 1}-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`,
      testName,
      value,
      unit,
      referenceRange,
      date: item.date ? String(item.date).trim() : reportMeta.reportDate,
      observation: item.observation ? String(item.observation).trim() : undefined,
      source: item.source ? String(item.source).trim() : reportMeta.fileName,
      confidence: Math.round(rawConfidence * 100) / 100,
      confidenceLevel,
      // Rule 10 & Req 7: Do not automatically mark AI-generated information as verified
      isHumanVerified: false,
      isEdited: false,
      verificationStatus: 'AI Extracted',
      originalExtractedValue: value,
      calculatedStatus: rangeEvaluation.status,
    };

    validatedResults.push(resultItem);
  });

  if (errors.length > 0 && validatedResults.length === 0) {
    return {
      isValid: false,
      errors,
      rawText: JSON.stringify(parsed),
    };
  }

  return {
    isValid: true,
    data: {
      report: reportMeta,
      results: validatedResults,
    },
    errors,
  };
}
