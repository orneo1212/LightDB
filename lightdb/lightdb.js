const { MemoryStore } = require("./store/memorystore");
const Query = require('./query');
const bisync = require('./bisync');
const LightDBSyncAdapter = require('./lightdbsyncadapter');
class LightDBError extends Error { }


class LightDB {
    constructor(table, options) {
        this._table = table;
        this.options = options || {};
        this._store = this.options.store || new MemoryStore(table);
        this._changes = [];
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

    put(object) {
        var result = null;
        var update = false;
        if (object._id) update = true;
        if (update) {
            result = this._store.put(object);
            this._changes.push({ _id: object._id, _action: 'change', timestamp: Date.now() });
        }
        else {
            result = this._store.new(object);
            this._changes.push({ _id: object._id, _action: 'add', timestamp: Date.now() });
        }
        return result;
    }

    del(id) {
        this._store.del(id);
        this._changes.push({ _id: id, _action: 'remove', timestamp: Date.now() });
    }

    sync(remotedb) {
        var localadapter = new LightDBSyncAdapter(this);
        var remoteadapter = new LightDBSyncAdapter(remotedb);
        bisync.sync(localadapter, remoteadapter, this._changes);
    }
}

module.exports = { LightDB, LightDBError, Query };