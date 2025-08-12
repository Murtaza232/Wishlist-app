import { useState, useEffect, useContext, useCallback, useRef } from 'react';
import { useAuthenticatedFetch } from './useAuthenticatedFetch';
import { AppContext } from '../components';

export const useCustomers = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    current_page: 1,
    last_page: 1,
    per_page: 15,
    total: 0,
  });
  const [stats, setStats] = useState(null);
  
  const fetch = useAuthenticatedFetch();
  const { apiUrl } = useContext(AppContext);
  const isInitialized = useRef(false);

  // Fetch customers with pagination and filters
  const fetchCustomers = useCallback(async (page = 1, search = '', status = '') => {
    console.log('fetchCustomers called with:', { page, search, status });
    setLoading(true);
    setError(null);
    
    try {
      const params = new URLSearchParams({
        page,
        per_page: pagination.per_page,
      });

      if (search) params.append('search', search);
      if (status) params.append('status', status);

      const url = `${apiUrl}customers?${params}`;
      console.log('Fetching customers from:', url);

      const response = await fetch(url);
      console.log('Response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Response error:', errorText);
        throw new Error('Failed to fetch customers: ' + response.status);
      }

      const data = await response.json();
      console.log('Response data:', data);
      
      if (data.success) {
        setCustomers(data.data);
        setPagination(data.pagination);
      } else {
        throw new Error(data.error || 'Failed to fetch customers');
      }
    } catch (err) {
      console.error('Error in fetchCustomers:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [fetch, apiUrl, pagination.per_page]);

  // Fetch customer statistics
  const fetchStats = useCallback(async () => {
    try {
      const url = `${apiUrl}customers/stats`;
      console.log('Fetching stats from:', url);

      const response = await fetch(url);
      console.log('Stats response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Stats response error:', errorText);
        throw new Error('Failed to fetch customer statistics: ' + response.status);
      }

      const data = await response.json();
      console.log('Stats response data:', data);
      
      if (data.success) {
        setStats(data.data);
      } else {
        throw new Error(data.error || 'Failed to fetch customer statistics');
      }
    } catch (err) {
      console.error('Error in fetchStats:', err);
    }
  }, [fetch, apiUrl]);

  // Sync customers from Shopify
  const syncCustomers = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`${apiUrl}customers/sync`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Sync response error:', errorText);
        throw new Error('Failed to sync customers: ' + response.status);
      }

      const data = await response.json();
      console.log('Sync response data:', data);
      
      if (data.success) {
        // Refresh the customers list after sync
        await fetchCustomers(1);
        return data;
      } else {
        throw new Error(data.error || 'Failed to sync customers');
      }
    } catch (err) {
      setError(err.message);
      console.error('Error syncing customers:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetch, apiUrl, fetchCustomers]);

  // Create or update customer
  const saveCustomer = useCallback(async (customerData) => {
    try {
      const method = customerData.id ? 'PUT' : 'POST';
      const url = customerData.id 
        ? `${apiUrl}customers/${customerData.id}`
        : `${apiUrl}customers`;

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(customerData),
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Save customer response error:', errorText);
        throw new Error('Failed to save customer: ' + response.status);
      }

      const data = await response.json();
      
      if (data.success) {
        // Refresh the customers list
        await fetchCustomers(1);
        return data;
      } else {
        throw new Error(data.error || 'Failed to save customer');
      }
    } catch (err) {
      setError(err.message);
      console.error('Error saving customer:', err);
      throw err;
    }
  }, [fetch, apiUrl, fetchCustomers]);

  // Delete customer
  const deleteCustomer = useCallback(async (customerId) => {
    try {
      const response = await fetch(`${apiUrl}customers/${customerId}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Delete customer response error:', errorText);
        throw new Error('Failed to delete customer: ' + response.status);
      }

      const data = await response.json();
      
      if (data.success) {
        // Refresh the customers list
        await fetchCustomers(1);
        return data;
      } else {
        throw new Error(data.error || 'Failed to delete customer');
      }
    } catch (err) {
      setError(err.message);
      console.error('Error deleting customer:', err);
      throw err;
    }
  }, [fetch, apiUrl, fetchCustomers]);

  // Initial data fetch - only run once
  useEffect(() => {
    console.log('useCustomers useEffect triggered', { 
      isInitialized: isInitialized.current, 
      apiUrl, 
      hasApiUrl: !!apiUrl
    });
    
    if (!isInitialized.current && apiUrl) {
      console.log('Initializing customers hook - fetching data');
      isInitialized.current = true;
      fetchCustomers();
      fetchStats();
    }
  }, [apiUrl]); // Only depend on apiUrl

  return {
    customers,
    loading,
    error,
    pagination,
    stats,
    fetchCustomers,
    fetchStats,
    syncCustomers,
    saveCustomer,
    deleteCustomer,
    setError,
  };
}; 