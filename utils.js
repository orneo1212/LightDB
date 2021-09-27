/** return uuid of format XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXX */
function newid() {
    let s4 = () => { return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1); };
    return s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4();
}

module.exports = { newid };