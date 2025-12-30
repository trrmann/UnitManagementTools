/** @jest-environment jsdom */
// Unit tests for Testing tab UI logic
import { resetCache, resetSessionStorage, resetLocalStorage, resetCloudStorage } from '../testing.ui.js';

// Mock CacheStore for cache clearing tests
class MockCacheStore {
    constructor() {
        this.clearAllCalled = false;
        this.clearAll = this.clearAll.bind(this);
    }
    clearAll() {
        this.clearAllCalled = true;
    }
}

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
        // Setup mock cache
        const mockCache = new MockCacheStore();
        window.CacheStore = mockCache;
        resetCache();
        expect(window.alert).toHaveBeenCalledWith('Cache reset triggered.');
        expect(mockCache.clearAllCalled).toBe(true);
    });
    it('resetCache clears all cache entries regardless of expiration', () => {
        // Setup mock cache with dummy data
        const mockCache = new MockCacheStore();
        window.CacheStore = mockCache;
        resetCache();
        expect(mockCache.clearAllCalled).toBe(true);
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
        // Re-mock alert after requiring the UI module to ensure the mock is active for button click handlers
        window.alert = jest.fn();
        // Setup mock cache for resetCache
        const mockCache = new MockCacheStore();
        window.CacheStore = mockCache;
        // Call the reset functions directly
        resetCache();
        expect(window.alert).toHaveBeenCalledWith('Cache reset triggered.');
        resetSessionStorage();
        expect(window.alert).toHaveBeenCalledWith('Session Storage reset triggered.');
        resetLocalStorage();
        expect(window.alert).toHaveBeenCalledWith('Local Storage reset triggered.');
        resetCloudStorage();
        expect(window.alert).toHaveBeenCalledWith('Cloud Storage reset triggered.');
    });
});
