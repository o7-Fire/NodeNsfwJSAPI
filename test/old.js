console.log("Test mode");
require("dotenv").config();
let startMemoryUsage = process.memoryUsage();
const nsfwModel = require("./docs/NSFWModel");
const axios = require('axios');
const fs = require('fs');
const crypto = require('crypto');
const Path = require("path");
const Fs = require("fs");
const host = "http://localhost:5656" || process.env.HOST;
const ignoreError = process.env.IGNORE_ERROR
const scanList = [
    "https://cdn.discordapp.com/attachments/997389718163566652/1000542968052207708/unknown.png",
    "https://github.com/o7-Fire/General/raw/master/AI/Logo/Accomplish-o7.png",
    "https://cdn.discordapp.com/attachments/921595377923268708/1000552203708272730/speed.gif",
    "https://media.discordapp.net/attachments/921595377923268708/1000018437130702879/caption.gif",
    //302 Test
    "https://random.imagecdn.app/224/224",
    "https://picsum.photos/224",
    //Self Test
    "TEST_URL",

];
const fileTest = {}
fileTest["pics/sexy.png"] = "https://nsfw-demo.sashido.io/sexy.png";
fileTest ["pics/drawing.png"] = "https://nsfw-demo.sashido.io/drawing.png";
fileTest["pics/neutral.png"] = "https://nsfw-demo.sashido.io/neutral.png";
console.log("Test mode");
Fs.mkdirSync(Path.resolve(__dirname, 'pics'), {recursive: true})

function exit() {
    if (ignoreError) return;
    process.exit(1)
}

function printMemoryUsage() {
    const endMemoryUsage = process.memoryUsage();
    console.log("Memory Usage Delta:");
    console.log("rss: " + (endMemoryUsage.rss - startMemoryUsage.rss) / 1024 / 1024 + "MB");
    console.log("heapTotal: " + (endMemoryUsage.heapTotal - startMemoryUsage.heapTotal) / 1024 / 1024 + "MB");
    console.log("heapUsed: " + (endMemoryUsage.heapUsed - startMemoryUsage.heapUsed) / 1024 / 1024 + "MB");
    console.log("external: " + (endMemoryUsage.external - startMemoryUsage.external) / 1024 / 1024 + "MB");
    console.log("arrayBuffers: " + (endMemoryUsage.arrayBuffers - startMemoryUsage.arrayBuffers) / 1024 / 1024 + "MB");
    console.log("Memory Usage Current:");
    console.log("rss: " + endMemoryUsage.rss / 1024 / 1024 + "MB");
    console.log("heapTotal: " + endMemoryUsage.heapTotal / 1024 / 1024 + "MB");
    console.log("heapUsed: " + endMemoryUsage.heapUsed / 1024 / 1024 + "MB");
    console.log("external: " + endMemoryUsage.external / 1024 / 1024 + "MB");
    console.log("arrayBuffers: " + endMemoryUsage.arrayBuffers / 1024 / 1024 + "MB");
    startMemoryUsage = endMemoryUsage;
}

async function downloadFile(fileUrl, outputLocationPath) {
    console.log("Downloading: " + fileUrl + ", to: " + outputLocationPath)
    const path = Path.resolve(__dirname, outputLocationPath)

    const writer = Fs.createWriteStream(path)

    const response = await axios.get(
        fileUrl,
        {
            responseType: 'stream'
        }
    )

    response.data.pipe(writer)

    return new Promise((resolve, reject) => {
        writer.on('finish', resolve)
        writer.on('error', reject)
    })

}

