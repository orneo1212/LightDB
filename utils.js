function newid(length = 64) {
    return '' + Math.random().toString(36).substr(2, length);
}

module.exports = { newid };