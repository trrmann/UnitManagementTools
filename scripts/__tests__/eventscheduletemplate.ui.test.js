/**
 * @jest-environment jsdom
 */
// scripts/__tests__/eventscheduletemplate.ui.test.js
import * as eventSchedule from '../eventscheduletemplate.ui.js';

describe('Event Schedule Template Tab', () => {
    beforeEach(() => {
        // Set up DOM for table
        document.body.innerHTML = `
            <table><tbody id="eventscheduletemplateBody"></tbody></table>
        `;
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
