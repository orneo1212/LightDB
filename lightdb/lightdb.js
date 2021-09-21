const { MemoryStore } = require("./store/memorystore");
const Query = require('./query');
class LightDBError extends Error { }


class LightDB {
    constructor(table, options) {
        this._table = table;
        this.options = options || {};
        this._store = this.options.store || new MemoryStore(table);
    }

    get(id) {
        if (!id) return null;
        return this._store.get(id);
    }

    list() {
        return this._store.list();
    }

    has(id) {
        return this._store.list().filter(x => x._id == id).length > 0;
    }

    put(object, update = false) {
        if (update) return this._store.put(object);
        else return this._store.new(object);
    }

    del(id) {
        this._store.del(id);
    }
}

module.exports = { LightDB, LightDBError, Query };