const path = require('path');
const fs = require('fs');

function make_result(data) {
    return { error: false, value: data };
}

function make_error(reply, code, msg) {
    reply.statusCode = code;
    return { error: true, msg: msg, code: code };
}

async function check_user_table(request, reply) {
    if (request.params.table) {
        if (request.isadmin) return;
        if (request.usertables.find(x => x == request.params.table) != undefined) return;
        else {
            var err = make_error(reply, 403, "No access");
            reply.send(err);
            return err;
        }
    }
    return;
}

var router = function (fastify, opts, done) {
    var authenticated_only = { onRequest: fastify.basicAuth };
    var authandusertable_only = { onRequest: [fastify.basicAuth, check_user_table] };

    // Get all tables names
    fastify.get('/tables', authenticated_only, async (request, reply) => {
        var datadir = opts.datadir || "data";
        var tables;
        try {
            tables = fs.readdirSync(datadir);
        } catch (error) {
            return [];
        }
        tables = tables.filter(x => {
            var stat = fs.statSync(path.join(datadir, x));
            return stat.isDirectory() && fs.readdirSync(path.join(datadir, x)).find(f => f.toLowerCase().endsWith('.json'));
        });
        return tables;
    });

    // Get all documents in table
    fastify.get('/:table', authandusertable_only, async (request, reply) => {
        var db = request.getlightDB(request.params.table);
        var objects = await db.list();
        return make_result(objects);
    });

    // Add new document return new ID
    fastify.post('/:table', authandusertable_only, async (request, reply) => {
        if (request.body._id) return make_error(reply, 403, "ID should not exists in post");
        var db = request.getlightDB(request.params.table);
        var id = await db.put(request.body);
        return make_result(id);
    });

    // Update/Create new document by ID (create when not exists)
    fastify.put('/:table/:id', authandusertable_only, async (request, reply) => {
        if (request.body._id != request.params.id) return make_error(reply, 403, "ID should match body _id");
        var db = request.getlightDB(request.params.table);
        var id = await db.put(request.body, true);
        return make_result(id);
    });

    // Update partialally existing document by ID
    fastify.patch('/:table/:id', authandusertable_only, async (request, reply) => {
        if (request.body._id != request.params.id) return make_error(reply, 403, "ID should match body _id");
        var db = request.getlightDB(request.params.table);
        if (!await db.has(request.body._id)) return make_error(reply, 404, "Not exists");
        var doc = await db.get(request.body._id);
        for (e in request.body) {
            doc[e] = request.body[e];
        }
        var id = await db.put(doc, true);
        return make_result(id);
    });

    // Delete existing document by ID
    fastify.delete('/:table/:id', authandusertable_only, async (request, reply) => {
        var db = request.getlightDB(request.params.table);
        if (!await db.has(request.params.id)) return make_error(reply, 404, "Not exists");
        await db.del(request.params.id);
        return make_result(request.params.id);
    });

    // Get document by ID
    fastify.get('/:table/:id', authandusertable_only, async (request, reply) => {
        var params = request.params;
        var db = request.getlightDB(request.params.table);
        var obj = await db.get(params.id);
        if (obj == null) {
            return make_error(reply, 404, "Not found");
        }
        return obj;
    });

    // Head document by ID 
    fastify.head('/:table/:id', authandusertable_only, async (request, reply) => {
        var db = request.getlightDB(request.params.table);
        var hasit = await db.has(request.params.id);
        reply.statusCode = 200;
        if (!hasit) reply.statusCode = 404;
        return {};
    });

    done();
};

module.exports = { router, check_user_table, make_result, make_error };