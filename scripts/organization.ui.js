// Organization tab UI logic

export function renderOrganizationTable(orgUnits) {
    const tbody = document.getElementById('organizationBody');
    if (!tbody) return;
    tbody.innerHTML = '';
    if (!orgUnits || orgUnits.length === 0) return;
    orgUnits.forEach(unit => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${unit.unit}</td>
            <td>${unit.parent || ''}</td>
            <td>${unit.leader || ''}</td>
            <td><button onclick="editOrganizationUnit('${unit.unit}')">Edit</button></td>
        `;
        tbody.appendChild(tr);
    });
}

export function openEditOrganization() {
    alert('Edit Organization modal would open here.');
}

window.renderOrganizationTable = renderOrganizationTable;
window.openEditOrganization = openEditOrganization;
window.editOrganizationUnit = function(unit) {
    alert('Edit organization unit: ' + unit);
};