const isCI = require('is-ci')
async function test5() {
    console.log("Test 5");
    /*
    try {
        for (let i = 0; i < 10; i++) {//cache in action
            for (let file in fileTest) {
                try {
                    await downloadFile(fileTest[file], file)
                    console.log("\n\n");
                    const buf = Buffer.from(fs.readFileSync(Path.resolve(__dirname, file), "binary"), "binary");
                    const options = {
                        url: host + "/api/v2/classification",
                        method: 'post',
                        headers: {'content-type': 'application/octet-stream'},
                        data: buf
                    };
                    const sha256 = crypto.createHash('sha256');
                    sha256.update(buf);
                    const digest = sha256.digest();
                    const response = await axios(options);//help axios don't want to receive post data response
                    try {
                        console.log(response.status)
                        console.log(response.headers)
                        console.log(response.data)
                    } catch (e) {
                    }
                    options.url += "/hash";
                    options.data = digest;
                    const hashRes = await axios(options);
                    if (hashRes.status !== 200) {
                        throw new Error("Uncached: " + file)
                    }
                    const hex = digest.toString('hex');
                    options.url += "/" + hex;
                    options.method = 'get';
                    const hashRes2 = await axios(options);
                    if (hashRes2.status !== 200) {
                        throw new Error("Uncached: " + options.hex)
                    }

                } catch (error) {
                    console.error(error);
                    exit();
                }
            }
        }
    } catch (error) {
        console.error(error);
        exit();
    }

     */
    console.log("Major Success");
    test6();
    printMemoryUsage();

}

//stress test
async function test6() {
    console.log("Test 6");
    if (isCI) process.exit(0);//Download Image Error for "https://picsum.photos/224": Error: Client network socket disconnected before secure TLS connection was established
    try {
        const result = [];
        for (let i = 0; i < 1e3; i++) {
            axios.get(host + "/api/v2/classification/https://picsum.photos/224").then((res) => {
            }).catch((e) => {
                console.error(e);
                exit(1);
            });
            //if this is the last wait
            if (i === 1e4 - 1) {
                console.log("Last wait");
                const data = await axios.get(host + "/api/v2/classification/https://picsum.photos/224")
                console.log(data.data);
            }
        }
        printMemoryUsage();
    } catch (e) {
        console.error(e);
        exit(1);
    }
}

async function test4() {
    try {
        console.log("\n\n");
        console.log("Test 4");
        const response = await axios.get(host + '/api/v2/test');
        console.log(response.data);
        printMemoryUsage();
        test5();
    } catch (error) {
        console.error(error);
        exit();
    }
}

async function test3() {
    try {
        console.log("\n\n");
        console.log("Test 3");
        const response = await axios.get(host + '/api/v2/categories');
        const data = response.data;
        console.log("```js");
        console.log(data);
        console.log("```");
        printMemoryUsage();
        test4();
    } catch (error) {
        console.error(error);
        exit();
    }
}

async function test2() {
    console.log("\n\n");
    console.log("Test 2");

    for (const url of scanList) {
        console.log("Trying:", url);
        for (let i = 0; i < 10; i++) {
            console.log("Iteration: " + i);
            //http
            try {
                const response = await axios.get(host + '/api/v2/classification/' + url);
                const data = response.data;
                console.log("```js");
                console.log("Source: " + url);
                //check if data is arrayed
                if (Array.isArray(data.data)) {
                    console.log("Returned " + data.data.length + " frames");
                    delete data.data;
                }
                console.log(data);
                console.log("```");
                console.log(data.model.url);
            } catch (error) {
                console.error(error);
                break;
            }
            //cache in action
            try {
                const response = await axios.get(host + '/api/v2/classification/' + url);
                const data = response.data;
                delete data.data;
                console.log(data);
            } catch (error) {
                console.error(error);
            }
        }
    }
    printMemoryUsage();
    test3();
}

async function test1() {
    try {
        console.log("\n\n");
        console.log("Test 1");
        const response = await axios.get(host + '/api/v2/classification/https://cdn.discordapp.com/attachments/997389718163566652/1000542968052207708/unknown');
        console.error("Should fail but didn't");
        exit();
    } catch (error) {
        if (error.response.status === 403) {
            printMemoryUsage();
            test2();
        } else {
            console.log("Expected 403 got: " + error.response.status);
            console.error(error);
            exit();
        }

    }
}

async function prep() {
    await nsfwModel.init();
    console.log("Ready");
    process.env.TEST_MODE = true;
    process.env.ALLOW_ALL_HOST = true;
    const assad = require("../app.js");
    test1();
}

prep();
