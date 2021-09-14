const { FSStore } = require("./store/fsstore");

class LightDBError extends Error { }

function newid(length = 64) {
    return '' + Math.random().toString(36).substr(2, length);
}

class LightDB {
    constructor(table, options) {
        this._table = table;
        this.options = options || {};
        this._store = this.options._store || new FSStore(table);
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

module.exports = { LightDB, LightDBError, newid };