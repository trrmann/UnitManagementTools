
/**
 * @jest-environment jsdom
 */

// Mock window and document before importing Site
if (typeof window === 'undefined') {
    global.window = {};
}
if (typeof document === 'undefined') {
    global.document = {
        getElementById: () => null,
        createElement: () => ({ appendChild: () => {}, className: '', id: '', innerHTML: '', textContent: '', addEventListener: () => {}, style: {}, type: '', onclick: null }),
        body: { appendChild: () => {} }
    };
}

import { Site } from '../site.mjs';

describe('Site - dynamic role selector', () => {
    let site;
    let modalHtml = '';
    beforeEach(() => {
        site = new Site();
        // Mock openModal to capture HTML
        site.openModal = (title, html) => { modalHtml = html; };
    });

    it('includes all available roles including additional roles', async () => {
        const usersInstance = {
            members: {
                Roles: {
                    roles: [
                        { id: 'roleA', name: 'Role A' },
                        { id: 'roleB', name: 'Role B' }
                    ]
                }
            },
            AdditionalRoles: [
                { memberNumber: 1, additionalRoles: ['roleA', 'roleC'] },
                { memberNumber: 2, additionalRoles: ['roleD'] }
            ]
        };
        await site.openAddMember(usersInstance);
        // Should include roleA, roleB, roleC, roleD
        expect(modalHtml).toContain('<option value="roleA">Role A</option>');
        expect(modalHtml).toContain('<option value="roleB">Role B</option>');
        expect(modalHtml).toContain('<option value="roleC">roleC</option>');
        expect(modalHtml).toContain('<option value="roleD">roleD</option>');
    });

    it('sorts roles alphabetically by name', async () => {
        const usersInstance = {
            members: {
                Roles: {
                    roles: [
                        { id: 'roleB', name: 'Bravo' },
                        { id: 'roleA', name: 'Alpha' }
                    ]
                }
            },
            AdditionalRoles: [
                { memberNumber: 1, additionalRoles: ['roleC'] }
            ]
        };
        await site.openAddMember(usersInstance);
        const alphaIdx = modalHtml.indexOf('>Alpha<');
        const bravoIdx = modalHtml.indexOf('>Bravo<');
        const roleCIdx = modalHtml.indexOf('>roleC<');
        expect(alphaIdx).toBeLessThan(bravoIdx);
        expect(bravoIdx).toBeLessThan(roleCIdx);
    });
});