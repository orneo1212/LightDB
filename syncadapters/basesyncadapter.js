class NotImplemented extends Error { }

class BaseSyncAdapter {
    async list() {
        throw new NotImplemented();
    }
    async get(itemid) {
        throw new NotImplemented();
    }
    async has(itemid) {
        throw new NotImplemented();
    }
    async put(item) {
        throw new NotImplemented();
    }
    async del(itemid) {
        throw new NotImplemented();
    }
}

module.exports = BaseSyncAdapter;