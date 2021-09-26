const BaseSyncAdapter = require('./basesyncadapter');

class ArraySyncAdapter extends BaseSyncAdapter {
    constructor(objects) {
        super();
        this._objects = objects;
    }
    async list() {
        return this._objects.map(x => {
            return { _id: x._id, _timestamp: x._timestamp };
        });
    }
    async get(itemid) {
        var item = this._objects.filter(i => i._id == itemid);
        return item.length > 0 ? item[0] : null;
    }
    async has(itemid) {
        return this._objects.filter(i => i._id == itemid).length ? true : false;
    }
    async put(item) {
        if (await this.has(item._id)) {
            for (var i in this._objects) {
                if (this._objects[i]._id == item._id) this._objects[i] = item;
                break;
            }
        }
        else this._objects.push(item);
    }
    async del(itemid) {
        var item = await this.get(itemid);
        if (item) this._objects.splice(this._objects.indexOf(item), 1);
    }
}

module.exports = ArraySyncAdapter;