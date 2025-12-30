import { Configuration } from '../configuration.mjs';

// Mock storage object for testing
class MockStorage {
    constructor() {
        this.data = {};
        this.Cache = { Set: jest.fn(), Get: jest.fn() };
        this.SessionStorage = { Set: jest.fn(), Get: jest.fn() };
        this.LocalStorage = { Set: jest.fn(), Get: jest.fn() };
        // All Get/Set must be async for Configuration
        this.Get = jest.fn(async (filename) => this.data[filename] || undefined);
        this.Set = jest.fn(async (filename, value) => { this.data[filename] = value; });
    }
}

describe('Configuration', () => {
    let storage;
    let config;

    beforeEach(() => {
        storage = new MockStorage();
        config = new Configuration(storage);
    });

    test('constructor initializes storage and configuration', () => {
        expect(config.Storage).toBe(storage);
        expect(config.Config).toBeUndefined();
    });

    test('CopyFromJSON and CopyToJSON work as expected', () => {
        const json = { _storageObj: storage, configuration: { a: 1 } };
        const instance = Configuration.CopyFromJSON(json);
        expect(instance.Storage).toBe(storage);
        expect(instance.Config).toEqual({ a: 1 });
        const out = Configuration.CopyToJSON(instance);
        expect(out._storageObj).toBe(storage);
        expect(out.configuration).toEqual({ a: 1 });
    });

    test('CopyFromObject copies properties', () => {
        const dest = new Configuration(storage);
        const src = { _storageObj: storage, configuration: { b: 2 } };
        Configuration.CopyFromObject(dest, src);
        expect(dest.Storage).toBe(storage);
        expect(dest.Config).toEqual({ b: 2 });
    });

    test('Factory calls Fetch and returns config', async () => {
        storage.data[Configuration.ConfigFilename] = { c: 3 };
        const instance = await Configuration.Factory(storage);
        expect(instance.Config).toEqual({ c: 3 });
    });

    test('FlattenObject flattens nested objects', () => {
        const nested = { a: { b: { c: 1 } } };
        const flat = config.FlattenObject(nested);
        expect(flat).toEqual({ 'a.b.c': 1 });
    });

    test('HasConfig returns true if config exists', () => {
        config.configuration = { x: 1 };
        expect(config.HasConfig()).toBe(true);
    });

    test('HasConfigByKey returns true if key exists', () => {
        config.configuration = { y: 2 };
        config._buildCache();
        expect(config.HasConfigByKey('y')).toBe(true);
    });

    test('GetConfigKeys returns keys of configuration', () => {
        config.configuration = { a: 1, b: 2 };
        expect(config.GetConfigKeys()).toEqual(['a', 'b']);
    });
});
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
        const config = new Configuration(storage);
        // Act
        await config.Fetch();
        // Assert: config written to all tiers
        expect(storage.Set).toHaveBeenCalledWith(Configuration.ConfigFilename, { foo: 'bar' }, expect.any(Object));
        expect(storage.LocalStorage.Set).toHaveBeenCalledWith(Configuration.ConfigFilename, { foo: 'bar' }, Configuration.ConfigLocalExpireMS);
        expect(storage.SessionStorage.Set).toHaveBeenCalledWith(Configuration.ConfigFilename, { foo: 'bar' }, Configuration.ConfigSessionExpireMS);
        expect(storage.Cache.Set).toHaveBeenCalledWith(Configuration.ConfigFilename, { foo: 'bar' }, Configuration.ConfigCacheExpireMS);
        expect(config.Config).toEqual({ foo: 'bar' });
    });

    test('Fetch does not overwrite tiers where config already exists', async () => {
        // Arrange: mock storage with Get returning config for local, undefined for others
        const storage = new MockStorage();
        storage.LocalStorage = { Set: jest.fn() };
        storage.SessionStorage = { Set: jest.fn() };
        storage.Cache = { Set: jest.fn() };
        storage.constructor = { name: 'GoogleDrive' };
        storage.Set = jest.fn(async () => {});
        storage._gitHubDataObj = { fetchJsonFile: jest.fn(async () => ({ foo: 'bar' })) };
        // Only local returns config
        let call = 0;
        storage.Get = jest.fn(async () => {
            call++;
            if (call === 1) return undefined; // cache
            if (call === 2) return undefined; // session
            if (call === 3) return { foo: 'bar' }; // local
            return undefined; // google/github
        });
        const config = new Configuration(storage);
        // Act
        await config.Fetch();
        // Assert: only missing tiers are written
        expect(storage.Set).not.toHaveBeenCalled(); // Not called, not GoogleDrive
        expect(storage.LocalStorage.Set).not.toHaveBeenCalled(); // Already found in local
        expect(storage.SessionStorage.Set).toHaveBeenCalledWith(Configuration.ConfigFilename, { foo: 'bar' }, Configuration.ConfigSessionExpireMS);
        expect(storage.Cache.Set).toHaveBeenCalledWith(Configuration.ConfigFilename, { foo: 'bar' }, Configuration.ConfigCacheExpireMS);
        expect(config.Config).toEqual({ foo: 'bar' });
    });
