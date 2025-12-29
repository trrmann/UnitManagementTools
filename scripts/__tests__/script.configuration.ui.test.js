// Unit tests for Configuration tab UI logic
import { renderConfigurationTable, openEditConfiguration } from '../configuration.ui.js';

describe('Configuration Tab UI', () => {
    beforeEach(() => {
        document.body.innerHTML = `
            <table><tbody id="configurationBody"></tbody></table>
        `;
    });

    it('renders configuration table with provided settings', () => {
        const config = [
            { setting: 'API_URL', value: 'https://api.example.com' },
            { setting: 'Timeout', value: '30s' }
        ];
        renderConfigurationTable(config);
        const rows = document.querySelectorAll('#configurationBody tr');
        expect(rows.length).toBe(2);
        expect(rows[0].innerHTML).toContain('API_URL');
        expect(rows[1].innerHTML).toContain('Timeout');
    });

    it('renders empty table if no settings', () => {
        renderConfigurationTable([]);
        const rows = document.querySelectorAll('#configurationBody tr');
        expect(rows.length).toBe(0);
    });

    it('openEditConfiguration triggers modal/alert', () => {
        window.alert = jest.fn();
        openEditConfiguration();
        expect(window.alert).toHaveBeenCalled();
    });
});
