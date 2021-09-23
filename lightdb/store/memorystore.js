const { newid } = require('../utils');

class MemoryStore {
    constructor(table) {
        this._table = table;
        this._store = {};
    }
    async get(id) {
        return this._store[id] ? this._store[id] : null;
    }

    async list() {
        var all = Object.keys(this._store);
        return all.map(x => this._store[x]);
    }

    async new(object) {
        object._timestamp = Date.now();
        object._id = newid();
        this._store[object._id] = object;
        return object._id;
    }

    async put(object) {
        object._timestamp = Date.now();
        this._store[object._id] = object;
        return object._id;
    }

    async del(id) {
        delete this._store[id];
    }
}

module.exports = { MemoryStore };