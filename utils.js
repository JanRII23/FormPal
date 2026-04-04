// FormPal - Utility Functions for Profile Management

const STORAGE_KEY = 'formpal_profiles';

/**
 * Generate a unique UUID v4
 * @returns {string}
 */
function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

/**
 * Get all stored profiles
 * @returns {Promise<Array>}
 */
async function getProfiles() {
  return new Promise((resolve, reject) => {
    chrome.storage.local.get([STORAGE_KEY], (result) => {
      if (chrome.runtime.lastError) {
        reject(chrome.runtime.lastError);
        return;
      }
      const profiles = result[STORAGE_KEY] || [];
      resolve(profiles);
    });
  });
}

/**
 * Save a profile (create or update)
 * @param {Object} profile - Profile object with all fields
 * @returns {Promise<Object>} - The saved profile
 */
async function saveProfile(profile) {
  const profiles = await getProfiles();
  
  // If no ID, create new profile
  if (!profile.id) {
    profile.id = generateUUID();
    profile.createdAt = new Date().toISOString();
  }
  
  profile.updatedAt = new Date().toISOString();
  
  // Check if profile exists and update, or add new
  const existingIndex = profiles.findIndex(p => p.id === profile.id);
  if (existingIndex >= 0) {
    profiles[existingIndex] = profile;
  } else {
    profiles.push(profile);
  }
  
  return new Promise((resolve, reject) => {
    chrome.storage.local.set({ [STORAGE_KEY]: profiles }, () => {
      if (chrome.runtime.lastError) {
        reject(chrome.runtime.lastError);
        return;
      }
      resolve(profile);
    });
  });
}

/**
 * Delete a profile by ID
 * @param {string} profileId - The profile ID to delete
 * @returns {Promise<boolean>}
 */
async function deleteProfile(profileId) {
  const profiles = await getProfiles();
  const filteredProfiles = profiles.filter(p => p.id !== profileId);
  
  return new Promise((resolve, reject) => {
    chrome.storage.local.set({ [STORAGE_KEY]: filteredProfiles }, () => {
      if (chrome.runtime.lastError) {
        reject(chrome.runtime.lastError);
        return;
      }
      resolve(true);
    });
  });
}

/**
 * Get a single profile by ID
 * @param {string} profileId
 * @returns {Promise<Object|null>}
 */
async function getProfileById(profileId) {
  const profiles = await getProfiles();
  return profiles.find(p => p.id === profileId) || null;
}

/**
 * Export all profiles as JSON
 * @returns {Promise<string>} - JSON string of all profiles
 */
async function exportData() {
  const profiles = await getProfiles();
  const exportObj = {
    version: '2.0',
    exportedAt: new Date().toISOString(),
    profiles: profiles
  };
  return JSON.stringify(exportObj, null, 2);
}

/**
 * Migrate profile from v1 schema to v2 schema
 * @param {Object} profile - Profile in v1 format
 * @returns {Object} - Profile in v2 format
 */
function migrateProfileV1toV2(profile) {
  const migrated = { ...profile };
  
  // Migrate contact info
  if (migrated.contact && migrated.contact.fullName && !migrated.contact.firstName) {
    const nameParts = migrated.contact.fullName.split(' ');
    migrated.contact.firstName = nameParts[0] || '';
    migrated.contact.lastName = nameParts.slice(1).join(' ') || '';
  }
  
  // Migrate work from single object to array
  if (migrated.work && !Array.isArray(migrated.work)) {
    migrated.work = [{
      id: generateUUID(),
      order: 0,
      jobTitle: migrated.work.jobTitle || '',
      company: migrated.work.company || '',
      startDate: migrated.work.startDate || '',
      endDate: migrated.work.endDate || '',
      responsibilities: migrated.work.responsibilities || ''
    }];
  }
  
  // Migrate education from single object to array
  if (migrated.education && !Array.isArray(migrated.education)) {
    migrated.education = [{
      id: generateUUID(),
      order: 0,
      school: migrated.education.school || '',
      degree: migrated.education.degree || '',
      fieldOfStudy: migrated.education.fieldOfStudy || '',
      graduationYear: migrated.education.graduationYear || ''
    }];
  }
  
  // Add default values for new fields
  if (!migrated.contact) {
    migrated.contact = {};
  }
  if (!migrated.contact.preferredName) migrated.contact.preferredName = '';
  if (!migrated.contact.fullName) migrated.contact.fullName = '';
  if (!migrated.contact.linkedIn) migrated.contact.linkedIn = '';
  if (!migrated.contact.website) migrated.contact.website = '';
  
  if (!migrated.address) {
    migrated.address = {};
  }
  if (!migrated.address.county) migrated.address.county = '';
  if (!migrated.address.country) migrated.address.country = '';
  
  return migrated;
}

/**
 * Import profiles from JSON string
 * @param {string} jsonString - JSON string to import
 * @param {boolean} merge - Whether to merge with existing profiles (true) or replace (false)
 * @returns {Promise<{imported: number, errors: Array}>}
 */
