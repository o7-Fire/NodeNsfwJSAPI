const assad = require("./index.js");
const https = require('https')

async function test1(){
  const options = {
  hostname: 'localhost',
  port: 80,
  path: '/api/json/graphical/classification/https://media.discordapp.net/attachments/840041811384860709/870629782772150322/TraptrixArchetype.png',
  method: 'GET'
}
  const req = https.request(options, res => {
  console.log(`statusCode: ${res.statusCode}`)

  res.on('data', d => {
    process.stdout.write(d)
    process.exit(0);
  })
})

req.on('error', error => {
  console.error(error);
  process.exit(1);
})

req.end()
}


test1();

