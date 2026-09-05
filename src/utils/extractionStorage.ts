/**
 * Extraction Storage Utility
 * 
 * Manages local persistence for structured medical report extractions.
 * Connects extraction status and structured results to uploaded report IDs.
 */

import { ReportExtractionRecord, ExtractedResultItem } from '../types';

const EXTRACTION_STORAGE_KEY = 'medlens_extractions';

export const ExtractionStorage = {
  /**
   * Get all extraction records
   */
  getAllExtractions(): Record<string, ReportExtractionRecord> {
    try {
      const raw = localStorage.getItem(EXTRACTION_STORAGE_KEY);
      if (!raw) return {};
      const parsed = JSON.parse(raw);
      if (typeof parsed !== 'object' || parsed === null) return {};
      return parsed;
    } catch (error) {
      console.error('Error reading extractions from localStorage:', error);
      return {};
    }
  },

  /**
   * Get extraction record by reportId
   */
  getExtraction(reportId: string): ReportExtractionRecord | null {
    if (!reportId) return null;
    const all = this.getAllExtractions();
    return all[reportId] || null;
  },

  /**
   * Save or update extraction record for a reportId
   */
  saveExtraction(record: ReportExtractionRecord): void {
    if (!record || !record.reportId) return;
    try {
      const all = this.getAllExtractions();
      all[record.reportId] = {
        ...record,
        extractedAt: record.extractedAt || new Date().toISOString(),
      };
      localStorage.setItem(EXTRACTION_STORAGE_KEY, JSON.stringify(all));
    } catch (error) {
      console.error('Error saving extraction to localStorage:', error);
    }
  },

  /**
   * Update an individual extracted result item (e.g., human edit or correction)
   */
  updateResultItem(
    reportId: string,
    itemId: string,
    updatedFields: Partial<ExtractedResultItem>
  ): ReportExtractionRecord | null {
    const extraction = this.getExtraction(reportId);
    if (!extraction) return null;

    const itemIndex = extraction.results.findIndex((r) => r.id === itemId);
    if (itemIndex === -1) return null;

    const currentItem = extraction.results[itemIndex];
    extraction.results[itemIndex] = {
      ...currentItem,
      ...updatedFields,
    };

    this.saveExtraction(extraction);
    return extraction;
  },

  /**
   * Toggle or set human verification status for an item
   */
  verifyResultItem(
    reportId: string,
    itemId: string,
    isVerified: boolean,
    verifiedBy: string = 'Clinician / Patient Reviewer'
  ): ReportExtractionRecord | null {
    const extraction = this.getExtraction(reportId);
    if (!extraction) return null;

    const itemIndex = extraction.results.findIndex((r) => r.id === itemId);
    if (itemIndex === -1) return null;

    const currentItem = extraction.results[itemIndex];
    extraction.results[itemIndex] = {
      ...currentItem,
      isHumanVerified: isVerified,
      verificationStatus: isVerified ? 'Human Verified' : 'AI Extracted',
      verifiedAt: isVerified ? new Date().toISOString() : undefined,
      verifiedBy: isVerified ? verifiedBy : undefined,
    };

    this.saveExtraction(extraction);
    return extraction;
  },

  /**
   * Delete extraction for a report
   */
  deleteExtraction(reportId: string): void {
    try {
      const all = this.getAllExtractions();
      delete all[reportId];
      localStorage.setItem(EXTRACTION_STORAGE_KEY, JSON.stringify(all));
    } catch (error) {
      console.error('Error deleting extraction from localStorage:', error);
    }
  },

  /**
   * Clear all extractions
   */
  clearAll(): void {
    try {
      localStorage.removeItem(EXTRACTION_STORAGE_KEY);
    } catch (error) {
      console.error('Error clearing extractions:', error);
    }
  },
};
