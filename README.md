# LightDB
Lightweight JSON documents store based on pouchDB idea.


My targets:
- Async
- Database should be fast
- Pure file storage with caching for better IO results

**This software is work in progress. Wait for release before use.**

## Example
```javascript
// Node js
const { LightDB } = require('./lightdb/lightdb');

(async () => {
    var db = new LightDB('test');
    var id = await db.put({ hello: 'world' });
    var doc = await db.get(id);
    console.log(doc);

    doc.newdata = "New value";
    await db.put(doc);

    doc = await db.get(id);
    console.log(doc);

    await db.del(id);
})();

## Server
Moved to seperate package [lightdb-server](https://github.com/orneo1212/LightDB-server)