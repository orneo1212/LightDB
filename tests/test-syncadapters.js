var test = require('tape');
const { ArraySyncAdapter } = require('../lightdb/bisync');
const { LightDB } = require("../lightdb/lightdb");
const LightDBSyncAdapter = require('../lightdb/lightdbsyncadapter');
const { Readable } = require("stream");

async function test_syncadapter(adapter, t) {
    t.comment('- put() and get()');
    var id = 'test';
    await adapter.put({ _id: id, test: 1 });
    var obj = await adapter.get(id);
    t.equal(obj._id, id);
    t.equal(obj.test, 1);

    t.comment('- has() doc');
    t.equal(await adapter.has("randomid"), false);
    t.equal(await adapter.has(id), true);

    t.comment('- list()');
    var list = await adapter.list();
    t.equal(typeof list, 'object');
    t.equal(list.length, 1);
    t.equal(list[0]._id, id);

    t.comment('- get() on not existing doc');
    t.equal(await adapter.get("randomid"), null);

    t.comment('- delete doc');
    await adapter.del(id);
    t.equal(await adapter.get(id), null);

    t.comment('- binary blobs get/put');
    var data = Readable.from('lorem ipsum dolar sit amit');
    var id = await adapter.put_blob(data);
    t.equal(typeof id, 'string');
    var d = await adapter.get_blob(id);
    t.equal(d, data);

    t.end();
}

test("Test ArraySyncAdapter", async function (t) {
    await test_syncadapter(new ArraySyncAdapter([]), t);
});

test("Test LightDBSyncAdapter", async function (t) {
    var db = new LightDB("_test");
    await test_syncadapter(new LightDBSyncAdapter(db), t);
});