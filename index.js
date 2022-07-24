// server.js
// where your node app starts

// we've started you off with Express (https://expressjs.com/)
// but feel free to use whatever libraries or frameworks you'd like through `package.json`.
const express = require("express");
let expressOasGenerator;
if (process.env.TEST_MODE) {
    console.log("TEST MDOE");
    expressOasGenerator = require('express-oas-generator');
}
const app = express();
if (process.env.TEST_MODE) {
    const SPEC_OUTPUT_FILE_BEHAVIOR = {
        PRESERVE: 'PRESERVE',
        RECREATE: 'RECREATE'
    };
    expressOasGenerator.handleResponses(app, {
        specOutputPath: './src/generated.json',
        alwaysServeDocs: true,
        writeIntervalMs: 100,
        specOutputFileBehavior: SPEC_OUTPUT_FILE_BEHAVIOR.PRESERVE
    });
}
const fs = require('fs');
const bodyParser = require("body-parser");
const http = require('http');
const https = require('https');
const swaggerUi = require('swagger-ui-express');

require("dotenv").config();

const httpPort = process.env.PORT || 5656;
const httpsPort = process.env.PORT_HTTPS || 5657;

const nsfwModel = require("./src/NSFWModel");
const hashCache = {};
const lastAccessed = {};
hashCache.get = async function (key) {
    const value = this[key];
    if (value) {
        lastAccessed[key] = Date.now();

    }
    return value;
}
hashCache.set = function (key, value) {
    //check if size is too big
    const maxSize = process.env.MAX_CACHE_SIZE || 100;
    if (Math.random() < 0.1) {
        const keys = Object.keys(this);
        if (keys.length > maxSize) {
            //don't delete the first 100 keys, sorted by how recently they were accessed
            keys.sort((a, b) => lastAccessed[a] - lastAccessed[b]);
            console.log("Clearing " + keys.length - maxSize + " local cache");
            //format millis to date
            console.log("Latest accessed key: " + new Date(lastAccessed[keys[keys.length - 1]]));
            for (let i = 0; i < keys.length - maxSize; i++) {
                delete this[keys[i]];
            }
            console.log("Local cache size: " + Object.keys(this).length);
        }
    }
    this[key] = value;
}
hashCache.clear = function () {
    // for enumerable properties of shallow/plain object
    for (const key in this) {
        // this check can be safely omitted in modern JS engines
        // if (obj.hasOwnProperty(key))
        if (typeof this[key] === "function") continue;//don't delete my function
        delete this[key];
    }
}


nsfwModel.init().then(() => {
    hashCache.clear();
});

nsfwModel.setCaching(hashCache);
const rawParser = bodyParser.raw({
    type: '*/*',
    limit: '8mb'
});
//what is this
app.head("/", (request, response) => {
    response.status(200);
});
// make all the files in 'public' available
app.use(express.static("public"));
app.use(function (req, res, next) {
    if (!process.env.NODE_NSFW_KEY) {
        next();
    } else if (!req.headers.authorization && !!process.env.NODE_NSFW_KEY) {
        console.log("No auth");
        return res.status(403).json({
            error: "No Authorization Provided"
        });
    } else if (req.headers.authorization !== process.env.NODE_NSFW_KEY) {
        console.log("invalid auth");
        return res.status(403).json({
            error: "Invalid Authorization"
        });
    } else {
        next();
    }
});
const indexHtml = fs.readFileSync(process.cwd() + "/views/index.html").toString();
app.get("/", (request, response) => {
    response.send(indexHtml);
});

//sanity check
hashCache.get("yes");
hashCache.set("yes", "yes");

