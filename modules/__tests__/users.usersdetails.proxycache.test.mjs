import { Users } from "../users.mjs";

describe("Users.users Proxy cache invalidation", () => {
    it("should invalidate the users details cache when users.users is mutated", async () => {
        const users = new Users();
        users.members = { MembersDetails: async () => [{ memberNumber: 1, callingRoleIDs: ["a"], callingRoleNames: ["RoleA"] }] };
        users.Users = { users: [{ memberNumber: 1, additionalRoles: ["b"], active: true }] };
        // Prime the cache
        const details1 = await users.UsersDetails();
        // Mutate users.users
        users.users.users.push({ memberNumber: 2, additionalRoles: ["c"], active: false });
        // The cache should be invalidated, so a new call should not return the same array
        const details2 = await users.UsersDetails();
        expect(details2).not.toBe(details1);
        expect(details2.length).toBe(2);
    });
});
