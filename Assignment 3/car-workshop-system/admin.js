// Admin Panel JavaScript - Fixed for Live Server CORS
console.log('🛠️ Admin Panel Loading - CORS Fixed Version...');

// Dynamic API base URL detection
const API_BASE_URL = window.location.hostname === '127.0.0.1' && window.location.port === '5500'
    ? 'http://localhost:8000'  // Live Server - point to PHP server
    : window.location.origin;   // PHP Server - use same origin

console.log('🔗 Using API Base URL:', API_BASE_URL);

let appointments = [];
let mechanics = [];

document.addEventListener('DOMContentLoaded', function() {
    console.log('Admin panel DOM loaded');
    console.log('Current URL:', window.location.href);
    console.log('API Base URL:', API_BASE_URL);
    initAdmin();
});

async function initAdmin() {
    try {
        console.log('🚀 Initializing admin panel...');
        
        // Initialize with loading state
        showLoadingState();
        
        // Load mechanics first
        await loadMechanics();
        
        // Then load appointments
        await loadAppointments();
        
        // Setup event listeners
        setupEventListeners();
        
        console.log('✅ Admin panel initialized successfully');
    } catch (error) {
        console.error('❌ Admin initialization failed:', error);
        showErrorState('Failed to initialize admin panel: ' + error.message);
    }
}

function showLoadingState() {
    const tbody = document.getElementById('appointmentsTableBody');
    if (tbody) {
        tbody.innerHTML = `
            <tr>
                <td colspan="7" style="text-align: center; padding: 30px; color: rgba(255, 255, 255, 0.7);">
                    <div style="display: flex; align-items: center; justify-content: center; gap: 10px;">
                        <div style="width: 20px; height: 20px; border: 3px solid rgba(255,255,255,0.3); border-top: 3px solid #4ade80; border-radius: 50%; animation: spin 1s linear infinite;"></div>
                        Loading appointments...
                    </div>
                </td>
            </tr>
        `;
    }
}

function showErrorState(message) {
    const tbody = document.getElementById('appointmentsTableBody');
    if (tbody) {
        tbody.innerHTML = `
            <tr>
                <td colspan="7" style="text-align: center; padding: 30px; color: #ef4444;">
                    <div>
                        <h4 style="color: #ef4444; margin-bottom: 10px;">⚠️ Error Loading Data</h4>
                        <p>${message}</p>
                        <p style="font-size: 12px; opacity: 0.8; margin-top: 10px;">
                            Current server: ${window.location.origin}<br>
                            API server: ${API_BASE_URL}
                        </p>
                        <button onclick="initAdmin()" style="margin-top: 10px; padding: 8px 16px; background: #ef4444; color: white; border: none; border-radius: 5px; cursor: pointer;">
                            Retry
                        </button>
                    </div>
                </td>
            </tr>
        `;
    }
}

async function loadMechanics() {
    try {
        console.log('📡 Loading mechanics from:', `${API_BASE_URL}/get_mechanics.php`);
        
        const response = await fetch(`${API_BASE_URL}/get_mechanics.php`, {
            method: 'GET',
            headers: {
                'Cache-Control': 'no-cache',
                'Content-Type': 'application/json'
            }
        });
        
        console.log('Mechanics response status:', response.status);
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json();
        console.log('📥 Mechanics response:', data);
        
        if (data.success && Array.isArray(data.mechanics)) {
            mechanics = data.mechanics;
            populateMechanicFilter();
            console.log('✅ Mechanics loaded:', mechanics.length);
        } else {
            console.warn('⚠️ No mechanics data or invalid format:', data);
            mechanics = [];
        }
    } catch (error) {
        console.error('❌ Error loading mechanics:', error);
        mechanics = [];
    }
}

function populateMechanicFilter() {
    const mechanicFilter = document.getElementById('mechanicFilter');
    if (!mechanicFilter) {
        console.warn('⚠️ Mechanic filter element not found');
        return;
    }
    
    mechanicFilter.innerHTML = '<option value="">All Mechanics</option>';
    
    if (mechanics && mechanics.length > 0) {
        mechanics.forEach(mechanic => {
            if (mechanic && mechanic._id && mechanic.name) {
                const option = document.createElement('option');
                option.value = mechanic._id;
                option.textContent = mechanic.name;
                mechanicFilter.appendChild(option);
            }
        });
        console.log('✅ Mechanic filter populated with', mechanics.length, 'mechanics');
    } else {
        console.warn('⚠️ No valid mechanics to populate filter');
    }
}