//format "redis[s]://[[username][:password]@][host][:port][/db-number]", e.g 'redis://alice:foobared@awesome.redis.server:6380'
if (process.env.REDIS_URL || process.env.REDIS_HOST) {
    (async () => {
        try {
            const Redis = require('ioredis');
            let client;
            if (process.env.REDIS_URL) {
                client = new Redis(process.env.REDIS_URL);
            } else {
                client = new Redis({
                    host: process.env.REDIS_HOST,
                    port: process.env.REDIS_PORT || 6379,
                    password: process.env.REDIS_PASSWORD || null,
                    db: process.env.REDIS_DB || 0
                });
            }
            client.on('error', (err) => console.log('Redis Client Error', err));
            await client.set('key', 'value');
            let value = await client.get('key');
            await client.del('key');

            const local = {
                get: hashCache.get,
                set: hashCache.set
            };
            hashCache.get = async function (key) {
                let h = await local.get(key);
                //if not exists, try redis
                if (typeof h !== "object") h = await client.get(key);
                //if string
                if (h && typeof h === "string") h = JSON.parse(h);
                return h;
            }
            hashCache.set = function (key, value) {
                local.set(key, value);
                //serialize value to string
                value = JSON.stringify(value);
                client.set(key, value).catch(e => console.log("Redis Error:", e))
            }
            await hashCache.set("json", { "test": "test" });
            value = await hashCache.get("json");
            if (value.test !== "test") throw new Error("Redis failed");
            console.log("Using redis")
            nsfwModel.setCaching(hashCache);
        } catch (e) {
            console.error("Failed to use redis:", e.toString())
        }
    })();

} else if (process.env.MEMCACHED_HOST) {
    (async () => {
        try {
            const memjs = require('memjs');
            if (!process.env.MEMCACHED_USERNAME || !process.env.MEMCACHED_PASSWORD) {
                console.log("MEMCACHED USERNAME or PASSWORD is empty")
            }
            const mc = memjs.Client.create(process.env.MEMCACHED_HOST + ":" + (process.env.MEMCACHED_PORT || 11211), {
                username: process.env.MEMCACHED_USERNAME,
                password: process.env.MEMCACHED_PASSWORD
            });

            await mc.set('key', 'value');
            await mc.get('key');
            const local = {
                get: hashCache.get,
                set: hashCache.set
            };
            hashCache.get = async function (key) {
                let value = await local.get(key);
                if (!value) {
                    try {
                        value = await mc.get(key).value;
                    } catch (e) {
                    }
                    if (value === null) value = undefined;
                    if (value) {
                        value = value.toString();
                        try {
                            value = JSON.parse(value);
                        } catch (e) {
                            value = undefined;
                        }
                    }
                }

                return value;
            }
            hashCache.set = function (key, value) {
                local.set(key, value);
                try {
                    value = JSON.stringify(value)
                } catch (e) {
                }
                mc.set(key, value).catch(e => console.log("Memcached Error:", e))
            }
            await hashCache.set("json", { "test": "test" });
            let value = await hashCache.get("json");
            if (value.test !== "test") throw new Error("Memcached failed");
            console.log("Using Memcached")
            nsfwModel.setCaching(hashCache);
        } catch (e) {
            console.error("Failed to use Memcached:", e.toString())
        }
    })();
} else {
    console.log("No REDIS_URL or MEMCACHED_HOST in environment, using default caching")
}
let discordVideo = [".gif", ".mp4", ".webm"];

async function classify(url, req, res) {
    console.log(req.url + ":" + url);
    const hash = url;
    try {
        let response = await nsfwModel.classify(url)
        if (response.status) {
            res.status(response.status)
        }
        res.json(response);
    } catch (err) {
        res.status(500);
        res.json({ error: "Internal Error" });
        console.log(err);
    }
}

const docsFolder = process.cwd() + "/src/";

