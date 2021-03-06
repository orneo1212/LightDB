var test = require('tape');
var bisync = require('lightdb/bisync');
const ArraySyncAdapter = require('lightdb/syncadapters/arraysyncadapter');

test('test bisync sync_item - remote change', function (t) {
    var objA = { "test": 1 };
    var objB = { "test": 2 };
    bisync.sync_item(objA, objB);
    t.deepEqual(objA, objB);
    t.equal(objA.test, 2);
    t.end();
});

test('test bisync sync_item - local change', function (t) {
    var objA = { test: 2 };
    var objB = { test: 1 };
    bisync.sync_item(objA, objB);
    t.deepEqual(objA, objB);
    t.equal(objA.test, 1);
    t.end();
});

test('test bisync sync - remote change', async function (t) {
    var local = [{ _id: 1, test: 2 }];
    var remote = [{ _id: 1, test: 1 }];
    var changes = [];
    await bisync.sync(new ArraySyncAdapter(local), new ArraySyncAdapter(remote), changes);
    t.deepEqual(local, remote);
    t.equal(local[0].test, 1);
    t.end();
});

test('test bisync sync - local add', async function (t) {
    var local = [
        { _id: 1, test: 2 },
        { _id: 2, test: 1 }
    ];
    var remote = [{ _id: 1, test: 1 }];
    var changes = [{ _id: 2, _action: 'add' }];
    await bisync.sync(new ArraySyncAdapter(local), new ArraySyncAdapter(remote), changes);
    t.equal(remote.length, 2, "remote object list length should be 2");
    t.equal(local.length, remote.length, "local and remote object list lengths should be equal after sync");
    t.end();
});


test('test bisync sync - local remove', async function (t) {
    var local = [{ _id: 1, test: 2 },];
    var remote = [{ _id: 1, test: 1 }, { _id: 2, test: 1 }];
    var changes = [{ _id: 2, _action: 'remove' }];
    await bisync.sync(new ArraySyncAdapter(local), new ArraySyncAdapter(remote), changes);
    t.equal(remote.length, 1, "remote object list length should be 1");
    t.equal(local.length, remote.length, "local and remote object list lengths should be equal after sync");
    t.end();
});

test('test bisync sync - conflict', async function (t) {
    var local = [{ _id: 1, test: 2 },];
    var remote = [{ _id: 1, test: 1 }];
    var changes = [{ _id: 1, _action: 'change' }];
    var result = await bisync.sync(new ArraySyncAdapter(local), new ArraySyncAdapter(remote), changes);
    t.ok(result == false, "Sync should be break at conflict");
    t.end();
});