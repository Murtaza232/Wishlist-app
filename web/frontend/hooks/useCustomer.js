import { useState, useEffect, useCallback, useContext, useRef } from 'react';
import { useAuthenticatedFetch } from './useAuthenticatedFetch';
import { AppContext } from '../components';

export const useCustomer = (customerId) => {
  const [customer, setCustomer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const isMounted = useRef(true);
  const lastFetchedId = useRef(null);
  
  const fetch = useAuthenticatedFetch();
  const { apiUrl } = useContext(AppContext);

  // Fetch customer data - memoized with useCallback
  const fetchCustomer = useCallback(async (id) => {
    if (!id) return;
    
    // Skip if we're already loading this ID
    if (lastFetchedId.current === id) return;
    
    lastFetchedId.current = id;
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`${apiUrl}customers/${id}`);
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error('Failed to fetch customer: ' + response.status);
      }

      const data = await response.json();
      
      // Only update state if component is still mounted
      if (!isMounted.current) return;
      
      if (data.success) {
        console.log('Customer data from API:', data.data);
        console.log('Customer data keys:', Object.keys(data.data).join(', '));
        console.log('Customer status field:', data.data.state, 'type:', typeof data.data.state);
        setCustomer(data.data);
      } else {
        throw new Error(data.error || 'Failed to fetch customer');
      }
    } catch (err) {
      if (!isMounted.current) return;
      console.error('Error in fetchCustomer:', err);
      setError(err.message);
      setCustomer(null);
    } finally {
      if (isMounted.current) {
        setLoading(false);
      }
    }
  }, [apiUrl, fetch]);

  // Set up effect for fetching data
  useEffect(() => {
    isMounted.current = true;
    
    if (customerId) {
      fetchCustomer(customerId);
    } else {
      setLoading(false);
    }
    
    // Cleanup function
    return () => {
      isMounted.current = false;
    };
  }, [customerId, fetchCustomer]);

  // Function to manually refetch customer data
  const refetch = useCallback(() => {
    if (customerId) {
      lastFetchedId.current = null; // Reset lastFetchedId to force refetch
      return fetchCustomer(customerId);
    }
  }, [customerId, fetchCustomer]);

  return { customer, loading, error, refetch };
};

export default useCustomer;
