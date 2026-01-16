/**
 * API Client for ExamTrend AI Backend
 * Replaces the Gemini simulation with real data-driven API calls
 */

import { AnalysisResult, SearchParams } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

/**
 * Fetch analysis data from the backend API
 */
export const generateAnalysis = async (params: SearchParams): Promise<AnalysisResult> => {
  try {
    const response = await fetch(`${API_BASE_URL}/analyze`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(params),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: 'Analysis failed' }));
      throw new Error(error.detail || `HTTP ${response.status}: ${response.statusText}`);
    }

    const data: AnalysisResult = await response.json();
    return data;
  } catch (error: unknown) {
    if (error instanceof Error) {
      // Network error or fetch failed
      if (error.message.includes('fetch')) {
        throw new Error(
          'Unable to connect to the analysis server. Make sure the backend is running at ' + API_BASE_URL
        );
      }
      throw error;
    }
    throw new Error('An unexpected error occurred during analysis');
  }
};

/**
 * Fetch available exams
 */
export const getExams = async () => {
  const response = await fetch(`${API_BASE_URL}/exams`);
  if (!response.ok) throw new Error('Failed to fetch exams');
  return response.json();
};

/**
 * Fetch subjects for an exam
 */
export const getSubjects = async (examId: number) => {
  const response = await fetch(`${API_BASE_URL}/exams/${examId}/subjects`);
  if (!response.ok) throw new Error('Failed to fetch subjects');
  return response.json();
};

/**
 * Fetch chapters for a subject
 */
export const getChapters = async (subjectId: number) => {
  const response = await fetch(`${API_BASE_URL}/subjects/${subjectId}/chapters`);
  if (!response.ok) throw new Error('Failed to fetch chapters');
  return response.json();
};

/**
 * Get exam statistics
 */
export const getExamStats = async (examName: string) => {
  const response = await fetch(`${API_BASE_URL}/stats/${examName}`);
  if (!response.ok) throw new Error('Failed to fetch exam stats');
  return response.json();
};

/**
 * Health check
 */
export const healthCheck = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/health`);
    return response.ok;
  } catch {
    return false;
  }
};
