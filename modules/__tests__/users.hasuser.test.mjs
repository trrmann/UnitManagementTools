import { Users } from "../users.mjs";

describe("Users - HasUserById and HasUserByEmail", () => {
    let users;
    beforeEach(() => {
        users = new Users();
        users.users = { users: [
            { memberNumber: 1, password: "pw1", email: "a@b.com", active: true },
            { memberNumber: 2, password: "pw2", email: "b@b.com", active: false }
        ] };
        users.members = {
            MembersDetails: async () => [
                { memberNumber: 1, callingRoleIDs: ["roleA"], callingRoleNames: ["Role A"], fullname: "A", email: "a@b.com" },
                { memberNumber: 2, callingRoleIDs: ["roleB"], callingRoleNames: ["Role B"], fullname: "B", email: "b@b.com" }
            ],
            Roles: { roles: [ { id: "roleA", name: "Role A" }, { id: "roleB", name: "Role B" } ] }
        };
    });

    it("HasUserById returns true if user exists, false otherwise", async () => {
        expect(await users.HasUserById(1)).toBe(true);
        expect(await users.HasUserById("2")).toBe(true);
        expect(await users.HasUserById(999)).toBe(false);
    });

    it("HasUserByEmail returns true if user exists, false otherwise", async () => {
        expect(await users.HasUserByEmail("a@b.com")).toBe(true);
        expect(await users.HasUserByEmail("b@b.com")).toBe(true);
        expect(await users.HasUserByEmail("no@b.com")).toBe(false);
    });
});