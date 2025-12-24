
export class Configuration {
    // ===== Instance Accessors =====
    get Storage() { return this._storageObj; }
    get Config() { return this.configuration; }

    // ===== Constructor =====
    constructor(storageObject) {
        this._storageObj = storageObject;
        this.configuration = undefined;
    }

    // ===== Static Methods =====
    static CopyFromJSON(dataJSON) {
        const config = new Configuration(dataJSON._storageObj);
        config.configuration = dataJSON.configuration;
        return config;
    }

    static CopyToJSON(instance) {
        return {
            _storageObj: instance._storageObj,
            configuration: instance.configuration
        };
    }

    static CopyFromObject(destination, source) {
        destination._storageObj = source._storageObj;
        destination.configuration = source.configuration;
    }

    static async Factory(storageObject) {
        const config = new Configuration(storageObject);
        await config.Fetch();
        return config;
    }

    // ===== File/Storage Accessors =====
    static get ConfigFileBasename() { return "configuration"; }
    static get ConfigFileExtension() { return "json"; }
    static get ConfigFilename() { return `${Configuration.ConfigFileBasename}.${Configuration.ConfigFileExtension}`; }
    static get ConfigCacheExpireMS() { return 1000 * 60 * 30; }
    static get ConfigSessionExpireMS() { return 1000 * 60 * 60; }
    static get ConfigLocalExpireMS() { return 1000 * 60 * 60 * 2; }
    static get StorageConfig() {
        return {
            cacheTtlMs: Configuration.ConfigCacheExpireMS,
            sessionTtlMs: Configuration.ConfigSessionExpireMS,
            localTtlMs: Configuration.ConfigLocalExpireMS,
            googleId: null,
            githubFilename: null,
            privateKey: null,
            publicKey: null,
            secure: false
        };
    }

    // ===== Data Fetching =====
    async Fetch() {
        let configObj = await this._storageObj.Get(Configuration.ConfigFilename, Configuration.StorageConfig);
        this.configuration = configObj ? configObj : undefined;
    }

    // ===== Utility Methods =====
    FlattenObject(obj, parentKey = '', separator = '.') {
        const result = {};
        for (const key in obj) {
            if (Object.prototype.hasOwnProperty.call(obj, key)) {
                const newKey = parentKey ? `${parentKey}${separator}${key}` : key;
                const value = obj[key];
                if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
                    Object.assign(result, this.FlattenObject(value, newKey, separator));
                } else {
                    result[newKey] = value;
                }
            }
        }
        return result;
    }

    GetConfigByKey(key) {
        if (!this._keyMap) this._buildCache();
        const c = this._keyMap.get(key);
        return c ? [c] : [];
    }

    HasConfig() {
        return !!this.configuration && Object.keys(this.configuration).length > 0;
    }

    HasConfigByKey(key) {
        const configByKey = this.GetConfigByKey(key);
        return configByKey !== null && configByKey.length > 0;
    }

    GetConfigKeys() {
        return this.configuration ? Object.keys(this.configuration) : [];
    }
}