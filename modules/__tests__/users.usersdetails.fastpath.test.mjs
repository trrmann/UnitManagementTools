import { Users } from "../users.mjs";

describe("UsersDetails fast path optimizations", () => {
    it("should return an empty array immediately if there are no user entries", async () => {
        const users = new Users();
        users.members = { MembersDetails: async () => [] };
        users.users = { users: [] };
        const details = await users.UsersDetails();
        expect(Array.isArray(details)).toBe(true);
        expect(details.length).toBe(0);
    });
});
