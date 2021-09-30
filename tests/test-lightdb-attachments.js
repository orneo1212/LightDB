var test = require('tape');
const { LightDB, Query } = require('lightdb/lightdb');
const { MemoryStore } = require('../store/memorystore');

test('test LightDB get_attachmentsDB', function (t) {
    var db = new LightDB('_test', {
        store: new MemoryStore('_test')
    });
    var attachdb = db.get_attachmentsDB();
    t.ok(attachdb instanceof LightDB, "Attachments DB should be an instance of LightDB");

    t.end();
});