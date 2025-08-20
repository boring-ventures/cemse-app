import { useState, useCallback, useEffect } from 'react';
import { useAuthStore } from '@/app/store/authStore';
import { apiService } from '@/app/services/apiService';

export interface JobQuestion {
  id: string;
  question: string;
  type: 'text' | 'multiple_choice' | 'boolean';
  required: boolean;
  options?: string[];
  order?: number;
}

export interface JobQuestionAnswer {
  questionId: string;
  question: string;
  answer: string;
}

interface UseJobQuestionsReturn {
  questions: JobQuestion[];
  loading: boolean;
  error: string | null;
  fetchQuestions: (jobId: string) => Promise<void>;
  validateAnswers: (answers: JobQuestionAnswer[]) => { isValid: boolean; errors: string[] };
}

export function useJobQuestions(): UseJobQuestionsReturn {
  const { tokens } = useAuthStore();
  const [questions, setQuestions] = useState<JobQuestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchQuestions = useCallback(async (jobId: string): Promise<void> => {
    if (!tokens?.token || !jobId) {
      setError('No authentication token or job ID');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await apiService.getJobQuestions(tokens.token, jobId);

      if (response.success && response.data) {
        // Transform API data to our interface
        const questionsArray = Array.isArray(response.data) ? response.data : [];
        const transformedQuestions: JobQuestion[] = questionsArray.map((q: any) => ({
          id: q.id,
          question: q.question,
          type: q.type || 'text',
          required: q.required || false,
          options: q.options || [],
          order: q.order || 0,
        }));

        // Sort by order
        transformedQuestions.sort((a, b) => (a.order || 0) - (b.order || 0));
        
        setQuestions(transformedQuestions);
      } else {
        throw new Error(response.error?.message || 'Failed to fetch job questions');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      console.error('Error fetching job questions:', err);
      setQuestions([]);
    } finally {
      setLoading(false);
    }
  }, [tokens?.token]);

  const validateAnswers = useCallback((answers: JobQuestionAnswer[]): { isValid: boolean; errors: string[] } => {
    const errors: string[] = [];
    
    // Check all required questions have answers
    const requiredQuestions = questions.filter(q => q.required);
    
    for (const question of requiredQuestions) {
      const answer = answers.find(a => a.questionId === question.id);
      if (!answer || !answer.answer.trim()) {
        errors.push(`Debes responder: "${question.question}"`);
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }, [questions]);

  return {
    questions,
    loading,
    error,
    fetchQuestions,
    validateAnswers,
  };
}