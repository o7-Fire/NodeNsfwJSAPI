const assad = require("./index.js");
const axios = require('axios');

async function test4() {
    try {
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
        const response = await axios.get('http://localhost:5656/api/json/graphical');
        console.log(response.data);
        JSON.parse(response.data);
        test4();
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
}
async function test2() {
    try {
        const response = await axios.get('http://localhost:5656/api/json/graphical/classification/https://github.com/o7-Fire/General/raw/master/AI/Logo/Accomplish-o7.png');
        console.log(response.data);
        JSON.parse(response.data);
        test3();
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
}
async function test1() {
    try {
        const response = await axios.get('http://localhost:5656/api/json/graphical/classification/https://media.discordapp.net/attachments/840041811384860709/870629782772150322/TraptrixArchetype.png');
        console.log(response.data);
        JSON.parse(response.data);
        test2();
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
}

test1();
