var test = require('tape');
const { MemoryStore } = require('lightdb/store/memorystore');
const { LightDB } = require('lightdb/lightdb');

test('test LightDB Sync', async function (t) {
    var db = new LightDB('_test', {
        store: new MemoryStore('_test')
    });
    await db.put({ _id: 'testID', test: 1 }, true);

    var db2 = new LightDB('_test', {
        store: new MemoryStore('_test')
    });
    await db2.put({ _id: 'testID2', test: 2 }, true);

    await db.sync(db2);

    var c = await db2.get('testID');
    t.ok(c !== undefined, "Remote target should have synced item");
    t.equal(c.test, 1);

    var c = await db.get('testID2');
    t.ok(c !== undefined, "Local target should have synced item");
    t.equal(c.test, 2);

    t.comment('- Removed item on local');

    await db.del('testID2');
    await db.sync(db2);
    t.ok(await db2.has('testID2') == false, "Local removed item should be removed on remote after sync");
    t.equal((await db2.list()).length, 1);
    t.end();
});