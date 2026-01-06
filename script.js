// ===================================
// Form Elements
// ===================================
const form = document.getElementById('staffForm');
const submitBtn = document.getElementById('submitBtn');
const btnText = submitBtn.querySelector('.btn-text');
const btnLoader = submitBtn.querySelector('.btn-loader');

// Form Inputs
const fullNameInput = document.getElementById('fullName');
const resumptionDateInput = document.getElementById('resumptionDate');
const exitDateInput = document.getElementById('exitDate');
const stillWorkingCheckbox = document.getElementById('stillWorking');
const locationSelect = document.getElementById('location');
const designationInput = document.getElementById('designation');
const staffPictureInput = document.getElementById('staffPicture');
const hiringOfficerInput = document.getElementById('hiringOfficer');

// Image Preview Elements
const imagePreview = document.getElementById('imagePreview');
const previewImg = document.getElementById('previewImg');
const removeImageBtn = document.getElementById('removeImage');

// Message Elements
const messageContainer = document.getElementById('messageContainer');
const messageIcon = document.getElementById('messageIcon');
const messageTitle = document.getElementById('messageTitle');
const messageText = document.getElementById('messageText');
const closeMessageBtn = document.getElementById('closeMessage');

// ===================================
// Still Working Checkbox Handler
// ===================================
stillWorkingCheckbox.addEventListener('change', function() {
    if (this.checked) {
        exitDateInput.value = '';
        exitDateInput.disabled = true;
        exitDateInput.style.opacity = '0.5';
        exitDateInput.style.cursor = 'not-allowed';
    } else {
        exitDateInput.disabled = false;
        exitDateInput.style.opacity = '1';
        exitDateInput.style.cursor = 'text';
    }
});

// ===================================
// Image Preview Handler
// ===================================
staffPictureInput.addEventListener('change', function(e) {
    const file = e.target.files[0];
    
    if (file) {
        // Validate file type
        const validTypes = ['image/jpeg', 'image/jpg', 'image/png'];
        if (!validTypes.includes(file.type)) {
            showError('staffPictureError', 'Please upload a JPG or PNG image');
            staffPictureInput.value = '';
            return;
        }
        
        // Validate file size (5MB max)
        const maxSize = 5 * 1024 * 1024; // 5MB in bytes
        if (file.size > maxSize) {
            showError('staffPictureError', 'Image size must be less than 5MB');
            staffPictureInput.value = '';
            return;
        }
        
        // Clear any previous error
        clearError('staffPictureError');
        
        // Show preview
        const reader = new FileReader();
        reader.onload = function(e) {
            previewImg.src = e.target.result;
            imagePreview.classList.remove('hidden');
        };
        reader.readAsDataURL(file);
    }
});

// Remove Image Handler
removeImageBtn.addEventListener('click', function() {
    staffPictureInput.value = '';
    imagePreview.classList.add('hidden');
    previewImg.src = '';
});

// ===================================
// Form Validation
// ===================================
function validateForm() {
    let isValid = true;
    
    // Clear all previous errors
    clearAllErrors();
    
    // Validate Full Name
    if (!fullNameInput.value.trim()) {
        showError('fullNameError', 'Full name is required');
        fullNameInput.classList.add('error');
        isValid = false;
    }
    
    // Validate Resumption Date
    if (!resumptionDateInput.value) {
        showError('resumptionDateError', 'Resumption date is required');
        resumptionDateInput.classList.add('error');
        isValid = false;
    }
    
    // Validate Exit Date (only if not still working)
    if (!stillWorkingCheckbox.checked && exitDateInput.value) {
        const resumptionDate = new Date(resumptionDateInput.value);
        const exitDate = new Date(exitDateInput.value);
        
        if (exitDate < resumptionDate) {
            showError('exitDateError', 'Exit date cannot be before resumption date');
            exitDateInput.classList.add('error');
            isValid = false;
        }
    }
    
    // Validate Location
    if (!locationSelect.value) {
        showError('locationError', 'Please select a location');
        locationSelect.classList.add('error');
        isValid = false;
    }
    
    // Validate Designation
    if (!designationInput.value.trim()) {
        showError('designationError', 'Designation is required');
        designationInput.classList.add('error');
        isValid = false;
    }
    
    // Validate Staff Picture
    if (!staffPictureInput.files || !staffPictureInput.files[0]) {
        showError('staffPictureError', 'Please upload a staff picture');
        isValid = false;
    }
    
    // Validate Hiring Officer
    if (!hiringOfficerInput.value.trim()) {
        showError('hiringOfficerError', 'Hiring officer name is required');
        hiringOfficerInput.classList.add('error');
        isValid = false;
    }
    
    return isValid;
}

function showError(elementId, message) {
    const errorElement = document.getElementById(elementId);
    if (errorElement) {
        errorElement.textContent = message;
    }
}

function clearError(elementId) {
    const errorElement = document.getElementById(elementId);
    if (errorElement) {
        errorElement.textContent = '';
    }
}

function clearAllErrors() {
    const errorElements = document.querySelectorAll('.error-message');
    errorElements.forEach(element => {
        element.textContent = '';
    });
    
    const inputElements = document.querySelectorAll('.form-input, .form-select');
    inputElements.forEach(element => {
        element.classList.remove('error');
    });
}

