// you can use any other http client

let haveAVX = true;
let cpuInfo = "No CPU Info";
const fs = require('fs');
const isLinux = process.platform === "linux";
let err = undefined;
if (isLinux) {
    cpuInfo = String(fs.readFileSync("/proc/cpuinfo"));
    haveAVX = cpuInfo.includes("avx");
}

if (!haveAVX) {
    //console.error(cpuInfo);
    console.error("WARNING!!!!!!!! AVX instruction set not detected");
}

const axios = require("axios")
const Path = require("path");
const crypto = require('crypto');

if (!!process.env.CACHE_IMAGE_HASH_FILE) {
    //check if end with /
    if (!process.env.CACHE_IMAGE_HASH_FILE.endsWith("/")) {
        process.env.CACHE_IMAGE_HASH_FILE = process.env.CACHE_IMAGE_HASH_FILE + "/";
    }
    //check if folder exists
    const cacheFolder = process.env.CACHE_IMAGE_HASH_FILE;
    if (!fs.existsSync(cacheFolder)) {
        console.log("Creating cache folder: " + cacheFolder);
        fs.mkdirSync(cacheFolder, {recursive: true});
    }
    //check read and write
    try {
        fs.accessSync(process.env.CACHE_IMAGE_HASH_FILE, fs.constants.R_OK | fs.constants.W_OK);
    } catch (e) {
        console.log("Cache folder is not readable and writable, disabling cache");
        console.log(e.message);
        process.env.CACHE_IMAGE_HASH_FILE = undefined;
    }
}

let tf, nsfw = {};
//check if we have GPU
if (process.env.GPU) {
    tf = require('@tensorflow/tfjs-node-gpu');
    console.log("Using GPU");
} else {
    tf = require("@tensorflow/tfjs-node");
}
nsfw = require("nsfwjs");
tf.enableProdMode(); // enable on production


let v3_NSFWModel;

let currentModel = {
    url: "Default",
    size: "Default"
};
//GIF classifier is computationally expensive, disabled by default
const supportGIF = process.env.SUPPORT_GIF_CLASSIFICATION
if (supportGIF)
    console.log("SUPPORT_GIF_CLASSIFICATION")
//Using n1 do 1 - (n1 - n2)
//basically a matrix
//yo wtf is n1
//oh it's negative 1
const categories = {
    Drawing: {
        Hentai: "Anime",
        Sexy: "ArtificialProvocative",
        Neutral: "DigitalDrawing"
    },
    Neutral: {
        Drawing: "Digital",
        Sexy: {n1: "NaturallyProvocative"},
        Porn: {n1: "Disturbing"},
        Hentai: {n1: "SeductiveArt"}
    },
    Sexy: {
        Neutral: "SexuallyProvocative",
        Porn: "SeductivePorn"
    },
    Porn: {
        Sexy: {n1: "PornSeductive"},
        Hentai: {n1: "HentaiClips"},
        Neutral: {n1: "SoftPorn"}
    },
    Hentai: {
        Porn: "Doujin18",
        Drawing: {n1: "R34"}
    }
};

// ?????
function assignReport(t1, t2, reportPrediction) {
    let v2;
    let c2;
    let v1;
    let c1;
    c1 = t1.className;
    v1 = t1.probability;
    c2 = t2.className;
    v2 = t2.probability;
    if (categories[c1][c2]) {
        let c3 = categories[c1][c2];
        if (c3.n1) {
            reportPrediction[c3.n1] = v1 - v2;
            reportPrediction[c3.n1] = 1 - reportPrediction[c3.n1];
        } else {
            reportPrediction[c3] = v1 - v2;
        }
    } else {
        console.log("Not implemented: " + t1.className + ":" + t2.className);
    }
    return reportPrediction;
}

async function classify(image) {
    if (!v3_NSFWModel) {
        await module.exports.init();
    }
    const prediction = await v3_NSFWModel.classify(image);
    let reportPrediction = {};
    let t1 = prediction[0];
    let t2 = prediction[1];
    let t3 = prediction[2];
    let t4 = prediction[4];
    reportPrediction = assignReport(t1, t2, reportPrediction);
    for (const predictionKey1 in prediction) {
        let c1 = prediction[predictionKey1].className;
        reportPrediction[c1] = prediction[predictionKey1].probability;
    }
    return reportPrediction
}


