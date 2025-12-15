// ===== Authentication Management =====
let allUsers = [];
let currentUser = null;

// Initialize the application
document.addEventListener('DOMContentLoaded', async function() {
    try {
        // Load all users from JSON
        const response = await fetch('data/users.json');
        allUsers = await response.json();
        
        // Populate email datalist
        populateEmailList();
    } catch (error) {
        console.error('Error loading users:', error);
        allUsers = { users: [] };
    }
    
    // Check if user is already logged in
    const loggedInUser = sessionStorage.getItem('currentUser');
    if (loggedInUser) {
        try {
            currentUser = JSON.parse(loggedInUser);
            showDashboard();
        } catch (error) {
            console.error('Error restoring session:', error);
            showLoginForm();
        }
    } else {
        showLoginForm();
    }
});

// Populate email datalist with users from JSON
function populateEmailList() {
    const emailList = document.getElementById('emailList');
    if (!emailList || !allUsers.users) return;
    
    // Clear existing options
    emailList.innerHTML = '';
    
    // Add each user's email as an option
    allUsers.users.forEach(user => {
        const option = document.createElement('option');
        option.value = user.email;
        emailList.appendChild(option);
    });
}

// Show login form
function showLoginForm() {
    const loginModal = document.getElementById('loginModal');
    const mainContainer = document.getElementById('mainContainer');
    
    if (loginModal) loginModal.classList.add('active');
    if (mainContainer) mainContainer.style.display = 'none';
}

// Show dashboard
function showDashboard() {
    const loginModal = document.getElementById('loginModal');
    const mainContainer = document.getElementById('mainContainer');
    
    if (loginModal) loginModal.classList.remove('active');
    if (mainContainer) mainContainer.style.display = 'block';
    
    // Initialize dashboard
    if (currentUser) {
        initializeDashboard();
    }
}

// Handle login form submission
async function handleLogin(event) {
    event.preventDefault();
    
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    
    // Find user by email
    const user = allUsers.users.find(u => u.email === email);
    
    if (!user) {
        alert('Email not found. Please check and try again.');
        return;
    }
    
    // Verify password against stored password in JSON
    if (password !== user.password) {
        alert('Invalid password. Please try again.');
        return;
    }
    
    // Store user session
    currentUser = {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        roles: user.roles,
        active: user.active
    };
    
    sessionStorage.setItem('currentUser', JSON.stringify(currentUser));
    
    // Clear form
    document.getElementById('loginForm').reset();
    
    // Show dashboard
    showDashboard();
}

// Logout function
function logout() {
    if (confirm('Are you sure you want to log out?')) {
        // Clear session
        sessionStorage.removeItem('currentUser');
        currentUser = null;
        
        // Show login form
        showLoginForm();
        
        // Clear any form data
        const form = document.getElementById('loginForm');
        if (form) form.reset();
    }
}

// Initialize dashboard with user data
function initializeDashboard() {
    updateUserDisplay();
    loadRoleSelector();
}

// Update user display in header
function updateUserDisplay() {
    if (!currentUser) return;
    
    const userName = document.getElementById('userName');
    if (userName) {
        userName.textContent = currentUser.name;
    }
}

// Load and configure role selector
async function loadRoleSelector() {
    if (!currentUser) return;
    
    const roleSelector = document.getElementById('roleSelector');
    const selectedRoles = document.getElementById('selectedRoles');
    
    if (currentUser.roles.length > 1) {
        // Show role selector for multiple roles
        if (roleSelector) {
            roleSelector.style.display = 'block';
            
            // Clear existing options except the first one
            while (roleSelector.options.length > 1) {
                roleSelector.remove(1);
            }
            
            // Add only the user's roles to the dropdown
            currentUser.roles.forEach(role => {
                const option = document.createElement('option');
                option.value = role;
                option.textContent = getRoleDisplayName(role);
                roleSelector.appendChild(option);
            });
            
            // Set first role as selected
            roleSelector.value = currentUser.roles[0];
            updateRole();
        }
    } else {
        // Hide selector and show single role as badge
        if (roleSelector) roleSelector.style.display = 'none';
        if (selectedRoles) {
            selectedRoles.innerHTML = '';
            const badge = document.createElement('span');
            const roleValue = currentUser.roles[0];
            const roleText = getRoleDisplayName(roleValue);
            badge.className = `role-badge ${roleValue}`;
            badge.textContent = roleText;
            selectedRoles.appendChild(badge);
        }
    }
}

// Role display update function
function updateRole() {
    const selector = document.getElementById('roleSelector');
    const selectedRoles = document.getElementById('selectedRoles');
    
    if (!selector) return;
    
    const selectedValue = selector.value;
    
    // Clear previous roles
    if (selectedRoles) selectedRoles.innerHTML = '';
    
    if (selectedValue) {
        // Get the role text from the selected option
        const roleText = selector.options[selector.selectedIndex].text;
        
        // Create and add the role badge
        const badge = document.createElement('span');
        badge.className = `role-badge ${selectedValue}`;
        badge.textContent = roleText;
        if (selectedRoles) selectedRoles.appendChild(badge);
        
        // Update current user's active role
        if (currentUser) {
            currentUser.activeRole = selectedValue;
        }
    }
}

// Get display name for role value
function getRoleDisplayName(roleValue) {
    const roleMap = {
        'bishop': 'Bishop',
        'counselor-1': 'First Counselor',
        'counselor-2': 'Second Counselor',
        'secretary': 'Secretary',
        'asst-secretary': 'Assistant Secretary',
        'clerk': 'Clerk',
        'asst-clerk-membership': 'Assistant Clerk - Membership',
        'asst-clerk-finance': 'Assistant Clerk - Finance'
    };
    return roleMap[roleValue] || roleValue;
}

