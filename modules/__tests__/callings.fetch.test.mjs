import { Callings } from '../callings.mjs';

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

describe('Callings', () => {

        test('Fetch writes to all storage tiers when missing', async () => {
            // Arrange: mock storage with all Get returning undefined, Set as jest.fn
            const storage = new MockStorage();
            storage.LocalStorage = { Set: jest.fn() };
            storage.SessionStorage = { Set: jest.fn() };
            storage.Cache = { Set: jest.fn() };
            storage.constructor = { name: 'GoogleDrive' };
            storage.Set = jest.fn(async () => {});
            // Simulate GitHub fallback
            storage._gitHubDataObj = { fetchJsonFile: jest.fn(async () => ([{ foo: 'bar' }])) };
            storage.Get = jest.fn(async () => undefined);
            const callings = new Callings({ _storageObj: storage });
            // Act
            await callings.Fetch();
            // Assert: callings written to all tiers
            expect(storage.Set).toHaveBeenCalledWith(Callings.CallingsFilename, [{ foo: 'bar' }], expect.any(Object));
            expect(storage.LocalStorage.Set).toHaveBeenCalledWith(Callings.CallingsFilename, [{ foo: 'bar' }], Callings.CallingsLocalExpireMS);
            expect(storage.SessionStorage.Set).toHaveBeenCalledWith(Callings.CallingsFilename, [{ foo: 'bar' }], Callings.CallingsSessionExpireMS);
            expect(storage.Cache.Set).toHaveBeenCalledWith(Callings.CallingsFilename, [{ foo: 'bar' }], Callings.CallingsCacheExpireMS);
            expect(callings.callings).toEqual([{ foo: 'bar' }]);
        });

        test('Fetch does not overwrite tiers where callings already exists', async () => {
            // Arrange: mock storage with Get returning callings for local, undefined for others
            const storage = new MockStorage();
            storage.LocalStorage = { Set: jest.fn() };
            storage.SessionStorage = { Set: jest.fn() };
            storage.Cache = { Set: jest.fn() };
            storage.constructor = { name: 'GoogleDrive' };
            storage.Set = jest.fn(async () => {});
            storage._gitHubDataObj = { fetchJsonFile: jest.fn(async () => ([{ foo: 'bar' }])) };
            let call = 0;
            storage.Get = jest.fn(async () => {
                call++;
                if (call === 1) return undefined; // cache
                if (call === 2) return undefined; // session
                if (call === 3) return [{ foo: 'bar' }]; // local
                return undefined; // google/github
            });
            const callings = new Callings({ _storageObj: storage });
            // Act
            await callings.Fetch();
            // Assert: only missing tiers are written
            expect(storage.Set).not.toHaveBeenCalled(); // Not called, not GoogleDrive
            expect(storage.LocalStorage.Set).not.toHaveBeenCalled(); // Already found in local
            expect(storage.SessionStorage.Set).toHaveBeenCalledWith(Callings.CallingsFilename, [{ foo: 'bar' }], Callings.CallingsSessionExpireMS);
            expect(storage.Cache.Set).toHaveBeenCalledWith(Callings.CallingsFilename, [{ foo: 'bar' }], Callings.CallingsCacheExpireMS);
            expect(callings.callings).toEqual([{ foo: 'bar' }]);
        });
    let storage;
    let callings;

    beforeEach(() => {
        storage = new MockStorage();
        callings = new Callings({ _storageObj: storage });
    });

    test('constructor initializes storage and callings', () => {
        expect(callings.Storage).toBe(storage);
        expect(callings.callings).toBeUndefined();
    });

    // Add more tests after refactor
});
