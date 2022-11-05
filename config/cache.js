const redis = require('ioredis');
const memjs = require('memjs');
const fs = require('fs');
const Redis = require("ioredis");


function cleanData(data) {
    //make value immutable
    data = JSON.parse(JSON.stringify(data));//also cleans up the object
    //clean value
    delete data.time;
    delete data.cache;
    delete data.hex;
    return data;
}

function selfTestSync(cache) {
    cache.set("json", {"test": "test"});
    const value = cache.get("json");
    if (value.test !== "test") {
        console.error(cache.name + " Error: Expected {\"test\": \"test\"} but got " + value);
        process.exit(1);
    }
}

function selfTestAsync(cache) {
    cache.set("json", {"test": "test"}).then((res) => {
        cache.get("json").then((res) => {
            if (res.test !== "test") {
                console.error(cache.name + " Error: Expected {\"test\": \"test\"} but got " + value);
                process.exit(1);
            }
        });
    });
}

const inMemoryCache = () => {
    const hashCache = {};
    let lastAccessed = {};
    hashCache.name = () => "In Memory";
    hashCache.get = function (key) {
        const startTime = Date.now();
        const value = this[key];
        if (value) {
            lastAccessed[key] = Date.now();
            value.time = Date.now() - startTime;
            value.hex = key;
            if (process.env.TEST_MODE) value.cache = this.name();
        }
        return value;
    }
    hashCache.set = function (key, value) {
        value = cleanData(value);
        //check if size is too big
        const maxSize = process.env.MAX_CACHE_SIZE || 100;
        if (Math.random() < 0.1) {
            const keys = Object.keys(this);
            if (keys.length > maxSize) {
                const dontDelete = ['get', 'set', 'clear', 'name'];
                //don't delete the first 100 keys, sorted by how recently they were accessed
                keys.sort((a, b) => lastAccessed[a] - lastAccessed[b]);
                console.log("Clearing " + keys.length - maxSize + " local cache");
                //format millis to date
                const millis = lastAccessed[keys[keys.length - 1]];
                console.log("Latest accessed key: " + new Date(millis));
                for (let i = 0; i < keys.length - maxSize; i++) {
                    if (dontDelete.includes(keys[i])) continue;
                    delete this[keys[i]];
                }
                console.log("Local cache size: " + Object.keys(this).length);
                //clear lastAccessed
                lastAccessed = {};
            }
        }
        this[key] = value;
        return value;
    }
    hashCache.clear = function () {
        // for enumerable properties of shallow/plain object
        for (const key in this) {
            // this check can be safely omitted in modern JS engines
            // if (obj.hasOwnProperty(key))
            if (typeof this[key] === "function") continue;//don't delete my function and name prop
            delete this[key];
        }
    }
    //self test
    selfTestSync(hashCache);
    return hashCache;
}

const fileCache = () => {
    const fileCache = {};
    const fileCachePath = process.env.FILE_CACHE_PATH || "./cache";
    if (!fs.existsSync(fileCachePath)) {
        fs.mkdirSync(fileCachePath, {recursive: true});
    }
    //check if it's a directory
    if (!fs.lstatSync(fileCachePath).isDirectory()) {
        console.error(fileCachePath + " is not a directory");
        process.exit(1);
    }
    //check if writeable
    try {
        fs.accessSync(fileCachePath, fs.constants.W_OK);
    } catch (err) {
        console.error(fileCachePath + " is not writeable");
        console.error(err);
        process.exit(1);
    }
    fileCache.name = () => "File";
    fileCache.get = async function (key) {
        const startTime = Date.now();
        const value = JSON.parse(fs.readFileSync(fileCachePath + "/" + key, 'utf8'));
        value.time = Date.now() - startTime;
        value.hex = key;
        if (process.env.TEST_MODE) value.cache = this.name();
        return value;
    }
    fileCache.set = function (key, value) {
        value = cleanData(value);
        //write file
        fs.writeFileSync(fileCachePath + "/" + key, JSON.stringify(value));
        return value;
    }
    fileCache.clear = function () {
        //clear all files
        fs.rmdirSync(fileCachePath, {});
        fs.mkdirSync(fileCachePath, {recursive: true});
    }
    //self test
    selfTestAsync(fileCache);
    return fileCache;
}

