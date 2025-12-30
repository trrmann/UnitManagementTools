describe('Configuration Toolbar Buttons and Search', () => {
    beforeEach(() => {
        document.body.innerHTML = `
            <input id="configurationSearch" />
            <button id="configImportBtn"></button>
            <button id="configExportBtn"></button>
            <button id="configRekeyBtn"></button>
            <button id="configCloudMigrateBtn"></button>
            <button id="configAddBtn"></button>
            <table><tbody id="configurationBody">
                <tr><td>foo</td><td>bar</td><td></td></tr>
                <tr><td>baz</td><td>qux</td><td></td></tr>
                <tr><td>heading</td></tr>
            </tbody></table>
        `;
    });
    it('calls import handler on Import button click', async () => {
        require('../configuration.ui.js');
        const btn = document.getElementById('configImportBtn');
        window.alert = jest.fn();
        btn.click();
        expect(window.alert).toHaveBeenCalledWith(expect.stringMatching(/Import/));
    });
    it('calls export handler on Export button click', async () => {
        require('../configuration.ui.js');
        const btn = document.getElementById('configExportBtn');
        window.alert = jest.fn();
        btn.click();
        expect(window.alert).toHaveBeenCalledWith(expect.stringMatching(/Export/));
    });
    it('calls rekey handler on Rekey button click', async () => {
        require('../configuration.ui.js');
        const btn = document.getElementById('configRekeyBtn');
        window.alert = jest.fn();
        btn.click();
        expect(window.alert).toHaveBeenCalledWith(expect.stringMatching(/rekey/i));
    });
    it('calls cloud migrate handler on Cloud Store Migration button click', async () => {
        require('../configuration.ui.js');
        const btn = document.getElementById('configCloudMigrateBtn');
        window.alert = jest.fn();
        btn.click();
        expect(window.alert).toHaveBeenCalledWith(expect.stringMatching(/cloud store/i));
    });
    it('calls add handler on Add button click', async () => {
        require('../configuration.ui.js');
        const btn = document.getElementById('configAddBtn');
        window.alert = jest.fn();
        btn.click();
        expect(window.alert).toHaveBeenCalledWith(expect.stringMatching(/add/i));
    });
    it('filters configuration rows with search bar', async () => {
        require('../configuration.ui.js');
        const search = document.getElementById('configurationSearch');
        const rows = document.querySelectorAll('#configurationBody tr');
        search.value = 'foo';
        search.dispatchEvent(new Event('input'));
        expect(rows[0].style.display).toBe('');
        expect(rows[1].style.display).toBe('none');
        search.value = 'qux';
        search.dispatchEvent(new Event('input'));
        expect(rows[0].style.display).toBe('none');
        expect(rows[1].style.display).toBe('');
        search.value = '';
        search.dispatchEvent(new Event('input'));
        expect(rows[0].style.display).toBe('');
        expect(rows[1].style.display).toBe('');
    });
});

/**
 * @jest-environment jsdom
 */
import { renderConfigurationTable } from '../configuration.ui.js';
import { Configuration } from '../../modules/configuration.mjs';

describe('Configuration Table UI', () => {
    let tbody;
    let originalConsoleLog;
    beforeEach(() => {
        document.body.innerHTML = `
            <table><tbody id="configurationBody"></tbody></table>
        `;
        tbody = document.getElementById('configurationBody');
        // Mock Configuration
        jest.spyOn(Configuration.prototype, 'Fetch').mockImplementation(async function() {
            this.configuration = {
                testKey: 'testValue',
                nested: { inner: 123 }
            };
        });
        jest.spyOn(Configuration.prototype, 'HasConfig').mockImplementation(function() {
            return !!this.configuration;
        });
        jest.spyOn(Configuration.prototype, 'FlattenObject').mockImplementation(function(obj) {
            return {
                testKey: 'testValue',
                'nested.inner': 123
            };
        });
        originalConsoleLog = console.log;
        console.log = jest.fn();
    });
    afterEach(() => {
        jest.restoreAllMocks();
        console.log = originalConsoleLog;
    });
    it('renders configuration data in hierarchical rows and logs to console', async () => {
        await renderConfigurationTable();
        expect(tbody.innerHTML).toContain('testKey');
        expect(tbody.innerHTML).toContain('testValue');
        expect(tbody.innerHTML).toContain('nested.inner');
        expect(tbody.innerHTML).toContain('123');
        expect(console.log).toHaveBeenCalledWith(
            'Hierarchical Configuration Data:',
            expect.objectContaining({ testKey: 'testValue', 'nested.inner': 123 })
        );
    });
    it('renders edit and delete buttons for each row', async () => {
        await renderConfigurationTable();
        expect(tbody.querySelectorAll('.config-edit-btn').length).toBeGreaterThan(0);
        expect(tbody.querySelectorAll('.config-delete-btn').length).toBeGreaterThan(0);
    });
    it('shows error if fetch fails', async () => {
        jest.spyOn(Configuration.prototype, 'Fetch').mockImplementation(async function() {
            throw new Error('fail');
        });
        await renderConfigurationTable();
        expect(tbody.innerHTML).toContain('Error loading configuration');
    });
    it('shows no data message if config is empty', async () => {
        jest.spyOn(Configuration.prototype, 'HasConfig').mockImplementation(() => false);
        await renderConfigurationTable();
        expect(tbody.innerHTML).toContain('No configuration data found.');
    });
});
