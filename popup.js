// FormPal - Popup Script

const MAX_WORK_ENTRIES = 5;
const MAX_EDUCATION_ENTRIES = 3;

document.addEventListener('DOMContentLoaded', async () => {
  // DOM Elements
  const profileSelect = document.getElementById('profileSelect');
  const profileEditor = document.getElementById('profileEditor');
  const editorTitle = document.getElementById('editorTitle');
  const profileForm = document.getElementById('profileForm');
  const btnNewProfile = document.getElementById('btnNewProfile');
  const btnEditProfile = document.getElementById('btnEditProfile');
  const btnSaveProfile = document.getElementById('btnSaveProfile');
  const btnCancelEdit = document.getElementById('btnCancelEdit');
  const btnDeleteProfile = document.getElementById('btnDeleteProfile');
  const btnBack = document.getElementById('btnBack');
  const btnFillForm = document.getElementById('btnFillForm');
  const btnExport = document.getElementById('btnExport');
  const btnImport = document.getElementById('btnImport');
  const importFile = document.getElementById('importFile');
  const fillStatus = document.getElementById('fillStatus');
  const btnAddWork = document.getElementById('btnAddWork');
  const btnAddEducation = document.getElementById('btnAddEducation');
  const workEntries = document.getElementById('workEntries');
  const educationEntries = document.getElementById('educationEntries');

  // Modal elements
  const autofillModal = document.getElementById('autofillModal');
  const modalTitle = document.getElementById('modalTitle');
  const modalDescription = document.getElementById('modalDescription');
  const modalOptions = document.getElementById('modalOptions');
  const modalClose = document.getElementById('modalClose');
  const modalFillAll = document.getElementById('modalFillAll');
  const modalCancel = document.getElementById('modalCancel');

  // State
  let currentProfiles = [];
  let isEditing = false;
  let currentProfileWorkEntries = [];
  let currentProfileEducationEntries = [];
  let pendingFillData = null;
  let selectedFillOption = null;

  // Initialize
  await loadProfiles();
  
  // Check for draft and restore if editor will be open
  await checkAndRestoreDraft();

  // Event Listeners
  profileSelect.addEventListener('change', handleProfileSelect);
  btnNewProfile.addEventListener('click', handleNewProfile);
  btnEditProfile.addEventListener('click', handleEditSelectedProfile);
  btnSaveProfile.addEventListener('click', handleSaveProfile);
  btnCancelEdit.addEventListener('click', handleCancelEdit);
  btnDeleteProfile.addEventListener('click', handleDeleteSelectedProfile);
  btnBack.addEventListener('click', handleBack);
  btnFillForm.addEventListener('click', handleFillForm);
  btnExport.addEventListener('click', handleExport);
  btnImport.addEventListener('click', () => importFile.click());
  importFile.addEventListener('change', handleImport);
  btnAddWork.addEventListener('click', () => addWorkEntry());
  btnAddEducation.addEventListener('click', () => addEducationEntry());

  // Modal event listeners
  modalClose.addEventListener('click', closeModal);
  modalCancel.addEventListener('click', closeModal);
  modalFillAll.addEventListener('click', handleModalFillAll);
  autofillModal.addEventListener('click', (e) => {
    if (e.target === autofillModal) closeModal();
  });
  
  // Tab visibility change - auto-save draft when leaving, restore when returning
  document.addEventListener('visibilitychange', async () => {
    if (document.hidden) {
      // Save draft when tab becomes hidden
      await saveCurrentDraft();
    } else {
      // Restore draft when tab becomes visible
      await checkAndRestoreDraft();
    }
  });

  /**
   * Load and display all profiles
   */
  async function loadProfiles() {
    try {
      currentProfiles = await getProfiles();
      populateProfileSelect();
      updateFillButtonState();
      updateEditorButtons();
    } catch (error) {
      console.error('Error loading profiles:', error);
      showStatus('Error loading profiles', 'error');
    }
  }

  /**
   * Populate the profile dropdown
   */
  function populateProfileSelect() {
    const currentValue = profileSelect.value;
    profileSelect.innerHTML = '<option value="">Select a profile...</option>';
    
    currentProfiles.forEach(profile => {
      const option = document.createElement('option');
      option.value = profile.id;
      option.textContent = `${profile.name} (${profile.type})`;
      profileSelect.appendChild(option);
    });
    
    // Restore selection if it still exists
    if (currentValue && currentProfiles.find(p => p.id === currentValue)) {
      profileSelect.value = currentValue;
    }
  }

/**
    * Update the fill button state based on selection
    */
  function updateFillButtonState() {
    const hasProfile = profileSelect.value !== '';
    const isEditingNow = isEditing;
    // Enable fill button when a profile is selected OR when editor is open with draft data
    btnFillForm.disabled = !hasProfile && !isEditingNow;
  }

  /**
   * Update editor buttons visibility
   */
  function updateEditorButtons() {
    const hasSelection = profileSelect.value !== '';
    const isEditingNow = isEditing;
    
    btnEditProfile.classList.toggle('hidden', !hasSelection || isEditingNow);
    btnDeleteProfile.classList.toggle('hidden', !hasSelection || isEditingNow);
    btnBack.classList.toggle('hidden', !isEditingNow);
    btnNewProfile.classList.toggle('hidden', isEditingNow);
  }

  /**
   * Handle profile selection change
   */
  function handleProfileSelect() {
    const selectedId = profileSelect.value;
    updateFillButtonState();
    updateEditorButtons();
    
    if (selectedId) {
      showStatus('');
    }
  }

/**
    * Show the profile editor for new profile
    */
  function handleNewProfile() {
    isEditing = true;
    editorTitle.textContent = 'Create Profile';
    profileEditor.classList.remove('hidden');
    btnDeleteProfile.classList.add('hidden');
    btnEditProfile.classList.add('hidden');
    clearForm();
    // Clear any existing draft when starting fresh
    clearDraft();
    profileSelect.value = '';
    currentProfileWorkEntries = [];
    currentProfileEducationEntries = [];
    renderWorkEntries();
    renderEducationEntries();
    updateFillButtonState();
  }

  /**
   * Show the profile editor with existing profile data
   */
  function handleEditSelectedProfile() {
    const selectedId = profileSelect.value;
    if (!selectedId) return;
    
    const profile = currentProfiles.find(p => p.id === selectedId);
    if (profile) {
      handleEditProfile(profile);
    }
  }

/**
    * Show the profile editor with profile data
    */
  function handleEditProfile(profile) {
    isEditing = true;
    editorTitle.textContent = 'Edit Profile';
    profileEditor.classList.remove('hidden');
    populateForm(profile);
    updateFillButtonState();
  }

  /**
   * Clear the form fields
   */
  function clearForm() {
    document.getElementById('profileId').value = '';
    document.getElementById('profileName').value = '';
    document.getElementById('profileType').value = 'work';
    
    // Contact info
    document.getElementById('firstName').value = '';
    document.getElementById('lastName').value = '';
    document.getElementById('preferredName').value = '';
    document.getElementById('fullName').value = '';
    document.getElementById('email').value = '';
    document.getElementById('phone').value = '';
    document.getElementById('linkedIn').value = '';
    document.getElementById('website').value = '';
    
    // Address
    document.getElementById('street').value = '';
    document.getElementById('city').value = '';
    document.getElementById('state').value = '';
    document.getElementById('zipCode').value = '';
    document.getElementById('county').value = '';
    document.getElementById('country').value = '';
    
    // Skills
    document.getElementById('skills').value = '';
    document.getElementById('languages').value = '';
    document.getElementById('certifications').value = '';
    
    // Resume
    document.getElementById('summary').value = '';
    document.getElementById('workEligibility').value = '';
    document.getElementById('salaryExpectations').value = '';
  }

  /**
   * Populate form with profile data
   */
  function populateForm(profile) {
    document.getElementById('profileId').value = profile.id || '';
    document.getElementById('profileName').value = profile.name || '';
    document.getElementById('profileType').value = profile.type || 'work';
    
    // Contact info - support both old and new schema
    const contact = profile.contact || {};
    document.getElementById('firstName').value = contact.firstName || '';
    document.getElementById('lastName').value = contact.lastName || '';
    document.getElementById('preferredName').value = contact.preferredName || '';
    document.getElementById('fullName').value = contact.fullName || '';
    
    // Backward compatibility: split fullName into first/last
    if (contact.fullName && !contact.firstName && !contact.lastName) {
      const nameParts = contact.fullName.split(' ');
      document.getElementById('firstName').value = nameParts[0] || '';
      document.getElementById('lastName').value = nameParts.slice(1).join(' ') || '';
    }
    
    document.getElementById('email').value = contact.email || '';
    document.getElementById('phone').value = contact.phone || '';
    document.getElementById('linkedIn').value = contact.linkedIn || '';
    document.getElementById('website').value = contact.website || '';
    
    // Address - support both old and new schema
    const address = profile.address || {};
    document.getElementById('street').value = address.street || '';
    document.getElementById('city').value = address.city || '';
    document.getElementById('state').value = address.state || '';
    document.getElementById('zipCode').value = address.zipCode || '';
    document.getElementById('county').value = address.county || '';
    document.getElementById('country').value = address.country || '';
    
    // Work experience - support both old and new schema
    if (Array.isArray(profile.work)) {
      currentProfileWorkEntries = profile.work.map((w, i) => ({
        ...w,
        id: w.id || generateUUID(),
        order: w.order !== undefined ? w.order : i
      }));
    } else if (profile.work) {
      // Convert old single object to array
      currentProfileWorkEntries = [{
        id: generateUUID(),
        order: 0,
        jobTitle: profile.work.jobTitle || '',
        company: profile.work.company || '',
        startDate: profile.work.startDate || '',
        endDate: profile.work.endDate || '',
        responsibilities: profile.work.responsibilities || ''
      }];
    } else {
      currentProfileWorkEntries = [];
    }
    
    // Education - support both old and new schema
    if (Array.isArray(profile.education)) {
      currentProfileEducationEntries = profile.education.map((e, i) => ({
        ...e,
        id: e.id || generateUUID(),
        order: e.order !== undefined ? e.order : i
      }));
    } else if (profile.education) {
      // Convert old single object to array
      currentProfileEducationEntries = [{
        id: generateUUID(),
        order: 0,
        school: profile.education.school || '',
        degree: profile.education.degree || '',
        fieldOfStudy: profile.education.fieldOfStudy || '',
        graduationYear: profile.education.graduationYear || ''
      }];
    } else {
      currentProfileEducationEntries = [];
    }
    
    // Skills
    const skills = profile.skills || {};
    document.getElementById('skills').value = skills.skills || '';
    document.getElementById('languages').value = skills.languages || '';
    document.getElementById('certifications').value = skills.certifications || '';
    
    // Resume
    const resume = profile.resume || {};
    document.getElementById('summary').value = resume.summary || '';
    document.getElementById('workEligibility').value = resume.workEligibility || '';
    document.getElementById('salaryExpectations').value = resume.salaryExpectations || '';
    
    // Sort entries by order
    currentProfileWorkEntries.sort((a, b) => a.order - b.order);
    currentProfileEducationEntries.sort((a, b) => a.order - b.order);
    
    // Render entries
    renderWorkEntries();
    renderEducationEntries();
  }

  /**
   * Generate entry title for work entry
   */
  function getWorkEntryTitle(entry) {
    const parts = [];
    if (entry.jobTitle) parts.push(entry.jobTitle);
    if (entry.company) parts.push(`@ ${entry.company}`);
    if (entry.startDate) parts.push(`(${entry.startDate}`);
    if (entry.endDate) parts.push(`- ${entry.endDate})`);
    return parts.length > 0 ? parts.join(' ') : 'New Work Experience';
  }

  /**
   * Generate entry title for education entry
   */
  function getEducationEntryTitle(entry) {
    const parts = [];
    if (entry.school) parts.push(entry.school);
    if (entry.degree) parts.push(entry.degree);
    if (entry.graduationYear) parts.push(`(${entry.graduationYear})`);
    return parts.length > 0 ? parts.join(' ') : 'New Education';
  }

  /**
   * Render work entries
   */
  function renderWorkEntries() {
    workEntries.innerHTML = '';
    
    if (currentProfileWorkEntries.length === 0) {
      workEntries.innerHTML = '<div class="entry-empty">No work experience added yet. Click "Add Entry" to add.</div>';
      return;
    }
    
    currentProfileWorkEntries.forEach((entry, index) => {
      const card = createWorkEntryCard(entry, index);
      workEntries.appendChild(card);
    });
  }

  /**
   * Create work entry card element
   */
  function createWorkEntryCard(entry, index) {
    const card = document.createElement('div');
    card.className = 'entry-card';
    card.dataset.id = entry.id;
    
    const isExpanded = index === 0;
    
    card.innerHTML = `
      <div class="entry-header ${isExpanded ? 'expanded' : ''}" data-id="${entry.id}">
        <span class="entry-expand-icon">&#9658;</span>
        <span class="entry-title">${escapeHtml(getWorkEntryTitle(entry))}</span>
        <div class="entry-controls">
          <button type="button" class="entry-btn btn-clear" title="Clear">&#10060;</button>
          <button type="button" class="entry-btn btn-move btn-move-up" title="Move Up" ${index === 0 ? 'disabled' : ''}>▲</button>
          <button type="button" class="entry-btn btn-move btn-move-down" title="Move Down" ${index === currentProfileWorkEntries.length - 1 ? 'disabled' : ''}>▼</button>
          <button type="button" class="entry-btn btn-delete" title="Delete">&#128465;</button>
        </div>
      </div>
      <div class="entry-content ${isExpanded ? 'expanded' : ''}" data-id="${entry.id}">
        <div class="form-group">
          <input type="text" class="text-input work-jobTitle" placeholder="Job Title" value="${escapeHtml(entry.jobTitle || '')}">
        </div>
        <div class="form-group">
          <input type="text" class="text-input work-company" placeholder="Company Name" value="${escapeHtml(entry.company || '')}">
        </div>
        <div class="form-row">
          <input type="text" class="text-input work-startDate" placeholder="Start Date (e.g., Jan 2020)" value="${escapeHtml(entry.startDate || '')}">
          <input type="text" class="text-input work-endDate" placeholder="End Date (e.g., Present)" value="${escapeHtml(entry.endDate || '')}">
        </div>
        <div class="form-group">
          <textarea class="text-input textarea work-responsibilities" placeholder="Responsibilities / Description">${escapeHtml(entry.responsibilities || '')}</textarea>
        </div>
      </div>
    `;
    
    // Event listeners
    const header = card.querySelector('.entry-header');
    header.addEventListener('click', (e) => {
      if (!e.target.closest('.entry-controls')) {
        toggleEntry(card, entry.id);
      }
    });
    
    card.querySelector('.btn-clear').addEventListener('click', (e) => {
      e.stopPropagation();
      clearWorkEntry(entry.id);
    });
    card.querySelector('.btn-move-up').addEventListener('click', () => moveWorkEntry(entry.id, -1));
    card.querySelector('.btn-move-down').addEventListener('click', () => moveWorkEntry(entry.id, 1));
    card.querySelector('.btn-delete').addEventListener('click', () => deleteWorkEntry(entry.id));
    
    // Input change handlers
    card.querySelectorAll('input, textarea').forEach(input => {
      input.addEventListener('input', (e) => {
        const field = e.target.classList[1].replace('work-', '');
        const entryData = currentProfileWorkEntries.find(w => w.id === entry.id);
        if (entryData) {
          entryData[field] = e.target.value;
          updateWorkEntryTitle(entry.id);
        }
      });
    });
    
    return card;
  }

  /**
   * Update work entry title in header
   */
  function updateWorkEntryTitle(entryId) {
    const entry = currentProfileWorkEntries.find(e => e.id === entryId);
    if (!entry) return;
    
    const card = workEntries.querySelector(`[data-id="${entryId}"]`);
    if (card) {
      const titleEl = card.querySelector('.entry-title');
      titleEl.textContent = getWorkEntryTitle(entry);
    }
  }

  /**
   * Toggle entry expand/collapse
   */
  function toggleEntry(container, entryId) {
    const header = container.querySelector('.entry-header');
    const content = container.querySelector('.entry-content');
    
    header.classList.toggle('expanded');
    content.classList.toggle('expanded');
  }

  /**
   * Add new work entry
   */
  function addWorkEntry() {
    if (currentProfileWorkEntries.length >= MAX_WORK_ENTRIES) {
      alert(`Maximum of ${MAX_WORK_ENTRIES} work experience entries allowed.`);
      return;
    }
    
    const newEntry = {
      id: generateUUID(),
      order: currentProfileWorkEntries.length,
      jobTitle: '',
      company: '',
      startDate: '',
      endDate: '',
      responsibilities: ''
    };
    
    currentProfileWorkEntries.push(newEntry);
    renderWorkEntries();
    
    // Expand the new entry
    const newCard = workEntries.querySelector(`[data-id="${newEntry.id}"]`);
    if (newCard) {
      const header = newCard.querySelector('.entry-header');
      const content = newCard.querySelector('.entry-content');
      header.classList.add('expanded');
      content.classList.add('expanded');
      newCard.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }

  /**
   * Move work entry
   */
  function moveWorkEntry(entryId, direction) {
    const index = currentProfileWorkEntries.findIndex(e => e.id === entryId);
    if (index === -1) return;
    
    const newIndex = index + direction;
    if (newIndex < 0 || newIndex >= currentProfileWorkEntries.length) return;
    
    // Reorder
    const entry = currentProfileWorkEntries.splice(index, 1)[0];
    currentProfileWorkEntries.splice(newIndex, 0, entry);
    
    // Update order values
    currentProfileWorkEntries.forEach((e, i) => e.order = i);
    
    renderWorkEntries();
    
    // Re-expand the moved entry
    const card = workEntries.querySelector(`[data-id="${entryId}"]`);
    if (card) {
      const header = card.querySelector('.entry-header');
      const content = card.querySelector('.entry-content');
      header.classList.add('expanded');
      content.classList.add('expanded');
    }
  }

  /**
   * Delete work entry
   */
  function deleteWorkEntry(entryId) {
    if (!confirm('Are you sure you want to delete this work experience entry?')) return;
    
    currentProfileWorkEntries = currentProfileWorkEntries.filter(e => e.id !== entryId);
    
    // Update order values
    currentProfileWorkEntries.forEach((e, i) => e.order = i);
    
    renderWorkEntries();
  }

  /**
   * Render education entries
   */
  function renderEducationEntries() {
    educationEntries.innerHTML = '';
    
    if (currentProfileEducationEntries.length === 0) {
      educationEntries.innerHTML = '<div class="entry-empty">No education added yet. Click "Add Entry" to add.</div>';
      return;
    }
    
    currentProfileEducationEntries.forEach((entry, index) => {
      const card = createEducationEntryCard(entry, index);
      educationEntries.appendChild(card);
    });
  }

  /**
   * Create education entry card element
   */
  function createEducationEntryCard(entry, index) {
    const card = document.createElement('div');
    card.className = 'entry-card';
    card.dataset.id = entry.id;
    
    const isExpanded = index === 0;
    
    card.innerHTML = `
      <div class="entry-header ${isExpanded ? 'expanded' : ''}" data-id="${entry.id}">
        <span class="entry-expand-icon">&#9658;</span>
        <span class="entry-title">${escapeHtml(getEducationEntryTitle(entry))}</span>
        <div class="entry-controls">
          <button type="button" class="entry-btn btn-clear" title="Clear">&#10060;</button>
          <button type="button" class="entry-btn btn-move btn-move-up" title="Move Up" ${index === 0 ? 'disabled' : ''}>▲</button>
          <button type="button" class="entry-btn btn-move btn-move-down" title="Move Down" ${index === currentProfileEducationEntries.length - 1 ? 'disabled' : ''}>▼</button>
          <button type="button" class="entry-btn btn-delete" title="Delete">&#128465;</button>
        </div>
      </div>
      <div class="entry-content ${isExpanded ? 'expanded' : ''}" data-id="${entry.id}">
        <div class="form-group">
          <input type="text" class="text-input edu-school" placeholder="School / University" value="${escapeHtml(entry.school || '')}">
        </div>
        <div class="form-row">
          <input type="text" class="text-input edu-degree" placeholder="Degree" value="${escapeHtml(entry.degree || '')}">
          <input type="text" class="text-input edu-fieldOfStudy" placeholder="Field of Study" value="${escapeHtml(entry.fieldOfStudy || '')}">
        </div>
        <div class="form-group">
          <input type="text" class="text-input edu-graduationYear" placeholder="Graduation Year" value="${escapeHtml(entry.graduationYear || '')}">
        </div>
      </div>
    `;
    
    // Event listeners
    const header = card.querySelector('.entry-header');
    header.addEventListener('click', (e) => {
      if (!e.target.closest('.entry-controls')) {
        toggleEntry(card, entry.id);
      }
    });
    
    card.querySelector('.btn-clear').addEventListener('click', (e) => {
      e.stopPropagation();
      clearEducationEntry(entry.id);
    });
    card.querySelector('.btn-move-up').addEventListener('click', () => moveEducationEntry(entry.id, -1));
    card.querySelector('.btn-move-down').addEventListener('click', () => moveEducationEntry(entry.id, 1));
    card.querySelector('.btn-delete').addEventListener('click', () => deleteEducationEntry(entry.id));
    
    // Input change handlers
    card.querySelectorAll('input, textarea').forEach(input => {
      input.addEventListener('input', (e) => {
        const field = e.target.classList[1].replace('edu-', '');
        const entryData = currentProfileEducationEntries.find(edu => edu.id === entryId);
        if (entryData) {
          entryData[field] = e.target.value;
          updateEducationEntryTitle(entry.id);
        }
      });
    });
    
    return card;
  }

  /**
   * Update education entry title in header
   */
  function updateEducationEntryTitle(entryId) {
    const entry = currentProfileEducationEntries.find(e => e.id === entryId);
    if (!entry) return;
    
    const card = educationEntries.querySelector(`[data-id="${entryId}"]`);
    if (card) {
      const titleEl = card.querySelector('.entry-title');
      titleEl.textContent = getEducationEntryTitle(entry);
    }
  }

  /**
   * Add new education entry
   */
  function addEducationEntry() {
    if (currentProfileEducationEntries.length >= MAX_EDUCATION_ENTRIES) {
      alert(`Maximum of ${MAX_EDUCATION_ENTRIES} education entries allowed.`);
      return;
    }
    
    const newEntry = {
      id: generateUUID(),
      order: currentProfileEducationEntries.length,
      school: '',
      degree: '',
      fieldOfStudy: '',
      graduationYear: ''
    };
    
    currentProfileEducationEntries.push(newEntry);
    renderEducationEntries();
    
    // Expand the new entry
    const newCard = educationEntries.querySelector(`[data-id="${newEntry.id}"]`);
    if (newCard) {
      const header = newCard.querySelector('.entry-header');
      const content = newCard.querySelector('.entry-content');
      header.classList.add('expanded');
      content.classList.add('expanded');
      newCard.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }

  /**
   * Move education entry
   */
  function moveEducationEntry(entryId, direction) {
    const index = currentProfileEducationEntries.findIndex(e => e.id === entryId);
    if (index === -1) return;
    
    const newIndex = index + direction;
    if (newIndex < 0 || newIndex >= currentProfileEducationEntries.length) return;
    
    // Reorder
    const entry = currentProfileEducationEntries.splice(index, 1)[0];
    currentProfileEducationEntries.splice(newIndex, 0, entry);
    
    // Update order values
    currentProfileEducationEntries.forEach((e, i) => e.order = i);
    
    renderEducationEntries();
    
    // Re-expand the moved entry
    const card = educationEntries.querySelector(`[data-id="${entryId}"]`);
    if (card) {
      const header = card.querySelector('.entry-header');
      const content = card.querySelector('.entry-content');
      header.classList.add('expanded');
      content.classList.add('expanded');
    }
  }

/**
 * Delete education entry
 */
  function deleteEducationEntry(entryId) {
    if (!confirm('Are you sure you want to delete this education entry?')) return;
    
    currentProfileEducationEntries = currentProfileEducationEntries.filter(e => e.id !== entryId);
    
    // Update order values
    currentProfileEducationEntries.forEach((e, i) => e.order = i);
    
    renderEducationEntries();
  }
  
  /**
   * Clear work entry fields without confirmation
   */
  function clearWorkEntry(entryId) {
    const entryData = currentProfileWorkEntries.find(e => e.id === entryId);
    if (!entryData) return;
    
    entryData.jobTitle = '';
    entryData.company = '';
    entryData.startDate = '';
    entryData.endDate = '';
    entryData.responsibilities = '';
    
    renderWorkEntries();
  }
  
  /**
   * Clear education entry fields without confirmation
   */
  function clearEducationEntry(entryId) {
    const entryData = currentProfileEducationEntries.find(e => e.id === entryId);
    if (!entryData) return;
    
    entryData.school = '';
    entryData.degree = '';
    entryData.fieldOfStudy = '';
    entryData.graduationYear = '';
    
    renderEducationEntries();
  }
  
  /**
   * Save current form data as draft
   */
  async function saveCurrentDraft() {
    if (!isEditing) return;
    
    const draftData = getFormData();
    // Keep only the current state, don't generate new ID
    delete draftData.id;
    await saveDraft(draftData);
  }
  
  /**
   * Check for draft and restore if exists
   */
  async function checkAndRestoreDraft() {
    const draft = await getDraft();
    if (draft && !isEditing) {
      // Only restore if no profiles exist or user has unsaved work
      // This is a basic implementation - you might want to add user confirmation
      isEditing = true;
      editorTitle.textContent = 'Draft Restored';
      profileEditor.classList.remove('hidden');
      
      // Populate form with draft data
      populateForm(draft);
      
      updateFillButtonState();
    }
  }

  /**
   * Escape HTML to prevent XSS
   */
  function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  /**
   * Get form data as profile object
   */
  function getFormData() {
    return {
      id: document.getElementById('profileId').value || undefined,
      name: document.getElementById('profileName').value.trim(),
      type: document.getElementById('profileType').value,
      contact: {
        firstName: document.getElementById('firstName').value.trim(),
        lastName: document.getElementById('lastName').value.trim(),
        preferredName: document.getElementById('preferredName').value.trim(),
        fullName: document.getElementById('fullName').value.trim(),
        email: document.getElementById('email').value.trim(),
        phone: document.getElementById('phone').value.trim(),
        linkedIn: document.getElementById('linkedIn').value.trim(),
        website: document.getElementById('website').value.trim()
      },
      address: {
        street: document.getElementById('street').value.trim(),
        city: document.getElementById('city').value.trim(),
        state: document.getElementById('state').value.trim(),
        zipCode: document.getElementById('zipCode').value.trim(),
        county: document.getElementById('county').value.trim(),
        country: document.getElementById('country').value.trim()
      },
      work: currentProfileWorkEntries.map((entry, index) => ({
        id: entry.id,
        order: index,
        jobTitle: entry.jobTitle || '',
        company: entry.company || '',
        startDate: entry.startDate || '',
        endDate: entry.endDate || '',
        responsibilities: entry.responsibilities || ''
      })),
      education: currentProfileEducationEntries.map((entry, index) => ({
        id: entry.id,
        order: index,
        school: entry.school || '',
        degree: entry.degree || '',
        fieldOfStudy: entry.fieldOfStudy || '',
        graduationYear: entry.graduationYear || ''
      })),
      skills: {
        skills: document.getElementById('skills').value.trim(),
        languages: document.getElementById('languages').value.trim(),
        certifications: document.getElementById('certifications').value.trim()
      },
      resume: {
        summary: document.getElementById('summary').value.trim(),
        workEligibility: document.getElementById('workEligibility').value.trim(),
        salaryExpectations: document.getElementById('salaryExpectations').value.trim()
      }
    };
  }

/**
    * Handle save profile button click
    */
  async function handleSaveProfile() {
    const nameInput = document.getElementById('profileName');
    const profileName = nameInput.value.trim();
    
    if (!profileName) {
      nameInput.focus();
      showStatus('Please enter a profile name', 'error');
      return;
    }

    const profileId = document.getElementById('profileId').value;
    const isDuplicate = currentProfiles.some(p => 
      p.name.trim().toLowerCase() === profileName.trim().toLowerCase() &&
      p.id !== profileId
    );

    if (isDuplicate) {
      nameInput.focus();
      showStatus('A profile with this name already exists', 'error');
      return;
    }

    try {
      const profile = getFormData();
      await saveProfile(profile);
      // Clear draft after saving
      await clearDraft();
      await loadProfiles();
      profileSelect.value = profile.id;
      hideEditor();
      showStatus('Profile saved successfully!', 'success');
    } catch (error) {
      console.error('Error saving profile:', error);
      showStatus('Error saving profile', 'error');
    }
  }

  /**
   * Handle cancel edit button click
   */
  function handleCancelEdit() {
    hideEditor();
    showStatus('');
  }

  /**
   * Handle back button click
   */
  function handleBack() {
    hideEditor();
    showStatus('');
  }

/**
    * Hide the editor
    */
  function hideEditor() {
    isEditing = false;
    profileEditor.classList.add('hidden');
    clearForm();
    // Clear draft when closing editor
    clearDraft();
    updateFillButtonState();
    updateEditorButtons();
  }

  /**
   * Handle delete profile button click for selected profile
   */
  async function handleDeleteSelectedProfile() {
    const profileId = profileSelect.value;
    
    if (!profileId) return;
    
    if (confirm('Are you sure you want to delete this profile?')) {
      try {
        await deleteProfile(profileId);
        await loadProfiles();
        showStatus('Profile deleted', 'success');
      } catch (error) {
        console.error('Error deleting profile:', error);
        showStatus('Error deleting profile', 'error');
      }
    }
  }

/**
    * Handle fill form button click
    */
  async function handleFillForm() {
    const profileId = profileSelect.value;
    
    // Check if we have unsaved draft data
    const hasUnsavedData = isEditing && !profileId;
    
    if (!profileId && !hasUnsavedData) {
      showStatus('Please select a profile or open editor with data first', 'error');
      return;
    }

    btnFillForm.disabled = true;
    showStatus('Filling form...', '');

    try {
      let profile;
      
      if (hasUnsavedData) {
        // Use current form data as draft
        profile = getFormData();
      } else {
        profile = await getProfileById(profileId);
      }
      
      if (!profile) {
        showStatus('Profile not found', 'error');
        return;
      }
      
      // Check if we need to show selection modal
      const hasMultipleWork = Array.isArray(profile.work) && profile.work.length > 1;
      const hasMultipleEducation = Array.isArray(profile.education) && profile.education.length > 1;
      
      if (hasMultipleWork || hasMultipleEducation) {
        // Show modal for selection
        showAutofillModal(profile, hasMultipleWork, hasMultipleEducation);
      } else {
        // Single entry - fill directly
        let result;
        if (hasUnsavedData) {
          result = await triggerFillFormWithData(profile);
        } else {
          result = await triggerFillForm(profileId);
        }
        handleFillResult(result);
      }
    } catch (error) {
      console.error('Error filling form:', error);
      showStatus('Error filling form', 'error');
    } finally {
      if (!autofillModal.classList.contains('hidden')) {
        // Keep disabled while modal is open
      } else {
        btnFillForm.disabled = false;
      }
    }
  }

  /**
   * Show autofill selection modal
   */
  function showAutofillModal(profile, hasMultipleWork, hasMultipleEducation) {
    pendingFillData = { profile };
    selectedFillOption = null;
    
    modalOptions.innerHTML = '';
    
    if (hasMultipleWork) {
      const workSection = document.createElement('div');
      workSection.innerHTML = `<div class="modal-section-label">Work Experience</div>`;
      modalOptions.appendChild(workSection);
      
      profile.work.forEach((entry, index) => {
        const option = createModalOption(
          `work_${index}`,
          getWorkEntryTitle(entry),
          'radio'
        );
        modalOptions.appendChild(option);
      });
    }
    
    if (hasMultipleEducation) {
      const eduSection = document.createElement('div');
      eduSection.innerHTML = `<div class="modal-section-label" style="margin-top: 12px;">Education</div>`;
      modalOptions.appendChild(eduSection);
      
      profile.education.forEach((entry, index) => {
        const option = createModalOption(
          `education_${index}`,
          getEducationEntryTitle(entry),
          'radio'
        );
        modalOptions.appendChild(option);
      });
    }
    
    modalDescription.textContent = 'Select which entry to fill, or choose "Fill All" to fill all entries.';
    
    // Update modal title based on selections
    if (hasMultipleWork && hasMultipleEducation) {
      modalTitle.textContent = 'Select Entry to Fill';
    } else if (hasMultipleWork) {
      modalTitle.textContent = 'Select Work Experience';
    } else {
      modalTitle.textContent = 'Select Education';
    }
    
    autofillModal.classList.remove('hidden');
    
    // Add section label styles
    const style = document.createElement('style');
    style.textContent = `
      .modal-section-label {
        font-size: 11px;
        font-weight: 600;
        color: var(--text-secondary);
        text-transform: uppercase;
        letter-spacing: 0.5px;
        margin-bottom: 8px;
      }
    `;
    if (!document.querySelector('style[data-modal-styles]')) {
      style.setAttribute('data-modal-styles', 'true');
      document.head.appendChild(style);
    }
  }

  /**
   * Create modal option element
   */
  function createModalOption(id, label, type) {
    const option = document.createElement('label');
    option.className = 'modal-option';
    option.innerHTML = `
      <input type="${type}" name="fillOption" value="${id}">
      <span class="modal-option-label">${escapeHtml(label)}</span>
    `;
    
    option.addEventListener('click', () => {
      modalOptions.querySelectorAll('.modal-option').forEach(opt => opt.classList.remove('selected'));
      option.classList.add('selected');
      option.querySelector('input').checked = true;
      selectedFillOption = id;
    });
    
    return option;
  }

  /**
   * Close modal
   */
  function closeModal() {
    autofillModal.classList.add('hidden');
    btnFillForm.disabled = false;
    pendingFillData = null;
    selectedFillOption = null;
  }

  /**
   * Handle modal fill all button
   */
  async function handleModalFillAll() {
    if (!pendingFillData) return;
    
    const profile = pendingFillData.profile;
    const hasUnsavedData = isEditing && !profile.id;
    
    closeModal();
    showStatus('Filling form...', '');
    
    try {
      let result;
      if (hasUnsavedData) {
        result = await triggerFillFormWithData(profile);
      } else {
        result = await triggerFillForm(profile.id);
      }
      handleFillResult(result);
    } catch (error) {
      console.error('Error filling form:', error);
      showStatus('Error filling form', 'error');
    }
  }

  /**
   * Handle fill result
   */
  function handleFillResult(result) {
    if (result.success) {
      showStatus(`Filled ${result.fieldsFilled} field(s) successfully!`, 'success');
    } else {
      showStatus(result.message || 'Could not fill form', 'error');
    }
    btnFillForm.disabled = false;
  }

  /**
   * Handle export button click
   */
  async function handleExport() {
    try {
      const data = await exportData();
      const timestamp = new Date().toISOString().slice(0, 10);
      downloadFile(data, `formpal-profiles-${timestamp}.json`);
      showStatus('Profiles exported!', 'success');
    } catch (error) {
      console.error('Error exporting:', error);
      showStatus('Error exporting profiles', 'error');
    }
  }

  /**
   * Handle import file selection
   */
  async function handleImport(event) {
    const file = event.target.files[0];
    if (!file) return;

    try {
      const content = await readFileAsText(file);
      const result = await importData(content, true);
      
      await loadProfiles();
      
      if (result.errors.length > 0) {
        showStatus(`Imported ${result.imported} profile(s). ${result.errors.length} error(s).`, 'error');
      } else {
        showStatus(`Imported ${result.imported} profile(s) successfully!`, 'success');
      }
    } catch (error) {
      console.error('Error importing:', error);
      showStatus(error.message || 'Error importing profiles', 'error');
    } finally {
      importFile.value = '';
    }
  }

  /**
   * Show status message
   */
  function showStatus(message, type = '') {
    fillStatus.textContent = message;
    fillStatus.className = 'status-message ' + type;
  }

  // Add double-click to edit functionality on profile select
  profileSelect.addEventListener('dblclick', () => {
    const selectedId = profileSelect.value;
    if (selectedId) {
      const profile = currentProfiles.find(p => p.id === selectedId);
      if (profile) {
        handleEditProfile(profile);
      }
    }
  });
});
