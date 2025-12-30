/**
 * @jest-environment jsdom
 */
// scripts/__tests__/eventscheduletemplate.ui.test.js
import * as eventSchedule from '../eventscheduletemplate.ui.js';

describe('Event Schedule Template Tab', () => {
    beforeEach(() => {
        document.body.innerHTML = `
            <div class="section-toolbar eventscheduletemplate-toolbar improved-toolbar">
                <div class="eventscheduletemplate-toolbar-row">
                    <input type="text" id="eventscheduletemplateSearch" class="eventscheduletemplate-search" placeholder="Search event schedule templates..." />
                    <div class="eventscheduletemplate-toolbar-buttons">
                        <button class="btn-secondary" id="eventscheduletemplateImportBtn">Import</button>
                        <button class="btn-secondary" id="eventscheduletemplateExportBtn">Export</button>
                        <button class="btn-primary eventschedule-AddTemplate" id="eventscheduletemplateAddBtn">Add</button>
                    </div>
                </div>
            </div>
            <table><tbody id="eventscheduletemplateBody"></tbody></table>
        `;
        window.alert = jest.fn();
        // Mock __setAllEventScheduleTemplates for tests
        window.__setAllEventScheduleTemplates = arr => {
            // This will be replaced by the UI module's implementation after import
        };
        jest.resetModules();
        require('../eventscheduletemplate.ui.js');
        // Manually dispatch DOMContentLoaded to attach event handlers
        document.dispatchEvent(new Event('DOMContentLoaded', { bubbles: true }));
    });
    test('import button triggers import handler', () => {
        const importBtn = document.getElementById('eventscheduletemplateImportBtn');
        importBtn.click();
        expect(window.alert).toHaveBeenCalledWith('Import Event Schedule Templates functionality goes here.');
    });

    test('export button triggers export handler', () => {
        const exportBtn = document.getElementById('eventscheduletemplateExportBtn');
        exportBtn.click();
        expect(window.alert).toHaveBeenCalledWith('Export Event Schedule Templates functionality goes here.');
    });

    test('add button triggers openAddEventScheduleTemplate', () => {
        // Spy on the real function
        const spy = jest.spyOn(window, 'openAddEventScheduleTemplate');
        const addBtn = document.getElementById('eventscheduletemplateAddBtn');
        addBtn.click();
        expect(spy).toHaveBeenCalled();
        spy.mockRestore();
    });

    test('search bar filters event schedule template table', () => {
        const { renderEventScheduleTemplateTable } = require('../eventscheduletemplate.ui.js');
        window.__setAllEventScheduleTemplates([
            { name: 'Ward Council Meeting', description: 'Monthly leadership meeting' },
            { name: 'Bishopric Meeting', description: 'Weekly bishopric planning' }
        ]);
        renderEventScheduleTemplateTable();
        const searchInput = document.getElementById('eventscheduletemplateSearch');
        searchInput.value = 'bishopric';
        // Trigger input event and allow DOM update
        const event = new Event('input', { bubbles: true });
        searchInput.dispatchEvent(event);
        // The filter logic is async due to event loop, so check after a tick
        const rows = document.querySelectorAll('#eventscheduletemplateBody tr');
        // If filtering is not async, this will work; otherwise, wrap in setTimeout or use async/await
        expect(Array.from(rows).some(row => row.innerHTML.includes('Bishopric Meeting'))).toBe(true);
        expect(Array.from(rows).some(row => row.innerHTML.includes('Ward Council Meeting'))).toBe(false);
    });

    test('renders static templates to table', () => {
        eventSchedule.renderEventScheduleTemplateTable();
        const rows = document.querySelectorAll('#eventscheduletemplateBody tr');
        expect(rows.length).toBe(2);
        expect(rows[0].textContent).toContain('Ward Council Meeting');
        expect(rows[1].textContent).toContain('Bishopric Meeting');
    });

    test('openAddEventScheduleTemplate triggers alert', () => {
        window.alert = jest.fn();
        window.openAddEventScheduleTemplate();
        expect(window.alert).toHaveBeenCalledWith('Add Event Schedule Template (not yet implemented)');
    });

    test('editEventScheduleTemplate triggers alert', () => {
        window.alert = jest.fn();
        window.editEventScheduleTemplate(1);
        expect(window.alert).toHaveBeenCalledWith('Edit Event Schedule Template #1 (not yet implemented)');
    });

    test('deleteEventScheduleTemplate triggers alert', () => {
        window.alert = jest.fn();
        window.deleteEventScheduleTemplate(0);
        expect(window.alert).toHaveBeenCalledWith('Delete Event Schedule Template #0 (not yet implemented)');
    });
});
