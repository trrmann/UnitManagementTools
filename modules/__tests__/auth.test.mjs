
import { Auth } from '../auth.mjs';
import { JSDOM } from 'jsdom';

const mockConfig = {
  configuration: {
    login: {
      target: 'target',
      destinationID: 'modal',
      formID: 'loginForm',
      emailInputID: 'emailInput',
      emailListID: 'emailList',
      passwordInputID: 'passwordInput',
    },
    main: {
      container: 'mainContainer',
      roleSelector: 'roleSelector',
      selectedRoles: 'selectedRoles',
      logout: 'logoutBtn',
    }
  },
  _storageObj: {}
};

describe('Auth', () => {
  let auth;

  beforeEach(() => {
    // Setup jsdom for DOM mocking
    const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>');
    global.document = dom.window.document;
    global.window = dom.window;
    // Create the required target element for modal placement
    const targetDiv = document.createElement('div');
    targetDiv.id = mockConfig.configuration.login.target;
    document.body.appendChild(targetDiv);
    auth = new Auth(mockConfig);
  });

  test('constructor initializes properties', () => {
    expect(auth.target).toBe('target');
    expect(auth.destinationID).toBe('modal');
    expect(auth.formID).toBe('loginForm');
    expect(auth.emailInputID).toBe('emailInput');
    expect(auth.emailListID).toBe('emailList');
    expect(auth.passwordInputID).toBe('passwordInput');
    expect(auth.mainContainerID).toBe('mainContainer');
    expect(auth.roleSelectorID).toBe('roleSelector');
    expect(auth.selectedRolesID).toBe('selectedRoles');
    expect(auth.logoutID).toBe('logoutBtn');
    expect(auth.allUsers).toEqual([]);
    expect(auth.currentUser).toBeNull();
  });

  test('CreateLoginModalWithSpecs creates modal if not present', () => {
    expect(document.getElementById(auth.destinationID)).toBeNull();
    auth.CreateLoginModalWithSpecs();
    expect(document.getElementById(auth.destinationID)).not.toBeNull();
  });

  test('CreateLoginModalWithSpecs does not duplicate modal', () => {
    auth.CreateLoginModalWithSpecs();
    auth.CreateLoginModalWithSpecs();
    expect(document.querySelectorAll(`#${auth.destinationID}`).length).toBe(1);
  });

  // Additional tests for login logic, error handling, and session restoration would require more extensive mocking
});

describe('Auth - Role Selector Caching', () => {
  let auth, dom;

  beforeEach(() => {
    // Setup jsdom for DOM mocking
    dom = new JSDOM('<!DOCTYPE html><html><body></body></html>');
    global.document = dom.window.document;
    global.window = dom.window;
    
    // Create the required elements
    const targetDiv = document.createElement('div');
    targetDiv.id = mockConfig.configuration.login.target;
    document.body.appendChild(targetDiv);
    
    const roleSelector = document.createElement('select');
    roleSelector.id = 'roleSelector';
    const defaultOption = document.createElement('option');
    defaultOption.value = '';
    defaultOption.textContent = 'Select Role';
    roleSelector.appendChild(defaultOption);
    document.body.appendChild(roleSelector);
    
    const selectedRoles = document.createElement('div');
    selectedRoles.id = 'selectedRoles';
    document.body.appendChild(selectedRoles);
    
    auth = new Auth(mockConfig);
  });

  test('LoadRoleSelector filters roles correctly', async () => {
    auth.currentUser = {
      fullname: 'John Doe',
      roleNames: ['Bishop', 'Ward Council', 'John Doe', 'Stake Council'],
      callingTitles: ['Bishop'],
      roleIDs: [1, 2, 3, 4]
    };

    await auth.LoadRoleSelector();
    
    const roleSelector = document.getElementById('roleSelector');
    // Should have 'Ward Council' and 'Stake Council' options (Bishop and John Doe filtered out)
    expect(roleSelector.options.length).toBe(3); // default + 2 filtered roles
    expect(roleSelector.style.display).toBe('block');
  });

  test('LoadRoleSelector handles user with no roles gracefully', async () => {
    auth.currentUser = {
      fullname: 'John Doe',
      roleNames: [],
      callingTitles: [],
      roleIDs: []
    };

    await auth.LoadRoleSelector();
    
    const roleSelector = document.getElementById('roleSelector');
    expect(roleSelector.style.display).toBe('none');
  });

  test('LoadRoleSelector handles user with single unique role', async () => {
    auth.currentUser = {
      fullname: 'John Doe',
      roleNames: ['Ward Council'],
      callingTitles: [],
      roleIDs: [2]
    };

    await auth.LoadRoleSelector();
    
    const selectedRoles = document.getElementById('selectedRoles');
    expect(selectedRoles.children.length).toBe(1);
    expect(selectedRoles.children[0].textContent).toBe('Ward Council');
  });

  test('LoadRoleSelector sets activeRole from currentUser if valid', async () => {
    auth.currentUser = {
      fullname: 'John Doe',
      roleNames: ['Ward Council', 'Stake Council'],
      callingTitles: [],
      roleIDs: [2, 3],
      activeRole: 'Stake Council'
    };

    await auth.LoadRoleSelector();
    
    const roleSelector = document.getElementById('roleSelector');
    expect(roleSelector.value).toBe('Stake Council');
  });

  test('LoadRoleSelector defaults to first role if activeRole not in list', async () => {
    auth.currentUser = {
      fullname: 'John Doe',
      roleNames: ['Ward Council', 'Stake Council'],
      callingTitles: [],
      roleIDs: [2, 3],
      activeRole: 'Invalid Role'
    };

    await auth.LoadRoleSelector();
    
    const roleSelector = document.getElementById('roleSelector');
    expect(roleSelector.value).toBe('Ward Council');
  });

  test('LoadRoleSelector caches filtered roles for same user data', async () => {
    auth.currentUser = {
      fullname: 'John Doe',
      roleNames: ['Ward Council', 'Stake Council'],
      callingTitles: [],
      roleIDs: [2, 3]
    };

    // First call should compute and cache
    await auth.LoadRoleSelector();
    expect(auth._roleCacheKey).toBeDefined();
    expect(auth._cachedFilteredRoles).toEqual(['Ward Council', 'Stake Council']);
    
    const firstCacheKey = auth._roleCacheKey;
    const firstCachedRoles = auth._cachedFilteredRoles;

    // Second call with same data should use cache
    await auth.LoadRoleSelector();
    expect(auth._roleCacheKey).toBe(firstCacheKey);
    expect(auth._cachedFilteredRoles).toBe(firstCachedRoles); // Same reference
  });

  test('LoadRoleSelector recomputes when user data changes', async () => {
    auth.currentUser = {
      fullname: 'John Doe',
      roleNames: ['Ward Council', 'Stake Council'],
      callingTitles: [],
      roleIDs: [2, 3]
    };

    await auth.LoadRoleSelector();
    const firstCacheKey = auth._roleCacheKey;

    // Change user data
    auth.currentUser.roleNames = ['Ward Council', 'Stake Council', 'Area Council'];
    
    await auth.LoadRoleSelector();
    expect(auth._roleCacheKey).not.toBe(firstCacheKey);
    expect(auth._cachedFilteredRoles).toEqual(['Ward Council', 'Stake Council', 'Area Council']);
  });
});
