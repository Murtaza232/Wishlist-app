import { useState, useEffect, useCallback, useContext, useRef } from 'react';
import { useAuthenticatedFetch } from './useAuthenticatedFetch';
import { AppContext } from '../components';

export const useShop = (shopId) => {
  const [shop, setShop] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const lastFetchedId = useRef(null);
  const isMounted = useRef(true);
  
  const fetch = useAuthenticatedFetch();
  const { apiUrl } = useContext(AppContext);

  const fetchShop = useCallback(async (id, force = false) => {
    // Skip if we're already loading this ID or no ID provided
    if (!id || (!force && lastFetchedId.current === id)) return;
    
    lastFetchedId.current = id;
    setLoading(true);
    setError(null);
    
    try {
      console.log('Fetching shop data from:', `${apiUrl}shop`);
      const response = await fetch(`${apiUrl}shop`);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Shop API error response:', errorText);
        throw new Error(`Failed to fetch shop data: ${response.status} ${response.statusText}`);
      }

      // First, get the response as text
      const responseText = await response.text();
      console.log('Raw shop API response:', responseText);
      
      // The API returns the shop domain as a plain string
      if (typeof responseText === 'string' && responseText.includes('myshopify.com')) {
        const shopData = { 
          myshopify_domain: responseText,
          domain: responseText,
          name: responseText.replace('.myshopify.com', '')
        };
        
        // Only update state if component is still mounted
        if (isMounted.current) {
          setShop(shopData);
        }
        
        return shopData;
      }
      
      // If we get here, the response wasn't in the expected format
      throw new Error('Unexpected shop data format: ' + responseText.substring(0, 100));
    } catch (err) {
      console.error('Error in fetchShop:', err);
      if (isMounted.current) {
        setError(err.message);
      }
      return null;
    } finally {
      if (isMounted.current) {
        setLoading(false);
      }
    }
  }, [apiUrl, fetch]);

  useEffect(() => {
    isMounted.current = true;
    
    if (shopId) {
      fetchShop(shopId);
    }
    
    // Cleanup function
    return () => {
      isMounted.current = false;
    };
  }, [shopId, fetchShop]);

  // Memoize the refetch function to prevent unnecessary re-renders
  const refetch = useCallback(() => {
    if (shopId) {
      return fetchShop(shopId, true);
    }
    return Promise.resolve(null);
  }, [shopId, fetchShop]);

  return { shop, loading, error, refetch };
};

export default useShop;
