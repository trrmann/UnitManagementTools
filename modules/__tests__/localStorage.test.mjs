import { LocalStorage } from '../localStorage.mjs';

describe('LocalStorage', () => {
  let local;
  function mockLocalStorage() {
    let store = {};
    return {
      getItem: jest.fn((key) => store[key] || null),
      setItem: jest.fn((key, value) => { store[key] = value; }),
      removeItem: jest.fn((key) => { delete store[key]; }),
      clear: jest.fn(() => { store = {}; }),
    };
  }

  beforeAll(() => {
    global.localStorage = mockLocalStorage();
    jest.useFakeTimers();
  });

  beforeEach(() => {
    global.localStorage = mockLocalStorage();
    local = new LocalStorage(0); // Disable timer for unit tests
  });

  test('Set and Get store values', () => {
    local.Set('foo', 'bar', 1000);
    const payload = JSON.parse(localStorage.getItem('foo'));
    expect(payload.value).toBe('bar');
    expect(local.Get('foo')).toBe('bar');
  });

  test('SetObject stores object as string', () => {
    local.SetObject('obj', { a: 1 }, 1000);
    const payload = JSON.parse(localStorage.getItem('obj'));
    expect(payload.value).toBe('{"a":1}');
    expect(local.GetObject('obj')).toEqual({ a: 1 });
  });

  test('SetObject does not double-serialize and GetObject returns correct object', () => {
    const obj = { x: 1, y: { z: 2 } };
    local.SetObject('complex', obj, 1000);
    // Should store a single stringified object, not a stringified string
    const raw = localStorage.getItem('complex');
    const parsed = JSON.parse(raw);
    expect(typeof parsed.value).toBe('string');
    expect(() => JSON.parse(parsed.value)).not.toThrow();
    expect(local.GetObject('complex')).toEqual(obj);
  });

  test('Delete removes key', () => {
    local.Set('baz', 'qux', 1000);
    local.Delete('baz');
    expect(local.Get('baz')).toBeUndefined();
    expect(local.HasKey('baz')).toBe(false);
  });

  test('HasKey uses Set.has and is correct', () => {
    expect(local.HasKey('missing')).toBe(false);
    local.Set('a', 1, 1000);
    expect(local.HasKey('a')).toBe(true);
    local.Delete('a');
    expect(local.HasKey('a')).toBe(false);
  });

  test('Clear and LocalStoragePrune are fast for empty registry', () => {
    // Should not throw or do anything if empty
    expect(() => local.Clear()).not.toThrow();
    expect(() => local.LocalStoragePrune()).not.toThrow();
    // Add a key, then clear
    local.Set('foo', 'bar', 1000);
    expect(local.HasKey('foo')).toBe(true);
    local.Clear();
    expect(local.HasKey('foo')).toBe(false);
  });
});
