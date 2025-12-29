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

  test('Delete removes key', () => {
    local.Set('baz', 'qux', 1000);
    local.Delete('baz');
    expect(localStorage.getItem('baz')).toBeNull();
    expect(local.Get('baz')).toBe(undefined);
  });

  beforeAll(() => {
    global.localStorage = mockLocalStorage();
    jest.useFakeTimers();
  });
  test('Clear empties the store', () => {
    local.Set('a', '1', 1000);
    local.Set('b', '2', 1000);
    local.Clear();
    expect(localStorage.getItem('a')).toBeNull();
    expect(localStorage.getItem('b')).toBeNull();
  });

  test('GetAllKeys returns all keys', () => {
    local.Set('x', '1', 1000);
    local.Set('y', '2', 1000);
    expect(local.GetAllKeys().sort()).toEqual(['x', 'y']);
  });

  test('Expired key is removed and returns null for Get', () => {
    local.Set('exp', 'gone', 1); // 1ms TTL
    jest.advanceTimersByTime(2); // Fast-forward time
    expect(local.Get('exp')).toBe(null);
  });

  test('LocalStoragePrune removes expired entries', () => {
    local.Set('prune', 'me', 1);
    jest.advanceTimersByTime(2);
    local.LocalStoragePrune();
    expect(local.Get('prune')).toBe(undefined);
  });
});
