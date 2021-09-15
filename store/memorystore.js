const { newid } = require('../utils');

class MemoryStore {
    constructor(table) {
        this._table = table;
        this._store = {};
    }
    get(id) {
        try {
            return this._store[id];
        } catch (error) {
            return null;
        }
    }

    list() {
        var all = Object.keys(this._store);
        return all.map(x => this._store[x]);
    }

    new(object) {
        object._timestamp = Date.now();
        object._id = newid();
        this._store[object._id] = object;
        return object._id;
    }

    put(object) {
        object._timestamp = Date.now();
        this._store[id] = object;
        return object._id;
    }

    del(id) {
        delete this._store[id];
    }
}

module.exports = { MemoryStore };