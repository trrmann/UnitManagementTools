/**
 * @jest-environment jsdom
 */
// Unit tests for Configuration tab UI logic
import { renderConfigurationTable, openEditConfiguration } from '../configuration.ui.js';

describe('Configuration Tab UI', () => {
    beforeEach(() => {
        document.body.innerHTML = `
            <table><tbody id="configurationBody"></tbody></table>
        `;
        // Inject async storage mock for UI logic
        window.Storage = {
            Get: async () => ({}),
            Set: async () => {}
        };
    });

    it('renders configuration table with provided settings', () => {
        const config = [
            { setting: 'API_URL', value: 'https://api.example.com' },
            { setting: 'Timeout', value: '30s' }
        ];
        window.Storage.Get = async () => config;
        return renderConfigurationTable(window.Storage).then(() => {
            const rows = document.querySelectorAll('#configurationBody tr');
            expect(rows.length).toBe(6);
            // Heading row for first config object
            expect(rows[0].innerHTML).toContain('0');
            // Key-value pairs for first config object
            expect(rows[1].innerHTML).toContain('setting');
            expect(rows[1].innerHTML).toContain('API_URL');
            expect(rows[2].innerHTML).toContain('value');
            expect(rows[2].innerHTML).toContain('https://api.example.com');
            // Heading row for second config object
            expect(rows[3].innerHTML).toContain('1');
            // Key-value pairs for second config object
            expect(rows[4].innerHTML).toContain('setting');
            expect(rows[4].innerHTML).toContain('Timeout');
            expect(rows[5].innerHTML).toContain('value');
            expect(rows[5].innerHTML).toContain('30s');
        });
    });

    it('renders empty table if no settings', () => {
        renderConfigurationTable(window.Storage, []);
        const rows = document.querySelectorAll('#configurationBody tr');
        expect(rows.length).toBe(0);
    });

    it('openEditConfiguration triggers modal/alert', () => {
        window.alert = jest.fn();
        openEditConfiguration();
        expect(window.alert).toHaveBeenCalled();
    });
});
