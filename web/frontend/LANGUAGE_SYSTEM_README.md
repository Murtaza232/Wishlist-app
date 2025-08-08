# Language System Implementation

## Overview

This document describes the comprehensive language system implemented across the wishlist application. The system provides centralized language management with support for multiple languages, custom language creation, and seamless integration across all pages.

## Architecture

### Core Components

1. **LanguageProvider** (`components/providers/LanguageProvider.jsx`)
   - Central context provider for language management
   - Handles language loading, switching, and data management
   - Provides translation function (`t`) for accessing translated text

2. **LanguageSelector** (`components/LanguageSelector.jsx`)
   - Reusable component for language switching
   - Can be used across any page in the application

3. **Backend Integration**
   - LanguageController handles API endpoints
   - LanguageSetting model manages database operations
   - Supports custom languages and predefined languages

### Key Features

- **Multi-language Support**: English, French, German, Russian, Chinese, Japanese
- **Custom Languages**: Users can create and manage custom languages
- **Centralized Management**: All language data managed through context
- **Real-time Switching**: Instant language switching across the entire application
- **Fallback System**: Graceful fallback to English when translations are missing
- **Database Persistence**: Language settings saved to database per shop

## Usage

### Basic Translation

```jsx
import { useLanguage } from '../components';

function MyComponent() {
  const { t } = useLanguage();
  
  return (
    <div>
      <h1>{t('Dashboard')}</h1>
      <p>{t('Text active wishlist widget')}</p>
    </div>
  );
}
```

### Language Switching

```jsx
import { useLanguage } from '../components';

function MyComponent() {
  const { currentLanguage, changeLanguage, availableLanguages } = useLanguage();
  
  const handleLanguageChange = async (newLanguage) => {
    await changeLanguage(newLanguage);
  };
  
  return (
    <select value={currentLanguage} onChange={(e) => handleLanguageChange(e.target.value)}>
      {availableLanguages.map(lang => (
        <option key={lang} value={lang}>{lang}</option>
      ))}
    </select>
  );
}
```

### Using LanguageSelector Component

```jsx
import { LanguageSelector } from '../components';

function MyPage() {
  return (
    <div>
      <header>
        <LanguageSelector />
      </header>
      {/* Rest of your page content */}
    </div>
  );
}
```

## Language Data Structure

The language system uses a hierarchical structure:

```javascript
{
  "English": {
    "Dashboard": {
      "Dashboard": "Dashboard",
      "Active Wishlist Widget": "Active Wishlist Widget",
      "Text active wishlist widget": "To ensure full functionality...",
      // ... more translations
    },
    "Sidebar Tabs": {
      "Configuration": "Configuration",
      "Settings": "Settings",
      "Customers": "Customers"
    },
    // ... more sections
  },
  "French": {
    // French translations
  },
  // ... more languages
}
```

## API Endpoints

### Get Languages
- **GET** `/api/languages`
- Returns all languages for the current shop

### Save Language
- **POST** `/api/languages`
- Saves language data to database

### Set Active Language
- **POST** `/api/languages/set-active`
- Sets the active language for the shop

### Get Active Language
- **GET** `/api/languages/active`
- Returns the currently active language

### Delete Language
- **DELETE** `/api/languages`
- Deletes a custom language

## Database Schema

```sql
CREATE TABLE language_settings (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    shop_id BIGINT NOT NULL,
    language_name VARCHAR(255) NOT NULL,
    language_data JSON NOT NULL,
    is_active BOOLEAN DEFAULT FALSE,
    is_custom BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

## Implementation in Pages

### Index.jsx Integration

The main dashboard page demonstrates comprehensive language integration:

1. **Header Translation**: Dashboard title and navigation elements
2. **Alert Messages**: Banner text and button labels
3. **Metrics**: Statistics labels and descriptions
4. **Setup Guide**: Step titles, descriptions, and button text
5. **Feature Sections**: All content sections with translated text
6. **Language Selector**: Added to the header for easy language switching

### Key Translation Keys

Common translation keys used across the application:

- `Dashboard` - Main dashboard title
- `Active Wishlist Widget` - Widget activation banner
- `Text active wishlist widget` - Widget activation description
- `Wishlist Highlights` - Statistics section title
- `Total Wishlist Products` - Metric label
- `Total Lists` - Metric label
- `Setup Guide` - Setup section title
- `completed` - Completion status text
- `Smart Notifications Alerts` - Setup step title
- `Widget Personalization` - Setup step title
- `Localize` - Setup step title
- `Much more than a Wishlist` - Feature section title
- `subtitle much more than wishlist` - Feature section subtitle
- `tabs why it matters` - Feature explanation label

## Adding New Languages

### 1. Add Default Data

Add the new language to the `defaultLanguageData` in `LanguageProvider.jsx`:

```javascript
const defaultLanguageData = {
  English: { /* existing data */ },
  French: { /* existing data */ },
  NewLanguage: {
    Dashboard: {
      "Dashboard": "Translated Dashboard",
      "Active Wishlist Widget": "Translated Widget",
      // ... more translations
    },
    // ... more sections
  }
};
```

### 2. Update LanguageSelector

Add the new language to the `languageOptions` array in `LanguageSelector.jsx`:

```javascript
const languageOptions = [
  { label: 'English', value: 'English' },
  { label: 'French', value: 'French' },
  { label: 'NewLanguage', value: 'NewLanguage' },
  // ... existing options
];
```

### 3. Backend Support

The backend automatically supports new languages. Custom languages are stored in the database, while predefined languages use default data.

## Best Practices

### 1. Translation Keys

- Use descriptive, hierarchical keys
- Group related translations in sections
- Use consistent naming conventions
- Avoid hardcoded strings in components

### 2. Fallback Handling

- Always provide fallback text
- Use the key as fallback when translation is missing
- Log missing translations in development

### 3. Performance

- Language data is loaded once and cached
- Translations are memoized to prevent unnecessary re-renders
- Language switching is optimized for minimal re-renders

### 4. Testing

- Test with different languages
- Verify fallback behavior
- Test custom language creation
- Ensure all text is translatable

## Troubleshooting

### Common Issues

1. **Translation not showing**
   - Check if the key exists in the language data
   - Verify the section parameter is correct
   - Check browser console for errors

2. **Language not switching**
   - Verify the language name matches exactly
   - Check if the language exists in available languages
   - Ensure the API call is successful

3. **Missing translations**
   - Add missing keys to the language data
   - Use the key as fallback text
   - Log missing translations for tracking

### Debug Mode

Enable debug logging by adding to the LanguageProvider:

```javascript
const t = useCallback((key, section = 'Dashboard') => {
  const translation = languageData[section]?.[key] || key;
  if (process.env.NODE_ENV === 'development' && !languageData[section]?.[key]) {
    console.warn(`Missing translation: ${section}.${key}`);
  }
  return translation;
}, [languageData]);
```

## Future Enhancements

1. **Translation Management Interface**
   - Web-based translation editor
   - Bulk import/export functionality
   - Translation memory system

2. **Advanced Features**
   - Pluralization support
   - Date/time formatting
   - Number formatting
   - RTL language support

3. **Performance Optimizations**
   - Lazy loading of language data
   - Compression of translation data
   - CDN caching for language files

## Conclusion

The language system provides a robust, scalable solution for multi-language support across the entire application. It's designed to be easy to use, maintain, and extend while providing excellent performance and user experience. 