async function loadAppointments(filters = {}) {
    try {
        console.log('📡 Loading appointments with filters:', filters);
        
        const params = new URLSearchParams();
        if (filters.date) params.append('date', filters.date);
        if (filters.mechanicId) params.append('mechanicId', filters.mechanicId);
        if (filters.status) params.append('status', filters.status);
        
        const url = `${API_BASE_URL}/get_appointments.php${params.toString() ? '?' + params.toString() : ''}`;
        console.log('🔗 Fetching from:', url);
        
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Cache-Control': 'no-cache',
                'Pragma': 'no-cache',
                'Content-Type': 'application/json'
            }
        });
        
        console.log('Appointments response status:', response.status);
        
        if (!response.ok) {
            const errorText = await response.text();
            console.error('Response error text:', errorText);
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json();
        console.log('📊 Appointments response:', data);
        
        if (data.success) {
            appointments = Array.isArray(data.appointments) ? data.appointments : [];
            displayAppointments();
            updateStats();
            console.log('✅ Appointments loaded:', appointments.length);
        } else {
            throw new Error(data.message || 'Failed to load appointments');
        }
    } catch (error) {
        console.error('❌ Error loading appointments:', error);
        
        // Show more detailed error for CORS issues
        if (error.message.includes('CORS') || error.message.includes('Failed to fetch')) {
            showErrorState(`CORS Error: Cannot connect to API server (${API_BASE_URL}). 
                          Please use http://localhost:8000/admin.html instead.`);
        } else {
            showErrorState('Error loading appointments: ' + error.message);
        }
    }
}

function updateStats() {
    try {
        const totalCount = document.getElementById('totalCount');
        if (totalCount) {
            totalCount.textContent = appointments.length;
        }
        
        const activeCount = document.getElementById('activeCount');
        if (activeCount) {
            const active = appointments.filter(a => 
                a.status && a.status !== 'cancelled' && a.status !== 'completed'
            ).length;
            activeCount.textContent = active;
        }
        
        const lastUpdated = document.getElementById('lastUpdated');
        if (lastUpdated) {
            lastUpdated.textContent = new Date().toLocaleTimeString();
        }
        
        console.log('📊 Stats updated - Total:', appointments.length);
    } catch (error) {
        console.error('❌ Error updating stats:', error);
    }
}

function displayAppointments() {
    const tbody = document.getElementById('appointmentsTableBody');
    if (!tbody) {
        console.error('❌ Appointments table body not found');
        return;
    }
    
    if (!appointments || appointments.length === 0) {
        displayNoAppointments('No appointments found.');
        return;
    }
    
    console.log('🎨 Displaying', appointments.length, 'appointments');
    tbody.innerHTML = '';
    
    appointments.forEach((appointment, index) => {
        try {
            if (!appointment) {
                console.warn(`⚠️ Invalid appointment at index ${index}:`, appointment);
                return;
            }
            
            const row = document.createElement('tr');
            
            // Safe date formatting
            let formattedDate = 'Invalid Date';
            try {
                if (appointment.appointmentDate) {
                    const appointmentDate = new Date(appointment.appointmentDate);
                    if (!isNaN(appointmentDate.getTime())) {
                        formattedDate = appointmentDate.toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                        });
                    }
                }
            } catch (dateError) {
                console.warn('⚠️ Date formatting error for appointment:', appointment._id, dateError);
            }
            
            // Safe field access with fallbacks
            const clientName = appointment.clientName || 'Unknown';
            const clientPhone = appointment.clientPhone || 'N/A';
            const carLicense = appointment.carLicense || 'N/A';
            const mechanicName = appointment.mechanicName || 'Unassigned';
            const status = appointment.status || 'pending';
            const appointmentId = appointment._id || '';
            
            const statusClass = getStatusClass(status);
            
            row.innerHTML = `
                <td>${escapeHtml(clientName)}</td>
                <td>${escapeHtml(clientPhone)}</td>
                <td>${escapeHtml(carLicense)}</td>
                <td>${formattedDate}</td>
                <td>${escapeHtml(mechanicName)}</td>
                <td>
                    <span class="status-badge ${statusClass}">
                        ${status.toUpperCase()}
                    </span>
                </td>
                <td>
                    <div class="action-controls">
                        <select class="status-select" data-appointment-id="${appointmentId}" data-current-status="${status}">
                            <option value="confirmed" ${status === 'confirmed' ? 'selected' : ''}>Confirmed</option>
                            <option value="in-progress" ${status === 'in-progress' ? 'selected' : ''}>In Progress</option>
                            <option value="completed" ${status === 'completed' ? 'selected' : ''}>Completed</option>
                            <option value="cancelled" ${status === 'cancelled' ? 'selected' : ''}>Cancelled</option>
                        </select>
                        <button class="update-btn" data-appointment-id="${appointmentId}">Update</button>
                        <button class="details-btn" data-appointment-id="${appointmentId}">Details</button>
                    </div>
                </td>
            `;
            
            tbody.appendChild(row);
        } catch (rowError) {
            console.error('❌ Error creating row for appointment:', appointment, rowError);
        }
    });
    
    // Attach event listeners after DOM update
    attachEventListeners();
    console.log('✅ Appointments display completed');
}

