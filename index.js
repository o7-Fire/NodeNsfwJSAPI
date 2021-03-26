// server.js
// where your node app starts

// we've started you off with Express (https://expressjs.com/)
// but feel free to use whatever libraries or frameworks you'd like through `package.json`.
const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const nsfwModel = require("./src/NSFWModel");

nsfwModel.init()
// make all the files in 'public' available
app.use(express.static("public"));
app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded

app.get("/", (request, response) => {
    response.sendFile(__dirname + "/views/index.html");
});
let cache = []
let discordVideo = [".gif", ".mp4"]
async function classify(url, req, res) {
    try {
        if (!cache[url]) {
            cache[url] = await nsfwModel.classify(url)
        }
        res.json(cache[url])
    } catch (err) {
        res.status(500)
        res.send("wtf")
        console.log(err)
    }
}

app.get("/api/json/graphical/classification/discord/*", (async (req, res) => {
    let url = req.url.replace("/api/json/graphical/classification/discord/", "")
    console.log(req.url + ":" + url)
    if(!url)return
    for (const ext in discordVideo) {
        if(url.endsWith(ext)){
            url = url + "?format=png"
            break
        }
    }
    await classify(url, req, res)
}))

app.get("/api/json/graphical/classification/*", (async (req, res) => {
    let url = req.url.replace("/api/json/graphical/classification/", "")
    console.log(req.url + ":" + url)
    if(!url)return
    await classify(url, req, res)
}))




app.post("/api/*", (request, response) => {
    console.dir(request.body);
    response.writeHead(200, { "Content-Type": "text/html" });
    response.end("404");
});
// listen for requests :)
const listener = app.listen(process.env.PORT || 5656, () => {
    console.log("Your app is listening on port " + listener.address().port);
});
