import { Roles } from '../roles.mjs';

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

describe('Roles', () => {

        test('Fetch writes to all storage tiers when missing', async () => {
            // Arrange: mock storage with all Get returning undefined, Set as jest.fn
            const storage = new MockStorage();
            storage.LocalStorage = { Set: jest.fn() };
            storage.SessionStorage = { Set: jest.fn() };
            storage.Cache = { Set: jest.fn() };
            storage.constructor = { name: 'GoogleDrive' };
            storage.Set = jest.fn(async () => {});
            // Simulate GitHub fallback
            storage._gitHubDataObj = { fetchJsonFile: jest.fn(async () => ({ roles: [{ foo: 'bar' }] })) };
            storage.Get = jest.fn(async () => undefined);
            const callings = { storage };
            const roles = new Roles({ _storageObj: storage });
            roles.callings = callings;
            // Act
            await roles.Fetch();
            // Assert: roles written to all tiers
            expect(storage.Set).toHaveBeenCalledWith(Roles.RolesFilename, { roles: [{ foo: 'bar' }] }, expect.any(Object));
            expect(storage.LocalStorage.Set).toHaveBeenCalledWith(Roles.RolesFilename, { roles: [{ foo: 'bar' }] }, Roles.RolesLocalExpireMS);
            expect(storage.SessionStorage.Set).toHaveBeenCalledWith(Roles.RolesFilename, { roles: [{ foo: 'bar' }] }, Roles.RolesSessionExpireMS);
            expect(storage.Cache.Set).toHaveBeenCalledWith(Roles.RolesFilename, { roles: [{ foo: 'bar' }] }, Roles.RolesCacheExpireMS);
            expect(roles.roles).toEqual({ roles: [{ foo: 'bar' }] });
        });

        test('Fetch does not overwrite tiers where roles already exists', async () => {
            // Arrange: mock storage with Get returning roles for local, undefined for others
            const storage = new MockStorage();
            storage.LocalStorage = { Set: jest.fn() };
            storage.SessionStorage = { Set: jest.fn() };
            storage.Cache = { Set: jest.fn() };
            storage.constructor = { name: 'GoogleDrive' };
            storage.Set = jest.fn(async () => {});
            storage._gitHubDataObj = { fetchJsonFile: jest.fn(async () => ({ roles: [{ foo: 'bar' }] })) };
            let call = 0;
            storage.Get = jest.fn(async () => {
                call++;
                if (call === 1) return undefined; // cache
                if (call === 2) return undefined; // session
                if (call === 3) return { roles: [{ foo: 'bar' }] }; // local
                return undefined; // google/github
            });
            const callings = { storage };
            const roles = new Roles({ _storageObj: storage });
            roles.callings = callings;
            // Act
            await roles.Fetch();
            // Assert: only missing tiers are written
            expect(storage.Set).not.toHaveBeenCalled(); // Not called, not GoogleDrive
            expect(storage.LocalStorage.Set).not.toHaveBeenCalled(); // Already found in local
            expect(storage.SessionStorage.Set).toHaveBeenCalledWith(Roles.RolesFilename, { roles: [{ foo: 'bar' }] }, Roles.RolesSessionExpireMS);
            expect(storage.Cache.Set).toHaveBeenCalledWith(Roles.RolesFilename, { roles: [{ foo: 'bar' }] }, Roles.RolesCacheExpireMS);
            expect(roles.roles).toEqual({ roles: [{ foo: 'bar' }] });
        });
    let storage;
    let roles;

    beforeEach(() => {
        storage = new MockStorage();
        roles = new Roles({ _storageObj: storage });
        // Provide a Callings instance with storage for Roles.Storage getter
        roles.callings = { storage };
    });

    test('constructor initializes storage and roles', () => {
        expect(roles.Storage).toBe(storage);
        expect(roles.Roles).toBeUndefined();
    });

    // Add more tests after refactor
});
