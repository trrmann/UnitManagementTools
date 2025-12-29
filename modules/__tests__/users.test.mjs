import { Users } from '../users.mjs';

describe('Users Class', () => {
  let users;
  let mockMembers;
  let mockRoles;
  const mockMembersData = [
    {
      memberNumber: '1',
      fullname: 'John Doe',
      email: 'john@example.com',
      active: true,
      callingIDs: ['c1'],
      callingNames: ['Bishop'],
      callingRoleIDs: [1],
      callingRoleNames: ['Bishop'],
    },
    {
      memberNumber: '2',
      fullname: 'Jane Smith',
      email: 'jane@example.com',
      active: false,
      callingIDs: ['c2'],
      callingNames: ['Clerk'],
      callingRoleIDs: [6],
      callingRoleNames: ['Clerk'],
    }
  ];
  const mockUsersData = {
    users: [
      { memberNumber: '1', password: 'pass1', email: 'john@example.com', active: true, roles: [] },
      { memberNumber: '2', password: 'pass2', email: 'jane@example.com', active: false, roles: [] },
      { memberNumber: '3', password: 'pass3', email: 'other@example.com', active: true, roles: [] }
    ]
  };
  beforeEach(() => {
    users = new Users();
    mockRoles = {
      RoleById: jest.fn((id) => {
        const roleMap = {
          '-1': [{ id: -1, name: 'Application Administrator' }],
          '-2': [{ id: -2, name: 'Application Tester' }],
          '-3': [{ id: -3, name: 'Application Developer' }],
          '1': [{ id: 1, name: 'Bishop' }],
          '6': [{ id: 6, name: 'Clerk' }],
        };
        return roleMap[String(id)] || [];
      })
    };
    mockMembers = {
      MembersDetails: jest.fn(async () => mockMembersData),
      Roles: mockRoles
    };
    users.members = mockMembers;
    // Deep copy the mock data to avoid mutation between tests
    users.users = JSON.parse(JSON.stringify(mockUsersData));
  });

  describe('Initialization', () => {
    test('constructor initializes properties', () => {
      expect(users.users).toBeDefined();
      expect(users.members).toBeDefined();
    });
  });

  describe('User queries', () => {
    test('UserEntries returns all user objects', () => {
      expect(users.UserEntries.length).toBe(3);
    });
    test('ActiveUsers returns only active users', () => {
      expect(users.ActiveUsers.length).toBe(2);
      expect(users.ActiveUsers[0].memberNumber).toBe('1');
      expect(users.ActiveUsers[1].memberNumber).toBe('3');
    });
  });

  describe('User details and lookup', () => {
    test('UsersDetails returns enriched user details', async () => {
      const details = await users.UsersDetails();
      expect(details.length).toBe(3);
      expect(details[0].fullname).toBe('John Doe');
      expect(details[1].fullname).toBe('Jane Smith');
      expect(details[2].fullname).toBe(''); // No member match
    });
    test('UserById returns correct user', async () => {
      const result = await users.UserById('1');
      expect(result.length).toBe(1);
      expect(result[0].fullname).toBe('John Doe');
    });
    test('UserByEmail returns correct user', async () => {
      const result = await users.UserByEmail('jane@example.com');
      expect(result.length).toBe(1);
      expect(result[0].fullname).toBe('Jane Smith');
    });
    test('HasUserById returns true for existing user', async () => {
      const exists = await users.HasUserById('1');
      expect(exists).toBe(true);
      const notExists = await users.HasUserById('99');
      expect(notExists).toBe(false);
    });
  });

  describe('Additional roles from user record (TODO #06)', () => {
    test('UsersDetails includes additional roles from user.roles', async () => {
      // Add additional roles to user records
      users.users.users[0].roles = [-1]; // Application Administrator
      users.users.users[2].roles = [-2, -3]; // Application Tester and Developer

      const details = await users.UsersDetails();
      
      // User 1 should have both calling role (1=Bishop) and additional role (-1=Application Administrator)
      expect(details[0].roleIDs).toEqual([1, -1]);
      expect(details[0].roleNames).toEqual(['Bishop', 'Application Administrator']);
      
      // User 2 has no additional roles
      expect(details[1].roleIDs).toEqual([6]);
      expect(details[1].roleNames).toEqual(['Clerk']);
      
      // User 3 has no member data but has additional roles
      expect(details[2].roleIDs).toEqual([-2, -3]);
      expect(details[2].roleNames).toEqual(['Application Tester', 'Application Developer']);
    });

    test('UsersDetails handles empty roles array', async () => {
      const details = await users.UsersDetails();
      
      // All users have empty roles arrays
      expect(details[0].roleIDs).toEqual([1]); // Only calling role
      expect(details[1].roleIDs).toEqual([6]); // Only calling role
      expect(details[2].roleIDs).toEqual([]); // No roles at all
    });

    test('UsersDetails handles missing roles property', async () => {
      // Remove roles property from users
      delete users.users.users[0].roles;
      delete users.users.users[1].roles;
      delete users.users.users[2].roles;

      const details = await users.UsersDetails();
      
      // Should still work with default empty array
      expect(details[0].roleIDs).toEqual([1]); // Only calling role
      expect(details[1].roleIDs).toEqual([6]); // Only calling role
      expect(details[2].roleIDs).toEqual([]); // No roles at all
    });

    test('UsersDetails does not duplicate role IDs', async () => {
      // User already has role 1 from calling, add it again in additional roles
      users.users.users[0].roles = [1]; 

      const details = await users.UsersDetails();
      
      // Should not have duplicate role ID
      expect(details[0].roleIDs).toEqual([1]);
      expect(details[0].roleNames).toEqual(['Bishop']);
    });

    test('UsersDetails handles invalid role IDs gracefully', async () => {
      // Add an invalid role ID
      users.users.users[0].roles = [999]; 

      const details = await users.UsersDetails();
      
      // Should include the role ID but not the name (since it doesn't exist)
      expect(details[0].roleIDs).toEqual([1, 999]);
      expect(details[0].roleNames).toEqual(['Bishop']); // No name for invalid role
    });
  });
});
