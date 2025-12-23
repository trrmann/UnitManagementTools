
import { Roles } from "./roles.mjs";
import { Org } from "./org.mjs";

export class Members {

    // ===== Instance Accessors =====
    get Storage() { return this.storage; }
    get Members() { return this.members; }
    get Roles() { return this.roles; }
    get Callings() { return this.callings; }
    get Org() { return this.org; }

    // ===== Constructor =====
    constructor(configuration) {
        this.storage = configuration._storageObj;
        this.members = undefined;
        this.roles = undefined;
        this.callings = undefined;
        this.org = undefined;
    }

    // ===== Static Methods =====
    static CopyFromJSON(dataJSON) {
        const members = new Members(dataJSON._storageObj);
        members.members = dataJSON.members;
        members.roles = dataJSON.roles;
        members.callings = dataJSON.callings;
        members.org = dataJSON.org;
        return members;
    }

    static CopyToJSON(instance) {
        return {
            _storageObj: instance.storage,
            members: instance.members,
            roles: instance.roles,
            callings: instance.callings,
            org: instance.org
        };
    }

    static CopyFromObject(destination, source) {
        destination.storage = source.storage;
        destination.members = source.members;
        destination.roles = source.roles;
        destination.callings = source.callings;
        destination.org = source.org;
    }

    static async Factory(configuration) {
        const members = new Members(configuration);
        await members.Fetch();
        members.roles = await Roles.Factory(configuration);
        members.callings = members.roles.Callings;
        members.org = await Org.Factory(configuration);
        return members;
    }

    // ===== File/Storage Accessors =====
    static get MembersFileBasename() { return "members"; }
    static get MembersFileExtension() { return "json"; }
    static get MembersFilename() { return `${Members.MembersFileBasename}.${Members.MembersFileExtension}`; }
    static get MembersCacheExpireMS() { return 1000 * 60 * 30; }
    static get MembersSessionExpireMS() { return 1000 * 60 * 60; }
    static get MembersLocalExpireMS() { return 1000 * 60 * 60 * 2; }
    static get StorageConfig() {
        return {
            cacheTtlMs: Members.MembersCacheExpireMS,
            sessionTtlMs: Members.MembersSessionExpireMS,
            localTtlMs: Members.MembersLocalExpireMS,
            googleId: null,
            githubFilename: null,
            privateKey: null,
            publicKey: null,
            secure: false
        };
    }

    // ===== Data Fetching =====
    async Fetch() {
        let membersObj = await this.Storage.Get(Members.MembersFilename, Members.StorageConfig);
        this.members = membersObj ? membersObj : undefined;
    }

    // ===== Core Data Accessors =====
    get MemberEntries() { return this.members?.members || []; }

