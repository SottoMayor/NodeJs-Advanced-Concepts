const mongoose = require('mongoose');
const redis = require('redis');
const util = require('util');

const redisUrl = 'redis://127.0.0.1:6379';
const redisClient = redis.createClient(redisUrl);
redisClient.get = util.promisify(redisClient.get);

const exec = mongoose.Query.prototype.exec;

mongoose.Query.prototype.exec = async function () {
    // Generating redis UNIQUE KEYS.
    const redisKey = JSON.stringify(
        Object.assign({}, this.getQuery(), {
            collection: this.mongooseCollection.name,
        })
    );

    // Redis Flow 1: Verify if the 'redisKey' already exists in redis
    const cachedValue = await redisClient.get(redisKey);

    // Redis Flow 2: The 'redisKey' already exists! Return the result stored in redis.
    if(cachedValue){
        // cachedValue is a Raw JSON, we need convert it to a mongoose object!
        // For this, we'll use the mongoose models.

        // BUT, this approach convert JSON objects to mongoose objects. We have, in other hand,
        // an array! We need convert this array to mongoose array of 'objects'(docs).
        const document = new this.model(JSON.parse(cachedValue)); 

        return document;
    }

    // Redis Flow 3: The 'redisKey' not exists yet! Query the result and store it into redis.
    const result = await exec.apply(this, arguments);
    
    redisClient.set(redisKey, JSON.stringify(result));

    return result;
};
