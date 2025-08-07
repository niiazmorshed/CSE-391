// FINAL SOLUTION - Absolutely foolproof
console.log('🎯 FINAL SOLUTION Loading...');

const API_BASE_URL = 'http://localhost:8000';

document.addEventListener('DOMContentLoaded', function() {
    console.log('✅ DOM Ready');
    init();
});

async function init() {
    // Set minimum date
    const dateInput = document.getElementById('appointmentDate');
    if (dateInput) {
        const today = new Date().toISOString().split('T')[0];
        dateInput.setAttribute('min', today);
    }
    
    // Load mechanics and setup form
    await loadAndSetupMechanics();
    setupForm();
    showUI();
}

async function loadAndSetupMechanics() {
    console.log('📡 Loading mechanics...');
    
    try {
        const response = await fetch(`${API_BASE_URL}/get_mechanics.php`);
        const data = await response.json();
        
        console.log('📊 Raw API response:', data);
        
        if (data.success && data.mechanics) {
            console.log('✅ Mechanics loaded:', data.mechanics.length);
            
            // Populate select dropdown
            populateSelectDropdown(data.mechanics);
        } else {
            console.error('❌ Failed to load mechanics:', data.message);
        }
    } catch (error) {
        console.error('❌ Error loading mechanics:', error);
    }
}

function populateSelectDropdown(mechanics) {
    const select = document.getElementById('selectedMechanic');
    if (!select) {
        console.error('❌ Select element not found');
        return;
    }
    
    // Clear existing options
    select.innerHTML = '<option value="">Choose a mechanic</option>';
    
    // Add options
    mechanics.forEach((mechanic, index) => {
        console.log(`Adding option ${index + 1}:`, {
            id: mechanic._id,
            name: mechanic.name,
            idType: typeof mechanic._id
        });
        
        const option = document.createElement('option');
        option.value = mechanic._id; // This should be a string from PHP
        option.textContent = `${mechanic.name} - ${mechanic.specialization}`;
        select.appendChild(option);
    });
    
    console.log('✅ Select dropdown populated');
}

function setupForm() {
    const form = document.getElementById('appointmentForm');
    if (!form) {
        console.error('❌ Form not found');
        return;
    }
    
    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        console.log('🚀 FORM SUBMITTED');
        
        // Get form data step by step
        const mechanicSelect = document.getElementById('selectedMechanic');
        const selectedValue = mechanicSelect ? mechanicSelect.value : '';
        
        console.log('🔍 Mechanic selection:', {
            element: mechanicSelect,
            value: selectedValue,
            valueType: typeof selectedValue,
            valueLength: selectedValue.length
        });
        
        if (!selectedValue) {
            alert('Please select a mechanic');
            return;
        }
        
        // Build form data object manually
        const formData = {};
        
        // Get each field individually
        formData.clientName = getFieldValue('clientName');
        formData.clientPhone = getFieldValue('clientPhone');
        formData.clientAddress = getFieldValue('clientAddress');
        formData.carLicense = getFieldValue('carLicense');
        formData.carEngine = getFieldValue('carEngine');
        formData.appointmentDate = getFieldValue('appointmentDate');
        formData.mechanicId = selectedValue; // Use the raw value from select
        formData.status = 'confirmed';
        
        console.log('📋 Complete form data:', formData);
        console.log('🎯 Mechanic ID final check:', {
            value: formData.mechanicId,
            type: typeof formData.mechanicId,
            isString: typeof formData.mechanicId === 'string',
            length: formData.mechanicId.length
        });
        
        // Validate required fields
        const requiredFields = ['clientName', 'clientPhone', 'clientAddress', 'carLicense', 'carEngine', 'appointmentDate', 'mechanicId'];
        for (const field of requiredFields) {
            if (!formData[field]) {
                alert(`Please fill in ${field}`);
                return;
            }
        }
        
        // Submit the form
        await submitAppointment(formData);
    });
    
    console.log('✅ Form handler attached');
}

function getFieldValue(fieldId) {
    const field = document.getElementById(fieldId);
    const value = field ? field.value.trim() : '';
    console.log(`Field ${fieldId}:`, value);
    return value;
}

async function submitAppointment(formData) {
    console.log('📤 Submitting appointment...');
    
    const submitBtn = document.getElementById('submitBtn');
    if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = 'Booking...';
    }
    
    try {
        // Create the JSON string manually to be 100% sure
        const jsonString = JSON.stringify(formData);
        console.log('📝 JSON being sent:', jsonString);
        
        const response = await fetch(`${API_BASE_URL}/book_appointment.php`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: jsonString
        });
        
        console.log('📡 Response status:', response.status);
        
        const result = await response.json();
        console.log('📥 Server response:', result);
        
        if (result.success) {
            alert('✅ Appointment booked successfully!');
            resetForm();
        } else {
            alert('❌ Error: ' + (result.message || 'Unknown error'));
        }
        
    } catch (error) {
        console.error('❌ Network error:', error);
        alert('❌ Connection error: ' + error.message);
    } finally {
        if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.textContent = 'Book Appointment';
        }
    }
}

function resetForm() {
    const form = document.getElementById('appointmentForm');
    if (form) {
        form.reset();
    }
}

function showUI() {
    // Show form
    const form = document.getElementById('appointmentForm');
    if (form) {
        form.style.display = 'block';
    }
    
    // Hide loading
    const loading = document.getElementById('loadingIndicator');
    if (loading) {
        loading.style.display = 'none';
    }
    
    console.log('✅ UI shown');
}

console.log('🎯 Final solution script loaded');