import { Users } from "../users.mjs";

describe("Users - UserById and UserByEmail API ergonomics and performance", () => {
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

    it("UserById returns single user object or null", async () => {
        const user1 = await users.UserById(1);
        expect(user1).toBeTruthy();
        expect(user1.memberNumber).toBe(1);
        const user2 = await users.UserById("2");
        expect(user2).toBeTruthy();
        expect(user2.memberNumber).toBe(2);
        const userNone = await users.UserById(999);
        expect(userNone).toBeNull();
    });

    it("UserByEmail returns single user object or null", async () => {
        const user1 = await users.UserByEmail("a@b.com");
        expect(user1).toBeTruthy();
        expect(user1.email).toBe("a@b.com");
        const user2 = await users.UserByEmail("b@b.com");
        expect(user2).toBeTruthy();
        expect(user2.email).toBe("b@b.com");
        const userNone = await users.UserByEmail("no@b.com");
        expect(userNone).toBeNull();
    });
});