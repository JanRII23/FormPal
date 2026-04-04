// FormPal - Popup Script

document.addEventListener('DOMContentLoaded', async () => {
  // DOM Elements
  const profileSelect = document.getElementById('profileSelect');
  const profileEditor = document.getElementById('profileEditor');
  const editorTitle = document.getElementById('editorTitle');
  const profileForm = document.getElementById('profileForm');
  const btnNewProfile = document.getElementById('btnNewProfile');
  const btnSaveProfile = document.getElementById('btnSaveProfile');
  const btnCancelEdit = document.getElementById('btnCancelEdit');
  const btnDeleteProfile = document.getElementById('btnDeleteProfile');
  const btnFillForm = document.getElementById('btnFillForm');
  const btnExport = document.getElementById('btnExport');
  const btnImport = document.getElementById('btnImport');
  const importFile = document.getElementById('importFile');
  const fillStatus = document.getElementById('fillStatus');

  // State
  let currentProfiles = [];
  let isEditing = false;

  // Initialize
  await loadProfiles();

  // Event Listeners
  profileSelect.addEventListener('change', handleProfileSelect);
  btnNewProfile.addEventListener('click', handleNewProfile);
  btnSaveProfile.addEventListener('click', handleSaveProfile);
  btnCancelEdit.addEventListener('click', handleCancelEdit);
  btnDeleteProfile.addEventListener('click', handleDeleteProfile);
  btnFillForm.addEventListener('click', handleFillForm);
  btnExport.addEventListener('click', handleExport);
  btnImport.addEventListener('click', () => importFile.click());
  importFile.addEventListener('change', handleImport);

  /**
   * Load and display all profiles
   */
  async function loadProfiles() {
    try {
      currentProfiles = await getProfiles();
      populateProfileSelect();
      updateFillButtonState();
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
    btnFillForm.disabled = !hasProfile;
  }

  /**
   * Handle profile selection change
   */
  function handleProfileSelect() {
    const selectedId = profileSelect.value;
    updateFillButtonState();
    
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
    clearForm();
    profileSelect.value = '';
  }

  /**
   * Show the profile editor with existing profile data
   */
  function handleEditProfile(profile) {
    isEditing = true;
    editorTitle.textContent = 'Edit Profile';
    profileEditor.classList.remove('hidden');
    btnDeleteProfile.classList.remove('hidden');
    populateForm(profile);
  }

  /**
   * Clear the form fields
   */
  function clearForm() {
    document.getElementById('profileId').value = '';
    document.getElementById('profileName').value = '';
    document.getElementById('profileType').value = 'work';
    document.getElementById('fullName').value = '';
    document.getElementById('email').value = '';
    document.getElementById('phone').value = '';
    document.getElementById('street').value = '';
    document.getElementById('city').value = '';
    document.getElementById('state').value = '';
    document.getElementById('zipCode').value = '';
    document.getElementById('jobTitle').value = '';
    document.getElementById('company').value = '';
    document.getElementById('startDate').value = '';
    document.getElementById('endDate').value = '';
    document.getElementById('responsibilities').value = '';
    document.getElementById('school').value = '';
    document.getElementById('degree').value = '';
    document.getElementById('fieldOfStudy').value = '';
    document.getElementById('graduationYear').value = '';
    document.getElementById('skills').value = '';
    document.getElementById('languages').value = '';
    document.getElementById('certifications').value = '';
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
    document.getElementById('fullName').value = profile.contact?.fullName || '';
    document.getElementById('email').value = profile.contact?.email || '';
    document.getElementById('phone').value = profile.contact?.phone || '';
    document.getElementById('street').value = profile.address?.street || '';
    document.getElementById('city').value = profile.address?.city || '';
    document.getElementById('state').value = profile.address?.state || '';
    document.getElementById('zipCode').value = profile.address?.zipCode || '';
    document.getElementById('jobTitle').value = profile.work?.jobTitle || '';
    document.getElementById('company').value = profile.work?.company || '';
    document.getElementById('startDate').value = profile.work?.startDate || '';
    document.getElementById('endDate').value = profile.work?.endDate || '';
    document.getElementById('responsibilities').value = profile.work?.responsibilities || '';
    document.getElementById('school').value = profile.education?.school || '';
    document.getElementById('degree').value = profile.education?.degree || '';
    document.getElementById('fieldOfStudy').value = profile.education?.fieldOfStudy || '';
    document.getElementById('graduationYear').value = profile.education?.graduationYear || '';
    document.getElementById('skills').value = profile.skills?.skills || '';
    document.getElementById('languages').value = profile.skills?.languages || '';
    document.getElementById('certifications').value = profile.skills?.certifications || '';
    document.getElementById('summary').value = profile.resume?.summary || '';
    document.getElementById('workEligibility').value = profile.resume?.workEligibility || '';
    document.getElementById('salaryExpectations').value = profile.resume?.salaryExpectations || '';
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
        fullName: document.getElementById('fullName').value.trim(),
        email: document.getElementById('email').value.trim(),
        phone: document.getElementById('phone').value.trim()
      },
      address: {
        street: document.getElementById('street').value.trim(),
        city: document.getElementById('city').value.trim(),
        state: document.getElementById('state').value.trim(),
        zipCode: document.getElementById('zipCode').value.trim()
      },
      work: {
        jobTitle: document.getElementById('jobTitle').value.trim(),
        company: document.getElementById('company').value.trim(),
        startDate: document.getElementById('startDate').value.trim(),
        endDate: document.getElementById('endDate').value.trim(),
        responsibilities: document.getElementById('responsibilities').value.trim()
      },
      education: {
        school: document.getElementById('school').value.trim(),
        degree: document.getElementById('degree').value.trim(),
        fieldOfStudy: document.getElementById('fieldOfStudy').value.trim(),
        graduationYear: document.getElementById('graduationYear').value.trim()
      },
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

    try {
      const profile = getFormData();
      await saveProfile(profile);
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
   * Hide the editor
   */
  function hideEditor() {
    isEditing = false;
    profileEditor.classList.add('hidden');
    clearForm();
  }

  /**
   * Handle delete profile button click
   */
  async function handleDeleteProfile() {
    const profileId = document.getElementById('profileId').value;
    
    if (!profileId) return;
    
    if (confirm('Are you sure you want to delete this profile?')) {
      try {
        await deleteProfile(profileId);
        await loadProfiles();
        hideEditor();
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
    
    if (!profileId) {
      showStatus('Please select a profile first', 'error');
      return;
    }

    btnFillForm.disabled = true;
    showStatus('Filling form...', '');

    try {
      const result = await triggerFillForm(profileId);
      
      if (result.success) {
        showStatus(`Filled ${result.fieldsFilled} field(s) successfully!`, 'success');
      } else {
        showStatus(result.message || 'Could not fill form', 'error');
      }
    } catch (error) {
      console.error('Error filling form:', error);
      showStatus('Error filling form', 'error');
    } finally {
      btnFillForm.disabled = false;
    }
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

  // Add context menu for edit on right-click
  profileSelect.addEventListener('contextmenu', (e) => {
    const selectedId = profileSelect.value;
    if (selectedId) {
      e.preventDefault();
      const profile = currentProfiles.find(p => p.id === selectedId);
      if (profile) {
        handleEditProfile(profile);
      }
    }
  });
});
