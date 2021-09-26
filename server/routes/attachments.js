const { check_user_table, make_result, make_error } = require("./db");
const HASH_ALGORITHM = 'sha256';

async function hash_stream(stream) {
    var crypto = require('crypto');
    var hash = crypto.createHash(HASH_ALGORITHM);
    hash.setEncoding('hex');
    return new Promise(function (resolve, reject) {
        stream.pipe(hash);
        stream.on('end', () => {
            hash.end();
            resolve(hash.read());
        });
        stream.on('error', function (err) {
            hash.end();
            reject(err);
        });
    });
}

async function hash_file(filepath) {
    var fs = require('fs');
    var stream = fs.createReadStream(filepath);
    return await hash_stream(stream);
}

var router = function (fastify, opts, done) {
    var authandusertable_only = { onRequest: [fastify.basicAuth, check_user_table] };
    console.log(opts);
    var attachments_dir = opts.attachments_dir || "attachments";

    // Get attachments for document :id
    fastify.get('/:table/:id/attachments', authandusertable_only, async (request, reply) => {
        var db = request.getlightDB(request.params.table + "_attachments");
        var attachments = await db.list();
        if (attachments.length == 0) return make_error(reply, 404, "Attachments not found");
        return make_result(attachments);
    });

    // Get attachment for document :id by :attachid ID
    fastify.get('/:table/:id/attachments/:attachid', authandusertable_only, async (request, reply) => {
        var db = request.getlightDB(request.params.table + "_attachments");

        var attachid = request.params.attachid;
        if (!attachid) return make_error(reply, 404, "Attachment not found");

        var attachment = await db.get(attachid);
        if (!attachment) return make_error(reply, 404, "Attachment not found");

        if (request.query.raw !== undefined && attachment.hash) {
            //reply.header('Content-Type', attachment.mimetype || 'application/octet-stream');
            return reply.sendFile(attachment.hash, attachments_dir);
        }
        return make_result(attachment);
    });

    // Post new attachments for document :id
    fastify.post('/:table/:id/attachments', authandusertable_only, async (request, reply) => {
        var db = request.getlightDB(request.params.table + "_attachments");
        const files = await request.saveRequestFiles();
        var docs = [];
        for await (f of files) {
            var hash = await hash_file(f.filepath);
            var doc = { filename: f.filename, mimetype: f.mimetype, hash: hash };
            var id = await db.put(doc);
            docs.push(id);
        }
        return make_result(docs);
    });

    done();
};

module.exports = { router };