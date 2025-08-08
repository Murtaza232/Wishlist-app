import React, { useState, useEffect, useContext, useCallback,useRef} from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Card,
  Text,
  Icon,
  Button,
  TextField,
  Frame,
  Select,
  ContextualSaveBar,
  Toast
} from '@shopify/polaris';
import {
  ChevronLeftIcon
} from '@shopify/polaris-icons';
import { useAuthenticatedFetch } from '../hooks/useAuthenticatedFetch';
import { AppContext } from "../components";
import { useAppBridge } from "@shopify/app-bridge-react";
import { getSessionToken } from "@shopify/app-bridge-utils";
import { useLanguage } from '../components';

export default function LanguageSetting() {
  const navigate = useNavigate();
  const { apiUrl } = useContext(AppContext);
  const appBridge = useAppBridge();
  const intervalRef = useRef(null);
  // FIX: Extract both currentLanguage and changeLanguage from context
  const { currentLanguage, changeLanguage,t } = useLanguage();
  // const { t } = useLanguage();
  // Translation function using imported languageKeys
  // const t = useCallback((key, section = 'Language Settings') => {
  //   return (
  //     languageKeys[currentLanguage] &&
  //     languageKeys[currentLanguage][section] &&
  //     languageKeys[currentLanguage][section][key]
  //   ) || key;
  // }, [currentLanguage]);

  // State for selected section
  const [selectedSection, setSelectedSection] = useState('Sidebar Tabs');

  // State for selected language
  const [showAddLanguageModal, setShowAddLanguageModal] = useState(false);
  const [newLanguageName, setNewLanguageName] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Contextual save bar state
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");
  const [lastSavedState, setLastSavedState] = useState({});
  
  // Toast state
  const [toasts, setToasts] = useState({ error: false, success: false, msg: "" });

  // Toast handler
  const toggleToast = useCallback((type, msg = "") => {
    setToasts((prev) => ({ ...prev, [type]: !prev[type], msg }));
  }, []);

  // State for language fields
  const [languageFields, setLanguageFields] = useState({
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
        'Colors' : 'Colors',
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
        'Add To Wishlist' : 'Add to Wishlist',
        'Added To Wishlist' : 'Added to Wishlist',
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
        'Do you want to save this product for later?' :'Do you want to save this product for later?',
        'No, thanks!' :'No, thanks!',
        'Save For later' :'Save For later',
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
        'Sections' : 'Sections',
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
        'Current theme app embed status' : 'Current (Published) theme app embed status',
        'App embed Status': 'App embed Status',
        "Enable": "Enable",
        "Disable": "Disable",
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
        "Wishlist Widget Collection page": 'Wishlist Widget On Collections Page',
        "Button text Wishlist Widget Collection page": "Wishlist Widget On Collections Page",
        "Text Wishlist Widget Collection page": "In Shopify's theme customization, click Add block to add the Wishlist Widget On Collections Page.",
        "My Wishlist Section": "My Wishlist Section",
        "Button text My Wishlist Section": "My Wishlist Section",
        "Text My Wishlist Section": "To add a My Wishlist Section, navigate to Shopify's theme customization page and click on Add block to add the My Wishlist Section and view your Wislist items.",
      },
      'Save Bar':{
        'Save': 'Save',
        'Discard': 'Discard',
        'Unsaved Changes': 'Unsaved Changes',
      },
      'Modals':{
        'Add New Language': 'Add New Language',
        "Enter language name (e.g., Swedish, Turkish)": "Enter language name (e.g., Swedish, Turkish)",
        "Language Name": "Language Name",
        'Cancel' : 'Cancel',
        'Add Language' : 'Add Language',
        'Image' : 'Image',
        'Close' : 'Close',
      }

    },
    French: {
      'Sidebar Tabs': {
        'Configuration': 'Configuration',
        'Settings': 'Paramètres',
        'Customers': 'Clients'
      },
      Dashboard: {
        'Dashboard': 'Tableau de bord',
        'Active Wishlist Widget': 'Widget de liste de souhaits actif',
        'Text active wishlist widget': 'Pour assurer une fonctionnalité complète, veuillez activer les configurations de liste de souhaits dans la section App Embeds de votre thème Shopify.',
        'Button text activate wishlist widget': 'Activer',
        'Wishlist Highlights': 'Points forts de la liste de souhaits',
        'Total Wishlist Products': 'Total des produits de liste de souhaits',
        'Total Lists': 'Total des listes',
        'Setup Guide': 'Guide d\'installation',
        'completed': 'terminé',
        'Smart Notifications Alerts': 'Alertes de notifications intelligentes',
        'Set up automated email notifications for new reviews': 'Configurez des notifications par email automatiques pour les nouveaux avis',
        'Button Text smart notification alerts': 'Configurer les alertes',
        'Widget Personalization': 'Personnalisation du widget',
        'Paragraph Widget Personalization': 'Choisissez les widgets et adaptez leur design à votre boutique',
        'Button Text Widget Personalization': 'Personnaliser le widget',
        'Localize': 'Localiser',
        'Paragraph Localize': 'Modifiez ou traduisez facilement tout le texte lié aux avis',
        'Button Text Localize': 'Modifier le texte',
        'Much more than a Wishlist': 'Bien plus qu\'une liste de souhaits',
        'subtitle much more than wishlist': 'Engagez les acheteurs tout au long de leur parcours—du parcours à l\'achat',
        'tabs why it matters': 'Pourquoi c\'est important',
        'Capture Intent': 'Capturer l\'intention',
        'Capture Intent 1st tab Title': 'Ajouter les favoris à la liste de souhaits',
        'Capture Intent 1st tab 1st paragraph': "Facilite aux acheteurs de revisiter les produits qu'ils aiment, augmentant les visites de retour et la probabilité d'achat.",
        'Capture Intent 1st tab 2nd Paragraph': "Sew Trendy a vu une augmentation de 187% des taux de conversion pour les clients qui ajoutent à la liste de souhaits",
        'Capture Intent 2nd tab Title': "Sauvegarder pour plus tard depuis le panier",
        'Capture Intent 2nd tab 1st paragraph': "Gardez les produits à portée de main pour un achat futur, tout en réduisant les suppressions de panier et en vous aidant à identifier les acheteurs hésitants.",
        'Capture Intent 2nd tab 2nd paragraph': "Willow Boutique a récupéré ~15% des suppressions de panier et obtenu un ROI de 100x sur les alertes de liste de souhaits.",
        'Capture Identity': 'Capturer l\'identité',
        'Capture Identity 1st tab Title': "S'abonner aux articles en rupture de stock",
        'Capture Identity 1st tab 1st paragraph': "Évite la frustration des produits indisponibles, s'assure qu'ils ne manquent rien, et vous aide à récupérer les ventes perdues.",
        'Capture Identity 1st tab 2nd paragraph': "Tibi a vu des clients 4x plus susceptibles de convertir via les alertes de retour en stock",
        'Capture Identity 2nd tab Title': "Sauvegarder et partager la liste de souhaits",
        'Capture Identity 2nd tab 1st paragraph': "Maintient les acheteurs engagés avec des rappels personnalisés et des listes de souhaits partagées, augmentant les visites répétées et les conversions. Donne aux acheteurs accès à leurs listes de souhaits sur tous les appareils et visites, tout en convertissant les visiteurs anonymes en clients identifiés.",
        'Capture Identity 2nd tab 2nd paragraph': "Credo Beauty a augmenté l'engagement social et les conversions en utilisant des listes de souhaits partagées",
        'Engage & Convert': 'Engager et convertir',
        'Engage & Convert 1st tab Title': "Alertes de rappel de liste de souhaits",
        'Engage & Convert 1st tab 1st paragraph': "Ramène les acheteurs à leurs articles sauvegardés, réduisant les abandons et augmentant les conversions.",
        'Engage & Convert 1st tab 2nd paragraph': "White Oak Pastures a vu 4x plus de conversions et 10% de AOV plus élevé grâce aux listes de souhaits",
        'Engage & Convert 2nd tab Title': "Alertes de baisse de prix",
        'Engage & Convert 2nd tab 1st paragraph': "Les informe des économies sur les articles qu'ils veulent déjà, tout en augmentant la probabilité de conversion.",
        'Engage & Convert 2nd tab 2nd paragraph': "Brighton a boosté l'AOV et la LTV avec les notifications de baisse de prix",
        'Engage & Convert 3rd tab Title': "Alertes de stock faible",
        'Engage & Convert 3rd tab 1st paragraph': "Aide les acheteurs à éviter de manquer leurs favoris, tout en créant un sentiment d'urgence.",
        'Engage & Convert 3rd tab 2nd paragraph': "Cirque Colors a stimulé l'urgence et les conversions en utilisant les alertes de stock faible",
        'Retain & Re-Engage': 'Fidéliser et réengager',
        'Retain & Re-Engage 1st tab Title': "Campagnes personnalisées",
        'Retain & Re-Engage 1st tab 1st paragraph': "Augmente la rétention client avec des campagnes hyper-ciblées pour les acheteurs à forte intention basées sur leur liste de souhaits et leur activité de navigation.",
        'Retain & Re-Engage 1st tab 2nd paragraph': "L'AOV de Block Zone a augmenté de 35% avec les campagnes de liste de souhaits Klaviyo",
        'Retain & Re-Engage 2nd tab Title': "Gagnez votre concours de liste de souhaits",
        'Retain & Re-Engage 2nd tab 1st paragraph': "Les acheteurs apprécient l'excitation de gagner leurs produits préférés, tout en boostant l'engagement, le partage social et les conversions.",
        'Retain & Re-Engage 2nd tab 2nd paragraph': "POPFLEX a ajouté 90K clients via une campagne de concours basée sur la liste de souhaits",
        'Retain & Re-Engage 3rd tab Title': "Expérience omnicanale",
        'Retain & Re-Engage 3rd tab 1st paragraph': "Efface les frontières entre les expériences d'achat en ligne et en magasin, aidant les vendeurs à personnaliser selon les préférences client.",
        'Retain & Re-Engage 3rd tab 2nd paragraph': "Bombshell Sportswear a vu une augmentation de 73% des revenus de liste de souhaits en utilisant Tapcart",
        'Quick Select': 'Sélection Rapide',
        'Today': 'Aujourd\'hui',
        'Yesterday': 'Hier',
        'Last 7 Days': '7 Derniers Jours',
        'Last 30 Days': '30 Derniers Jours',
        'This Month': 'Ce Mois',
        'Last Month': 'Mois Dernier',
        'Start Date': 'Date de début',
        'End Date': 'Date de fin',
        'Cancel': 'Annuler',
        'Apply': 'Appliquer'
      },
      Configurations: {
        'Configurations': 'Configurations',
        'Subtitle Configurations': "Personnalisez les styles, les couleurs, les icônes et le comportement des listes de souhaits. Ajustez l'apparence des listes de souhaits, configurez les options de collection et de panier, et prévisualisez instantanément les modifications. Toutes les modifications s'appliquent à votre boutique.",
        'Basics': 'Bases',
        'Colors' : 'Couleurs',
        'Primary color': 'Couleur primaire',
        'Secondary color': 'Couleur secondaire',
        'Icons': 'Icônes',
        'Heart': 'Cœur',
        'Star': 'Étoile',
        'Bookmark': 'Marque-page',
        'Button size': 'Taille du bouton',
        'Icon thickness': 'Épaisseur de l\'icône',
        'Product page': 'Page produit',
        'Button Position': 'Position du bouton',
        'Near cart button': 'Près du bouton panier',
        'On product image': 'Sur l\'image du produit',
        'Above Cart Button': 'Au-dessus du bouton panier',
        'Below Cart Button': 'En dessous du bouton panier',
        'Left of Cart Button': 'À gauche du bouton panier',
        'Right of Cart Button': 'À droite du bouton panier',
        'Top Left': 'Haut gauche',
        'Top Right': 'Haut droite',
        'Bottom Left': 'Bas gauche',
        'Bottom Right': 'Bas droite',
        'Button Style': 'Style de bouton',
        'Only Icon': 'Seule icône',
        'Only Text': 'Seulement du texte',
        'Icon and Text': 'Icône et texte',
        'Button Type': 'Type de bouton', 
        'Add To Wishlist' : 'Ajouter à la liste de souhaits',
        'Added To Wishlist' : 'Ajouté à la liste de souhaits',
        'Solid': "Plein",
        'Outline': "Contour",
        'Plain': "Simple",
        'Button text': 'Texte du bouton',
        'Before Click': 'Avant le clic',
        'After Click': 'Après le clic',
        'Label': 'Étiquette',
        'Other Settings': 'Autres paramètres',
        'Smart Save': 'Sauvegarde intelligente : Auto-liste de souhaits pour les produits visités trois fois ou plus par l\'acheteur',
        'Social Proof': 'Preuve sociale : Afficher le nombre de personnes qui ont ajouté le produit à leur liste de souhaits',
        'Collections': 'Collections',
        'Add item to wishlist from collection page': 'Permettre aux acheteurs d\'ajouter des articles à la liste de souhaits depuis les pages Collections',
        'Button Position': 'Position du bouton',
        'Top Left': 'Haut gauche',
        'Top Right': 'Haut droite',
        'Bottom Left': 'Bas gauche',
        'Bottom Right': 'Bas droite',
        'Wishlist Page': 'Page de liste de souhaits',
        'Text Color': 'Couleur du texte',
        'Type': 'Type',
        'Side Drawer': 'Tiroir latéral',
        'Separate Page': 'Page séparée',
        'Pop-up Modal': 'Modal pop-up',
        'Page Title': 'Titre de la page',
        'Launch From': 'Lancer depuis',
        'Header': 'En-tête',
        'Floating Button': 'Bouton flottant',
        'Navigation Menu': 'Menu de navigation',
        'Position': 'Position',
        'Left': 'Gauche',
        'Right': 'Droite',
        'Button Left': 'Bouton gauche',
        'Button Right': 'Bouton droite',
        'Corner Radius': 'Rayon de coin',
        'This needs to be set up manually': 'Cela doit être configuré manuellement',
        'Show Count': 'Afficher le compte',
        'Other Settings': 'Autres paramètres',
        'Allow shoppers to Share Wishlist': 'Permettre aux acheteurs de partager la liste de souhaits',
        'Cart': 'Panier',
        'Save for later pop-up': 'Sauvegarder pour plus tard pop-up',
        'Allow shoppers to save items': 'Permettre aux acheteurs de sauvegarder des articles avant de les retirer du panier',
        'Pop-up title': 'Titre du pop-up',
        'Primary button text': 'Texte du bouton principal',
        'Secondary button text': 'Texte du bouton secondaire',
        'Permission': 'Permission',
        'Allow shoppers to save items': 'Permettre aux acheteurs de sauvegarder des articles avant de les retirer du panier',
        'Ask the shopper if they want to see the pop-up again': 'Demander à l\'acheteur s\'il veut revoir le pop-up',
        'Always show the pop-up': 'Toujours afficher le pop-up',
        'Do you want to save this product for later?' :'Voulez-vous enregistrer ce produit pour plus tard?',
        'No, thanks!' :'Non merci!',
        'Save For later' :'Enregistrer pour plus tard',
        
      },
      Settings: {
        'Settings': 'Paramètres',
        'Settings subtitle': 'Gérez les paramètres de votre application',
        'Installtions': 'Installations',
        'installation subtitle': 'Suivez les étapes pour installer l\'application de liste de souhaits',
        'Notifications': 'Notifications',
        'Notifications subtitle': 'Les notifications sont envoyées automatiquement.',
        'Language Settings': 'Paramètres de langue',
        'Language Settings subtitle': 'Personnalisez le contenu de langue front-end.',
        "Language Settings Text": "Lors de la modification de la langue de l'ensemble de votre boutique, l'application Wishlist offre une flexibilité complète pour modifier la langue de toutes les sections, y compris l'onglet et le bouton.",
        'Integerations': 'Intégrations',
        'Integrations subtitle': 'Affichez et gérez les applications connectées.',
      },
      Notifications: {
        'Notifications': 'Notifications',
        'Notifications Subtitle': 'Les notifications sont envoyées automatiquement.',
        'Alerts and Notifications': 'Alertes et notifications',
        'Days': 'Jours',
        'Hours': 'Heures',
        'Sign up confirmation': 'Confirmation d\'inscription',
        'Send a confirmation': 'Envoyer une confirmation quand les acheteurs sauvegardent leur liste de souhaits',
        'Wishlist Shared': 'Liste de souhaits partagée',
        'Send a alert when shoppers share their wishlist': 'Envoyer une alerte quand les acheteurs partagent leur liste de souhaits avec d\'autres',
        'Wishlist Reminder': 'Rappel de liste de souhaits',
        'Send reminders for wishlist ': 'Envoyer des rappels pour les articles de liste de souhaits après',
        'Send reminders on items saved for later': 'Envoyer des rappels sur les articles sauvegardés pour plus tard',
        'Send reminders for items saved for later after': 'Envoyer des rappels pour les articles sauvegardés pour plus tard après',
        'Send low stock alerts': 'Envoyer des alertes de stock faible',
        'Send an alert when stock drops below': 'Envoyer une alerte quand le stock descend en dessous de',
        'units': 'unités',
        'Send Price Drop alert': 'Envoyer une alerte de baisse de prix',
        'Send an alert when price drops by': 'Envoyer une alerte quand le prix baisse de',
        'Send back in stock alerts': 'Envoyer des alertes de retour en stock',
        'Send an alert when wislisted items are back in stock': 'Envoyer une alerte quand les articles de liste de souhaits sont de retour en stock',
      },
      'Notification Details': {
        'insert Variables': 'insérer des variables',
        'Email Subject': 'Objet de l\'email',
        'Email Text sign up confirmation': 'Bienvenue chez {shop_name} - Votre liste de souhaits est prête !',
        'Email Text wishlist shared': 'Votre liste de souhaits a été partagée',
        'Email Text wishlist reminder': "N'oubliez pas vos articles de liste de souhaits {shop_name} !",
        'Email Text Send reminders on Items Saved for Later': "Vos articles sauvegardés vous attendent chez {shop_name}",
        'Email Text Send low stocks alerts': "Alerte de stock faible : {product_name} chez {shop_name}",
        'Email Text Send Price Drop Alert': "Alerte de baisse de prix : {product_name} chez {shop_name}",
        'Email Text Send Back in stock alert': "De retour en stock : {product_name} chez {shop_name}",
        'Branding': 'Marque',
        'Branding Type': 'Type de marque',
        'Store name': 'Nom de la boutique',
        'image': 'image',
        'Logo': 'Logo',
        'image width': 'Largeur de l\'image',
        'Text Color': 'Couleur du texte',
        'Background Color': 'Couleur d\'arrière-plan',
        'Padding Top': 'Remplissage supérieur',
        'Padding Bottom': 'Remplissage inférieur',
        'Text': 'Texte',
        'Content': 'Contenu',
        'Text in Text field sign up confirmation': 'Bonjour {customer_first_name} {customer_last_name}\nBienvenue chez {shop_name} ! Votre liste de souhaits a été créée avec succès. Vous pouvez maintenant commencer à sauvegarder vos produits préférés et recevoir des notifications sur les baisses de prix, les mises à jour de stock, et plus encore.\n\nBon shopping !\nVos amis chez {shop_name}',
        'Text in Text field wishlist shared': 'Bonjour {customer_first_name} {customer_last_name},\n\nVotre liste de souhaits a été partagée avec succès ! Vos amis et votre famille peuvent maintenant voir vos articles préférés et vous aider à décider quoi acheter.\n\nBon partage !\nVos amis chez {shop_name}',
        'Text in Text field wishlist reminder': 'Bonjour {customer_first_name} {customer_last_name},\n\nN\'oubliez pas les articles incroyables dans votre liste de souhaits ! Vous avez {wishlist_count} articles qui vous attendent.\n\nBon shopping !\nVos amis chez {shop_name}',
        'Text in Text field Send reminders on Items Saved for Later': 'Bonjour {customer_first_name} {customer_last_name},\n\nVos articles sauvegardés vous attendent toujours ! Vous avez {saved_count} articles sauvegardés pour plus tard.\n\nBon shopping !\nVos amis chez {shop_name}',
        'Text in Text field Send low stocks alerts': 'Bonjour {customer_first_name} {customer_last_name},\n\nDépêchez-vous ! {product_name} est en rupture de stock. Seulement {stock_count} unités restantes !\n\nNe manquez pas !\nVos amis chez {shop_name}',
        'Text in Text field Send Price Drop Alert': 'Bonjour {customer_first_name} {customer_last_name},\n\nBonne nouvelle ! {product_name} est maintenant en solde ! Le prix a baissé de {price_drop_percentage}% de {old_price} à {new_price}.\n\nBon shopping !\nVos amis chez {shop_name}',
        'Text in Text field Send Back in stock alert': 'Bonjour {customer_first_name} {customer_last_name},\n\nBonne nouvelle ! {product_name} est de retour en stock et prêt pour votre achat !\n\nDon\'t miss out!\nVos amis chez {shop_name}',
        'Text Alignment': 'Alignement du texte',
        'Background Color': 'Couleur d\'arrière-plan',
        'Item Text Color': 'Couleur du texte de l\'article',
        'Action button': 'Bouton d\'action',
        'Action Button Text': 'Texte du bouton',
        'Link': 'Lien',
        'Tracking Link': 'Lien de suivi',
        'Customize Link': 'Personnaliser le lien',
        'Action Button Width (%)': 'Largeur du bouton (%)',
        'Action Button Font Size': 'Taille de police',
        'Action Button Color': 'Couleur du bouton',
        'Action Button Color': 'Couleur du bouton',
        'Action Button Text Color': 'Couleur du texte',
        'Action Button Alignment': 'Alignement',
        'Background Color Button Area': 'Couleur d\'arrière-plan',
        'Footer': 'Pied de page',
        'Footer Text': 'Texte',
        'Footer Text to send in sign up confirmation': 'Merci de choisir {shop_name} !\n{shop_name}',
        'Footer Text to send in wishlist shared': 'Bon partage !\n{shop_name}',
        'Footer Text to send in wishlist reminder': 'Bon shopping !\n{shop_name}',
        'Footer Text to send in Send reminders on Items Saved for Later': 'Bon shopping !\n{shop_name}',
        'Footer Text to send in Send low stocks alerts': 'Ne manquez pas !\n{shop_name}',
        'Footer Text to send in Send Price Drop Alert': 'Bon shopping !\n{shop_name}',
        'Footer Text to send in Send Back in stock alert': 'Ne manquez pas !\n{shop_name}',
        'Text Alignment Footer': 'Alignement du texte',
        'Text Color Footer': 'Couleur du texte',
        'Background Color Footer': 'Couleur d\'arrière-plan',
        'Theme settings': 'Paramètres de thème',
        'Global setting': 'Paramètre global',
        'Font Family': 'Famille de police',
        'Save': 'Enregistrer',
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
"Back": "Retour" 
      },
      Installation: {
        'Installation instructions': 'Instructions d\'installation',
        'Follow the steps below to install': 'Suivez les étapes ci-dessous pour installer l\'application Widget de liste de souhaits sur votre boutique Shopify.',
        'Contact Us': 'Contactez-nous',
        'Paragraph Contact Us': 'Si vous n\'avez pas de connaissances en codage, veuillez nous contacter via le chat en direct ou créer un ticket de support.',
        'Contact Support': 'Contacter le support',
        'Theme Extension Tab': 'Extension de thème',
        'Expert Setup Tab': 'Configuration experte',
        'Manual Install Tab': 'Installation manuelle',
        'Current theme status': 'Statut du thème actuel',
        'Select Theme': 'Sélectionner le thème',
        'Current theme app embed status' : "État d'intégration de l'application dans le thème actuel (publié)",
        'App embed Status': 'Statut d\'intégration de l\'app',
        "Enable": "Activer",
        "Disable": "Désactiver",
        'Enable Wishlist app embed': 'Activer l\'intégration de l\'app de liste de souhaits',
        'Enable the Wishlist Configurations': 'Activez les configurations de liste de souhaits depuis App embeds dans les paramètres de thème en allant dans la personnalisation de thème Shopify.',
        'Activate Button': 'Activer',
        'Add Wishlist block': 'Ajouter le bloc de liste de souhaits',
        'Add app block Text': 'Ajoutez le bloc d\'app pour afficher la fonctionnalité de liste de souhaits sur votre thème sélectionné. Personnalisez les positions des blocs pour obtenir le placement parfait selon vos préférences.',
        'Wishlist Widget Near Cart Button': 'Widget de liste de souhaits près du bouton panier',
        'Add Wishlist Widget Cart Button Text': "Pour ajouter un widget de liste de souhaits, allez dans la section de personnalisation de thème Shopify et cliquez sur Ajouter un bloc.",
        'Button Text Wishlist Widget Near Cart Button': 'Widget de liste de souhaits près du bouton panier',
        'Wishlist Widget On Product Image': 'Widget de liste de souhaits sur l\'image du produit',
        'Button text Wishlist Widget On Product Image': 'Widget de liste de souhaits sur l\'image du produit',
        'Text Wishlist Widget product image': "Allez dans la section de personnalisation de thème Shopify et cliquez sur Ajouter un bloc pour ajouter le widget de liste de souhaits sur l'image du produit",
        "Wishlist Widget Collection page": 'Widget de liste de souhaits sur la page collections',
        "Button text Wishlist Widget Collection page": "Widget de liste de souhaits sur la page collections",
        "Text Wishlist Widget Collection page": "Dans la personnalisation Shopify, cliquez sur Ajouter un bloc pour ajouter le widget de liste de souhaits sur la page collections.",
        "My Wishlist Section": "Section Ma liste de souhaits",
        "Button text My Wishlist Section": "Section Ma liste de souhaits",
        "Text My Wishlist Section": "Pour ajouter une section Ma liste de souhaits, naviguez vers la page de personnalisation de thème Shopify et cliquez sur Ajouter un bloc pour ajouter la section Ma liste de souhaits et voir vos articles de liste de souhaits.",
      },
      "Save Bar": {
        "Save": "Enregistrer",
        "Discard": "Annuler",
        "Unsaved Changes": "Modifications non enregistrées"
      },
      "Modals": {
        "Add New Language": "Ajouter une nouvelle langue",
        "Enter language name (e.g., Swedish, Turkish)": "Entrez le nom de la langue (par ex. suédois, turc)",
        "Language Name": "Nom de la langue",
        "Cancel": "Annuler",
        "Add Language": "Ajouter la langue",
        "Image": "Image",
        "Close": "Fermer"
      }
    },
      German: {
        'Sidebar Tabs': {
          'Configuration': 'Konfiguration',
          'Settings': 'Einstellungen',
          'Customers': 'Kunden'
        },
        Dashboard: {
          'Dashboard': 'Dashboard',
          'Active Wishlist Widget': 'Aktives Wunschlisten-Widget',
          'Text active wishlist widget': 'Um die vollständige Funktionalität zu gewährleisten, aktivieren Sie bitte die Wunschlisten-Konfigurationen im App-Embeds-Bereich Ihres Shopify-Themes.',
          'Button text activate wishlist widget': 'Aktivieren',
          'Wishlist Highlights': 'Wunschlisten-Highlights',
          'Total Wishlist Products': 'Gesamte Wunschlisten-Produkte',
          'Total Lists': 'Gesamte Listen',
          'Setup Guide': 'Einrichtungsanleitung',
          'completed': 'abgeschlossen',
          'Smart Notifications Alerts': 'Intelligente Benachrichtigungsalarme',
          'Set up automated email notifications for new reviews': 'Richten Sie automatische E-Mail-Benachrichtigungen für neue Bewertungen ein',
          'Button Text smart notification alerts': 'Alarme konfigurieren',
          'Widget Personalization': 'Widget-Personalisierung',
          'Paragraph Widget Personalization': 'Wählen Sie Widgets und passen Sie deren Design an Ihr Geschäft an',
          'Button Text Widget Personalization': 'Widget anpassen',
          'Localize': 'Lokalisieren',
          'Paragraph Localize': 'Bearbeiten oder übersetzen Sie alle bewertungsbezogenen Texte mit Leichtigkeit',
          'Button Text Localize': 'Text bearbeiten',
          'Much more than a Wishlist': 'Viel mehr als eine Wunschliste',
          'subtitle much more than wishlist': 'Engagieren Sie Käufer während ihrer gesamten Reise—vom Stöbern bis zum Kaufen',
          'tabs why it matters': 'Warum es wichtig ist',
          'Capture Intent': 'Absicht erfassen',
          'Capture Intent 1st tab Title': 'Favoriten zur Wunschliste hinzufügen',
          'Capture Intent 1st tab 1st paragraph': "Macht es Käufern einfach, Produkte zu besuchen, die sie lieben, erhöht Rückbesuche und Kaufwahrscheinlichkeit.",
          'Capture Intent 1st tab 2nd Paragraph': "Sew Trendy sah eine 187%ige Steigerung der Konversionsraten für Kunden, die zur Wunschliste hinzufügen",
          'Capture Intent 2nd tab Title': "Für später vom Warenkorb speichern",
          'Capture Intent 2nd tab 1st paragraph': "Behalten Sie Produkte für zukünftige Käufe griffbereit, während Sie Warenkorb-Löschungen reduzieren und zögernde Käufer identifizieren.",
          'Capture Intent 2nd tab 2nd paragraph': "Willow Boutique erholte ~15% der Warenkorb-Löschungen und erhielt 100x ROI auf Wunschlisten-Alarme.",
          'Capture Identity': 'Identität erfassen',
          'Capture Identity 1st tab Title': "Für ausverkaufte Artikel anmelden",
          'Capture Identity 1st tab 1st paragraph': "Verhindert Frustration bei nicht verfügbaren Produkten, stellt sicher, dass sie nichts verpassen, und hilft Ihnen, verlorene Verkäufe zu erholen.",
          'Capture Identity 1st tab 2nd paragraph': "Tibi sah Kunden 4x wahrscheinlicher konvertieren über wieder-auf-Lager-Alarme",
          'Capture Identity 2nd tab Title': "Wunschliste speichern & teilen",
          'Capture Identity 2nd tab 1st paragraph': "Hält Käufer mit personalisierten Erinnerungen und geteilten Wunschlisten engagiert, erhöht wiederholte Besuche und Konversionen. Gibt Käufern Zugang zu ihren Wunschlisten über Geräte und Besuche hinweg, während anonyme Besucher in identifizierte Kunden konvertiert werden.",
          'Capture Identity 2nd tab 2nd paragraph': "Credo Beauty erhöhte soziales Engagement und Konversionen durch geteilte Wunschlisten",
          'Engage & Convert': 'Engagieren & Konvertieren',
          'Engage & Convert 1st tab Title': "Wunschlisten-Erinnerungsalarme",
          'Engage & Convert 1st tab 1st paragraph': "Bringt Käufer zu ihren gespeicherten Artikeln zurück, reduziert Abbrüche und erhöht Konversionen.",
          'Engage & Convert 1st tab 2nd paragraph': "White Oak Pastures sah 4x mehr Konversionen & 10% höheren AOV durch Wunschlisten",
          'Engage & Convert 2nd tab Title': "Preissenkungsalarme",
          'Engage & Convert 2nd tab 1st paragraph': "Informiert sie über Einsparungen bei Artikeln, die sie bereits wollen, während die Konversionswahrscheinlichkeit erhöht wird.",
          'Engage & Convert 2nd tab 2nd paragraph': "Brighton steigerte AOV und LTV mit Preissenkungsbenachrichtigungen",
          'Engage & Convert 3rd tab Title': "Niedrige-Lagerbestand-Alarme",
          'Engage & Convert 3rd tab 1st paragraph': "Hilft Käufern, ihre Favoriten nicht zu verpassen, während ein Gefühl der Dringlichkeit geschaffen wird.",
          'Engage & Convert 3rd tab 2nd paragraph': "Cirque Colors trieb Dringlichkeit und Konversionen mit niedrigen-Lagerbestand-Alarmen an",
          'Retain & Re-Engage': 'Behalten & Re-Engagieren',
          'Retain & Re-Engage 1st tab Title': "Personalisierte Kampagnen",
          'Retain & Re-Engage 1st tab 1st paragraph': "Erhöht die Kundenbindung mit hyper-zielgerichteten Kampagnen für Käufer mit hoher Absicht basierend auf ihrer Wunschliste und Browsing-Aktivität.",
          'Retain & Re-Engage 1st tab 2nd paragraph': "Block Zones AOV stieg um 35% mit Klaviyo-Wunschlisten-Kampagnen",
          'Retain & Re-Engage 2nd tab Title': "Gewinnen Sie Ihren Wunschlisten-Wettbewerb",
          'Retain & Re-Engage 2nd tab 1st paragraph': "Käufer genießen die Aufregung, ihre Lieblingsprodukte zu gewinnen, während Engagement, soziales Teilen und Konversionen gesteigert werden.",
          'Retain & Re-Engage 2nd tab 2nd paragraph': "POPFLEX fügte 90K Kunden über wunschlistenbasierte Gewinnspiel-Kampagne hinzu",
          'Retain & Re-Engage 3rd tab Title': "Omnichannel-Erfahrung",
          'Retain & Re-Engage 3rd tab 1st paragraph': "Verwischt die Grenzen zwischen Online- und Offline-Einkaufserfahrungen, hilft Verkaufsberatern bei der Personalisierung basierend auf Kundenpräferenzen.",
          'Retain & Re-Engage 3rd tab 2nd paragraph': "Bombshell Sportswear sah eine 73%ige Wunschlisten-Umsatzsteigerung durch Tapcart",
          'Quick Select': 'Schnellauswahl',
          'Today': 'Heute',
          'Yesterday': 'Gestern',
          'Last 7 Days': 'Letzte 7 Tage',
          'Last 30 Days': 'Letzte 30 Tage',
          'This Month': 'Dieser Monat',
          'Last Month': 'Letzter Monat',
          'Start Date': 'Startdatum',
          'End Date': 'Enddatum',
          'Cancel': 'Abbrechen',
          'Apply': 'Anwenden'
        },
        Configurations: {
          'Configurations': 'Konfigurationen',
          'Subtitle Configurations': 'Personalisieren Sie die Stile, Farben, Symbole und Verhalten der Wunschlisten. Passen Sie die Anzeige der Wunschlisten an, konfigurieren Sie die Sammlungs- und Warenkorboptionen und prüfen Sie sofort die Änderungen. Alle Änderungen gelten für Ihre Shop-Oberfläche.',
          'Basics': 'Grundlagen',
          'Colors': 'Farben',
          'Primary color': 'Primärfarbe',
          'Secondary color': 'Sekundärfarbe',
          'Icons': 'Symbole',
          'Heart': 'Herz',
          'Star': 'Sterne',
          'Bookmark': 'Lesezeichen',
          'Button size': 'Button-Größe',
          'Icon thickness': 'Symbol-Dicke',
          'Product page': 'Produktseite',
          'Button Position': 'Button-Position',
          'Near cart button': 'Nah am Warenkorb-Button',
          'On product image': 'Auf dem Produktbild',
          'Above Cart Button': 'Über dem Warenkorb-Button',
          'Below Cart Button': 'Unter dem Warenkorb-Button',
          'Left of Cart Button': 'Links vom Warenkorb-Button',
          'Right of Cart Button': 'Rechts vom Warenkorb-Button',
          'Top Left': 'Oben links',
          'Top Right': 'Oben rechts',
          'Bottom Left': 'Unten links',
          'Bottom Right': 'Unten rechts',
          'Button Type': 'Button-Typ',
          'Button Style': 'Knopfstil',
          'Only Icon': 'Nur Symbol',
          'Only Text': 'Nur Text',
          'Icon and Text': 'Symbol und Text',
          'Solid': "Vollständig",
          'Outline': "Umriss",
          'Plain': "Einfach",
          'Button text': 'Button-Text',
          'Before Click': 'Vor dem Klick',
          'After Click': 'Nach dem Klick',
          'Label': 'Beschriftung',
          'Add To Wishlist' : 'Zur Wunschliste hinzufügen',
          'Added To Wishlist' : 'Zur Wunschliste hinzugefügt',
          'Other Settings': 'Andere Einstellungen',
          'Smart Save': 'Intelligentes Speichern: Auto-Wunschliste für Produkte, die dreimal oder öfter vom Käufer besucht wurden',
          'Social Proof': 'Sozialer Beweis: Zeigen Sie die Anzahl der Personen an, die das Produkt zu ihrer Wunschliste hinzugefügt haben',
          'Collections': 'Kollektionen',
          'Add item to wishlist from collection page': 'Ermöglichen Sie Käufern, Artikel zur Wunschliste von Kollektionsseiten hinzuzufügen',
          'Button Position': 'Button-Position',
          'Top Left': 'Oben links',
          'Top Right': 'Oben rechts',
          'Bottom Left': 'Unten links',
          'Bottom Right': 'Unten rechts',
          'Wishlist Page': 'Wunschlisten-Seite',
          'Text Color': 'Textfarbe',
          'Type': 'Typ',
          'Side Drawer': 'Seitenschublade',
          'Separate Page': 'Separate Seite',
          'Pop-up Modal': 'Pop-up-Modal',
          'Page Title': 'Seitentitel',
          'Launch From': 'Starten von',
          'Header': 'Kopfzeile',
          'Floating Button': 'Schwebender Button',
          'Navigation Menu': 'Navigationsmenü',
          'Position': 'Position',
          'Left': 'Links',
          'Right': 'Rechts',
          'Button Left': 'Button links',
          'Button Right': 'Button rechts',
          'Corner Radius': 'Eckenradius',
          'This needs to be set up manually': 'Dies muss manuell eingerichtet werden',
          'Show Count': 'Anzahl anzeigen',
          'Other Settings': 'Andere Einstellungen',
          'Allow shoppers to Share Wishlist': 'Ermöglichen Sie Käufern, Wunschliste zu teilen',
          'Cart': 'Warenkorb',
          'Save for later pop-up': 'Für später speichern Pop-up',
          'Allow shoppers to save items': 'Ermöglichen Sie Käufern, Artikel zu speichern, bevor sie aus dem Warenkorb entfernt werden',
          'Pop-up title': 'Pop-up-Titel',
          'Primary button text': 'Primärer Button-Text',
          'Secondary button text': 'Sekundärer Button-Text',
          'Permission': 'Berechtigung',
          'Allow shoppers to save items': 'Ermöglichen Sie Käufern, Artikel zu speichern, bevor sie aus dem Warenkorb entfernt werden',
          'Ask the shopper if they want to see the pop-up again': 'Fragen Sie den Käufer, ob er das Pop-up wieder sehen möchte',
          'Always show the pop-up': 'Pop-up immer anzeigen',
          'Do you want to save this product for later?' :'Möchten Sie dieses Produkt für später speichern?',
        'No, thanks!' :'Nein danke!',
        'Save For later' :'Für später speichern',
        },
        Settings: {
          'Settings': 'Paramètres',
          'Settings subtitle': 'Gérez les paramètres de votre application',
          'Installtions': 'Installationen',
          'installation subtitle': 'Folgen Sie den Schritten zur Installation der Wunschlisten-App',
          'Notifications': 'Benachrichtigungen',
          'Notifications subtitle': 'Benachrichtigungen werden automatisch gesendet.',
          'Language Settings': 'Spracheinstellungen',
          'Language Settings subtitle': 'Passen Sie Frontend-Sprachinhalt an.',
          "Language Settings Text": "Wenn Sie die Sprache Ihres gesamten Shops ändern, bietet die Wishlist-App umfassende Flexibilität, um die Sprache aller Bereiche, einschließlich Tab und Button, anzupassen.",
          'Integerations': 'Integrationen',
          'Integrations subtitle': 'Anzeigen und verwalten Sie verbundene Apps.',
        },
        Notifications: {
          'Notifications': 'Benachrichtigungen',
          'Notifications Subtitle': 'Benachrichtigungen werden automatisch versendet.',
          'Alerts and Notifications': 'Alarme und Benachrichtigungen',
          'Days': 'Tage',
          'Hours': 'Stunden',
          'Sign up confirmation': 'Anmeldebestätigung',
          'Send a confirmation': 'Senden Sie eine Bestätigung, wenn Käufer ihre Wunschliste speichern',
          'Wishlist Shared': 'Wunschliste geteilt',
          'Send a alert when shoppers share their wishlist': 'Senden Sie einen Alarm, wenn Käufer ihre Wunschliste mit anderen teilen',
          'Wishlist Reminder': 'Wunschlisten-Erinnerung',
          'Send reminders for wishlist ': 'Senden Sie Erinnerungen für Wunschlisten-Artikel nach',
          'Send reminders on items saved for later': 'Senden Sie Erinnerungen für für später gespeicherte Artikel',
          'Send reminders for items saved for later after': 'Senden Sie Erinnerungen für für später gespeicherte Artikel nach',
          'Send low stock alerts': 'Niedrige-Lagerbestand-Alarme senden',
          'Send an alert when stock drops below': 'Senden Sie einen Alarm, wenn der Lagerbestand unter fällt',
          'units': 'Einheiten',
          'Send Price Drop alert': 'Preissenkungsalarm senden',
          'Send an alert when price drops by': 'Senden Sie einen Alarm, wenn der Preis um sinkt',
          'Send back in stock alerts': 'Wieder-auf-Lager-Alarme senden',
          'Send an alert when wislisted items are back in stock': 'Senden Sie einen Alarm, wenn Wunschlisten-Artikel wieder auf Lager sind',
        },
        'Notification Details': {
          'insert Variables': 'Variablen einfügen',
          'Email Subject': 'E-Mail-Betreff',
          'Email Text sign up confirmation': 'Willkommen bei {shop_name} - Ihre Wunschliste ist bereit!',
          'Email Text wishlist shared': 'Ihre Wunschliste wurde geteilt',
          'Email Text wishlist reminder': "Vergessen Sie nicht Ihre {shop_name} Wunschlisten-Artikel!",
          'Email Text Send reminders on Items Saved for Later': "Ihre gespeicherten Artikel warten auf Sie bei {shop_name}",
          'Email Text Send low stocks alerts': "Niedriger Lagerbestand Alarm: {product_name} bei {shop_name}",
          'Email Text Send Price Drop Alert': "Preissenkungsalarm: {product_name} bei {shop_name}",
          'Email Text Send Back in stock alert': "Wieder auf Lager: {product_name} bei {shop_name}",
          'Branding': 'Markenbildung',
          'Branding Type': 'Markentyp',
          'Store name': 'Geschäftsname',
          'image': 'Bild',
          'Logo': 'Logo',
          'image width': 'Bildbreite',
          'Text Color': 'Textfarbe',
          'Background Color': 'Hintergrundfarbe',
          'Padding Top': 'Polsterung oben',
          'Padding Bottom': 'Polsterung unten',
          'Text': 'Text',
          'Content': 'Inhalt',
          'Text in Text field sign up confirmation': 'Hallo {customer_first_name} {customer_last_name}\nWillkommen bei {shop_name}! Ihre Wunschliste wurde erfolgreich erstellt. Sie können jetzt beginnen, Ihre Lieblingsprodukte zu speichern und Benachrichtigungen über Preissenkungen, Lageraktualisierungen und mehr zu erhalten.\n\nViel Spaß beim Einkaufen!\nIhre Freunde bei {shop_name}',
          'Text in Text field wishlist shared': 'Hallo {customer_first_name} {customer_last_name},\n\nIhre Wunschliste wurde erfolgreich geteilt! Ihre Freunde und Familie können jetzt Ihre Lieblingsartikel sehen und Ihnen bei der Entscheidung helfen, was Sie kaufen möchten.\n\nViel Spaß beim Teilen!\nIhre Freunde bei {shop_name}',
          'Text in Text field wishlist reminder': 'Hallo {customer_first_name} {customer_last_name},\n\nVergessen Sie nicht die erstaunlichen Artikel in Ihrer Wunschliste! Sie haben {wishlist_count} Artikel, die auf Sie warten.\n\nViel Spaß beim Einkaufen!\nIhre Freunde bei {shop_name}',
          'Text in Text field Send reminders on Items Saved for Later': 'Hallo {customer_first_name} {customer_last_name},\n\nIhre gespeicherten Artikel warten immer noch auf Sie! Sie haben {saved_count} Artikel für später gespeichert.\n\nViel Spaß beim Einkaufen!\nIhre Freunde bei {shop_name}',
          'Text in Text field Send low stocks alerts': 'Hallo {customer_first_name} {customer_last_name},\n\nBeeilen Sie sich! {product_name} ist knapp an Lager. Nur noch {stock_count} Einheiten verfügbar!\n\nVerpassen Sie es nicht!\nIhre Freunde bei {shop_name}',
          'Text in Text field Send Price Drop Alert': 'Hallo {customer_first_name} {customer_last_name},\n\nGute Nachrichten! {product_name} ist jetzt im Angebot! Der Preis ist um {price_drop_percentage}% von {old_price} auf {new_price} gesunken.\n\nViel Spaß beim Einkaufen!\nIhre Freunde bei {shop_name}',
          'Text in Text field Send Back in stock alert': 'Hallo {customer_first_name} {customer_last_name},\n\nGute Nachrichten! {product_name} ist wieder auf Lager und bereit für Ihren Kauf!\n\nVerpassen Sie es nicht!\nIhre Freunde bei {shop_name}',
          'Text Alignment': 'Textausrichtung',
          'Background Color': 'Hintergrundfarbe',
          'Item Text Color': 'Artikel-Textfarbe',
          'Action button': 'Aktionsbutton',
          'Action Button Text': 'Button-Text',
          'Link': 'Link',
          'Tracking Link': 'Tracking-Link',
          'Customize Link': 'Link anpassen',
          'Action Button Width (%)': 'Button-Breite (%)',
          'Action Button Font Size': 'Schriftgröße',
          'Action Button Color': 'Button-Farbe',
          'Action Button Color': 'Button-Farbe',
          'Action Button Text Color': 'Textfarbe',
          'Action Button Alignment': 'Ausrichtung',
          'Background Color Button Area': 'Hintergrundfarbe',
          'Footer': 'Fußzeile',
          'Footer Text': 'Text',
          'Footer Text to send in sign up confirmation': 'Vielen Dank, dass Sie {shop_name} gewählt haben!\n{shop_name}',
          'Footer Text to send in wishlist shared': 'Viel Spaß beim Teilen!\n{shop_name}',
          'Footer Text to send in wishlist reminder': 'Viel Spaß beim Einkaufen!\n{shop_name}',
          'Footer Text to send in Send reminders on Items Saved for Later': 'Viel Spaß beim Einkaufen!\n{shop_name}',
          'Footer Text to send in Send low stocks alerts': 'Verpassen Sie es nicht!\n{shop_name}',
          'Footer Text to send in Send Price Drop Alert': 'Viel Spaß beim Einkaufen!\n{shop_name}',
          'Footer Text to send in Send Back in stock alert': 'Verpassen Sie es nicht!\n{shop_name}',
          'Text Alignment Footer': 'Textausrichtung',
          'Text Color Footer': 'Textfarbe',
          'Background Color Footer': 'Hintergrundfarbe',
          'Theme settings': 'Theme-Einstellungen',
          'Global setting': 'Globale Einstellung',
          'Font Family': 'Schriftfamilie',
          'Save': 'Speichern',
'Section': 'Abschnitt',
'SF Pro Text': 'SF Pro Text',
'Arial': 'Arial',
'Courier New': 'Courier New',
'Georgia': 'Georgia',
'Lucida Sans Unicode': 'Lucida Sans Unicode',
'Tahoma': 'Tahoma',
'Times New Roman': 'Times New Roman',
'Trebuchet MS': 'Trebuchet MS',
'Verdana': 'Verdana',
"Back": "Zurück"
        },
        Installation: {
          'Installation instructions': 'Installationsanweisungen',
          'Follow the steps below to install': 'Folgen Sie den Schritten unten, um die Wunschlisten-Widget-App in Ihrem Shopify-Shop zu installieren.',
          'Contact Us': 'Kontaktieren Sie uns',
          'Paragraph Contact Us': 'Wenn Sie keine Kenntnisse in der Programmierung haben, kontaktieren Sie uns bitte per Live-Chat oder erstellen Sie ein Support-Ticket.',
          'Contact Support': 'Support kontaktieren',
          'Theme Extension Tab': 'Theme-Erweiterung',
          'Expert Setup Tab': 'Experten-Setup',
          'Manual Install Tab': 'Manuelle Installation',
          'Current theme status': 'Aktueller Theme-Status',
          'Select Theme': 'Theme auswählen',
          'Current theme app embed status' : "App-Einbettungsstatus des aktuellen (veröffentlichten) Themes",
          'App embed Status': 'App-Einbettungsstatus',
          "Enable": "Aktivieren",
          "Disable": "Deaktivieren",
          'Enable Wishlist app embed': 'Wunschlisten-App-Einbettung aktivieren',
          'Enable the Wishlist Configurations': 'Aktivieren Sie die Wunschlisten-Konfigurationen aus App-Embeds in den Theme-Einstellungen, indem Sie zur Shopify-Theme-Anpassung gehen.',
          'Activate Button': 'Aktivieren',
          'Add Wishlist block': 'Wunschlisten-Block hinzufügen',
          'Add app block Text': 'Fügen Sie den App-Block hinzu, um die Wunschlisten-Funktionalität auf Ihrem ausgewählten Theme anzuzeigen. Passen Sie die Block-Positionen an, um die perfekte Platzierung nach Ihren Präferenzen zu erreichen.',
          'Wishlist Widget Near Cart Button': 'Wunschlisten-Widget nahe dem Warenkorb-Button',
          'Add Wishlist Widget Cart Button Text': "Um ein Wunschlisten-Widget hinzuzufügen, gehen Sie zum Shopify-Theme-Anpassungsbereich und klicken Sie auf Block hinzufügen.",
          'Button Text Wishlist Widget Near Cart Button': 'Wunschlisten-Widget nahe dem Warenkorb-Button',
          'Wishlist Widget On Product Image': 'Wunschlisten-Widget auf Produktbild',
          'Button text Wishlist Widget On Product Image': 'Wunschlisten-Widget auf Produktbild',
          'Text Wishlist Widget product image': "Gehen Sie zum Shopify-Theme-Anpassungsbereich und klicken Sie auf Block hinzufügen, um das Wunschlisten-Widget auf dem Produktbild hinzuzufügen",
          "Wishlist Widget Collection page": 'Wunschlisten-Widget auf Kollektionsseite',
          "Button text Wishlist Widget Collection page": "Wunschlisten-Widget auf Kollektionsseite",
          "Text Wishlist Widget Collection page": "In der Shopify-Anpassung klicken Sie auf Block hinzufügen, um das Wunschlisten-Widget auf der Kollektionsseite hinzuzufügen.",
          "My Wishlist Section": "Meine Wunschlisten-Sektion",
          "Button text My Wishlist Section": "Meine Wunschlisten-Sektion",
          "Text My Wishlist Section": "Um eine Meine Wunschlisten-Sektion hinzuzufügen, navigieren Sie zur Shopify-Theme-Anpassungsseite und klicken Sie auf Block hinzufügen, um die Meine Wunschlisten-Sektion hinzuzufügen und Ihre Wunschlisten-Artikel anzuzeigen.",
        },
        "Save Bar": {
          "Save": "Speichern",
          "Discard": "Verwerfen",
          "Unsaved Changes": "Nicht gespeicherte Änderungen"
        },
        "Modals": {
      "Add New Language": "Neue Sprache hinzufügen",
      "Enter language name (e.g., Swedish, Turkish)": "Geben Sie den Namen der Sprache ein (z. B. Schwedisch, Türkisch)",
      "Language Name": "Sprachname",
      "Cancel": "Abbrechen",
      "Add Language": "Sprache hinzufügen",
      "Image": "Bild",
      "Close": "Schließen"
    }
      },
      Russian: {
        'Sidebar Tabs': {
          'Configuration': 'Конфигурация',
          'Settings': 'Настройки',
          'Customers': 'Клиенты'
        },
        Dashboard: {
          'Dashboard': 'Панель управления',
          'Active Wishlist Widget': 'Активный виджет списка желаний',
          'Text active wishlist widget': 'Для обеспечения полной функциональности, пожалуйста, включите конфигурации списка желаний в разделе App Embeds вашей темы Shopify.',
          'Button text activate wishlist widget': 'Активировать',
          'Wishlist Highlights': 'Основные моменты списка желаний',
          'Total Wishlist Products': 'Всего товаров в списке желаний',
          'Total Lists': 'Всего списков',
          'Setup Guide': 'Руководство по настройке',
          'completed': 'завершено',
          'Smart Notifications Alerts': 'Умные уведомления',
          'Set up automated email notifications for new reviews': 'Настройте автоматические email-уведомления для новых отзывов',
          'Button Text smart notification alerts': 'Настроить уведомления',
          'Widget Personalization': 'Персонализация виджета',
          'Paragraph Widget Personalization': 'Выбирайте виджеты и адаптируйте их дизайн под ваш магазин',
          'Button Text Widget Personalization': 'Настроить виджет',
          'Localize': 'Локализация',
          'Paragraph Localize': 'Легко редактируйте или переводите весь текст, связанный с отзывами',
          'Button Text Localize': 'Редактировать текст',
          'Much more than a Wishlist': 'Гораздо больше, чем список желаний',
          'subtitle much more than wishlist': 'Вовлекайте покупателей на протяжении всего пути—от просмотра до покупки',
          'tabs why it matters': 'Почему это важно',
          'Capture Intent': 'Захват намерений',
          'Capture Intent 1st tab Title': 'Добавить избранное в список желаний',
          'Capture Intent 1st tab 1st paragraph': "Делает покупку товаров, которые нравятся, более простой, увеличивает повторные посещения и вероятность покупки.",
          'Capture Intent 1st tab 2nd Paragraph': "Sew Trendy увидела увеличение конверсии на 187% для клиентов, которые добавляют в список желаний",
          'Capture Intent 2nd tab Title': "Сохранить на потом из корзины",
          'Capture Intent 2nd tab 1st paragraph': "Держите товары под рукой для будущей покупки, уменьшая удаления из корзины и помогая выявлять нерешительных покупателей.",
          'Capture Intent 2nd tab 2nd paragraph': "Willow Boutique восстановила ~15% удалений из корзины и получила ROI 100x на уведомлениях списка желаний.",
          'Capture Identity': 'Захват идентичности',
          'Capture Identity 1st tab Title': "Подписаться на отсутствующие товары",
          'Capture Identity 1st tab 1st paragraph': "Предотвращает разочарование от недоступных товаров, гарантирует, что они ничего не пропустят, и помогает восстановить потерянные продажи.",
          'Capture Identity 1st tab 2nd paragraph': "Tibi увидела клиентов в 4 раза более склонных к конверсии через уведомления о возвращении в наличии",
          'Capture Identity 2nd tab Title': "Сохранить и поделиться списком желаний",
          'Capture Identity 2nd tab 1st paragraph': "Поддерживает вовлеченность покупателей с персонализированными напоминаниями и общими списками желаний, увеличивая повторные посещения и конверсии. Дает покупателям доступ к их спискам желаний на всех устройствах и посещениях, конвертируя анонимных посетителей в идентифицированных клиентов.",
          'Capture Identity 2nd tab 2nd paragraph': "Credo Beauty увеличила социальное вовлечение и конверсии, используя общие списки желаний",
          'Engage & Convert': 'Вовлечение и конверсия',
          'Engage & Convert 1st tab Title': "Уведомления о напоминаниях списка желаний",
          'Engage & Convert 1st tab 1st paragraph': "Возвращает покупателей к их сохраненным товарам, уменьшая отказы и увеличивая конверсии.",
          'Engage & Convert 1st tab 2nd paragraph': "White Oak Pastures увидела в 4 раза больше конверсий и на 10% выше AOV через списки желаний",
          'Engage & Convert 2nd tab Title': "Уведомления о снижении цен",
          'Engage & Convert 2nd tab 1st paragraph': "Информирует об экономии на товарах, которые они уже хотят, увеличивая вероятность конверсии.",
          'Engage & Convert 2nd tab 2nd paragraph': "Brighton увеличил AOV и LTV с уведомлениями о снижении цен",
          'Engage & Convert 3rd tab Title': "Уведомления о низком остатке",
          'Engage & Convert 3rd tab 1st paragraph': "Помогает покупателям не пропустить их избранное, создавая чувство срочности.",
          'Engage & Convert 3rd tab 2nd paragraph': "Cirque Colors стимулировал срочность и конверсии, используя уведомления о низком остатке",
          'Retain & Re-Engage': 'Удержание и повторное вовлечение',
          'Retain & Re-Engage 1st tab Title': "Персонализированные кампании",
          'Retain & Re-Engage 1st tab 1st paragraph': "Увеличивает удержание клиентов с гипер-таргетированными кампаниями для покупателей с высокими намерениями на основе их списка желаний и активности просмотра.",
          'Retain & Re-Engage 1st tab 2nd paragraph': "AOV Block Zone вырос на 35% с кампаниями списка желаний Klaviyo",
          'Retain & Re-Engage 2nd tab Title': "Выиграйте конкурс вашего списка желаний",
          'Retain & Re-Engage 2nd tab 1st paragraph': "Покупатели наслаждаются волнением от выигрыша их любимых товаров, стимулируя вовлечение, социальное распространение и конверсии.",
          'Retain & Re-Engage 2nd tab 2nd paragraph': "POPFLEX добавила 90K клиентов через кампанию розыгрыша на основе списка желаний",
          'Retain & Re-Engage 3rd tab Title': "Омниканальный опыт",
          'Retain & Re-Engage 3rd tab 1st paragraph': "Стирает границы между онлайн и офлайн опытом покупок, помогая продавцам персонализировать на основе предпочтений клиентов.",
          'Retain & Re-Engage 3rd tab 2nd paragraph': "Bombshell Sportswear увидела увеличение дохода от списка желаний на 73% с использованием Tapcart",
          'Quick Select': 'Selezione Rapida',
          'Today': 'Oggi',
          'Yesterday': 'Ieri',
          'Last 7 Days': 'Ultimi 7 Giorni',
          'Last 30 Days': 'Ultimi 30 Giorni',
          'This Month': 'Questo Mese',
          'Last Month': 'Mese Scorso',
          'Start Date': 'Data di inizio',
          'End Date': 'Data di fine',
          'Cancel': 'Annulla',
          'Apply': 'Applica'
        },
        Configurations: {
          'Configurations': 'Конфигурации',
          'Subtitle Configurations': 'Настройте стиль, цвета, иконки и поведение списка желаний. Настройте, как будут отображаться списки желаний, настройте параметры коллекций и корзины, и сразу же просмотрите изменения. Все изменения применяются к вашему магазину.',
          'Basics': 'Основы',
          'Colors' : 'Цвета',
          'Primary color': 'Основной цвет',
          'Secondary color': 'Дополнительный цвет',
          'Icons': 'Иконки',
          'Heart': 'Сердце',
          'Star': 'Звезда',
          'Bookmark': 'Закладка',
          'Button size': 'Размер кнопки',
          'Icon thickness': 'Толщина иконки',
          'Product page': 'Страница товара',
          'Button Position': 'Позиция кнопки',
          'Near cart button': 'Рядом с кнопкой корзины',
          'On product image': 'На изображении товара',
          'Above Cart Button': 'Над кнопкой корзины',
          'Below Cart Button': 'Под кнопкой корзины',
          'Left of Cart Button': 'Слева от кнопки корзины',
          'Right of Cart Button': 'Справа от кнопки корзины',
          'Top Left': 'Верхний левый',
          'Top Right': 'Верхний правый',
          'Bottom Left': 'Нижний левый',
          'Bottom Right': 'Нижний правый',
          'Button Style': 'Стиль кнопки',
          'Only Icon': 'Только иконка',
          'Only Text': 'Только текст',
          'Icon and Text': 'Иконка и текст',
          'Button Type': 'Тип кнопки',
          'Solid': "Сплошная",
          'Outline': "Контур",
          'Plain': "Простая",
          'Button text': 'Текст кнопки',
          'Before Click': 'До клика',
          'After Click': 'После клика',
          'Label': 'Метка',
          'Add To Wishlist' : 'Добавить в список желаний',
          'Added To Wishlist' : 'Добавлено в список желаний',
          'Other Settings': 'Другие настройки',
          'Smart Save': 'Умное сохранение: Авто-список желаний для товаров, посещенных три раза или более покупателем',
          'Social Proof': 'Социальное доказательство: Показывать количество людей, добавивших товар в список желаний',
          'Collections': 'Коллекции',
          'Add item to wishlist from collection page': 'Разрешить покупателям добавлять товары в список желаний со страниц коллекций',
          'Button Position': 'Позиция кнопки',
          'Top Left': 'Верхний левый',
          'Top Right': 'Верхний правый',
          'Bottom Left': 'Нижний левый',
          'Bottom Right': 'Нижний правый',
          'Wishlist Page': 'Страница списка желаний',
          'Text Color': 'Цвет текста',
          'Type': 'Тип',
          'Side Drawer': 'Боковая панель',
          'Separate Page': 'Отдельная страница',
          'Pop-up Modal': 'Всплывающее окно',
          'Page Title': 'Заголовок страницы',
          'Launch From': 'Запуск из',
          'Header': 'Заголовок',
          'Floating Button': 'Плавающая кнопка',
          'Navigation Menu': 'Меню навигации',
          'Position': 'Позиция',
          'Left': 'Слева',
          'Right': 'Справа',
          'Button Left': 'Кнопка слева',
          'Button Right': 'Кнопка справа',
          'Corner Radius': 'Радиус угла',
          'This needs to be set up manually': 'Это нужно настроить вручную',
          'Show Count': 'Показать количество',
          'Other Settings': 'Другие настройки',
          'Allow shoppers to Share Wishlist': 'Разрешить покупателям делиться списком желаний',
          'Cart': 'Корзина',
          'Save for later pop-up': 'Сохранить на потом всплывающее окно',
          'Allow shoppers to save items': 'Разрешить покупателям сохранять товары перед удалением из корзины',
          'Pop-up title': 'Заголовок всплывающего окна',
          'Primary button text': 'Текст основной кнопки',
          'Secondary button text': 'Текст дополнительной кнопки',
          'Permission': 'Разрешение',
          'Allow shoppers to save items': 'Разрешить покупателям сохранять товары перед удалением из корзины',
          'Ask the shopper if they want to see the pop-up again': 'Спросить покупателя, хочет ли он снова увидеть всплывающее окно',
          'Always show the pop-up': 'Всегда показывать всплывающее окно',
          'Do you want to save this product for later?' :'Хотите сохранить этот продукт на потом?',
          'No, thanks!' :'Нет, спасибо!',
          'Save For later' :'Сохранить на потом',
        },
        Settings: {
          'Settings': 'Настройки',
          'Settings subtitle': 'Управление настройками приложения',
          'Installtions': 'Установки',
          'installation subtitle': 'Следуйте шагам для установки приложения списка желаний',
          'Notifications': 'Уведомления',
          'Notifications subtitle': 'Уведомления отправляются автоматически.',
          'Language Settings': 'Языковые настройки',
          'Language Settings subtitle': 'Настройте языковой контент интерфейса.',
          "Language Settings Text": "При изменении языка всего магазина приложение Wishlist предоставляет полную гибкость для изменения языка всех разделов, включая вкладку и кнопку.",
          'Integerations': 'Интеграции',
          'Integrations subtitle': 'Просматривайте и управляйте подключенными приложениями.',
        },
        Notifications: {
          'Notifications': 'Уведомления',
          'Notifications Subtitle': 'Уведомления отправляются автоматически.',
          'Alerts and Notifications': 'Оповещения и уведомления',
          'Days': 'Дни',
          'Hours': 'Часы',
          'Sign up confirmation': 'Подтверждение регистрации',
          'Send a confirmation': 'Отправить подтверждение, когда покупатели сохраняют свой список желаний',
          'Wishlist Shared': 'Список желаний поделен',
          'Send a alert when shoppers share their wishlist': 'Отправить оповещение, когда покупатели делятся своим списком желаний с другими',
          'Wishlist Reminder': 'Напоминание о списке желаний',
          'Send reminders for wishlist ': 'Отправлять напоминания для товаров списка желаний после',
          'Send reminders on items saved for later': 'Отправлять напоминания о товарах, сохраненных на потом',
          'Send reminders for items saved for later after': 'Отправлять напоминания для товаров, сохраненных на потом, после',
          'Send low stock alerts': 'Отправлять оповещения о низком остатке',
          'Send an alert when stock drops below': 'Отправить оповещение, когда остаток падает ниже',
          'units': 'единиц',
          'Send Price Drop alert': 'Отправить оповещение о снижении цены',
          'Send an alert when price drops by': 'Отправить оповещение, когда цена снижается на',
          'Send back in stock alerts': 'Отправлять оповещения о возвращении в наличии',
          'Send an alert when wislisted items are back in stock': 'Отправить оповещение, когда товары из списка желаний снова в наличии',
        },
        'Notification Details': {
          'insert Variables': 'вставить переменные',
          'Email Subject': 'Тема письма',
          'Email Text sign up confirmation': 'Добро пожаловать в {shop_name} - Ваш список желаний готов!',
          'Email Text wishlist shared': 'Ваш список желаний был поделен',
          'Email Text wishlist reminder': "Не забудьте о товарах вашего списка желаний {shop_name}!",
          'Email Text Send reminders on Items Saved for Later': "Ваши сохраненные товары ждут вас в {shop_name}",
          'Email Text Send low stocks alerts': "Оповещение о низком остатке: {product_name} в {shop_name}",
          'Email Text Send Price Drop Alert': "Оповещение о снижении цены: {product_name} в {shop_name}",
          'Email Text Send Back in stock alert': "Снова в наличии: {product_name} в {shop_name}",
          'Branding': 'Брендинг',
          'Branding Type': 'Тип брендинга',
          'Store name': 'Название магазина',
          'image': 'изображение',
          'Logo': 'Логотип',
          'image width': 'Ширина изображения',
          'Text Color': 'Цвет текста',
          'Background Color': 'Цвет фона',
          'Padding Top': 'Отступ сверху',
          'Padding Bottom': 'Отступ снизу',
          'Text': 'Текст',
          'Content': 'Содержание',
          'Text in Text field sign up confirmation': 'Привет {customer_first_name} {customer_last_name}\nДобро пожаловать в {shop_name}! Ваш список желаний был успешно создан. Теперь вы можете начать сохранять ваши любимые товары и получать уведомления о снижении цен, обновлениях остатков и многом другом.\n\nПриятных покупок!\nВаши друзья в {shop_name}',
          'Text in Text field wishlist shared': 'Привет {customer_first_name} {customer_last_name},\n\nВаш список желаний был успешно поделен! Ваши друзья и семья теперь могут видеть ваши любимые товары и помогать вам решить, что купить.\n\nПриятного обмена!\nВаши друзья в {shop_name}',
          'Text in Text field wishlist reminder': 'Привет {customer_first_name} {customer_last_name},\n\nНе забудьте об удивительных товарах в вашем списке желаний! У вас есть {wishlist_count} товаров, которые ждут вас.\n\nПриятных покупок!\nВаши друзья в {shop_name}',
          'Text in Text field Send reminders on Items Saved for Later': 'Привет {customer_first_name} {customer_last_name},\n\nВаши сохраненные товары все еще ждут вас! У вас есть {saved_count} товаров, сохраненных на потом.\n\nПриятных покупок!\nВаши друзья в {shop_name}',
          'Text in Text field Send low stocks alerts': 'Привет {customer_first_name} {customer_last_name},\n\nТоропитесь! {product_name} заканчивается на складе. Осталось только {stock_count} единиц!\n\nНе пропустите!\nВаши друзья в {shop_name}',
          'Text in Text field Send Price Drop Alert': 'Привет {customer_first_name} {customer_last_name},\n\nОтличные новости! {product_name} теперь в продаже! Цена снизилась на {price_drop_percentage}% с {old_price} до {new_price}.\n\nПриятных покупок!\nВаши друзья в {shop_name}',
          'Text in Text field Send Back in stock alert': 'Привет {customer_first_name} {customer_last_name},\n\nОтличные новости! {product_name} снова в наличии и готов к покупке!\n\nНе пропустите!\nВаши друзья в {shop_name}',
          'Text Alignment': 'Выравнивание текста',
          'Background Color': 'Цвет фона',
          'Item Text Color': 'Цвет текста товара',
          'Action button': 'Кнопка действия',
          'Action Button Text': 'Текст кнопки',
          'Link': 'Ссылка',
          'Tracking Link': 'Ссылка отслеживания',
          'Customize Link': 'Настроить ссылку',
          'Action Button Width (%)': 'Ширина кнопки (%)',
          'Action Button Font Size': 'Размер шрифта',
          'Action Button Color': 'Цвет кнопки',
          'Action Button Color': 'Цвет кнопки',
          'Action Button Text Color': 'Цвет текста',
          'Action Button Alignment': 'Выравнивание',
          'Background Color Button Area': 'Цвет фона',
          'Footer': 'Подвал',
          'Footer Text': 'Текст',
          'Footer Text to send in sign up confirmation': 'Спасибо, что выбрали {shop_name}!\n{shop_name}',
          'Footer Text to send in wishlist shared': 'Приятного обмена!\n{shop_name}',
          'Footer Text to send in wishlist reminder': 'Приятных покупок!\n{shop_name}',
          'Footer Text to send in Send reminders on Items Saved for Later': 'Приятных покупок!\n{shop_name}',
          'Footer Text to send in Send low stocks alerts': 'Не пропустите!\n{shop_name}',
          'Footer Text to send in Send Price Drop Alert': 'Приятных покупок!\n{shop_name}',
          'Footer Text to send in Send Back in stock alert': 'Не пропустите!\n{shop_name}',
          'Text Alignment Footer': 'Выравнивание текста',
          'Text Color Footer': 'Цвет текста',
          'Background Color Footer': 'Цвет фона',
          'Theme settings': 'Настройки темы',
          'Global setting': 'Глобальная настройка',
          'Font Family': 'Семейство шрифтов',
          'Save': 'Сохранить',
'Section': 'Раздел',
'SF Pro Text': 'SF Pro Text',
'Arial': 'Arial',
'Courier New': 'Courier New',
'Georgia': 'Georgia',
'Lucida Sans Unicode': 'Lucida Sans Unicode',
'Tahoma': 'Tahoma',
'Times New Roman': 'Times New Roman',
'Trebuchet MS': 'Trebuchet MS',
'Verdana': 'Verdana',
"Back": "Назад"
        },
        Installation: {
          'Installation instructions': 'Инструкции по установке',
          'Follow the steps below to install': 'Следуйте шагам ниже для установки приложения виджета списка желаний в вашем магазине Shopify.',
          'Contact Us': 'Связаться с нами',
          'Paragraph Contact Us': 'Если у вас нет знаний в программировании, пожалуйста, свяжитесь с нами через Live Chat или создайте запрос в службу поддержки.',
          'Contact Support': 'Обратиться в поддержку',
          'Theme Extension Tab': 'Расширение темы',
          'Expert Setup Tab': 'Экспертная настройка',
          'Manual Install Tab': 'Ручная установка',
          'Current theme status': 'Статус текущей темы',
          'Select Theme': 'Выбрать тему',
          'Current theme app embed status' : "Статус встроенного приложения в текущей (опубликованной) теме",
          'App embed Status': 'Статус встраивания приложения',
          "Enable": "Включить",
          "Disable": "Отключить",
          'Enable Wishlist app embed': 'Включить встраивание приложения списка желаний',
          'Enable the Wishlist Configurations': 'Включите конфигурации списка желаний из App Embeds в настройках темы, перейдя в настройку темы Shopify.',
          'Activate Button': 'Активировать',
          'Add Wishlist block': 'Добавить блок списка желаний',
          'Add app block Text': 'Добавьте блок приложения для отображения функциональности списка желаний на вашей выбранной теме. Настройте позиции блоков для достижения идеального размещения согласно вашим предпочтениям.',
          'Wishlist Widget Near Cart Button': 'Виджет списка желаний рядом с кнопкой корзины',
          'Add Wishlist Widget Cart Button Text': "Чтобы добавить виджет списка желаний, перейдите в раздел настройки темы Shopify и нажмите Добавить блок.",
          'Button Text Wishlist Widget Near Cart Button': 'Виджет списка желаний рядом с кнопкой корзины',
          'Wishlist Widget On Product Image': 'Виджет списка желаний на изображении товара',
          'Button text Wishlist Widget On Product Image': 'Виджет списка желаний на изображении товара',
          'Text Wishlist Widget product image': "Перейдите в раздел настройки темы Shopify и нажмите Добавить блок, чтобы добавить виджет списка желаний на изображение товара",
          "Wishlist Widget Collection page": 'Виджет списка желаний на странице коллекций',
          "Button text Wishlist Widget Collection page": "Виджет списка желаний на странице коллекций",
          "Text Wishlist Widget Collection page": "В настройке Shopify нажмите Добавить блок, чтобы добавить виджет списка желаний на страницу коллекций.",
          "My Wishlist Section": "Раздел Мой список желаний",
          "Button text My Wishlist Section": "Раздел Мой список желаний",
          "Text My Wishlist Section": "Чтобы добавить раздел Мой список желаний, перейдите на страницу настройки темы Shopify и нажмите Добавить блок, чтобы добавить раздел Мой список желаний и просмотреть товары вашего списка желаний.",
        },
        "Save Bar": {
          "Save": "Сохранить",
          "Discard": "Отменить",
          "Unsaved Changes": "Несохранённые изменения"
        },
        "Modals": {
          "Add New Language": "Добавить новый язык",
          "Enter language name (e.g., Swedish, Turkish)": "Введите название языка (например, шведский, турецкий)",
          "Language Name": "Название языка",
          "Cancel": "Отмена",
          "Add Language": "Добавить язык",
          "Image": "Изображение",
          "Close": "Закрыть"
        }
      },
      Chinese: {
        'Sidebar Tabs': {
          'Configuration': '配置',
          'Settings': '设置',
          'Customers': '客户'
        },
        Dashboard: {
          'Dashboard': '仪表板',
          'Active Wishlist Widget': '活跃愿望清单小部件',
          'Text active wishlist widget': '为确保完整功能，请在您的Shopify主题的App Embeds部分启用愿望清单配置。',
          'Button text activate wishlist widget': '激活',
          'Wishlist Highlights': '愿望清单亮点',
          'Total Wishlist Products': '愿望清单产品总数',
          'Total Lists': '列表总数',
          'Setup Guide': '设置指南',
          'completed': '已完成',
          'Smart Notifications Alerts': '智能通知提醒',
          'Set up automated email notifications for new reviews': '为新评论设置自动电子邮件通知',
          'Button Text smart notification alerts': '配置提醒',
          'Widget Personalization': '小部件个性化',
          'Paragraph Widget Personalization': '选择小部件并将其设计与您的商店匹配',
          'Button Text Widget Personalization': '自定义小部件',
          'Localize': '本地化',
          'Paragraph Localize': '轻松编辑或翻译所有与评论相关的文本',
          'Button Text Localize': '编辑文本',
          'Much more than a Wishlist': '不仅仅是愿望清单',
          'subtitle much more than wishlist': '在购物者的整个旅程中吸引他们—从浏览到购买',
          'tabs why it matters': '为什么重要',
          'Capture Intent': '捕获意图',
          'Capture Intent 1st tab Title': '将收藏添加到愿望清单',
          'Capture Intent 1st tab 1st paragraph': "让购物者轻松重新访问他们喜爱的产品，增加回访和购买可能性。",
          'Capture Intent 1st tab 2nd Paragraph': "Sew Trendy看到添加愿望清单的客户转化率增加了187%",
          'Capture Intent 2nd tab Title': "从购物车保存到稍后",
          'Capture Intent 2nd tab 1st paragraph': "将产品放在手边以备将来购买，同时减少购物车删除并帮助您识别犹豫的买家。",
          'Capture Intent 2nd tab 2nd paragraph': "Willow Boutique恢复了约15%的购物车删除，并在愿望清单提醒上获得了100倍的投资回报率。",
          'Capture Identity': '捕获身份',
          'Capture Identity 1st tab Title': "订阅缺货商品",
          'Capture Identity 1st tab 1st paragraph': "防止因不可用产品而产生的挫败感，确保他们不会错过，并帮助您恢复损失的销售。",
          'Capture Identity 1st tab 2nd paragraph': "Tibi看到客户通过补货提醒转化的可能性增加了4倍",
          'Capture Identity 2nd tab Title': "保存和分享愿望清单",
          'Capture Identity 2nd tab 1st paragraph': "通过个性化提醒和共享愿望清单保持购物者参与，增加重复访问和转化。让购物者可以在所有设备和访问中访问他们的愿望清单，同时将匿名访问者转化为已识别的客户。",
          'Capture Identity 2nd tab 2nd paragraph': "Credo Beauty通过共享愿望清单增加了社交参与度和转化率",
          'Engage & Convert': '参与和转化',
          'Engage & Convert 1st tab Title': "愿望清单提醒警报",
          'Engage & Convert 1st tab 1st paragraph': "将购物者带回他们保存的商品，减少流失并增加转化。",
          'Engage & Convert 1st tab 2nd paragraph': "White Oak Pastures通过愿望清单看到转化率增加了4倍，平均订单价值提高了10%",
          'Engage & Convert 2nd tab Title': "降价警报",
          'Engage & Convert 2nd tab 1st paragraph': "通知他们关于他们已经想要的商品的节省，同时增加转化的可能性。",
          'Engage & Convert 2nd tab 2nd paragraph': "Brighton通过降价通知提高了平均订单价值和客户生命周期价值",
          'Engage & Convert 3rd tab Title': "低库存警报",
          'Engage & Convert 3rd tab 1st paragraph': "帮助购物者避免错过他们的收藏，同时创造紧迫感。",
          'Engage & Convert 3rd tab 2nd paragraph': "Cirque Colors通过低库存警报推动了紧迫感和转化",
          'Retain & Re-Engage': '保留和重新参与',
          'Retain & Re-Engage 1st tab Title': "个性化活动",
          'Retain & Re-Engage 1st tab 1st paragraph': "通过基于购物者愿望清单和浏览活动的超针对性活动，提高高意图购物者的客户保留率。",
          'Retain & Re-Engage 1st tab 2nd paragraph': "Block Zone的平均订单价值通过Klaviyo愿望清单活动增长了35%",
          'Retain & Re-Engage 2nd tab Title': "赢得您的愿望清单竞赛",
          'Retain & Re-Engage 2nd tab 1st paragraph': "购物者享受赢得他们喜爱产品的兴奋，同时促进参与、社交分享和转化。",
          'Retain & Re-Engage 2nd tab 2nd paragraph': "POPFLEX通过基于愿望清单的赠品活动增加了90K客户",
          'Retain & Re-Engage 3rd tab Title': "全渠道体验",
          'Retain & Re-Engage 3rd tab 1st paragraph': "模糊在线和店内购物体验之间的界限，帮助销售人员根据客户偏好进行个性化。",
          'Retain & Re-Engage 3rd tab 2nd paragraph': "Bombshell Sportswear通过使用Tapcart看到愿望清单收入增长了73%",
          'Quick Select': 'Быстрый выбор',
          'Today': 'Сегодня',
          'Yesterday': 'Вчера',
          'Last 7 Days': 'Последние 7 дней',
          'Last 30 Days': 'Последние 30 дней',
          'This Month': 'Этот месяц',
          'Last Month': 'Прошлый месяц',
          'Start Date': 'Дата начала',
          'End Date': 'Дата окончания',
          'Cancel': 'Отмена',
          'Apply': 'Применить'
        },
        Configurations: {
          'Configurations': '配置',
          'Subtitle Configurations': '自定义按钮样式、颜色、图标和愿望清单行为。调整愿望清单的显示方式，设置收藏和购物车选项，并即时预览更改。所有更改都适用于您的商店前端。',
          'Basics': '基础',
          'Colors' : '颜色',
          'Primary color': '主色',
          'Secondary color': '次色',
          'Icons': '图标',
          'Heart': '心形',
          'Star': '星星',
          'Bookmark': '书签',
          'Button size': '按钮大小',
          'Icon thickness': '图标厚度',
          'Product page': '产品页面',
          'Button Position': '按钮位置',
          'Near cart button': '靠近购物车按钮',
          'On product image': '在产品图片上',
          'Above Cart Button': '购物车按钮上方',
          'Below Cart Button': '购物车按钮下方',
          'Left of Cart Button': '购物车按钮左侧',
          'Right of Cart Button': '购物车按钮右侧',
          'Top Left': '左上',
          'Top Right': '右上',
          'Bottom Left': '左下',
          'Bottom Right': '右下',
          'Button Style': '按钮样式',
          'Only Icon': '仅图标',
          'Only Text': '仅文本',
          'Icon and Text': '图标和文本',
          'Button Type': '按钮类型',
          'Solid': "实心",
          'Outline': "轮廓",
          'Plain': "简单",
          'Button text': '按钮文本',
          'Before Click': '点击前',
          'After Click': '点击后',
          'Label': '标签',
          'Add To Wishlist' : '添加到愿望清单',
          'Added To Wishlist' : '已添加到愿望清单',
          'Other Settings': '其他设置',
          'Smart Save': '智能保存：自动愿望清单购物者访问三次或以上的产品',
          'Social Proof': '社交证明：显示已将产品添加到愿望清单的人数',
          'Collections': '系列',
          'Add item to wishlist from collection page': '允许购物者从系列页面将商品添加到愿望清单',
          'Button Position': '按钮位置',
          'Top Left': '左上',
          'Top Right': '右上',
          'Bottom Left': '左下',
          'Bottom Right': '右下',
          'Wishlist Page': '愿望清单页面',
          'Text Color': '文本颜色',
          'Type': '类型',
          'Side Drawer': '侧边抽屉',
          'Separate Page': '独立页面',
          'Pop-up Modal': '弹出模态框',
          'Page Title': '页面标题',
          'Launch From': '启动位置',
          'Header': '页眉',
          'Floating Button': '浮动按钮',
          'Navigation Menu': '导航菜单',
          'Position': '位置',
          'Left': '左',
          'Right': '右',
          'Button Left': '按钮左',
          'Button Right': '按钮右',
          'Corner Radius': '圆角半径',
          'This needs to be set up manually': '这需要手动设置',
          'Show Count': '显示计数',
          'Other Settings': '其他设置',
          'Allow shoppers to Share Wishlist': '允许购物者分享愿望清单',
          'Cart': '购物车',
          'Save for later pop-up': '稍后保存弹出窗口',
          'Allow shoppers to save items': '允许购物者在从购物车移除前保存商品',
          'Pop-up title': '弹出窗口标题',
          'Primary button text': '主要按钮文本',
          'Secondary button text': '次要按钮文本',
          'Permission': '权限',
          'Allow shoppers to save items': '允许购物者在从购物车移除前保存商品',
          'Ask the shopper if they want to see the pop-up again': '询问购物者是否想再次看到弹出窗口',
          'Always show the pop-up': '始终显示弹出窗口',
          'Do you want to save this product for later?' :'您想保存该产品以供日后使用吗？',
          'No, thanks!' :'不，谢谢！',
          'Save For later' :'保存以供稍后使用',
        },
        Settings: {
          'Settings': '设置',
          'Settings subtitle': '管理您的应用设置',
          'Installtions': '安装',
          'installation subtitle': '按照步骤安装愿望清单应用',
          'Notifications': '通知',
          'Notifications subtitle': '通知会自动发送。',
          'Language Settings': '语言设置',
          'Language Settings subtitle': '自定义前端语言内容。',
          "Language Settings Text": "在更改整个商店的语言时，心愿单应用程序为您提供全面的灵活性，可以修改所有部分的语言，包括标签和按钮。",
          'Integerations': '集成',
          'Integrations subtitle': '查看和管理连接的应用程序。',
        },
        Notifications: {
          'Notifications': '通知',
          'Notifications Subtitle': '通知会自动发送。',
          'Alerts and Notifications': '警报和通知',
          'Days': '天',
          'Hours': '小时',
          'Sign up confirmation': '注册确认',
          'Send a confirmation': '当购物者保存愿望清单时发送确认',
          'Wishlist Shared': '愿望清单已分享',
          'Send a alert when shoppers share their wishlist': '当购物者与他人分享愿望清单时发送警报',
          'Wishlist Reminder': '愿望清单提醒',
          'Send reminders for wishlist ': '在以下时间后发送愿望清单商品提醒',
          'Send reminders on items saved for later': '对稍后保存的商品发送提醒',
          'Send reminders for items saved for later after': '在以下时间后对稍后保存的商品发送提醒',
          'Send low stock alerts': '发送低库存警报',
          'Send an alert when stock drops below': '当库存低于以下数量时发送警报',
          'units': '单位',
          'Send Price Drop alert': '发送降价警报',
          'Send an alert when price drops by': '当价格下降以下百分比时发送警报',
          'Send back in stock alerts': '发送补货警报',
          'Send an alert when wislisted items are back in stock': '当愿望清单商品补货时发送警报',
        },
        'Notification Details': {
          'insert Variables': '插入变量',
          'Email Subject': '邮件主题',
          'Email Text sign up confirmation': '欢迎来到 {shop_name} - 您的愿望清单已准备就绪！',
          'Email Text wishlist shared': '您的愿望清单已分享',
          'Email Text wishlist reminder': "别忘了您的 {shop_name} 愿望清单商品！",
          'Email Text Send reminders on Items Saved for Later': "您在 {shop_name} 保存的商品正在等待您",
          'Email Text Send low stocks alerts': "低库存警报：{shop_name} 的 {product_name}",
          'Email Text Send Price Drop Alert': "降价警报：{shop_name} 的 {product_name}",
          'Email Text Send Back in stock alert': "补货：{shop_name} 的 {product_name}",
          'Branding': '品牌',
          'Branding Type': '品牌类型',
          'Store name': '商店名称',
          'image': '图片',
          'Logo': '标志',
          'image width': '图片宽度',
          'Text Color': '文本颜色',
          'Background Color': '背景颜色',
          'Padding Top': '上边距',
          'Padding Bottom': '下边距',
          'Text': '文本',
          'Content': '内容',
          'Text in Text field sign up confirmation': '您好 {customer_first_name} {customer_last_name}\n欢迎来到 {shop_name}！您的愿望清单已成功创建。您现在可以开始保存您喜爱的产品，并接收关于降价、库存更新等的通知。\n\n购物愉快！\n您在 {shop_name} 的朋友',
          'Text in Text field wishlist shared': '您好 {customer_first_name} {customer_last_name}，\n\n您的愿望清单已成功分享！您的朋友和家人现在可以看到您喜爱的商品，并帮助您决定购买什么。\n\n分享愉快！\n您在 {shop_name} 的朋友',
          'Text in Text field wishlist reminder': '您好 {customer_first_name} {customer_last_name}，\n\n别忘了您愿望清单中的精彩商品！您有 {wishlist_count} 个商品在等待您。\n\n购物愉快！\n您在 {shop_name} 的朋友',
          'Text in Text field Send reminders on Items Saved for Later': '您好 {customer_first_name} {customer_last_name}，\n\n您保存的商品仍在等待您！您有 {saved_count} 个商品保存到稍后。\n\n购物愉快！\n您在 {shop_name} 的朋友',
          'Text in Text field Send low stocks alerts': '您好 {customer_first_name} {customer_last_name}，\n\n赶快！{product_name} 库存不足。仅剩 {stock_count} 个单位！\n\n不要错过！\n您在 {shop_name} 的朋友',
          'Text in Text field Send Price Drop Alert': '您好 {customer_first_name} {customer_last_name}，\n\n好消息！{product_name} 现在正在促销！价格从 {old_price} 降至 {new_price}，下降了 {price_drop_percentage}%。\n\n购物愉快！\n您在 {shop_name} 的朋友',
          'Text in Text field Send Back in stock alert': '您好 {customer_first_name} {customer_last_name}，\n\n好消息！{product_name} 已补货，准备供您购买！\n\n不要错过！\n您在 {shop_name} 的朋友',
          'Text Alignment': '文本对齐',
          'Background Color': '背景颜色',
          'Item Text Color': '商品文本颜色',
          'Action button': '操作按钮',
          'Action Button Text': '按钮文本',
          'Link': '链接',
          'Tracking Link': '跟踪链接',
          'Customize Link': '自定义链接',
          'Action Button Width (%)': '按钮宽度 (%)',
          'Action Button Font Size': '字体大小',
          'Action Button Color': '按钮颜色',
          'Action Button Color': '按钮颜色',
          'Action Button Text Color': '文本颜色',
          'Action Button Alignment': '对齐',
          'Background Color Button Area': '背景颜色',
          'Footer': '页脚',
          'Footer Text': '文本',
          'Footer Text to send in sign up confirmation': '感谢您选择 {shop_name}！\n{shop_name}',
          'Footer Text to send in wishlist shared': '分享愉快！\n{shop_name}',
          'Footer Text to send in wishlist reminder': '购物愉快！\n{shop_name}',
          'Footer Text to send in Send reminders on Items Saved for Later': '购物愉快！\n{shop_name}',
          'Footer Text to send in Send low stocks alerts': '不要错过！\n{shop_name}',
          'Footer Text to send in Send Price Drop Alert': '购物愉快！\n{shop_name}',
          'Footer Text to send in Send Back in stock alert': '不要错过！\n{shop_name}',
          'Text Alignment Footer': '文本对齐',
          'Text Color Footer': '文本颜色',
          'Background Color Footer': '背景颜色',
          'Theme settings': '主题设置',
          'Global setting': '全局设置',
          'Font Family': '字体系列',
          'Save': '保存',
'Section': '部分',
'SF Pro Text': 'SF Pro Text',
'Arial': 'Arial',
'Courier New': 'Courier New',
'Georgia': 'Georgia',
'Lucida Sans Unicode': 'Lucida Sans Unicode',
'Tahoma': 'Tahoma',
'Times New Roman': 'Times New Roman',
'Trebuchet MS': 'Trebuchet MS',
'Verdana': 'Verdana',
"Back": "返回"
        },
        Installation: {
          'Installation instructions': '安装说明',
          'Follow the steps below to install': '按照以下步骤在您的Shopify商店中安装愿望清单小部件应用。',
          'Contact Us': '联系我们',
          'Paragraph Contact Us': '如果您没有编程知识，请通过实时聊天或创建支持票与我们联系。',
          'Contact Support': '联系支持',
          'Theme Extension Tab': '主题扩展',
          'Expert Setup Tab': '专家设置',
          'Manual Install Tab': '手动安装',
          'Current theme status': '当前主题状态',
          'Select Theme': '选择主题',
          'Current theme app embed status' : "当前（已发布）主题的应用嵌入状态",
          'App embed Status': '应用嵌入状态',
          "Enable": "启用",
          "Disable": "禁用",
          'Enable Wishlist app embed': '启用愿望清单应用嵌入',
          'Enable the Wishlist Configurations': '通过进入Shopify主题自定义，在主题设置的App embeds中启用愿望清单配置。',
          'Activate Button': '激活',
          'Add Wishlist block': '添加愿望清单块',
          'Add app block Text': '添加应用块以在您选择的主题上显示愿望清单功能。自定义块位置以根据您的偏好实现完美放置。',
          'Wishlist Widget Near Cart Button': '购物车按钮附近的愿望清单小部件',
          'Add Wishlist Widget Cart Button Text': "要添加愿望清单小部件，请转到Shopify主题自定义部分并点击添加块。",
          'Button Text Wishlist Widget Near Cart Button': '购物车按钮附近的愿望清单小部件',
          'Wishlist Widget On Product Image': '产品图片上的愿望清单小部件',
          'Button text Wishlist Widget On Product Image': '产品图片上的愿望清单小部件',
          'Text Wishlist Widget product image': "转到Shopify主题自定义部分并点击添加块以在产品图片上添加愿望清单小部件",
          "Wishlist Widget Collection page": '系列页面上的愿望清单小部件',
          "Button text Wishlist Widget Collection page": "系列页面上的愿望清单小部件",
          "Text Wishlist Widget Collection page": "在Shopify自定义中，点击添加块以在系列页面上添加愿望清单小部件。",
          "My Wishlist Section": "我的愿望清单部分",
          "Button text My Wishlist Section": "我的愿望清单部分",
          "Text My Wishlist Section": "要添加我的愿望清单部分，请导航到Shopify主题自定义页面并点击添加块以添加我的愿望清单部分并查看您的愿望清单商品。",
        },
        "Save Bar": {
          "Save": "保存",
          "Discard": "放弃",
          "Unsaved Changes": "未保存的更改"
        },
        "Modals": {
          "Add New Language": "添加新语言",
          "Enter language name (e.g., Swedish, Turkish)": "输入语言名称（例如，瑞典语，土耳其语）",
          "Language Name": "语言名称",
          "Cancel": "取消",
          "Add Language": "添加语言",
          "Image": "图片",
          "Close": "关闭"
        }
      },
      Japanese: {
        'Sidebar Tabs': {
          'Configuration': '設定',
          'Settings': '設定',
          'Customers': '顧客'
        },
        Dashboard: {
          'Dashboard': 'ダッシュボード',
          'Active Wishlist Widget': 'アクティブウィッシュリストウィジェット',
          'Text active wishlist widget': '完全な機能を確保するために、ShopifyテーマのApp Embedsセクションでウィッシュリスト設定を有効にしてください。',
          'Button text activate wishlist widget': '有効化',
          'Wishlist Highlights': 'ウィッシュリストハイライト',
          'Total Wishlist Products': 'ウィッシュリスト商品総数',
          'Total Lists': 'リスト総数',
          'Setup Guide': 'セットアップガイド',
          'completed': '完了',
          'Smart Notifications Alerts': 'スマート通知アラート',
          'Set up automated email notifications for new reviews': '新しいレビューの自動メール通知を設定',
          'Button Text smart notification alerts': 'アラートを設定',
          'Widget Personalization': 'ウィジェットパーソナライゼーション',
          'Paragraph Widget Personalization': 'ウィジェットを選択し、デザインをストアに合わせて調整',
          'Button Text Widget Personalization': 'ウィジェットをカスタマイズ',
          'Localize': 'ローカライゼーション',
          'Paragraph Localize': 'レビュー関連のすべてのテキストを簡単に編集または翻訳',
          'Button Text Localize': 'テキストを編集',
          'Much more than a Wishlist': 'ウィッシュリスト以上のもの',
          'subtitle much more than wishlist': '閲覧から購入まで、ショッパーの旅全体でエンゲージメント',
          'tabs why it matters': 'なぜ重要なのか',
          'Capture Intent': '意図をキャプチャ',
          'Capture Intent 1st tab Title': 'お気に入りをウィッシュリストに追加',
          'Capture Intent 1st tab 1st paragraph': "ショッパーが愛する商品を簡単に再訪問でき、リピート訪問と購入可能性を向上させます。",
          'Capture Intent 1st tab 2nd Paragraph': "Sew Trendyは、ウィッシュリストに追加する顧客のコンバージョン率が187%向上しました",
          'Capture Intent 2nd tab Title': "カートから後で保存",
          'Capture Intent 2nd tab 1st paragraph': "将来の購入のために商品を手元に保管し、カート削除を減らし、躊躇する買い手を特定するのに役立ちます。",
          'Capture Intent 2nd tab 2nd paragraph': "Willow Boutiqueはカート削除の約15%を回復し、ウィッシュリストアラートで100倍のROIを獲得しました。",
          'Capture Identity': 'アイデンティティをキャプチャ',
          'Capture Identity 1st tab Title': "在庫切れ商品に登録",
          'Capture Identity 1st tab 1st paragraph': "利用できない商品からのフラストレーションを防ぎ、見逃さないようにし、失った売上を回復するのに役立ちます。",
          'Capture Identity 1st tab 2nd paragraph': "Tibiは、在庫復旧アラートでコンバージョンする可能性が4倍高い顧客を見ました",
          'Capture Identity 2nd tab Title': "ウィッシュリストを保存・共有",
          'Capture Identity 2nd tab 1st paragraph': "パーソナライズされたリマインダーと共有ウィッシュリストでショッパーをエンゲージし、リピート訪問とコンバージョンを向上させます。ショッパーがすべてのデバイスと訪問でウィッシュリストにアクセスでき、匿名訪問者を識別された顧客に変換します。",
          'Capture Identity 2nd tab 2nd paragraph': "Credo Beautyは共有ウィッシュリストを使用してソーシャルエンゲージメントとコンバージョンを向上させました",
          'Engage & Convert': 'エンゲージ・コンバート',
          'Engage & Convert 1st tab Title': "ウィッシュリストリマインダーアラート",
          'Engage & Convert 1st tab 1st paragraph': "ショッパーを保存された商品に戻し、離脱を減らし、コンバージョンを向上させます。",
          'Engage & Convert 1st tab 2nd paragraph': "White Oak Pasturesはウィッシュリストでコンバージョンが4倍、AOVが10%向上しました",
          'Engage & Convert 2nd tab Title': "価格下落アラート",
          'Engage & Convert 2nd tab 1st paragraph': "既に欲しい商品の節約について通知し、コンバージョンの可能性を向上させます。",
          'Engage & Convert 2nd tab 2nd paragraph': "Brightonは価格下落通知でAOVとLTVを向上させました",
          'Engage & Convert 3rd tab Title': "在庫不足アラート",
          'Engage & Convert 3rd tab 1st paragraph': "ショッパーがお気に入りを見逃さないようにし、緊急感を作り出します。",
          'Engage & Convert 3rd tab 2nd paragraph': "Cirque Colorsは在庫不足アラートで緊急感とコンバージョンを促進しました",
          'Retain & Re-Engage': 'リテンション・リエンゲージ',
          'Retain & Re-Engage 1st tab Title': "パーソナライズキャンペーン",
          'Retain & Re-Engage 1st tab 1st paragraph': "ウィッシュリストとブラウジング活動に基づく高意図ショッパーのためのハイパーターゲティングキャンペーンで顧客リテンションを向上させます。",
          'Retain & Re-Engage 1st tab 2nd paragraph': "Block ZoneのAOVはKlaviyoウィッシュリストキャンペーンで35%向上しました",
          'Retain & Re-Engage 2nd tab Title': "ウィッシュリストコンテストで勝利",
          'Retain & Re-Engage 2nd tab 1st paragraph': "ショッパーはお気に入り商品を獲得する興奮を楽しみ、エンゲージメント、ソーシャルシェア、コンバージョンを促進します。",
          'Retain & Re-Engage 2nd tab 2nd paragraph': "POPFLEXはウィッシュリストベースのギブアウェイキャンペーンで90Kの顧客を追加しました",
          'Retain & Re-Engage 3rd tab Title': "オムニチャンネルエクスペリエンス",
          'Retain & Re-Engage 3rd tab 1st paragraph': "オンラインとオフラインのショッピングエクスペリエンスの境界を曖昧にし、販売担当者が顧客の好みに基づいてパーソナライゼーションするのを支援します。",
          'Retain & Re-Engage 3rd tab 2nd paragraph': "Bombshell SportswearはTapcartを使用してウィッシュリスト収益が73%向上しました",
          'Quick Select': '快速选择',
          'Today': '今天',
          'Yesterday': '昨天',
          'Last 7 Days': '最近7天',
          'Last 30 Days': '最近30天',
          'This Month': '本月',
          'Last Month': '上月',
          'Start Date': '开始日期',
          'End Date': '结束日期',
          'Cancel': '取消',
          'Apply': '应用'
        },
        Configurations: {
          'Configurations': '配置',
          'Subtitle Configurations': '自定义按钮样式、颜色、图标和愿望清单行为。调整愿望清单的显示方式，设置收藏和购物车选项，并即时预览更改。所有更改都适用于您的商店前端。',
          'Basics': '基本',
          'Colors' : 'カラー',
          'Primary color': 'プライマリカラー',
          'Secondary color': 'セカンダリカラー',
          'Icons': 'アイコン',
          'Heart': 'ハート',
          'Star': 'スター',
          'Bookmark': 'ブックマーク',
          'Button size': 'ボタンサイズ',
          'Icon thickness': 'アイコンの太さ',
          'Product page': '商品ページ',
          'Button Position': 'ボタン位置',
          'Near cart button': 'カートボタン近く',
          'On product image': '商品画像上',
          'Above Cart Button': 'カートボタン上',
          'Below Cart Button': 'カートボタン下',
          'Left of Cart Button': 'カートボタン左',
          'Right of Cart Button': 'カートボタン右',
          'Top Left': '左上',
          'Top Right': '右上',
          'Bottom Left': '左下',
          'Bottom Right': '右下',
          'Button Style': 'ボタンスタイル',
          'Only Icon': 'アイコンのみ',
          'Only Text': 'テキストのみ',
          'Icon and Text': 'アイコンとテキスト',
          'Button Type': 'ボタンタイプ',
          'Solid': "ソリッド",
          'Outline': "アウトライン",
          'Plain': "プレーン",
          'Button text': 'ボタンテキスト',
          'Before Click': 'クリック前',
          'After Click': 'クリック後',
          'Label': 'ラベル',
          'Add To Wishlist' : 'ウィッシュリストに追加',
          'Added To Wishlist' : 'ウィッシュリストに追加済み',
          'Other Settings': 'その他の設定',
          'Smart Save': 'スマート保存：ショッパーが3回以上訪問した商品の自動ウィッシュリスト',
          'Social Proof': 'ソーシャルプルーフ：商品をウィッシュリストに追加した人数を表示',
          'Collections': 'コレクション',
          'Add item to wishlist from collection page': 'ショッパーがコレクションページからウィッシュリストに商品を追加できるようにする',
          'Button Position': 'ボタン位置',
          'Top Left': '左上',
          'Top Right': '右上',
          'Bottom Left': '左下',
          'Bottom Right': '右下',
          'Wishlist Page': 'ウィッシュリストページ',
          'Text Color': 'テキストカラー',
          'Type': 'タイプ',
          'Side Drawer': 'サイドドロワー',
          'Separate Page': '別ページ',
          'Pop-up Modal': 'ポップアップモーダル',
          'Page Title': 'ページタイトル',
          'Launch From': '起動元',
          'Header': 'ヘッダー',
          'Floating Button': 'フローティングボタン',
          'Navigation Menu': 'ナビゲーションメニュー',
          'Position': '位置',
          'Left': '左',
          'Right': '右',
          'Button Left': 'ボタン左',
          'Button Right': 'ボタン右',
          'Corner Radius': '角丸半径',
          'This needs to be set up manually': 'これは手動で設定する必要があります',
          'Show Count': 'カウントを表示',
          'Other Settings': 'その他の設定',
          'Allow shoppers to Share Wishlist': 'ショッパーがウィッシュリストを共有できるようにする',
          'Cart': 'カート',
          'Save for later pop-up': '後で保存ポップアップ',
          'Allow shoppers to save items': 'ショッパーがカートから削除する前に商品を保存できるようにする',
          'Pop-up title': 'ポップアップタイトル',
          'Primary button text': 'プライマリボタンテキスト',
          'Secondary button text': 'セカンダリボタンテキスト',
          'Permission': '権限',
          'Allow shoppers to save items': 'ショッパーがカートから削除する前に商品を保存できるようにする',
          'Ask the shopper if they want to see the pop-up again': 'ショッパーにポップアップを再度表示したいかどうか尋ねる',
          'Always show the pop-up': '常にポップアップを表示',
          'Always show the pop-up': '始终显示弹出窗口',
          'Do you want to save this product for later?' :'この商品を後ほど保存しますか?',
          'No, thanks!' :'結構です！',
          'Save For later' :'後で使用するために保存',
        },
        Settings: {
          'Settings': '設定',
          'Settings subtitle': 'アプリの設定を管理します',
          'Installtions': 'インストール',
          'installation subtitle': 'ウィッシュリストアプリをインストールする手順に従ってください',
          'Notifications': '通知',
          'Notifications subtitle': '通知は自動的に送信されます。',
          'Language Settings': '言語設定',
          'Language Settings subtitle': 'フロントエンド言語コンテンツをカスタマイズ。',
           "Language Settings Text": "ストア全体の言語を変更する際、Wishlistアプリはタブやボタンを含むすべてのセクションの言語を柔軟に変更できます。",
          'Integerations': '統合',
          'Integrations subtitle': '接続されたアプリを表示・管理。',
        },
        Notifications: {
          'Notifications': '通知',
          'Notifications Subtitle': '通知は自動的に送信されます。',
          'Alerts and Notifications': 'アラートと通知',
          'Days': '日',
          'Hours': '時間',
          'Sign up confirmation': '登録確認',
          'Send a confirmation': 'ショッパーがウィッシュリストを保存したときに確認を送信',
          'Wishlist Shared': 'ウィッシュリスト共有',
          'Send a alert when shoppers share their wishlist': 'ショッパーが他の人とウィッシュリストを共有したときにアラートを送信',
          'Wishlist Reminder': 'ウィッシュリストリマインダー',
          'Send reminders for wishlist ': '以下の期間後にウィッシュリスト商品のリマインダーを送信',
          'Send reminders on items saved for later': '後で保存された商品のリマインダーを送信',
          'Send reminders for items saved for later after': '以下の期間後に後で保存された商品のリマインダーを送信',
          'Send low stock alerts': '在庫不足アラートを送信',
          'Send an alert when stock drops below': '在庫が以下の数値以下になったときにアラートを送信',
          'units': '単位',
          'Send Price Drop alert': '価格下落アラートを送信',
          'Send an alert when price drops by': '価格が以下の割合下落したときにアラートを送信',
          'Send back in stock alerts': '在庫復旧アラートを送信',
          'Send an alert when wislisted items are back in stock': 'ウィッシュリスト商品が在庫復旧したときにアラートを送信',
        },
        'Notification Details': {
          'insert Variables': '変数を挿入',
          'Email Subject': 'メール件名',
          'Email Text sign up confirmation': '{shop_name}へようこそ - ウィッシュリストの準備ができました！',
          'Email Text wishlist shared': 'ウィッシュリストが共有されました',
          'Email Text wishlist reminder': "{shop_name}のウィッシュリスト商品をお忘れなく！",
          'Email Text Send reminders on Items Saved for Later': "{shop_name}で保存された商品がお待ちしています",
          'Email Text Send low stocks alerts': "在庫不足アラート：{shop_name}の{product_name}",
          'Email Text Send Price Drop Alert': "価格下落アラート：{shop_name}の{product_name}",
          'Email Text Send Back in stock alert': "在庫復旧：{shop_name}の{product_name}",
          'Branding': 'ブランディング',
          'Branding Type': 'ブランディングタイプ',
          'Store name': 'ストア名',
          'image': '画像',
          'Logo': 'ロゴ',
          'image width': '画像幅',
          'Text Color': 'テキストカラー',
          'Background Color': '背景色',
          'Padding Top': '上部パディング',
          'Padding Bottom': '下部パディング',
          'Text': 'テキスト',
          'Content': 'コンテンツ',
          'Text in Text field sign up confirmation': 'こんにちは {customer_first_name} {customer_last_name}\n{shop_name}へようこそ！ウィッシュリストが正常に作成されました。お気に入りの商品の保存を開始し、価格下落、在庫更新などの通知を受け取ることができます。\n\nショッピングをお楽しみください！\n{shop_name}の皆様',
          'Text in Text field wishlist shared': 'こんにちは {customer_first_name} {customer_last_name}、\n\nウィッシュリストが正常に共有されました！ご友人やご家族がお気に入りの商品を確認し、何を購入するか決めるお手伝いができるようになりました。\n\n共有をお楽しみください！\n{shop_name}の皆様',
          'Text in Text field wishlist reminder': 'こんにちは {customer_first_name} {customer_last_name}、\n\nウィッシュリストの素晴らしい商品をお忘れなく！{wishlist_count}個の商品がお待ちしています。\n\nショッピングをお楽しみください！\n{shop_name}の皆様',
          'Text in Text field Send reminders on Items Saved for Later': 'こんにちは {customer_first_name} {customer_last_name}、\n\n保存された商品がまだお待ちしています！{saved_count}個の商品が後用に保存されています。\n\nショッピングをお楽しみください！\n{shop_name}の皆様',
          'Text in Text field Send low stocks alerts': 'こんにちは {customer_first_name} {customer_last_name}、\n\n急いで！{product_name}の在庫が不足しています。残り{stock_count}個のみ！\n\nお見逃しなく！\n{shop_name}の皆様',
          'Text in Text field Send Price Drop Alert': 'こんにちは {customer_first_name} {customer_last_name}、\n\n良いニュース！{product_name}がセール中です！価格が{old_price}から{new_price}に{price_drop_percentage}%下落しました。\n\nショッピングをお楽しみください！\n{shop_name}の皆様',
          'Text in Text field Send Back in stock alert': 'こんにちは {customer_first_name} {customer_last_name}、\n\n良いニュース！{product_name}が在庫復旧し、購入の準備ができました！\n\nお見逃しなく！\n{shop_name}の皆様',
          'Text Alignment': 'テキスト配置',
          'Background Color': '背景色',
          'Item Text Color': '商品テキストカラー',
          'Action button': 'アクションボタン',
          'Action Button Text': 'ボタンテキスト',
          'Link': 'リンク',
          'Tracking Link': 'トラッキングリンク',
          'Customize Link': 'リンクをカスタマイズ',
          'Action Button Width (%)': 'ボタン幅 (%)',
          'Action Button Font Size': 'フォントサイズ',
          'Action Button Color': 'ボタンカラー',
          'Action Button Color': 'ボタンカラー',
          'Action Button Text Color': 'テキストカラー',
          'Action Button Alignment': '配置',
          'Background Color Button Area': '背景色',
          'Footer': 'フッター',
          'Footer Text': 'テキスト',
          'Footer Text to send in sign up confirmation': '{shop_name}をお選びいただき、ありがとうございます！\n{shop_name}',
          'Footer Text to send in wishlist shared': '共有をお楽しみください！\n{shop_name}',
          'Footer Text to send in wishlist reminder': 'ショッピングをお楽しみください！\n{shop_name}',
          'Footer Text to send in Send reminders on Items Saved for Later': 'ショッピングをお楽しみください！\n{shop_name}',
          'Footer Text to send in Send low stocks alerts': 'お見逃しなく！\n{shop_name}',
          'Footer Text to send in Send Price Drop Alert': 'ショッピングをお楽しみください！\n{shop_name}',
          'Footer Text to send in Send Back in stock alert': 'お見逃しなく！\n{shop_name}',
          'Text Alignment Footer': 'テキスト配置',
          'Text Color Footer': 'テキストカラー',
          'Background Color Footer': '背景色',
          'Theme settings': 'テーマ設定',
          'Global setting': 'グローバル設定',
          'Font Family': 'フォントファミリー',
          'Save': '保存',
'Section': 'セクション',
'SF Pro Text': 'SF Pro Text',
'Arial': 'Arial',
'Courier New': 'Courier New',
'Georgia': 'Georgia',
'Lucida Sans Unicode': 'Lucida Sans Unicode',
'Tahoma': 'Tahoma',
'Times New Roman': 'Times New Roman',
'Trebuchet MS': 'Trebuchet MS',
'Verdana': 'Verdana',
"Back": "戻る" 
        },
        Installation: {
          'Installation instructions': 'インストール手順',
          'Follow the steps below to install': '以下の手順に従ってShopifyストアにウィッシュリストウィジェットアプリをインストールしてください。',
          'Contact Us': 'お問い合わせ',
          'Paragraph Contact Us': 'プログラミングの知識がない場合は、Live Chatまたはサポートチケットを作成してお問い合わせください。',
          'Contact Support': 'サポートに連絡',
          'Theme Extension Tab': 'テーマ拡張',
          'Expert Setup Tab': 'エキスパートセットアップ',
          'Manual Install Tab': '手動インストール',
          'Current theme status': '現在のテーマステータス',
          'Select Theme': 'テーマを選択',
          'Current theme app embed status' : "現在の（公開済み）テーマのアプリ埋め込みステータス",
          'App embed Status': 'アプリ埋め込みステータス',
          "Enable": "有効化",
          "Disable": "無効化",
          'Enable Wishlist app embed': 'ウィッシュリストアプリ埋め込みを有効化',
          'Enable the Wishlist Configurations': 'Shopifyテーマカスタマイゼーションに移動して、テーマ設定のApp embedsからウィッシュリスト設定を有効にしてください。',
          'Activate Button': '有効化',
          'Add Wishlist block': 'ウィッシュリストブロックを追加',
          'Add app block Text': '選択したテーマにウィッシュリスト機能を表示するためにアプリブロックを追加します。お好みに応じて完璧な配置を実現するためにブロック位置をカスタマイズします。',
          'Wishlist Widget Near Cart Button': 'カートボタン近くのウィッシュリストウィジェット',
          'Add Wishlist Widget Cart Button Text': "ウィッシュリストウィジェットを追加するには、Shopifyテーマカスタマイゼーションセクションに移動し、ブロックを追加をクリックしてください。",
          'Button Text Wishlist Widget Near Cart Button': 'カートボタン近くのウィッシュリストウィジェット',
          'Wishlist Widget On Product Image': '商品画像上のウィッシュリストウィジェット',
          'Button text Wishlist Widget On Product Image': '商品画像上のウィッシュリストウィジェット',
          'Text Wishlist Widget product image': "Shopifyテーマカスタマイゼーションセクションに移動し、ブロックを追加をクリックして商品画像にウィッシュリストウィジェットを追加してください",
          "Wishlist Widget Collection page": 'コレクションページのウィッシュリストウィジェット',
          "Button text Wishlist Widget Collection page": "コレクションページのウィッシュリストウィジェット",
          "Text Wishlist Widget Collection page": "Shopifyカスタマイゼーションで、ブロックを追加をクリックしてコレクションページにウィッシュリストウィジェットを追加してください。",
          "My Wishlist Section": "マイウィッシュリストセクション",
          "Button text My Wishlist Section": "マイウィッシュリストセクション",
          "Text My Wishlist Section": "マイウィッシュリストセクションを追加するには、Shopifyテーマカスタマイゼーションページに移動し、ブロックを追加をクリックしてマイウィッシュリストセクションを追加し、ウィッシュリスト商品を表示してください。",
        },
        "Save Bar": {
          "Save": "保存",
          "Discard": "破棄",
          "Unsaved Changes": "未保存の変更"
        },
        "Modals": {
          "Add New Language": "新しい言語を追加",
          "Enter language name (e.g., Swedish, Turkish)": "言語名を入力（例：スウェーデン語、トルコ語）",
          "Language Name": "言語名",
          "Cancel": "キャンセル",
          "Add Language": "言語を追加",
          "Image": "画像",
          "Close": "閉じる"
        }
      }, Italian: {
        'Sidebar Tabs': {
          'Configuration': 'Configurazione',
          'Settings': 'Impostazioni',
          'Customers': 'Clienti'
        },
        Dashboard: {
          'Dashboard': 'Dashboard',
          'Active Wishlist Widget': 'Widget Lista Desideri Attivo',
          'Text active wishlist widget': 'Per garantire la funzionalità completa, abilita le configurazioni della lista desideri nella sezione App Embeds del tuo tema Shopify.',
          'Button text activate wishlist widget': 'Attiva',
          'Wishlist Highlights': 'Evidenziazioni Lista Desideri',
          'Total Wishlist Products': 'Totale Prodotti Lista Desideri',
          'Total Lists': 'Totale Liste',
          'Setup Guide': 'Guida all\'Installazione',
          'completed': 'completato',
          'Smart Notifications Alerts': 'Avvisi Notifiche Intelligenti',
          'Set up automated email notifications for new reviews': 'Configura notifiche email automatizzate per nuove recensioni',
          'Button Text smart notification alerts': 'Configura Avvisi',
          'Widget Personalization': 'Personalizzazione Widget',
          'Paragraph Widget Personalization': 'Scegli widget e adatta il loro design al tuo negozio',
          'Button Text Widget Personalization': 'Personalizza Widget',
          'Localize': 'Localizza',
          'Paragraph Localize': 'Modifica o traduci facilmente tutto il testo relativo alle recensioni',
          'Button Text Localize': 'Modifica Testo',
          'Much more than a Wishlist': 'Molto più di una Lista Desideri',
          'subtitle much more than wishlist': 'Coinvolgi gli acquirenti durante tutto il loro percorso—dalla navigazione all\'acquisto',
          'tabs why it matters': 'Perché è importante',
          'Capture Intent': 'Cattura Intenzione',
          'Capture Intent 1st tab Title': 'Aggiungi Preferiti alla Lista Desideri',
          'Capture Intent 1st tab 1st paragraph': "Rende facile per gli acquirenti rivisitare i prodotti che amano, aumentando le visite di ritorno e la probabilità di acquisto.",
          'Capture Intent 1st tab 2nd Paragraph': "Sew Trendy ha visto un aumento del 187% nei tassi di conversione per i clienti che aggiungono alla lista desideri",
          'Capture Intent 2nd tab Title': "Salva per Dopo dal Carrello",
          'Capture Intent 2nd tab 1st paragraph': "Mantieni i prodotti a portata di mano per acquisti futuri, riducendo le eliminazioni del carrello e aiutandoti a identificare acquirenti esitanti.",
          'Capture Intent 2nd tab 2nd paragraph': "Willow Boutique ha recuperato ~15% delle eliminazioni del carrello e ottenuto un ROI di 100x sugli avvisi lista desideri.",
          'Capture Identity': 'Cattura Identità',
          'Capture Identity 1st tab Title': "Iscriviti agli Articoli Esauriti",
          'Capture Identity 1st tab 1st paragraph': "Previene la frustrazione dei prodotti non disponibili, assicura che non perdano nulla e ti aiuta a recuperare vendite perse.",
          'Capture Identity 1st tab 2nd paragraph': "Tibi ha visto clienti 4x più propensi a convertire tramite avvisi di ritorno in stock",
          'Capture Identity 2nd tab Title': "Salva e Condividi Lista Desideri",
          'Capture Identity 2nd tab 1st paragraph': "Mantiene gli acquirenti coinvolti con promemoria personalizzati e liste desideri condivise, aumentando visite ripetute e conversioni. Dà agli acquirenti accesso alle loro liste desideri su tutti i dispositivi e visite, convertendo visitatori anonimi in clienti identificati.",
          'Capture Identity 2nd tab 2nd paragraph': "Credo Beauty ha aumentato l'engagement sociale e le conversioni usando liste desideri condivise",
          'Engage & Convert': 'Coinvolgi e Converti',
          'Engage & Convert 1st tab Title': "Avvisi Promemoria Lista Desideri",
          'Engage & Convert 1st tab 1st paragraph': "Riporta gli acquirenti ai loro articoli salvati, riducendo gli abbandoni e aumentando le conversioni.",
          'Engage & Convert 1st tab 2nd paragraph': "White Oak Pastures ha visto 4x più conversioni e 10% di AOV più alto attraverso le liste desideri",
          'Engage & Convert 2nd tab Title': "Avvisi Calo Prezzi",
          'Engage & Convert 2nd tab 1st paragraph': "Li informa sui risparmi sugli articoli che vogliono già, aumentando la probabilità di conversione.",
          'Engage & Convert 2nd tab 2nd paragraph': "Brighton ha aumentato AOV e LTV con notifiche di calo prezzi",
          'Engage & Convert 3rd tab Title': "Avvisi Scorte Basse",
          'Engage & Convert 3rd tab 1st paragraph': "Aiuta gli acquirenti a evitare di perdere i loro preferiti, creando un senso di urgenza.",
          'Engage & Convert 3rd tab 2nd paragraph': "Cirque Colors ha stimolato urgenza e conversioni usando avvisi scorte basse",
          'Retain & Re-Engage': 'Mantieni e Ri-coinvolgi',
          'Retain & Re-Engage 1st tab Title': "Campagne Personalizzate",
          'Retain & Re-Engage 1st tab 1st paragraph': "Aumenta la ritenzione clienti con campagne iper-targetizzate per acquirenti ad alta intenzione basate sulla loro lista desideri e attività di navigazione.",
          'Retain & Re-Engage 1st tab 2nd paragraph': "L'AOV di Block Zone è aumentato del 35% con campagne lista desideri Klaviyo",
          'Retain & Re-Engage 2nd tab Title': "Vinci il Concorso della Tua Lista Desideri",
          'Retain & Re-Engage 2nd tab 1st paragraph': "Gli acquirenti godono dell'eccitazione di vincere i loro prodotti preferiti, stimolando engagement, condivisione sociale e conversioni.",
          'Retain & Re-Engage 2nd tab 2nd paragraph': "POPFLEX ha aggiunto 90K clienti tramite campagna giveaway basata su lista desideri",
          'Retain & Re-Engage 3rd tab Title': "Esperienza Omnicanale",
          'Retain & Re-Engage 3rd tab 1st paragraph': "Sfuma i confini tra esperienze di acquisto online e in negozio, aiutando i venditori a personalizzare in base alle preferenze clienti.",
          'Retain & Re-Engage 3rd tab 2nd paragraph': "Bombshell Sportswear ha visto un aumento del 73% dei ricavi lista desideri usando Tapcart",
          'Quick Select': 'クイック選択',
          'Today': '今日',
          'Yesterday': '昨日',
          'Last 7 Days': '過去7日間',
          'Last 30 Days': '過去30日間',
          'This Month': '今月',
          'Last Month': '先月',
          'Start Date': '開始日',
          'End Date': '終了日',
          'Cancel': 'キャンセル',
          'Apply': '適用'
        },
        Configurations: {
          'Configurations': 'Configurazioni',
          'Subtitle Configurations': 'Personalizza stili, colori, icone e comportamento dei pulsanti e delle liste dei desideri. Regola l\'aspetto delle liste dei desideri, imposta le opzioni di raccolta e carrello e visualizza in anteprima le modifiche all\'istante. Tutte le modifiche si applicano alla tua vetrina.',
          'Basics': 'Base',
          'Colors' : 'Colori',
          'Primary color': 'Colore primario',
          'Secondary color': 'Colore secondario',
          'Icons': 'Icone',
          'Heart': 'Cuore',
          'Star': 'Stella',

          'Bookmark': 'Segnalibro',
          'Button size': 'Dimensione pulsante',
          'Icon thickness': 'Spessore icona',
          'Product page': 'Pagina prodotto',
          'Button Position': 'Posizione pulsante',
          'Near cart button': 'Vicino al pulsante carrello',
          'On product image': 'Sull\'immagine del prodotto',
          'Above Cart Button': 'Sopra il pulsante carrello',
          'Below Cart Button': 'Sotto il pulsante carrello',
          'Left of Cart Button': 'A sinistra del pulsante carrello',
          'Right of Cart Button': 'A destra del pulsante carrello',
          'Top Left': 'Alto sinistra',
          'Top Right': 'Alto destra',
          'Bottom Left': 'Basso sinistra',
          'Bottom Right': 'Basso destra',
          'Button Style': 'Stile pulsante',
          'Only Icon': 'Solo icona',
          'Only Text': 'Solo testo',
          'Icon and Text': 'Icona e testo',
          'Button Type': 'Tipo pulsante',
          'Solid': "Solido",
          'Outline': "Contorno",
          'Plain': "Semplice",
          'Button text': 'Testo pulsante',
          'Before Click': 'Prima del clic',
          'After Click': 'Dopo il clic',
          'Label': 'Etichetta',
          'Add To Wishlist' : 'Aggiungi alla lista desideri',
          'Added To Wishlist' : 'Aggiunto alla lista desideri',
          'Other Settings': 'Altre impostazioni',
          'Smart Save': 'Salvataggio intelligente: Auto-lista desideri per prodotti visitati tre volte o più dall\'acquirente',
          'Social Proof': 'Prova sociale: Mostra il numero di persone che hanno aggiunto il prodotto alla loro lista desideri',
          'Collections': 'Collezioni',
          'Add item to wishlist from collection page': 'Permetti agli acquirenti di aggiungere articoli alla lista desideri dalle pagine collezioni',
          'Button Position': 'Posizione pulsante',
          'Top Left': 'Alto sinistra',
          'Top Right': 'Alto destra',
          'Bottom Left': 'Basso sinistra',
          'Bottom Right': 'Basso destra',
          'Wishlist Page': 'Pagina lista desideri',
          'Text Color': 'Colore testo',
          'Type': 'Tipo',
          'Side Drawer': 'Cassetto laterale',
          'Separate Page': 'Pagina separata',
          'Pop-up Modal': 'Modal pop-up',
          'Page Title': 'Titolo pagina',
          'Launch From': 'Avvia da',
          'Header': 'Intestazione',
          'Floating Button': 'Pulsante fluttuante',
          'Navigation Menu': 'Menu di navigazione',
          'Position': 'Posizione',
          'Left': 'Sinistra',
          'Right': 'Destra',
          'Button Left': 'Pulsante sinistra',
          'Button Right': 'Pulsante destra',
          'Corner Radius': 'Raggio angolo',
          'This needs to be set up manually': 'Questo deve essere configurato manualmente',
          'Show Count': 'Mostra conteggio',
          'Other Settings': 'Altre impostazioni',
          'Allow shoppers to Share Wishlist': 'Permetti agli acquirenti di condividere la lista desideri',
          'Cart': 'Carrello',
          'Save for later pop-up': 'Salva per dopo pop-up',
          'Allow shoppers to save items': 'Permetti agli acquirenti di salvare articoli prima di rimuoverli dal carrello',
          'Pop-up title': 'Titolo pop-up',
          'Primary button text': 'Testo pulsante primario',
          'Secondary button text': 'Testo pulsante secondario',
          'Permission': 'Permesso',
          'Allow shoppers to save items': 'Permetti agli acquirenti di salvare articoli prima di rimuoverli dal carrello',
          'Ask the shopper if they want to see the pop-up again': 'Chiedi all\'acquirente se vuole vedere di nuovo il pop-up',
          'Always show the pop-up': 'Mostra sempre il pop-up',
          'Do you want to save this product for later?' :'Vuoi salvare questo prodotto per dopo?',
          'No, thanks!' :'No grazie!',
          'Save For later' :'Salva per dopo',
        },
        Settings: {
          'Settings': 'Impostazioni',
          'Settings subtitle': 'Gestisci le impostazioni dell\'app',
          'Installtions': 'Installazioni',
          'installation subtitle': 'Segui i passaggi per installare l\'app lista desideri',
          'Notifications': 'Notifiche',
          'Notifications subtitle': 'Le notifiche vengono inviate automaticamente.',
          'Language Settings': 'Impostazioni lingua',
          'Language Settings subtitle': 'Personalizza il contenuto linguistico frontend.',
          "Language Settings Text": "Quando modifichi la lingua dell'intero negozio, l'app Wishlist offre una flessibilità completa per modificare la lingua di tutte le sezioni, inclusi la scheda e il pulsante.",
          'Integerations': 'Integrazioni',
          'Integrations subtitle': 'Visualizza e gestisci le app connesse.',
        },
        Notifications: {
          'Notifications': 'Notifiche',
          'Notifications Subtitle': 'Le notifiche vengono inviate automaticamente.',
          'Alerts and Notifications': 'Avvisi e notifiche',
          'Days': 'Giorni',
          'Hours': 'Ore',
          'Sign up confirmation': 'Conferma iscrizione',
          'Send a confirmation': 'Invia una conferma quando gli acquirenti salvano la loro lista desideri',
          'Wishlist Shared': 'Lista desideri condivisa',
          'Send a alert when shoppers share their wishlist': 'Invia un avviso quando gli acquirenti condividono la loro lista desideri con altri',
          'Wishlist Reminder': 'Promemoria lista desideri',
          'Send reminders for wishlist ': 'Invia promemoria per articoli lista desideri dopo',
          'Send reminders on items saved for later': 'Invia promemoria su articoli salvati per dopo',
          'Send reminders for items saved for later after': 'Invia promemoria per articoli salvati per dopo dopo',
          'Send low stock alerts': 'Invia avvisi scorte basse',
          'Send an alert when stock drops below': 'Invia un avviso quando le scorte scendono sotto',
          'units': 'unità',
          'Send Price Drop alert': 'Invia avviso calo prezzi',
          'Send an alert when price drops by': 'Invia un avviso quando il prezzo scende del',
          'Send back in stock alerts': 'Invia avvisi ritorno in stock',
          'Send an alert when wislisted items are back in stock': 'Invia un avviso quando gli articoli della lista desideri sono di nuovo in stock',
        },
        'Notification Details': {
          'insert Variables': 'inserisci variabili',
          'Email Subject': 'Oggetto email',
          'Email Text sign up confirmation': 'Benvenuto in {shop_name} - La tua lista desideri è pronta!',
          'Email Text wishlist shared': 'La tua lista desideri è stata condivisa',
          'Email Text wishlist reminder': "Non dimenticare i tuoi articoli lista desideri {shop_name}!",
          'Email Text Send reminders on Items Saved for Later': "I tuoi articoli salvati ti aspettano in {shop_name}",
          'Email Text Send low stocks alerts': "Avviso scorte basse: {product_name} in {shop_name}",
          'Email Text Send Price Drop Alert': "Avviso calo prezzi: {product_name} in {shop_name}",
          'Email Text Send Back in stock alert': "Di nuovo in stock: {product_name} in {shop_name}",
          'Branding': 'Branding',
          'Branding Type': 'Tipo branding',
          'Store name': 'Nome negozio',
          'image': 'immagine',
          'Logo': 'Logo',
          'image width': 'Larghezza immagine',
          'Text Color': 'Colore testo',
          'Background Color': 'Colore sfondo',
          'Padding Top': 'Padding superiore',
          'Padding Bottom': 'Padding inferiore',
          'Text': 'Testo',
          'Content': 'Contenuto',
          'Text in Text field sign up confirmation': 'Ciao {customer_first_name} {customer_last_name}\nBenvenuto in {shop_name}! La tua lista desideri è stata creata con successo. Ora puoi iniziare a salvare i tuoi prodotti preferiti e ricevere notifiche su cali di prezzo, aggiornamenti di stock e altro ancora.\n\nBuono shopping!\nI tuoi amici in {shop_name}',
          'Text in Text field wishlist shared': 'Ciao {customer_first_name} {customer_last_name},\n\nLa tua lista desideri è stata condivisa con successo! I tuoi amici e la tua famiglia ora possono vedere i tuoi articoli preferiti e aiutarti a decidere cosa acquistare.\n\nBuona condivisione!\nI tuoi amici in {shop_name}',
          'Text in Text field wishlist reminder': 'Ciao {customer_first_name} {customer_last_name},\n\nNon dimenticare gli articoli incredibili nella tua lista desideri! Hai {wishlist_count} articoli che ti aspettano.\n\nBuono shopping!\nI tuoi amici in {shop_name}',
          'Text in Text field Send reminders on Items Saved for Later': 'Ciao {customer_first_name} {customer_last_name},\n\nI tuoi articoli salvati ti aspettano ancora! Hai {saved_count} articoli salvati per dopo.\n\nBuono shopping!\nI tuoi amici in {shop_name}',
          'Text in Text field Send low stocks alerts': 'Ciao {customer_first_name} {customer_last_name},\n\nAffrettati! {product_name} è a corto di stock. Solo {stock_count} unità rimanenti!\n\nNon perdere l\'occasione!\nI tuoi amici in {shop_name}',
          'Text in Text field Send Price Drop Alert': 'Ciao {customer_first_name} {customer_last_name},\n\nOttime notizie! {product_name} è ora in vendita! Il prezzo è sceso del {price_drop_percentage}% da {old_price} a {new_price}.\n\nBuono shopping!\nI tuoi amici in {shop_name}',
          'Text in Text field Send Back in stock alert': 'Ciao {customer_first_name} {customer_last_name},\n\nOttime notizie! {product_name} è di nuovo in stock e pronto per il tuo acquisto!\n\nNon perdere l\'occasione!\nI tuoi amici in {shop_name}',
          'Text Alignment': 'Allineamento testo',
          'Background Color': 'Colore sfondo',
          'Item Text Color': 'Colore testo articolo',
          'Action button': 'Pulsante azione',
          'Action Button Text': 'Testo pulsante',
          'Link': 'Link',
          'Tracking Link': 'Link di tracciamento',
          'Customize Link': 'Personalizza link',
          'Action Button Width (%)': 'Larghezza pulsante (%)',
          'Action Button Font Size': 'Dimensione font',
          'Action Button Color': 'Colore pulsante',
          'Action Button Color': 'Colore pulsante',
          'Action Button Text Color': 'Colore testo',
          'Action Button Alignment': 'Allineamento',
          'Background Color Button Area': 'Colore sfondo',
          'Footer': 'Piè di pagina',
          'Footer Text': 'Testo',
          'Footer Text to send in sign up confirmation': 'Grazie per aver scelto {shop_name}!\n{shop_name}',
          'Footer Text to send in wishlist shared': 'Buona condivisione!\n{shop_name}',
          'Footer Text to send in wishlist reminder': 'Buono shopping!\n{shop_name}',
          'Footer Text to send in Send reminders on Items Saved for Later': 'Buono shopping!\n{shop_name}',
          'Footer Text to send in Send low stocks alerts': 'Non perdere l\'occasione!\n{shop_name}',
          'Footer Text to send in Send Price Drop Alert': 'Buono shopping!\n{shop_name}',
          'Footer Text to send in Send Back in stock alert': 'Non perdere l\'occasione!\n{shop_name}',
          'Text Alignment Footer': 'Allineamento testo',
          'Text Color Footer': 'Colore testo',
          'Background Color Footer': 'Colore sfondo',
          'Theme settings': 'Impostazioni tema',
          'Global setting': 'Impostazione globale',
          'Font Family': 'Famiglia font',
          'Save': 'Salva',
'Section': 'Sezione',
'SF Pro Text': 'SF Pro Text',
'Arial': 'Arial',
'Courier New': 'Courier New',
'Georgia': 'Georgia',
'Lucida Sans Unicode': 'Lucida Sans Unicode',
'Tahoma': 'Tahoma',
'Times New Roman': 'Times New Roman',
'Trebuchet MS': 'Trebuchet MS',
'Verdana': 'Verdana',
 "Back": "Indietro"
        },
        Installation: {
          'Installation instructions': 'Istruzioni di installazione',
          'Follow the steps below to install': 'Segui i passaggi seguenti per installare l\'app widget lista desideri nel tuo negozio Shopify.',
          'Contact Us': 'Contattaci',
          'Paragraph Contact Us': 'Se non hai conoscenza di programmazione, contattaci tramite Live Chat o crea un ticket di supporto.',
          'Contact Support': 'Contatta il supporto',
          'Theme Extension Tab': 'Estensione tema',
          'Expert Setup Tab': 'Setup esperto',
          'Manual Install Tab': 'Installazione manuale',
          'Current theme status': 'Stato tema attuale',
          'Select Theme': 'Seleziona tema',
          'Current theme app embed status' : "Stato di incorporamento dell'app nel tema attuale (pubblicato)",
          'App embed Status': 'Stato incorporamento app',
          "Enable": "Abilita",
          "Disable": "Disabilita",
          'Enable Wishlist app embed': 'Abilita incorporamento app lista desideri',
          'Enable the Wishlist Configurations': 'Abilita le configurazioni lista desideri da App embeds nelle impostazioni tema andando nella personalizzazione tema Shopify.',
          'Activate Button': 'Attiva',
          'Add Wishlist block': 'Aggiungi blocco lista desideri',
          'Add app block Text': 'Aggiungi il blocco app per visualizzare la funzionalità lista desideri sul tuo tema selezionato. Personalizza le posizioni dei blocchi per ottenere il posizionamento perfetto secondo le tue preferenze.',
          'Wishlist Widget Near Cart Button': 'Widget lista desideri vicino al pulsante carrello',
          'Add Wishlist Widget Cart Button Text': "Per aggiungere un widget lista desideri, vai alla sezione personalizzazione tema Shopify e clicca su Aggiungi blocco.",
          'Button Text Wishlist Widget Near Cart Button': 'Widget lista desideri vicino al pulsante carrello',
          'Wishlist Widget On Product Image': 'Widget lista desideri sull\'immagine del prodotto',
          'Button text Wishlist Widget On Product Image': 'Widget lista desideri sull\'immagine del prodotto',
          'Text Wishlist Widget product image': "Vai alla sezione personalizzazione tema Shopify e clicca su Aggiungi blocco per aggiungere il widget lista desideri sull'immagine del prodotto",
          "Wishlist Widget Collection page": 'Widget lista desideri sulla pagina collezioni',
          "Button text Wishlist Widget Collection page": "Widget lista desideri sulla pagina collezioni",
          "Text Wishlist Widget Collection page": "Nella personalizzazione Shopify, clicca su Aggiungi blocco per aggiungere il widget lista desideri sulla pagina collezioni.",
          "My Wishlist Section": "Sezione Mia Lista Desideri",
          "Button text My Wishlist Section": "Sezione Mia Lista Desideri",
          "Text My Wishlist Section": "Per aggiungere una sezione Mia Lista Desideri, naviga alla pagina personalizzazione tema Shopify e clicca su Aggiungi blocco per aggiungere la sezione Mia Lista Desideri e visualizzare i tuoi articoli lista desideri.",
        },
        "Save Bar": {
          "Save": "Salva",
          "Discard": "Annulla",
          "Unsaved Changes": "Modifiche non salvate"
        },
        "Modals": {
          "Add New Language": "Aggiungi nuova lingua",
          "Enter language name (e.g., Swedish, Turkish)": "Inserisci il nome della lingua (es. svedese, turco)",
          "Language Name": "Nome della lingua",
          "Cancel": "Annulla",
          "Add Language": "Aggiungi lingua",
          "Image": "Immagine",
          "Close": "Chiudi"
        }
      },
      Arabic: {
        'Sidebar Tabs': {
          'Configuration': 'الإعدادات',
          'Settings': 'الإعدادات',
          'Customers': 'العملاء'
        },
        Dashboard: {
          'Dashboard': 'لوحة التحكم',
          'Active Wishlist Widget': 'أداة قائمة الأمنيات النشطة',
          'Text active wishlist widget': 'لضمان الوظائف الكاملة، يرجى تفعيل إعدادات قائمة الأمنيات في قسم App Embeds من سمة Shopify الخاصة بك.',
          'Button text activate wishlist widget': 'تفعيل',
          'Wishlist Highlights': 'أبرز قائمة الأمنيات',
          'Total Wishlist Products': 'إجمالي منتجات قائمة الأمنيات',
          'Total Lists': 'إجمالي القوائم',
          'Setup Guide': 'دليل الإعداد',
          'completed': 'مكتمل',
          'Smart Notifications Alerts': 'تنبيهات الإشعارات الذكية',
          'Set up automated email notifications for new reviews': 'إعداد إشعارات البريد الإلكتروني التلقائية للمراجعات الجديدة',
          'Button Text smart notification alerts': 'تكوين التنبيهات',
          'Widget Personalization': 'تخصيص الأداة',
          'Paragraph Widget Personalization': 'اختر الأدوات وطابق تصميمها مع متجرك',
          'Button Text Widget Personalization': 'تخصيص الأداة',
          'Localize': 'التوطين',
          'Paragraph Localize': 'تحرير أو ترجمة جميع النصوص المتعلقة بالمراجعات بسهولة',
          'Button Text Localize': 'تحرير النص',
          'Much more than a Wishlist': 'أكثر بكثير من قائمة أمنيات',
          'subtitle much more than wishlist': 'انخرط مع المتسوقين طوال رحلتهم—من التصفح إلى الشراء',
          'tabs why it matters': 'لماذا يهم',
          'Capture Intent': 'التقاط النية',
          'Capture Intent 1st tab Title': 'إضافة المفضلة إلى قائمة الأمنيات',
          'Capture Intent 1st tab 1st paragraph': "يجعل من السهل على المتسوقين إعادة زيارة المنتجات التي يحبونها، مما يزيد من الزيارات المتكررة واحتمالية الشراء.",
          'Capture Intent 1st tab 2nd Paragraph': "شهدت Sew Trendy زيادة بنسبة 187% في معدلات التحويل للعملاء الذين يضيفون إلى قائمة الأمنيات",
          'Capture Intent 2nd tab Title': "الحفظ للاحقاً من سلة التسوق",
          'Capture Intent 2nd tab 1st paragraph': "احتفظ بالمنتجات في متناول اليد للشراء المستقبلي، مع تقليل عمليات حذف سلة التسوق ومساعدتك في تحديد المتسوقين المترددين.",
          'Capture Intent 2nd tab 2nd paragraph': "استعادت Willow Boutique حوالي 15% من عمليات حذف سلة التسوق وحصلت على عائد استثمار 100x على تنبيهات قائمة الأمنيات.",
          'Capture Identity': 'التقاط الهوية',
          'Capture Identity 1st tab Title': "الاشتراك في المنتجات غير المتوفرة",
          'Capture Identity 1st tab 1st paragraph': "يمنع الإحباط من المنتجات غير المتوفرة، يضمن عدم تفويتهم لأي شيء، ويساعدك في استعادة المبيعات المفقودة.",
          'Capture Identity 1st tab 2nd paragraph': "شهدت Tibi عملاء أكثر عرضة للتحويل بـ 4 مرات عبر تنبيهات العودة للمخزون",
          'Capture Identity 2nd tab Title': "حفظ ومشاركة قائمة الأمنيات",
          'Capture Identity 2nd tab 1st paragraph': "يحافظ على انخراط المتسوقين مع التذكيرات المخصصة وقوائم الأمنيات المشتركة، مما يزيد من الزيارات المتكررة والتحويلات. يعطي المتسوقين إمكانية الوصول إلى قوائم أمنياتهم عبر جميع الأجهزة والزيارات، مع تحويل الزوار المجهولين إلى عملاء محددين.",
          'Capture Identity 2nd tab 2nd paragraph': "زادت Credo Beauty من التفاعل الاجتماعي والتحويلات باستخدام قوائم الأمنيات المشتركة",
          'Engage & Convert': 'الانخراط والتحويل',
          'Engage & Convert 1st tab Title': "تنبيهات تذكير قائمة الأمنيات",
          'Engage & Convert 1st tab 1st paragraph': "يعيد المتسوقين إلى منتجاتهم المحفوظة، مما يقلل من الانسحابات ويزيد من التحويلات.",
          'Engage & Convert 1st tab 2nd paragraph': "شهدت White Oak Pastures تحويلات أكثر بـ 4 مرات ومتوسط طلب أعلى بـ 10% عبر قوائم الأمنيات",
          'Engage & Convert 2nd tab Title': "تنبيهات انخفاض الأسعار",
          'Engage & Convert 2nd tab 1st paragraph': "يخبرهم بالمدخرات على المنتجات التي يريدونها بالفعل، مع زيادة احتمالية التحويل.",
          'Engage & Convert 2nd tab 2nd paragraph': "زاد Brighton من متوسط الطلب وقيمة العميل مدى الحياة مع إشعارات انخفاض الأسعار",
          'Engage & Convert 3rd tab Title': "تنبيهات المخزون المنخفض",
          'Engage & Convert 3rd tab 1st paragraph': "يساعد المتسوقين على تجنب تفويت مفضلاتهم، مع خلق شعور بالإلحاح.",
          'Engage & Convert 3rd tab 2nd paragraph': "دفعت Cirque Colors الإلحاح والتحويلات باستخدام تنبيهات المخزون المنخفض",
          'Retain & Re-Engage': 'الاحتفاظ وإعادة الانخراط',
          'Retain & Re-Engage 1st tab Title': "الحملات المخصصة",
          'Retain & Re-Engage 1st tab 1st paragraph': "يزيد من الاحتفاظ بالعملاء مع الحملات شديدة الاستهداف للمتسوقين ذوي النية العالية بناءً على قائمة أمنياتهم ونشاط التصفح.",
          'Retain & Re-Engage 1st tab 2nd paragraph': "زاد متوسط طلب Block Zone بنسبة 35% مع حملات قائمة الأمنيات Klaviyo",
          'Retain & Re-Engage 2nd tab Title': "اربح مسابقة قائمة أمنياتك",
          'Retain & Re-Engage 2nd tab 1st paragraph': "يستمتع المتسوقون بإثارة الفوز بمنتجاتهم المفضلة، مع تعزيز التفاعل والمشاركة الاجتماعية والتحويلات.",
          'Retain & Re-Engage 2nd tab 2nd paragraph': "أضافت POPFLEX 90K عميل عبر حملة الهدايا القائمة على قائمة الأمنيات",
          'Retain & Re-Engage 3rd tab Title': "تجربة متعددة القنوات",
          'Retain & Re-Engage 3rd tab 1st paragraph': "يمحو الحدود بين تجارب التسوق عبر الإنترنت وفي المتجر، مما يساعد مندوبي المبيعات على التخصيص بناءً على تفضيلات العملاء.",
          'Retain & Re-Engage 3rd tab 2nd paragraph': "شهدت Bombshell Sportswear زيادة بنسبة 73% في إيرادات قائمة الأمنيات باستخدام Tapcart",
          'Quick Select': 'اختيار سريع',
          'Today': 'اليوم',
          'Yesterday': 'أمس',
          'Last 7 Days': 'آخر 7 أيام',
          'Last 30 Days': 'آخر 30 يوم',
          'This Month': 'هذا الشهر',
          'Last Month': 'الشهر الماضي',
          'Start Date': 'تاريخ البداية',
          'End Date': 'تاريخ النهاية',
          'Cancel': 'إلغاء',
          'Apply': 'تطبيق'
        },
        Configurations: {
          'Configurations': 'الإعدادات',
          'Subtitle Configurations': 'تخصيص أنماط الزر والألوان والأيقونات وسلوك قائمة الأمنيات. ضبط كيفية ظهور قوائم الأمنيات، تعيين خيارات المجموعات وسلة التسوق، وعرض التغييرات في الوقت الفعلي. تطبق جميع التغييرات على متجرك.',
          'Basics': 'الأساسيات',
          'Colors' : 'الألوان',
          'Primary color': 'اللون الأساسي',
          'Secondary color': 'اللون الثانوي',
          'Icons': 'الأيقونات',
          'Heart': 'القلب',
          'Star': 'النجمة',
          'Bookmark': 'العلامة المرجعية',
          'Button size': 'حجم الزر',
          'Icon thickness': 'سمك الأيقونة',
          'Product page': 'صفحة المنتج',
          'Button Position': 'موضع الزر',
          'Near cart button': 'قرب زر سلة التسوق',
          'On product image': 'على صورة المنتج',
          'Above Cart Button': 'فوق زر سلة التسوق',
          'Below Cart Button': 'تحت زر سلة التسوق',
          'Left of Cart Button': 'يسار زر سلة التسوق',
          'Right of Cart Button': 'يمين زر سلة التسوق',
          'Top Left': 'أعلى اليسار',
          'Top Right': 'أعلى اليمين',
          'Bottom Left': 'أسفل اليسار',
          'Bottom Right': 'أسفل اليمين',
          'Button Style': 'نوع الزر',
          'Only Icon': 'أيقونة فقط',
          'Only Text': 'نص فقط',
          'Icon and Text': 'أيقونة ونص',
          'Button Type': 'نوع الزر',
          'Solid': "صلب",
          'Outline': "مخطط",
          'Plain': "عادي",
          'Button text': 'نص الزر',
          'Before Click': 'قبل النقر',
          'After Click': 'بعد النقر',
          'Label': 'التسمية',
          'Add To Wishlist' : 'إضافة إلى قائمة الأمنيات',
          'Added To Wishlist' : 'تمت الإضافة إلى قائمة الأمنيات',
          'Other Settings': 'إعدادات أخرى',
          'Smart Save': 'الحفظ الذكي: قائمة أمنيات تلقائية للمنتجات التي يزورها المتسوق ثلاث مرات أو أكثر',
          'Social Proof': 'الدليل الاجتماعي: إظهار عدد الأشخاص الذين أضافوا المنتج إلى قائمة أمنياتهم',
          'Collections': 'المجموعات',
          'Add item to wishlist from collection page': 'السماح للمتسوقين بإضافة عناصر إلى قائمة الأمنيات من صفحات المجموعات',
          'Button Position': 'موضع الزر',
          'Top Left': 'أعلى اليسار',
          'Top Right': 'أعلى اليمين',
          'Bottom Left': 'أسفل اليسار',
          'Bottom Right': 'أسفل اليمين',
          'Wishlist Page': 'صفحة قائمة الأمنيات',
          'Text Color': 'لون النص',
          'Type': 'النوع',
          'Side Drawer': 'الدرج الجانبي',
          'Separate Page': 'صفحة منفصلة',
          'Pop-up Modal': 'نافذة منبثقة',
          'Page Title': 'عنوان الصفحة',
          'Launch From': 'الإطلاق من',
          'Header': 'الرأس',
          'Floating Button': 'الزر العائم',
          'Navigation Menu': 'قائمة التنقل',
          'Position': 'الموضع',
          'Left': 'اليسار',
          'Right': 'اليمين',
          'Button Left': 'زر اليسار',
          'Button Right': 'زر اليمين',
          'Corner Radius': 'نصف قطر الزاوية',
          'This needs to be set up manually': 'يجب إعداد هذا يدوياً',
          'Show Count': 'إظهار العدد',
          'Other Settings': 'إعدادات أخرى',
          'Allow shoppers to Share Wishlist': 'السماح للمتسوقين بمشاركة قائمة الأمنيات',
          'Cart': 'سلة التسوق',
          'Save for later pop-up': 'حفظ للاحقاً نافذة منبثقة',
          'Allow shoppers to save items': 'السماح للمتسوقين بحفظ العناصر قبل إزالتها من سلة التسوق',
          'Pop-up title': 'عنوان النافذة المنبثقة',
          'Primary button text': 'نص الزر الأساسي',
          'Secondary button text': 'نص الزر الثانوي',
          'Permission': 'الإذن',
          'Allow shoppers to save items': 'السماح للمتسوقين بحفظ العناصر قبل إزالتها من سلة التسوق',
          'Ask the shopper if they want to see the pop-up again': 'اسأل المتسوق إذا كان يريد رؤية النافذة المنبثقة مرة أخرى',
          'Always show the pop-up': 'إظهار النافذة المنبثقة دائماً',
          'Do you want to save this product for later?' :'هل تريد حفظ هذا المنتج لاستخدامه في وقت لاحق؟',
          'No, thanks!' :'ًلا شكرا!',
          'Save For later' :'حفظ لوقت لاحق',
        },
        Settings: {
          'Settings': 'الإعدادات',
          'Settings subtitle': 'إدارة الإعدادات الخاصة بالتطبيق',
          'Installtions': 'التركيبات',
          'installation subtitle': 'اتبع الخطوات لتثبيت تطبيق قائمة الأمنيات',
          'Notifications': 'الإشعارات',
          'Notifications subtitle': 'يتم إرسال الإشعارات تلقائياً.',
          'Language Settings': 'إعدادات اللغة',
          'Language Settings subtitle': 'تخصيص محتوى اللغة الأمامي.',
          "Language Settings Text": "عند تغيير لغة متجرك بالكامل، يوفر تطبيق قائمة الرغبات مرونة شاملة لتعديل لغة جميع الأقسام، بما في ذلك علامة التبويب والزر.",
          'Integerations': 'التكاملات',
          'Integrations subtitle': 'عرض وإدارة التطبيقات المتصلة.',
        },
        Notifications: {
          'Notifications': 'الإشعارات',
          'Notifications Subtitle': 'يتم إرسال الإشعارات تلقائيًا.',
          'Alerts and Notifications': 'التنبيهات والإشعارات',
          'Days': 'أيام',
          'Hours': 'ساعات',
          'Sign up confirmation': 'تأكيد التسجيل',
          'Send a confirmation': 'إرسال تأكيد عندما يحفظ المتسوقون قائمة أمنياتهم',
          'Wishlist Shared': 'تمت مشاركة قائمة الأمنيات',
          'Send a alert when shoppers share their wishlist': 'إرسال تنبيه عندما يشارك المتسوقون قائمة أمنياتهم مع الآخرين',
          'Wishlist Reminder': 'تذكير قائمة الأمنيات',
          'Send reminders for wishlist ': 'إرسال تذكيرات لعناصر قائمة الأمنيات بعد',
          'Send reminders on items saved for later': 'إرسال تذكيرات للعناصر المحفوظة للاحقاً',
          'Send reminders for items saved for later after': 'إرسال تذكيرات للعناصر المحفوظة للاحقاً بعد',
          'Send low stock alerts': 'إرسال تنبيهات المخزون المنخفض',
          'Send an alert when stock drops below': 'إرسال تنبيه عندما ينخفض المخزون عن',
          'units': 'وحدات',
          'Send Price Drop alert': 'إرسال تنبيه انخفاض السعر',
          'Send an alert when price drops by': 'إرسال تنبيه عندما ينخفض السعر بنسبة',
          'Send back in stock alerts': 'إرسال تنبيهات العودة للمخزون',
          'Send an alert when wislisted items are back in stock': 'إرسال تنبيه عندما تعود عناصر قائمة الأمنيات للمخزون',
        },
        'Notification Details': {
          'insert Variables': 'إدراج متغيرات',
          'Email Subject': 'موضوع البريد الإلكتروني',
          'Email Text sign up confirmation': 'مرحباً بك في {shop_name} - قائمة أمنياتك جاهزة!',
          'Email Text wishlist shared': 'تمت مشاركة قائمة أمنياتك',
          'Email Text wishlist reminder': "لا تنس عناصر قائمة أمنياتك في {shop_name}!",
          'Email Text Send reminders on Items Saved for Later': "العناصر المحفوظة تنتظرك في {shop_name}",
          'Email Text Send low stocks alerts': "تنبيه المخزون المنخفض: {product_name} في {shop_name}",
          'Email Text Send Price Drop Alert': "تنبيه انخفاض السعر: {product_name} في {shop_name}",
          'Email Text Send Back in stock alert': "العودة للمخزون: {product_name} في {shop_name}",
          'Branding': 'العلامة التجارية',
          'Branding Type': 'نوع العلامة التجارية',
          'Store name': 'اسم المتجر',
          'image': 'صورة',
          'Logo': 'الشعار',
          'image width': 'عرض الصورة',
          'Text Color': 'لون النص',
          'Background Color': 'لون الخلفية',
          'Padding Top': 'الحشو العلوي',
          'Padding Bottom': 'الحشو السفلي',
          'Text': 'النص',
          'Content': 'المحتوى',
          'Text in Text field sign up confirmation': 'مرحباً {customer_first_name} {customer_last_name}\nمرحباً بك في {shop_name}! تم إنشاء قائمة أمنياتك بنجاح. يمكنك الآن البدء في حفظ منتجاتك المفضلة والحصول على إشعارات حول انخفاضات الأسعار وتحديثات المخزون والمزيد.\n\nتسوق سعيد!\nأصدقاؤك في {shop_name}',
          'Text in Text field wishlist shared': 'مرحباً {customer_first_name} {customer_last_name}،\n\nتمت مشاركة قائمة أمنياتك بنجاح! يمكن لأصدقائك وعائلتك الآن رؤية عناصرك المفضلة ومساعدتك في تحديد ما تشتري.\n\nمشاركة سعيدة!\nأصدقاؤك في {shop_name}',
          'Text in Text field wishlist reminder': 'مرحباً {customer_first_name} {customer_last_name}،\n\nلا تنس العناصر الرائعة في قائمة أمنياتك! لديك {wishlist_count} عنصر ينتظرك.\n\nتسوق سعيد!\nأصدقاؤك في {shop_name}',
          'Text in Text field Send reminders on Items Saved for Later': 'مرحباً {customer_first_name} {customer_last_name}،\n\nالعناصر المحفوظة لا تزال تنتظرك! لديك {saved_count} عنصر محفوظ للاحقاً.\n\nتسوق سعيد!\nأصدقاؤك في {shop_name}',
          'Text in Text field Send low stocks alerts': 'مرحباً {customer_first_name} {customer_last_name}،\n\nأسرع! {product_name} منخفض المخزون. متبقي {stock_count} وحدة فقط!\n\nلا تفوت!\nأصدقاؤك في {shop_name}',
          'Text in Text field Send Price Drop Alert': 'مرحباً {customer_first_name} {customer_last_name}،\n\nأخبار رائعة! {product_name} في عرض الآن! انخفض السعر بنسبة {price_drop_percentage}% من {old_price} إلى {new_price}.\n\nتسوق سعيد!\nأصدقاؤك في {shop_name}',
          'Text in Text field Send Back in stock alert': 'مرحباً {customer_first_name} {customer_last_name}،\n\nأخبار رائعة! {product_name} عاد للمخزون وجاهز لشرائك!\n\nلا تفوت!\nأصدقاؤك في {shop_name}',
          'Text Alignment': 'محاذاة النص',
          'Background Color': 'لون الخلفية',
          'Item Text Color': 'لون نص العنصر',
          'Action button': 'زر الإجراء',
          'Action Button Text': 'نص الزر',
          'Link': 'الرابط',
          'Tracking Link': 'رابط التتبع',
          'Customize Link': 'تخصيص الرابط',
          'Action Button Width (%)': 'عرض الزر (%)',
          'Action Button Font Size': 'حجم الخط',
          'Action Button Color': 'لون الزر',
          'Action Button Color': 'لون الزر',
          'Action Button Text Color': 'لون النص',
          'Action Button Alignment': 'المحاذاة',
          'Background Color Button Area': 'لون الخلفية',
          'Footer': 'التذييل',
          'Footer Text': 'النص',
          'Footer Text to send in sign up confirmation': 'شكراً لاختيارك {shop_name}!\n{shop_name}',
          'Footer Text to send in wishlist shared': 'مشاركة سعيدة!\n{shop_name}',
          'Footer Text to send in wishlist reminder': 'تسوق سعيد!\n{shop_name}',
          'Footer Text to send in Send reminders on Items Saved for Later': 'تسوق سعيد!\n{shop_name}',
          'Footer Text to send in Send low stocks alerts': 'لا تفوت!\n{shop_name}',
          'Footer Text to send in Send Price Drop Alert': 'تسوق سعيد!\n{shop_name}',
          'Footer Text to send in Send Back in stock alert': 'لا تفوت!\n{shop_name}',
          'Text Alignment Footer': 'محاذاة النص',
          'Text Color Footer': 'لون النص',
          'Background Color Footer': 'لون الخلفية',
          'Theme settings': 'إعدادات السمة',
          'Global setting': 'الإعداد العام',
          'Font Family': 'عائلة الخط',
          'Save': 'حفظ',
'Section': 'القسم',
'SF Pro Text': 'SF Pro Text',
'Arial': 'Arial',
'Courier New': 'Courier New',
'Georgia': 'Georgia',
'Lucida Sans Unicode': 'Lucida Sans Unicode',
'Tahoma': 'Tahoma',
'Times New Roman': 'Times New Roman',
'Trebuchet MS': 'Trebuchet MS',
'Verdana': 'Verdana',
"Back": "رجوع"
        },
        Installation: {
          'Installation instructions': 'تعليمات التثبيت',
          'Follow the steps below to install': 'اتبع الخطوات أدناه لتثبيت تطبيق أداة قائمة الأمنيات في متجر Shopify الخاص بك.',
          'Contact Us': 'اتصل بنا',
          'Paragraph Contact Us': 'إذا لم يكن لديك أي معرفة في البرمجة، يرجى الاتصال بنا عبر الدردشة المباشرة أو إنشاء تذكير للدعم.',
          'Contact Support': 'اتصل بالدعم',
          'Theme Extension Tab': 'امتداد السمة',
          'Expert Setup Tab': 'الإعداد الخبير',
          'Manual Install Tab': 'التثبيت اليدوي',
          'Current theme status': 'حالة السمة الحالية',
          'Select Theme': 'اختر السمة',
          'Current theme app embed status' : "حالة تضمين تطبيق السمة الحالية (المنشورة)",
          'App embed Status': 'حالة تضمين التطبيق',
          "Enable": "تفعيل",
          "Disable": "إلغاء التفعيل",
          'Enable Wishlist app embed': 'تفعيل تضمين تطبيق قائمة الأمنيات',
          'Enable the Wishlist Configurations': 'قم بتفعيل إعدادات قائمة الأمنيات من App embeds في إعدادات السمة بالذهاب إلى تخصيص سمة Shopify.',
          'Activate Button': 'تفعيل',
          'Add Wishlist block': 'إضافة كتلة قائمة الأمنيات',
          'Add app block Text': 'أضف كتلة التطبيق لعرض وظائف قائمة الأمنيات على السمة المختارة. قم بتخصيص مواقع الكتل لتحقيق الموضع المثالي وفقاً لتفضيلاتك.',
          'Wishlist Widget Near Cart Button': 'أداة قائمة الأمنيات قرب زر سلة التسوق',
          'Add Wishlist Widget Cart Button Text': "لإضافة أداة قائمة الأمنيات، اذهب إلى قسم تخصيص سمة Shopify وانقر على إضافة كتلة.",
          'Button Text Wishlist Widget Near Cart Button': 'أداة قائمة الأمنيات قرب زر سلة التسوق',
          'Wishlist Widget On Product Image': 'أداة قائمة الأمنيات على صورة المنتج',
          'Button text Wishlist Widget On Product Image': 'أداة قائمة الأمنيات على صورة المنتج',
          'Text Wishlist Widget product image': "اذهب إلى قسم تخصيص سمة Shopify وانقر على إضافة كتلة لإضافة أداة قائمة الأمنيات على صورة المنتج",
          "Wishlist Widget Collection page": 'أداة قائمة الأمنيات على صفحة المجموعات',
          "Button text Wishlist Widget Collection page": "أداة قائمة الأمنيات على صفحة المجموعات",
          "Text Wishlist Widget Collection page": "في تخصيص Shopify، انقر على إضافة كتلة لإضافة أداة قائمة الأمنيات على صفحة المجموعات.",
          "My Wishlist Section": "قسم قائمة أمنياتي",
          "Button text My Wishlist Section": "قسم قائمة أمنياتي",
          "Text My Wishlist Section": "لإضافة قسم قائمة أمنياتي، انتقل إلى صفحة تخصيص سمة Shopify وانقر على إضافة كتلة لإضافة قسم قائمة أمنياتي وعرض عناصر قائمة أمنياتك.",
        },
        "Save Bar": {
          "Save": "حفظ",
          "Discard": "تجاهل",
          "Unsaved Changes": "تغييرات غير محفوظة"
        },
        "Modals": {
      "Add New Language": "إضافة لغة جديدة",
      "Enter language name (e.g., Swedish, Turkish)": "أدخل اسم اللغة (مثل السويدية، التركية)",
      "Language Name": "اسم اللغة",
      "Cancel": "إلغاء",
      "Add Language": "إضافة لغة",
      "Image": "صورة",
      "Close": "إغلاق"
    }
      }, Hindi: {
        'Sidebar Tabs': {
          'Configuration': 'कॉन्फ़िगरेशन',
          'Settings': 'सेटिंग्स',
          'Customers': 'ग्राहक'
        },
        Dashboard: {
          'Dashboard': 'डैशबोर्ड',
          'Active Wishlist Widget': 'सक्रिय विशलिस्ट विजेट',
          'Text active wishlist widget': 'पूर्ण कार्यक्षमता सुनिश्चित करने के लिए, कृपया अपने Shopify थीम के App Embeds सेक्शन में विशलिस्ट कॉन्फ़िगरेशन को सक्षम करें।',
          'Button text activate wishlist widget': 'सक्रिय करें',
          'Wishlist Highlights': 'विशलिस्ट हाइलाइट्स',
          'Total Wishlist Products': 'कुल विशलिस्ट उत्पाद',
          'Total Lists': 'कुल सूचियां',
          'Setup Guide': 'सेटअप गाइड',
          'completed': 'पूर्ण',
          'Smart Notifications Alerts': 'स्मार्ट नोटिफिकेशन अलर्ट्स',
          'Set up automated email notifications for new reviews': 'नई समीक्षाओं के लिए स्वचालित ईमेल नोटिफिकेशन सेट करें',
          'Button Text smart notification alerts': 'अलर्ट कॉन्फ़िगर करें',
          'Widget Personalization': 'विजेट पर्सनलाइजेशन',
          'Paragraph Widget Personalization': 'विजेट चुनें और उनके डिज़ाइन को अपने स्टोर से मैच करें',
          'Button Text Widget Personalization': 'विजेट कस्टमाइज़ करें',
          'Localize': 'लोकलाइज़',
          'Paragraph Localize': 'समीक्षा से संबंधित सभी टेक्स्ट को आसानी से संपादित या अनुवाद करें',
          'Button Text Localize': 'टेक्स्ट संपादित करें',
          'Much more than a Wishlist': 'विशलिस्ट से कहीं अधिक',
          'subtitle much more than wishlist': 'ब्राउज़िंग से खरीदारी तक, शॉपर्स की पूरी यात्रा में उन्हें जोड़ें',
          'tabs why it matters': 'यह क्यों महत्वपूर्ण है',
          'Capture Intent': 'इरादा कैप्चर करें',
          'Capture Intent 1st tab Title': 'विशलिस्ट में पसंदीदा जोड़ें',
          'Capture Intent 1st tab 1st paragraph': "शॉपर्स के लिए उनके पसंदीदा उत्पादों को फिर से देखना आसान बनाता है, जिससे रिटर्न विजिट और खरीदारी की संभावना बढ़ती है।",
          'Capture Intent 1st tab 2nd Paragraph': "Sew Trendy ने विशलिस्ट में जोड़ने वाले ग्राहकों के लिए कन्वर्जन दर में 187% की वृद्धि देखी",
          'Capture Intent 2nd tab Title': "कार्ट से बाद के लिए सेव करें",
          'Capture Intent 2nd tab 1st paragraph': "भविष्य की खरीदारी के लिए उत्पादों को हाथ में रखें, कार्ट डिलीट को कम करें और आपको हिचकिचाने वाले खरीदारों की पहचान करने में मदद करें।",
          'Capture Intent 2nd tab 2nd paragraph': "Willow Boutique ने कार्ट डिलीट का ~15% पुनर्प्राप्त किया और विशलिस्ट अलर्ट पर 100x ROI प्राप्त किया।",
          'Capture Identity': 'पहचान कैप्चर करें',
          'Capture Identity 1st tab Title': "आउट-ऑफ-स्टॉक आइटम के लिए साइन अप करें",
          'Capture Identity 1st tab 1st paragraph': "उपलब्ध नहीं उत्पादों से निराशा को रोकता है, सुनिश्चित करता है कि वे कुछ नहीं खोते, और आपको खोए हुए बिक्री को पुनर्प्राप्त करने में मदद करता है।",
          'Capture Identity 1st tab 2nd paragraph': "Tibi ने बैक-इन-स्टॉक अलर्ट के माध्यम से कन्वर्ट होने की संभावना 4x अधिक ग्राहकों को देखा",
          'Capture Identity 2nd tab Title': "विशलिस्ट सेव और शेयर करें",
          'Capture Identity 2nd tab 1st paragraph': "व्यक्तिगत रिमाइंडर और साझा विशलिस्ट के साथ शॉपर्स को जोड़े रखता है, रिपीट विजिट और कन्वर्जन बढ़ाता है। शॉपर्स को सभी डिवाइस और विजिट में उनकी विशलिस्ट तक पहुंच देता है, जबकि अनाम विजिटर को पहचाने गए ग्राहकों में बदलता है।",
          'Capture Identity 2nd tab 2nd paragraph': "Credo Beauty ने साझा विशलिस्ट का उपयोग करके सामाजिक जुड़ाव और कन्वर्जन बढ़ाया",
          'Engage & Convert': 'जुड़ें और कन्वर्ट करें',
          'Engage & Convert 1st tab Title': "विशलिस्ट रिमाइंडर अलर्ट्स",
          'Engage & Convert 1st tab 1st paragraph': "शॉपर्स को उनके सेव किए गए आइटम वापस लाता है, ड्रॉप-ऑफ कम करता है और कन्वर्जन बढ़ाता है।",
          'Engage & Convert 1st tab 2nd paragraph': "White Oak Pastures ने विशलिस्ट के माध्यम से 4x अधिक कन्वर्जन और 10% उच्च AOV देखा",
          'Engage & Convert 2nd tab Title': "प्राइस ड्रॉप अलर्ट्स",
          'Engage & Convert 2nd tab 1st paragraph': "उन्हें उन आइटम पर बचत के बारे में सूचित करता है जो वे पहले से ही चाहते हैं, जबकि कन्वर्जन की संभावना बढ़ाता है।",
          'Engage & Convert 2nd tab 2nd paragraph': "Brighton ने प्राइस ड्रॉप नोटिफिकेशन के साथ AOV और LTV बूस्ट किया",
          'Engage & Convert 3rd tab Title': "लो स्टॉक अलर्ट्स",
          'Engage & Convert 3rd tab 1st paragraph': "शॉपर्स को उनके पसंदीदा को खोने से बचाने में मदद करता है, जबकि तात्कालिकता की भावना पैदा करता है।",
          'Engage & Convert 3rd tab 2nd paragraph': "Cirque Colors ने लो स्टॉक अलर्ट का उपयोग करके तात्कालिकता और कन्वर्जन को बढ़ावा दिया",
          'Retain & Re-Engage': 'बनाए रखें और पुनः जुड़ें',
          'Retain & Re-Engage 1st tab Title': "व्यक्तिगत अभियान",
          'Retain & Re-Engage 1st tab 1st paragraph': "उनकी विशलिस्ट और ब्राउज़िंग गतिविधि के आधार पर उच्च-इरादे वाले शॉपर्स के लिए हाइपर-टारगेटेड अभियानों के साथ ग्राहक प्रतिधारण बढ़ाता है।",
          'Retain & Re-Engage 1st tab 2nd paragraph': "Block Zone का AOV Klaviyo विशलिस्ट अभियानों के साथ 35% बढ़ा",
          'Retain & Re-Engage 2nd tab Title': "अपनी विशलिस्ट प्रतियोगिता जीतें",
          'Retain & Re-Engage 2nd tab 1st paragraph': "शॉपर्स अपने पसंदीदा उत्पादों को जीतने की उत्तेजना का आनंद लेते हैं, जबकि जुड़ाव, सामाजिक साझाकरण और कन्वर्जन को बढ़ावा देते हैं।",
          'Retain & Re-Engage 2nd tab 2nd paragraph': "POPFLEX ने विशलिस्ट-आधारित गिवअवे अभियान के माध्यम से 90K ग्राहक जोड़े",
          'Retain & Re-Engage 3rd tab Title': "ओमनीचैनल अनुभव",
          'Retain & Re-Engage 3rd tab 1st paragraph': "ऑनलाइन और इन-स्टोर शॉपिंग अनुभवों के बीच की रेखाओं को धुंधला करता है, ग्राहक प्राथमिकताओं के आधार पर बिक्री सहयोगियों को व्यक्तिगत बनाने में मदद करता है।",
          'Retain & Re-Engage 3rd tab 2nd paragraph': "Bombshell Sportswear ने Tapcart का उपयोग करके विशलिस्ट राजस्व में 73% की वृद्धि देखी",
          'Quick Select': 'त्वरित चयन',
          'Today': 'आज',
          'Yesterday': 'कल',
          'Last 7 Days': 'पिछले 7 दिन',
          'Last 30 Days': 'पिछले 30 दिन',
          'This Month': 'इस महीने',
          'Last Month': 'पिछले महीने',
          'Start Date': 'प्रारंभ तिथि',
          'End Date': 'समाप्ति तिथि',
          'Cancel': 'रद्द करें',
          'Apply': 'लागू करें'
        },
        Configurations: {
          'Configurations': 'विन्यास',
          'Subtitle Configurations': 'बटन की शैलियाँ, रंग, आइकन और इच्छा-सूची के व्यवहार को अनुकूलित करें। इच्छा-सूची के प्रदर्शन को समायोजित करें, संग्रह और कार्ट विकल्प सेट अप करें, और परिवर्तनों का तुरंत पूर्वावलोकन करें। सभी परिवर्तन आपके स्टोरफ्रंट पर लागू होते हैं।',
          'Basics': 'मूल बातें',
          'Colors' : 'रंग',
          'Primary color': 'प्राथमिक रंग',
          'Secondary color': 'द्वितीयक रंग',
          'Icons': 'आइकन',
          'Heart': 'दिल',
          'Star': 'सितारा',
          'Bookmark': 'बुकमार्क',
          'Button size': 'बटन का आकार',
          'Icon thickness': 'आइकन की मोटाई',
          'Product page': 'उत्पाद पेज',
          'Button Position': 'बटन की स्थिति',
          'Near cart button': 'कार्ट बटन के पास',
          'On product image': 'उत्पाद छवि पर',
          'Above Cart Button': 'कार्ट बटन के ऊपर',
          'Below Cart Button': 'कार्ट बटन के नीचे',
          'Left of Cart Button': 'कार्ट बटन के बाएं',
          'Right of Cart Button': 'कार्ट बटन के दाएं',
          'Top Left': 'ऊपर बाएं',
          'Top Right': 'ऊपर दाएं',
          'Bottom Left': 'नीचे बाएं',
          'Bottom Right': 'नीचे दाएं',
          'Button Style': 'बटन स्टाइल',
          'Only Icon': 'केवल आइकन',
          'Only Text': 'केवल टेक्स्ट',
          'Icon and Text': 'आइकन और टेक्स्ट',
          'Button Type': 'बटन का प्रकार',
          'Solid': "ठोस",
          'Outline': "आउटलाइन",
          'Plain': "सादा",
          'Button text': 'बटन टेक्स्ट',
          'Before Click': 'क्लिक करने से पहले',
          'After Click': 'क्लिक करने के बाद',
          'Label': 'लेबल',
          'Add To Wishlist' : 'विशलिस्ट में जोड़ें',
          'Added To Wishlist' : 'विशलिस्ट में जोड़ा गया',
          'Other Settings': 'अन्य सेटिंग्स',
          'Smart Save': 'स्मार्ट सेव: शॉपर द्वारा तीन या अधिक बार देखे गए उत्पादों के लिए ऑटो-विशलिस्ट',
          'Social Proof': 'सामाजिक प्रमाण: उन लोगों की संख्या दिखाएं जिन्होंने उत्पाद को अपनी विशलिस्ट में जोड़ा है',
          'Collections': 'संग्रह',
          'Add item to wishlist from collection page': 'शॉपर्स को संग्रह पेज से विशलिस्ट में आइटम जोड़ने की अनुमति दें',
          'Button Position': 'बटन की स्थिति',
          'Top Left': 'ऊपर बाएं',
          'Top Right': 'ऊपर दाएं',
          'Bottom Left': 'नीचे बाएं',
          'Bottom Right': 'नीचे दाएं',
          'Wishlist Page': 'विशलिस्ट पेज',
          'Text Color': 'टेक्स्ट रंग',
          'Type': 'प्रकार',
          'Side Drawer': 'साइड ड्रॉअर',
          'Separate Page': 'अलग पेज',
          'Pop-up Modal': 'पॉप-अप मॉडल',
          'Page Title': 'पेज शीर्षक',
          'Launch From': 'से लॉन्च करें',
          'Header': 'हेडर',
          'Floating Button': 'फ्लोटिंग बटन',
          'Navigation Menu': 'नेविगेशन मेनू',
          'Position': 'स्थिति',
          'Left': 'बाएं',
          'Right': 'दाएं',
          'Button Left': 'बटन बाएं',
          'Button Right': 'बटन दाएं',
          'Corner Radius': 'कोने की त्रिज्या',
          'This needs to be set up manually': 'इसे मैन्युअली सेट करना होगा',
          'Show Count': 'गणना दिखाएं',
          'Other Settings': 'अन्य सेटिंग्स',
          'Allow shoppers to Share Wishlist': 'शॉपर्स को विशलिस्ट साझा करने की अनुमति दें',
          'Cart': 'कार्ट',
          'Save for later pop-up': 'बाद के लिए सेव पॉप-अप',
          'Allow shoppers to save items': 'शॉपर्स को कार्ट से हटाने से पहले आइटम सेव करने की अनुमति दें',
          'Pop-up title': 'पॉप-अप शीर्षक',
          'Primary button text': 'प्राथमिक बटन टेक्स्ट',
          'Secondary button text': 'द्वितीयक बटन टेक्स्ट',
          'Permission': 'अनुमति',
          'Allow shoppers to save items': 'शॉपर्स को कार्ट से हटाने से पहले आइटम सेव करने की अनुमति दें',
          'Ask the shopper if they want to see the pop-up again': 'शॉपर से पूछें कि क्या वे फिर से पॉप-अप देखना चाहते हैं',
          'Always show the pop-up': 'हमेशा पॉप-अप दिखाएं',
          'Do you want to save this product for later?' :'क्या आप इस उत्पाद को बाद के लिए सहेजना चाहते हैं?',
          'No, thanks!' :'जी नहीं, धन्यवाद!',
          'Save For later' :'भविष्य के लिए बचाओ',
        },
        Settings: {
          'Settings': 'सेटिंग्स',
          'Settings subtitle': 'अपने एप्लिकेशन के सेटिंग्स को प्रबंधित करें',  
          'Installtions': 'इंस्टॉलेशन',
          'installation subtitle': 'विशलिस्ट ऐप इंस्टॉल करने के लिए चरणों का पालन करें',
          'Notifications': 'नोटिफिकेशन',
          'Notifications subtitle': 'नोटिफिकेशन स्वचालित रूप से भेजे जाते हैं।',
          'Language Settings': 'भाषा सेटिंग्स',
          'Language Settings subtitle': 'फ्रंट-एंड भाषा सामग्री को कस्टमाइज़ करें।',
          "Language Settings Text": "जब आप अपनी पूरी स्टोर की भाषा बदलते हैं, तो विशलिस्ट ऐप आपको सभी सेक्शन की भाषा बदलने की पूरी सुविधा देता है, जिसमें टैब और बटन भी शामिल हैं।",
          'Integerations': 'एकीकरण',
          'Integrations subtitle': 'कनेक्टेड ऐप्स देखें और प्रबंधित करें।',
        },
        Notifications: {
          'Notifications': 'नोटिफिकेशन',
          'Notifications Subtitle': 'सूचनाएँ स्वचालित रूप से भेजी जाती हैं।',
          'Alerts and Notifications': 'अलर्ट और नोटिफिकेशन',
          'Days': 'दिन',
          'Hours': 'घंटे',
          'Sign up confirmation': 'साइन अप पुष्टि',
          'Send a confirmation': 'जब शॉपर्स अपनी विशलिस्ट सेव करते हैं तो पुष्टि भेजें',
          'Wishlist Shared': 'विशलिस्ट साझा की गई',
          'Send a alert when shoppers share their wishlist': 'जब शॉपर्स अपनी विशलिस्ट दूसरों के साथ साझा करते हैं तो अलर्ट भेजें',
          'Wishlist Reminder': 'विशलिस्ट रिमाइंडर',
          'Send reminders for wishlist ': 'विशलिस्ट आइटम के लिए रिमाइंडर भेजें',
          'Send reminders on items saved for later': 'बाद के लिए सेव किए गए आइटम पर रिमाइंडर भेजें',
          'Send reminders for items saved for later after': 'बाद के लिए सेव किए गए आइटम के लिए रिमाइंडर भेजें',
          'Send low stock alerts': 'कम स्टॉक अलर्ट भेजें',
          'Send an alert when stock drops below': 'जब स्टॉक नीचे गिरता है तो अलर्ट भेजें',
          'units': 'इकाइयां',
          'Send Price Drop alert': 'प्राइस ड्रॉप अलर्ट भेजें',
          'Send an alert when price drops by': 'जब कीमत गिरती है तो अलर्ट भेजें',
          'Send back in stock alerts': 'स्टॉक में वापस अलर्ट भेजें',
          'Send an alert when wislisted items are back in stock': 'जब विशलिस्ट आइटम स्टॉक में वापस आते हैं तो अलर्ट भेजें',
        },
        'Notification Details': {
          'insert Variables': 'वेरिएबल डालें',
          'Email Subject': 'ईमेल विषय',
          'Email Text sign up confirmation': '{shop_name} में आपका स्वागत है - आपकी विशलिस्ट तैयार है!',
          'Email Text wishlist shared': 'आपकी विशलिस्ट साझा की गई है',
          'Email Text wishlist reminder': "{shop_name} की विशलिस्ट आइटम न भूलें!",
          'Email Text Send reminders on Items Saved for Later': "{shop_name} में आपके सेव किए गए आइटम आपका इंतजार कर रहे हैं",
          'Email Text Send low stocks alerts': "कम स्टॉक अलर्ट: {shop_name} में {product_name}",
          'Email Text Send Price Drop Alert': "प्राइस ड्रॉप अलर्ट: {shop_name} में {product_name}",
          'Email Text Send Back in stock alert': "स्टॉक में वापस: {shop_name} में {product_name}",
          'Branding': 'ब्रांडिंग',
          'Branding Type': 'ब्रांडिंग प्रकार',
          'Store name': 'स्टोर का नाम',
          'image': 'छवि',
          'Logo': 'लोगो',
          'image width': 'छवि की चौड़ाई',
          'Text Color': 'टेक्स्ट रंग',
          'Background Color': 'पृष्ठभूमि रंग',
          'Padding Top': 'ऊपर पैडिंग',
          'Padding Bottom': 'नीचे पैडिंग',
          'Text': 'टेक्स्ट',
          'Content': 'सामग्री',
          'Text in Text field sign up confirmation': 'नमस्ते {customer_first_name} {customer_last_name}\n{shop_name} में आपका स्वागत है! आपकी विशलिस्ट सफलतापूर्वक बनाई गई है। अब आप अपने पसंदीदा उत्पादों को सेव करना शुरू कर सकते हैं और कीमत में गिरावट, स्टॉक अपडेट और अधिक के बारे में नोटिफिकेशन प्राप्त कर सकते हैं।\n\nखरीदारी का आनंद लें!\n{shop_name} में आपके दोस्त',
          'Text in Text field wishlist shared': 'नमस्ते {customer_first_name} {customer_last_name},\n\nआपकी विशलिस्ट सफलतापूर्वक साझा की गई है! आपके दोस्त और परिवार अब आपके पसंदीदा आइटम देख सकते हैं और आपको क्या खरीदना है यह तय करने में मदद कर सकते हैं।\n\nसाझा करने का आनंद लें!\n{shop_name} में आपके दोस्त',
          'Text in Text field wishlist reminder': 'नमस्ते {customer_first_name} {customer_last_name},\n\nअपनी विशलिस्ट में अद्भुत आइटम न भूलें! आपके पास {wishlist_count} आइटम हैं जो आपका इंतजार कर रहे हैं।\n\nखरीदारी का आनंद लें!\n{shop_name} में आपके दोस्त',
          'Text in Text field Send reminders on Items Saved for Later': 'नमस्ते {customer_first_name} {customer_last_name},\n\nआपके सेव किए गए आइटम अभी भी आपका इंतजार कर रहे हैं! आपके पास {saved_count} आइटम बाद के लिए सेव किए गए हैं।\n\nखरीदारी का आनंद लें!\n{shop_name} में आपके दोस्त',
          'Text in Text field Send low stocks alerts': 'नमस्ते {customer_first_name} {customer_last_name},\n\nजल्दी करें! {product_name} स्टॉक में कम है। केवल {stock_count} इकाइयां बची हैं!\n\nन चूकें!\n{shop_name} में आपके दोस्त',
          'Text in Text field Send Price Drop Alert': 'नमस्ते {customer_first_name} {customer_last_name},\n\nअच्छी खबर! {product_name} अब सेल में है! कीमत {old_price} से {new_price} तक {price_drop_percentage}% गिर गई है।\n\nखरीदारी का आनंद लें!\n{shop_name} में आपके दोस्त',
          'Text in Text field Send Back in stock alert': 'नमस्ते {customer_first_name} {customer_last_name},\n\nअच्छी खबर! {product_name} स्टॉक में वापस आ गया है और आपके खरीदने के लिए तैयार है!\n\nन चूकें!\n{shop_name} में आपके दोस्त',
          'Text Alignment': 'टेक्स्ट संरेखण',
          'Background Color': 'पृष्ठभूमि रंग',
          'Item Text Color': 'आइटम टेक्स्ट रंग',
          'Action button': 'एक्शन बटन',
          'Action Button Text': 'बटन टेक्स्ट',
          'Link': 'लिंक',
          'Tracking Link': 'ट्रैकिंग लिंक',
          'Customize Link': 'लिंक कस्टमाइज़ करें',
          'Action Button Width (%)': 'बटन की चौड़ाई (%)',
          'Action Button Font Size': 'फॉन्ट आकार',
          'Action Button Color': 'बटन रंग',
          'Action Button Color': 'बटन रंग',
          'Action Button Text Color': 'टेक्स्ट रंग',
          'Action Button Alignment': 'संरेखण',
          'Background Color Button Area': 'पृष्ठभूमि रंग',
          'Footer': 'फुटर',
          'Footer Text': 'टेक्स्ट',
          'Footer Text to send in sign up confirmation': '{shop_name} चुनने के लिए धन्यवाद!\n{shop_name}',
          'Footer Text to send in wishlist shared': 'साझा करने का आनंद लें!\n{shop_name}',
          'Footer Text to send in wishlist reminder': 'खरीदारी का आनंद लें!\n{shop_name}',
          'Footer Text to send in Send reminders on Items Saved for Later': 'खरीदारी का आनंद लें!\n{shop_name}',
          'Footer Text to send in Send low stocks alerts': 'न चूकें!\n{shop_name}',
          'Footer Text to send in Send Price Drop Alert': 'खरीदारी का आनंद लें!\n{shop_name}',
          'Footer Text to send in Send Back in stock alert': 'न चूकें!\n{shop_name}',
          'Text Alignment Footer': 'टेक्स्ट संरेखण',
          'Text Color Footer': 'टेक्स्ट रंग',
          'Background Color Footer': 'पृष्ठभूमि रंग',
          'Theme settings': 'थीम सेटिंग्स',
          'Global setting': 'वैश्विक सेटिंग',
          'Font Family': 'फॉन्ट परिवार',
          'Save': 'सहेजें',
'Section': 'अनुभाग',
'SF Pro Text': 'SF Pro Text',
'Arial': 'Arial',
'Courier New': 'Courier New',
'Georgia': 'Georgia',
'Lucida Sans Unicode': 'Lucida Sans Unicode',
'Tahoma': 'Tahoma',
'Times New Roman': 'Times New Roman',
'Trebuchet MS': 'Trebuchet MS',
'Verdana': 'Verdana',
"Back": "वापस"
        },
        Installation: {
          'Installation instructions': 'इंस्टॉलेशन निर्देश',
          'Follow the steps below to install': 'अपने Shopify स्टोर में विशलिस्ट विजेट ऐप इंस्टॉल करने के लिए नीचे दिए गए चरणों का पालन करें।',
          'Contact Us': 'हमसे संपर्क करें',
          'Paragraph Contact Us': 'यदि आपके पास कोडिंग के बारे में जानकारी नहीं है, तो कृपया हमारे वार्तालाप या समर्थन टिकट बनाने के लिए हमसे संपर्क करें।',
          'Contact Support': 'सहायता से संपर्क करें',
          'Theme Extension Tab': 'थीम एक्सटेंशन',
          'Expert Setup Tab': 'विशेषज्ञ सेटअप',
          'Manual Install Tab': 'मैनुअल इंस्टॉल',
          'Current theme status': 'वर्तमान थीम स्थिति',
          'Select Theme': 'थीम चुनें',
          'Current theme app embed status' : "वर्तमान (प्रकाशित) थीम ऐप एम्बेड स्थिति",
          'App embed Status': 'ऐप एम्बेड स्थिति',
          "Enable": "सक्षम करें",
          "Disable": "अक्षम करें",
          'Enable Wishlist app embed': 'विशलिस्ट ऐप एम्बेड सक्षम करें',
          'Enable the Wishlist Configurations': 'Shopify थीम कस्टमाइजेशन में जाकर थीम सेटिंग्स के App embeds से विशलिस्ट कॉन्फ़िगरेशन सक्षम करें।',
          'Activate Button': 'सक्रिय करें',
          'Add Wishlist block': 'विशलिस्ट ब्लॉक जोड़ें',
          'Add app block Text': 'अपनी चयनित थीम पर विशलिस्ट कार्यक्षमता प्रदर्शित करने के लिए ऐप ब्लॉक जोड़ें। अपनी प्राथमिकताओं के अनुसार सही स्थान प्राप्त करने के लिए ब्लॉक स्थानों को कस्टमाइज़ करें।',
          'Wishlist Widget Near Cart Button': 'कार्ट बटन के पास विशलिस्ट विजेट',
          'Add Wishlist Widget Cart Button Text': "विशलिस्ट विजेट जोड़ने के लिए, Shopify थीम कस्टमाइजेशन सेक्शन में जाएं और ब्लॉक जोड़ें पर क्लिक करें।",
          'Button Text Wishlist Widget Near Cart Button': 'कार्ट बटन के पास विशलिस्ट विजेट',
          'Wishlist Widget On Product Image': 'उत्पाद छवि पर विशलिस्ट विजेट',
          'Button text Wishlist Widget On Product Image': 'उत्पाद छवि पर विशलिस्ट विजेट',
          'Text Wishlist Widget product image': "उत्पाद छवि पर विशलिस्ट विजेट जोड़ने के लिए Shopify थीम कस्टमाइजेशन सेक्शन में जाएं और ब्लॉक जोड़ें पर क्लिक करें",
          "Wishlist Widget Collection page": 'संग्रह पेज पर विशलिस्ट विजेट',
          "Button text Wishlist Widget Collection page": "संग्रह पेज पर विशलिस्ट विजेट",
          "Text Wishlist Widget Collection page": "Shopify कस्टमाइजेशन में, संग्रह पेज पर विशलिस्ट विजेट जोड़ने के लिए ब्लॉक जोड़ें पर क्लिक करें।",
          "My Wishlist Section": "मेरी विशलिस्ट सेक्शन",
          "Button text My Wishlist Section": "मेरी विशलिस्ट सेक्शन",
          "Text My Wishlist Section": "मेरी विशलिस्ट सेक्शन जोड़ने के लिए, Shopify थीम कस्टमाइजेशन पेज पर नेविगेट करें और मेरी विशलिस्ट सेक्शन जोड़ने और अपनी विशलिस्ट आइटम देखने के लिए ब्लॉक जोड़ें पर क्लिक करें।",
        },
        "Save Bar": {
          "Save": "सहेजें",
          "Discard": "त्यागें",
          "Unsaved Changes": "असहेजे गए परिवर्तन"
        },
        "Modals": {
          "Add New Language": "नई भाषा जोड़ें",
          "Enter language name (e.g., Swedish, Turkish)": "भाषा का नाम दर्ज करें (जैसे: स्वीडिश, तुर्की)",
          "Language Name": "भाषा का नाम",
          "Cancel": "रद्द करें",
          "Add Language": "भाषा जोड़ें",
          "Image": "छवि",
          "Close": "बंद करें"
        }
      },
      Urdu: {
        'Sidebar Tabs': {
          'Configuration': 'ترتیب',
          'Settings': 'ترتیبات',
          'Customers': 'گاہک'
        },
        Dashboard: {
          'Dashboard': 'ڈیش بورڈ',
          'Active Wishlist Widget': 'فعال خواہشات کی فہرست ویجٹ',
          'Text active wishlist widget': 'مکمل فعالیت کو یقینی بنانے کے لیے، براہ کرم اپنے Shopify تھیم کے App Embeds سیکشن میں خواہشات کی فہرست کی ترتیبات کو فعال کریں۔',
          'Button text activate wishlist widget': 'فعال کریں',
          'Wishlist Highlights': 'خواہشات کی فہرست کی نمایاں خصوصیات',
          'Total Wishlist Products': 'کل خواہشات کی فہرست کے مصنوعات',
          'Total Lists': 'کل فہرستیں',
          'Setup Guide': 'سیٹ اپ گائیڈ',
          'completed': 'مکمل',
          'Smart Notifications Alerts': 'سمارٹ نوٹیفیکیشن الرٹس',
          'Set up automated email notifications for new reviews': 'نئی جائزوں کے لیے خودکار ای میل نوٹیفیکیشن سیٹ کریں',
          'Button Text smart notification alerts': 'الرٹس ترتیب دیں',
          'Widget Personalization': 'ویجٹ کی شخصی ترتیب',
          'Paragraph Widget Personalization': 'ویجٹس منتخب کریں اور ان کے ڈیزائن کو اپنی دکان سے ملائیں',
          'Button Text Widget Personalization': 'ویجٹ کی ترتیب کریں',
          'Localize': 'مقامی بنائیں',
          'Paragraph Localize': 'جائزوں سے متعلق تمام متن کو آسانی سے ترمیم یا ترجمہ کریں',
          'Button Text Localize': 'متن ترمیم کریں',
          'Much more than a Wishlist': 'خواہشات کی فہرست سے کہیں زیادہ',
          'subtitle much more than wishlist': 'براؤزنگ سے خریداری تک، خریداروں کی پوری سفر میں انہیں شامل کریں',
          'tabs why it matters': 'یہ کیوں اہم ہے',
          'Capture Intent': 'ارادہ پکڑیں',
          'Capture Intent 1st tab Title': 'پسندیدہ کو خواہشات کی فہرست میں شامل کریں',
          'Capture Intent 1st tab 1st paragraph': "خریداروں کے لیے ان کے پسندیدہ مصنوعات کو دوبارہ دیکھنا آسان بناتا ہے، واپسی کے دوروں اور خریداری کی امکان کو بڑھاتا ہے۔",
          'Capture Intent 1st tab 2nd Paragraph': "Sew Trendy نے خواہشات کی فہرست میں شامل کرنے والے گاہکوں کے لیے تبدیلی کی شرح میں 187% اضافہ دیکھا",
          'Capture Intent 2nd tab Title': "کارٹ سے بعد کے لیے محفوظ کریں",
          'Capture Intent 2nd tab 1st paragraph': "مستقبل کی خریداری کے لیے مصنوعات کو ہاتھ میں رکھیں، کارٹ کی حذف کو کم کریں اور آپ کو ہچکچانے والے خریداروں کی شناخت میں مدد کریں۔",
          'Capture Intent 2nd tab 2nd paragraph': "Willow Boutique نے کارٹ کی حذف کا ~15% وصول کیا اور خواہشات کی فہرست کے الرٹس پر 100x ROI حاصل کیا۔",
          'Capture Identity': 'شناخت پکڑیں',
          'Capture Identity 1st tab Title': "اسٹاک سے باہر مصنوعات کے لیے سائن اپ کریں",
          'Capture Identity 1st tab 1st paragraph': "دستیاب نہ ہونے والی مصنوعات سے مایوسی کو روکتا ہے، یقینی بناتا ہے کہ وہ کچھ نہ کھوئیں، اور آپ کو کھوئی ہوئی فروخت کو وصول کرنے میں مدد کرتا ہے۔",
          'Capture Identity 1st tab 2nd paragraph': "Tibi نے بیک-ان-اسٹاک الرٹس کے ذریعے تبدیل ہونے کی 4x زیادہ امکان والے گاہکوں کو دیکھا",
          'Capture Identity 2nd tab Title': "خواہشات کی فہرست محفوظ اور شیئر کریں",
          'Capture Identity 2nd tab 1st paragraph': "ذاتی یاددہانیوں اور شیئر کی گئی خواہشات کی فہرستوں کے ساتھ خریداروں کو شامل رکھتا ہے، بار بار کے دوروں اور تبدیلیوں کو بڑھاتا ہے۔ خریداروں کو تمام آلات اور دوروں میں ان کی خواہشات کی فہرست تک رسائی دیتا ہے، جبکہ گمنام زائرین کو شناخت شدہ گاہکوں میں تبدیل کرتا ہے۔",
          'Capture Identity 2nd tab 2nd paragraph': "Credo Beauty نے شیئر کی گئی خواہشات کی فہرستوں کا استعمال کرتے ہوئے سماجی شمولیت اور تبدیلیوں کو بڑھایا",
          'Engage & Convert': 'شامل کریں اور تبدیل کریں',
          'Engage & Convert 1st tab Title': "خواہشات کی فہرست کی یاددہانی الرٹس",
          'Engage & Convert 1st tab 1st paragraph': "خریداروں کو ان کے محفوظ کردہ مصنوعات کی طرف واپس لاتا ہے، ڈراپ-آف کو کم کرتا ہے اور تبدیلیوں کو بڑھاتا ہے۔",
          'Engage & Convert 1st tab 2nd paragraph': "White Oak Pastures نے خواہشات کی فہرست کے ذریعے 4x زیادہ تبدیلیاں اور 10% زیادہ AOV دیکھا",
          'Engage & Convert 2nd tab Title': "قیمت میں کمی کے الرٹس",
          'Engage & Convert 2nd tab 1st paragraph': "انہیں ان مصنوعات پر بچت کے بارے میں آگاہ کرتا ہے جو وہ پہلے سے ہی چاہتے ہیں، جبکہ تبدیلی کی امکان کو بڑھاتا ہے۔",
          'Engage & Convert 2nd tab 2nd paragraph': "Brighton نے قیمت میں کمی کے نوٹیفیکیشن کے ساتھ AOV اور LTV کو بڑھایا",
          'Engage & Convert 3rd tab Title': "کم اسٹاک الرٹس",
          'Engage & Convert 3rd tab 1st paragraph': "خریداروں کو ان کے پسندیدہ کو کھونے سے بچانے میں مدد کرتا ہے، جبکہ فوری ضرورت کا احساس پیدا کرتا ہے۔",
          'Engage & Convert 3rd tab 2nd paragraph': "Cirque Colors نے کم اسٹاک الرٹس کا استعمال کرتے ہوئے فوری ضرورت اور تبدیلیوں کو فروغ دیا",
          'Retain & Re-Engage': 'برقرار رکھیں اور دوبارہ شامل کریں',
          'Retain & Re-Engage 1st tab Title': "ذاتی مہمات",
          'Retain & Re-Engage 1st tab 1st paragraph': "ان کی خواہشات کی فہرست اور براؤزنگ کی سرگرمی کی بنیاد پر اعلی-ارادہ والے خریداروں کے لیے ہائپر-ٹارگٹڈ مہمات کے ساتھ گاہک کی برقراری کو بڑھاتا ہے۔",
          'Retain & Re-Engage 1st tab 2nd paragraph': "Block Zone کا AOV Klaviyo خواہشات کی فہرست کی مہمات کے ساتھ 35% بڑھا",
          'Retain & Re-Engage 2nd tab Title': "اپنی خواہشات کی فہرست کی مقابلہ جیت لیں",
          'Retain & Re-Engage 2nd tab 1st paragraph': "خریدار اپنے پسندیدہ مصنوعات جیتنے کی جوش کا لطف اٹھاتے ہیں، جبکہ شمولیت، سماجی شیئرنگ اور تبدیلیوں کو فروغ دیتے ہیں۔",
          'Retain & Re-Engage 2nd tab 2nd paragraph': "POPFLEX نے خواہشات کی فہرست پر مبنی گفٹ اے وے مہم کے ذریعے 90K گاہک شامل کیے",
          'Retain & Re-Engage 3rd tab Title': "اومنی چینل تجربہ",
          'Retain & Re-Engage 3rd tab 1st paragraph': "آن لائن اور ان-اسٹور خریداری کے تجربات کے درمیان کی لکیروں کو دھندلا دیتا ہے، گاہک کی ترجیحات کی بنیاد پر فروخت کے ساتھیوں کو ذاتی بنانے میں مدد کرتا ہے۔",
          'Retain & Re-Engage 3rd tab 2nd paragraph': "Bombshell Sportswear نے Tapcart کا استعمال کرتے ہوئے خواہشات کی فہرست کی آمدنی میں 73% اضافہ دیکھا",
          'Quick Select': 'تیز انتخاب',
          'Today': 'آج',
          'Yesterday': 'کل',
          'Last 7 Days': 'پچھلے 7 دن',
          'Last 30 Days': 'پچھلے 30 دن',
          'This Month': 'اس مہینے',
          'Last Month': 'پچھلے مہینے',
          'Start Date': 'شروع کی تاریخ',
          'End Date': 'ختم کی تاریخ',
          'Cancel': 'منسوخ کریں',
          'Apply': 'لاگو کریں'
        },
        Configurations: {
          'Configurations': 'ترتیبات',
          'Subtitle Configurations': 'بٹن کے انداز، رنگ، شبیہیں، اور خواہش کی فہرست کے رویے کو حسب ضرورت بنائیں۔ ایڈجسٹ کریں کہ خواہش کی فہرستیں کیسے ظاہر ہوتی ہیں، مجموعہ اور کارٹ کے اختیارات ترتیب دیں، اور تبدیلیوں کا فوری طور پر جائزہ لیں۔ تمام تبدیلیاں آپ کے اسٹور فرنٹ پر لاگو ہوتی ہیں۔',
          'Basics': 'بنیادی باتیں',
          'Colors' : 'رنگ',
          'Primary color': 'پہلا رنگ',
          'Secondary color': 'دوسرا رنگ',
          'Icons': 'آئیکنز',
          'Heart': 'دل',
          'Star': 'ستارہ',
          'Bookmark': 'بک مارک',
          'Button size': 'بٹن کا سائز',
          'Icon thickness': 'آئیکن کی موٹائی',
          'Product page': 'مصنوعات کا صفحہ',
          'Button Position': 'بٹن کی پوزیشن',
          'Near cart button': 'کارٹ بٹن کے قریب',
          'On product image': 'مصنوعات کی تصویر پر',
          'Above Cart Button': 'کارٹ بٹن کے اوپر',
          'Below Cart Button': 'کارٹ بٹن کے نیچے',
          'Left of Cart Button': 'کارٹ بٹن کے بائیں',
          'Right of Cart Button': 'کارٹ بٹن کے دائیں',
          'Top Left': 'اوپر بائیں',
          'Top Right': 'اوپر دائیں',
          'Bottom Left': 'نیچے بائیں',
          'Bottom Right': 'نیچے دائیں',
          'Button Style': 'بٹن کا سٹائل',
          'Only Icon': 'صرف آئیکن',
          'Only Text': 'صرف متن',
          'Icon and Text': 'آئیکن اور متن',
          'Button Type': 'بٹن کی قسم',
          'Solid': "ٹھوس",
          'Outline': "آؤٹ لائن",
          'Plain': "سادہ",
          'Button text': 'بٹن کا متن',
          'Before Click': 'کلک کرنے سے پہلے',
          'After Click': 'کلک کرنے کے بعد',
          'Label': 'لیبل',
          'Add To Wishlist' : 'خواہشات کی فہرست میں شامل کریں',
          'Added To Wishlist' : 'خواہشات کی فہرست میں شامل کر دیا گیا',
          'Other Settings': 'دیگر ترتیبات',
          'Smart Save': 'سمارٹ محفوظ: شاپر کے ذریعے تین یا زیادہ بار دیکھے گئے مصنوعات کے لیے آٹو-خواہشات کی فہرست',
          'Social Proof': 'سماجی ثبوت: ان لوگوں کی تعداد دکھائیں جنہوں نے مصنوعات کو اپنی خواہشات کی فہرست میں شامل کیا ہے',
          'Collections': 'مجموعے',
          'Add item to wishlist from collection page': 'شاپروں کو مجموعہ کے صفحات سے خواہشات کی فہرست میں آئٹم شامل کرنے کی اجازت دیں',
          'Button Position': 'بٹن کی پوزیشن',
          'Top Left': 'اوپر بائیں',
          'Top Right': 'اوپر دائیں',
          'Bottom Left': 'نیچے بائیں',
          'Bottom Right': 'نیچے دائیں',
          'Wishlist Page': 'خواہشات کی فہرست کا صفحہ',
          'Text Color': 'متن کا رنگ',
          'Type': 'قسم',
          'Side Drawer': 'سائیڈ ڈراور',
          'Separate Page': 'الگ صفحہ',
          'Pop-up Modal': 'پاپ-اپ موڈل',
          'Page Title': 'صفحہ کا عنوان',
          'Launch From': 'سے لانچ کریں',
          'Header': 'ہیڈر',
          'Floating Button': 'فلوٹنگ بٹن',
          'Navigation Menu': 'نیویگیشن مینو',
          'Position': 'پوزیشن',
          'Left': 'بائیں',
          'Right': 'دائیں',
          'Button Left': 'بٹن بائیں',
          'Button Right': 'بٹن دائیں',
          'Corner Radius': 'کونے کی ریڈیس',
          'This needs to be set up manually': 'اسے دستی طور پر سیٹ کرنا ہوگا',
          'Show Count': 'گنتی دکھائیں',
          'Other Settings': 'دیگر ترتیبات',
          'Allow shoppers to Share Wishlist': 'شاپروں کو خواہشات کی فہرست شیئر کرنے کی اجازت دیں',
          'Cart': 'کارٹ',
          'Save for later pop-up': 'بعد کے لیے محفوظ پاپ-اپ',
          'Allow shoppers to save items': 'شاپروں کو کارٹ سے ہٹانے سے پہلے آئٹم محفوظ کرنے کی اجازت دیں',
          'Pop-up title': 'پاپ-اپ کا عنوان',
          'Primary button text': 'پہلا بٹن متن',
          'Secondary button text': 'دوسرا بٹن متن',
          'Permission': 'اجازت',
          'Allow shoppers to save items': 'شاپروں کو کارٹ سے ہٹانے سے پہلے آئٹم محفوظ کرنے کی اجازت دیں',
          'Ask the shopper if they want to see the pop-up again': 'شاپر سے پوچھیں کہ کیا وہ دوبارہ پاپ-اپ دیکھنا چاہتے ہیں',
          'Always show the pop-up': 'ہمیشہ پاپ-اپ دکھائیں',
          'Do you want to save this product for later?' :'کیا آپ اس پروڈکٹ کو بعد میں محفوظ کرنا چاہتے ہیں؟',
          'No, thanks!' :'نہیں، شکریہ!',
          'Save For later' :'بعد کے لیے محفوظ کریں۔',

        },
        Settings: {
          'Settings': 'ترتیبات',
          'Settings subtitle': 'اپنی ایپلیکیشن کی ترتیبات کو منظم کریں',
          'Installtions': 'انسٹالیشن',
          'installation subtitle': 'خواہشات کی فہرست ایپ انسٹال کرنے کے لیے اقدامات پر عمل کریں',
          'Notifications': 'نوٹیفیکیشن',
          'Notifications subtitle': 'نوٹیفیکیشن خود بخود بھیجے جاتے ہیں۔',
          'Language Settings': 'زبان کی ترتیبات',
          'Language Settings subtitle': 'فرنٹ-اینڈ زبان کے مواد کو اپنی مرضی کے مطابق بنائیں۔',
          "Language Settings Text": "جب آپ اپنی پوری اسٹور کی زبان تبدیل کرتے ہیں تو، وش لسٹ ایپ مکمل لچک فراہم کرتی ہے کہ آپ تمام سیکشنز کی زبان تبدیل کر سکیں، جس میں ٹیب اور بٹن بھی شامل ہیں۔",
          'Integerations': 'انٹیگریشن',
          'Integrations subtitle': 'منسلک ایپس دیکھیں اور منظم کریں۔',
        },
        Notifications: {
          'Notifications': 'نوٹیفیکیشن',
          'Notifications Subtitle': 'اطلاعات خود بخود بھیجی جاتی ہیں۔',
          'Alerts and Notifications': 'الرٹس اور نوٹیفیکیشن',
          'Days': 'دن',
          'Hours': 'گھنٹے',
          'Sign up confirmation': 'سائن اپ کی تصدیق',
          'Send a confirmation': 'جب شاپر اپنی خواہشات کی فہرست محفوظ کرتے ہیں تو تصدیق بھیجیں',
          'Wishlist Shared': 'خواہشات کی فہرست شیئر کی گئی',
          'Send a alert when shoppers share their wishlist': 'جب شاپر اپنی خواہشات کی فہرست دوسروں کے ساتھ شیئر کرتے ہیں تو الرٹ بھیجیں',
          'Wishlist Reminder': 'خواہشات کی فہرست کی یاددہانی',
          'Send reminders for wishlist ': 'خواہشات کی فہرست کے آئٹم کے لیے یاددہانی بھیجیں',
          'Send reminders on items saved for later': 'بعد کے لیے محفوظ کردہ آئٹم پر یاددہانی بھیجیں',
          'Send reminders for items saved for later after': 'بعد کے لیے محفوظ کردہ آئٹم کے لیے یاددہانی بھیجیں',
          'Send low stock alerts': 'کم اسٹاک الرٹس بھیجیں',
          'Send an alert when stock drops below': 'جب اسٹاک نیچے گرتا ہے تو الرٹ بھیجیں',
          'units': 'یونٹس',
          'Send Price Drop alert': 'قیمت میں کمی کا الرٹ بھیجیں',
          'Send an alert when price drops by': 'جب قیمت گرتی ہے تو الرٹ بھیجیں',
          'Send back in stock alerts': 'اسٹاک میں واپس الرٹس بھیجیں',
          'Send an alert when wislisted items are back in stock': 'جب خواہشات کی فہرست کے آئٹم اسٹاک میں واپس آتے ہیں تو الرٹ بھیجیں',
        },
        'Notification Details': {
          'insert Variables': 'متغیرات داخل کریں',
          'Email Subject': 'ای میل کا موضوع',
          'Email Text sign up confirmation': '{shop_name} میں خوش آمدید - آپ کی خواہشات کی فہرست تیار ہے!',
          'Email Text wishlist shared': 'آپ کی خواہشات کی فہرست شیئر کی گئی ہے',
          'Email Text wishlist reminder': "{shop_name} کی خواہشات کی فہرست کے آئٹم نہ بھولیں!",
          'Email Text Send reminders on Items Saved for Later': "{shop_name} میں آپ کے محفوظ کردہ آئٹم آپ کا انتظار کر رہے ہیں",
          'Email Text Send low stocks alerts': "کم اسٹاک الرٹ: {shop_name} میں {product_name}",
          'Email Text Send Price Drop Alert': "قیمت میں کمی کا الرٹ: {shop_name} میں {product_name}",
          'Email Text Send Back in stock alert': "اسٹاک میں واپس: {shop_name} میں {product_name}",
          'Branding': 'برانڈنگ',
          'Branding Type': 'برانڈنگ کی قسم',
          'Store name': 'دکان کا نام',
          'image': 'تصویر',
          'Logo': 'لوگو',
          'image width': 'تصویر کی چوڑائی',
          'Text Color': 'متن کا رنگ',
          'Background Color': 'پس منظر کا رنگ',
          'Padding Top': 'اوپر پیڈنگ',
          'Padding Bottom': 'نیچے پیڈنگ',
          'Text': 'متن',
          'Content': 'مواد',
          'Text in Text field sign up confirmation': 'ہیلو {customer_first_name} {customer_last_name}\n{shop_name} میں خوش آمدید! آپ کی خواہشات کی فہرست کامیابی سے بنائی گئی ہے۔ اب آپ اپنے پسندیدہ مصنوعات کو محفوظ کرنا شروع کر سکتے ہیں اور قیمت میں کمی، اسٹاک اپڈیٹس اور مزید کے بارے میں نوٹیفیکیشن حاصل کر سکتے ہیں۔\n\nخریداری کا لطف اٹھائیں!\n{shop_name} میں آپ کے دوست',
          'Text in Text field wishlist shared': 'ہیلو {customer_first_name} {customer_last_name}،\n\nآپ کی خواہشات کی فہرست کامیابی سے شیئر کی گئی ہے! آپ کے دوست اور خاندان اب آپ کے پسندیدہ آئٹم دیکھ سکتے ہیں اور آپ کو کیا خریدنے کا فیصلہ کرنے میں مدد کر سکتے ہیں۔\n\nشیئرنگ کا لطف اٹھائیں!\n{shop_name} میں آپ کے دوست',
          'Text in Text field wishlist reminder': 'ہیلو {customer_first_name} {customer_last_name}،\n\nآپ کی خواہشات کی فہرست میں حیرت انگیز آئٹم نہ بھولیں! آپ کے پاس {wishlist_count} آئٹم ہیں جو آپ کا انتظار کر رہے ہیں۔\n\nخریداری کا لطف اٹھائیں!\n{shop_name} میں آپ کے دوست',
          'Text in Text field Send reminders on Items Saved for Later': 'ہیلو {customer_first_name} {customer_last_name}،\n\nآپ کے محفوظ کردہ آئٹم اب بھی آپ کا انتظار کر رہے ہیں! آپ کے پاس {saved_count} آئٹم بعد کے لیے محفوظ ہیں۔\n\nخریداری کا لطف اٹھائیں!\n{shop_name} میں آپ کے دوست',
          'Text in Text field Send low stocks alerts': 'ہیلو {customer_first_name} {customer_last_name}،\n\nجلدی کریں! {product_name} اسٹاک میں کم ہے۔ صرف {stock_count} یونٹس باقی ہیں!\n\nنہ چھوڑیں!\n{shop_name} میں آپ کے دوست',
          'Text in Text field Send Price Drop Alert': 'ہیلو {customer_first_name} {customer_last_name}،\n\nاچھی خبر! {product_name} اب سیل میں ہے! قیمت {old_price} سے {new_price} تک {price_drop_percentage}% گر گئی ہے۔\n\nخریداری کا لطف اٹھائیں!\n{shop_name} میں آپ کے دوست',
          'Text in Text field Send Back in stock alert': 'ہیلو {customer_first_name} {customer_last_name}،\n\nاچھی خبر! {product_name} اسٹاک میں واپس آ گیا ہے اور آپ کی خریداری کے لیے تیار ہے!\n\nنہ چھوڑیں!\n{shop_name} میں آپ کے دوست',
          'Text Alignment': 'متن کی ترتیب',
          'Background Color': 'پس منظر کا رنگ',
          'Item Text Color': 'آئٹم متن کا رنگ',
          'Action button': 'ایکشن بٹن',
          'Action Button Text': 'بٹن کا متن',
          'Link': 'لنک',
          'Tracking Link': 'ٹریکنگ لنک',
          'Customize Link': 'لنک اپنی مرضی کے مطابق بنائیں',
          'Action Button Width (%)': 'بٹن کی چوڑائی (%)',
          'Action Button Font Size': 'فونٹ کا سائز',
          'Action Button Color': 'بٹن کا رنگ',
          'Action Button Color': 'بٹن کا رنگ',
          'Action Button Text Color': 'متن کا رنگ',
          'Action Button Alignment': 'ترتیب',
          'Background Color Button Area': 'پس منظر کا رنگ',
          'Footer': 'فوٹر',
          'Footer Text': 'متن',
          'Footer Text to send in sign up confirmation': '{shop_name} کو منتخب کرنے کے لیے شکریہ!\n{shop_name}',
          'Footer Text to send in wishlist shared': 'شیئرنگ کا لطف اٹھائیں!\n{shop_name}',
          'Footer Text to send in wishlist reminder': 'خریداری کا لطف اٹھائیں!\n{shop_name}',
          'Footer Text to send in Send reminders on Items Saved for Later': 'خریداری کا لطف اٹھائیں!\n{shop_name}',
          'Footer Text to send in Send low stocks alerts': 'نہ چھوڑیں!\n{shop_name}',
          'Footer Text to send in Send Price Drop Alert': 'خریداری کا لطف اٹھائیں!\n{shop_name}',
          'Footer Text to send in Send Back in stock alert': 'نہ چھوڑیں!\n{shop_name}',
          'Text Alignment Footer': 'متن کی ترتیب',
          'Text Color Footer': 'متن کا رنگ',
          'Background Color Footer': 'پس منظر کا رنگ',
          'Theme settings': 'تھیم کی ترتیبات',
          'Global setting': 'عالمی ترتیب',
          'Font Family': 'فونٹ فیملی',
          'Save': 'محفوظ کریں',
'Section': 'سیکشن',
'SF Pro Text': 'SF Pro Text',
'Arial': 'Arial',
'Courier New': 'Courier New',
'Georgia': 'Georgia',
'Lucida Sans Unicode': 'Lucida Sans Unicode',
'Tahoma': 'Tahoma',
'Times New Roman': 'Times New Roman',
'Trebuchet MS': 'Trebuchet MS',
'Verdana': 'Verdana',
"Back": "واپس"
        },
        Installation: {
          'Installation instructions': 'انسٹالیشن کی ہدایات',
          'Follow the steps below to install': 'اپنے Shopify اسٹور میں خواہشات کی فہرست ویجٹ ایپ انسٹال کرنے کے لیے نیچے دی گئی اقدامات پر عمل کریں۔',
          'Contact Us': 'ہم سے رابطہ کریں',
          'Paragraph Contact Us': 'آپ کو کوڈنگ معرفی نہیں ہے تو ہمیں صرف لائو سٹھ چیٹ یا سپورٹ ٹکٹ بنائیں۔',
          'Contact Support': 'سپورٹ سے رابطہ کریں',
          'Theme Extension Tab': 'تھیم ایکسٹینشن',
          'Expert Setup Tab': 'ماہر سیٹ اپ',
          'Manual Install Tab': 'دستی انسٹال',
          'Current theme status': 'موجودہ تھیم کی حالت',
          'Select Theme': 'تھیم منتخب کریں',
          'Current theme app embed status' : "موجودہ (شائع شدہ) تھیم ایپ ایمبیڈ اسٹیٹس",
          'App embed Status': 'ایپ ایمبیڈ کی حالت',
          "Enable": "فعال کریں",
          "Disable": "غیر فعال کریں",
          'Enable Wishlist app embed': 'خواہشات کی فہرست ایپ ایمبیڈ فعال کریں',
          'Enable the Wishlist Configurations': 'Shopify تھیم کی تخصیص میں جا کر تھیم کی ترتیبات کے App embeds سے خواہشات کی فہرست کی ترتیبات فعال کریں۔',
          'Activate Button': 'فعال کریں',
          'Add Wishlist block': 'خواہشات کی فہرست کا بلاک شامل کریں',
          'Add app block Text': 'اپنی منتخب کردہ تھیم پر خواہشات کی فہرست کی فعالیت دکھانے کے لیے ایپ بلاک شامل کریں۔ اپنی ترجیحات کے مطابق کامل پوزیشن حاصل کرنے کے لیے بلاک کی پوزیشنز کو اپنی مرضی کے مطابق بنائیں۔',
          'Wishlist Widget Near Cart Button': 'کارٹ بٹن کے قریب خواہشات کی فہرست ویجٹ',
          'Add Wishlist Widget Cart Button Text': "خواہشات کی فہرست ویجٹ شامل کرنے کے لیے، Shopify تھیم کی تخصیص کے سیکشن میں جائیں اور بلاک شامل کریں پر کلک کریں۔",
          'Button Text Wishlist Widget Near Cart Button': 'کارٹ بٹن کے قریب خواہشات کی فہرست ویجٹ',
          'Wishlist Widget On Product Image': 'مصنوعات کی تصویر پر خواہشات کی فہرست ویجٹ',
          'Button text Wishlist Widget On Product Image': 'مصنوعات کی تصویر پر خواہشات کی فہرست ویجٹ',
          'Text Wishlist Widget product image': "مصنوعات کی تصویر پر خواہشات کی فہرست ویجٹ شامل کرنے کے لیے Shopify تھیم کی تخصیص کے سیکشن میں جائیں اور بلاک شامل کریں پر کلک کریں",
          "Wishlist Widget Collection page": 'مجموعہ کے صفحہ پر خواہشات کی فہرست ویجٹ',
          "Button text Wishlist Widget Collection page": "مجموعہ کے صفحہ پر خواہشات کی فہرست ویجٹ",
          "Text Wishlist Widget Collection page": "Shopify کی تخصیص میں، مجموعہ کے صفحہ پر خواہشات کی فہرست ویجٹ شامل کرنے کے لیے بلاک شامل کریں پر کلک کریں۔",
          "My Wishlist Section": "میری خواہشات کی فہرست کا سیکشن",
          "Button text My Wishlist Section": "میری خواہشات کی فہرست کا سیکشن",
          "Text My Wishlist Section": "میری خواہشات کی فہرست کا سیکشن شامل کرنے کے لیے، Shopify تھیم کی تخصیص کے صفحہ پر نیویگیٹ کریں اور میری خواہشات کی فہرست کا سیکشن شامل کرنے اور آپ کی خواہشات کی فہرست کے آئٹم دیکھنے کے لیے بلاک شامل کریں پر کلک کریں۔",
        },
        "Save Bar": {
          "Save": "محفوظ کریں",
          "Discard": "رد کریں",
          "Unsaved Changes": "غیر محفوظ تبدیلیاں"
        },
        "Modals": {
          "Add New Language": "نئی زبان شامل کریں",
          "Enter language name (e.g., Swedish, Turkish)": "زبان کا نام درج کریں (مثلاً سویڈش، ترکی)",
          "Language Name": "زبان کا نام",
          "Cancel": "منسوخ کریں",
          "Add Language": "زبان شامل کریں",
          "Image": "تصویر",
          "Close": "بند کریں"
        }
      }
  });

  const sections = [
    'Sidebar Tabs',
    'Dashboard',
    'Configurations',
    'Settings',
    'Notifications',
    'Notification Details',
    'Installation',
    'Save Bar',
    'Modals'
  ];

  const predefinedLanguages = [
    'English',
    'French',
    'German',
    'Italian',
    'Russian',
    'Chinese',
    'Japanese',
    'Arabic',
    'Hindi',
    'Urdu'
  ];
  const getLanguageOptions = () => {
    const options = [
      { label: 'English', value: 'English' },
      { label: 'French', value: 'French' },
      { label: 'German', value: 'German' },
      { label: 'Italian', value: 'Italian' },
      { label: 'Russian', value: 'Russian' },
      { label: 'Chinese', value: 'Chinese' },
      { label: 'Japanese', value: 'Japanese' },
      { label: 'Arabic', value: 'Arabic' },
      { label: 'Hindi', value: 'Hindi' },
      { label: 'Urdu', value: 'Urdu' }
    ];
    Object.keys(languageFields).forEach(lang => {
      if (!predefinedLanguages.includes(lang)) {
        options.push({ label: lang, value: lang });
      }
    });

    // Add the "Add Language" option at the end
    options.push({ label: '+ Add Language', value: 'add_language' });

    return options;
  };
  useEffect(() => {
    function enhanceSaveBar() {
      const saveBar = document.querySelector('.Polaris-Frame-ContextualSaveBar');
      if (!saveBar) return;

      // Discard Button
      const discardButton = saveBar.querySelector('button.Polaris-Button--variantTertiary');
      const discardSpan = discardButton?.querySelector('span.Polaris-Text--medium');

      if (discardButton && discardSpan && discardSpan.textContent !== t("Discard", "Save Bar")) {
        discardSpan.textContent = t("Discard", "Save Bar");
        discardButton.style.backgroundColor = "#f1f2f3";
        discardButton.style.color = "#1c1c1c";
        discardButton.style.border = "1px solid #d1d1d1";
        discardButton.style.borderRadius = "8px";
        discardButton.style.padding = "8px 16px";
        discardButton.style.fontWeight = "500";
      }

      // Save Button
      const saveButton = saveBar.querySelector('button.Polaris-Button--variantPrimary');
      const saveSpan = saveButton?.querySelector('span.Polaris-Text--medium');

      if (saveSpan && saveSpan.textContent !== t("Save", "Save Bar")) {
        saveSpan.textContent = t("Save", "Save Bar");
      }
    }

    intervalRef.current = setInterval(() => {
      const saveBarVisible = document.querySelector('.Polaris-Frame-ContextualSaveBar');
      if (saveBarVisible) {
        enhanceSaveBar();
      }
    }, 300); // Runs every 300ms only when bar is visible

    return () => {
      clearInterval(intervalRef.current);
    };
  }, [t]);

  // Add these new functions
  const createEmptyLanguageTemplate = (languageName = null) => {
    const template = {};
    sections.forEach(section => {
      template[section] = {};
      
      // If a specific language is provided and it's a predefined language, use its default values
      if (languageName && predefinedLanguages.includes(languageName) && languageFields[languageName] && languageFields[languageName][section]) {
        // Use the default values from the initial state for this language
        Object.keys(languageFields[languageName][section]).forEach(field => {
          template[section][field] = languageFields[languageName][section][field];
        });
      } else if (languageFields['English'] && languageFields['English'][section]) {
      // Use the initial English structure from the state
        Object.keys(languageFields['English'][section]).forEach(field => {
          template[section][field] = '';
        });
      } else {
        // Fallback: create basic structure for each section
        switch(section) {
          case 'Sidebar Tabs':
            template[section] = {
              'Configuration': '',
              'Settings': '',
              'Customers': ''
            };
            break;
          case 'Dashboard':
            template[section] = {
              'Dashboard': '',
              'Active Wishlist Widget': '',
              'Text active wishlist widget': '',
              'Button text activate wishlist widget': '',
              'Wishlist Highlights': '',
              'Total Wishlist Products': '',
              'Total Lists': '',
              'Setup Guide': '',
              'completed': ''
            };
            break;
          case 'Configurations':
            template[section] = {
              'Basics': '',
              'Primary color': '',
              'Secondary color': '',
              'Icons': '',
              'Heart': '',
              'Bookmark': '',
              'Button size': '',
              'Icon thickness': '',
              'Product page': '',
              'Button Position': '',
              'Near cart button': '',
              'On product image': '',
              'Button Type': '',
              'Solid': '',
              'Outline': '',
              'Plain': '',
              'Button text': '',
              'Before Click': '',
              'After Click': '',
              'Label': '',
              'Add to Wishlist': '',
              'Added to Wishlist': ''
            };
            break;
          case 'Settings':
            template[section] = {
              'Installtions': '',
              'installation subtitle': '',
              'Notifications': '',
              'Notifications subtitle': '',
              'Language Settings': '',
              'Language Settings subtitle': '',
              'Integerations': '',
              'Integrations subtitle': ''
            };
            break;
          case 'Notifications':
            template[section] = {
              'Notifications': '',
              'Alerts and Notifications': '',
              'Days': '',
              'Hours': '',
              'Sign up confirmation': '',
              'Send a confirmation': '',
              'Wishlist Shared': '',
              'Send a alert when shoppers share their wishlist': '',
              'Wishlist Reminder': '',
              'Send reminders for wishlist ': '',
              'Send reminders on items saved for later': '',
              'Send reminders for items saved for later after': '',
              'Send low stock alerts': '',
              'Send an alert when stock drops below': '',
              'units': '',
              'Send Price Drop alert': '',
              'Send an alert when price drops by': '',
              'Send back in stock alerts': '',
              'Send an alert when wislisted items are back in stock': ''
            };
            break;
          case 'Notification Details':
            template[section] = {
              'insert Variables': '',
              'Email Subject': '',
              'Email Text sign up confirmation': '',
              'Email Text wishlist shared': '',
              'Email Text wishlist reminder': '',
              'Email Text Send reminders on Items Saved for Later': '',
              'Email Text Send low stocks alerts': '',
              'Email Text Send Price Drop Alert': '',
              'Email Text Send Back in stock alert': '',
              'Branding': '',
              'Branding Type': '',
              'Store name': '',
              'image': '',
              'Logo': '',
              'image width': '',
              'Text Color': '',
              'Background Color': '',
              'Padding Top': '',
              'Padding Bottom': '',
              'Text': '',
              'Content': ''
            };
            break;
          case 'Installation':
            template[section] = {
              'Installation instructions': '',
              'Follow the steps below to install': '',
              'Contact Us': '',
              'Contact Support': '',
              'Theme Extension Tab': '',
              'Expert Setup Tab': '',
              'Manual Install Tab': '',
              'Current theme status': '',
              'Select Theme': '',
              'App embed Status': '',
              'Enable': '',
              'Disable': '',
              'Enable Wishlist app embed': '',
              'Enable the Wishlist Configurations': '',
              'Activate Button': '',
              'Add Wishlist block': '',
              'Add app block Text': ''
            };
            break;
          default:
            template[section] = {};
        }
      }
    });
    return template;
  };

  const handleLanguageChange = async (value) => {
    if (value === 'add_language') {
      setShowAddLanguageModal(true);
    } else {
      // Save current language state before switching
      if (hasUnsavedChanges) {
        // If there are unsaved changes, save them first
        await handleSaveBarSave();
      }
      
      // Use context's changeLanguage to update globally
      const success = await changeLanguage(value);
      if (success) {
        // Initialize lastSavedState for the new language if it doesn't exist
        if (!lastSavedState[value]) {
          setLastSavedState(prev => ({
            ...prev,
            [value]: JSON.parse(JSON.stringify(languageFields[value] || createEmptyLanguageTemplate(value)))
          }));
        }
        
        // Reset unsaved changes flag for the new language
        setHasUnsavedChanges(false);
        
        // Force a re-evaluation of unsaved changes after language switch
        setTimeout(() => {
          const currentLanguageData = languageFields[value];
          const lastSavedLanguageData = lastSavedState[value];
          
          if (lastSavedLanguageData) {
            const hasChanges = JSON.stringify(currentLanguageData) !== JSON.stringify(lastSavedLanguageData);
            setHasUnsavedChanges(hasChanges);
          } else {
            // If no saved state exists, mark as unsaved if there's any data
            const hasData = currentLanguageData && Object.keys(currentLanguageData).length > 0;
            setHasUnsavedChanges(hasData);
          }
        }, 200);
      } else {
        toggleToast("error", "Failed to switch language. Please try again.");
      }
    }
  };

  const handleAddLanguage = async () => {
    if (newLanguageName.trim() === '') {
      toggleToast("error", "Please enter a language name");
      return;
    }

    // Check if language name already exists
    if (predefinedLanguages.includes(newLanguageName) || languageFields[newLanguageName]) {
      toggleToast("error", "This language already exists. Please choose a different name.");
      return;
    }

    // Create empty template for new language
    const emptyTemplate = createEmptyLanguageTemplate(); // No language name for custom languages
    
    // Save new language via API
    const success = await saveLanguage(newLanguageName, emptyTemplate, true);
    
    if (success) {
      // Set as active language
      await changeLanguage(newLanguageName);
      setShowAddLanguageModal(false);
      setNewLanguageName('');
      toggleToast("success", `Language "${newLanguageName}" added successfully!`);
    } else {
      toggleToast("error", "Failed to add language. Please try again.");
    }
  };

  const handleCancelAddLanguage = () => {
    setShowAddLanguageModal(false);
    setNewLanguageName('');
  };

    const handleFieldChange = async (section, field, value) => {
    // Update local state immediately
    setLanguageFields(prev => {
      const updatedFields = {
        ...prev,
        [currentLanguage]: {
          ...(prev[currentLanguage] || {}),
          [section]: {
            ...(prev[currentLanguage]?.[section] || {}),
            [field]: value
          }
        }
      };

      return updatedFields;
    });

    // Mark as unsaved
    setTimeout(() => markUnsaved(), 0);
  };

  const loadLanguages = async () => {
    try {
      setLoading(true);
        // // Debug: Log the initial languageFields
        // console.log('Initial languageFields:', languageFields);
        // console.log('French data exists:', !!languageFields.French);
        // console.log('French data keys:', languageFields.French ? Object.keys(languageFields.French) : 'No French data');
      const token = await getSessionToken(appBridge);
      if (!token) return;
      
      const response = await fetch(`${apiUrl}languages`, {
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      });
      
      if (!response.ok) return;
      const data = await response.json();
      
      if (data.status) {
        // Start with the current languageFields (which contains default data)
        const languages = { ...languageFields };
        
        // Ensure all predefined languages are available with their default data
        const predefinedLanguages = ['English', 'French', 'German', 'Italian', 'Russian', 'Chinese', 'Japanese', 'Arabic', 'Hindi', 'Urdu'];
        predefinedLanguages.forEach(langName => {
          // Always ensure predefined languages have their default data from initial state
          if (!languages[langName] || Object.keys(languages[langName]).length === 0) {
            // Use the default data from the initial state instead of empty template
            languages[langName] = languageFields[langName] || createEmptyLanguageTemplate(langName);
          }
        });
        
        // If there are languages in the database, merge them with predefined data
        if (data.data.languages && data.data.languages.length > 0) {
          data.data.languages.forEach(lang => {
            if (predefinedLanguages.includes(lang.language_name)) {
              // For predefined languages, merge database data with default data
              const defaultData = languageFields[lang.language_name] || createEmptyLanguageTemplate(lang.language_name);
              languages[lang.language_name] = {
                ...defaultData,
                ...lang.language_data
              };
            } else {
              // For custom languages, use database data as is
              languages[lang.language_name] = lang.language_data;
            }
          });
        }
        
        // Always ensure English exists with complete structure
        if (!languages['English']) {
          languages['English'] = languageFields['English'] || createEmptyLanguageTemplate('English');
        }
        
        // Ensure all languages have complete structure
        Object.keys(languages).forEach(langName => {
          if (!languages[langName] || Object.keys(languages[langName]).length === 0) {
            // For predefined languages, use default data; for custom languages, use empty template
            if (predefinedLanguages.includes(langName)) {
              languages[langName] = languageFields[langName] || createEmptyLanguageTemplate(langName);
            } else {
            languages[langName] = createEmptyLanguageTemplate();
            }
          }
        });
        
        setLanguageFields(languages);
        
        // Initialize last saved state for all languages
        const initialLastSavedState = {};
        Object.keys(languages).forEach(langName => {
          initialLastSavedState[langName] = JSON.parse(JSON.stringify(languages[langName]));
        });
        setLastSavedState(initialLastSavedState);
        
        // Set active language
        if (data.data.active_language) {
          changeLanguage(data.data.active_language.language_name);
        } else {
          // If no active language, set English as default
          changeLanguage('English');
        }
      }
    } catch (error) {
      console.error('Error loading languages:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveLanguage = async (languageName, languageData, isCustom = false) => {
    try {
      setSaving(true);
      const token = await getSessionToken(appBridge);
      if (!token) return false;
      
      const response = await fetch(`${apiUrl}languages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({
          language_name: languageName,
          language_data: languageData,
          is_custom: isCustom
        }),
      });
      
      const data = await response.json();
      
      if (data.status) {
        // Reload languages after saving
        await loadLanguages();
        return true;
      } else {
        console.error('Error saving language:', data.message);
        return false;
      }
    } catch (error) {
      console.error('Error saving language:', error);
      return false;
    } finally {
      setSaving(false);
    }
  };

  // Load languages on component mount
  useEffect(() => {
    loadLanguages();
    
    // Cleanup function to clear any pending timeouts
    return () => {
      clearTimeout(window.saveTimeout);
    };
  }, []);

  // Ensure selected language has proper structure
  useEffect(() => {
    if (currentLanguage && (!languageFields[currentLanguage] || Object.keys(languageFields[currentLanguage]).length === 0)) {
      setLanguageFields(prev => ({
        ...prev,
        [currentLanguage]: predefinedLanguages.includes(currentLanguage) 
          ? createEmptyLanguageTemplate(currentLanguage)  // Use default values for predefined languages
          : createEmptyLanguageTemplate()  // Use empty template for custom languages
      }));
    }
  }, [currentLanguage, languageFields]);

  // Handle section change
  const handleSectionChange = (section) => {
    setSelectedSection(section);
  };

  // Save function for the save bar
  const handleSaveBarSave = async () => {
    setSaving(true);
    setSaveMessage("");
    try {
      const success = await saveLanguage(currentLanguage, languageFields[currentLanguage]);
      if (success) {
        setSaveMessage("Saved successfully!");
        toggleToast("success", "Language settings saved successfully!");
        // Update last saved state
        setLastSavedState(prev => ({
          ...prev,
          [currentLanguage]: JSON.parse(JSON.stringify(languageFields[currentLanguage]))
        }));
        setHasUnsavedChanges(false);
      } else {
        setSaveMessage("Save failed. Please try again.");
        toggleToast("error", "Failed to save language settings. Please try again.");
      }
    } catch (error) {
      console.error('Save error:', error);
      setSaveMessage("Save failed. Please try again.");
      toggleToast("error", "Failed to save language settings. Please try again.");
    }
    setSaving(false);
  };

  // Reset to last saved state
  const resetToLastSaved = () => {
    if (lastSavedState[currentLanguage]) {
      setLanguageFields(prev => ({
        ...prev,
        [currentLanguage]: JSON.parse(JSON.stringify(lastSavedState[currentLanguage]))
      }));
    } else {
      // If no saved state exists, reset to default values for predefined languages
      // or empty template for custom languages
      setLanguageFields(prev => ({
        ...prev,
        [currentLanguage]: predefinedLanguages.includes(currentLanguage) 
          ? createEmptyLanguageTemplate(currentLanguage)  // Use default values for predefined languages
          : createEmptyLanguageTemplate()  // Use empty template for custom languages
      }));
    }
    setHasUnsavedChanges(false);
  };

  // Mark as unsaved when any field changes
  const markUnsaved = () => {
    const currentLanguageData = languageFields[currentLanguage];
    const lastSavedLanguageData = lastSavedState[currentLanguage];
    
    if (!lastSavedLanguageData) {
      // Initialize lastSavedState for current language if it doesn't exist
      setLastSavedState(prev => ({
        ...prev,
        [currentLanguage]: JSON.parse(JSON.stringify(currentLanguageData))
      }));
      setHasUnsavedChanges(false);
      return;
    }
  
    // Compare current state with last saved state
    const hasChanges = JSON.stringify(currentLanguageData) !== JSON.stringify(lastSavedLanguageData);
    
    if (hasChanges && !hasUnsavedChanges) {
      setHasUnsavedChanges(true);
    } else if (!hasChanges && hasUnsavedChanges) {
      setHasUnsavedChanges(false);
    }
  };

  const handleSave = async () => {
    const success = await saveLanguage(currentLanguage, languageFields[currentLanguage]);
    if (success) {
      // Show success message or handle as needed
      console.log('Language saved successfully');
    }
  };

  return (
    <Frame>
      {toasts.error && <Toast content={toasts.msg} error onDismiss={() => toggleToast("error")} />}
      {toasts.success && <Toast content={toasts.msg} onDismiss={() => toggleToast("success")} />}
      
      {hasUnsavedChanges && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 1000,
          background: '#ffffff',
          borderBottom: '1px solid #e3e3e3',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        }}>
        
          <ContextualSaveBar
            fullWidth
            alignContentFlush
            message={
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'flex-start',
                width: '100%',
                fontWeight: 600,
                color: '#222',
              }}>
                <span style={{ color: '#222' }}>{t('Unsaved Changes', 'Save Bar')}</span>
              </div>
            }
            saveAction={{
              onAction: handleSaveBarSave,
              loading: saving,
              disabled: saving,
            }}
            discardAction={{
              onAction: resetToLastSaved,
            }}
          />
        </div>
        
      )}
      <div
        style={{
          maxWidth: 1400,
          margin: '0 auto 0 auto',
          display: 'flex',
          justifyContent: 'flex-start',
          width: '100%',
          background: '#F3F3F3',
          borderTop: 'none',
          borderTopLeftRadius: 0,
          borderTopRightRadius: 0,
          borderBottomLeftRadius: 16,
          borderBottomRightRadius: 16,
          padding: 24,
          gap: 24,
          flexDirection: 'column',
          minWidth: 0,
          marginTop: 0,
        }}
      >
         <div style={{
          fontSize: 20,
          fontWeight: 700,
          margin: 0,
          color: '#222',
          letterSpacing: 0.5,
          alignItems: 'center',
          width: '100%',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div>
            {t('Language Settings', 'Settings')}
            <br />
            {/* <span style={{ fontSize: 13, color: '#555', fontWeight: 400, maxWidth: 700, marginTop: 2 }}>Notifications are automatically sent out.</span> */}
          </div>
            <Button
              variant="primary"
              size="medium"
              loading={saving}
              disabled={saving}
              onClick={handleSaveBarSave}
            >
              {t('Save', 'Notification Details')}
            </Button>
        </div>

        {/* Informational Card */}
        <Card style={{ marginBottom: '24px' }}>
          <div style={{ padding: '24px' }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              marginBottom: '16px'
            }}>
              <Text variant="headingMd" as="h2" fontWeight="bold">
                {t('Language Settings', 'Settings')}
              </Text>
              {/* <Button 
                variant="plain" 
                tone="info"
                onClick={() => window.open('https://help.shopify.com', '_blank')}
              >
                View Article
              </Button> */}
            </div>
            <Text as="p" variant="bodyMd" color="subdued">
              {t('Language Settings Text', 'Settings')}
            </Text>
          </div>
        </Card>

        {/* Main Content - Side by Side */}
        {loading || !languageFields[currentLanguage] ? (
          <div style={{ 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center', 
            height: '200px',
            fontSize: '16px',
            color: '#666'
          }}>
            {loading ? t('Loading languages...', 'Language Settings') : t('Preparing language data...', 'Language Settings')}
          </div>
        ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '30% calc(70% - 24px)', gap: '24px', width: '100%', alignItems: 'start' }}>
          {/* Left Section - Review Section */}
          <Card style={{ height: 'fit-content' }}>
            <div style={{ padding: '24px' }}>
              {/* Language Selector */}
              <div style={{ marginBottom: '24px' }}>
                <Text variant="headingMd" as="h3" fontWeight="bold" style={{ marginBottom: '12px' }}>
                  {t('Checkout language', 'Language Settings')}
                </Text>
                <Select
                  label=""
                  labelInline
                  options={getLanguageOptions()}
                  value={currentLanguage}
                  onChange={handleLanguageChange}
                  placeholder={t('Select language', 'Language Settings')}
                />
                <Text variant="bodyMd" color="subdued" style={{ marginTop: '8px', fontSize: '14px' }}>
                  {t('You can change the text.', 'Language Settings')}
                </Text>
              </div>

              <Text variant="headingMd" as="h3" fontWeight="bold" style={{ marginBottom: '16px' }}>
                {t('Review Section', 'Language Settings')}
              </Text>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                {sections.map((section) => (
                  <div
                    key={section}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '12px 16px',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      backgroundColor: selectedSection === section ? '#F6F6F7' : 'transparent',
                      border: selectedSection === section ? '1px solid #E1E3E5' : '1px solid transparent'
                    }}
                    onClick={() => handleSectionChange(section)}
                  >
                    <Text variant="bodyMd" as="span">
                      {t(section, 'Language Settings')}
                    </Text>
                    {selectedSection === section && (
                      <Text variant="bodyMd" as="span" color="success" fontWeight="bold">
                        ✓
                      </Text>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </Card>

          {/* Right Section - Selected Section Details */}
          <div style={{
            backgroundColor: 'white',
            borderRadius: '8px',
            padding: '24px',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
            height: 'fit-content',
            minHeight: 'fit-content'
          }}>
            <Text variant="headingMd" as="h3" fontWeight="bold" style={{ marginBottom: '24px' }}>
              {t(selectedSection, 'Language Settings')}
            </Text>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              {(() => {
                const currentSection = languageFields[currentLanguage] && languageFields[currentLanguage][selectedSection];
                // console.log('Current section data:', selectedSection, currentSection);
                return Object.entries(currentSection || {}).map(([field, value], index) => (
                  <div key={field}>
                    <Text variant="bodyMd" as="label" fontWeight="medium" style={{ marginBottom: '8px', display: 'block' }}>
                      {t(field, selectedSection)}
                    </Text>
                    <TextField
                      value={value}
                      onChange={(newValue) => handleFieldChange(selectedSection, field, newValue)}
                      placeholder={t(`Enter ${field.toLowerCase()}`, selectedSection)}
                      autoComplete="off"
                      // multiline={3}
                    />
                  </div>
                ));
              })()}
            </div>
          </div>
        </div>
        )}
        {showAddLanguageModal && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 1000
          }}>
            <Card style={{ width: '400px', padding: '24px' }}>
              <Text variant="headingMd" as="h3" fontWeight="bold" style={{ marginBottom: '16px' }}>
                {t('Add New Language', 'Modals')}
              </Text>
              <div style={{ marginBottom: '16px' }}>
                <TextField
                  label={t('Language Name', 'Modals')}
                  value={newLanguageName}
                  onChange={setNewLanguageName}
                  placeholder={t('Enter language name (e.g., Swedish, Turkish)', 'Modals')}
                  autoComplete="off"
                  // multiline={2}
                />
              </div>
              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                <Button variant="plain" onClick={handleCancelAddLanguage}>
                  {t('Cancel', 'Modals')}
                </Button>
                <Button variant="primary" onClick={handleAddLanguage}>
                  {t('Add Language', 'Modals')}
                </Button>
              </div>
            </Card>
          </div>
        )}
      </div>
    </Frame>
  );
} 