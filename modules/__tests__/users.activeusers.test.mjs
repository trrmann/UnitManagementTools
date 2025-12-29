import { Users } from "../users.mjs";

describe("Users - ActiveUserDetails", () => {
    let users;
    beforeEach(() => {
        users = new Users();
        users.users = { users: [
            { memberNumber: 1, password: "pw1", email: "a@b.com", active: true },
            { memberNumber: 2, password: "pw2", email: "b@b.com", active: false },
            { memberNumber: 3, password: "pw3", email: "c@b.com", active: true }
        ] };
        users.members = {
            MembersDetails: async () => [
                { memberNumber: 1, callingRoleIDs: ["roleA"], callingRoleNames: ["Role A"], fullname: "A", email: "a@b.com" },
                { memberNumber: 2, callingRoleIDs: ["roleB"], callingRoleNames: ["Role B"], fullname: "B", email: "b@b.com" },
                { memberNumber: 3, callingRoleIDs: ["roleC"], callingRoleNames: ["Role C"], fullname: "C", email: "c@b.com" }
            ],
            Roles: { roles: [ { id: "roleA", name: "Role A" }, { id: "roleB", name: "Role B" }, { id: "roleC", name: "Role C" } ] }
        };
    });

    it("returns only active users with merged details", async () => {
        const active = await users.ActiveUserDetails();
        expect(Array.isArray(active)).toBe(true);
        expect(active.length).toBe(2);
        expect(active.map(u => u.memberNumber).sort()).toEqual([1,3]);
        expect(active[0]).toHaveProperty("fullname");
        expect(active[0]).toHaveProperty("roleIDs");
    });
});