function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function attachEventListeners() {
    try {
        document.querySelectorAll('.update-btn').forEach(btn => {
            btn.removeEventListener('click', handleStatusUpdate);
            btn.addEventListener('click', handleStatusUpdate);
        });
        
        document.querySelectorAll('.details-btn').forEach(btn => {
            btn.removeEventListener('click', showAppointmentDetails);
            btn.addEventListener('click', showAppointmentDetails);
        });
        
        console.log('✅ Event listeners attached to buttons');
    } catch (error) {
        console.error('❌ Error attaching event listeners:', error);
    }
}

function displayNoAppointments(message) {
    const tbody = document.getElementById('appointmentsTableBody');
    if (tbody) {
        tbody.innerHTML = `
            <tr>
                <td colspan="7" style="text-align: center; padding: 40px; color: rgba(255, 255, 255, 0.6);">
                    <div>
                        <div style="font-size: 48px; margin-bottom: 15px; opacity: 0.5;">📋</div>
                        <h4 style="color: white; margin-bottom: 10px;">No Appointments Found</h4>
                        <p>${message}</p>
                        <p style="font-size: 12px; opacity: 0.8; margin-top: 10px;">
                            Using API: ${API_BASE_URL}
                        </p>
                    </div>
                </td>
            </tr>
        `;
    }
}

function getStatusClass(status) {
    const statusMap = {
        'confirmed': 'status-confirmed',
        'in-progress': 'status-in-progress', 
        'completed': 'status-completed',
        'cancelled': 'status-cancelled'
    };
    return statusMap[status] || 'status-confirmed';
}

async function handleStatusUpdate(e) {
    e.preventDefault();
    e.stopPropagation();
    
    try {
        const appointmentId = e.target.dataset.appointmentId;
        const select = document.querySelector(`select[data-appointment-id="${appointmentId}"]`);
        
        if (!appointmentId || !select) {
            throw new Error('Invalid appointment data');
        }
        
        const newStatus = select.value;
        const currentStatus = select.dataset.currentStatus;
        const appointment = appointments.find(a => a._id === appointmentId);
        
        console.log('🔄 Update requested:', {
            appointmentId,
            currentStatus,
            newStatus,
            appointment: appointment ? appointment.clientName : 'not found',
            apiUrl: `${API_BASE_URL}/update_appointment.php`
        });
        
        if (!appointment) {
            throw new Error('Appointment not found');
        }
        
        if (newStatus === currentStatus) {
            alert('Please select a different status');
            return;
        }
        
        if (!confirm(`Update ${appointment.clientName}'s appointment from "${currentStatus}" to "${newStatus}"?`)) {
            select.value = currentStatus;
            return;
        }
        
        const updateBtn = e.target;
        updateBtn.disabled = true;
        updateBtn.textContent = 'Updating...';
        
        const response = await fetch(`${API_BASE_URL}/update_appointment.php`, {
            method: 'PUT',
            headers: { 
                'Content-Type': 'application/json',
                'Cache-Control': 'no-cache'
            },
            body: JSON.stringify({
                appointmentId: appointmentId,
                status: newStatus
            })
        });
        
        console.log('Update response status:', response.status);
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const result = await response.json();
        console.log('📥 Update result:', result);
        
        if (result.success) {
            showSuccessMessage(`Appointment status updated to "${newStatus}" successfully!`);
            await loadAppointments();
        } else {
            throw new Error(result.message || 'Failed to update appointment');
        }
        
    } catch (error) {
        console.error('❌ Update error:', error);
        alert('Update failed: ' + error.message);
        
        const appointmentId = e.target.dataset.appointmentId;
        const select = document.querySelector(`select[data-appointment-id="${appointmentId}"]`);
        if (select) {
            select.value = select.dataset.currentStatus;
        }
    } finally {
        const updateBtn = e.target;
        updateBtn.disabled = false;
        updateBtn.textContent = 'Update';
    }
}

