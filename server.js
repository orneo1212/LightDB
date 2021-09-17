const path = require('path');
const fastify = require('fastify')({ logger: true });
const Query = require('./query');
const genericroutes = require('./routes/generic');
const dbroutes = require('./routes/db');

// SETTINGS
const PORT = 3000;
const AUTH_REALM = 'LightDB-Server';

// Static files
fastify.register(require('fastify-static'), {
    root: path.join(__dirname, 'public'),
    prefix: '/',
});

// ETag
fastify.register(require('fastify-etag'));

// Multiparm file upload
fastify.register(require('fastify-multipart'));

// Basic auth
const validate = async function (username, password, req, reply) {
    var db = dbroutes.makeDB("_users");
    var user = new Query(db).where({ username: username, password: password }).run();
    if (user.get(0)) return;
    else throw Error();
};
const authenticate = { realm: AUTH_REALM };
fastify.register(require('fastify-basic-auth'), { validate, authenticate });

// Register routers
fastify.register(genericroutes.router, { prefix: '' });
fastify.register(dbroutes.router, { prefix: '/db' });

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