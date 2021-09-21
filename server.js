const path = require('path');
const fastify = require('fastify')({ logger: true, ignoreTrailingSlash: true });
const Query = require('./lightdb/query');
const genericroutes = require('./server/routes/generic');
const dbroutes = require('./server/routes/db');

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

// LightDB database plugin
fastify.register(require('./server/db.plugin'));

// Basic auth
const validate = async function (username, password, req, reply) {
    var db = req.getlightDB("_users");
    var users = new Query(db).where({ username: username, password: password }).run();
    var user = users.get(0);
    if (user) {
        req.usertables = user.tables ? user.tables : [];
        req.isadmin = user.admin ? true : false;
        return;
    }
    else throw Error();
};
const authenticate = { realm: AUTH_REALM };
fastify.register(require('fastify-basic-auth'), { validate, authenticate });

// Register routers
fastify.register(genericroutes.router, { prefix: '', publicdir: '.' });
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