const redisClient = () => {
    let client;
    if (process.env.REDIS_CLUSTER_CONFIGURATION_ENDPOINT) {
        let startupNodes = [];
        for (const host of process.env.REDIS_CLUSTER_CONFIGURATION_ENDPOINT.split(";")) {
            startupNodes.push({
                host: host.split(":")[0],
                port: host.split(":")[1]
            });
        }
        client = new Redis.Cluster(startupNodes, {
            redisOptions: {
                password: process.env.REDIS_PASSWORD
            }
        });
        console.info("Redis Cluster Mode");
    } else if (process.env.REDIS_URL) {
        client = new Redis(process.env.REDIS_URL);
    } else {
        client = new Redis({
            host: process.env.REDIS_HOST || "localhost",
            port: process.env.REDIS_PORT || 6379,
            password: process.env.REDIS_PASSWORD || null,
            db: process.env.REDIS_DB || 0
        });
    }
    client.on('error', (err) => {
        console.error('Redis Client Error', err);
    });
    let redisCache = {};
    redisCache.name = () => "Redis";
    redisCache.get = async function (key) {
        const startTime = Date.now();
        const value = JSON.parse(await client.get(key));
        value.time = Date.now() - startTime;
        value.hex = key;
        if (process.env.TEST_MODE) value.cache = this.name();
        return value;
    }
    redisCache.set = async function (key, value) {
        value = cleanData(value);
        //set value
        await client.set(key, JSON.stringify(value));
        return value;
    }
    redisCache.clear = async function () {
        await client.flushdb();
    }
    //self test
    selfTestAsync(redisCache);
    return redisCache;
}

const memjsCache = () => {
    const mc = memjs.Client.create((process.env.MEMCACHED_HOST || "localhost") + ":" + (process.env.MEMCACHED_PORT || 11211), {
        username: process.env.MEMCACHED_USERNAME,
        password: process.env.MEMCACHED_PASSWORD
    });
    const memCache = {};
    memCache.name = () => "Memcached";
    memCache.get = async function (key) {
        const startTime = Date.now();
        const value = JSON.parse(await mc.get(key));
        value.time = Date.now() - startTime;
        value.hex = key;
        if (process.env.TEST_MODE) value.cache = this.name();
        return value;
    }
    memCache.set = async function (key, value) {
        value = cleanData(value);
        //set value
        await mc.set(key, JSON.stringify(value));
        return value;
    }
    memCache.clear = async function () {
        await mc.flush();
    }
    //self test
    selfTestAsync(memCache);
    return memCache;
}

function multilayer() {
    let cache = {};
    //MULTILAYER CACHE LESSS GOOOOO
    const cacheType = (process.env.CACHE_TYPE ? process.env.CACHE_TYPE.split(",") : undefined) || ["InMemory"];
    if (cacheType.length < 1) {
        console.error("No CACHE_TYPE specified");
        process.exit(1);
    }

    let layer = 0;
    for (const type of cacheType) {
        let localCache;
        switch (type) {
            case "InMemory":
                localCache = inMemoryCache();
                break;
            case "File":
                localCache = fileCache();
                break;
            case "Redis":
                localCache = redisClient();
                break;
            case "Memcached":
                localCache = memjsCache();
                break;
            default:
                console.error("Unknown cache type: " + type);
                process.exit(1);
        }
        //if one just return that one
        if (cacheType.length === 1) {
            console.log("Single layer cache: " + type);
            return localCache;
        }
        console.log("Cache Layer " + layer + " is " + localCache.name);
        layer++;
        const oldGet = cache.get;
        const oldSet = cache.set;
        const oldClear = cache.clear;
        cache.get = async function (key) {
            let value;
            try {
                value = await localCache.get(key);
            } catch (e) {
                console.error("Cache Layer " + layer + "/" + cache.name + " failed to get " + key);
                console.error(e);
            }
            if (!value) {
                value = await oldGet(key);
            }
            return value;
        }
        cache.set = async function (key, value) {
            try {
                value = await localCache.set(key, value);
            } catch (e) {
                console.error("Cache Layer " + layer + "/" + cache.name + " failed to set " + key);
                console.error(e);
            }
            value = await oldSet(key, value);
            return value;
        }
        cache.clear = async function () {
            try {
                await localCache.clear();
            } catch (e) {
                console.error("Cache Layer " + layer + "/" + cache.name + " failed to clear");
                console.error(e);
            }
            await oldClear();
        }
    }
    const oldGet = cache.get;
    cache.name = "MultiLayer(" + cacheType.join(", ") + ")";
    cache.get = async function (key) {
        const startTime = Date.now();
        const value = await oldGet(key);
        value.time = Date.now() - startTime;
        return value;
    }

    //self test
    selfTestAsync(cache);
    return cache;
}

const cache = multilayer();
exports.get = cache.get;
exports.set = cache.set;
exports.clear = cache.clear;
exports.name = cache.name;
