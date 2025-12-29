import { Storage } from '../storage.mjs';

describe('Storage Class', () => {
  let storage;
  beforeEach(() => {
    jest.useFakeTimers();
    storage = new Storage();
  });
  afterEach(() => {
    jest.useRealTimers();
  });

  describe('Initialization', () => {
    test('constructor initializes registries and submodules', () => {
      expect(storage._keyRegistry).toBeInstanceOf(Map);
      expect(storage._secureKeyRegistry).toBeInstanceOf(Map);
      expect(storage._cache).toBeNull();
      expect(storage._sessionStorage).toBeNull();
      expect(storage._localStorage).toBeNull();
      expect(storage._crypto).toBeNull();
      expect(storage._googleDrive).toBeNull();
      expect(storage._gitHub).toBeNull();
    });
  });

  describe('Key registration', () => {
    test('RegisterKey and KeyRegistered', () => {
      storage.RegisterKey('foo', Date.now() + 10000);
      expect(storage.KeyRegistered('foo')).toBe(true);
      expect(storage.GetAllKeys()).toContain('foo');
    });
    test('UnregisterKey removes key', () => {
      storage.RegisterKey('bar', Date.now() + 10000);
      storage.UnregisterKey('bar');
      expect(storage.KeyRegistered('bar')).toBe(false);
    });
    test('RegisterSecureKey and SecureKeyRegistered', () => {
      storage.RegisterSecureKey('secure', Date.now() + 10000);
      expect(storage.SecureKeyRegistered('secure')).toBe(true);
      expect(storage.GetAllSecureKeys()).toContain('secure');
      expect(storage.KeyRegistered('secure')).toBe(true);
    });
    test('UnregisterSecureKey removes secure key', () => {
      storage.RegisterSecureKey('secure2', Date.now() + 10000);
      storage.UnregisterSecureKey('secure2');
      expect(storage.SecureKeyRegistered('secure2')).toBe(false);
      expect(storage.KeyRegistered('secure2')).toBe(false);
    });
  });

  describe('Pruning and timers', () => {
    test('RegistryPrune removes expired keys', () => {
      const expired = Date.now() - 10000;
      storage.RegisterKey('old', expired);
      storage.RegisterSecureKey('oldsecure', expired);
      storage.RegistryPrune();
      expect(storage.KeyRegistered('old')).toBe(false);
      expect(storage.SecureKeyRegistered('oldsecure')).toBe(false);
    });
    test('Start, Pause, Resume, Stop RegistryPruneTimer', () => {
      storage.StartRegistryPruneTimer(1000);
      expect(storage._registryPruneTimer).not.toBeNull();
      storage.PauseRegistryPruneTimer();
      expect(storage._registryPruneTimer).toBeNull();
      storage.ResumeRegistryPruneTimer();
      expect(storage._registryPruneTimer).not.toBeNull();
      storage.StopRegistryPruneTimer();
      expect(storage._registryPruneTimer).toBeNull();
    });
  });
});
