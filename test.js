const nsfwModel = require("./src/NSFWModel");
const axios = require('axios');
const scanList = [
    "https://cdn.discordapp.com/attachments/840041811384860708/870977097651331072/IMG_20210731_144040.jpg",
    "https://github.com/o7-Fire/General/raw/master/AI/Logo/Accomplish-o7.png",
    "https://media.discordapp.net/attachments/840041811384860708/869557735585362001/cancer-memri.gif"
];
async function test4() {
    try {
        console.log("\n\n");
        console.log("Test 4");
        const response = await axios.get('http://localhost:5656/api/json/test');
        console.log(response.data);
        process.exit(0);
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

        } catch (error) {
            console.error(error);
            process.exit(1);
        }
        //cache in action
        try {
            const response = await axios.get('http://localhost:5656/api/json/graphical/classification/' + url);
            const data = response.data;
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