function getImageType(content) {
    // Classify the contents of a file based on starting bytes (aka magic number:
    // https://en.wikipedia.org/wiki/Magic_number_(programming)#Magic_numbers_in_files)
    // This aligns with TensorFlow Core code:
    // https://github.com/tensorflow/tensorflow/blob/4213d5c1bd921f8d5b7b2dc4bbf1eea78d0b5258/tensorflow/core/kernels/decode_image_op.cc#L44
    //if not buffer or Uint8Array
    if (!(content instanceof Buffer) && !(content instanceof Uint8Array)) {
        throw new Error('Expected image buffer or Uint8Array, got ' + (typeof content));
    }
    if (content.length > 3 && content[0] === 255 && content[1] === 216 &&
        content[2] === 255) {
        // JPEG byte chunk starts with `ff d8 ff`
        return "JPEG";
    } else if (
        content.length > 4 && content[0] === 71 && content[1] === 73 &&
        content[2] === 70 && content[3] === 56) {
        // GIF byte chunk starts with `47 49 46 38`
        return "GIF";
    } else if (
        content.length > 8 && content[0] === 137 && content[1] === 80 &&
        content[2] === 78 && content[3] === 71 && content[4] === 13 &&
        content[5] === 10 && content[6] === 26 && content[7] === 10) {
        // PNG byte chunk starts with `\211 P N G \r \n \032 \n (89 50 4E 47 0D 0A
        // 1A 0A)`
        return "PNG";
    } else if (content.length > 3 && content[0] === 66 && content[1] === 77) {
        // BMP byte chunk starts with `42 4d`
        return "BMP";
    } else {
        throw new Error(
            'Expected image (BMP, JPEG, PNG, or GIF), but got unsupported ' +
            'image type');
    }
}

function hostsFilter() {
    const allowedHost = (process.env.ALLOWED_HOST || "cdn.discordapp.com;media.discordapp.net;github.com").split(";");
    const blockedHost = (process.env.BLOCKED_HOST || "localhost;127.0.0.1;::1").split(";");
    const allowedAll = !!process.env.ALLOW_ALL_HOST;
    return {
        allowedHost: allowedHost,
        blockedHost: blockedHost,
        allowedAll: allowedAll
    }
}

function hostAllowed(host) {
    const filter = hostsFilter();
    if (filter.blockedHost.includes(host)) {
        return false;
    }
    if (filter.allowedAll) {
        return true;
    }
    return filter.allowedHost.includes(host);
}

function hashData(data) {
    if (!data) return data;
    //if binary or buffer return hash
    if (Buffer.isBuffer(data) || typeof data === "Uint8Array") {
        //if binary return hash
        return crypto.createHash('sha256').update(data).digest('hex');
    }
    //check if hex
    if (data.length === 64 && data.match(/^[0-9a-fA-F]+$/)) {
        return data;
    }
    //return string, prevent path traversal
    data = (data + "").replace(/[^a-zA-Z0-9]/g, '.');
    //replace multiple dots with one
    data = data.replace(/\.+/g, '.');
    //remove leading and trailing dots
    data = data.replace(/^\.+|\.+$/g, '');
    //digest to hex
    return crypto.createHash('sha256').update(data).digest('hex');
}

//test hashData
function selfTestHashData() {
    for (let i = 0; i < 100; i++) {
        let data = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
        let hash = hashData(data);
        if (hash.length !== 64) {
            throw new Error("Hash length is not 64");
        }
        if (hash !== hashData(data)) {
            throw new Error("Hash is not deterministic: " + hash + " != " + hashData(data));
        }
    }
    if (process.env.NODE_ENV === "test") {
        console.log("Hash data self test passed");
    }
}

