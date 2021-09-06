console.log("Test mode");

const nsfwModel = require("./src/NSFWModel");
const axios = require('axios');
const fs = require('fs');
const crypto = require('crypto');
const scanList = [
    "https://cdn.discordapp.com/attachments/840041811384860708/870977097651331072/IMG_20210731_144040.jpg",
    "https://github.com/o7-Fire/General/raw/master/AI/Logo/Accomplish-o7.png",
    "https://media.discordapp.net/attachments/840041811384860708/869557735585362001/cancer-memri.gif"
];
const fileTest = {}
fileTest["pics/sexy.png"] = "https://nsfw-demo.sashido.io/api/image/classify?url=https://nsfw-demo.sashido.io/sexy.png";
fileTest ["pics/drawing.png"] = "https://nsfw-demo.sashido.io/api/image/classify?url=https://nsfw-demo.sashido.io/drawing.png";
fileTest["pics/neutral.png"] = "https://nsfw-demo.sashido.io/api/image/classify?url=https://nsfw-demo.sashido.io/neutral.png";
console.log("Test mode");

fs.mkdirSync("pics/", { recursive: true });
async function downloadFile(fileUrl, outputLocationPath) {
    console.log("Downloading: " + fileUrl + ", to: " + outputLocationPath)
    const response = await axios.get(fileUrl, {responseType: "stream"})
    response.data.pipe(fs.createWriteStream(outputLocationPath));
}

async function test5() {
    console.log("Test 5");
    
    for (let file in fileTest) {
        try {
            await downloadFile(fileTest[file], file)
            console.log("\n\n");
            fs.readdirSync(__dirname).forEach(file => {console.log(file);});
            console.log("\n")
            fs.readdirSync(__dirname+"/pics").forEach(file => {console.log(file);});

            const buf = Buffer.from(fs.readFileSync(__dirname + "/" + file, "binary"), "binary");
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
            options.url += "/hash";
            options.data = digest;
            await axios(options);
        } catch (error) {
            console.error(error);
            process.exit(1);
        }
    }

    process.exit(0);
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
        process.exit(1);
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
        process.exit(1);
    }
}

async function test2() {
    console.log("\n\n");
    console.log("Test 2");
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
            process.exit(1);
        }
        //cache in action
        try {
            const response = await axios.get('http://localhost:5656/api/json/graphical/classification/' + url);
            const data = response.data;
            console.log(data.model.url);
        } catch (error) {
            console.error(error);
            process.exit(1);
        }
    }
    test3();
}

async function test1() {
    try {
        console.log("\n\n");
        console.log("Test 1");
        const response = await axios.get('http://localhost:5656/api/json/graphical/classification/https://media.discordapp.net/attachments/840041811384860709/870629782772150322/TraptrixArchetype.png');
        const data = response.data;
        console.log("```js");
        console.log(data);
        console.log("```");
        console.log(data.model);
        test2();
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
}

async function prep() {
    await nsfwModel.init();
    const assad = require("./index.js");
    test1();
}

prep();