async function importData(jsonString, merge = true) {
  try {
    const importObj = JSON.parse(jsonString);
    
    if (!importObj.profiles || !Array.isArray(importObj.profiles)) {
      throw new Error('Invalid import format: missing profiles array');
    }
    
    const existingProfiles = merge ? await getProfiles() : [];
    const existingIds = new Set(existingProfiles.map(p => p.id));
    
    let importedCount = 0;
    const errors = [];
    
    for (const profile of importObj.profiles) {
      try {
        // Validate required fields
        if (!profile.name) {
          errors.push(`Profile missing name, skipped`);
          continue;
        }
        
        // Migrate from v1 schema if needed
        const version = importObj.version || '1.0';
        let processedProfile = profile;
        if (version === '1.0') {
          processedProfile = migrateProfileV1toV2(profile);
        }
        
        // Generate new ID if duplicate to avoid conflicts
        if (existingIds.has(processedProfile.id)) {
          processedProfile.id = generateUUID();
        }
        existingIds.add(processedProfile.id);
        
        existingProfiles.push(processedProfile);
        importedCount++;
      } catch (e) {
        errors.push(`Error importing profile "${profile.name || 'unknown'}": ${e.message}`);
      }
    }
    
    return new Promise((resolve, reject) => {
      chrome.storage.local.set({ [STORAGE_KEY]: existingProfiles }, () => {
        if (chrome.runtime.lastError) {
          reject(chrome.runtime.lastError);
          return;
        }
        resolve({ imported: importedCount, errors });
      });
    });
  } catch (e) {
    throw new Error(`Import failed: ${e.message}`);
  }
}

/**
 * Download a file with the given content
 * @param {string} content - File content
 * @param {string} filename - Filename to save as
 * @param {string} mimeType - MIME type
 */
function downloadFile(content, filename, mimeType = 'application/json') {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Read a file as text
 * @param {File} file - File object to read
 * @returns {Promise<string>}
 */
function readFileAsText(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(reader.error);
    reader.readAsText(file);
  });
}

/**
 * Send message to content script to fill form
 * @param {string} profileId - The profile ID to use for filling
 * @returns {Promise<{success: boolean, fieldsFilled: number, message: string}>}
 */
async function triggerFillForm(profileId) {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  
  if (!tab) {
    return { success: false, fieldsFilled: 0, message: 'No active tab found' };
  }
  
  const profile = await getProfileById(profileId);
  
  if (!profile) {
    return { success: false, fieldsFilled: 0, message: 'Profile not found' };
  }
  
  return new Promise((resolve) => {
    chrome.tabs.sendMessage(tab.id, {
      type: 'FILL_FORM',
      profile: profile
    }, (response) => {
      if (chrome.runtime.lastError) {
        resolve({
          success: false,
          fieldsFilled: 0,
          message: 'Could not connect to page. Make sure you are on a form page.'
        });
        return;
      }
      resolve(response || { success: false, fieldsFilled: 0, message: 'No response from content script' });
    });
  });
}

// Draft storage key
const DRAFT_STORAGE_KEY = 'formpal_draft';

/**
 * Save form data as draft
 * @param {Object} profileData - The profile data to save as draft
 * @returns {Promise<void>}
 */
async function saveDraft(profileData) {
  return new Promise((resolve, reject) => {
    chrome.storage.local.set({ [DRAFT_STORAGE_KEY]: profileData }, () => {
      if (chrome.runtime.lastError) {
        reject(chrome.runtime.lastError);
        return;
      }
      resolve();
    });
  });
}

/**
 * Get saved draft
 * @returns {Promise<Object|null>}
 */
async function getDraft() {
  return new Promise((resolve, reject) => {
    chrome.storage.local.get([DRAFT_STORAGE_KEY], (result) => {
      if (chrome.runtime.lastError) {
        reject(chrome.runtime.lastError);
        return;
      }
      resolve(result[DRAFT_STORAGE_KEY] || null);
    });
  });
}

/**
 * Clear saved draft
 * @returns {Promise<void>}
 */
async function clearDraft() {
  return new Promise((resolve, reject) => {
    chrome.storage.local.remove([DRAFT_STORAGE_KEY], () => {
      if (chrome.runtime.lastError) {
        reject(chrome.runtime.lastError);
        return;
      }
      resolve();
    });
  });
}

/**
 * Send profile data directly to content script to fill form
 * @param {Object} profile - The profile data to use for filling
 * @returns {Promise<{success: boolean, fieldsFilled: number, message: string}>}
 */
async function triggerFillFormWithData(profile) {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  
  if (!tab) {
    return { success: false, fieldsFilled: 0, message: 'No active tab found' };
  }
  
  return new Promise((resolve) => {
    chrome.tabs.sendMessage(tab.id, {
      type: 'FILL_FORM',
      profile: profile
    }, (response) => {
      if (chrome.runtime.lastError) {
        resolve({
          success: false,
          fieldsFilled: 0,
          message: 'Could not connect to page. Make sure you are on a form page.'
        });
        return;
      }
      resolve(response || { success: false, fieldsFilled: 0, message: 'No response from content script' });
    });
  });
}