// Section navigation
function showSection(sectionId) {
    // Hide all sections
    const sections = document.querySelectorAll('.section');
    sections.forEach(section => section.classList.remove('active'));
    
    // Show the selected section
    const selectedSection = document.getElementById(sectionId);
    if (selectedSection) {
        selectedSection.classList.add('active');
    }
    
    // Update active nav button
    const navButtons = document.querySelectorAll('.nav-btn');
    navButtons.forEach(btn => btn.classList.remove('active'));
    event.target.closest('.nav-btn').classList.add('active');
}

// Quick action handler
function quickAction(action) {
    alert(`Action: ${action}`);
    // Add quick action logic here
}

// Member search filter
function filterMembers() {
    const searchInput = document.getElementById('memberSearch');
    const searchTerm = searchInput.value.toLowerCase();
    const tableRows = document.querySelectorAll('#membersBody tr');
    
    tableRows.forEach(row => {
        const text = row.textContent.toLowerCase();
        row.style.display = text.includes(searchTerm) ? '' : 'none';
    });
}

// Assignment filter
function filterAssignments() {
    const filterValue = document.getElementById('filterAssignments').value;
    // Add assignment filtering logic here
}

// Schedule filter
function filterSchedule() {
    const filterValue = document.getElementById('scheduleFilter').value;
    // Add schedule filtering logic here
}

// Edit functions
function editMember(id) {
    alert(`Edit member ${id}`);
}

function deleteMember(id) {
    if (confirm('Are you sure you want to delete this member?')) {
        alert(`Member ${id} deleted`);
    }
}

function editAssignment(id) {
    alert(`Edit assignment ${id}`);
}

function markComplete(id) {
    alert(`Assignment ${id} marked complete`);
}

function viewAssignment(id) {
    alert(`View assignment ${id}`);
}

function openAddMember() {
    openModal('Add Member', `
        <div class="form-group">
            <label>First Name</label>
            <input type="text" placeholder="Enter first name" required>
        </div>
        <div class="form-group">
            <label>Last Name</label>
            <input type="text" placeholder="Enter last name" required>
        </div>
        <div class="form-group">
            <label>Email</label>
            <input type="email" placeholder="Enter email" required>
        </div>
        <div class="form-group">
            <label>Phone</label>
            <input type="tel" placeholder="Enter phone number" required>
        </div>
        <div class="form-group">
            <label>Role</label>
            <select required>
                <option value="">Select Role</option>
                <option value="member">Member</option>
                <option value="home-teacher">Home Teacher</option>
                <option value="relief-society">Relief Society</option>
                <option value="elders-quorum">Elders Quorum</option>
            </select>
        </div>
    `);
}

function openNewAssignment() {
    openModal('New Assignment', `
        <div class="form-group">
            <label>Assignment Title</label>
            <input type="text" placeholder="Enter assignment title" required>
        </div>
        <div class="form-group">
            <label>Description</label>
            <textarea placeholder="Enter assignment description" rows="4"></textarea>
        </div>
        <div class="form-group">
            <label>Assign To</label>
            <select required>
                <option value="">Select Member</option>
                <option value="james">James Johnson</option>
                <option value="sarah">Sarah Williams</option>
                <option value="michael">Michael Brown</option>
            </select>
        </div>
        <div class="form-group">
            <label>Due Date</label>
            <input type="date" required>
        </div>
    `);
}

function openScheduleEvent() {
    openModal('Schedule Event', `
        <div class="form-group">
            <label>Event Name</label>
            <input type="text" placeholder="Enter event name" required>
        </div>
        <div class="form-group">
            <label>Event Date</label>
            <input type="date" required>
        </div>
        <div class="form-group">
            <label>Start Time</label>
            <input type="time" required>
        </div>
        <div class="form-group">
            <label>End Time</label>
            <input type="time" required>
        </div>
        <div class="form-group">
            <label>Location</label>
            <input type="text" placeholder="Enter location" required>
        </div>
    `);
}

function openForm(formType) {
    const formTitles = {
        referral: 'Member Referral Form',
        homeTeaching: 'Home Teaching Report',
        welfare: 'Welfare Assistance Request',
        missionary: 'Missionary Recommendation',
        activity: 'Activity Planning Form',
        service: 'Service Project Log'
    };
    
    openModal(formTitles[formType] || 'Form', `
        <div class="form-group">
            <label>Form Type: ${formTitles[formType]}</label>
            <textarea placeholder="Enter form details..." rows="6"></textarea>
        </div>
        <div class="form-group">
            <label>Additional Notes</label>
            <textarea placeholder="Additional notes..." rows="3"></textarea>
        </div>
    `);
}

function generateReport(reportType) {
    alert(`Generating ${reportType} report...`);
}

function exportReport(reportType) {
    alert(`Exporting ${reportType} report...`);
}

function editEvent(eventId) {
    alert(`Edit event ${eventId}`);
}

function previousMonth() {
    alert('Previous month');
}

function nextMonth() {
    alert('Next month');
}

function openModal(title, content) {
    const modal = document.getElementById('modal');
    const modalTitle = document.getElementById('modalTitle');
    const modalBody = document.getElementById('modalBody');
    
    modalTitle.textContent = title;
    modalBody.innerHTML = content;
    modal.classList.add('show');
}

function closeModal() {
    const modal = document.getElementById('modal');
    modal.classList.remove('show');
}

// Close modal when clicking outside of it
window.onclick = function(event) {
    const modal = document.getElementById('modal');
    if (event.target === modal) {
        modal.classList.remove('show');
    }
}
