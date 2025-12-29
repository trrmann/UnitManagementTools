import { Users } from "../users.mjs";

describe("Members.members Proxy cache invalidation", () => {
    it("should invalidate the users details cache when members.members is mutated", async () => {
        const users = new Users();
        users.Members = { MembersDetails: async () => [{ memberNumber: 1, callingRoleIDs: ["a"], callingRoleNames: ["RoleA"] }], members: [{ memberNumber: 1, callingRoleIDs: ["a"], callingRoleNames: ["RoleA"] }] };
        users.Users = { users: [{ memberNumber: 1, additionalRoles: ["b"], active: true }] };
        // Prime the cache
        const details1 = await users.UsersDetails();
        // Mutate members.members
        users.members.members.push({ memberNumber: 2, callingRoleIDs: ["c"], callingRoleNames: ["RoleC"] });
        // The cache should be invalidated, so a new call should not return the same array
        const details2 = await users.UsersDetails();
        expect(details2).not.toBe(details1);
        // Should still work and return at least the original user
        expect(details2.length).toBeGreaterThanOrEqual(1);
    });
});
