const fastify = require('fastify')({ logger: true });
const { LightDB } = require('./lightdb');
const Query = require('./query');
const FSStore = require('./store/fsstore');

const VERSION = '0.1.0';
const PORT = 3000;
const AUTH_REALM = 'LightDB-Server';

// LightDB instance maker
function makeDB(table) {
    return new LightDB(table, { store: new FSStore(table) });
}

// ETag
fastify.register(require('fastify-etag'));

// Basic auth
const validate = async function (username, password, req, reply) {
    var db = makeDB("_users");
    var user = new Query(db).where({ username: username, password: password }).run();
    if (user.get(0)) return;
    else throw Error();
};
const authenticate = { realm: AUTH_REALM };
fastify.register(require('fastify-basic-auth'), { validate, authenticate });

// Multiparm file upload
fastify.register(require('fastify-multipart'));

function make_result(data) {
    return { error: false, value: data };
}

function make_error(reply, code, msg) {
    reply.statusCode = code;
    return { error: true, msg: msg, code: code };
}

fastify.after(() => {
    var authenticated_only = { onRequest: fastify.basicAuth };

    // Server info
    fastify.get('/', async (request, reply) => {
        return { message: "LightDB server v." + VERSION };
    });

    // Get all documents in table
    fastify.get('/:table', authenticated_only, async (request, reply) => {
        var db = makeDB(request.params.table);
        var objects = db.list();
        return make_result(objects);
    });

    // Add new document return new ID
    fastify.post('/:table', authenticated_only, async (request, reply) => {
        var params = request.params;
        if (request.body._id) return make_error(reply, 403, "ID should not exists in post");
        var db = makeDB(request.params.table);
        var id = db.put(request.body);
        return make_result(id);
    });

    // Update/Create new document by ID (create when not exists)
    fastify.put('/:table/:id', authenticated_only, async (request, reply) => {
        if (request.body._id != request.params.id) return make_error(reply, 403, "ID should match body _id");
        var db = makeDB(request.params.table);
        var id = db.put(request.body, true);
        return make_result(id);
    });

    // Update partialally existing document by ID
    fastify.patch('/:table/:id', authenticated_only, async (request, reply) => {
        if (request.body._id != request.params.id) return make_error(reply, 403, "ID should match body _id");
        var db = makeDB(request.params.table);
        if (!db.has(request.body._id)) return make_error(reply, 404, "Not exists");
        var doc = db.get(request.body._id);
        for (e in request.body) {
            doc[e] = request.body[e];
        }
        var id = db.put(doc, true);
        return make_result(id);
    });

    // Delete existing document by ID
    fastify.delete('/:table/:id', authenticated_only, async (request, reply) => {
        var db = makeDB(request.params.table);
        if (!db.has(request.params.id)) return make_error(reply, 404, "Not exists");
        db.del(request.params.id);
        return make_result(request.params.id);
    });

    // Get document by ID
    fastify.get('/:table/:id', authenticated_only, async (request, reply) => {
        var params = request.params;
        var db = makeDB(request.params.table);
        var obj = db.get(params.id);
        if (obj == null) {
            return make_error(reply, 404, "Not found");
        }
        return obj;
    });

    // Head document by ID 
    fastify.head('/:table/:id', authenticated_only, async (request, reply) => {
        var db = makeDB(request.params.table);
        var hasit = db.has(request.params.id);
        reply.statusCode = 200;
        if (!hasit) reply.statusCode = 404;
        return {};
    });
});

const start = async () => {
    try {
        console.log('Server started at port', PORT);
        await fastify.listen(PORT, "0.0.0.0");
    } catch (err) {
        fastify.log.error(err);
        process.exit(1);
    }
};
start();