// src/components/CanopyAnalysis/utils/helpers.ts

/**
 * Formats a number to a specified number of decimal places
 * @param value - The number to format
 * @param decimals - Number of decimal places (default 2)
 * @returns Formatted number as string
 */
export const formatNumber = (value: number, decimals: number = 2): string => {
  return value.toFixed(decimals);
};

/**
 * Generates a filename with timestamp
 * @param baseName - Base name for the file
 * @param extension - File extension
 * @returns Formatted filename with timestamp
 */
export const generateTimestampedFilename = (baseName: string, extension: string): string => {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  return `${baseName}_${timestamp}.${extension}`;
};

/**
 * Converts analysis results to CSV format
 * @param results - Array of analysis results
 * @returns CSV formatted string
 */
export const resultsToCsv = (results: any[]): string => {
  if (results.length === 0) return '';

  // Define CSV headers
  const headers = Object.keys(results[0]).join(',');
  const csvRows = [headers];

  // Process each result
  for (const result of results) {
    const values = Object.values(result).map(value => {
      // Handle potential commas in values by wrapping in quotes
      const stringValue = String(value);
      return stringValue.includes(',') ? `"${stringValue}"` : stringValue;
    });
    csvRows.push(values.join(','));
  }

  return csvRows.join('\n');
};

/**
 * Downloads a CSV file
 * @param csvContent - CSV formatted content
 * @param filename - Name for the file
 */
export const downloadCsv = (csvContent: string, filename: string): void => {
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);

  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

/**
 * Handles API errors and returns a user-friendly message
 * @param error - The error object
 * @returns User-friendly error message
 */
export const handleApiError = (error: any): string => {
  if (error.response) {
    // Server responded with error status
    const { status, data } = error.response;
    
    switch (status) {
      case 400:
        return data.message || 'Bad request. Please check your input.';
      case 401:
        return 'Unauthorized. Please log in and try again.';
      case 403:
        return 'Forbidden. You do not have permission to perform this action.';
      case 404:
        return 'Resource not found. Please check the URL.';
      case 500:
        return 'Server error. Please try again later.';
      default:
        return data.message || `Server error (${status}). Please try again later.`;
    }
  } else if (error.request) {
    // Request was made but no response received
    return 'Network error. Please check your connection and try again.';
  } else {
    // Something else happened
    return error.message || 'An unexpected error occurred.';
  }
};

import { CANOPY_ANALYSIS_CONFIG } from '../config';

/**
 * Validates an uploaded image file
 * @param file - The file to validate
 * @param maxSizeMB - Maximum allowed file size in MB (default from config)
 * @returns Object with validation status and message
 */
export const validateImageFile = (file: File, maxSizeMB: number = CANOPY_ANALYSIS_CONFIG.MAX_FILE_SIZE_MB): { isValid: boolean; message: string } => {
  // Check file type
  if (!CANOPY_ANALYSIS_CONFIG.SUPPORTED_IMAGE_TYPES.some(type => file.type.includes(type))) {
    return {
      isValid: false,
      message: 'File must be a supported image type (JPEG, PNG, etc.)'
    };
  }

  // Check file size
  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  if (file.size > maxSizeBytes) {
    return {
      isValid: false,
      message: `File size exceeds ${maxSizeMB}MB limit`
    };
  }

  return {
    isValid: true,
    message: ''
  };
};