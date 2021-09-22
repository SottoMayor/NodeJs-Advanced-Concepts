const mongoose = require('mongoose');
const redis = require('redis');
const util = require('util');

const redisUrl = 'redis://127.0.0.1:6379';
const redisClient = redis.createClient(redisUrl);
redisClient.hget = util.promisify(redisClient.hget);

const exec = mongoose.Query.prototype.exec;

mongoose.Query.prototype.cache = function(options = {}) {
    // Adding a new prototype in mongoose.Query
    // This prototype will control if the query should or not be cached.

    this._cache = true; // Condition to be cacheable!

    this.hashKey = JSON.stringify(options.key || 'default_key');

    return this; // Condition to be chainable
}

mongoose.Query.prototype.exec = async function () {

    // Checking if this data should be cached.
    if(!this._cache){
        return exec.apply(this, arguments);
    }

    // Generating redis UNIQUE KEYS.
    const redisKey = JSON.stringify(
        Object.assign({}, this.getQuery(), {
            collection: this.mongooseCollection.name,
        })
    );

    // Redis Flow 1: Verify if the 'redisKey' already exists in redis
    const cachedValue = await redisClient.hget(this.hashKey, redisKey);

    // Redis Flow 2: The 'redisKey' already exists! Return the result stored in redis.
    if(cachedValue){
        // Parsing an object and array as well.

        const document = JSON.parse(cachedValue); 

        return Array.isArray(document) ?
            document.map(doc => new this.model(doc)):
            new this.model(document);
    }

    // Redis Flow 3: The 'redisKey' not exists yet! Query the result and store it into redis.
    const result = await exec.apply(this, arguments);
    
    redisClient.hmset(this.hashKey, redisKey, JSON.stringify(result), 'EX', 10);

    return result;
};

module.exports = {
    // Exporting a function to clear nested hashes.
    clearHash(hashKey){
        redisClient.del(JSON.stringify(hashKey));
    }
}
