import { Users } from "../users.mjs";

describe("Users.InvalidateUsersDetailsCache", () => {
    it("should clear the cached users details when called (observable effect)", async () => {
        const users = new Users();
        let membersDetailsCallCount = 0;
        users.members = {
            MembersDetails: async () => {
                membersDetailsCallCount++;
                return [{ memberNumber: 1, callingRoleIDs: ["a"], callingRoleNames: ["RoleA"] }];
            }
        };
        users.users = { users: [{ memberNumber: 1, additionalRoles: ["b"], active: true }] };
        // First call should call MembersDetails
        await users.UsersDetails();
        expect(membersDetailsCallCount).toBe(1);
        // Second call should use cache (no new call)
        await users.UsersDetails();
        expect(membersDetailsCallCount).toBe(1);
        // Invalidate cache
        users.InvalidateUsersDetailsCache();
        // Next call should call MembersDetails again
        await users.UsersDetails();
        expect(membersDetailsCallCount).toBe(2);
    });
});
