    it('addItem, removeItemById, and removeItemByName update data and maps correctly', () => {
      const drive = new GoogleDrive({});
      drive.Data = [];
      drive.addItem({ id: '1', name: 'foo' });
      expect(drive.GetItemById('1')).toEqual({ id: '1', name: 'foo' });
      expect(drive.HasItemByName('foo')).toBe(true);
      // Add another
      drive.addItem({ id: '2', name: 'bar' });
      expect(drive.GetItemById('2')).toEqual({ id: '2', name: 'bar' });
      expect(drive.HasItemByName('bar')).toBe(true);
      // Remove by id
      expect(drive.removeItemById('1')).toBe(true);
      expect(drive.GetItemById('1')).toBeNull();
      expect(drive.HasItemByName('foo')).toBe(false);
      // Remove by name
      expect(drive.removeItemByName('bar')).toBe(true);
      expect(drive.GetItemById('2')).toBeNull();
      expect(drive.HasItemByName('bar')).toBe(false);
      // Remove non-existent
      expect(drive.removeItemById('x')).toBe(false);
      expect(drive.removeItemByName('y')).toBe(false);
    });
  it('Data setter keeps internal maps in sync, direct mutation does not', () => {
    const drive = new GoogleDrive({});
    // Use setter
    drive.Data = [{ id: 'x', name: 'foo' }];
    expect(drive.GetItemById('x')).toEqual({ id: 'x', name: 'foo' });
    expect(drive.HasItemByName('foo')).toBe(true);
    // Direct mutation (should NOT update maps)
    const arr = drive.Data;
    arr.push({ id: 'y', name: 'bar' });
    // Old maps still in effect
    expect(drive.GetItemById('y')).toBeNull();
    expect(drive.HasItemByName('bar')).toBe(false);
    // Now use setter to replace
    drive.Data = arr;
    expect(drive.GetItemById('y')).toEqual({ id: 'y', name: 'bar' });
    expect(drive.HasItemByName('bar')).toBe(true);
  });

import { GoogleDrive } from '../googleDrive.mjs';

describe('GoogleDrive', () => {
  it('can be constructed with a mock gitHubDataObj', () => {
    const mockGitHubDataObj = {};
    const drive = new GoogleDrive(mockGitHubDataObj);
    expect(drive).toBeInstanceOf(GoogleDrive);
    expect(drive._gitHubDataObj).toBe(mockGitHubDataObj);
    expect(Array.isArray(drive._data)).toBe(true);
    expect(drive._isLoaded).toBe(false);
  });

  it('GetAll returns [] for empty data and a copy for non-empty', () => {
    const drive = new GoogleDrive({});
    expect(drive.GetAll()).toEqual([]);
    drive._data = [{ id: 1 }, { id: 2 }];
    const all = drive.GetAll();
    expect(all).toEqual([{ id: 1 }, { id: 2 }]);
    // Should be a copy, not the same array
    expect(all).not.toBe(drive._data);
  });

  it('GetItemById/Name and HasItemById/Name use O(1) map and update on data change', () => {
    const drive = new GoogleDrive({});
    // Empty data
    expect(drive.GetItemById('x')).toBeNull();
    expect(drive.GetItemByName('y')).toBeNull();
    expect(drive.HasItemById('x')).toBe(false);
    expect(drive.HasItemByName('y')).toBe(false);

    // Set data and rebuild cache
    drive._data = [{ id: 'a', name: 'foo' }, { id: 'b', name: 'bar' }];
    drive._buildCache();
    expect(drive.GetItemById('a')).toEqual({ id: 'a', name: 'foo' });
    expect(drive.GetItemByName('bar')).toEqual({ id: 'b', name: 'bar' });
    expect(drive.HasItemById('b')).toBe(true);
    expect(drive.HasItemByName('foo')).toBe(true);
    expect(drive.HasItemById('z')).toBe(false);
    expect(drive.HasItemByName('baz')).toBe(false);

    // Change data, rebuild cache, and test again
    drive._data = [{ id: 'c', name: 'baz' }];
    drive._buildCache();
    expect(drive.GetItemById('c')).toEqual({ id: 'c', name: 'baz' });
    expect(drive.GetItemByName('baz')).toEqual({ id: 'c', name: 'baz' });
    expect(drive.HasItemById('c')).toBe(true);
    expect(drive.HasItemByName('baz')).toBe(true);
    expect(drive.GetItemById('a')).toBeNull();
    expect(drive.HasItemById('a')).toBe(false);
  });
});
