var test = require('tape');
const { LightDB } = require("lightdb/lightdb");
const FSStore = require('lightdb/store/fsstore');
const { MemoryStore } = require('lightdb/store/memorystore');
const { Readable } = require("stream");

async function test_store(store, t) {
    var db = new LightDB("_test", { store: store });

    t.comment('- put() and get()');
    var id = await db.put({ test: 1 });
    t.equal(typeof id, 'string');
    var obj = await db.get(id);
    t.equal(obj._id, id);
    t.equal(obj.test, 1);

    t.comment('- list()');
    var list = await db.list();
    t.equal(typeof list, 'object');
    t.equal(list.length, 1);
    t.equal(list[0]._id, id);

    t.comment('- has() doc');
    t.equal(await db.has("randomid"), false);
    t.equal(await db.has(id), true);

    t.comment('- get() on not existing doc');
    t.equal(await db.get("randomid"), null);

    t.comment('- delete doc');
    await db.del(id);
    t.equal(await db.get(id), null);

    t.comment('- put() with id');
    var id = await db.put({ _id: 'testID', test: 2 });
    var obj = await db.get(id);
    t.equal(obj.test, 2);
    await db.del(id);

    t.comment('- binary blobs get/put');
    var rawdata = '\xff\x00\01lorem ipsum dolar sit amit \xff\x00\02';
    var data = Readable.from(rawdata);
    var id = await db.put_blob(data);
    t.equal(typeof id, 'string');

    var d = await db.get_blob(id);
    t.equal(d instanceof Readable, true, 'get_blob result should be ReadableStream or null');
    t.equal(d.read(), rawdata, 'get_blob data should be equal tested data');

    var d = await db.get_blob('randomid');
    t.equal(d, null, 'get_blob on non existing blob should return null');

    t.end();
}

test("Test MemoryStore", async function (t) {
    await test_store(new MemoryStore("_test"), t);
});

test("Test FSStore", async function (t) {
    await test_store(new FSStore("_test"), t);
});