const assad = require("./index.js");
const axios = require('axios');

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
    try {
        console.log("\n\n");
        console.log("Test 2");
        const response = await axios.get('http://localhost:5656/api/json/graphical/classification/https://github.com/o7-Fire/General/raw/master/AI/Logo/Accomplish-o7.png');
        const data = response.data;
        console.log("```js");
        console.log(data);
        console.log("```");
        console.log(data.model);
        test3();
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
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

test1();
