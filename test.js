const assad = require("./index.js");
const axios = require('axios');
async function test1() {
    try {
        const response = await axios.get('http://localhost:5656/api/json/graphical/classification/https://media.discordapp.net/attachments/840041811384860709/870629782772150322/TraptrixArchetype.png');
        console.log(response.data);
        JSON.parse(response.data);
        process.exit(0);
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
}


test1();
