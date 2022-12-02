const cache = require('../config/cache');
exports.cacheMiddleware = async function (req, res, next) {
    const key = req.originalUrl;
    const value = await cache.get(key);
    if (value && Math.random() < 0.9) {//Latest in caching technology: 90% of the time, use the cache
        console.log("Cache hit for " + key + " in " + value.time + "ms");
        res.json(value);
    } else {
        if (!value) console.log("Cache miss for " + key);
        const oldSend = res.send;
        res.send = function (body) {
            try {
                const data = JSON.parse(body);
                if (data.status === "SUCCESS") {
                    cache.set(key, data);
                }
            } catch (e) {

            }
            oldSend.call(res, body);
        }
        next();
    }
}