function showAppointmentDetails(e) {
    e.preventDefault();
    e.stopPropagation();
    
    try {
        const appointmentId = e.target.dataset.appointmentId;
        const appointment = appointments.find(a => a._id === appointmentId);
        
        if (!appointment) {
            throw new Error('Appointment not found');
        }
        
        const modal = document.getElementById('detailsModal');
        const detailsEl = document.getElementById('appointmentDetails');
        
        if (!modal || !detailsEl) {
            throw new Error('Modal elements not found');
        }
        
        const createdDate = appointment.createdAt ? 
            new Date(appointment.createdAt).toLocaleString() : 'Unknown';
        const appointmentDate = appointment.appointmentDate ? 
            new Date(appointment.appointmentDate).toDateString() : 'Unknown';
        
        detailsEl.innerHTML = `
            <div style="text-align: left; color: #333;">
                <h4 style="color: #333; margin-bottom: 15px;">${escapeHtml(appointment.clientName || 'Unknown')}</h4>
                <p><strong>Phone:</strong> ${escapeHtml(appointment.clientPhone || 'N/A')}</p>
                <p><strong>Address:</strong> ${escapeHtml(appointment.clientAddress || 'N/A')}</p>
                <p><strong>Car License:</strong> ${escapeHtml(appointment.carLicense || 'N/A')}</p>
                <p><strong>Engine Number:</strong> ${escapeHtml(appointment.carEngine || 'N/A')}</p>
                <p><strong>Appointment Date:</strong> ${appointmentDate}</p>
                <p><strong>Mechanic:</strong> ${escapeHtml(appointment.mechanicName || 'Unassigned')}</p>
                <p><strong>Status:</strong> <span class="status-badge ${getStatusClass(appointment.status)}">${(appointment.status || 'pending').toUpperCase()}</span></p>
                <p><strong>Created:</strong> ${createdDate}</p>
                ${appointment.notes ? `<p><strong>Notes:</strong> ${escapeHtml(appointment.notes)}</p>` : ''}
                <p style="font-size: 12px; opacity: 0.7; margin-top: 15px; border-top: 1px solid #eee; padding-top: 10px;">
                    <strong>API Server:</strong> ${API_BASE_URL}<br>
                    <strong>Client Server:</strong> ${window.location.origin}
                </p>
            </div>
        `;
        
        modal.classList.add('show');
        console.log('✅ Details modal shown for:', appointment.clientName);
        
    } catch (error) {
        console.error('❌ Error showing details:', error);
        alert('Failed to show appointment details: ' + error.message);
    }
}

function setupEventListeners() {
    try {
        const filterBtn = document.getElementById('filterBtn');
        if (filterBtn) {
            filterBtn.addEventListener('click', handleFilter);
        }
        
        const clearBtn = document.getElementById('clearBtn');
        if (clearBtn) {
            clearBtn.addEventListener('click', handleClearFilter);
        }
        
        console.log('✅ Filter event listeners setup');
    } catch (error) {
        console.error('❌ Error setting up event listeners:', error);
    }
}

async function handleFilter() {
    try {
        const dateFilter = document.getElementById('dateFilter');
        const mechanicFilter = document.getElementById('mechanicFilter');
        const statusFilter = document.getElementById('statusFilter');
        
        const filters = {};
        
        if (dateFilter && dateFilter.value) filters.date = dateFilter.value;
        if (mechanicFilter && mechanicFilter.value) filters.mechanicId = mechanicFilter.value;
        if (statusFilter && statusFilter.value) filters.status = statusFilter.value;
        
        console.log('🔍 Applying filters:', filters);
        await loadAppointments(filters);
    } catch (error) {
        console.error('❌ Error applying filters:', error);
    }
}

async function handleClearFilter() {
    try {
        const dateFilter = document.getElementById('dateFilter');
        const mechanicFilter = document.getElementById('mechanicFilter');
        const statusFilter = document.getElementById('statusFilter');
        
        if (dateFilter) dateFilter.value = '';
        if (mechanicFilter) mechanicFilter.value = '';
        if (statusFilter) statusFilter.value = '';
        
        console.log('🧹 Clearing filters');
        await loadAppointments();
    } catch (error) {
        console.error('❌ Error clearing filters:', error);
    }
}

function showSuccessMessage(message) {
    console.log('✅ Success:', message);
    
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #10b981;
        color: white;
        padding: 15px 20px;
        border-radius: 10px;
        box-shadow: 0 10px 25px rgba(0,0,0,0.2);
        z-index: 1001;
        font-weight: 600;
        max-width: 400px;
        animation: slideIn 0.3s ease-out;
    `;
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease-in forwards';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Global modal functions
function closeModal() {
    const modal = document.getElementById('successModal');
    if (modal) modal.classList.remove('show');
}

function closeErrorModal() {
    const modal = document.getElementById('errorModal');
    if (modal) modal.classList.remove('show');
}

function closeDetailsModal() {
    const modal = document.getElementById('detailsModal');
    if (modal) modal.classList.remove('show');
}

// Close modals on outside click
window.addEventListener('click', function(e) {
    if (e.target.classList.contains('modal')) {
        e.target.classList.remove('show');
    }
});

// Add CSS animations
const style = document.createElement('style');
style.textContent = `
    @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
    }
    @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
`;
document.head.appendChild(style);

console.log('🛠️ Admin panel script loaded - CORS issues fixed for Live Server');