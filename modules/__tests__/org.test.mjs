import { Org } from '../org.mjs';

// Mock storage object for testing
class MockStorage {
    constructor() {
        this.data = {};
        this.Cache = { Set: jest.fn(), Get: jest.fn() };
        this.SessionStorage = { Set: jest.fn(), Get: jest.fn() };
        this.LocalStorage = { Set: jest.fn(), Get: jest.fn() };
        this.Get = jest.fn(async (filename) => this.data[filename] || undefined);
        this.Set = jest.fn(async (filename, value) => { this.data[filename] = value; });
    }
}

describe('Org', () => {

        test('Fetch writes to all storage tiers when missing', async () => {
            // Arrange: mock storage with all Get returning undefined, Set as jest.fn
            const storage = new MockStorage();
            storage.LocalStorage = { Set: jest.fn() };
            storage.SessionStorage = { Set: jest.fn() };
            storage.Cache = { Set: jest.fn() };
            storage.constructor = { name: 'GoogleDrive' };
            storage.Set = jest.fn(async () => {});
            // Simulate GitHub fallback
            storage._gitHubDataObj = { fetchJsonFile: jest.fn(async () => ({ foo: 'bar' })) };
            storage.Get = jest.fn(async () => undefined);
            const org = new Org({ _storageObj: storage });
            // Act
            await org.Fetch();
            // Assert: org written to all tiers
            expect(storage.Set).toHaveBeenCalledWith(Org.OrgFilename, { foo: 'bar' }, expect.any(Object));
            expect(storage.LocalStorage.Set).toHaveBeenCalledWith(Org.OrgFilename, { foo: 'bar' }, Org.OrgLocalExpireMS);
            expect(storage.SessionStorage.Set).toHaveBeenCalledWith(Org.OrgFilename, { foo: 'bar' }, Org.OrgSessionExpireMS);
            expect(storage.Cache.Set).toHaveBeenCalledWith(Org.OrgFilename, { foo: 'bar' }, Org.OrgCacheExpireMS);
            expect(org.Organization).toEqual({ foo: 'bar' });
        });

        test('Fetch does not overwrite tiers where org already exists', async () => {
            // Arrange: mock storage with Get returning org for local, undefined for others
            const storage = new MockStorage();
            storage.LocalStorage = { Set: jest.fn() };
            storage.SessionStorage = { Set: jest.fn() };
            storage.Cache = { Set: jest.fn() };
            storage.constructor = { name: 'GoogleDrive' };
            storage.Set = jest.fn(async () => {});
            storage._gitHubDataObj = { fetchJsonFile: jest.fn(async () => ({ foo: 'bar' })) };
            let call = 0;
            storage.Get = jest.fn(async () => {
                call++;
                if (call === 1) return undefined; // cache
                if (call === 2) return undefined; // session
                if (call === 3) return { foo: 'bar' }; // local
                return undefined; // google/github
            });
            const org = new Org({ _storageObj: storage });
            // Act
            await org.Fetch();
            // Assert: only missing tiers are written
            expect(storage.Set).not.toHaveBeenCalled(); // Not called, not GoogleDrive
            expect(storage.LocalStorage.Set).not.toHaveBeenCalled(); // Already found in local
            expect(storage.SessionStorage.Set).toHaveBeenCalledWith(Org.OrgFilename, { foo: 'bar' }, Org.OrgSessionExpireMS);
            expect(storage.Cache.Set).toHaveBeenCalledWith(Org.OrgFilename, { foo: 'bar' }, Org.OrgCacheExpireMS);
            expect(org.Organization).toEqual({ foo: 'bar' });
        });
    let storage;
    let org;

    beforeEach(() => {
        storage = new MockStorage();
        org = new Org({ _storageObj: storage });
    });

    test('constructor initializes storage and organization', () => {
        expect(org.Storage).toBe(storage);
        expect(org.Organization).toBeUndefined();
    });

    // Add more tests after refactor
});
