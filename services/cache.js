const mongoose = require('mongoose');

const exec = mongoose.Query.prototype.exec;

mongoose.Query.prototype.exec = function() {
    console.log('Execution into the mongoose.Query.prototype.exec');

    // To generate UNIQUE KEYS, we can combine the query with the collection,
    // both of mongoose!
    console.log(this.getQuery());
    console.log(this.mongooseCollection.name);

    const redisKey = Object.assign({}, this.getQuery(), { collection: this.mongooseCollection.name });
    console.log(redisKey);


    return exec.apply(this, arguments);
}