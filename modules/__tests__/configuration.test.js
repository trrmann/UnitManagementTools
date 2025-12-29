import { Configuration } from '../configuration.mjs';

// Mock storage object for testing
class MockStorage {
    constructor() {
        this.data = {};
        this.Cache = { Set: jest.fn(), Get: jest.fn() };
        this.SessionStorage = { Set: jest.fn(), Get: jest.fn() };
        this.Get = jest.fn((filename) => this.data[filename] || undefined);
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
