import { jest } from '@jest/globals';
import { CacheStore } from '../cacheStore.mjs';

describe('CacheStore', () => {
  let cache;
  beforeEach(() => {
    cache = new CacheStore();
  });

  test('Set and Get store values', () => {
    cache.Set('foo', 123, 1000);
    const entry = cache.Get('foo');
    expect(entry.value).toBe(123);
    expect(typeof entry.expires).toBe('number');
  });

  test('Has returns true for existing key', () => {
    cache.Set('bar', 'baz', 1000);
    expect(cache.Has('bar')).toBe(true);
    cache.Delete('bar');
    expect(cache.Has('bar')).toBe(false);
  });

  test('Delete removes key', () => {
    cache.Set('baz', 42, 1000);
    const deleted = cache.Delete('baz');
    expect(deleted).toBe(true);
    expect(cache.Has('baz')).toBe(false);
  });

  test('Clear empties the store', () => {
    cache.Set('a', 1, 1000);
    cache.Set('b', 2, 1000);
    cache.Clear();
    expect(cache.Keys().length).toBe(0);
  });

  test('Keys returns all keys', () => {
    cache.Set('x', 1, 1000);
    cache.Set('y', 2, 1000);
    expect(cache.Keys().sort()).toEqual(['x', 'y']);
  });

  test('valuesArray returns all values as array', () => {
    cache.Set('a', 10);
    cache.Set('b', 20);
    expect(cache.valuesArray().sort((a, b) => a - b)).toEqual([10, 20]);
  });

  test('entriesArray returns all [key, value] pairs as array', () => {
    cache.Set('foo', 1);
    cache.Set('bar', 2);
    const entries = cache.entriesArray();
    expect(entries).toEqual(expect.arrayContaining([
      ['foo', 1],
      ['bar', 2]
    ]));
    expect(entries.length).toBe(2);
  });

  test('keysArray returns all keys as array', () => {
    cache.Set('a', 10);
    cache.Set('b', 20);
    expect(cache.keysArray().sort()).toEqual(['a', 'b']);
  });

  test('deleteAll removes all specified keys', () => {
    cache.Set('a', 1);
    cache.Set('b', 2);
    cache.Set('c', 3);
    cache.deleteAll(['a', 'c']);
    expect(cache.Has('a')).toBe(false);
    expect(cache.Has('c')).toBe(false);
    expect(cache.Has('b')).toBe(true);
  });

  test('deleteAll returns count of deleted keys and deletes only specified keys', () => {
    const cache = new CacheStore();
    cache.Set('a', 1);
    cache.Set('b', 2);
    cache.Set('c', 3);
    const deleted = cache.deleteAll(['a', 'c', 'not-there']);
    expect(deleted).toBe(2);
    expect(cache.Has('a')).toBe(false);
    expect(cache.Has('c')).toBe(false);
    expect(cache.Has('b')).toBe(true);
  });

  test('mapValues maps over all values', () => {
    cache.Set('a', 2);
    cache.Set('b', 3);
    cache.Set('c', 4);
    const squares = cache.mapValues(v => v * v);
    expect(squares.sort((a, b) => a - b)).toEqual([4, 9, 16]);
  });

  test('filterValues filters values correctly', () => {
    cache.Set('a', 2);
    cache.Set('b', 3);
    cache.Set('c', 4);
    const evens = cache.filterValues(v => v % 2 === 0);
    expect(evens).toEqual([2, 4]);
  });

  test('findValue finds the first matching value or undefined', () => {
    cache.Set('a', 2);
    cache.Set('b', 3);
    cache.Set('c', 4);
    const found = cache.findValue(v => v > 2);
    expect(found).toBe(3);
    const notFound = cache.findValue(v => v > 10);
    expect(notFound).toBeUndefined();
  });

  test('clearAll empties the cache', () => {
    cache.Set('a', 1);
    cache.Set('b', 2);
    expect(cache.size).toBe(2);
    cache.clearAll();
    expect(cache.size).toBe(0);
    expect(cache.Keys()).toEqual([]);
  });

  test('size getter matches Size and updates', () => {
    expect(cache.size).toBe(0);
    cache.Set('a', 1);
    expect(cache.size).toBe(1);
    expect(cache.size).toBe(cache.Size);
    cache.Set('b', 2);
    expect(cache.size).toBe(2);
    cache.Delete('a');
    expect(cache.size).toBe(1);
    cache.Clear();
    expect(cache.size).toBe(0);
  });

  test('FromCacheStore creates a deep copy', () => {
    cache.Set('a', 10);
    cache.Set('b', 20);
    const clone = CacheStore.FromCacheStore(cache);
    expect(clone).not.toBe(cache);
    expect(clone.toJSON()).toEqual(cache.toJSON());
    clone.Set('c', 30);
    expect(cache.Has('c')).toBe(false);
    expect(clone.Has('c')).toBe(true);
  });

  test('clone() returns a deep copy', () => {
    cache.Set('x', 1);
    cache.Set('y', 2);
    const clone = cache.clone();
    expect(clone).not.toBe(cache);
    expect(clone.toJSON()).toEqual(cache.toJSON());
    clone.Set('z', 3);
    expect(cache.Has('z')).toBe(false);
    expect(clone.Has('z')).toBe(true);
  });

  test('toJSON returns plain object of key-value pairs', () => {
    cache.Set('a', 10);
    cache.Set('b', 20);
    expect(cache.toJSON()).toEqual({ a: 10, b: 20 });
  });

  describe('FromJSON', () => {
    test('should create a CacheStore from a plain object', () => {
      const obj = { a: 1, b: 'two', c: { nested: true } };
      const cache = CacheStore.FromJSON(obj);
      expect(cache.Get('a').value).toBe(1);
      expect(cache.Get('b').value).toBe('two');
      expect(cache.Get('c').value).toEqual({ nested: true });
      expect(cache.Size).toBe(3);
    });

    test('should return an empty CacheStore for null or non-object', () => {
      expect(CacheStore.FromJSON(null).Size).toBe(0);
      expect(CacheStore.FromJSON(undefined).Size).toBe(0);
      expect(CacheStore.FromJSON(42).Size).toBe(0);
    });

    test('should round-trip with ToJSON()', () => {
      const original = new CacheStore();
      original.Set('x', 123);
      original.Set('y', 'abc');
      const json = {};
      for (const key of original.Keys()) {
        json[key] = original.Get(key).value;
      }
      const restored = CacheStore.FromJSON(json);
      expect(restored.Get('x').value).toBe(123);
      expect(restored.Get('y').value).toBe('abc');
      expect(restored.Size).toBe(2);
    });
  });

  describe('Timer and expiry', () => {
    test('Expired key is removed and returns false for Has', () => {
      cache.Set('exp', 'gone', 1); // 1ms TTL
      // Simulate time passing
      setTimeout(() => {
        expect(cache.Has('exp')).toBe(false);
      }, 2);
    });
    test('CachePrune removes expired entries', () => {
      cache.Set('prune', 'me', 1);
      setTimeout(() => {
        cache.CachePrune();
        expect(cache.Has('prune')).toBe(false);
      }, 2);
    });
  });

  test('forEachValue iterates all values', () => {
    cache.Set('a', 10);
    cache.Set('b', 20);
    cache.Set('c', 30);
    const values = [];
    cache.forEachValue((value) => values.push(value));
    expect(values.sort((a, b) => a - b)).toEqual([10, 20, 30]);
  });

  test('Set does not call Delete for new keys, but does for existing', () => {
    const cache = new CacheStore();
    const spyDelete = jest.spyOn(cache, 'Delete');
    cache.Set('a', 1); // new key
    expect(spyDelete).not.toHaveBeenCalled();
    cache.Set('a', 2); // existing key
    expect(spyDelete).toHaveBeenCalledWith('a');
    spyDelete.mockRestore();
  });

  test('Set does not perform unnecessary writes if value and expiration are unchanged', () => {
    const cache = new CacheStore();
    cache.Set('a', 1, 1000);
    const entry = cache._store.get('a');
    const spyDelete = jest.spyOn(cache, 'Delete');
    const spySet = jest.spyOn(cache._store, 'set');
    // Call Set with same value and expiration
    cache.Set('a', 1, 1000);
    expect(spyDelete).not.toHaveBeenCalled();
    expect(spySet).not.toHaveBeenCalled();
    // Call Set with different value
    cache.Set('a', 2, 1000);
    expect(spyDelete).toHaveBeenCalledWith('a');
    expect(spySet).toHaveBeenCalled();
    spyDelete.mockRestore();
    spySet.mockRestore();
  });

  test('replace only updates existing, non-expired keys and does not create new keys', () => {
    const cache = new CacheStore();
    // New key: should not replace, should return false
    expect(cache.replace('missing', 99)).toBe(false);
    expect(cache.Has('missing')).toBe(false);
    // Existing key: should replace
    cache.Set('a', 1, 1000);
    expect(cache.replace('a', 42)).toBe(true);
    expect(cache.Get('a').value).toBe(42);
    // Should not update if value is unchanged
    const spySet = jest.spyOn(cache._store, 'set');
    expect(cache.replace('a', 42)).toBe(false);
    expect(spySet).not.toHaveBeenCalled();
    spySet.mockRestore();
    // Expired key: should not replace
    cache.Set('b', 2, 1); // expires quickly
    setTimeout(() => {
      expect(cache.replace('b', 100)).toBe(false);
      expect(cache.Has('b')).toBe(false);
    }, 2);
  });

  test('mapValues returns empty array for empty cache', () => {
    const cache = new CacheStore();
    expect(cache.mapValues(v => v * 2)).toEqual([]);
  });
  test('filterValues returns empty array for empty cache', () => {
    const cache = new CacheStore();
    expect(cache.filterValues(v => v > 0)).toEqual([]);
  });

  describe('forEachValue', () => {
    test('iterates over all values', () => {
      const cache = new CacheStore();
      cache.Set('a', 1);
      cache.Set('b', 2);
      cache.Set('c', 3);
      const cb = jest.fn();
      cache.forEachValue(cb);
      expect(cb).toHaveBeenCalledTimes(3);
      expect(cb).toHaveBeenCalledWith(1, cache);
      expect(cb).toHaveBeenCalledWith(2, cache);
      expect(cb).toHaveBeenCalledWith(3, cache);
    });

    test('does not call callback for empty cache', () => {
      const cache = new CacheStore();
      const cb = jest.fn();
      cache.forEachValue(cb);
      expect(cb).not.toHaveBeenCalled();
    });
  });

  describe('forEachEntry', () => {
    test('iterates over all entries', () => {
      const cache = new CacheStore();
      cache.Set('a', 1);
      cache.Set('b', 2);
      cache.Set('c', 3);
      const cb = jest.fn();
      cache.forEachEntry(cb);
      expect(cb).toHaveBeenCalledTimes(3);
      expect(cb).toHaveBeenCalledWith('a', 1, cache);
      expect(cb).toHaveBeenCalledWith('b', 2, cache);
      expect(cb).toHaveBeenCalledWith('c', 3, cache);
    });

    test('does not call callback for empty cache', () => {
      const cache = new CacheStore();
      const cb = jest.fn();
      cache.forEachEntry(cb);
      expect(cb).not.toHaveBeenCalled();
    });
  });

  describe('forEach', () => {
    it('iterates over all values and keys', () => {
      const cache = new CacheStore();
      cache.Set('a', 1);
      cache.Set('b', 2);
      cache.Set('c', 3);
      const cb = jest.fn();
      cache.forEach(cb);
      expect(cb).toHaveBeenCalledTimes(3);
      expect(cb).toHaveBeenCalledWith(1, 'a', cache);
      expect(cb).toHaveBeenCalledWith(2, 'b', cache);
      expect(cb).toHaveBeenCalledWith(3, 'c', cache);
    });
    it('does not call callback for empty cache', () => {
      const cache = new CacheStore();
      const cb = jest.fn();
      cache.forEach(cb);
      expect(cb).not.toHaveBeenCalled();
    });
  });

  describe('every', () => {
    it('returns true for empty cache', () => {
      const cache = new CacheStore();
      const cb = jest.fn();
      expect(cache.every(cb)).toBe(true);
      expect(cb).not.toHaveBeenCalled();
    });
    it('returns true if all values pass', () => {
      const cache = new CacheStore();
      cache.Set('a', 1);
      cache.Set('b', 2);
      expect(cache.every(v => v > 0)).toBe(true);
    });
    it('returns false if any value fails', () => {
      const cache = new CacheStore();
      cache.Set('a', 1);
      cache.Set('b', 0);
      expect(cache.every(v => v > 0)).toBe(false);
    });
  });

  describe('some', () => {
    it('returns false for empty cache', () => {
      const cache = new CacheStore();
      const cb = jest.fn();
      expect(cache.some(cb)).toBe(false);
      expect(cb).not.toHaveBeenCalled();
    });
    it('returns true if any value passes', () => {
      const cache = new CacheStore();
      cache.Set('a', 0);
      cache.Set('b', 2);
      expect(cache.some(v => v > 0)).toBe(true);
    });
    it('returns false if no values pass', () => {
      const cache = new CacheStore();
      cache.Set('a', 0);
      cache.Set('b', 0);
      expect(cache.some(v => v > 0)).toBe(false);
    });
  });

  describe('findValue', () => {
    it('returns undefined for empty cache', () => {
      const cache = new CacheStore();
      const cb = jest.fn();
      expect(cache.findValue(cb)).toBeUndefined();
      expect(cb).not.toHaveBeenCalled();
    });
    it('returns first matching value', () => {
      cache.Set('a', 1);
      cache.Set('b', 2);
      cache.Set('c', 3);
      const found = cache.findValue((v) => v > 1);
      expect(found).toBe(2);
    });
    it('returns undefined if no match', () => {
      cache.Set('a', 1);
      cache.Set('b', 2);
      const notFound = cache.findValue((v) => v > 10);
      expect(notFound).toBeUndefined();
    });
  });

  describe('findEntry', () => {
    it('returns undefined for empty cache', () => {
      const cache = new CacheStore();
      const cb = jest.fn();
      expect(cache.findEntry(cb)).toBeUndefined();
      expect(cb).not.toHaveBeenCalled();
    });
    it('returns first matching [key, value]', () => {
      cache.Set('a', 1);
      cache.Set('b', 2);
      cache.Set('c', 3);
      expect(cache.findEntry((v) => v > 1)).toEqual(['b', 2]);
    });
    it('returns undefined if no match', () => {
      cache.Set('a', 1);
      cache.Set('b', 2);
      expect(cache.findEntry((v) => v > 10)).toBeUndefined();
    });
  });

  describe('reduce', () => {
    it('returns initialValue for empty cache', () => {
      const cache = new CacheStore();
      const cb = jest.fn();
      expect(cache.reduce(cb, 42)).toBe(42);
      expect(cb).not.toHaveBeenCalled();
    });
    it('throws TypeError for empty cache with no initialValue', () => {
      const cache = new CacheStore();
      const cb = jest.fn();
      expect(() => cache.reduce(cb)).toThrow(TypeError);
      expect(cb).not.toHaveBeenCalled();
    });
    it('reduces values in cache', () => {
      const cache = new CacheStore();
      cache.Set('a', 1);
      cache.Set('b', 2);
      cache.Set('c', 3);
      const sum = cache.reduce((acc, v) => acc + v, 0);
      expect(sum).toBe(6);
    });
    it('reduces values in cache with no initialValue', () => {
      const cache = new CacheStore();
      cache.Set('a', 1);
      cache.Set('b', 2);
      cache.Set('c', 3);
      const sum = cache.reduce((acc, v) => acc + v);
      expect(sum).toBe(6);
    });
  });

  describe('deleteWhere', () => {
    it('returns 0 for empty cache', () => {
      const cache = new CacheStore();
      const cb = jest.fn();
      expect(cache.deleteWhere(cb)).toBe(0);
      expect(cb).not.toHaveBeenCalled();
    });
    it('deletes matching entries and returns count', () => {
      const cache = new CacheStore();
      cache.Set('a', 1);
      cache.Set('b', 2);
      cache.Set('c', 3);
      const count = cache.deleteWhere(v => v > 1);
      expect(count).toBe(2);
      expect(cache.Has('a')).toBe(true);
      expect(cache.Has('b')).toBe(false);
      expect(cache.Has('c')).toBe(false);
    });
    it('returns 0 if no entries match', () => {
      const cache = new CacheStore();
      cache.Set('a', 1);
      cache.Set('b', 2);
      expect(cache.deleteWhere(v => v > 10)).toBe(0);
      expect(cache.Has('a')).toBe(true);
      expect(cache.Has('b')).toBe(true);
    });
  });

  describe('toMap', () => {
    it('returns empty Map for empty cache', () => {
        const cache = new CacheStore();
        const map = cache.toMap();
        expect(map).toBeInstanceOf(Map);
        expect(map.size).toBe(0);
    });
    it('returns Map with all key-value pairs', () => {
        const cache = new CacheStore();
        cache.Set('a', 1);
        cache.Set('b', 2);
        const map = cache.toMap();
        expect(map.size).toBe(2);
        expect(map.get('a')).toBe(1);
        expect(map.get('b')).toBe(2);
    });
  });

  describe('toJSON', () => {
    it('returns empty object for empty cache', () => {
        const cache = new CacheStore();
        expect(cache.toJSON()).toEqual({});
    });
    it('returns object with all key-value pairs', () => {
        const cache = new CacheStore();
        cache.Set('a', 1);
        cache.Set('b', 2);
        expect(cache.toJSON()).toEqual({ a: 1, b: 2 });
    });
  });

  describe('valuesArray', () => {
    it('returns empty array for empty cache', () => {
        const cache = new CacheStore();
        expect(cache.valuesArray()).toEqual([]);
    });
});

describe('entriesArray', () => {
    it('returns empty array for empty cache', () => {
        const cache = new CacheStore();
        expect(cache.entriesArray()).toEqual([]);
    });
});

describe('keysArray', () => {
    it('returns empty array for empty cache', () => {
        const cache = new CacheStore();
        expect(cache.keysArray()).toEqual([]);
    });
});

describe('FromCacheStore', () => {
    it('returns empty CacheStore for empty source', () => {
        const cache = new CacheStore();
        const clone = CacheStore.FromCacheStore(cache);
        expect(clone).not.toBe(cache);
        expect(clone.toJSON()).toEqual({});
        clone.Set('x', 1);
        expect(cache.Has('x')).toBe(false);
        expect(clone.Has('x')).toBe(true);
    });
});
describe('clone', () => {
    it('returns empty CacheStore for empty source', () => {
        const cache = new CacheStore();
        const clone = cache.clone();
        expect(clone).not.toBe(cache);
        expect(clone.toJSON()).toEqual({});
        clone.Set('y', 2);
        expect(cache.Has('y')).toBe(false);
        expect(clone.Has('y')).toBe(true);
    });
});

describe('clearIf', () => {
    it('returns 0 for empty cache', () => {
        const cache = new CacheStore();
        expect(cache.clearIf(() => true)).toBe(0);
    });
    it('removes all matching entries and returns count', () => {
        const cache = new CacheStore();
        cache.Set('a', 1);
        cache.Set('b', 2);
        cache.Set('c', 3);
        const count = cache.clearIf(v => v > 1);
        expect(count).toBe(2);
        expect(cache.Has('a')).toBe(true);
        expect(cache.Has('b')).toBe(false);
        expect(cache.Has('c')).toBe(false);
    });
    it('returns 0 if no entries match', () => {
        const cache = new CacheStore();
        cache.Set('a', 1);
        cache.Set('b', 2);
        expect(cache.clearIf(v => v > 10)).toBe(0);
        expect(cache.Has('a')).toBe(true);
        expect(cache.Has('b')).toBe(true);
    });
});
  test('deleteMany is an alias for deleteAll and returns correct count', () => {
    const cache = new CacheStore();
    cache.Set('a', 1);
    cache.Set('b', 2);
    cache.Set('c', 3);
    expect(cache.deleteMany(['a', 'b'])).toBe(2);
    expect(cache.Has('a')).toBe(false);
    expect(cache.Has('b')).toBe(false);
    expect(cache.Has('c')).toBe(true);
    // Deleting non-existent keys returns 0
    expect(cache.deleteMany(['x', 'y'])).toBe(0);
  });
});
