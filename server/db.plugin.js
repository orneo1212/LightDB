const fp = require('fastify-plugin');

const { LightDB } = require("../lightdb/lightdb");
const FSStore = require("../lightdb/store/fsstore");

function DBPlugin(app, opts, done) {
    app.decorateRequest('getlightDB', function (table) {
        if (!table) throw new Error('Table not specified');
        return new LightDB(table, { store: new FSStore(table) });
    });
    done();
}

module.exports = fp(DBPlugin);