    async GetMembers() {
        const callings = this.callings.CallingsDetails;
        const roles = this.roles.RolesDetails;
        const org = this.org.Organization;
        const memberEntries = this.MemberEntries;
        return memberEntries.map(member => {
            // ...existing code for mapping members...
            // Allow members with no callings
            const memberCallings = Array.isArray(member.callings) ? member.callings : [];
            const callingsResolved = memberCallings.length > 0 ? memberCallings.filter(callingid => this.callings.CallingIds.includes(callingid)).map(callingid => this.callings.CallingById(callingid)) : [];
            const callingNames = callingsResolved.length > 0 ? callingsResolved.map(callingArr => (callingArr && callingArr[0]) ? callingArr[0].name : null) : [];
            const callingLevels = callingsResolved.length > 0 ? callingsResolved.map(callingArr => (callingArr && callingArr[0]) ? callingArr[0].level : null) : [];
            const callingsActive = callingsResolved.length > 0 ? callingsResolved.map(callingArr => (callingArr && callingArr[0]) ? callingArr[0].active === true : false) : [];
            const callingHaveTitles = callingsResolved.length > 0 ? callingsResolved.map(callingArr => (callingArr && callingArr[0]) ? callingArr[0].hasTitle : null) : [];
            const callingTitles = callingsResolved.length > 0 ? callingsResolved.map(callingArr => (callingArr && callingArr[0]) ? callingArr[0].title : null) : [];
            const callingTitleOrdinals = callingsResolved.length > 0 ? callingsResolved.map(callingArr => (callingArr && callingArr[0]) ? callingArr[0].titleOrdinal : null) : [];
            // Add callings-role-id: single array of unique role ids for all callings
            const rawCallingsRoles = callingsResolved.length > 0
                ? callingsResolved.map(callingArr => {return roles.filter(function(r){return callingArr.map(call => {return call.id;}).includes(r.callingID);});})
                    .filter(role => {return role !== null && role !== undefined;})
                : [];
            const callingsRoles = [];
            if (rawCallingsRoles.length > 0) {
                rawCallingsRoles.forEach(roleArray => {roleArray.forEach(role => {if(!callingsRoles.includes(role)) {callingsRoles.push(role);}})});
            }
            const callingsRoleId = callingsRoles.length > 0 ? callingsRoles.map(role => {return role.id;}) : [];
            const callingsRoleName = callingsRoles.length > 0 ? callingsRoles.map(role => {return role.name;}) : [];
            const callingSubRoles = callingsRoleId.length > 0 ? callingsRoleId.map(callingRoleId => {
                const role = roles.filter(role => {return role.id === callingRoleId})[0];
                return role ? role.subRoles : undefined;
            }) : [];
            const callingSubRoleNames = callingsRoleId.length > 0 ? callingsRoleId.map(callingRoleId => {
                const role = roles.filter(role => {return role.id === callingRoleId})[0];
                return role ? role.subRoleNames : undefined;
            }) : [];
            const callingAllSubRoles = callingsRoleId.length > 0 ? callingsRoleId.map(callingRoleId => {
                const role = roles.filter(role => {return role.id === callingRoleId})[0];
                return role ? role.allSubRoles : undefined;
            }) : [];
            const callingAllSubRoleNames = callingsRoleId.length > 0 ? callingsRoleId.map(callingRoleId => {
                const role = roles.filter(role => {return role.id === callingRoleId})[0];
                return role ? role.allSubRoleNames : undefined;
            }) : [];

            // Build full name with title or default prefix
            let prefix = null;
            // Find the calling title with the lowest non-null ordinal
            let minOrdinal = null;
            let selectedTitle = null;
            for (let i = 0; i < callingTitles.length; i++) {
                const title = callingTitles[i];
                const ordinal = callingTitleOrdinals[i];
                if (title && title.trim() && ordinal !== null && ordinal !== undefined) {
                    if (minOrdinal === null || ordinal < minOrdinal) {
                        minOrdinal = ordinal;
                        selectedTitle = title;
                    }
                }
            }
            // If no ordinal-based title, fallback to first non-empty title
            if (!selectedTitle) {
                selectedTitle = callingTitles.find(t => t && t.trim());
            }
            if (selectedTitle) {
                prefix = selectedTitle;
            } else {
                prefix = (member.genderMale === true) ? "Brother" : "Sister";
            }
            const nameParts = [];
            if (member.firstName) nameParts.push(member.firstName);
            if (member.middleName) nameParts.push(member.middleName);
            if (member.maidenName && member.genderMale === false) nameParts.push(member.maidenName);
            if (member.maternalLastName) nameParts.push(member.maternalLastName);
            if (member.paternalLastName) nameParts.push(member.paternalLastName);
            const fullname = [prefix, ...nameParts.filter(Boolean)].join(' ');
            // Titleless full name (no prefix/title)
            const titlelessFullname = nameParts.filter(Boolean).join(' ');

            const stake = this.org.StakeByUnitNumber(member.stakeUnitNumber);
            const unit = this.org.UnitByNumber(member.unitNumber);
            const stakeName = stake ? stake.name : '';
            const unitName = unit ? unit.name : '';
            const unitType = unit ? unit.type : '';

            return {
                memberNumber: member.memberNumber,
                fullname: fullname,
                titlelessFullname: titlelessFullname,
                firstName: member.firstName,
                middleName: member.middleName,
                maidenName: member.maidenName,
                maternalLastName: member.maternalLastName,
                paternalLastName: member.paternalLastName,
                maidenNameMaternal: member.maidenNameMaternal,
                genderMale: member.genderMale,
                gender: member.genderMale === true ? "Male" : "Female",
                email: member.email,
                phone: member.phone,
                callingIDs: member.callings,
                callingNames: callingNames,
                levels: callingLevels,
                callingsActive: callingsActive,
                callingHaveTitles: callingHaveTitles,
                callingTitles: callingTitles,
                callingTitleOrdinals: callingTitleOrdinals,
                callingRoleIDs: callingsRoleId,
                callingRoleNames: callingsRoleName,
                callingsSubRoles: callingSubRoles,
                callingsSubRoleNames: callingSubRoleNames,
                callingsAllSubRoles: callingAllSubRoles,
                callingsAllSubRoleNames: callingAllSubRoleNames,
                active: member.active,
                stakeUnitNumber: member.stakeUnitNumber,
                unitNumber: member.unitNumber,
                stakeName: stakeName,
                unitName: unitName,
                unitType: unitType
            };
        });
    }

    // ===== Leadership Lookups =====
    static GetStakeLeadership(orgInstance, stakeUnitNumber) {
        if (!orgInstance || typeof orgInstance.StakeByUnitNumber !== 'function') return null;
        const stake = orgInstance.StakeByUnitNumber(stakeUnitNumber);
        return stake && stake.leadership ? stake.leadership : null;
    }

    static GetWardLeadership(orgInstance, wardUnitNumber) {
        if (!orgInstance || typeof orgInstance.WardByNumber !== 'function') return null;
        const ward = orgInstance.WardByNumber(wardUnitNumber);
        return ward && ward.leadership ? ward.leadership : null;
    }
}