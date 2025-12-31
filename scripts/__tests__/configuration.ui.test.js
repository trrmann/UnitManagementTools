/**
 * @jest-environment jsdom
 */
describe('Configuration Toolbar Buttons and Search', () => {
    const testConfig = {
        'testKey': 'testValue',
        'nested.inner': 123
    };
    const asyncStorageMock = {
        Get: async () => testConfig,
        Set: async () => {}
    };
    beforeEach(() => {
        document.body.innerHTML = `
            <input id="configurationSearch" />
            <button id="configImportBtn"></button>
            <button id="configExportBtn"></button>
            <button id="configRekeyBtn"></button>
            <button id="configCloudMigrateBtn"></button>
            <button id="configAddBtn"></button>
            <table><tbody id="configurationBody"></tbody></table>
        `;
        window._storageObj = asyncStorageMock;
    });
    it('calls import handler on Import button click', async () => {
        require('../configuration.ui.js');
        await window.renderConfigurationTable(window._storageObj);
        const btn = document.getElementById('configImportBtn');
        window.alert = jest.fn();
        btn.click();
        expect(window.alert).toHaveBeenCalledWith(expect.stringMatching(/Import/));
    });
    it('calls export handler on Export button click', async () => {
        require('../configuration.ui.js');
        await window.renderConfigurationTable(window._storageObj);
        const btn = document.getElementById('configExportBtn');
        window.alert = jest.fn();
        btn.click();
        expect(window.alert).toHaveBeenCalledWith(expect.stringMatching(/Export/));
    });
    it('calls rekey handler on Rekey button click', async () => {
        require('../configuration.ui.js');
        await window.renderConfigurationTable(window._storageObj);
        const btn = document.getElementById('configRekeyBtn');
        window.alert = jest.fn();
        btn.click();
        expect(window.alert).toHaveBeenCalledWith(expect.stringMatching(/rekey/i));
    });
    it('calls cloud migrate handler on Cloud Store Migration button click', async () => {
        require('../configuration.ui.js');
        await window.renderConfigurationTable(window._storageObj);
        const btn = document.getElementById('configCloudMigrateBtn');
        window.alert = jest.fn();
        btn.click();
        expect(window.alert).toHaveBeenCalledWith(expect.stringMatching(/cloud store/i));
    });
    it('calls add handler on Add button click', async () => {
        require('../configuration.ui.js');
        await window.renderConfigurationTable(window._storageObj);
        const btn = document.getElementById('configAddBtn');
        window.alert = jest.fn();
        btn.click();
        expect(window.alert).toHaveBeenCalledWith(expect.stringMatching(/add/i));
    });
    it('filters configuration rows with search bar', async () => {
        require('../configuration.ui.js');
        await window.renderConfigurationTable(window._storageObj);
        const search = document.getElementById('configurationSearch');
        const rows = document.querySelectorAll('#configurationBody tr');
        // Find value rows by their first cell contents
        const valueRows = Array.from(rows).filter(row => row.children.length === 3);
        // Log DOM for debugging
        // eslint-disable-next-line no-console
        console.log('Rendered rows:', Array.from(rows).map(row => row.textContent));
        const testKeyRow = valueRows.find(row => row.children[0].textContent.trim() === 'testKey');
        const innerRow = valueRows.find(row => row.children[0].textContent.trim() === 'inner');
        if (!testKeyRow || !innerRow) {
            throw new Error('Expected configuration value rows not found in DOM. Rendered rows: ' + Array.from(rows).map(row => row.textContent).join(' | '));
        }
        // Search for 'testKey' (should show testKeyRow, hide innerRow)
        search.value = 'testKey';
        search.dispatchEvent(new Event('input'));
        expect(testKeyRow.style.display).toBe('');
        expect(innerRow.style.display).toBe('none');
        // Search for 'inner' (should show innerRow, hide testKeyRow)
        search.value = 'inner';
        search.dispatchEvent(new Event('input'));
        expect(testKeyRow.style.display).toBe('none');
        expect(innerRow.style.display).toBe('');
        // Clear search (should show both)
        search.value = '';
        search.dispatchEvent(new Event('input'));
        expect(testKeyRow.style.display).toBe('');
        expect(innerRow.style.display).toBe('');
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
    const asyncStorageMock = {
        Get: async () => ({}),
        Set: async () => {}
    };
    beforeEach(() => {
        document.body.innerHTML = `
            <table><tbody id="configurationBody"></tbody></table>
        `;
        tbody = document.getElementById('configurationBody');
        // Mock Configuration
        jest.spyOn(Configuration.prototype, 'Fetch').mockImplementation(async function() {
            this._storageObj = asyncStorageMock;
            this.configuration = {
                testKey: 'testValue',
                nested: { inner: 123 }
            };
        });
        jest.spyOn(Configuration.prototype, 'HasConfig').mockImplementation(function() {
            this._storageObj = asyncStorageMock;
            return !!this.configuration;
        });
        jest.spyOn(Configuration.prototype, 'FlattenObject').mockImplementation(function(obj) {
            this._storageObj = asyncStorageMock;
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
        await renderConfigurationTable(window._storageObj);
        expect(tbody.innerHTML).toContain('testKey');
        expect(tbody.innerHTML).toContain('testValue');
        expect(tbody.innerHTML).toContain('nested.inner');
        expect(tbody.innerHTML).toContain('123');
    });
    it('renders edit and delete buttons for each row', async () => {
        await renderConfigurationTable(window._storageObj);
        expect(tbody.querySelectorAll('.config-edit-btn').length).toBeGreaterThan(0);
        expect(tbody.querySelectorAll('.config-delete-btn').length).toBeGreaterThan(0);
    });
    it('shows error if fetch fails', async () => {
        jest.spyOn(Configuration.prototype, 'Fetch').mockImplementation(async function() {
            throw new Error('fail');
        });
        await renderConfigurationTable(window._storageObj);
        expect(tbody.innerHTML).toContain('Error loading configuration');
    });
    it('shows no data message if config is empty', async () => {
        jest.spyOn(Configuration.prototype, 'HasConfig').mockImplementation(() => false);
        await renderConfigurationTable(window._storageObj);
        expect(tbody.innerHTML).toContain('No configuration data found.');
    });
});