selfTestHashData();
const hashCache = require('../config/cache');
let averageTimeToProcess = 0;
let ivebeenhere = false;
let initResolve = [];
module.exports = {
    categories: categories,
    hostsFilter,
    hostAllowed,
    hashData,
    TEST_URL: process.env.TEST_URL || "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b6/SIPI_Jelly_Beans_4.1.07.tiff/lossy-page1-256px-SIPI_Jelly_Beans_4.1.07.tiff.jpg",
    init: async function () {
        if (v3_NSFWModel) return;  // Load the model in the memory only once!
        if (ivebeenhere) {
            const waitIPromise = new Promise((resolve) => {
                initResolve.push(resolve);
            });
            await waitIPromise;
            return;
        } else {
            ivebeenhere = true;
        }
        if (v3_NSFWModel) return;  // Load the model in the memory only once!
        const model_url = process.env.NSFW_MODEL_URL;
        const shape_size = process.env.NSFW_MODEL_SHAPE_SIZE;

        try {
            //model_url, { size: parseInt(shape_size) }
            if (!model_url || !shape_size) v3_NSFWModel = await nsfw.load();
            else {
                v3_NSFWModel = {};
                v3_NSFWModel = await nsfw.load(model_url, {size: parseInt(shape_size)});
                currentModel.size = shape_size;
                currentModel.url = model_url;
                //Cannot log after tests are done
                if (process.env.NODE_ENV !== "test") console.info("Loaded: " + model_url + ":" + shape_size);
            }
            //Cannot log after tests are done
            if (process.env.NODE_ENV !== "test") console.info("The NSFW Model was loaded successfully!");
        } catch (err) {
            console.error(err);
        }
        initResolve.forEach(resolve => resolve());
    },

    saveImage: async function (data, hash) {//return hash
        if (!process.env.CACHE_IMAGE_HASH_FILE) {
            return false;
        }
        if (!hash) {
            hash = this.hashData(data);
        }
        //check if hash contain "/"
        if (hash.indexOf("/") !== -1) {
            hash = hash.replace(/\//g, ".");
        }
        //check if hash contain "\"
        if (hash.indexOf("\\") !== -1) {
            hash = hash.replace(/\\/g, ".");
        }
        const path = Path.resolve(process.env.CACHE_IMAGE_HASH_FILE, hash);
        //check if file exist
        if (fs.existsSync(path)) {
            return false;
        }
        fs.writeFileSync(path, data, {
            flag: 'w'
        });
        return true;
    },

    //must not throw error
    //so anyway I start throwing error
    digest: async function (data, url = undefined) {
        let hexed = {
            binaryHash: undefined,
            stringHash: undefined
        }
        if (hashCache) {
            hexed.binaryHash = this.hashData(data);
            hexed.stringHash = this.hashData(url);
            if (!hexed.stringHash) {
                hexed.stringHash = hexed.binaryHash;
            }
            let cached = await hashCache.get(hexed.stringHash);
            if (cached) {
                return cached;
            }
            cached = await hashCache.get(hexed.binaryHash);
            if (cached) {
                return cached;
            }
        }
        if (err) return {error: err.toString(), status: 500}
        this.saveImage(data, hexed.binaryHash).then(r => {
            if (r) console.log("Saved image: " + hexed.binaryHash);
        });
        // Image must be in tf.tensor3d format
        // you can convert image to tf.tensor3d with tf.node.decodeImage(Uint8Array,channels)
        let reportPrediction = {};
        let image = {};
        image.dispose = function () {
        }
        let gif = false;
        try {
            gif = getImageType(data) === "GIF"
        } catch (e) {
            return {error: e.toString(), status: 415}
        }
        //sleep
        if (process.env.EXPERIMENTAL_RATELIMIT) {
            await new Promise((resolve, reject) => {
                setTimeout(() => {
                    resolve();
                }, averageTimeToProcess / 2);
            });
        }
        const startTime = Date.now();

        if (gif) {
            if (!supportGIF) return {error: "GIF support is not enabled", status: 415}
            reportPrediction.data = await v3_NSFWModel.classifyGif(data);
            //map to old format
            //from: [{className: string, probability: number}, {}, {}]
            //to: [{className1: number, className2: number, className3: number}, {}, {}]
            reportPrediction.data = reportPrediction.data.map((item) => {
                let newItem = {};
                item.forEach((item2) => {
                    newItem[item2.className] = item2.probability;
                });
                return newItem;
            });
        } else {
            image = await tf.node.decodeImage(data, 3);
            reportPrediction.data = [await classify(image)];
        }
        image.dispose(); // Tensor memory must be managed explicitly (it is not sufficient to let a tf.Tensor go out of scope for its memory to be released).
        reportPrediction.model = currentModel;
        reportPrediction.timestamp = new Date().getTime();
        reportPrediction.hex = url ? hexed.stringHash : hexed.binaryHash;
        reportPrediction.time = Date.now() - startTime;
        if (process.env.TEST_MODE) {
            reportPrediction.cache = "miss";
            reportPrediction.average_time = averageTimeToProcess;
        }
        //set cache
        if (hashCache) {
            await hashCache.set(hexed.binaryHash, reportPrediction);
            if (hexed.stringHash !== hexed.binaryHash) {
                await hashCache.set(hexed.stringHash, reportPrediction);
            }
        }
        averageTimeToProcess = (averageTimeToProcess + reportPrediction.time) / 2;
        return reportPrediction;
    },


    classify: async function (url) {
        //check cache
        if (hashCache) {
            const data = await hashCache.get(this.hashData(url));
            if (data) {
                return data;
            }
        }
        let pic;
        let result = {};
        let redirectCounter = 0;
        while (true) {
            if (redirectCounter > 5) {
                return {error: "Too many redirects", status: 400};
            }
            try {
                const host = new URL(url).hostname;

                if (hostAllowed(host)) {
                    pic = await axios.get(url, {
                        responseType: "arraybuffer",
                        maxContentLength: 15e7,
                        maxRedirects: 0,
                        validateStatus: function (status) {
                            return status >= 200 && status < 400; // default
                        }
                    });
                    //check if 3XX and location header
                    if (pic.status >= 300 && pic.status < 400 && pic.headers.location) {
                        //check if start with http
                        if (pic.headers.location.startsWith("http")) {
                            url = pic.headers.location;
                            redirectCounter++;
                            continue;
                        } else {
                            url = new URL(url).origin + pic.headers.location;
                        }
                        redirectCounter++;

                    } else {
                        break;
                    }
                } else {
                    throw {
                        message: "Host not allowed: " + host,
                        status: 403
                    };
                }
            } catch (err) {
                result.message = "Download Image Error for \"" + url + "\": " + (err ? (err.message ? err.message + " " + err.status : err) : "Unknown Error");//most readable code in here
                console.error(result.message);
                result.status = err.response ? err.response.status : (err.status || 500);
                throw result;
            }
        }

        try {
            result = await this.digest(pic.data, url);
        } catch (err) {
            console.error("Prediction Error: ", err);
            result.error = err.toString();
            result.status = 500;
            throw result;
        }

        return result;
    },
    available: function () {
        return v3_NSFWModel !== undefined;
    }
};
