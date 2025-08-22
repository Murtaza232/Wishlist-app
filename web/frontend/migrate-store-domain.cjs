#!/usr/bin/env node

/**
 * Migration script to update fetch calls to use store domain utilities
 * 
 * This script helps identify and update remaining fetch calls that need
 * to be migrated to use the new store domain utilities.
 * 
 * Usage: node migrate-store-domain.js
 */

const fs = require('fs');
const path = require('path');

// Files that have already been updated
const UPDATED_FILES = [
  'App.jsx',
  'wishlist-reminder.jsx'
];

// Files to skip (don't contain fetch calls or are already using hooks)
const SKIP_FILES = [
  'index.jsx',
  'index.css',
  'package.json',
  'vite.config.js',
  'tailwind.config.js',
  'postcss.config.js',
  'Routes.jsx',
  'NotFound.jsx',
  'ExitIframe.jsx'
];

function findJsxFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory() && !file.startsWith('.') && file !== 'node_modules') {
      findJsxFiles(filePath, fileList);
    } else if (file.endsWith('.jsx') && !UPDATED_FILES.includes(file) && !SKIP_FILES.includes(file)) {
      fileList.push(filePath);
    }
  });
  
  return fileList;
}

function analyzeFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const fileName = path.basename(filePath);
    
    // Check if file uses useAuthenticatedFetch hook
    const usesHook = content.includes('useAuthenticatedFetch');
    
    // Find direct fetch calls
    const fetchMatches = content.match(/fetch\(/g);
    const fetchCount = fetchMatches ? fetchMatches.length : 0;
    
    // Find axios calls
    const axiosMatches = content.match(/api\.(get|post|put|delete|patch)\(/g);
    const axiosCount = axiosMatches ? axiosMatches.length : 0;
    
    if (fetchCount > 0 || axiosCount > 0) {
      console.log(`\n📁 ${fileName}`);
      console.log(`   📍 ${filePath}`);
      
      if (usesHook) {
        console.log(`   ✅ Uses useAuthenticatedFetch hook (automatic store domain)`);
        if (fetchCount > 0) {
          console.log(`   ⚠️  Has ${fetchCount} direct fetch calls (need manual update)`);
        }
      } else {
        console.log(`   ❌ No useAuthenticatedFetch hook`);
        if (fetchCount > 0) {
          console.log(`   🔴 Has ${fetchCount} direct fetch calls (need manual update)`);
        }
      }
      
      if (axiosCount > 0) {
        console.log(`   ✅ Has ${axiosCount} axios calls (automatic store domain)`);
      }
      
      return {
        file: fileName,
        path: filePath,
        usesHook,
        fetchCount,
        axiosCount,
        needsUpdate: fetchCount > 0 && !usesHook
      };
    }
    
    return null;
  } catch (error) {
    console.error(`Error reading ${filePath}:`, error.message);
    return null;
  }
}

function generateMigrationSteps(fileInfo) {
  if (!fileInfo.needsUpdate) return '';
  
  return `
## ${fileInfo.file}

**File**: \`${fileInfo.path}\`
**Status**: Needs manual update (${fileInfo.fetchCount} fetch calls)

**Steps to update**:
1. Import the utility:
   \`\`\`jsx
   import { fetchWithStoreDomain, fetchWithStoreDomainInQuery } from '../utils/fetchUtils';
   \`\`\`

2. Replace fetch calls:
   \`\`\`jsx
   // Before
   const response = await fetch(url, options);
   
   // After
   const response = await fetchWithStoreDomain(url, options);
   \`\`\`

3. For GET requests, use:
   \`\`\`jsx
   const response = await fetchWithStoreDomainInQuery(url, options);
   \`\`\`
`;
}

function main() {
  console.log('🔍 Analyzing frontend files for store domain migration...\n');
  
  const jsxFiles = findJsxFiles('./pages');
  const componentFiles = findJsxFiles('./components');
  const allFiles = [...jsxFiles, ...componentFiles];
  
  console.log(`Found ${allFiles.length} JSX files to analyze\n`);
  
  const fileAnalysis = allFiles
    .map(analyzeFile)
    .filter(Boolean);
  
  const needsUpdate = fileAnalysis.filter(f => f.needsUpdate);
  const autoUpdated = fileAnalysis.filter(f => !f.needsUpdate);
  
  console.log('\n📊 SUMMARY');
  console.log('==========');
  console.log(`Total files analyzed: ${fileAnalysis.length}`);
  console.log(`✅ Automatically updated: ${autoUpdated.length}`);
  console.log(`🔴 Need manual update: ${needsUpdate.length}`);
  
  if (needsUpdate.length > 0) {
    console.log('\n📝 MIGRATION GUIDE');
    console.log('==================');
    
    needsUpdate.forEach(fileInfo => {
      console.log(generateMigrationSteps(fileInfo));
    });
    
    console.log('\n💡 TIP: Most components can be simplified by using the useAuthenticatedFetch hook instead of direct fetch calls.');
    console.log('   This automatically includes the store domain and handles authentication.');
  }
  
  console.log('\n🎯 NEXT STEPS');
  console.log('==============');
  console.log('1. Update the files listed above to use fetchWithStoreDomain utilities');
  console.log('2. Consider migrating to useAuthenticatedFetch hook for better integration');
  console.log('3. Test all API endpoints to ensure store_domain is included');
  console.log('4. Update backend to handle the new store_domain parameter');
}

if (require.main === module) {
  main();
}

module.exports = { findJsxFiles, analyzeFile };
