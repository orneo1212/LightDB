class LightDBSyncAdapter {
    constructor(lightdb) {
        this._db = lightdb;
    }
    list() {
        return this._db.list();
    }
    get(itemid) {
        return this._db.get(itemid);
    }
    has(itemid) {
        return this._db.get(itemid) ? true : false;
    }
    put(item) {
        return this._db.put(item);
    }
    del(itemid) {
        return this._db.del(itemid);
    }
}
module.exports = LightDBSyncAdapter;