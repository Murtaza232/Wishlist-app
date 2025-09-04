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
        'Customers': 'Customers',
        'Marketing': 'Marketing',
        'Pricing Plans': 'Pricing Plans',
      },
      'Pricing Plans': {
        'Pricing Plan': 'Pricing Plan',
        'Pricing Plan subtitle': 'Choose the plan that fits your needs. You can switch anytime.',
        // 'Pricing Plan button': 'Choose Plan',
        'Banner':"To purchase a paid plan, you must have permission to approve payments on your e-commerce storefront.",
        'Monthly':'Monthly',
        'Annual':'Annual',
        'Current Plan':'Current Plan',
        'Custom Pricing':'Custom Pricing',
        'All Plans':'All Plans',
        'New businesses':'New businesses',
        'Mid-to-large stores':'Mid-to-large stores',
        'Large-scale stores':'Large-scale stores',
        'View plans and find your best match':'View plans and find your best match',
        'Free':'Free',
        'Pro':'Pro',
        'Premium':'Premium',
        'Capture Shopper Intent':'Capture Shopper Intent',
        'Add to Wishlist':'Add to Wishlist',
        'View Customer Wishlists':'View Customer Wishlists',
        'Collections & Quick View Support':'Collections & Quick View Support',
        'Email Opt-Ins':'Email Opt-Ins',
        'Nudge Shoppers back to your Store':'Nudge Shoppers back to your Store',
        'Share Wishlist':'Share Wishlist',
        'Automated Alerts':'Automated Alerts',
        'Tailoring Shopper Experience':'Tailoring Shopper Experience',
        'REST & JavaScript API Customization':'REST & JavaScript API Customization',
        'Support':'Support',
        'Lifetime Wishlist Actions':'Lifetime Wishlist Actions',
        "For stores exploring a basic Wishlist. Limited features & usage.":"For stores exploring a basic Wishlist. Limited features & usage.",
        "Best Match":"Best Match",
        "A fully featured wishlist. Highly configurable. Maximum engagement":"A fully featured wishlist. Highly configurable. Maximum engagement",
        "For large brands needing API access to further tailor their Wishlist experience":"For large brands needing API access to further tailor their Wishlist experience",
        "500 lifetime wishlist actions":"500 lifetime wishlist actions",
        "10,000 wishlist actions per month":"10,000 wishlist actions per month",
        "25,000 wishlist actions per month":"25,000 wishlist actions per month",
        "Wishlist on Product Page, Collections & Cart":"Wishlist on Product Page, Collections & Cart",
        "Wishlist in Customer Accounts":"Wishlist in Customer Accounts",
        "Share Wishlist via Social Media":"Share Wishlist via Social Media",
        'Everything in Free, plus:':'Everything in Free, plus:',
        'Everything in Pro, plus:':'Everything in Pro, plus:',
        'Basic Wishlist Features':'Basic Wishlist Features',
        "Advanced Integrations (e.g. Meta Pixel)":"Advanced Integrations (e.g. Meta Pixel)",
        "Shopify Markets Support (Coming Soon)":"Shopify Markets Support (Coming Soon)",
        "Advanced Setup & Configuration Flexibility":"Advanced Setup & Configuration Flexibility",
        "REST & Javascript APIs access":"REST & Javascript APIs access",
        "Start Free": "Start Free",
        "Start Pro": "Start Pro",
        "Start Premium": "Start Premium",
      },
      'Marketing': {
        'Marketing and Automations': 'Marketing and Automations',
        'enabling' : 'Enabling...',
        'disabling' : 'Disabling...',
        'Marketing subtitle': 'Boost sales with automated marketing campaigns',
        'has been connected as your marketing integration for Email': 'has been connected as your marketing integration for Email',
        'Turn visitors into buyers': 'Turn visitors into buyers',
        'Boost sales with': 'Boost sales with',
        'Last synced': 'Last synced',
        'No marketing integration connected': 'No marketing integration connected',
        'marketing automations by re-engaging shoppers who show intent but leave without buying, using personalized product recommendations.': 'marketing automations by re-engaging shoppers who show intent but leave without buying, using personalized product recommendations.',
        'Your': 'Your',
        'campaign is now live!': 'campaign is now live!',
        'shoppers': 'shoppers',
        'Follow These Steps': 'Follow These Steps',
        'wishlisted value': 'wishlisted value',
        'You can monitor performance and see more details.': 'You can monitor performance and see more details.',
        'View Performance': 'View Performance',
        'in potential revenue is slipping away': 'in potential revenue is slipping away',
        'from': 'from',
        'wishlisted products that': 'wishlisted products that',
        'high-intent shoppers haven\'t purchased yet.': 'high-intent shoppers haven\'t purchased yet.',
        'Launch a gifting campaign': 'Launch a gifting campaign for Mother\'s Day, Graduation, Back to School, and more',
        'Win Your Wishlist Campaign': 'Win Your Wishlist Campaign',
        'Gamify engagement': 'Gamify engagement by letting shoppers create a wishlist for a chance to win it free in a site-wide giveaway',
        'more signups': 'more signups',
        'more wishlist activity': 'more wishlist activity',
        'revenue growth': 'revenue growth',
        'Setup Campaign': 'Setup Campaign',
        'Shopper Segments': 'Shopper Segments',
        'Predesigned shopper segments': 'Predesigned shopper segments based on Wishlisted and Saved for Later activity. Use them to run personalized campaigns.',
        'Shoppers who wishlisted and saved the products but': 'Shoppers who wishlisted and saved the products but',
        'haven\'t bought yet': 'haven\'t bought yet',
        'Shoppers whose wishlisted and saved products are': 'Shoppers whose wishlisted and saved products are',
        'currently on sale': 'currently on sale',
        'Shoppers whose wishlisted and saved products are': 'Shoppers whose wishlisted and saved products are',
        'selling out fast': 'selling out fast',
        'Shoppers whose wishlisted and saved products are': 'Shoppers whose wishlisted and saved products are',
        'back in stock': 'back in stock',
        'Shoppers whose wishlisted products are': 'Shoppers whose wishlisted products are',
        'frequently wishlisted by others': 'frequently wishlisted by others',
        'Increase cart additions by promoting trending wishlist items': 'Increase cart additions by promoting trending wishlist items',
        'Recent Marketing Activity': 'Recent Marketing Activity',
        'Get a quick review of how your campaigns and automations are performing here.': 'Get a quick review of how your campaigns and automations are performing here.',
        'Title': 'Title',
        'Status': 'Status',
        'Schedule Time': 'Schedule Time',
        'Last Updated': 'Last Updated',
        'Off': 'Off',
        'Live': 'Live',
        'View Details': 'View Details',
        'Add basic details': 'Add basic details',
        'Win Your Wishlist': 'Win Your Wishlist',
        'Campaign Duration': 'Campaign Duration',
        'We recommend running campaign for 1 month': 'We recommend running campaign for 1 month',
        'Total number of winners': 'Total number of winners',
        'Voucher amount for each winner': 'Voucher amount for each winner',
        'Save': 'Save',
        'Total signups': 'Total signups',
        'Wishlisted shoppers': 'Wishlisted shoppers',
        'Total wishlist actions': 'Total wishlist actions',
        'Wishlist value': 'Wishlist value',
        'Next Step': 'Next Step 👇',
        'Download participant data': 'Download participant data',
        'Download CSV': 'Download CSV',
        'Get a CSV file with details on participant activity, including wishlist engagement.': 'Get a CSV file with details on participant activity, including wishlist engagement.',
        'Campaign performance': 'Campaign performance',
        'Only includes data from the period when the campaign is live': 'Only includes data from the period when the campaign is live',
        'Enable floating widget': 'Enable floating widget',
        'Boost campaign visibility with a floating widget': 'Boost campaign visibility with a floating widget',
        'Get more shoppers to sign up and wishlist products by enabling our ready-to-use Win Your Wishlist floating widget. You can control the look and feel on the theme editor.': 'Get more shoppers to sign up and wishlist products by enabling our ready-to-use Win Your Wishlist floating widget. You can control the look and feel on the theme editor.',
        'The widget will automatically appear on your store during': 'The widget will automatically appear on your store during',
        'Enable on theme editor ↗': 'Enable on theme editor ↗',
        'Setup landing page': 'Setup landing page',
        'Enter our competition to Win your most-loved items. Prizes crowned for you!': 'Enter our competition to Win your most-loved items. Prizes crowned for you!',
        'UP TO': 'UP TO',
        'WORTH OF GIFT VOUCHER': 'WORTH OF GIFT VOUCHER',
        'Step 1: Login or create account on your store.': 'Step 1: Login or create account on your store.',
        'Step 2: Add to your wishlist by clicking the heart symbol.': 'Step 2: Add to your wishlist by clicking the heart symbol.',
        'Step 3: Click on wishlist then see your voucher. Track the locker and draw later.': 'Step 3: Click on wishlist then see your voucher. Track the locker and draw later.',
        'Step 4: Share your list to your friends/family/social media to increase entry in the competition.': 'Step 4: Share your list to your friends/family/social media to increase entry in the competition.',
        'T&C apply*': 'T&C apply*',
        'The competition runs from': 'The competition runs from',
        'offering a chance to win your wishlist up to $500. The winner will be contacted exclusively by the store.': 'offering a chance to win your wishlist up to $500. The winner will be contacted exclusively by the store.',
        'Promote your contest effectively with a landing page': 'Promote your contest effectively with a landing page',
        'Create a dedicated landing page to share contest details with your shoppers – what the contest is about, how to enter, when it ends, and what they could win.': 'Create a dedicated landing page to share contest details with your shoppers – what the contest is about, how to enter, when it ends, and what they could win.',
        "Wishlist Reminder": "Wishlist Reminder",
        "has been connected as your marketing integration for": "has been connected as your marketing integration for",
        "Email": "Email",
        "Step 1: Setup Configuration": "Step 1: Setup Configuration",
        "Smart Send": "Smart Send – If a shopper adds products to the wishlist, send a reminder",
        "Save Settings": "Save Settings",
        "Step 2: Review Email Content": "Step 2: Review Email Content",
        "If a shopper adds products to Wishlist, then send reminder": "If a shopper adds products to Wishlist, then send reminder",
        "Use this pre-designed template": "Use this pre-designed template to engage wishlist shoppers and deliver deals. Please contact us to customize this email according to your needs.",
        "Send Test Email": "Send Test Email",
        "Recipient email": "Recipient Email",
        "Live": "Live",
        "Off": "Off",
        "Send": "Send",
        "Cancel": "Cancel",
        'Turn Off Alert': 'Turn Off Alert',
        'Turn On Alert': 'Turn On Alert',
        'Price Drop Alert': 'Price Drop Alert',
        "Send an alert when a wishlisted product's price drops by": "Send an alert when a wishlisted product's price drops by",
        'Back in Stock Alert': 'Back in Stock Alert',
        'Send an alert when wishlisted items are back in stock.': 'Send an alert when wishlisted items are back in stock.',
        'Low Stock Alert': 'Low Stock Alert',
        "Send an alert when a product's inventory level falls below": "Send an alert when a product's inventory level falls below",
        'Saved for Later Reminder': 'Saved for Later Reminder',
        'days after an item is saved for later': 'days after an item is saved for later',
        'Send a reminder': 'Send a reminder',
        'Email Description': 'This email will be sent to customers who have saved items for later. The email includes:',
        'A friendly reminder about their saved items': 'A friendly reminder about their saved items',
        'Product images and details': 'Product images and details',
        'Direct links back to their saved items': 'Direct links back to their saved items',
        'A clear call-to-action to complete their purchase': 'A clear call-to-action to complete their purchase',
        'Test Email Description': 'A test email will be sent to this address with sample saved items.',

      },
      'Customers': {
        'View your store customers': 'View your store customers',
        'Syncing...': 'Syncing...',
        'Sync from Shopify': 'Sync from Shopify',
        'Search by name or email': 'Search by name or email',
        'Filter': 'Filter',
        'Status': 'Status',
        'Total Customers': 'Total Customers',
        'Active Customers': 'Active Customers',
        'Total Revenue': 'Total Revenue',
        'All Statuses': 'All Statuses',
        'Active': 'Active',
        'Inactive': 'Inactive',
        'Disabled': 'Disabled',
        'Clear': 'Clear',
        'Search': 'Search',
        'How to fix this:': 'How to fix this:',
        'Make sure you\'re accessing this app from within Shopify': 'Make sure you\'re accessing this app from within Shopify',
        'Ensure your app is properly installed and authenticated': 'Ensure your app is properly installed and authenticated',
        'Try refreshing the page or re-installing the app': 'Try refreshing the page or re-installing the app',
        'Contact support if the issue persists': 'Contact support if the issue persists',
        'Dismiss': 'Dismiss',
        'Customer': 'Customer',
        'Location': 'Location',
        'Spent': 'Spent',
        'Orders': 'Orders',
        'Actions': 'Actions',
        'Loading customers...': 'Loading customers...',
        'No customers found matching your criteria.': 'No customers found matching your criteria.',
        'No customers found. Sync from Shopify to get started.': 'No customers found. Sync from Shopify to get started.',
        'Unknown': 'Unknown',
        'Previous': 'Previous',
        'Next': 'Next',
        'Showing': 'Showing',
        'to': 'to',
        'of': 'of',
        'results': 'results',
      },
      'Customer Details': {
        'Customer Details': 'Customer Details',
        'Customer Details subtitle': 'View Customer Detials with customer wislisted items',
        'Refresh Wishlists': 'Refresh Wishlists',
        'Refreshing...': 'Refreshing...',
        'Total Spent': 'Total Spent',
        'Total Wishlist Items': 'Total Wishlist Items',
        'Member Since': 'Member Since',
        'Wishlist Items': 'Wishlist Items',
        'Email': 'Email',
        'Phone': 'Phone',
        'Location': 'Location',
        'No Name': 'No Name',
        'No email': 'No email',
        'Added on': 'Added on',
        'N/A': 'N/A',
        'No location': 'No location',
        'Customer Information': 'Customer Information',
        'Customer not found': 'Customer not found',
        'Loading wishlist items...': 'Loading wishlist items...',
        'No wishlist items.': 'No wishlist items found.',
        'No Wishlist items desc': "This customer hasn't added any items to their wishlist yet.",
        'Error loading wishlist:': 'Error loading wishlist:',
        'Error loading customer:': 'Error loading customer:',
        'Back to Customers': 'Back to Customers',
        'Refresh': 'Refresh',
        'View Product': 'View Product',
        'Active': 'Active',
        'Inactive': 'Inactive',
        'Disabled': 'Disabled',
      },
      Dashboard: {
        'Dashboard': 'Welcome to Wishlist app',
        'Active Wishlist Widget': 'Active Wishlist Widget',
        'Text active wishlist widget': 'To ensure full functionality, please enable Wishlist Configurations in the App Embeds section of your Shopify theme.',
        'Button text activate wishlist widget': 'Click here to activate',
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
        'Quick Select': 'Quick Select',
        'Today': 'Today',
        'Yesterday': 'Yesterday',
        'Last 7 Days': 'Last 7 Days',
        'Last 30 Days': 'Last 30 Days',
        'This Month': 'This Month',
        'Last Month': 'Last Month',
        'Start Date': 'Start Date',
        'End Date': 'End Date',
        'Cancel': 'Cancel',
        'Apply': 'Apply'
      },
      Configurations: {
        'Configurations': 'Configurations',
        'Subtitle Configurations': 'Customize button styles, colors, icons, and wishlist behavior. Adjust how wishlists appear, set up collection and cart options, and preview changes instantly. All changes apply to your storefront.',
        'Basics': 'Basics',
        'Colors': 'Colors',
        'Primary color': 'Primary color',
        'Secondary color': 'Secondary color',
        'Icons': 'Icons',
        'Heart': 'Heart',
        'Star': 'Star',
        'Bookmark': 'Bookmark',
        'Button size': 'Button size',
        'Icon thickness': 'Icon thickness',
        'Product page': 'Product page',
        'Button Position': 'Button Position',
        'Near cart button': 'Near cart button',
        'On product image': 'On product image',
        'Above Cart Button': 'Above Cart Button',
        'Below Cart Button': 'Below Cart Button',
        'Left of Cart Button': 'Left of Cart Button',
        'Right of Cart Button': 'Right of Cart Button',
        'Top Left': 'Top Left',
        'Top Right': 'Top Right',
        'Bottom Left': 'Bottom Left',
        'Bottom Right': 'Bottom Right',
        'Button Type': 'Button Type',
        'Button Style': 'Button Style',
        'Only Icon': 'Only Icon',
        'Only Text': 'Only Text',
        'Icon and Text': 'Icon and Text',
        'Solid': "Solid",
        'Outline': "Outline",
        'Plain': "Plain",
        'Button text': 'Button text',
        'Before Click': 'Before Click',
        'After Click': 'After Click',
        'Label': 'Label',
        'Add To Wishlist': 'Add to Wishlist',
        'Added To Wishlist': 'Added to Wishlist',
        'Other Settings': 'Other Settings',
        'Smart Save': 'Smart-Save: Auto-wishlist products visited thrice or more by the shopper',
        'Social Proof': 'Social Proof: Show the number of people who have added the product to their wishlist',
        'Collections': 'Collections',
        'Add item to wishlist from collection page': 'Enable shoppers to add items to wishlist from Collections pages',
        'Button Position': 'Button Position',
        'Top Left': 'Top Left',
        'Top Right': 'Top Right',
        'Bottom Left': 'Bottom Left',
        'Bottom Right': 'Bottom Right',
        'Wishlist Page': 'Wishlist Page',
        'Text Color': 'Text Color',
        'Type': 'Type',
        'Side Drawer': 'Side Drawer',
        'Separate Page': 'Separate Page',
        'Pop-up Modal': 'Pop-up Modal',
        'Page Title': 'Page Title',
        'Launch From': 'Launch From',
        'Header': 'Header',
        'Floating Button': 'Floating Button',
        'Navigation Menu': 'Navigation Menu',
        'Position': 'Position',
        'Left': 'Left',
        'Right': 'Right',
        'Button Left': 'Button Left',
        'Button Right': 'Button Right',
        'Corner Radius': 'Corner Radius',
        'This needs to be set up manually': 'This needs to be set up manually',
        'Show Count': 'Show Count',
        'Other Settings': 'Other Settings',
        'Allow shoppers to Share Wishlist': 'Allow shoppers to Share Wishlist',
        'Cart': 'Cart',
        'Save for later pop-up': 'Save for later pop-up',
        'Allow shoppers to save items': 'Allow shoppers to save items before removing from cart',
        'Pop-up title': 'Pop-up title',
        'Primary button text': 'Primary button text',
        'Secondary button text': 'Secondary button text',
        'Permission': 'Permission',
        'Allow shoppers to save items': 'Allow shoppers to save items before removing from cart',
        'Ask the shopper if they want to see the pop-up again': 'Ask the shopper if they want to see the pop-up again',
        'Always show the pop-up': 'Always show the pop-up',
        'Do you want to save this product for later?': 'Do you want to save this product for later?',
        'No, thanks!': 'No, thanks!',
        'Save For later': 'Save For later',
      },
      Settings: {
        'Settings': 'Settings',
        'Settings subtitle': 'Manage your app settings',
        'Installtions': 'Installations',
        'installation subtitle': 'Follow steps to install the wishlist app',
        'Notifications': 'Notifications',
        'Notifications subtitle': 'Notifications are automatically sent out.',
        'Language Settings': 'Language Settings',
        'Language Settings subtitle': 'Customize front-end language content.',
        'Language Settings Text': 'When altering the language of your entire store, the Wishlist app offers comprehensive flexibility to modify the language of the all section, encompassing the Tab, Button',
        'Integerations': 'Integerations',
        'Integrations subtitle': 'View and manage connected apps.',
      },
      Notifications: {
        'Notifications': 'Notifications ',
        'Noticications Subtitle': 'Notifications are automatically sent out.',
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
      },
      'Notification Details': {
        'Sections': 'Sections',
        'insert Variables': 'insert Variables',
        'Email Subject': 'Email Subject',
        'Email Text sign up confirmation': 'Welcome to {shop_name} - Your Wishlist is Ready!',
        'Email Text wishlist shared': 'Your Wishlist has been shared',
        'Email Text wishlist reminder': "Don't forget about your {shop_name} wishlist items!",
        'Email Text Send reminders on Items Saved for Later': "Your saved items are waiting for you at {shop_name}",
        'Email Text Send low stocks alerts': "Low stock alert: {product_name} at {shop_name}",
        'Email Text Send Price Drop Alert': "Price drop alert: {product_name} at {shop_name}",
        'Email Text Send Back in stock alert': "Back in stock: {product_name} at {shop_name}",
        'Branding': 'Branding',
        'Branding Type': 'Branding Type',
        'Store name': 'Store name',
        'image': 'image',
        'Logo': 'Logo',
        'image width': 'Image Width',
        'Text Color': 'Text Color',
        'Background Color': 'Background Color',
        'Padding Top': 'Padding Top',
        'Padding Bottom': 'Padding Bottom',
        'Text': 'Text',
        'Content': 'Content',
        'Text in Text field sign up confirmation': 'Hi {customer_first_name} {customer_last_name}\nWelcome to {shop_name}! Your wishlist has been successfully created. You can now start saving your favorite products and receive notifications about price drops, stock updates, and more.\n\nHappy shopping!\nYour Friends at {shop_name}',
        'Text in Text field wishlist shared': 'Hi {customer_first_name} {customer_last_name},\n\nYour wishlist has been successfully shared! Your friends and family can now see your favorite items and help you decide what to get.\n\nHappy sharing!\nYour Friends at {shop_name}',
        'Text in Text field wishlist reminder': 'Hi {customer_first_name} {customer_last_name},\n\nDon\'t forget about the amazing items in your wishlist! You have {wishlist_count} items waiting for you.\n\nHappy shopping!\nYour Friends at {shop_name}',
        'Text in Text field Send reminders on Items Saved for Later': 'Hi {customer_first_name} {customer_last_name},\n\nYour saved items are still waiting for you! You have {saved_count} items saved for later.\n\nHappy shopping!\nYour Friends at {shop_name}',
        'Text in Text field Send low stocks alerts': 'Hi {customer_first_name} {customer_last_name},\n\nHurry! {product_name} is running low on stock. Only {stock_count} units remaining!\n\nDon\'t miss out!\nYour Friends at {shop_name}',
        'Text in Text field Send Price Drop Alert': 'Hi {customer_first_name} {customer_last_name},\n\nGreat news! {product_name} is now on sale! The price has dropped by {price_drop_percentage}% from {old_price} to {new_price}.\n\nHappy shopping!\nYour Friends at {shop_name}',
        'Text in Text field Send Back in stock alert': 'Hi {customer_first_name} {customer_last_name},\n\nGreat news! {product_name} is back in stock and ready for you to purchase!\n\nDon\'t miss out!\nYour Friends at {shop_name}',
        'Text Alignment': 'Text Alignment',
        'Background Color': 'Background Color',
        'Item Text Color': 'Item Text Color',
        'Action button': 'Action button',
        'Action Button Text': 'Button Text',
        'Link': 'Link',
        'Tracking Link': 'Tracking Link',
        'Customize Link': 'Customize Link',
        'Action Button Width (%)': 'Button Width (%)',
        'Action Button Font Size': 'Font Size',
        'Action Button Color': 'Button Color',
        'Action Button Color': 'Button Color',
        'Action Button Text Color': 'Text Color',
        'Action Button Alignment': 'Alignment',
        'Background Color Button Area': 'Background Color',
        'Footer': 'Footer',
        'Footer Text': 'Text',
        'Footer Text to send in sign up confirmation': 'Thank you for choosing {shop_name}!\n{shop_name}',
        'Footer Text to send in wishlist shared': 'Happy sharing!\n{shop_name}',
        'Footer Text to send in wishlist reminder': 'Happy shopping!\n{shop_name}',
        'Footer Text to send in Send reminders on Items Saved for Later': 'Happy shopping!\n{shop_name}',
        'Footer Text to send in Send low stocks alerts': 'Dont miss out!\n{shop_name}',
        'Footer Text to send in Send Price Drop Alert': 'Happy shopping!\n{shop_name}',
        'Footer Text to send in Send Back in stock alert': 'Dont miss out!\n{shop_name}',
        'Text Alignment Footer': 'Text Alignment',
        'Text Color Footer': 'Text Color',
        'Background Color Footer': 'Background Color',
        'Theme settings': 'Theme settings',
        'Global setting': 'Global setting',
        'Font Family': 'Font Family',
        'Save': 'Save',
        'Section': 'Section',
        'SF Pro Text': 'SF Pro Text',
        'Arial': 'Arial',
        'Courier New': 'Courier New',
        'Georgia': 'Georgia',
        'Lucida Sans Unicode': 'Lucida Sans Unicode',
        'Tahoma': 'Tahoma',
        'Times New Roman': 'Times New Roman',
        'Trebuchet MS': 'Trebuchet MS',
        'Verdana': 'Verdana',
        "Back": "Back"
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
        'Current theme app embed status': 'Current (Published) theme app embed status',
        'App embed Status': 'App embed Status',
        "Enable": "Enable",
        "Disable": "Disable",
        'Enable Wishlist app embed': 'Enable Wishlist app embed',
        'Enable the Wishlist Configurations': 'Enable the Wishlist Configurations from App embeds in Theme settings by going to Shopify Theme Customization.',
        'Activate Button': 'Click here to activate',
        'No Theme Selected': 'No Theme Selected',
        'Add Wishlist block': 'Add Wishlist block',
        'Add app block Text': 'Add the app block to display wishlist functionality on your selected theme. Customize the block positions to achieve the perfect placement according to your preferences.',
        'Wishlist Widget Near Cart Button': 'Wishlist Widget Near Cart Button',
        'Add Wishlist Widget Cart Button Text': "To add a Wishlist Widget, go to Shopify's theme customization section and click on Add block.",
        'Button Text Wishlist Widget Near Cart Button': 'Wishlist Widget Near Cart Button',
        'Wishlist Widget On Product Image': 'Wishlist Widget On Product Image',
        'Button text Wishlist Widget On Product Image': 'Wishlist Widget On Product Image',
        'Text Wishlist Widget product image': "Go to Shopify's theme customization section and click on Add block to add the Wishlist Widget On Product Image",
        "Wishlist Widget Collection page": 'Wishlist Widget On Collections Page',
        "Button text Wishlist Widget Collection page": "Wishlist Widget On Collections Page",
        "Text Wishlist Widget Collection page": "In Shopify's theme customization, click Add block to add the Wishlist Widget On Collections Page.",
        "My Wishlist Section": "My Wishlist Section",
        "Button text My Wishlist Section": "My Wishlist Section",
        "Text My Wishlist Section": "To add a My Wishlist Section, navigate to Shopify's theme customization page and click on Add block to add the My Wishlist Section and view your Wislist items.",
      },
      'Save Bar': {
        'Save': 'Save',
        'Discard': 'Discard',
        'Unsaved Changes': 'Unsaved Changes',
      },
      'Modals': {
        'Add New Language': 'Add New Language',
        "Enter language name (e.g., Swedish, Turkish)": "Enter language name (e.g., Swedish, Turkish)",
        "Language Name": "Language Name",
        'Cancel': 'Cancel',
        'Add Language': 'Add Language',
        'Image': 'Image',
        'Close': 'Close',
      }

    },
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