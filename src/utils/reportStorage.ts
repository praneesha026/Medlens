/**
 * Report Storage Utility
 * 
 * Manages persistent client-side storage for medical report metadata.
 * Decoupled from UI components to enable seamless transition to
 * FastAPI / PostgreSQL backend in future milestones.
 */

export interface StoredReport {
  id: string;
  fileName: string;
  fileType: string;
  fileSize: string;
  uploadDate: string;
  status: 'READY_FOR_REVIEW' | 'UPLOADING' | 'PROCESSING' | 'ERROR' | 'Processed';
  source: string;
  title?: string;
  facility?: string;
  provider?: string;
}

const STORAGE_KEY = 'medlens_reports';
export const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB
export const ALLOWED_MIME_TYPES = [
  'application/pdf',
  'image/jpeg',
  'image/jpg',
  'image/png'
];
export const ALLOWED_EXTENSIONS = ['.pdf', '.jpg', '.jpeg', '.png'];

/**
 * Format bytes into human-readable string (e.g. "1.4 MB", "840 KB")
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

/**
 * Cleanly format MIME or extension into readable file type
 */
export function getFriendlyFileType(file: File): string {
  const ext = file.name.slice(((file.name.lastIndexOf('.') - 1) >>> 0) + 2).toLowerCase();
  if (ext === 'pdf' || file.type === 'application/pdf') return 'PDF Document';
  if (ext === 'jpg' || ext === 'jpeg' || file.type === 'image/jpeg') return 'JPEG Image';
  if (ext === 'png' || file.type === 'image/png') return 'PNG Image';
  return file.type || ext.toUpperCase() || 'Document';
}

/**
 * Validate file against allowed types and 10MB size limit
 */
export function validateMedicalFile(file: File): { valid: boolean; error?: string } {
  if (!file) {
    return { valid: false, error: 'No file provided.' };
  }

  // Check file size (10 MB limit)
  if (file.size > MAX_FILE_SIZE_BYTES) {
    return {
      valid: false,
      error: `File exceeds maximum allowed size of 10 MB (Selected: ${formatFileSize(file.size)}). Please choose a smaller file.`
    };
  }

  // Check file type
  const ext = file.name.slice(((file.name.lastIndexOf('.') - 1) >>> 0) + 2).toLowerCase();
  const hasValidExt = ALLOWED_EXTENSIONS.includes(`.${ext}`);
  const hasValidMime = ALLOWED_MIME_TYPES.includes(file.type.toLowerCase());

  if (!hasValidExt && !hasValidMime) {
    return {
      valid: false,
      error: 'Unsupported file type. Please upload a PDF document or a JPG/PNG image.'
    };
  }

  return { valid: true };
}

export const ReportStorage = {
  /**
   * Get all stored reports
   */
  getReports(): StoredReport[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) return [];
      return parsed;
    } catch (error) {
      console.error('Error reading reports from localStorage:', error);
      return [];
    }
  },

  /**
   * Get a single report by ID
   */
  getReportById(id: string): StoredReport | undefined {
    const reports = this.getReports();
    return reports.find((r) => r.id === id);
  },

  /**
   * Save a newly uploaded report metadata object
   */
  saveReport(report: StoredReport): StoredReport[] {
    try {
      const existing = this.getReports();
      // Prepend so latest appears first
      const updated = [report, ...existing.filter((r) => r.id !== report.id)];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return updated;
    } catch (error) {
      console.error('Error saving report to localStorage:', error);
      throw new Error('Could not save report metadata to local storage. Storage quota may be exceeded.');
    }
  },

  /**
   * Delete a report by ID
   */
  deleteReport(id: string): StoredReport[] {
    try {
      const existing = this.getReports();
      const updated = existing.filter((r) => r.id !== id);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return updated;
    } catch (error) {
      console.error('Error deleting report from localStorage:', error);
      return this.getReports();
    }
  },

  /**
   * Clear all reports
   */
  clearReports(): void {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      console.error('Error clearing reports from localStorage:', error);
    }
  }
};
