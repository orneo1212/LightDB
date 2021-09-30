const { LightDB } = require('lightdb/lightdb');
const { MemoryStore } = require('lightdb/store/memorystore');
const { LightDBRemoteStore } = require('lightdb/store/lightdb_remote');
const FSStore = require('lightdb/store/fsstore');
const { newid } = require('lightdb/utils');
const axios = require('axios').default;

function createLightDB(url, table) {
    if (!url) throw new Error("createLightDB needs table or url and table specified");
    if (!table) table = url;
    var store = new MemoryStore(table);
    if (url && table) {
        if (url.toLowerCase().startsWith('http://') || url.toLowerCase().startsWith('https://')) {
            store = new LightDBRemoteStore(url, table);
        }
    }
    return new LightDB(table, { store: store });
}

module.exports = {
    new: createLightDB, newid, axios,
    LightDB, MemoryStore, LightDBRemoteStore, FSStore
};