// ===================================
// Form Submission
// ===================================
form.addEventListener('submit', async function(e) {
    e.preventDefault();
    
    // Validate form
    if (!validateForm()) {
        return;
    }
    
    // Show loading state
    setLoadingState(true);
    hideMessage();
    
    try {
        // Create FormData object
        const formData = new FormData();
        formData.append('fullName', fullNameInput.value.trim());
        formData.append('resumptionDate', resumptionDateInput.value);
        formData.append('exitDate', stillWorkingCheckbox.checked ? 'Still Working' : exitDateInput.value);
        formData.append('location', locationSelect.value);
        formData.append('designation', designationInput.value.trim());
        formData.append('staffPicture', staffPictureInput.files[0]);
        formData.append('hiringOfficer', hiringOfficerInput.value.trim());
        
        // Send to backend
        const response = await fetch('http://localhost:3000/api/submit-staff', {
            method: 'POST',
            body: formData
        });
        
        const result = await response.json();
        
        if (response.ok) {
            // Success
            showMessage('success', 'Success!', result.message || 'Staff data submitted successfully. Email sent with updated records.');
            resetForm();
        } else {
            // Error from server
            showMessage('error', 'Error', result.error || 'Failed to submit staff data. Please try again.');
        }
    } catch (error) {
        console.error('Submission error:', error);
        showMessage('error', 'Connection Error', 'Unable to connect to the server. Please check if the server is running and try again.');
    } finally {
        setLoadingState(false);
    }
});

// ===================================
// UI Helper Functions
// ===================================
function setLoadingState(isLoading) {
    if (isLoading) {
        submitBtn.disabled = true;
        btnText.classList.add('hidden');
        btnLoader.classList.remove('hidden');
    } else {
        submitBtn.disabled = false;
        btnText.classList.remove('hidden');
        btnLoader.classList.add('hidden');
    }
}

function showMessage(type, title, text) {
    messageContainer.className = 'message-container ' + type;
    messageTitle.textContent = title;
    messageText.textContent = text;
    
    // Update icon based on type
    if (type === 'success') {
        messageIcon.innerHTML = '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />';
    } else {
        messageIcon.innerHTML = '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />';
    }
    
    messageContainer.classList.remove('hidden');
    
    // Scroll to message
    messageContainer.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

function hideMessage() {
    messageContainer.classList.add('hidden');
}

function resetForm() {
    form.reset();
    imagePreview.classList.add('hidden');
    previewImg.src = '';
    exitDateInput.disabled = false;
    exitDateInput.style.opacity = '1';
    exitDateInput.style.cursor = 'text';
    clearAllErrors();
}

// Close message button handler
closeMessageBtn.addEventListener('click', hideMessage);

// ===================================
// Real-time Input Validation
// ===================================
fullNameInput.addEventListener('input', function() {
    if (this.value.trim()) {
        clearError('fullNameError');
        this.classList.remove('error');
    }
});

resumptionDateInput.addEventListener('change', function() {
    if (this.value) {
        clearError('resumptionDateError');
        this.classList.remove('error');
    }
});

exitDateInput.addEventListener('change', function() {
    if (this.value) {
        clearError('exitDateError');
        this.classList.remove('error');
    }
});

locationSelect.addEventListener('change', function() {
    if (this.value) {
        clearError('locationError');
        this.classList.remove('error');
    }
});

designationInput.addEventListener('input', function() {
    if (this.value.trim()) {
        clearError('designationError');
        this.classList.remove('error');
    }
});

hiringOfficerInput.addEventListener('input', function() {
    if (this.value.trim()) {
        clearError('hiringOfficerError');
        this.classList.remove('error');
    }
});

// ===================================
// Drag and Drop for File Upload
// ===================================
const fileLabel = document.querySelector('.file-label');

['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
    fileLabel.addEventListener(eventName, preventDefaults, false);
});

function preventDefaults(e) {
    e.preventDefault();
    e.stopPropagation();
}

['dragenter', 'dragover'].forEach(eventName => {
    fileLabel.addEventListener(eventName, highlight, false);
});

['dragleave', 'drop'].forEach(eventName => {
    fileLabel.addEventListener(eventName, unhighlight, false);
});

function highlight(e) {
    fileLabel.style.borderColor = 'var(--primary-color)';
    fileLabel.style.backgroundColor = 'rgba(102, 126, 234, 0.05)';
}

function unhighlight(e) {
    fileLabel.style.borderColor = '';
    fileLabel.style.backgroundColor = '';
}

fileLabel.addEventListener('drop', handleDrop, false);

function handleDrop(e) {
    const dt = e.dataTransfer;
    const files = dt.files;
    
    if (files.length > 0) {
        staffPictureInput.files = files;
        // Trigger change event
        const event = new Event('change', { bubbles: true });
        staffPictureInput.dispatchEvent(event);
    }
}

// ===================================
// Initialize
// ===================================
console.log('Staff Data Capture System initialized');
console.log('Make sure the backend server is running on http://localhost:3000');
