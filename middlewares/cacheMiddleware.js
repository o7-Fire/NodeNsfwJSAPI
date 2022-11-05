const cache = require('../config/cache');


exports.cacheMiddleware = async function (req, res, next) {
    //only cache GET requests
    if (req.method !== 'GET') {
        next();
        return;
    }
    const key = req.originalUrl;
    const value = await cache.get(key);
    if (value) {
        console.log("Cache hit for " + key + " in " + value.time + "ms");
        res.send(value);
    } else {
        console.log("Cache miss for " + key);
        const oldSend = res.send;
        res.send = function (body) {
            cache.set(key, body);
            oldSend.call(res, body);
        }
        next();
    }
}