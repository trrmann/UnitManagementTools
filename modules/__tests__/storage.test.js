import { Storage } from '../storage.mjs';

describe('Storage Class', () => {
  let storage;

  beforeEach(() => {
    storage = new Storage();
  });

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

  test('RegistryPrune removes expired keys', () => {
    const expired = Date.now() - 10000;
    storage.RegisterKey('old', expired);
    storage.RegisterSecureKey('oldsecure', expired);
    storage.RegistryPrune();
    expect(storage.KeyRegistered('old')).toBe(false);
    expect(storage.SecureKeyRegistered('oldsecure')).toBe(false);
  });

  test('Start, Pause, Resume, Stop RegistryPruneTimer', () => {
    // TimerUtils is imported, but we can only check timer property changes
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
