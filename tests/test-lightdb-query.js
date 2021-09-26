var test = require('tape');
const { MemoryStore } = require('lightdb/store/memorystore');
const { LightDB, Query } = require('lightdb/lightdb');

test('test LightDB Query', async function (t) {
    var db = new LightDB('_test', {
        store: new MemoryStore('_test')
    });
    var result = await new Query(db).run();
    t.equal(result.length(), 0);

    var id = await db.put({ test: 123 });

    var result = await new Query(db).run();
    t.equal(result.length(), 1);
    t.equal(result.get(0).test, 123);
    t.equal(result.get(0)._id, id);
    db.del(id);


    t.end();
});


test('test LightDB Query - Where', async function (t) {
    var db = new LightDB('_test', {
        store: new MemoryStore('_test')
    });

    var id = await db.put({ test: 123 });
    var nid = await db.put({ test: 123, a: 1 });

    var result = await new Query(db).where({ _id: nid }).run();
    t.equal(result.length(), 1);
    t.equal(result.get(0).test, 123);
    t.equal(result.get(0)._id, nid);

    var result = await new Query(db).where({ test: 123 }).run();
    t.equal(result.length(), 2);
    t.equal(result.get(0).test, 123);
    t.equal(result.get(0)._id, id);

    var result = await new Query(db).where({ test: 123, a: 1 }).run();
    t.equal(result.length(), 1);
    t.equal(result.get(0)._id, nid);

    var result = await new Query(db).where({ test: 123 }, 'or').run();
    t.equal(result.length(), 2);
    t.equal(result.get(0)._id, id);
    t.equal(result.get(1)._id, nid);

    var result = await new Query(db).where({ a: 1 }, 'or').run();
    t.equal(result.length(), 1);

    // not existing item
    var result = await new Query(db).where({ _id: '123' }).run();
    t.equal(result.length(), 0);
    t.end();
});

test('test LightDB Query - Limit', async function (t) {
    var db = new LightDB('_test', {
        store: new MemoryStore('_test')
    });
    for (var i = 0; i < 1000; i++) { db.put({ test: i }); };
    var result = await new Query(db).run();
    t.equal(result.length(), 1000);
    var result = await new Query(db).limit(432).run();
    t.equal(result.length(), 432);
    t.end();
});