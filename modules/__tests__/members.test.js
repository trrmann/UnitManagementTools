import { Members } from '../members.mjs';
import { Roles } from '../roles.mjs';
import { Org } from '../org.mjs';

// Mock Org and Roles static methods for JSON
Org.CopyFromJSON = jest.fn(() => ({ org: [] }));
Roles.CopyFromJSON = jest.fn(() => ({ roles: [] }));

describe('Members', () => {
  let members;

  beforeEach(() => {
    members = new Members();
    // Minimal mock for roles and org
    members.roles = {
      Callings: {
        storage: {
          Get: jest.fn(async () => ({ members: [{ memberNumber: 1, firstName: 'John', genderMale: true, callings: [101], active: true, stakeUnitNumber: 1, unitNumber: 2 }] }) ),
          Cache: { Set: jest.fn() },
          SessionStorage: { Set: jest.fn() }
        },
        CallingIds: [101],
        CallingById: jest.fn(() => [{ id: 101, name: 'Bishop', level: 'Ward', active: true, hasTitle: true, title: 'Bishop', titleOrdinal: 1 }]),
        CallingsDetails: [{ id: 101, name: 'Bishop', level: 'Ward', active: true, hasTitle: true, title: 'Bishop', titleOrdinal: 1 }]
      },
      RolesDetails: [{ id: 201, name: 'Leader', callingID: 101, subRoles: [], subRoleNames: [], allSubRoles: [], allSubRoleNames: [] }]
    };
    members.org = {
      StakeByUnitNumber: jest.fn(() => ({ name: 'StakeName', leadership: [{ id: 1, name: 'Stake President' }] })),
      UnitByNumber: jest.fn(() => ({ name: 'UnitName', type: 'Ward' })),
      WardByNumber: jest.fn(() => ({ leadership: [{ id: 2, name: 'Bishop' }] }))
    };
  });

  test('constructor initializes properties', () => {
    const m = new Members();
    expect(m.members).toBeUndefined();
    expect(m.roles).toBeUndefined();
    expect(m.org).toBeUndefined();
  });

  test('CopyFromJSON and CopyToJSON work as expected', () => {
    const json = { members: [{ memberNumber: 1 }], roles: { roles: [] }, org: { org: [] } };
    const m = Members.CopyFromJSON(json);
    expect(m.members).toEqual(json.members);
    expect(Members.CopyToJSON(m).members).toEqual(json.members);
  });

  test('CopyFromObject copies properties', () => {
    const src = { members: [{ memberNumber: 2 }], roles: { roles: [] }, org: { org: [] } };
    const dest = new Members();
    Members.CopyFromObject(dest, src);
    expect(dest.members).toEqual(src.members);
  });

  test('Factory returns new instance', async () => {
    // Provide a configuration mock with required storage
    const config = {
      _storageObj: {
        Get: jest.fn(async () => ({ members: [{ memberNumber: 1 }] })),
        Cache: { Set: jest.fn() },
        SessionStorage: { Set: jest.fn() }
      }
    };
    // Also mock Roles.Factory and Org.Factory
    Roles.Factory = jest.fn(async () => ({
      Callings: {
        storage: config._storageObj,
        CallingIds: [101],
        CallingById: jest.fn(() => [{ id: 101, name: 'Bishop', level: 'Ward', active: true, hasTitle: true, title: 'Bishop', titleOrdinal: 1 }]),
        CallingsDetails: [{ id: 101, name: 'Bishop', level: 'Ward', active: true, hasTitle: true, title: 'Bishop', titleOrdinal: 1 }]
      },
      RolesDetails: [{ id: 201, name: 'Leader', callingID: 101, subRoles: [], subRoleNames: [], allSubRoles: [], allSubRoleNames: [] }]
    }));
    Org.Factory = jest.fn(async () => ({
      StakeByUnitNumber: jest.fn(() => ({ name: 'StakeName', leadership: [{ id: 1, name: 'Stake President' }] })),
      UnitByNumber: jest.fn(() => ({ name: 'UnitName', type: 'Ward' })),
      WardByNumber: jest.fn(() => ({ leadership: [{ id: 2, name: 'Bishop' }] }))
    }));
    const m = await Members.Factory(config);
    expect(m).toBeInstanceOf(Members);
  });

  test('Fetch sets members property', async () => {
    await members.Fetch();
    expect(Array.isArray(members.MemberEntries)).toBe(true);
    expect(members.MemberEntries.length).toBeGreaterThan(0);
  });

  test('MembersDetails returns mapped details', async () => {
    await members.Fetch();
    const details = await members.MembersDetails();
    expect(Array.isArray(details)).toBe(true);
    expect(details[0].fullname).toContain('Bishop John');
    expect(details[0].stakeName).toBe('StakeName');
    expect(details[0].unitName).toBe('UnitName');
    expect(details[0].unitType).toBe('Ward');
  });

  test('GetStakeLeadership returns leadership', () => {
    const leadership = Members.GetStakeLeadership(members.org, 1);
    expect(Array.isArray(leadership)).toBe(true);
    expect(leadership[0].name).toBe('Stake President');
  });

  test('GetWardLeadership returns leadership', () => {
    const leadership = Members.GetWardLeadership(members.org, 2);
    expect(Array.isArray(leadership)).toBe(true);
    expect(leadership[0].name).toBe('Bishop');
  });
});
