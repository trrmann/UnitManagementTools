// modules/objectUtils.mjs
// Shared object utility functions

/**
 * Creates a standard storage config object for modules.
 * @param {Object} options - TTLs and any overrides.
 * @param {number} options.cacheTtlMs
 * @param {number} options.sessionTtlMs
 * @param {number} options.localTtlMs
 * @param {string|null} [options.googleId]
 * @param {string|null} [options.githubFilename]
 * @param {string|null} [options.privateKey]
 * @param {string|null} [options.publicKey]
 * @param {boolean} [options.secure]
 * @returns {Object}
 */
export function createStorageConfig({
    cacheTtlMs,
    sessionTtlMs,
    localTtlMs,
    googleId = null,
    githubFilename = null,
    privateKey = null,
    publicKey = null,
    secure = false
}) {
    return {
        cacheTtlMs,
        sessionTtlMs,
        localTtlMs,
        googleId,
        githubFilename,
        privateKey,
        publicKey,
        secure
    };
}

export class ObjectUtils {
    /**
     * Flattens a nested object into a single-level object with dot-separated keys.
     * @param {Object} obj - The object to flatten.
     * @param {string} parentKey - The prefix for the keys (used for recursion).
     * @param {string} separator - The separator between keys.
     * @returns {Object} The flattened object.
     */
    static flattenObject(obj, parentKey = '', separator = '.') {
        const result = {};
        for (const key in obj) {
            if (Object.prototype.hasOwnProperty.call(obj, key)) {
                const newKey = parentKey ? `${parentKey}${separator}${key}` : key;
                const value = obj[key];
                if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
                    Object.assign(result, ObjectUtils.flattenObject(value, newKey, separator));
                } else {
                    result[newKey] = value;
                }
            }
        }
        return result;
    }
}
