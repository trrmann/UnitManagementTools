describe("Users - UsersDetails includes additional role names in roleNames", () => {
    it("merges additionalRoles names into roleNames, deduping with member.callingRoleNames", async () => {
        const users = new Users();
        // Setup users
        users.users = {
            users: [
                { memberNumber: 1, additionalRoles: ["roleA", "roleB"] },
                { memberNumber: 2, additionalRoles: ["roleC"] },
                { memberNumber: 3 }
            ]
        };
        // Setup members.MembersDetails and Roles
        users.members = {
            MembersDetails: async () => [
                { memberNumber: 1, callingRoleNames: ["Role B", "Role X"] },
                { memberNumber: 2, callingRoleNames: ["Role Y"] },
                { memberNumber: 3, callingRoleNames: ["Role Z"] }
            ],
            Roles: {
                rolesWithCallings: [],
                roles: [
                    { id: "roleA", name: "Role A" },
                    { id: "roleB", name: "Role B" },
                    { id: "roleC", name: "Role C" },
                    { id: "roleX", name: "Role X" },
                    { id: "roleY", name: "Role Y" },
                    { id: "roleZ", name: "Role Z" }
                ]
            }
        };
        const details = await users.UsersDetails();
        // member 1: roleNames = ["Role B", "Role X", "Role A"] (deduped)
        // member 2: roleNames = ["Role Y", "Role C"]
        // member 3: roleNames = ["Role Z"]
        expect(details.find(u => u.memberNumber === 1).roleNames.sort()).toEqual(["Role A", "Role B", "Role X"].sort());
        expect(details.find(u => u.memberNumber === 2).roleNames.sort()).toEqual(["Role C", "Role Y"].sort());
        expect(details.find(u => u.memberNumber === 3).roleNames.sort()).toEqual(["Role Z"].sort());
    });

    it("does not add filtered-out additionalRoles names (with callings) to roleNames", async () => {
        const users = new Users();
        users.users = {
            users: [
                { memberNumber: 1, additionalRoles: ["roleA", "roleB"] }
            ]
        };
        users.members = {
            MembersDetails: async () => [
                { memberNumber: 1, callingRoleNames: ["Role B"] }
            ],
            Roles: {
                rolesWithCallings: ["roleA"],
                roles: [
                    { id: "roleA", name: "Role A" },
                    { id: "roleB", name: "Role B" }
                ]
            }
        };
        // roleA should be filtered out, only roleB remains (but already in callingRoleNames, so deduped)
        const details = await users.UsersDetails();
        expect(details[0].roleNames).toEqual(["Role B"]);
    });
});
describe("Users - UsersDetails includes additional roles in roleIDs", () => {
    it("merges additionalRoles into roleIDs, deduping with member.callingRoleIDs", async () => {
        const users = new Users();
        // Setup users
        users.users = {
            users: [
                { memberNumber: 1, additionalRoles: ["roleA", "roleB"], active: true },
                { memberNumber: 2, additionalRoles: ["roleC"], active: true },
                { memberNumber: 3, active: true }
            ]
        };
        // Setup members.MembersDetails
        users.members = {
            MembersDetails: async () => [
                { memberNumber: 1, callingRoleIDs: ["roleB", "roleX"] },
                { memberNumber: 2, callingRoleIDs: ["roleY"] },
                { memberNumber: 3, callingRoleIDs: ["roleZ"] }
            ],
            Roles: { rolesWithCallings: [] }
        };
        // AdditionalRoles will be [roleA, roleB] for 1, [roleC] for 2
        const details = await users.UsersDetails();
        // member 1: roleIDs = [roleB, roleX, roleA] (deduped)
        // member 2: roleIDs = [roleY, roleC]
        // member 3: roleIDs = [roleZ]
        expect(details.find(u => u.memberNumber === 1).roleIDs.sort()).toEqual(["roleA", "roleB", "roleX"].sort());
        expect(details.find(u => u.memberNumber === 2).roleIDs.sort()).toEqual(["roleC", "roleY"].sort());
        expect(details.find(u => u.memberNumber === 3).roleIDs.sort()).toEqual(["roleZ"].sort());
    });

    it("does not add filtered-out additionalRoles (with callings) to roleIDs", async () => {
        const users = new Users();
        users.users = {
            users: [
                { memberNumber: 1, additionalRoles: ["roleA", "roleB"] }
            ]
        };
        users.members = {
            MembersDetails: async () => [
                { memberNumber: 1, callingRoleIDs: ["roleB"] }
            ],
            Roles: { rolesWithCallings: ["roleA"] }
        };
        // roleA should be filtered out, only roleB remains (but already in callingRoleIDs, so deduped)
        const details = await users.UsersDetails();
        expect(details[0].roleIDs).toEqual(["roleB"]);
    });
});
import { Users } from "../users.mjs";

describe("Users - AdditionalRoles accessor", () => {
    function makeUsersWithAdditionalRoles() {
        return {
            users: [
                { memberNumber: 1, additionalRoles: ["roleA", "roleB"], active: true },
                { memberNumber: 2, additionalRoles: [], active: true },
                { memberNumber: 3, active: true },
                { memberNumber: 4, additionalRoles: ["roleC", "roleD"], active: false },
            ]
        };
    }

    it("returns only users with non-empty additionalRoles arrays, filtering out roles with callings", () => {
        const users = new Users();
        users.users = makeUsersWithAdditionalRoles();
        // Simulate rolesWithCallings = ["roleB", "roleC"] via members.Roles
        users.members = { Roles: { rolesWithCallings: ["roleB", "roleC"] } };
        const result = users.AdditionalRoles;
        expect(result).toEqual([
            { memberNumber: 1, additionalRoles: ["roleA"] },
            { memberNumber: 4, additionalRoles: ["roleD"] }
        ]);
    });

    it("returns all additionalRoles if no rolesWithCallings is set", () => {
        const users = new Users();
        users.users = makeUsersWithAdditionalRoles();
        // No Callings or rolesWithCallings set
        const result = users.AdditionalRoles;
        expect(result).toEqual([
            { memberNumber: 1, additionalRoles: ["roleA", "roleB"] },
            { memberNumber: 4, additionalRoles: ["roleC", "roleD"] }
        ]);
    });

    it("returns an empty array if all additionalRoles are filtered out", () => {
        const users = new Users();
        users.users = makeUsersWithAdditionalRoles();
        users.members = { Roles: { rolesWithCallings: ["roleA", "roleB", "roleC", "roleD"] } };
        expect(users.AdditionalRoles).toEqual([]);
    });

    it("returns an empty array if no users have additionalRoles", () => {
        const users = new Users();
        users.users = { users: [ { memberNumber: 1, active: true }, { memberNumber: 2, additionalRoles: [], active: false } ] };
        expect(users.AdditionalRoles).toEqual([]);
    });

    it("returns an empty array if users is undefined or not an array", () => {
        const users = new Users();
        users.users = undefined;
        expect(users.AdditionalRoles).toEqual([]);
        users.users = { users: undefined };
        expect(users.AdditionalRoles).toEqual([]);
    });
});