/**
 * Reference-Range Validation Engine
 * 
 * Requirement 3: Application-Side Deterministic Comparison.
 * Evaluates reported numerical or textual values against source reference intervals.
 * 
 * Critical Rules:
 * 1. If value and reference range are available and machine-readable, calculate:
 *    - LOW
 *    - NORMAL
 *    - HIGH
 * 2. If reference range is missing or null:
 *    - Status = "Not Determined"
 * 3. Never use an external reference range automatically.
 * 4. Never invent a reference range.
 * 5. Display the source reference range exactly as provided by the report.
 * 6. Non-diagnostic: calculations are purely mathematical intervals, never disease diagnoses.
 */

export type CalculatedLabStatus = 'LOW' | 'NORMAL' | 'HIGH' | 'Not Determined';

export interface ReferenceEvaluationResult {
  status: CalculatedLabStatus;
  numericValue?: number;
  min?: number;
  max?: number;
  isMachineReadable: boolean;
  explanation: string;
}

/**
 * Extract clean numeric float from a string (e.g. "128", "6.8%", "<0.05", "14.2 mg/dL")
 */
export function parseNumericValue(raw: string | number | null | undefined): number | null {
  if (raw === null || raw === undefined) return null;
  if (typeof raw === 'number') return isNaN(raw) ? null : raw;

  const cleaned = String(raw)
    .trim()
    .replace(/,/g, '') // remove thousand separators
    .replace(/[^\d.-]/g, ' ') // replace non-digits with space (preserve . and -)
    .trim()
    .split(/\s+/)[0]; // take first number token

  if (!cleaned) return null;
  const parsed = parseFloat(cleaned);
  return isNaN(parsed) ? null : parsed;
}

/**
 * Evaluate a reported value against the exact source reference range
 */
export function evaluateReferenceRange(
  value: string | number | null | undefined,
  referenceRange: string | null | undefined
): ReferenceEvaluationResult {
  // Rule 2: If reference range is missing or empty -> "Not Determined"
  if (
    !referenceRange ||
    typeof referenceRange !== 'string' ||
    referenceRange.trim().length === 0 ||
    referenceRange.toLowerCase() === 'null' ||
    referenceRange.toLowerCase() === 'none' ||
    referenceRange.toLowerCase() === 'n/a' ||
    referenceRange.toLowerCase() === 'not provided' ||
    referenceRange.toLowerCase() === 'not provided in source report'
  ) {
    return {
      status: 'Not Determined',
      isMachineReadable: false,
      explanation: 'Reference range was not provided in the source report.'
    };
  }

  const trimmedRange = referenceRange.trim();
  const numVal = parseNumericValue(value);

  // If value is not a numeric value, check common qualitative patterns
  if (numVal === null) {
    const textVal = String(value || '').toLowerCase().trim();
    const textRange = trimmedRange.toLowerCase();

    // Check qualitative match like Negative, Non-Reactive, Absent, Normal
    if (
      (textVal.includes('negative') || textVal.includes('non-reactive') || textVal.includes('normal')) &&
      (textRange.includes('negative') || textRange.includes('non-reactive') || textRange.includes('normal'))
    ) {
      return {
        status: 'NORMAL',
        isMachineReadable: true,
        explanation: 'Qualitative result matches normal qualitative reference interval.'
      };
    }

    if (
      (textVal.includes('positive') || textVal.includes('reactive')) &&
      (textRange.includes('negative') || textRange.includes('non-reactive'))
    ) {
      return {
        status: 'HIGH', // Flagged as outside normal qualitative expectation
        isMachineReadable: true,
        explanation: 'Qualitative result is positive/reactive against negative reference expectation.'
      };
    }

    return {
      status: 'Not Determined',
      isMachineReadable: false,
      explanation: 'Value is qualitative or non-numeric and cannot be mathematically compared.'
    };
  }

  // Pattern 1: Standard Interval "min - max" or "min – max" or "min to max"
  // Example: "70 - 99", "3.5 - 5.0", "135 – 145", "12.0 to 16.0"
  const intervalMatch = trimmedRange.match(
    /(-?\d+(?:\.\d+)?)\s*(?:-|–|—|to)\s*(-?\d+(?:\.\d+)?)/i
  );
  if (intervalMatch) {
    const min = parseFloat(intervalMatch[1]);
    const max = parseFloat(intervalMatch[2]);

    if (!isNaN(min) && !isNaN(max)) {
      if (numVal < min) {
        return {
          status: 'LOW',
          numericValue: numVal,
          min,
          max,
          isMachineReadable: true,
          explanation: `Reported value (${numVal}) is below the reference interval minimum (${min}).`
        };
      }
      if (numVal > max) {
        return {
          status: 'HIGH',
          numericValue: numVal,
          min,
          max,
          isMachineReadable: true,
          explanation: `Reported value (${numVal}) is above the reference interval maximum (${max}).`
        };
      }
      return {
        status: 'NORMAL',
        numericValue: numVal,
        min,
        max,
        isMachineReadable: true,
        explanation: `Reported value (${numVal}) is within the reference interval [${min} - ${max}].`
      };
    }
  }

  // Pattern 2: Upper bound limit "< max" or "<= max" or "≤ max" or "less than max"
  // Example: "< 100", "< 200", "<= 5.6", "<5.7"
  const upperBoundMatch = trimmedRange.match(
    /(?:<|<=|≤|less\s+than|up\s+to)\s*(-?\d+(?:\.\d+)?)/i
  );
  if (upperBoundMatch) {
    const max = parseFloat(upperBoundMatch[1]);
    if (!isNaN(max)) {
      if (numVal > max) {
        return {
          status: 'HIGH',
          numericValue: numVal,
          max,
          isMachineReadable: true,
          explanation: `Reported value (${numVal}) exceeds the upper reference threshold (${max}).`
        };
      }
      return {
        status: 'NORMAL',
        numericValue: numVal,
        max,
        isMachineReadable: true,
        explanation: `Reported value (${numVal}) is within the upper reference limit (≤ ${max}).`
      };
    }
  }

  // Pattern 3: Lower bound limit "> min" or ">= min" or "≥ min" or "greater than min"
  // Example: "> 60", ">= 60", ">30"
  const lowerBoundMatch = trimmedRange.match(
    /(?:>|>=|≥|greater\s+than|at\s+least)\s*(-?\d+(?:\.\d+)?)/i
  );
  if (lowerBoundMatch) {
    const min = parseFloat(lowerBoundMatch[1]);
    if (!isNaN(min)) {
      if (numVal < min) {
        return {
          status: 'LOW',
          numericValue: numVal,
          min,
          isMachineReadable: true,
          explanation: `Reported value (${numVal}) is below the lower reference threshold (${min}).`
        };
      }
      return {
        status: 'NORMAL',
        numericValue: numVal,
        min,
        isMachineReadable: true,
        explanation: `Reported value (${numVal}) satisfies the lower reference threshold (≥ ${min}).`
      };
    }
  }

  // If none matched, do not guess
  return {
    status: 'Not Determined',
    numericValue: numVal,
    isMachineReadable: false,
    explanation: 'Reference range format could not be parsed deterministically.'
  };
}
