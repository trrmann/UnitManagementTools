// Unit tests for Organization tab UI logic
import { renderOrganizationTable, openEditOrganization } from '../organization.ui.js';

describe('Organization Tab UI', () => {
    beforeEach(() => {
        document.body.innerHTML = `
            <table><tbody id="organizationBody"></tbody></table>
        `;
    });

    it('renders organization table with provided units', () => {
        const orgUnits = [
            { unit: 'Ward', parent: '', leader: 'John Doe' },
            { unit: 'Relief Society', parent: 'Ward', leader: 'Jane Smith' }
        ];
        renderOrganizationTable(orgUnits);
        const rows = document.querySelectorAll('#organizationBody tr');
        expect(rows.length).toBe(2);
        expect(rows[0].innerHTML).toContain('Ward');
        expect(rows[1].innerHTML).toContain('Relief Society');
    });

    it('renders empty table if no units', () => {
        renderOrganizationTable([]);
        const rows = document.querySelectorAll('#organizationBody tr');
        expect(rows.length).toBe(0);
    });

    it('openEditOrganization triggers modal/alert', () => {
        window.alert = jest.fn();
        openEditOrganization();
        expect(window.alert).toHaveBeenCalled();
    });
});
