class QueryResult {
    constructor(docs) {
        this._docs = docs || [];
    }
    length() {
        return this._docs.length;
    }

    get(index) {
        return this._docs[index] || null;
    }

    all() {
        return this._docs;
    }
}

function filter_items(items, conditions) {
    if (!conditions || conditions.length == 0) return items;
    var results = [];
    for (var i = 0; i < items.length; i++) {
        var item = items[i];
        var rbool = true;
        for (var j = 0; j < conditions.length; j++) {
            var cond = conditions[j];
            var operand = cond[1];
            var rb = item[cond[0][0]] == cond[0][1];
            if (operand == 'and' && conditions.length > 1) rbool = rbool && rb;
            else if (operand == 'or' && conditions.length > 1) rbool = rbool || rb;
            else rbool = rb;
            if (!rb && operand == 'and') break;
            if (!rb && operand == 'or') break;
        };
        if (rbool) results.push(item);
    };
    return results;
}
class Query {
    constructor(db) {
        this._db = db;
        this._conditions = [];
        this._limit = null;
        if (typeof this._db !== 'object') throw new Error("Query without correct db");
    }

    where(condition, operand = 'and') {
        Object.keys(condition).forEach((x) => {
            this._conditions.push([[x, condition[x]], operand.toLowerCase()]);
        });
        return this;
    }

    limit(number) {
        this._limit = number;
        return this;
    }

    run() {
        var results = [];
        var list = this._db.list();
        var all = list.map(x => this._db.get(x._id));
        if (this._conditions.length == 0) results = all.map(x => x);
        results = filter_items(all, this._conditions);
        if (this._limit && this._limit > 0) results = results.slice(0, this._limit);
        return new QueryResult(results);
    }
}

module.exports = Query;