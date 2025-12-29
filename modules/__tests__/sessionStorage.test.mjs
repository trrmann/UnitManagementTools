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

  describe('Basic operations', () => {
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
    test('SetObject does not double-serialize and GetObject returns correct object', () => {
      const obj = { x: 1, y: { z: 2 } };
      ss.SetObject('complex', obj, 10000);
      // Should store a single stringified object, not a stringified string
      const raw = sessionStorage.getItem('complex');
      const parsed = JSON.parse(raw);
      expect(typeof parsed.value).toBe('string');
      expect(() => JSON.parse(parsed.value)).not.toThrow();
      expect(ss.GetObject('complex')).toEqual(obj);
    });
    // ...rest of file unchanged...
  });
});