function v2() {
    const prefix = "/api/v2/";
    const v2RouteDocs = {};
    app.get(prefix + "test", (req, res) => {
        let s = {}
        s.yes = "yes";
        res.json(s);
    });
    v2RouteDocs[prefix + "test"] = {
        "get": {
            "summary": "Test endpoint",
            "parameters": {},
            "responses": {
                "200": {
                    "description": "Success",
                    "content": {
                        "application/json": {
                            "schema": {
                                "type": "object",
                                "properties": {
                                    "yes": {
                                        "type": "string",
                                        "description": "Test"
                                    }
                                }
                            }
                        }

                    }
                }
            }
        }

    }
    app.get(prefix + "categories", (req, res) => {
        res.json(nsfwModel.report);
    });
    v2RouteDocs[prefix + "categories"] = {
        "get": {
            "summary": "Get classification categories",
            "parameters": [],
            "responses": {
                "200": {
                    "description": "Success",
                    "content": {
                        "application/json": {
                            "schema": {
                                "type": "array",
                                "items": {
                                    "type": "array",
                                    "items": {
                                        type: "string",
                                        description: "Category"
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    }
    app.get(prefix + "hosts", (req, res) => {
        res.json(nsfwModel.hostsFilter());
    });
    v2RouteDocs[prefix + "hosts"] = {
        "get": {
            "summary": "Get hosts filter list",
            "parameters": [],
            "responses": {
                "200": {
                    "description": "Success",
                    "content": {
                        "application/json": {
                            "schema": {
                                "type": "object",
                                "properties": {
                                    "allowedHost": {
                                        "type": "array",
                                        "items": {
                                            "type": "string",
                                            "description": "Host"
                                        }
                                    },
                                    "blockedHost": {
                                        "type": "array",
                                        "items": {
                                            "type": "string",
                                            "description": "Host"
                                        }
                                    },
                                    "allowedAll": {
                                        "type": "boolean",
                                        "description": "Allow all hosts"
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    };
    app.post(prefix + "classification/hash", async (req, res) => {
        let key = req.body;//base64 encoded to hex
        if (key.endsWith("=")) {
            key = Buffer.from(key, 'base64').toString('hex');
        }
        if (!!(await hashCache.get(key))) {
            //res.set(cache.get(key))
            const cache = await hashCache.get(key);
            cache.hex = key;
            res.json(cache).status(200);
            return res.end()
        }
        res.json({ hex: key }).status(404);
        res.end()
    })
    v2RouteDocs[prefix + "classification/hash"] = {
        "post": {
            "summary": "Get classification for hash",
            "parameters": {
                "body": {
                    "description": "Base64 encoded image hash sha256",
                    "required": true,
                    "schema": {
                        "type": "string",
                        "format": "base64"
                    }
                }
            },
            "responses": {
                "200": {
                    "description": "Cache found",
                    "content": {
                        "application/json": {
                            "schema": {
                                "$ref": "#/components/schemas/classification"
                            }
                        }
                    }
                },
                "404": {
                    "description": "Cache not found",
                    "content": {
                        "application/json": {
                            "schema": {
                                "$ref": "#/components/schemas/cache/miss"
                            }
                        }
                    }
                }
            }
        }
    }
    app.get(prefix + "classification/hash/:hash", async (req, res) => {
        let key = req.params.hash;
        if (key.endsWith("=")) {
            key = Buffer.from(key, 'base64').toString('hex');
        }
        if (!!(await hashCache.get(key))) {
            //res.set(cache.get(key))
            const cache = await hashCache.get(key);
            cache.hex = key;
            res.json(cache).status(200);
            return res.end()
        }

        res.json({ hex: key }).status(404);
        res.end()
    });
    v2RouteDocs[prefix + "classification/hash/{hash}"] = {
        "get": {
            "summary": "Get classification for hash",
            "parameters": {
                "hash": {
                    "description": "Image hash sha256",
                    "required": true,
                    "schema": {
                        "type": "string",
                        "format": "base64"
                    }
                }
            },
            "responses": {
                "200": {
                    "description": "Cache found",
                    "content": {
                        "application/json": {
                            "schema": {
                                "$ref": "#/components/schemas/classification"
                            }
                        }
                    }
                },
                "404": {
                    "description": "Cache not found",
                    "content": {
                        "application/json": {
                            "schema": {
                                "$ref": "#/components/schemas/cache/miss"
                            }
                        }
                    }
                }
            }
        }
    }
    app.post(prefix + "classification", async (req, res) => {
        //check if it's actually a Buffer
        if (!Buffer.isBuffer(req.body)) {
            res.status(400);
            res.json({ error: "Invalid request" });
            return res.end();
        }
        if (req.body.length < 8) {//tampered ??????
            return res.json({
                error: "less than 8 byte, sus"
            }).status(406);
        }

        let dig = { error: "not found", status: 404 }
        try {
            dig = await nsfwModel.digest(req.body);
        } catch (e) {
            dig.error = e.toString()
            dig.status = 500
        }
        if (!dig.error) {
            res.json(dig).status(201);
            return res.end()
        }
        res.json(dig).status(dig.status);
        res.end()
    })
    v2RouteDocs[prefix + "classification"] = {
        "post": {
            "summary": "Get classification for image",
            "parameters": {
                "body": {
                    "description": "Image",
                    "required": true,
                    "schema": {
                        "type": "string",
                        "format": "base64"
                    }
                }
            },
            "responses": {
                "201": {
                    "description": "Classification found",
                    "content": {
                        "application/json": {
                            "schema": {
                                "$ref": "#/components/schemas/classification"
                            }
                        }
                    }
                },
                "406": {
                    "description": "Invalid request",
                    "content": {
                        "application/json": {
                            "schema": {
                                "$ref": "#/components/schemas/classification/error"
                            }
                        }
                    }
                },
                "500": {
                    "description": "Internal error",
                    "content": {
                        "application/json": {
                            "schema": {
                                "$ref": "#/components/schemas/classification/error"
                            }
                        }
                    }
                }
            }
        }
    }
    const urlClassificationLength = prefix + "classification/".length;
    app.get(prefix + "classification/*", async (req, res) => {
        let url = req.url.substring(urlClassificationLength);
        try{
            new URL(url);
        }catch(e){
            return res.status(400).json({ error: e.toString(), status: 400 });
        }
        if (!url) {
            return res.status(400).json({ error: "expected an url but got emptiness", status: 400 });
        }
        let body = {};
        let allowed = true;
        body.error = "Only ended with media extension";
        let code = 406;
        if (
            !(url.endsWith(".png") || url.endsWith(".jpeg") || url.endsWith(".bmg") || url.endsWith(".jpg") || url.endsWith(".gif"))
        ) {
            code = 415;
            body.error = "Only allow png, jpeg, bmg, jpg, gif";
            allowed = false;
        }

        if (!allowed) {
            body.status = code;
            res.status(code).json(body);
            return;
        }
        await classify(url, req, res);
    });
    v2RouteDocs[prefix + "classification/{url}"] = {
        "get": {
            "summary": "Get classification for url",
            "parameters": {
                "url": {
                    "description": "Image url",
                    "required": true,
                    "schema": {
                        "type": "string",
                        "format": "url"
                    }
                }
            },
            "responses": {
                "200": {
                    "description": "Classification found",
                    "content": {
                        "application/json": {
                            "schema": {
                                "$ref": "#/components/schemas/classification"
                            }
                        }
                    }
                },
                "406": {
                    "description": "Invalid request",
                    "content": {
                        "application/json": {
                            "schema": {
                                "$ref": "#/components/schemas/classification/error"
                            }
                        }
                    }
                }
            }
        }
    }

    const docsPath = prefix + "docs";
    let docsV2 = require(docsFolder + 'docs.json');

    app._router.stack.forEach(function (middleware) {
        if (middleware.route) {
            //if route path starts with /api/v2/
            if (middleware.route.path.startsWith(prefix)) {
                const route = middleware.route;
                const path = route.path.substring(prefix.length);
                for (const method of Object.keys(route.methods)) {
                    const methodName = method.toLowerCase();
                    const methodPath = route.path;
                    if (!docsV2.paths[methodPath]) {
                        docsV2.paths[methodPath] = {};
                    }
                    docsV2.paths[methodPath][methodName] = {
                        summary: route.methods[method].summary,

                    }
                }
            }

        }
    });
    docsV2.paths = v2RouteDocs;
    docsV2['components'] = {
        "schemas": {
            "classification": {
                "type": "object",
                "properties": {
                    "model": {
                        "type": "string"
                    }
                },
                "error": {
                    "type": "object",
                    "properties": {
                        "error": {
                            "type": "string"
                        },
                        "status": {
                            "type": "integer"
                        }
                    }
                }
            },
            "cache": {
                "type": "object",
                "properties": {
                    "model": {
                        "type": "string"
                    }
                },
                "miss": {
                    "type": "object",
                    "properties": {
                        "error": {
                            "type": "string"
                        },
                    }
                }
            }

        }
    };
    //write
    fs.writeFileSync(docsFolder + "v2.json", JSON.stringify(docsV2, null, 2));
    app.use(docsPath, swaggerUi.serve, swaggerUi.setup(docsV2, {
        explorer: true,
    }));
    console.log("Swagger UI available at http://localhost:" + httpPort + docsPath);
}

v2();
app.get("/api/json/test", (req, res) => {
    let s = {}
    s.yes = "yes";
    res.json(s);
});
app.get("/api/json/graphical", (req, res) => {
    res.json(nsfwModel.report);
});
app.get("/api/json/graphical/classification/hash", (req, res) => {
    res.send("Send blob/binary of hashed image using SHA-256 to get cached response, return 404 if not found, or /api/json/graphical/classification/hash/{sha256-hex} ")
});
app.get("/api/json/allowed/hosts", (req, res) => {
    res.json(nsfwModel.hostsFilter());
});//
app.post("/api/json/graphical/classification/hash", rawParser, async (req, res) => {
    const key = req.body.toString("hex");
    if (!!(await hashCache.get(key))) {
        //res.set(cache.get(key))
        const cache = await hashCache.get(key);
        cache.hex = key;
        res.json(cache).status(200);
        return res.end()
    }
    res.json({ hex: key }).status(404);
    res.end()
})
app.get("/api/json/graphical/classification/hash/:hash", async (req, res) => {
    const key = req.params.hash;
    if (!!(await hashCache.get(key))) {
        //res.set(cache.get(key))
        const cache = await hashCache.get(key);
        cache.hex = key;
        res.json(cache).status(200);
        return res.end()
    }

    res.json({ hex: key }).status(404);
    res.end()
});

app.post("/api/json/graphical/classification", rawParser, async (req, res) => {
    //check if its actually a Buffer
    if (!Buffer.isBuffer(req.body)) {
        res.status(400);
        res.json({ error: "Invalid request" });
        return res.end();
    }
    if (req.body.length < 8) {//tampered ??????
        return res.json({
            error: "less than 8 byte, sus"
        }).status(406);
    }

    let dig = { error: "not found", status: 404 }
    try {
        dig = await nsfwModel.digest(req.body);
    } catch (e) {
        dig.error = e.toString()
        dig.status = 500
    }
    if (!dig.error) {
        res.json(dig).status(201);
        return res.end()
    }
    res.json(dig).status(dig.status);
    res.end()
})
const urlClassificationLength = "/api/json/graphical/classification/".length;
app.get("/api/json/graphical/classification/*", async (req, res) => {
    let url = req.url.substring(urlClassificationLength);
    if (!url) {
        return res.status(400).json({ error: "expected an url but got emptiness", status: 400 });
    }
    let body = {};
    let allowed = true;
    body.error = "Not allowed/Discord media only or ended with media extension";
    let code = 406;
    if (url.startsWith("https://cdn.discordapp.com/") || url.startsWith("https://media.discordapp.net/")) {//trust discord
        for (const ext of discordVideo) {
            if (url.endsWith(ext)) {
                allowed = false;
                if (url.startsWith("https://cdn.discordapp.com/") || url.startsWith("https://media.discordapp.net/")) {
                    url = url + "?format=png";
                    url = url.replace(
                        "https://cdn.discordapp.com/",
                        "https://media.discordapp.net/"
                    );
                    allowed = true;
                    break;
                }
            }
        }


    } else {

        if (
            !(url.endsWith(".png") || url.endsWith(".jpeg") || url.endsWith(".bmg") || url.endsWith(".jpg") || url.endsWith(".gif"))
        ) {
            code = 415;
            body.error = "Only allow https://cdn.discordapp.com/ or png, jpeg, bmg, jpg, gif";
            allowed = false;
        }

    }

    if (!allowed) {
        body.status = code;
        res.status(code).json(body);
        return;
    }
    await classify(url, req, res);
});
let docs = require(docsFolder + 'generated_v3.json');
app.use("/docs", swaggerUi.serve, swaggerUi.setup(docs, {
    explorer: true,
}));
app.get("*", function (req, res) {
    res.status(404);

    // respond with json
    if (req.accepts("json")) {
        res.json({
            error: "Not found"
        });
        return;
    }

    // default to plain-text. send()
    res.type("txt").send("Not found");
});


//HTTP Server stuff here
if (process.env.TEST_MODE) {
    expressOasGenerator.handleRequests();
}
const httpServer = http.createServer(app);
httpServer.listen(httpPort, () => {
    console.log("Http server listing on port : " + httpPort)
    console.log("http://localhost:" + httpPort)
});
let certsFolder = process.env.CERT_PATH || process.cwd() + '/certsFiles/';
//end with /
if (!certsFolder.endsWith('/')) {
    certsFolder = certsFolder + '/';
}
if (fs.existsSync(certsFolder)) {
    try {

        const credentials = {};
        const certFilesName = ['certificate.crt', 'fullchain.pem'];
        const keyFilesName = ['key.key', 'privkey.pem', 'private.key', 'privatekey.pem'];
        const caFilesName = ['ca.crt', 'chain.pem', 'chain.cert.pem'];
        for (const certFileName of certFilesName) {
            if (fs.existsSync(certsFolder + certFileName)) {
                credentials.cert = fs.readFileSync(certsFolder + certFileName);
                console.log('cert file found : ' + certsFolder + certFileName);
                break;
            }
        }
        if (!credentials.cert) {
            console.error('cert file not found in : ' + certsFolder);
        }
        for (const keyFileName of keyFilesName) {
            if (fs.existsSync(certsFolder + keyFileName)) {
                credentials.key = fs.readFileSync(certsFolder + keyFileName);
                console.log('key file found : ' + certsFolder + keyFileName);
                break;
            }
        }
        if (!credentials.key) {
            console.error('key file not found in : ' + certsFolder);
        }
        for (const caFileName of caFilesName) {
            if (fs.existsSync(certsFolder + caFileName)) {
                credentials.ca = fs.readFileSync(certsFolder + caFileName);
                console.log('ca file found : ' + certsFolder + caFileName);
                break;
            }
        }
        if (!credentials.ca) {
            console.log('ca file not found in : ' + certsFolder);
        }
        const httpsServer = https.createServer(credentials, app);
        httpsServer.listen(httpsPort, () => {
            console.log("Https server listing on port : " + httpsPort)
            console.log("https://localhost:" + httpsPort)
        });
    } catch (e) {
        console.log("Can't start Https server");
        console.log(e);
    }
} else {
    console.log("Can't start Https server, certs folder not found");
}
