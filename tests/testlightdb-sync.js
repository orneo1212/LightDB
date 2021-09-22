var test = require('tape');
const { MemoryStore } = require('../lightdb/store/memorystore');
const { LightDB } = require('../lightdb/lightdb');

test('test LightDB Sync', function (t) {
    var db = new LightDB('_test', {
        store: new MemoryStore('_test')
    });
    db.put({ _id: 'testID', test: 1 }, true);

    var db2 = new LightDB('_test', {
        store: new MemoryStore('_test')
    });
    db2.put({ _id: 'testID2', test: 2 }, true);

    db.sync(db2);

    var c = db2.get('testID');
    t.ok(c !== undefined, "Remote target should have synced item");
    t.equal(c.test, 1);

    var c = db.get('testID2');
    t.ok(c !== undefined, "Local target should have synced item");
    t.equal(c.test, 2);

    t.comment('- Removed item on local');
    db.del('testID2');
    db.sync(db2);

    t.ok(db2.has('testID2') == false, "Local removed item should be removed on remote after sync");
    t.equal(db2.list().length, 1);
    t.end();
});