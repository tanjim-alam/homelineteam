import { useState, useEffect, useCallback } from 'react';
import apiService from '../services/api';

export const useHeroData = () => {
  const [heroData, setHeroData] = useState({
    mobileBackgroundImages: [],
    desktopBackgroundImages: [],
    categories: [],
    sliderSettings: {
      autoSlide: true,
      slideInterval: 3000,
      transitionDuration: 1000
    }
  });

  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [error, setError] = useState(null);

  const fetchHeroData = useCallback(async (isRefresh = false) => {
    if (isRefresh) {
      setIsRefreshing(true);
    } else {
      setIsLoading(true);
    }

    setError(null);

    try {
      const data = await apiService.getHeroSection();

      if (data && data.success && data.data) {
        setHeroData(data.data);
        setLastUpdated(new Date());
      }
    } catch (error) {
      // Don't set error state to prevent UI crashes
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchHeroData();

    // Set up auto-refresh every 30 seconds to get latest data
    const refreshInterval = setInterval(() => fetchHeroData(true), 30000);

    return () => clearInterval(refreshInterval);
  }, [fetchHeroData]);

  // Listen for focus events to refresh when user returns to tab
  useEffect(() => {
    const handleFocus = () => {
      fetchHeroData(true);
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [fetchHeroData]);

  // Listen for visibility change to refresh when tab becomes visible
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        fetchHeroData(true);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [fetchHeroData]);

  return {
    heroData,
    isLoading,
    isRefreshing,
    lastUpdated,
    error,
    refresh: () => fetchHeroData(true)
  };
};
