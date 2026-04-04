// FormPal - Content Script for Form Detection and Autofill

(function() {
  'use strict';

  // Field mapping configurations - common patterns for job application fields
  const FIELD_MAPPINGS = {
    // Contact Information
    firstName: {
      selectors: [
        'input[name*="first" i]',
        'input[id*="first" i]',
        'input[placeholder*="first name" i]',
        'input[aria-label*="first name" i]',
        'input[autocomplete="given-name"]',
        '#firstname', '#first-name', '#firstName'
      ],
      type: 'text'
    },
    lastName: {
      selectors: [
        'input[name*="last" i]',
        'input[id*="last" i]',
        'input[placeholder*="last name" i]',
        'input[aria-label*="last name" i]',
        'input[autocomplete="family-name"]',
        '#lastname', '#last-name', '#lastName'
      ],
      type: 'text'
    },
    preferredName: {
      selectors: [
        'input[name*="preferred" i]',
        'input[name*="nickname" i]',
        'input[id*="preferred" i]',
        'input[id*="nickname" i]',
        'input[placeholder*="preferred" i]',
        'input[placeholder*="nickname" i]',
        '#preferredName', '#nickname'
      ],
      type: 'text'
    },
    fullName: {
      selectors: [
        'input[name*="name" i]',
        'input[id*="name" i]',
        'input[placeholder*="name" i]',
        'input[aria-label*="name" i]',
        'input[autocomplete*="name" i]',
        '#name', '#fullname', '#full-name',
        'input[id*="full-name" i]',
        'input[name*="fullname" i]'
      ],
      type: 'text'
    },
    email: {
      selectors: [
        'input[name*="email" i]',
        'input[id*="email" i]',
        'input[type="email"]',
        'input[placeholder*="email" i]',
        'input[autocomplete*="email" i]',
        '#email', '#email-address'
      ],
      type: 'email'
    },
    phone: {
      selectors: [
        'input[name*="phone" i]',
        'input[name*="tel" i]',
        'input[id*="phone" i]',
        'input[id*="tel" i]',
        'input[type="tel"]',
        'input[placeholder*="phone" i]',
        'input[placeholder*="tel" i]',
        'input[autocomplete*="tel" i]',
        '#phone', '#phone-number', '#telephone'
      ],
      type: 'tel'
    },
    linkedIn: {
      selectors: [
        'input[name*="linkedin" i]',
        'input[name*="linked-in" i]',
        'input[name*="profileurl" i]',
        'input[name*="profile_url" i]',
        'input[name*="profile-url" i]',
        'input[id*="linkedin" i]',
        'input[id*="linked-in" i]',
        'input[id*="profileurl" i]',
        'input[id*="profile_url" i]',
        'input[id*="profile-url" i]',
        'input[placeholder*="linkedin" i]',
        'input[placeholder*="linked-in" i]',
        'input[placeholder*="linkedin.com" i]',
        'input[placeholder*="profile url" i]',
        'input[placeholder*="profile URL" i]',
        'input[placeholder*="personal website" i]',
        '#linkedin', '#linkedIn', '#linked-in', '#profileUrl', '#profile-url', '#profile_url'
      ],
      type: 'url'
    },
    website: {
      selectors: [
        'input[name*="website" i]',
        'input[name*="url" i]',
        'input[name*="portfolio" i]',
        'input[id*="website" i]',
        'input[id*="url" i]',
        'input[placeholder*="website" i]',
        'input[placeholder*="portfolio" i]',
        '#website', '#portfolio', '#personal-website'
      ],
      type: 'url'
    },

    // Address - Street
    street: {
      selectors: [
        'input[name*="street" i]',
        'input[id*="street" i]',
        'input[placeholder*="street" i]',
        'input[autocomplete*="street" i]',
        '#street', '#address', '#address1', '#address-line1',
        'input[name*="address1" i]',
        'input[name*="address-1" i]'
      ],
      type: 'text'
    },
    city: {
      selectors: [
        'input[name*="city" i]',
        'input[id*="city" i]',
        'input[placeholder*="city" i]',
        'input[autocomplete*="address-level2" i]',
        '#city', '#city-input'
      ],
      type: 'text'
    },
    state: {
      selectors: [
        'input[name*="state" i]',
        'input[name*="region" i]',
        'input[name*="province" i]',
        'input[id*="state" i]',
        'select[name*="state" i]',
        'select[id*="state" i]',
        'select[name*="region" i]',
        'input[placeholder*="state" i]',
        'input[autocomplete*="address-level1" i]',
        '#state', '#region', '#province'
      ],
      type: 'text'
    },
    zipCode: {
      selectors: [
        'input[name*="zip" i]',
        'input[name*="postal" i]',
        'input[name*="code" i]',
        'input[id*="zip" i]',
        'input[placeholder*="zip" i]',
        'input[placeholder*="postal" i]',
        'input[autocomplete*="postal" i]',
        '#zip', '#zipcode', '#zip-code', '#postal', '#postal-code'
      ],
      type: 'text'
    },
    county: {
      selectors: [
        'input[name*="county" i]',
        'input[id*="county" i]',
        'input[placeholder*="county" i]',
        '#county', '#county-input'
      ],
      type: 'text'
    },
    country: {
      selectors: [
        'select[name*="country" i]',
        'select[id*="country" i]',
        'input[name*="country" i]',
        'input[id*="country" i]',
        'input[placeholder*="country" i]',
        '#country', '#country-input'
      ],
      type: 'select'
    },

    // Work Experience
    jobTitle: {
      selectors: [
        'input[name*="title" i]',
        'input[name*="position" i]',
        'input[id*="title" i]',
        'input[placeholder*="title" i]',
        'input[placeholder*="position" i]',
        'input[autocomplete*="organization-title" i]',
        '#title', '#position', '#job-title'
      ],
      type: 'text'
    },
    company: {
      selectors: [
        'input[name*="company" i]',
        'input[name*="employer" i]',
        'input[name*="organization" i]',
        'input[id*="company" i]',
        'input[placeholder*="company" i]',
        'input[placeholder*="employer" i]',
        'input[autocomplete*="organization" i]',
        '#company', '#employer', '#organization'
      ],
      type: 'text'
    },
    startDate: {
      selectors: [
        'input[name*="start" i]',
        'input[name*="from" i]',
        'input[id*="start" i]',
        'input[placeholder*="start" i]',
        'input[placeholder*="from" i]',
        'input[type="date"][name*="start" i]',
        'input[type="date"][name*="from" i]',
        '#start-date', '#startDate', '#from-date'
      ],
      type: 'text'
    },
    endDate: {
      selectors: [
        'input[name*="end" i]',
        'input[name*="to" i]',
        'input[id*="end" i]',
        'input[placeholder*="end" i]',
        'input[placeholder*="to" i]',
        'input[type="date"][name*="end" i]',
        'input[type="date"][name*="to" i]',
        '#end-date', '#endDate', '#to-date'
      ],
      type: 'text'
    },
    responsibilities: {
      selectors: [
        'textarea[name*="respons" i]',
        'textarea[name*="desc" i]',
        'textarea[name*="duties" i]',
        'textarea[id*="respons" i]',
        'textarea[placeholder*="respons" i]',
        'textarea[placeholder*="describe" i]',
        '#responsibilities', '#description', '#duties'
      ],
      type: 'textarea'
    },

    // Education
    school: {
      selectors: [
        'input[name*="school" i]',
        'input[name*="university" i]',
        'input[name*="college" i]',
        'input[name*="institution" i]',
        'input[id*="school" i]',
        'input[placeholder*="school" i]',
        'input[placeholder*="university" i]',
        'input[autocomplete*="school" i]',
        '#school', '#university', '#college'
      ],
      type: 'text'
    },
    degree: {
      selectors: [
        'input[name*="degree" i]',
        'input[name*="diploma" i]',
        'select[name*="degree" i]',
        '#degree', '#education-level', 'select[id*="degree" i]'
      ],
      type: 'text'
    },
    fieldOfStudy: {
      selectors: [
        'input[name*="field" i]',
        'input[name*="major" i]',
        'input[name*="study" i]',
        'input[name*="concentration" i]',
        'input[placeholder*="field" i]',
        'input[placeholder*="major" i]',
        '#field', '#major', '#field-of-study'
      ],
      type: 'text'
    },
    graduationYear: {
      selectors: [
        'input[name*="graduation" i]',
        'input[name*="graduated" i]',
        'input[name*="year" i]',
        'input[placeholder*="graduation" i]',
        'input[placeholder*="year" i]',
        '#graduation', '#graduation-year', '#graduationYear'
      ],
      type: 'text'
    },

    // Skills
    skills: {
      selectors: [
        'input[name*="skill" i]',
        'textarea[name*="skill" i]',
        'input[placeholder*="skill" i]',
        'textarea[placeholder*="skill" i]',
        '#skills', '#skills-input'
      ],
      type: 'text'
    },
    languages: {
      selectors: [
        'input[name*="language" i]',
        'textarea[name*="language" i]',
        'input[placeholder*="language" i]',
        '#languages', '#language'
      ],
      type: 'text'
    },
    certifications: {
      selectors: [
        'input[name*="certif" i]',
        'textarea[name*="certif" i]',
        'input[placeholder*="certif" i]',
        '#certifications', '#certificates', '#certs'
      ],
      type: 'text'
    },

    // Resume Info
    summary: {
      selectors: [
        'textarea[name*="summary" i]',
        'textarea[name*="objective" i]',
        'textarea[name*="about" i]',
        'textarea[name*="description" i]',
        'textarea[placeholder*="summary" i]',
        'textarea[placeholder*="about" i]',
        '#summary', '#objective', '#about'
      ],
      type: 'textarea'
    },
    workEligibility: {
      selectors: [
        'input[name*="eligibility" i]',
        'input[name*="authorized" i]',
        'input[name*="citizen" i]',
        'input[name*="visa" i]',
        'input[name*="work" i]',
        'select[name*="eligibility" i]',
        'select[name*="authorized" i]',
        'input[placeholder*="eligible" i]',
        '#eligibility', '#work-authorization', '#authorization'
      ],
      type: 'text'
    },
    salaryExpectations: {
      selectors: [
        'input[name*="salary" i]',
        'input[name*="compensation" i]',
        'input[name*="pay" i]',
        'input[name*="wage" i]',
        'input[placeholder*="salary" i]',
        'input[placeholder*="compensation" i]',
        '#salary', '#compensation', '#expected-salary', '#desired-salary'
      ],
      type: 'text'
    }
  };

  // Select element types to search
  const SELECTABLE_TYPES = ['input', 'textarea', 'select'];

  /**
   * Find form elements on the page
   */
  function findFormElements() {
    const elements = {};
    
    for (const [fieldName, config] of Object.entries(FIELD_MAPPINGS)) {
      elements[fieldName] = findElementForField(config.selectors);
    }
    
    return elements;
  }

  /**
   * Find all elements matching field selectors (for filling multiple entries)
   */
  function findAllFormElements() {
    const elements = {};
    
    for (const [fieldName, config] of Object.entries(FIELD_MAPPINGS)) {
      elements[fieldName] = [];
      for (const selector of config.selectors) {
        try {
          const found = document.querySelectorAll(selector);
          for (const el of found) {
            if (isElementVisible(el) && !isElementDisabled(el)) {
              elements[fieldName].push(el);
            }
          }
        } catch (e) {
          // Invalid selector, continue to next
        }
      }
    }
    
    return elements;
  }

  /**
   * Find the best matching element for a field
   */
  function findElementForField(selectors) {
    for (const selector of selectors) {
      try {
        const elements = document.querySelectorAll(selector);
        for (const el of elements) {
          // Check if element is visible and enabled
          if (isElementVisible(el) && !isElementDisabled(el)) {
            return el;
          }
        }
      } catch (e) {
        // Invalid selector, continue to next
      }
    }
    return null;
  }

  /**
   * Check if element is visible
   */
  function isElementVisible(el) {
    if (el.type === 'hidden') return false;
    
    const style = window.getComputedStyle(el);
    if (style.display === 'none' || style.visibility === 'hidden') return false;
    
    const rect = el.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return false;
    
    return true;
  }

  /**
   * Check if element is disabled
   */
  function isElementDisabled(el) {
    return el.disabled || el.readOnly;
  }

  /**
   * Fill an input/textarea/select element
   */
  function fillElement(el, value) {
    if (!value || !el) return false;
    
    // Clear existing value
    el.focus();
    
    // Use different methods based on element type
    if (el.tagName === 'SELECT') {
      return fillSelect(el, value);
    } else if (el.type === 'checkbox') {
      return fillCheckbox(el, value);
    } else if (el.type === 'radio') {
      return fillRadio(el, value);
    } else {
      // For input and textarea
      // Clear using native methods
      el.select && el.select();
      el.value = '';
      
      // Set new value
      el.value = value;
      
      // Trigger events to notify any listeners
      triggerInputEvents(el);
      
      return true;
    }
  }

  /**
   * Fill a select element
   */
  function fillSelect(el, value) {
    const normalizedValue = value.toLowerCase().trim();
    const options = el.options;
    
    // First, try exact match
    for (let i = 0; i < options.length; i++) {
      const optionText = options[i].textContent.toLowerCase().trim();
      const optionValue = options[i].value.toLowerCase().trim();
      
      if (optionText === normalizedValue || optionValue === normalizedValue) {
        el.selectedIndex = i;
        triggerChangeEvents(el);
        return true;
      }
    }
    
    // Try partial match
    for (let i = 0; i < options.length; i++) {
      const optionText = options[i].textContent.toLowerCase().trim();
      const optionValue = options[i].value.toLowerCase().trim();
      
      if (optionText.includes(normalizedValue) || optionValue.includes(normalizedValue) ||
          normalizedValue.includes(optionText) || normalizedValue.includes(optionValue)) {
        el.selectedIndex = i;
        triggerChangeEvents(el);
        return true;
      }
    }
    
    return false;
  }

  /**
   * Fill a checkbox based on value
   */
  function fillCheckbox(el, value) {
    const shouldCheck = value.toString().toLowerCase() === 'true' || 
                        value.toString().toLowerCase() === 'yes' ||
                        value.toString().toLowerCase() === '1';
    
    if ((el.checked && !shouldCheck) || (!el.checked && shouldCheck)) {
      el.click();
    }
    return true;
  }

  /**
   * Fill a radio button based on value
   */
  function fillRadio(el, value) {
    const normalizedValue = value.toLowerCase().trim();
    const radioGroup = document.querySelectorAll(`input[name="${el.name}"]`);
    
    for (const radio of radioGroup) {
      const radioValue = radio.value.toLowerCase().trim();
      if (radioValue === normalizedValue || radio.id.toLowerCase().includes(normalizedValue)) {
        radio.checked = true;
        triggerChangeEvents(radio);
        return true;
      }
    }
    
    return false;
  }

  /**
   * Trigger input-related events
   */
  function triggerInputEvents(el) {
    const inputEvent = new InputEvent('input', {
      bubbles: true,
      cancelable: true,
      inputType: 'insertText',
      data: el.value
    });
    el.dispatchEvent(inputEvent);
    
    const changeEvent = new Event('change', {
      bubbles: true,
      cancelable: true
    });
    el.dispatchEvent(changeEvent);
  }

  /**
   * Trigger change events
   */
  function triggerChangeEvents(el) {
    const changeEvent = new Event('change', {
      bubbles: true,
      cancelable: true
    });
    el.dispatchEvent(changeEvent);
  }

  /**
   * Build full name from contact
   */
  function buildFullName(contact) {
    return contact.fullName || '';
  }

  /**
   * Get the first work entry or the only entry
   */
  function getWorkEntry(profile) {
    if (Array.isArray(profile.work) && profile.work.length > 0) {
      // Return the first one (sorted by order)
      return profile.work.sort((a, b) => (a.order || 0) - (b.order || 0))[0];
    }
    return profile.work || null;
  }

  /**
   * Get the first education entry or the only entry
   */
  function getEducationEntry(profile) {
    if (Array.isArray(profile.education) && profile.education.length > 0) {
      // Return the first one (sorted by order)
      return profile.education.sort((a, b) => (a.order || 0) - (b.order || 0))[0];
    }
    return profile.education || null;
  }

  /**
   * Fill form with profile data (single entry version)
   */
  function fillFormWithProfile(profile) {
    const elements = findFormElements();
    let fieldsFilled = 0;
    
    // Contact info
    if (profile.contact) {
      const contact = profile.contact;
      
      // New schema: firstName, lastName, preferredName
      if (contact.firstName && elements.firstName) {
        if (fillElement(elements.firstName, contact.firstName)) fieldsFilled++;
      }
      if (contact.lastName && elements.lastName) {
        if (fillElement(elements.lastName, contact.lastName)) fieldsFilled++;
      }
      if (contact.preferredName && elements.preferredName) {
        if (fillElement(elements.preferredName, contact.preferredName)) fieldsFilled++;
      }
      
      // fullName - use stored value directly
      if (contact.fullName && elements.fullName) {
        if (fillElement(elements.fullName, contact.fullName)) fieldsFilled++;
      }
      
      if (contact.email && elements.email) {
        if (fillElement(elements.email, contact.email)) fieldsFilled++;
      }
      if (contact.phone && elements.phone) {
        if (fillElement(elements.phone, contact.phone)) fieldsFilled++;
      }
      if (contact.linkedIn && elements.linkedIn) {
        if (fillElement(elements.linkedIn, contact.linkedIn)) fieldsFilled++;
      }
      if (contact.website && elements.website) {
        if (fillElement(elements.website, contact.website)) fieldsFilled++;
      }
    }
    
    // Address
    if (profile.address) {
      const address = profile.address;
      if (address.street && elements.street) {
        if (fillElement(elements.street, address.street)) fieldsFilled++;
      }
      if (address.city && elements.city) {
        if (fillElement(elements.city, address.city)) fieldsFilled++;
      }
      if (address.state && elements.state) {
        if (fillElement(elements.state, address.state)) fieldsFilled++;
      }
      if (address.zipCode && elements.zipCode) {
        if (fillElement(elements.zipCode, address.zipCode)) fieldsFilled++;
      }
      if (address.county && elements.county) {
        if (fillElement(elements.county, address.county)) fieldsFilled++;
      }
      if (address.country && elements.country) {
        if (fillElement(elements.country, address.country)) fieldsFilled++;
      }
    }
    
    // Work experience
    const workEntry = getWorkEntry(profile);
    if (workEntry) {
      if (workEntry.jobTitle && elements.jobTitle) {
        if (fillElement(elements.jobTitle, workEntry.jobTitle)) fieldsFilled++;
      }
      if (workEntry.company && elements.company) {
        if (fillElement(elements.company, workEntry.company)) fieldsFilled++;
      }
      if (workEntry.startDate && elements.startDate) {
        if (fillElement(elements.startDate, workEntry.startDate)) fieldsFilled++;
      }
      if (workEntry.endDate && elements.endDate) {
        if (fillElement(elements.endDate, workEntry.endDate)) fieldsFilled++;
      }
      if (workEntry.responsibilities && elements.responsibilities) {
        if (fillElement(elements.responsibilities, workEntry.responsibilities)) fieldsFilled++;
      }
    }
    
    // Education
    const educationEntry = getEducationEntry(profile);
    if (educationEntry) {
      if (educationEntry.school && elements.school) {
        if (fillElement(elements.school, educationEntry.school)) fieldsFilled++;
      }
      if (educationEntry.degree && elements.degree) {
        if (fillElement(elements.degree, educationEntry.degree)) fieldsFilled++;
      }
      if (educationEntry.fieldOfStudy && elements.fieldOfStudy) {
        if (fillElement(elements.fieldOfStudy, educationEntry.fieldOfStudy)) fieldsFilled++;
      }
      if (educationEntry.graduationYear && elements.graduationYear) {
        if (fillElement(elements.graduationYear, educationEntry.graduationYear)) fieldsFilled++;
      }
    }
    
    // Skills
    if (profile.skills) {
      if (profile.skills.skills && elements.skills) {
        if (fillElement(elements.skills, profile.skills.skills)) fieldsFilled++;
      }
      if (profile.skills.languages && elements.languages) {
        if (fillElement(elements.languages, profile.skills.languages)) fieldsFilled++;
      }
      if (profile.skills.certifications && elements.certifications) {
        if (fillElement(elements.certifications, profile.skills.certifications)) fieldsFilled++;
      }
    }
    
    // Resume info
    if (profile.resume) {
      if (profile.resume.summary && elements.summary) {
        if (fillElement(elements.summary, profile.resume.summary)) fieldsFilled++;
      }
      if (profile.resume.workEligibility && elements.workEligibility) {
        if (fillElement(elements.workEligibility, profile.resume.workEligibility)) fieldsFilled++;
      }
      if (profile.resume.salaryExpectations && elements.salaryExpectations) {
        if (fillElement(elements.salaryExpectations, profile.resume.salaryExpectations)) fieldsFilled++;
      }
    }
    
    return fieldsFilled;
  }

  // Listen for messages from popup
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === 'FILL_FORM') {
      try {
        const profile = message.profile;
        const fieldsFilled = fillFormWithProfile(profile);
        
        sendResponse({
          success: fieldsFilled > 0,
          fieldsFilled: fieldsFilled,
          message: fieldsFilled > 0 
            ? `Successfully filled ${fieldsFilled} field(s)`
            : 'No matching fields found on this page'
        });
      } catch (error) {
        console.error('FormPal: Error filling form:', error);
        sendResponse({
          success: false,
          fieldsFilled: 0,
          message: 'Error filling form: ' + error.message
        });
      }
    }
    
    // Return true to indicate we'll send response asynchronously
    return true;
  });

  // Log ready message
  console.log('FormPal: Content script loaded');
})();
