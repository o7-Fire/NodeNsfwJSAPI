// server.js
// where your node app starts

// we've started you off with Express (https://expressjs.com/)
// but feel free to use whatever libraries or frameworks you'd like through `package.json`.
const express = require("express");
const app = express();
const fs = require('fs');
const bodyParser = require("body-parser");
const http = require('http');
const https = require('https');
const crypto = require('crypto');
const Path = require("path");
const dotenv = require("dotenv")
dotenv.config()
const httpPort = process.env.PORT || 5656;
const httpsPort = process.env.PORT_HTTPS || 5657;

const cacheDir = __dirname + "/pics";
try {
    fs.mkdirSync(cacheDir);
} catch (e) {
}

const nsfwModel = require("./src/NSFWModel");
const hashCache = {};
hashCache.get = async function (key) {
    return this[key];
}
hashCache.set = function (key, value) {
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


const rawParser = bodyParser.raw({
    type: '*/*',
    limit: '8mb'
});
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
app.get("/", (request, response) => {
    response.sendFile(__dirname + "/views/index.html");
});

//sanity check
hashCache.get("yes");
hashCache.set("yes", "yes");

//format "redis[s]://[[username][:password]@][host][:port][/db-number]", e.g 'redis://alice:foobared@awesome.redis.server:6380'
if (process.env.REDIS_URL) {


    (async () => {
        try {
            const redis = require('redis');
            const client = redis.createClient({
                socket: {
                    url: process.env.REDIS_URL
                }
            });

            client.on('error', (err) => console.log('Redis Client Error', err));

            await client.connect();

            await client.set('key', 'value');
            const value = await client.get('key');
            const local = {
                get: hashCache.get,
                set: hashCache.set
            };
            hashCache.get = async function (key) {
                let h = await local.get(key);
                if(h === undefined) h = await client.get(key);
                if(h === null) h = undefined;
                return h;
            }
            hashCache.set = function (key, value) {
                local.set(key, value);
                client.set(key, value).catch(e => console.log("Redis Error:", e))
            }
            console.log("Using redis")
        } catch (e) {
            console.error("Failed to use redis:", e.toString())
        }
    })();

}else if(process.env.MEMCACHED_HOST){
    (async () => {
        try {
            const memjs = require('memjs');
            if (!process.env.MEMCACHED_USERNAME || !process.env.MEMCACHED_PASSWORD) {
                console.log("MEMCACHED USERNAME or PASSWORD is empty")
            }
            const mc = memjs.Client.create(process.env.MEMCACHED_HOST, {
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
                if(!value) {
                    try {
                        value = await mc.get(key).value;
                    }catch (e){}
                    if(value === null) value = undefined;
                    if(value){
                        value = value.toString();
                        try{
                            value = JSON.parse(value);
                        }catch (e){}
                    }
                }

                return value;
            }
            hashCache.set = function (key, value) {
                local.set(key, value);
                try {
                    value = JSON.stringify(value)
                }catch (e){}
                mc.set(key, value).catch(e => console.log("Memcached Error:", e))
            }
            console.log("Using Memcached")
        }catch (e){
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
        if (!(await hashCache.get(hash))) {
            hashCache.set(hash, await nsfwModel.classify(url));
        }
        const yikes = await hashCache.get(hash);
        if(yikes.status){
            res.status(yikes.status)
        }
        res.json(yikes);
    } catch (err) {
        res.status(500);
        res.json({error: "Internal Error"});
        console.log(err);
    }
}

app.get("/api/json/test", (req, res) => {
    let s = {}
    s.yes = "yes";
    res.json(s);
});
app.get("/api/json/graphical", (req, res) => {
    res.json(nsfwModel.report);
});
app.get("/api/json/graphical/classification/hash", (req, res) =>{
   res.send("Send blob of hashed image using SHA-256 to get cached response, return 404 if not found")
});
app.post("/api/json/graphical/classification/hash", rawParser, async (req, res) => {
    const key = req.body.toString("hex");
    if (!!(await hashCache.get(key))) {
        //res.set(cache.get(key))
        const cache = await hashCache.get(key);
        cache.hex = key;
        res.json(cache).status(200);
        return res.end()
    }


    res.json({hex: key}).status(404);
    res.end()
})


app.post("/api/json/graphical/classification", rawParser, async (req, res) => {
    if (req.body.length < 8) {//tampered ??????
        return res.json({
            error: "less than 8 byte, sus"
        }).status(406);
    }
    const sha256 = crypto.createHash('sha256');
    sha256.update(req.body);
    const hex = sha256.digest("hex").toString();
    if (!!(await hashCache.get(hex))) {
        return res.json(await hashCache.get(hex)).status(200);
    }
    if (process.env.CACHE_IMAGE_HASH_FILE)
        fs.writeFileSync(fs.readFileSync(Path.resolve(__dirname, cacheDir, hex + ".webm")), req.body, {
            flag: 'w'
        });
    let dig = {error: "not found", status: 404}
    try {
        dig = await nsfwModel.digest(req.body);
    }catch (e){
        dig.error = e.toString()
        dig.status = 500
    }
    hashCache.set(hex, dig); //regardless
    //res.set(dig);

    if (!dig.error) {
        res.json(dig).status(201);
        return res.end()
    }
    console.log("Error Processing, Hash: " + hex);
    res.json(dig).status(dig.status);
    res.end()
})

app.get("/api/json/graphical/classification/*", async (req, res) => {
    let url = req.url.substr("/api/json/graphical/classification/".length);
    if (!url) {
        return res.status(400).json({error: "expected an url but got emptiness", status: 400});
    }
    let body = {};
    let allowed = true;
    body.error = "Not allowed/Discord media only or ended with media extension";
    let code = 406;
    if (url.startsWith("https://cdn.discordapp.com/") || url.startsWith("https://media.discordapp.net/")) {
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
// listen for requests :)
/*fuck you unlisten listener
const listener = app.listen(process.env.PORT || 5656, () => {
    console.log("Your app is listening on port " + listener.address().port);
});
*/
const httpServer = http.createServer(app);
httpServer.listen(httpPort, () => {
    console.log("Http server listing on port : " + httpPort)
    console.log("http://localhost:"+httpPort)
});
if (fs.existsSync(__dirname + '/certsFiles/certificate.crt')) {
    try {

        const credentials = {};
        credentials.cert = fs.readFileSync(__dirname + '/certsFiles/certificate.pem');
        credentials.key = fs.readFileSync(__dirname + '/certsFiles/private.pem');
        if (fs.existsSync(__dirname + '/certsFiles/ca_bundle.crt')) {
            credentials.ca = fs.readFileSync(__dirname + '/certsFiles/ca_bundle.crt');
        }
        const httpsServer = https.createServer(credentials, app);
        httpsServer.listen(httpsPort, () => {
            console.log("Https server listing on port : " + httpsPort)
            console.log("https://localhost:"+httpsPort)
        });
    } catch (e) {
        console.log("Can't start Https server");
        console.log(e);
    }
}
