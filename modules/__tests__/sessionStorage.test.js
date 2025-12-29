import { SessionStorage } from '../sessionStorage.mjs';

// Mock sessionStorage for testing
const mockSessionStorage = (() => {
  let store = {};
  return {
    setItem: jest.fn((key, value) => { store[key] = value; }),
    getItem: jest.fn(key => store[key] || null),
    removeItem: jest.fn(key => { delete store[key]; }),
    clear: jest.fn(() => { store = {}; }),
    _store: store
  };
})();

global.sessionStorage = mockSessionStorage;

describe('SessionStorage Class', () => {
  let ss;
  beforeEach(() => {
    mockSessionStorage.clear();
    ss = new SessionStorage();
  });

  test('Set and Get basic value', () => {
    ss.Set('foo', 'bar', 10000);
    expect(ss.Get('foo')).toBe('bar');
    expect(ss.HasKey('foo')).toBe(true);
  });

  test('SetObject and GetObject', () => {
    const obj = { a: 1, b: 2 };
    ss.SetObject('obj', obj, 10000);
    expect(ss.GetObject('obj')).toEqual(obj);
  });

  test('Delete removes key', () => {
    ss.Set('foo', 'bar', 10000);
    ss.Delete('foo');
    expect(ss.Get('foo')).toBeUndefined();
    expect(ss.HasKey('foo')).toBe(false);
  });

  test('Clear removes all keys', () => {
    ss.Set('a', '1', 10000);
    ss.Set('b', '2', 10000);
    ss.Clear();
    expect(ss.GetAllKeys().length).toBe(0);
    expect(ss.Get('a')).toBeUndefined();
    expect(ss.Get('b')).toBeUndefined();
  });

  test('Get returns null for expired value', () => {
    // Manually set an expired payload
    const expiredPayload = JSON.stringify({ value: 'gone', expires: Date.now() - 10000 });
    sessionStorage.setItem('exp', expiredPayload);
    ss._keyRegistry.add('exp');
    expect(ss.Get('exp')).toBeNull();
  });

  test('SessionStoragePrune removes expired keys', () => {
    // Manually set an expired payload
    const expiredPayload = JSON.stringify({ value: 'gone', expires: Date.now() - 10000 });
    sessionStorage.setItem('exp', expiredPayload);
    ss._keyRegistry.add('exp');
    ss.Set('ok', 'here', 10000);
    ss.SessionStoragePrune();
    expect(ss.Get('exp')).toBeUndefined();
    expect(ss.Get('ok')).toBe('here');
  });

  test('KeyRegistry tracks keys', () => {
    ss.Set('foo', 'bar', 10000);
    ss.Set('baz', 'qux', 10000);
    expect(ss.KeyRegistry.has('foo')).toBe(true);
    expect(ss.KeyRegistry.has('baz')).toBe(true);
    ss.Delete('foo');
    expect(ss.KeyRegistry.has('foo')).toBe(false);
  });
});
