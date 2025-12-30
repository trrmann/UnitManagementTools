/**
 * @jest-environment jsdom
 */
// Unit tests for Organization tab UI logic
// Inject async storage mock for Org class
// Mock Configuration import so every instance sets _storageObj
const asyncStorageMock = {
    Get: async () => ({}),
    Set: async () => {}
};

// Mock Org class to bypass storage validation and Fetch logic
jest.mock('../../modules/org.mjs', () => {
    return {
        Org: class {
            constructor() {
                // Accept any config, ignore storage validation
            }
            async Fetch() {
                // No-op
            }
            get Stakes() {
                // Return mock stakes for tests
                return [
                    {
                        name: 'Stake',
                        unitNumber: 2,
                        units: [
                            { name: 'Ward', unitNumber: 3, type: 'ward' },
                            { name: 'Branch', unitNumber: 4, type: 'branch' }
                        ]
                    }
                ];
            }
        }
    };
});

import { renderOrganizationTable, openEditOrganization } from '../organization.ui.js';

describe('Organization Tab UI', () => {
    beforeEach(() => {
        document.body.innerHTML = `
            <table><tbody id="organizationBody"></tbody></table>
        `;
    });

    it('renders hierarchical organization table with stake unit number in header and no stake number column in data rows', async () => {
        await renderOrganizationTable();
        const rows = document.querySelectorAll('#organizationBody tr');
        // Stake heading row
        expect(rows[0].innerHTML).toContain('Stake');
        expect(rows[0].innerHTML).toContain('add-unit-btn');
        expect(rows[0].innerHTML).toContain('Add Unit');
        expect(rows[0].innerHTML).toContain('Unit Number: 2'); // stake unit number in header
        // Child units
        expect(rows[1].innerHTML).toContain('Ward');
        expect(rows[1].innerHTML).toContain('3');
        expect(rows[1].innerHTML).toContain('ward');
        expect(rows[1].innerHTML).not.toContain('Unit Number: 2'); // no stake number in data row
        expect(rows[2].innerHTML).toContain('Branch');
        expect(rows[2].innerHTML).toContain('4');
        expect(rows[2].innerHTML).toContain('branch');
        expect(rows[2].innerHTML).not.toContain('Unit Number: 2');
        // Edit/Delete buttons for units
        expect(rows[1].querySelector('.org-edit-btn')).toBeTruthy();
        expect(rows[1].querySelector('.org-delete-btn')).toBeTruthy();
        expect(rows[2].querySelector('.org-edit-btn')).toBeTruthy();
        expect(rows[2].querySelector('.org-delete-btn')).toBeTruthy();
    });

    it('renders empty table if no organization data', async () => {
        // Patch Org mock to return no stakes
        jest.mocked = true;
        jest.doMock('../../modules/org.mjs', () => {
            return {
                Org: class {
                    constructor() {}
                    async Fetch() {}
                    get Stakes() { return []; }
                }
            };
        });
        jest.resetModules();
        jest.doMock('../../modules/org.mjs', () => {
            return {
                Org: class {
                    constructor() {}
                    async Fetch() {}
                    get Stakes() { return []; }
                }
            };
        });
        const { renderOrganizationTable } = await import('../organization.ui.js');
        await renderOrganizationTable();
        const tbody = document.getElementById('organizationBody');
        expect(tbody.innerHTML).toContain('No organization data found.');
    });

    it('Edit/Delete buttons for units trigger alerts', async () => {
        window.alert = jest.fn();
        await renderOrganizationTable();
        document.querySelector('.org-edit-btn').click();
        expect(window.alert).toHaveBeenCalledWith(expect.stringMatching(/Edit unit/));
        document.querySelector('.org-delete-btn').click();
        expect(window.alert).toHaveBeenCalledWith(expect.stringMatching(/Delete unit/));
    });

    it('openEditOrganization triggers modal/alert', () => {
        window.alert = jest.fn();
        openEditOrganization();
        expect(window.alert).toHaveBeenCalled();
    });
});
