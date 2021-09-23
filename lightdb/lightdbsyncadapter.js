class LightDBSyncAdapter {
    constructor(lightdb) {
        this._db = lightdb;
    }
    async list() {
        return await this._db.list();
    }
    async get(itemid) {
        return await this._db.get(itemid);
    }
    async has(itemid) {
        return await this._db.get(itemid) ? true : false;
    }
    async put(item) {
        return await this._db.put(item);
    }
    async del(itemid) {
        return await this._db.del(itemid);
    }
}
module.exports = LightDBSyncAdapter;