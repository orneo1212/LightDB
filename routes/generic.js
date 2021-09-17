const path = require('path');
const VERSION = '0.1.0';

var router = function (fastify, opts, done) {
    // Server info
    fastify.get('/', async (request, reply) => {
        return { message: "LightDB server v." + VERSION };
    });

    // Client HTML
    fastify.get('/client', async (request, reply) => {
        return reply.sendFile('client.html', path.join(__dirname, '..'));
    });

    done();
};


module.exports = { router };