var test = require('tape');
const { MemoryStore } = require('../store/memorystore');
const { LightDB, Query } = require('../lightdb/lightdb');

test('test LightDB Query', function (t) {
    var db = new LightDB('_test', {
        store: new MemoryStore('_test')
    });
    var result = new Query(db).run();
    t.equal(result.length(), 0);

    var id = db.put({ test: 123 });

    var result = new Query(db).run();
    t.equal(result.length(), 1);
    t.equal(result.get(0).test, 123);
    t.equal(result.get(0)._id, id);
    db.del(id);


    t.end();
});


test('test LightDB Query - Where', function (t) {
    var db = new LightDB('_test', {
        store: new MemoryStore('_test')
    });

    var id = db.put({ test: 123 });
    var nid = db.put({ test: 123, a: 1 });

    var result = new Query(db).where({ _id: nid }).run();
    t.equal(result.length(), 1);
    t.equal(result.get(0).test, 123);
    t.equal(result.get(0)._id, nid);

    var result = new Query(db).where({ test: 123 }).run();
    t.equal(result.length(), 2);
    t.equal(result.get(0).test, 123);
    t.equal(result.get(0)._id, id);

    var result = new Query(db).where({ test: 123, a: 1 }).run();
    t.equal(result.length(), 1);
    t.equal(result.get(0)._id, nid);

    var result = new Query(db).where({ test: 123 }, 'or').run();
    t.equal(result.length(), 2);
    t.equal(result.get(0)._id, id);
    t.equal(result.get(1)._id, nid);

    var result = new Query(db).where({ a: 1 }, 'or').run();
    t.equal(result.length(), 1);

    // not existing item
    var result = new Query(db).where({ _id: '123' }).run();
    t.equal(result.length(), 0);
    t.end();
});

test('test LightDB Query - Limit', function (t) {
    var db = new LightDB('_test', {
        store: new MemoryStore('_test')
    });
    for (var i = 0; i < 1000; i++) { db.put({ test: i }); };
    var result = new Query(db).run();
    t.equal(result.length(), 1000);
    var result = new Query(db).limit(432).run();
    t.equal(result.length(), 432);
    t.end();
});