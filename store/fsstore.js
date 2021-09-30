const path = require('path');
const fs = require('fs');
const { newid } = require('../utils');
const { Readable } = require('stream');

class FSStore {
    constructor(table, options = {}) {
        this._dir_path = options.dir_path || path.join(process.cwd(), 'data');
        this._tablepath = path.join(this._dir_path, table);
        this._blobspath = path.join(this._dir_path, "_blobs");
    }
    _create_dir() {
        if (!fs.existsSync(this._tablepath)) fs.mkdirSync(this._tablepath);
        if (!fs.existsSync(this._blobspath)) fs.mkdirSync(this._blobspath);
    }
    _get_path(id) {
        return path.join(this._tablepath, id + ".json");
    }
    _get_blob_path(id) {
        return path.join(this._blobspath, id);
    }
    get(id) {
        try {
            return JSON.parse(fs.readFileSync(this._get_path(id)));
        } catch (error) {
            return null;
        }
    }

    list() {
        var files;
        try {
            files = fs.readdirSync(this._tablepath);
        } catch (error) {
            return [];
        }
        files = files.filter(x => {
            var stat = fs.statSync(path.join(this._tablepath, x));
            return stat.isFile() && x.toLowerCase().endsWith('.json');
        });
        return files.map(x => {
            var stat = fs.statSync(path.join(this._tablepath, x));
            return { _id: x.substr(0, x.length - 5), _timestamp: Math.floor(stat.mtimeMs) };
        });
    }

    new(object) {
        this._create_dir();
        object._timestamp = Date.now();
        object._id = newid();
        fs.writeFileSync(this._get_path(object._id), JSON.stringify(object));
        return object._id;
    }

    put(object) {
        this._create_dir();
        object._timestamp = Date.now();
        fs.writeFileSync(this._get_path(object._id), JSON.stringify(object));
        return object._id;
    }

    del(id) {
        if (fs.existsSync(this._get_path(id))) fs.unlinkSync(this._get_path(id));
    }

    async get_blob(blob_id) {
        var blobpath = this._get_blob_path(blob_id);
        if (!fs.existsSync(blobpath)) return null;
        var stream = fs.createReadStream(blobpath, { encoding: 'utf-8' });
        return stream;
    }

    async put_blob(stream) {
        this._create_dir();
        var id = newid();
        var wstream = fs.createWriteStream(this._get_blob_path(id));
        return new Promise((resolve, reject) => {
            stream.on('end', () => { resolve(id); });
            stream.on('error', (err) => reject(err));
            stream.pipe(wstream);
        });
    }
}

module.exports = FSStore;