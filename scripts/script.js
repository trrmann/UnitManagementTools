

// Hamburger toggle for user menu in mobile
document.addEventListener('DOMContentLoaded', function() {
    const toggleBtn = document.getElementById('userMenuToggle');
    const navBar = document.querySelector('.navbar');
    if (toggleBtn && navBar) {
        const icon = document.getElementById('userMenuToggleIcon');
        // Show toggle only in mobile
        function updateToggleVisibility() {
            if (window.innerWidth <= 600) {
                toggleBtn.style.display = 'block';
                navBar.classList.remove('show');
                if (icon) {
                    icon.classList.remove('fa-xmark', 'fa-times');
                    icon.classList.add('fa-bars');
                }
            } else {
                toggleBtn.style.display = 'none';
                navBar.classList.add('show');
                if (icon) {
                    icon.classList.remove('fa-xmark', 'fa-times');
                    icon.classList.add('fa-bars');
                }
            }
        }
        updateToggleVisibility();
        window.addEventListener('resize', updateToggleVisibility);
        toggleBtn.addEventListener('click', function() {
            navBar.classList.toggle('show');
            if (icon) {
                if (navBar.classList.contains('show')) {
                    icon.classList.remove('fa-bars');
                    icon.classList.add('fa-xmark');
                } else {
                    icon.classList.remove('fa-xmark');
                    icon.classList.add('fa-bars');
                }
            }
        });
    }
});

import { Auth } from "../modules/auth.mjs";
// Pagination state
window.membersCurrentPage = 1;
window.membersPerPage = 10;

// Expose renderMembersTable globally for legacy calls, but delegate to authInstance
window.renderMembersTable = async function() {
    if (window.authInstance && typeof window.authInstance.renderMembersTable === 'function') {
        await window.authInstance.renderMembersTable();
    }
};

// Render pagination controls for members view
function renderMembersPagination(currentPage, totalPages) {
    const paginationDiv = document.getElementById('membersPagination');
    if (!paginationDiv) return;
    if (totalPages <= 1) {
        paginationDiv.innerHTML = '';
        return;
    }
    let html = '';
    html += `<button ${currentPage === 1 ? 'disabled' : ''} onclick="changeMembersPage(${currentPage - 1})">&laquo; Prev</button>`;
    for (let i = 1; i <= totalPages; i++) {
        html += `<button ${i === currentPage ? 'class=\'active\'' : ''} onclick="changeMembersPage(${i})">${i}</button>`;
    }
    html += `<button ${currentPage === totalPages ? 'disabled' : ''} onclick="changeMembersPage(${currentPage + 1})">Next &raquo;</button>`;
    paginationDiv.innerHTML = html;
}

// Change page and re-render members table
window.changeMembersPage = function(page) {
    membersCurrentPage = page;
    renderMembersTable();
};
    // Render members table on page load
    renderMembersTable();
    let authInstance = null;

    Auth.Factory().then(auth => {
        authInstance = auth;
        // Ensure role selector is correct on resize
        window.addEventListener('resize', () => {
            if (authInstance && typeof authInstance.LoadRoleSelector === 'function') {
                authInstance.LoadRoleSelector();
            }
        });
    });


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
    // Use document.activeElement to find the button if event is not available
    let navBtn = null;
    if (window.event && window.event.target) {
        navBtn = window.event.target.closest('.nav-btn');
    } else if (document.activeElement && document.activeElement.classList.contains('nav-btn')) {
        navBtn = document.activeElement;
    }
    if (navBtn) {
        const navButtons = document.querySelectorAll('.nav-btn');
        navButtons.forEach(btn => btn.classList.remove('active'));
        navBtn.classList.add('active');
    }
}

// Expose showSection to global scope for HTML inline event handler
window.showSection = showSection;

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