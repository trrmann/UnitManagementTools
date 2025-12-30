// Unit tests for Organization tab UI logic
// Unit tests for Organization tab UI logic
import { renderOrganizationTable, openEditOrganization } from '../organization.ui.js';
import { Configuration } from '../../modules/configuration.mjs';

describe('Organization Tab UI', () => {
    beforeEach(() => {
        document.body.innerHTML = `
            <table><tbody id="organizationBody"></tbody></table>
        `;
    });

    it('renders hierarchical organization table with Edit/Delete/Add Unit buttons', async () => {
        // Mock Configuration
        jest.spyOn(Configuration.prototype, 'Fetch').mockImplementation(async function() {
            this.configuration = {
                organizations: {
                    units: {
                        mission1: { unittypeid: 1, unitDisplayName: 'Mission', presidingOrganization: null },
                        stake1: { unittypeid: 2, unitDisplayName: 'Stake', presidingOrganization: 1 },
                        ward1: { unittypeid: 3, unitDisplayName: 'Ward', presidingOrganization: 2 },
                        branch1: { unittypeid: 4, unitDisplayName: 'Branch', presidingOrganization: 2 }
                    }
                }
            };
        });
        await renderOrganizationTable();
        const rows = document.querySelectorAll('#organizationBody tr');
        // Mission heading
        expect(rows[0].innerHTML).toContain('Mission');
        // Stake heading
        expect(rows[1].innerHTML).toContain('Stake');
        // Add Unit button
        expect(rows[1].querySelector('.add-unit-btn')).toBeTruthy();
        // Child units
        expect(rows[2].innerHTML).toContain('Ward');
        expect(rows[3].innerHTML).toContain('Branch');
        // Edit/Delete buttons
        expect(rows[2].querySelector('.org-edit-btn')).toBeTruthy();
        expect(rows[2].querySelector('.org-delete-btn')).toBeTruthy();
        expect(rows[3].querySelector('.org-edit-btn')).toBeTruthy();
        expect(rows[3].querySelector('.org-delete-btn')).toBeTruthy();
    });

    it('renders empty table if no organization data', async () => {
        jest.spyOn(Configuration.prototype, 'Fetch').mockImplementation(async function() {
            this.configuration = {};
        });
        await renderOrganizationTable();
        const rows = document.querySelectorAll('#organizationBody tr');
        expect(rows.length).toBe(0);
    });

    it('Edit/Delete/Add Unit buttons trigger alerts', async () => {
        jest.spyOn(Configuration.prototype, 'Fetch').mockImplementation(async function() {
            this.configuration = {
                organizations: {
                    units: {
                        mission1: { unittypeid: 1, unitDisplayName: 'Mission', presidingOrganization: null },
                        stake1: { unittypeid: 2, unitDisplayName: 'Stake', presidingOrganization: 1 },
                        ward1: { unittypeid: 3, unitDisplayName: 'Ward', presidingOrganization: 2 }
                    }
                }
            };
        });
        window.alert = jest.fn();
        await renderOrganizationTable();
        document.querySelector('.org-edit-btn').click();
        expect(window.alert).toHaveBeenCalledWith(expect.stringMatching(/Edit unit/));
        document.querySelector('.org-delete-btn').click();
        expect(window.alert).toHaveBeenCalledWith(expect.stringMatching(/Delete unit/));
        document.querySelector('.add-unit-btn').click();
        expect(window.alert).toHaveBeenCalledWith(expect.stringMatching(/Add unit/));
    });

    it('openEditOrganization triggers modal/alert', () => {
        window.alert = jest.fn();
        openEditOrganization();
        expect(window.alert).toHaveBeenCalled();
    });
});
