// Unit tests for Testing tab UI logic
import { resetCache, resetSessionStorage, resetLocalStorage, resetCloudStorage } from '../testing.ui.js';

describe('Testing Tab UI', () => {
    beforeEach(() => {
        document.body.innerHTML = `
            <div class="section-toolbar testing-toolbar improved-toolbar">
                <div class="testing-toolbar-row">
                    <button class="btn-primary" id="resetCacheBtn">Reset Cache</button>
                    <button class="btn-primary" id="resetSessionStorageBtn">Reset Session Storage</button>
                    <button class="btn-primary" id="resetLocalStorageBtn">Reset Local Storage</button>
                    <button class="btn-primary" id="resetCloudStorageBtn">Reset Cloud Storage</button>
                </div>
            </div>
        `;
        window.alert = jest.fn();
    });

    it('resetCache triggers modal/alert', () => {
        resetCache();
        expect(window.alert).toHaveBeenCalledWith('Cache reset triggered.');
    });

    it('resetSessionStorage triggers modal/alert', () => {
        resetSessionStorage();
        expect(window.alert).toHaveBeenCalledWith('Session Storage reset triggered.');
    });

    it('resetLocalStorage triggers modal/alert', () => {
        resetLocalStorage();
        expect(window.alert).toHaveBeenCalledWith('Local Storage reset triggered.');
    });

    it('resetCloudStorage triggers modal/alert', () => {
        resetCloudStorage();
        expect(window.alert).toHaveBeenCalledWith('Cloud Storage reset triggered.');
    });

    it('reset buttons call correct handlers on click', () => {
        require('../testing.ui.js');
        document.getElementById('resetCacheBtn').click();
        expect(window.alert).toHaveBeenCalledWith('Cache reset triggered.');
        document.getElementById('resetSessionStorageBtn').click();
        expect(window.alert).toHaveBeenCalledWith('Session Storage reset triggered.');
        document.getElementById('resetLocalStorageBtn').click();
        expect(window.alert).toHaveBeenCalledWith('Local Storage reset triggered.');
        document.getElementById('resetCloudStorageBtn').click();
        expect(window.alert).toHaveBeenCalledWith('Cloud Storage reset triggered.');
    });
});
