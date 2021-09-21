const { newid } = require('../utils');
const axios = require('axios').default;

class LightDBRemoteStore {
    constructor(url, table) {
        this._table = table;
        this._url = url; // Without slash at end
    }
    async get(id) {
        var result = await axios.get(this._url + `/db/${this._table}/${id}`);
        return result.data;
    }

    async list() {
        var result = await axios.get(this._url + `/db/${this._table}`);
        return result.data.value;
    }

    async new(object) {
        object._timestamp = Date.now();
        var result = await axios.post(this._url + `/db/${this._table}`, object);
        return result.data;
    }

    async put(object) {
        object._timestamp = Date.now();
        var result = await axios.put(this._url + `/db/${this._table}/${object._id}`, object);
        return result.data;
    }

    async del(id) {
        var result = await axios.delete(this._url + `/db/${this._table}/${id}`);
        return result.data;
    }
}

module.exports = { LightDBRemoteStore };;