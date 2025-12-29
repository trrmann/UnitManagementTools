import { CryptoKeyPair, PublicKeyCrypto } from '../crypto.mjs';

describe('CryptoKeyPair', () => {
  test('constructor sets public and private keys', () => {
    const pair = new CryptoKeyPair('pub', 'priv');
    expect(pair.PublicKey).toBe('pub');
    expect(pair.PrivateKey).toBe('priv');
  });

  test('CopyFromJSON and CopyToJSON work as expected', () => {
    const json = { publicKey: 'pub', privateKey: 'priv' };
    const instance = CryptoKeyPair.CopyFromJSON(json);
    expect(instance.PublicKey).toBe('pub');
    expect(instance.PrivateKey).toBe('priv');
    const out = CryptoKeyPair.CopyToJSON(instance);
    expect(out.publicKey).toBe('pub');
    expect(out.privateKey).toBe('priv');
  });

  test('CopyFromObject copies properties', () => {
    const dest = new CryptoKeyPair();
    const src = { publicKey: 'pub', privateKey: 'priv' };
    CryptoKeyPair.CopyFromObject(dest, src);
    expect(dest.PublicKey).toBe('pub');
    expect(dest.PrivateKey).toBe('priv');
  });

  test('Factory returns new instance', async () => {
    const instance = await CryptoKeyPair.Factory('pub', 'priv');
    expect(instance.PublicKey).toBe('pub');
    expect(instance.PrivateKey).toBe('priv');
  });
});

describe('PublicKeyCrypto', () => {
  test('Factory returns new instance', async () => {
    const instance = await PublicKeyCrypto.Factory();
    expect(instance).toBeInstanceOf(PublicKeyCrypto);
  });

  test('CopyFromJSON returns new instance', () => {
    const instance = PublicKeyCrypto.CopyFromJSON({});
    expect(instance).toBeInstanceOf(PublicKeyCrypto);
  });

  test('CopyToJSON returns empty object', () => {
    const instance = new PublicKeyCrypto();
    expect(PublicKeyCrypto.CopyToJSON(instance)).toEqual({});
  });

  test('CopyFromObject does not throw', () => {
    const dest = new PublicKeyCrypto();
    const src = {};
    expect(() => PublicKeyCrypto.CopyFromObject(dest, src)).not.toThrow();
  });
});
