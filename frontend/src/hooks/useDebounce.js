import { useState, useEffect } from 'react';

export function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

export function useSubmissionLock() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionId, setSubmissionId] = useState(null);

  const startSubmission = () => {
    if (isSubmitting) {
      return false;
    }

    const id = `sub_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    setSubmissionId(id);
    setIsSubmitting(true);
    return id;
  };

  const endSubmission = () => {
    setIsSubmitting(false);
    setSubmissionId(null);
  };

  return {
    isSubmitting,
    submissionId,
    startSubmission,
    endSubmission
  };
}

