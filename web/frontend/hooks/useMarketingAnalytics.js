import { useState, useEffect, useCallback, useContext } from 'react';
import { useAuthenticatedFetch } from './useAuthenticatedFetch';
import { AppContext } from '../components/providers/ContextProvider';

export const useMarketingAnalytics = () => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dateRange, setDateRange] = useState({
    start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
    end: new Date()
  });

  const { apiUrl } = useContext(AppContext);
  const fetch = useAuthenticatedFetch();

  const fetchMarketingAnalytics = useCallback(async (startDate = null, endDate = null) => {
    try {
      setLoading(true);
      setError(null);

      const start = startDate || dateRange.start;
      const end = endDate || dateRange.end;

      const startDateStr = start.toISOString().split('T')[0];
      const endDateStr = end.toISOString().split('T')[0];

      const response = await fetch(`${apiUrl}marketing-analytics?start_date=${startDateStr}&end_date=${endDateStr}`);
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to fetch marketing analytics: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      
      if (data.success) {
        setAnalytics(data.data);
        setDateRange({ start, end });
      } else {
        throw new Error(data.message || 'Failed to fetch marketing analytics');
      }
    } catch (err) {
      console.error('Error fetching marketing analytics:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [fetch, dateRange, apiUrl]);

  const updateDateRange = useCallback((start, end) => {
    fetchMarketingAnalytics(start, end);
  }, [fetchMarketingAnalytics]);

  // Fetch data on mount
  useEffect(() => {
    fetchMarketingAnalytics();
  }, []);

  return {
    analytics,
    loading,
    error,
    dateRange,
    fetchMarketingAnalytics,
    updateDateRange,
    refetch: () => fetchMarketingAnalytics()
  };
};

