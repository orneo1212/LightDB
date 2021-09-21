const path = require('path');
const VERSION = '0.1.0';

var router = function (fastify, opts, done) {
    // Server info
    fastify.get('/', async (request, reply) => {
        return { message: "LightDB server v." + VERSION };
    });

    // Client HTML
    fastify.get('/client', async (request, reply) => {
        var ppath = path.resolve(opts.publicdir || ".");
        return reply.sendFile('client.html', ppath);
    });

    done();
};


module.exports = { router };