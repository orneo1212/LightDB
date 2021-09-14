const fastify = require('fastify')({ logger: true });
const { LightDB, newid } = require('./lightdb');
const VERSION = '0.1.0';
const PORT = 3000;
const AUTH_REALM = 'LightDB-Server';

// Basic auth
const validate = async function (username, password, req, reply) { };
const authenticate = { realm: AUTH_REALM };
fastify.register(require('fastify-basic-auth'), { validate, authenticate });
fastify.after(() => { fastify.addHook('onRequest', fastify.basicAuth); });

// ETag
fastify.register(require('fastify-etag'));

function make_result(data) {
    return { error: false, value: data };
}

function make_error(reply, code, msg) {
    reply.statusCode = code;
    return { error: true, msg: msg, code: code };
}

// Server info
fastify.get('/', async (request, reply) => {
    return { message: "LightDB server v." + VERSION };
});

// Get all documents in table
fastify.get('/:table', async (request, reply) => {
    var params = request.params;
    var objects = new LightDB(params.table).list();
    return make_result(objects);
});

// Add new document return new ID
fastify.post('/:table', async (request, reply) => {
    var params = request.params;
    if (request.body._id) return make_error(reply, 403, "ID should not exists in post");
    var id = new LightDB(params.table).put(request.body);
    return make_result(id);
});

// Update/Create new document by ID (create when not exists)
fastify.put('/:table/:id', async (request, reply) => {
    if (request.body._id != request.params.id) return make_error(reply, 403, "ID should match body _id");
    var db = new LightDB(request.params.table);
    var id = db.put(request.body, true);
    return make_result(id);
});

// Update partialally existing document by ID
fastify.patch('/:table/:id', async (request, reply) => {
    if (request.body._id != request.params.id) return make_error(reply, 403, "ID should match body _id");
    var db = new LightDB(request.params.table);
    if (!db.has(request.body._id)) return make_error(reply, 404, "Not exists");
    var doc = db.get(request.body._id);
    for (e in request.body) {
        doc[e] = request.body[e];
    }
    var id = db.put(doc, true);
    return make_result(id);
});

// Delete existing document by ID
fastify.delete('/:table/:id', async (request, reply) => {
    var db = new LightDB(request.params.table);
    if (!db.has(request.params.id)) return make_error(reply, 404, "Not exists");
    db.del(request.params.id);
    return make_result(request.params.id);
});

// Get document by ID
fastify.get('/:table/:id', async (request, reply) => {
    var params = request.params;
    var obj = new LightDB(params.table).get(params.id);
    if (obj == null) {
        return make_error(reply, 404, "Not found");
    }
    return obj;
});

// Head document by ID 
fastify.head('/:table/:id', async (request, reply) => {
    var hasit = new LightDB(request.params.table).has(request.params.id);
    reply.statusCode = 200;
    if (!hasit) reply.statusCode = 404;
    return {};
});

const start = async () => {
    try {
        console.log('Server started at port', PORT);
        await fastify.listen(PORT);
    } catch (err) {
        fastify.log.error(err);
        process.exit(1);
    }
};
start();