'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';

const SubmissionContext = createContext();

export const useSubmission = () => {
  const context = useContext(SubmissionContext);
  if (!context) {
    throw new Error('useSubmission must be used within a SubmissionProvider');
  }
  return context;
};

export const SubmissionProvider = ({ children }) => {
  const [submissions, setSubmissions] = useState(new Map());

  const startSubmission = useCallback((formId) => {
    const submissionId = `${formId}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    setSubmissions(prev => new Map(prev.set(formId, { id: submissionId, isSubmitting: true })));
    return submissionId;
  }, []);

  const endSubmission = useCallback((formId) => {
    setSubmissions(prev => {
      const newMap = new Map(prev);
      newMap.delete(formId);
      return newMap;
    });
  }, []);

  const isSubmitting = useCallback((formId) => {
    return submissions.has(formId) && submissions.get(formId).isSubmitting;
  }, [submissions]);

  const getSubmissionId = useCallback((formId) => {
    return submissions.get(formId)?.id || null;
  }, [submissions]);

  return (
    <SubmissionContext.Provider value={{
      startSubmission,
      endSubmission,
      isSubmitting,
      getSubmissionId
    }}>
      {children}
    </SubmissionContext.Provider>
  );
};

