class LightDBSyncAdapter {
    constructor(lightdb) {
        this._db = lightdb;
    }
    async list() {
        return this._db.list();
    }
    async get(itemid) {
        return this._db.get(itemid);
    }
    async has(itemid) {
        return this._db.get(itemid) ? true : false;
    }
    async put(item) {
        return this._db.put(item);
    }
    async del(itemid) {
        return this._db.del(itemid);
    }
}
module.exports = LightDBSyncAdapter;