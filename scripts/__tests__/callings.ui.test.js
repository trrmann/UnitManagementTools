/**
 * @jest-environment jsdom
 */
// Unit tests for Callings tab UI logic
import { renderCallingsTable, openAddCalling, renderCallingsFromClass } from '../callings.ui.js';

describe('Callings Tab UI', () => {
    beforeEach(() => {
        document.body.innerHTML = `
            <div class="section-toolbar callings-toolbar improved-toolbar">
                <div class="callings-toolbar-row">
                    <input type="text" id="callingsSearch" class="callings-search" placeholder="Search callings..." />
                    <div class="callings-toolbar-buttons">
                        <button class="btn-secondary" id="callingsImportBtn">Import</button>
                        <button class="btn-secondary" id="callingsExportBtn">Export</button>
                        <button class="btn-secondary" id="callingsSyncBtn">Sync</button>
                        <button class="btn-primary callings-AddCalling" id="callingsAddBtn">Add</button>
                    </div>
                </div>
            </div>
            <table><tbody id="callingsBody"></tbody></table>
        `;
        global.alert = jest.fn();
        global.editCalling = jest.fn((id) => alert('Edit calling: ' + id));
        global.deleteCalling = jest.fn((id) => alert('Delete calling: ' + id));
    });
    it('import button triggers import handler', () => {
        require('../callings.ui.js'); // Ensure event listeners are attached
        const importBtn = document.getElementById('callingsImportBtn');
        importBtn.click();
        expect(global.alert).toHaveBeenCalledWith(expect.stringMatching(/Import Callings/));
    });

    it('export button triggers export handler', () => {
        require('../callings.ui.js');
        const exportBtn = document.getElementById('callingsExportBtn');
        exportBtn.click();
        expect(global.alert).toHaveBeenCalledWith(expect.stringMatching(/Export Callings/));
    });

    it('sync button triggers sync handler and reloads table', async () => {
        require('../callings.ui.js');
        const syncBtn = document.getElementById('callingsSyncBtn');
        // Mock Callings class
        const mockCallings = [ { id: 1, name: 'SyncTest', member: 'Test', active: true } ];
        jest.spyOn(require('../callings.ui.js'), 'renderCallingsTable').mockImplementation(() => {});
        global.Storage = { Get: jest.fn(async () => mockCallings) };
        syncBtn.click();
        // Wait for async
        await new Promise(r => setTimeout(r, 10));
        expect(global.alert).toHaveBeenCalledWith('Callings synced!');
    });

    it('add button triggers openAddCalling', () => {
        require('../callings.ui.js');
        const addBtn = document.getElementById('callingsAddBtn');
        addBtn.onclick = () => openAddCalling();
        addBtn.click();
        expect(global.alert).toHaveBeenCalled();
    });

    it('search bar filters callings table', () => {
        // Setup table and callings
        const { renderCallingsTable } = require('../callings.ui.js');
        const callings = [
            { id: 1, name: 'Bishop', member: 'John Doe', active: true },
            { id: 2, name: 'Clerk', member: 'Jane Smith', active: false }
        ];
        renderCallingsTable(callings);
        const searchInput = document.getElementById('callingsSearch');
        searchInput.value = 'bishop';
        const event = new Event('input', { bubbles: true });
        searchInput.dispatchEvent(event);
        // Only Bishop row should be visible
        const rows = document.querySelectorAll('#callingsBody tr');
        expect(rows.length).toBe(1);
        expect(rows[0].innerHTML).toContain('Bishop');
    });

    it('displays callings data from the Callings class (integration)', async () => {
        // Mock Storage with callings data
        const mockCallings = [
            { id: 201, name: 'President', member: 'Alice', active: true },
            { id: 202, name: 'Secretary', member: 'Bob', active: true }
        ];
        const mockStorage = {
            Get: jest.fn(async () => mockCallings),
            Cache: { Set: jest.fn() },
            SessionStorage: { Set: jest.fn() },
            _gitHubDataObj: { fetchJsonFile: jest.fn() }
        };
        await renderCallingsFromClass(mockStorage);
        const rows = document.querySelectorAll('#callingsBody tr');
        expect(rows.length).toBe(2);
        expect(rows[0].innerHTML).toContain('President');
        expect(rows[1].innerHTML).toContain('Secretary');
    });

    it('renders callings from Callings class (integration)', async () => {
        // Mock Storage with callings data
        const mockCallings = [
            { id: 10, name: 'Elder', member: 'Eli Brown', active: true },
            { id: 11, name: 'Teacher', member: 'Tina White', active: false }
        ];
        const mockStorage = {
            Get: jest.fn(async () => mockCallings),
            Cache: { Set: jest.fn() },
            SessionStorage: { Set: jest.fn() },
            _gitHubDataObj: { fetchJsonFile: jest.fn() }
        };
        await renderCallingsFromClass(mockStorage);
        const rows = document.querySelectorAll('#callingsBody tr');
        expect(rows.length).toBe(2);
        expect(rows[0].innerHTML).toContain('Elder');
        expect(rows[1].innerHTML).toContain('Teacher');
    });

    it('renders callings table with provided callings and buttons', () => {
        const callings = [
            { id: 1, name: 'Bishop', member: 'John Doe', active: true },
            { id: 2, name: 'Clerk', member: 'Jane Smith', active: false }
        ];
        renderCallingsTable(callings);
        const rows = document.querySelectorAll('#callingsBody tr');
        expect(rows.length).toBe(2);
        expect(rows[0].innerHTML).toContain('Bishop');
        expect(rows[1].innerHTML).toContain('Clerk');
        // Buttons present
        expect(rows[0].querySelector('.callings-edit-btn')).toBeTruthy();
        expect(rows[0].querySelector('.callings-delete-btn')).toBeTruthy();
    });

    it('edit button triggers editCalling', () => {
        const callings = [ { id: 1, name: 'Bishop', member: 'John Doe', active: true } ];
        renderCallingsTable(callings);
        const editBtn = document.querySelector('.callings-edit-btn');
        editBtn.click();
        expect(global.alert).toHaveBeenCalledWith('Edit calling: 1');
    });

    it('delete button triggers deleteCalling', () => {
        const callings = [ { id: 2, name: 'Clerk', member: 'Jane Smith', active: false } ];
        renderCallingsTable(callings);
        const delBtn = document.querySelector('.callings-delete-btn');
        delBtn.click();
        expect(global.alert).toHaveBeenCalledWith('Delete calling: 2');
    });

    it('renders empty table if no callings', () => {
        renderCallingsTable([]);
        const rows = document.querySelectorAll('#callingsBody tr');
        expect(rows.length).toBe(0);
    });

    it('openAddCalling triggers modal/alert', () => {
        openAddCalling();
        expect(global.alert).toHaveBeenCalled();
    });
});
