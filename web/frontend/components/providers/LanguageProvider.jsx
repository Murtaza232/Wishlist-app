import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuthenticatedFetch } from '../../hooks/useAuthenticatedFetch';
import { useAppBridge } from "@shopify/app-bridge-react";
import { getSessionToken } from "@shopify/app-bridge-utils";
import { AppContext } from "../index";

const LanguageContext = createContext();

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

export const LanguageProvider = ({ children }) => {
  const { apiUrl } = useContext(AppContext);
  const appBridge = useAppBridge();
  const fetch = useAuthenticatedFetch();

  const [currentLanguage, setCurrentLanguage] = useState('English');
  const [languageData, setLanguageData] = useState({});
  const [availableLanguages, setAvailableLanguages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Default language data structure
  const defaultLanguageData = {
    English: {
      'Sidebar Tabs': {
        'Configuration': 'Configuration',
        'Settings': 'Settings',
        'Customers': 'Customers'
      },
      Dashboard: {
        'Dashboard': 'Dashboard',
        'Active Wishlist Widget': 'Active Wishlist Widget',
        'Text active wishlist widget': 'To ensure full functionality, please enable Wishlist Configurations in the App Embeds section of your Shopify theme.',
        'Button text activate wishlist widget': 'Activate',
        'Wishlist Highlights': 'Wishlist Highlights',
        'Total Wishlist Products': 'Total Wishlist Products',
        'Total Lists': 'Total Lists',
        'Setup Guide': 'Setup Guide',
        'completed': 'completed',
        'Smart Notifications Alerts': 'Smart Notifications Alerts',
        'Set up automated email notifications for new reviews': 'Set up automated email notifications for new reviews',
        'Button Text smart notification alerts': 'Configure Alerts',
        'Widget Personalization': 'Widget Personalization',
        'Paragraph Widget Personalization': 'Choose widgets and match their design to your store',
        'Button Text Widget Personalization': 'Customize Widget',
        'Localize': 'Localize',
        'Paragraph Localize': 'Edit or translate all review-related text with ease',
        'Button Text Localize': 'Edit Text',
        'Much more than a Wishlist': 'Much more than a Wishlist',
        'subtitle much more than wishlist': 'Engage shoppers throughout their journey—from browsing to buying',
        'tabs why it matters': 'Why it matters',
        'Capture Intent': 'Capture Intent',
        'Capture Intent 1st tab Title': 'Add Favorites to Wishlist',
        'Capture Intent 1st tab 1st paragraph': "Makes it easy for shoppers to revisit products they love, increasing return visits and purchase likelihood.",
        'Capture Intent 1st tab 2nd Paragraph': "Sew Trendy saw 187% increase in conversion rates for customers who add to wishlist",
        'Capture Intent 2nd tab Title': "Save for Later from Cart",
        'Capture Intent 2nd tab 1st paragraph': "Keep products handy for future purchase, while reducing cart deletes and helping you identify hesitant buyers.",
        'Capture Intent 2nd tab 2nd paragraph': "Willow Boutique recovered ~15% of cart deletes and got 100x ROI on Wishlist alerts.",
        'Capture Identity': 'Capture Identity',
        'Capture Identity 1st tab Title': "Subscribe to Out-of-Stock Items",
        'Capture Identity 1st tab 1st paragraph': "Prevents frustration from unavailable products, ensures they don't miss out, and helps you recover lost sales.",
        'Capture Identity 1st tab 2nd paragraph': "Tibi saw customers 4x more likely to convert via back-in-stock alerts",
        'Capture Identity 2nd tab Title': "Save & Share Wishlist",
        'Capture Identity 2nd tab 1st paragraph': "Keeps shoppers engaged with personalized reminders and shared wishlists, increasing repeat visits and conversions.Gives shoppers access to their Wishlists across devices and visits, while converting anonymous visitors into identified customers.",
        'Capture Identity 2nd tab 2nd paragraph': "Credo Beauty increased social engagement and conversions using shared wishlists",
        'Engage & Convert': 'Engage & Convert',
        'Engage & Convert 1st tab Title': "Wishlist Reminder Alerts",
        'Engage & Convert 1st tab 1st paragraph': "Brings shoppers back to their saved items, reducing drop-offs and increasing conversions.",
        'Engage & Convert 1st tab 2nd paragraph': "White Oak Pastures saw 4x more conversions & 10% higher AOV through wishlists",
        'Engage & Convert 2nd tab Title': "Price Drop Alerts",
        'Engage & Convert 2nd tab 1st paragraph': "Informs them of savings on items they already want, while increasing the likelihood of conversion.",
        'Engage & Convert 2nd tab 2nd paragraph': "Brighton boosted AOV and LTV with price drop notifications",
        'Engage & Convert 3rd tab Title': "Low Stock Alerts",
        'Engage & Convert 3rd tab 1st paragraph': "Helps shoppers avoid missing out on their favorites, while creating a sense of urgency.",
        'Engage & Convert 3rd tab 2nd paragraph': "Cirque Colors drove urgency and conversions using low stock alerts",
        'Retain & Re-Engage': 'Retain & Re-Engage',
        'Retain & Re-Engage 1st tab Title': "Personalized Campaigns",
        'Retain & Re-Engage 1st tab 1st paragraph': "Increases customer retention with hyper-targeted campaigns for high-intent shoppers based on their wishlist and browsing activity.",
        'Retain & Re-Engage 1st tab 2nd paragraph': "Block Zone's AOV rose 35% with Klaviyo wishlist campaigns",
        'Retain & Re-Engage 2nd tab Title': "Win Your Wishlist Contest",
        'Retain & Re-Engage 2nd tab 1st paragraph': "Shoppers enjoy the excitement of winning their favorite products, while boosting engagement, social sharing, and conversions.",
        'Retain & Re-Engage 2nd tab 2nd paragraph': "POPFLEX added 90K customers via wishlist-based giveaway campaign",
        'Retain & Re-Engage 3rd tab Title': "Omnichannel Experience",
        'Retain & Re-Engage 3rd tab 1st paragraph': "Blurs the lines between online & in-store shopping experiences, helping sales associates personalize based on customer preferences.",
        'Retain & Re-Engage 3rd tab 2nd paragraph': "Bombshell Sportswear saw a 73% wishlist revenue increase using Tapcart",
      },
      Settings: {
        'Settings': 'Settings',
        'Settings subtitle': 'Manage your app preferences and configurations',
        'Notifications': 'Notifications',
        'Notifications subtitle': 'Send post-fulfillment emails and reward reviews with unique coupon codes.',
        'Language Settings': 'Language Settings',
        'Language Settings subtitle': 'Customize front-end language content.',
        'Integerations': 'Integrations',
        'Language Settings Text': 'When altering the language of your entire store, the Wishlist app offers comprehensive flexibility to modify the language of the all section, encompassing the Tab, Button',
        'Integrations subtitle': 'View and manage connected apps.',
        'Installtions': 'Installation',
        'installation subtitle': 'Follow steps to install the Wishlist app.',
      },
      Installation: {
        'Installation instructions': 'Installation instructions',
        'Follow the steps below to install': 'Follow the steps below to install the Wishlist Widget app on your Shopify store.',
        'Contact Us': 'Contact Us',
        'Paragraph Contact Us': 'If you don\'t have any knowledge of coding then please Contact Us through Live Chat or Create a Support Ticket.',
        'Contact Support': 'Contact Support',
        'Theme Extension Tab': 'Theme Extension',
        'Expert Setup Tab': 'Expert Setup',
        'Manual Install Tab': 'Manual install',
        'Current theme status': 'Current theme status',
        'Select Theme': 'Select Theme',
        'Current (Published) theme app embed status': 'Current (Published) theme app embed status',
        'App embed Status': 'App embed Status',
        'Enable': 'Enable',
        'Disable': 'Disable',
        'Enable Wishlist app embed': 'Enable Wishlist app embed',
        'Enable the Wishlist Configurations': 'Enable the Wishlist Configurations from App embeds in Theme settings by going to Shopify Theme Customization.',
        'Activate Button': 'Activate',
        'Add Wishlist block': 'Add Wishlist block',
        'Add app block Text': 'Add the app block to display wishlist functionality on your selected theme. Customize the block positions to achieve the perfect placement according to your preferences.',
        'Wishlist Widget Near Cart Button': 'Wishlist Widget Near Cart Button',
        'Add Wishlist Widget Cart Button Text': "To add a Wishlist Widget, go to Shopify's theme customization section and click on Add block.",
        'Button Text Wishlist Widget Near Cart Button': 'Wishlist Widget Near Cart Button',
        'Wishlist Widget On Product Image': 'Wishlist Widget On Product Image',
        'Button text Wishlist Widget On Product Image': 'Wishlist Widget On Product Image',
        'Text Wishlist Widget product image': "Go to Shopify's theme customization section and click on Add block to add the Wishlist Widget On Product Image",
        'Wishlist Widget Collection page': 'Wishlist Widget On Collections Page',
        'Button text Wishlist Widget Collection page': 'Wishlist Widget On Collections Page',
        'Text Wishlist Widget Collection page': "In Shopify's theme customization, click Add block to add the Wishlist Widget On Collections Page.",
        'My Wishlist Section': 'My Wishlist Section',
        'Button text My Wishlist Section': 'My Wishlist Section',
        'Text My Wishlist Section': "To add a My Wishlist Section, navigate to Shopify's theme customization page and click on Add block to add the My Wishlist Section and view your Wislist items.",
        'Loading...': 'Loading...',
        'Content for': 'Content for',
        'will be implemented here.': 'will be implemented here.',
      },
      Notifications: {
        'Notifications': 'Notifications',
        'Notifications Subtitle': 'Notifications are automatically sent out.',
        'Alerts and Notifications': 'Alerts and Notifications',
        'Days': 'Days',
        'Hours': 'Hours',
        'Sign up confirmation': 'Sign up confirmation',
        'Send a confirmation': 'Send a confirmation when shoppers save their wishlist',
        'Wishlist Shared': 'Wishlist Shared',
        'Send a alert when shoppers share their wishlist': 'Send a alert when shoppers share their wishlist with others',
        'Wishlist Reminder': 'Wishlist Reminder',
        'Send reminders for wishlist ': 'Send reminders for wishlisted items after',
        'Send reminders on items saved for later': 'Send reminders on items saved for later',
        'Send reminders for items saved for later after': 'Send reminders for items saved for later after',
        'Send low stock alerts': 'Send low stock alerts',
        'Send an alert when stock drops below': 'Send an alert when stock drops below',
        'units': 'units',
        'Send Price Drop alert': 'Send Price Drop alert',
        'Send an alert when price drops by': 'Send an alert when price drops by',
        'Send back in stock alerts': 'Send back in stock alerts',
        'Send an alert when wislisted items are back in stock': 'Send an alert when wislisted items are back in stock',
      }
    }
  };

  // Load languages from backend
  const loadLanguages = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const token = await getSessionToken(appBridge);
      if (!token) {
        throw new Error('No authentication token available');
      }

      const response = await fetch(`${apiUrl}languages`, {
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch languages');
      }

      const data = await response.json();
      
      if (data.status && data.data) {
        const languages = data.data.languages || [];
        const activeLanguage = data.data.active_language;
        
        // Set available languages
        setAvailableLanguages(languages.map(lang => lang.language_name));
        
        // Set current language
        if (activeLanguage) {
          setCurrentLanguage(activeLanguage.language_name);
          setLanguageData(activeLanguage.language_data || defaultLanguageData[activeLanguage.language_name] || defaultLanguageData.English);
        } else {
          setCurrentLanguage('English');
          setLanguageData(defaultLanguageData.English);
        }
      } else {
        // Fallback to default English
        setCurrentLanguage('English');
        setLanguageData(defaultLanguageData.English);
        setAvailableLanguages(['English']);
      }
    } catch (err) {
      console.error('Error loading languages:', err);
      setError(err.message);
      // Fallback to default English
      setCurrentLanguage('English');
      setLanguageData(defaultLanguageData.English);
      setAvailableLanguages(['English']);
    } finally {
      setLoading(false);
    }
  }, [apiUrl, appBridge]);

  // Get translation for a specific key
  const t = useCallback((key, section = 'Dashboard') => {
    if (!languageData || !languageData[section]) {
      return key; // Return the key if translation not found
    }
    
    return languageData[section][key] || key;
  }, [languageData]);

  // Change language
  const changeLanguage = useCallback(async (languageName) => {
    try {
      setLoading(true);
      setError(null);
      
      const token = await getSessionToken(appBridge);
      if (!token) {
        throw new Error('No authentication token available');
      }

      const response = await fetch(`${apiUrl}languages/set-active`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({
          language_name: languageName
        }),
      });

      const data = await response.json();
      
      if (data.status) {
        setCurrentLanguage(languageName);
        
        if (data.data && data.data.exists_in_db && data.data.language_data) {
          setLanguageData(data.data.language_data);
        } else {
          // Use default data for this language
          setLanguageData(defaultLanguageData[languageName] || defaultLanguageData.English);
        }
        
        return true;
      } else {
        throw new Error(data.message || 'Failed to change language');
      }
    } catch (err) {
      console.error('Error changing language:', err);
      setError(err.message);
      return false;
    } finally {
      setLoading(false);
    }
  }, [apiUrl, appBridge]);

  // Load languages on mount only
  useEffect(() => {
    loadLanguages();
  }, []); // Empty dependency array to run only once on mount

  const value = {
    currentLanguage,
    languageData,
    availableLanguages,
    loading,
    error,
    t,
    changeLanguage,
    loadLanguages
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}; 