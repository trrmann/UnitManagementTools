// Timer management utilities for prune/cleanup intervals
export const TimerUtils = {
    /**
     * Starts an interval timer for a given callback and interval.
     * If an existing timer is running, it is cleared first.
     * @param {object} obj - The object holding the timer property.
     * @param {string} timerProp - The property name for the timer (e.g., '_cachePruneTimer').
     * @param {string} intervalProp - The property name for the interval ms (e.g., '_cachePruneIntervalMs').
     * @param {function} callback - The function to call on each interval.
     * @param {number} intervalMs - The interval in ms.
     */
    start(obj, timerProp, intervalProp, callback, intervalMs) {
        obj[intervalProp] = intervalMs;
        if (obj[timerProp]) {
            clearInterval(obj[timerProp]);
        }
        obj[timerProp] = setInterval(callback, intervalMs);
    },

    /**
     * Pauses (clears) the interval timer.
     */
    pause(obj, timerProp) {
        if (obj[timerProp]) {
            clearInterval(obj[timerProp]);
            obj[timerProp] = null;
        }
    },

    /**
     * Resumes the interval timer if interval ms is set.
     */
    resume(obj, timerProp, intervalProp, callback) {
        if (obj[intervalProp]) {
            if (obj[timerProp]) {
                clearInterval(obj[timerProp]);
            }
            obj[timerProp] = setInterval(callback, obj[intervalProp]);
        }
    },

    /**
     * Stops the interval timer and clears the interval ms.
     */
    stop(obj, timerProp, intervalProp) {
        if (obj[timerProp]) {
            clearInterval(obj[timerProp]);
            obj[timerProp] = null;
            obj[intervalProp] = null;
        }
    }
};
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
