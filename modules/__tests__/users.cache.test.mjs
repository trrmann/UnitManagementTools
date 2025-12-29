import { Users } from "../users.mjs";

describe("Users - UsersDetails cache", () => {
    it("caches UsersDetails result and invalidates on users/members set", async () => {
        const users = new Users();
        let callCount = 0;
        users.users = { users: [ { memberNumber: 1 } ] };
        users.members = {
            MembersDetails: async () => { callCount++; return [ { memberNumber: 1, callingRoleIDs: ["roleA"] } ]; },
            Roles: { roles: [ { id: "roleA", name: "Role A" } ] }
        };
        // First call populates cache
        const d1 = await users.UsersDetails();
        expect(callCount).toBe(1);
        // Second call uses cache
        const d2 = await users.UsersDetails();
        expect(callCount).toBe(1);
        expect(d2).toBe(d1);
        // Invalidate by setting users
        users.Users = { users: [ { memberNumber: 1 } ] };
        await users.UsersDetails();
        expect(callCount).toBe(2);
        // Invalidate by setting members
        users.Members = {
            MembersDetails: async () => { callCount++; return [ { memberNumber: 1, callingRoleIDs: ["roleA"] } ]; },
            Roles: { roles: [ { id: "roleA", name: "Role A" } ] }
        };
        await users.UsersDetails();
        expect(callCount).toBe(3);
    });
});