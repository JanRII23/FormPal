// FormPal - Background Service Worker

// Handle extension installation
chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === 'install') {
    console.log('FormPal: Extension installed');
  } else if (details.reason === 'update') {
    console.log('FormPal: Extension updated');
  }
});

// Handle messages between popup and content scripts
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  // Forward messages to content script if needed
  if (message.type === 'FILL_FORM') {
    // Message will be handled directly by content script
    // This is just for logging/analytics if needed in the future
    console.log('FormPal: Fill form request received');
  }
  
  return false;
});

// Handle tab updates to inject content script if needed
// Note: Content scripts are declared in manifest, but we can also
// dynamically inject if needed for specific pages
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && tab.url) {
    // Content script will automatically load on matching pages
    // This listener can be used for additional functionality if needed
  }
});

console.log('FormPal: Background service worker initialized');
