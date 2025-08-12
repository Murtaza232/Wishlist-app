import { useState, useCallback, useContext } from 'react';
import { useAuthenticatedFetch } from './useAuthenticatedFetch';
import { AppContext } from '../components';

export const useWishlist = () => {
  const [wishlistItems, setWishlistItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const fetch = useAuthenticatedFetch();
  const { apiUrl } = useContext(AppContext);

  const fetchWishlist = useCallback(async (customerId) => {
    // Ensure customerId is a string or number
    const id = customerId?.toString ? customerId.toString() : '';
    if (!id) {
      setWishlistItems([]);
      return [];
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`${apiUrl}wishlist/products?customer_id=${id}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch wishlist items');
      }

      const data = await response.json();
      
      if (data.products) {
        // Transform the data to match our UI structure
        const formattedItems = data.products.map(item => ({
          id: item.id.split('/').pop(), // Extract product ID from GID
          name: item.title,
          handle: item.handle,
          price: item.variants?.edges[0]?.node?.price || '0',
          image: item.images?.edges[0]?.node?.src || 'https://via.placeholder.com/80',
          addedDate: new Date().toISOString().split('T')[0] // Default to today, adjust as needed
        }));
        
        setWishlistItems(formattedItems);
        return formattedItems;
      }
      return [];
    } catch (err) {
      console.error('Error in fetchWishlist:', err);
      setError(err.message);
      return [];
    } finally {
      setLoading(false);
    }
  }, [fetch, apiUrl]);

  // Function to manually refetch wishlist items
  const refetch = useCallback(async (customerId) => {
    return fetchWishlist(customerId);
  }, [fetchWishlist]);

  return { 
    wishlistItems, 
    loading, 
    error, 
    refetch 
  };
};

export default useWishlist;
