console.log("Test mode");

const nsfwModel = require("./src/NSFWModel");
const axios = require('axios');
const fs = require('fs');
const crypto = require('crypto');
const Path = require("path");
const Fs = require("fs");
const ignoreError = process.env.IGNORE_ERROR
const scanList = [
    "https://cdn.discordapp.com/attachments/997389718163566652/1000542968052207708/unknown.png",
    "https://github.com/o7-Fire/General/raw/master/AI/Logo/Accomplish-o7.png",
    "https://cdn.discordapp.com/attachments/921595377923268708/1000552203708272730/speed.gif"
];
const fileTest = {}
fileTest["pics/sexy.png"] = "https://nsfw-demo.sashido.io/sexy.png";
fileTest ["pics/drawing.png"] = "https://nsfw-demo.sashido.io/drawing.png";
fileTest["pics/neutral.png"] = "https://nsfw-demo.sashido.io/neutral.png";
console.log("Test mode");
Fs.mkdirSync(Path.resolve(__dirname, 'pics'), {recursive: true})

function exit(){
    if(ignoreError)return;
    process.exit(1)
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

async function test5() {
    console.log("Test 5");
    for (let i = 0; i < 10; i++) {//cache in action
        console.log("Major Success");
        process.exit(0);
    }
    for (let file in fileTest) {
        try {
            await downloadFile(fileTest[file], file)
            console.log("\n\n");
            const buf = Buffer.from(fs.readFileSync(Path.resolve(__dirname, file), "binary"), "binary");
            const options = {
                url: "http://localhost:5656/api/json/graphical/classification",
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

async function test4() {
    try {
        console.log("\n\n");
        console.log("Test 4");
        const response = await axios.get('http://localhost:5656/api/json/test');
        console.log(response.data);
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
        const response = await axios.get('http://localhost:5656/api/json/graphical');
        const data = response.data;
        console.log("```js");
        console.log(data);
        console.log("```");
        test4();
    } catch (error) {
        console.error(error);
        exit();
    }
}

async function test2() {
    console.log("\n\n");
    console.log("Test 2");
    for (let i = 0; i < 10; i++) {
        console.log("Iteration: " + i);
        for (const url of scanList) {
            //http
            try {

                const response = await axios.get('http://localhost:5656/api/json/graphical/classification/' + url);
                const data = response.data;
                console.log("```js");
                console.log("Source: " + url);
                console.log(data);
                console.log("```");
                console.log(data.model.url);
            } catch (error) {
                console.error(error);
                exit();
            }
            //cache in action
            try {
                const response = await axios.get('http://localhost:5656/api/json/graphical/classification/' + url);
                const data = response.data;
                console.log(data.model.url);
            } catch (error) {
                console.error(error);
                exit();
            }
        }
    }

    test3();
}

async function test1() {
    try {
        console.log("\n\n");
        console.log("Test 1");
        const response = await axios.get('http://localhost:5656/api/json/graphical/classification/https://cdn.discordapp.com/attachments/997389718163566652/1000542968052207708/unknown');
        console.error("Should fail but didn't");
        exit();
    } catch (error) {
        if (error.response.status === 403) {
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
    const assad = require("./index.js");
    test1();
}

prep();
