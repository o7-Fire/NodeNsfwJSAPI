const cache = require('../config/cache');
exports.cacheMiddleware = async function (req, res, next) {
    const key = req.originalUrl;
    const value = await cache.get(key);
    if (value && Math.random() < 0.9) {//Latest in caching technology: 90% of the time, use the cache
        console.log("Cache hit for " + key + " in " + value.time + "ms");
        res.set('Cache-Control', 'public, max-age=604800');
        res.json(value);
    } else {
        if (!value) console.log("Cache miss for " + key);
        const oldSend = res.send;
        res.send = function (body) {
            //don't cache if plain text
            if (body.indexOf("status") !== -1) {
                cache.set(key, body);
            }
            oldSend.call(res, body);
        }
        next();
    }
}
