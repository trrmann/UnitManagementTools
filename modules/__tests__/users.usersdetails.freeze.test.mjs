import { Users } from "../users.mjs";

describe("UsersDetails API safety (dev mode)", () => {
    const OLD_ENV = process.env.NODE_ENV;
    beforeAll(() => { process.env.NODE_ENV = "development"; });
    afterAll(() => { process.env.NODE_ENV = OLD_ENV; });

    it("should freeze the returned array and objects in development mode", async () => {
        const users = new Users();
        users.members = { MembersDetails: async () => [{ memberNumber: 1, callingRoleIDs: ["a"], callingRoleNames: ["RoleA"] }] };
        users.users = { users: [{ memberNumber: 1, additionalRoles: ["b"], active: true }] };
        const details = await users.UsersDetails();
        expect(Object.isFrozen(details)).toBe(true);
        expect(Object.isFrozen(details[0])).toBe(true);
        expect(() => { details[0].fullname = "hacked"; }).toThrow();
        expect(() => { details.push({}); }).toThrow();
    });
});
