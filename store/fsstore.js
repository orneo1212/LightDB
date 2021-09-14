const path = require('path');
const fs = require('fs');

class FSStore {
    constructor(table) {
        this._tablepath = path.join(process.cwd(), table);
    }
    //if (!fs.existsSync(this._tablepath)) fs.mkdirSync(this._tablepath);
    _get_path(id) {
        return path.join(this._tablepath, id + ".json");
    }
    get(id) {
        try {
            return JSON.parse(fs.readFileSync(this._get_path(id)));
        } catch (error) {
            return null;
        }
    }

    list() {
        var files = fs.readdirSync(this._tablepath);
        files = files.filter(x => {
            var stat = fs.statSync(path.join(this._tablepath, x));
            return stat.isFile() && x.toLowerCase().endsWith('.json');
        });
        return files.map(x => {
            var stat = fs.statSync(path.join(this._tablepath, x));
            return { _id: x.substr(0, x.length - 5), _timestamp: Math.floor(stat.mtimeMs * 1000) };
        });
    }

    new(object) {
        object._timestamp = Date.now();
        object._id = newid();
        fs.writeFileSync(this._get_path(object._id), JSON.stringify(object));
        return object._id;
    }

    put(object) {
        object._timestamp = Date.now();
        fs.writeFileSync(this._get_path(object._id), JSON.stringify(object));
        return object._id;
    }

    del(id) {
        fs.unlinkSync(this._get_path(id));
    }
}

module.exports = { FSStore };