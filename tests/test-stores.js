var test = require('tape');
const { LightDB } = require("../lightdb/lightdb");
const FSStore = require('../lightdb/store/fsstore');
const { MemoryStore } = require('../lightdb/store/memorystore');

async function test_store(store, t) {
    var db = new LightDB("_test", { store: store });

    t.comment('- put() and get()');
    var id = await db.put({ test: 1 });
    t.equal(typeof id, 'string');
    var obj = await db.get(id);
    t.equal(obj._id, id);
    t.equal(obj.test, 1);

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

    t.end();
}

test("Test MemoryStore", async function (t) {
    await test_store(new MemoryStore("_test"), t);
});

test("Test FSStore", async function (t) {
    await test_store(new FSStore("_test"), t);
});