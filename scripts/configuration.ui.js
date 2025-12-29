// Configuration tab UI logic (modularized for testing)

export function renderConfigurationTable(config) {
    const tbody = document.getElementById('configurationBody');
    if (!tbody) return;
    tbody.innerHTML = '';
    if (!config || config.length === 0) return;
    config.forEach(row => {
        const tr = document.createElement('tr');
        tr.innerHTML = `<td>${row.setting}</td><td>${row.value}</td>`;
        tbody.appendChild(tr);
    });
}

export function openEditConfiguration() {
    alert('Edit Configuration modal would open here.');
}

window.renderConfigurationTable = renderConfigurationTable;
window.openEditConfiguration = openEditConfiguration;
