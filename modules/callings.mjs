export class Callings {

    // ----- Instance Accessors -----
    get Storage() {
        return this.storage;
    }
    get Callings() {
        return this.callings;
    }

    // ----- Constructor -----
    constructor(configuration) {
        this.storage = configuration._storageObj;
        this.callings = undefined;
    }
    
    // ----- Static Methods -----
    static CopyFromJSON(dataJSON) {
        const callings = new Callings(dataJSON._storageObj);
        this.callings = dataJSON.callings;
        return callings;
    }
    static CopyToJSON() {
        return {
            _storageObj: this.storage,
            callings: this.Callings
        };
    }
    static CopyFromObject(destination, source) {
        destination.storage = source.storage;
        destination.callings = source.Callings;
    }
    static async Factory(configuration) {
        const callings = new Callings(configuration);
        await callings.Fetch();
        return callings;
    }

    // ----- File/Storage Accessors -----
    static get CallingsFileBasename() {
        return "callings";
    }
    static get CallingsFileExtension() {
        return "json";
    }
    static get CallingsFilename() {
        return `${Callings.CallingsFileBasename}.${Callings.CallingsFileExtension}`;
    }
    static get CallingsCacheExpireMS() {
        return 1000 * 60 * 30; // 1/2 hour
    }
    static get CallingsSessionExpireMS() {
        return 1000 * 60 * 60; // 1 hour
    }
    static get CallingsLocalExpireMS() {
        return 1000 * 60 * 60 * 2; // 2 hours
    }
    static get StorageConfig() {
        return {
            cacheTtlMs: Callings.CallingsCacheExpireMS,
            sessionTtlMs: Callings.CallingsSessionExpireMS,
            localTtlMs: Callings.CallingsLocalExpireMS,
            googleId: null,
            githubFilename: null,
            privateKey: null,
            publicKey: null,
            secure: false
        };
    }

    // ----- Data Fetching -----
    async Fetch() {
        let callingsObj = await this.Storage.Get(Callings.CallingsFilename, Callings.StorageConfig);
        if (callingsObj) {
            this.callings = callingsObj;
        } else {
            this.callings = undefined;
        }
    }

    // ----- Core Data Accessors -----
    get CallingsEntries() {
        return this.Callings.callings;
    }
    get CallingsDetails() {
        return this.CallingsEntries.map(calling => ({
            id: calling.id,
            name: calling.name,
            level: calling.level,
            active: calling.active,
            hasTitle: calling.hasTitle,
            title: calling.title,
            titleOrdinal: calling.titleOrdinal
        }));
    }

    // ----- Filtering Methods -----
    get ActiveCallings() {
        return this.CallingsDetails.filter(calling => calling.active === true);
    }
    get WardCallings() {
        return this.CallingsDetails.filter(calling => calling.level === "ward");
    }
    get StakeCallings() {
        return this.CallingsDetails.filter(calling => calling.level === "stake");
    }
    get ActiveWardCallings() {
        return this.WardCallings.filter(calling => calling.active === true);
    }
    get ActiveStakeCallings() {
        return this.StakeCallings.filter(calling => calling.active === true);
    }

    // ----- Lookup Methods -----
    CallingById(id) {
        return this.CallingsDetails.filter(calling => calling.id === id);
    }
    CallingByName(name) {
        return this.CallingsDetails.filter(calling => calling.name === name);
    }
    ActiveCallingById(id) {
        return this.CallingById(id).filter(calling => calling.active === true);
    }
    ActiveCallingByName(name) {
        return this.CallingByName(name).filter(calling => calling.active === true);
    }
    WardCallingById(id) {
        return this.CallingById(id).filter(calling => calling.level === "ward");
    }
    WardCallingByName(name) {
        return this.CallingByName(name).filter(calling => calling.level === "ward");
    }
    ActiveWardCallingById(id) {
        return this.ActiveCallingById(id).filter(calling => calling.level === "ward");
    }
    ActiveWardCallingByName(name) {
        return this.ActiveCallingById(name).filter(calling => calling.level === "ward");
    }
    StakeCallingById(id) {
        return this.CallingById(id).filter(calling => calling.level === "stake");
    }
    StakeCallingByName(name) {
        return this.CallingByName(name).filter(calling => calling.level === "stake");
    }
    ActiveStakeCallingById(id) {
        return this.ActiveCallingById(id).filter(calling => calling.level === "stake");
    }
    ActiveStakeCallingByName(name) {
        return this.ActiveCallingById(name).filter(calling => calling.level === "stake");
    }

    // ----- Existence Checks -----
    HasCallings() {
        const callings = this.CallingsDetails;
        return callings !== null && callings.length > 0;
    }
    HasActiveCallings() {
        const active = this.ActiveCallings;
        return active !== null && active.length > 0;
    }
    HasWardCallings() {
        const ward = this.WardCallings;
        return ward !== null && ward.length > 0;
    }
    HasStakeCallings() {
        const stake = this.StakeCallings;
        return stake !== null && stake.length > 0;
    }
    HasActiveWardCallings() {
        const activeWard = this.ActiveWardCallings;
        return activeWard !== null && activeWard.length > 0;
    }
    HasActiveStakeCallings() {
        return this.ActiveStakeCallings !== null && this.ActiveStakeCallings.length > 0;
    }
    HasCallingById(id) {
        return this.CallingById(id) !== null && this.CallingById(id).length > 0;
    }
    HasCallingByName(name) {
        return this.CallingByName(name) !== null && this.CallingByName(name).length > 0;
    }
    HasActiveCallingById(id) {
        return this.GetActiveCallingById(id) !== null && this.GetActiveCallingById(id).length > 0;
    }
    HasActiveCallingByName(name) {
        return this.GetActiveCallingByName(name) !== null && this.GetActiveCallingByName(name).length > 0;
    }
    HasWardCallingById(id) {
        return this.GetWardCallingById(id) !== null && this.GetWardCallingById(id).length > 0;
    }
    HasWardCallingByName(name) {
        return this.GetWardCallingByName(name) !== null && this.GetWardCallingByName(name).length > 0;
    }
    HasActiveWardCallingById(id) {
        return this.GetActiveWardCallingById(id) !== null && this.GetActiveWardCallingById(id).length > 0;
    }
    HasActiveWardCallingByName(name) {
        return this.GetActiveWardCallingByName(name) !== null && this.GetActiveWardCallingByName(name).length > 0;
    }
    HasStakeCallingById(id) {
        return this.GetStakeCallingById(id) !== null && this.GetStakeCallingById(id).length > 0;
    }
    HasStakeCallingByName(name) {
        return this.GetStakeCallingByName(name) !== null && this.GetStakeCallingByName(name).length > 0;
    }
    HasActiveStakeCallingById(id) {
        return this.GetActiveStakeCallingById(id) !== null && this.GetActiveStakeCallingById(id).length > 0;
    }
    HasActiveStakeCallingByName(name) {
        return this.GetActiveStakeCallingByName(name) !== null && this.GetActiveStakeCallingByName(name).length > 0;
    }

    // ----- ID/Name Accessors -----
    GetCallingIds() {
        return this.GetCallingsDetails().map(calling => calling.id);
    }
    GetCallingNames() {
        return this.GetCallingsDetails().map(calling => calling.name);
    }
    GetActiveCallingIds() {
        return this.ActiveCallings.map(calling => calling.id);
    }
    GetActiveCallingNames() {
        return this.ActiveCallings.map(calling => calling.name);
    }
    GetWardCallingIds() {
        return this.WardCallings.map(calling => calling.id);
    }
    GetWardCallingNames() {
        return this.WardCallings.map(calling => calling.name);
    }
    GetStakeCallingIds() {
        return this.StakeCallings.map(calling => calling.id);
    }
    GetStakeCallingNames() {
        return this.StakeCallings.map(calling => calling.name);
    }
    GetActiveWardCallingIds() {
        return this.ActiveWardCallings.map(calling => calling.id);
    }
    GetActiveWardCallingNames() {
        return this.ActiveWardCallings.map(calling => calling.name);
    }
    GetActiveStakeCallingIds() {
        return this.GetActiveStakeCallings().map(calling => calling.id);
    }
    GetActiveStakeCallingNames() {
        return this.GetActiveStakeCallings().map(calling => calling.name);
    }
    GetCallingNameById(id) {
        return this.GetCallingById(id).map(calling => calling.name);
    }
    GetCallingIdByName(name) {
        return this.GetCallingByName(name).map(calling => calling.id);
    }
    GetActiveCallingNameById(id) {
        return this.GetActiveCallingById(id).map(calling => calling.name);
    }
    GetActiveCallingIdByName(name) {
        return this.GetActiveCallingByName(name).map(calling => calling.id);
    }
    GetWardCallingNameById(id) {
        return this.GetWardCallingById(id).map(calling => calling.name);
    }
    GetWardCallingIdByName(name) {
        return this.GetWardCallingByName(name).map(calling => calling.id);
    }
    GetActiveWardCallingNameById(id) {
        return this.GetActiveWardCallingById(id).map(calling => calling.name);
    }
    GetActiveWardCallingIdByName(name) {
        return this.GetActiveWardCallingByName(name).map(calling => calling.id);
    }
    GetStakeCallingNameById(id) {
        return this.GetStakeCallingById(id).map(calling => calling.name);
    }
    GetStakeCallingIdByName(name) {
        return this.GetStakeCallingByName(name).map(calling => calling.id);
    }
    GetActiveStakeCallingNameById(id) {
        return this.GetActiveStakeCallingById(id).map(calling => calling.name);
    }
    GetActiveStakeCallingIdByName(name) {
        return this.GetActiveStakeCallingByName(name).map(calling => calling.id);
    }
}