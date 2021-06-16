// server.js
// where your node app starts

// we've started you off with Express (https://expressjs.com/)
// but feel free to use whatever libraries or frameworks you'd like through `package.json`.
const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const nsfwModel = require("./src/NSFWModel");

nsfwModel.init().then(() => {
  cache = [];
});
app.head("/", (request, response) => {
  response.status(200);
});
// make all the files in 'public' available
app.use(express.static("public"));
app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded
app.use(function(req, res, next) {
  if (!req.headers.authorization && process.env.SECRET) {
    console.log("no auth");
    return res.status(403).json({ error: "No credentials sent!" });
  } else if (req.headers.authorization !== process.env.SECRET) {
    console.log("invalid auth");
    return res.status(403).json({ error: "No credentials sent!!" });
  } else {
    next();
  }
});
app.get("/", (request, response) => {
  response.sendFile(__dirname + "/views/index.html");
});
let cache = [];
let discordVideo = [".gif", ".mp4", ".webm"];

async function classify(url, req, res) {
  console.log(req.url + ":" + url);
  const hash = url;

  try {
    if (!cache[hash]) {
      cache[hash] = await nsfwModel.classify(url);
    }
    res.json(cache[hash]);
  } catch (err) {
    res.status(500);
    res.send("wtf");
    console.log(err);
  }
}
app.get("/api/json/test", (req, res) => {
  res.json(req.headers);
});
app.get("/api/json/graphical", (req, res) => {
  if (!req.headers.authorization && process.env.SECRET) {
    console.log("no auth: " + req.url);
    return res.status(403).json({ error: "No credentials sent!" });
  } else if (req.headers.authorization !== process.env.SECRET) {
    console.log("invalid auth: " + req.url);
    return res.status(403).json({ error: "No credentials sent!!" });
  }
  res.json(nsfwModel.list);
});
app.get("/api/json/graphical/classification/*", async (req, res) => {
  if (!req.headers.authorization && process.env.SECRET) {
    console.log("no auth: " + req.url);
    return res.status(403).json({ error: "No credentials sent!" });
  } else if (req.headers.authorization !== process.env.SECRET) {
    console.log("invalid auth: " + req.url);
    return res.status(403).json({ error: "No credentials sent!!" });
  }

  let url = req.url.replace("/api/json/graphical/classification/", "");
  if (!url) return;
  let body = {};
  let allowed = true;
  body.error = "Not allowed";
  status = 405;

  if (!url.startsWith("https://cdn.discordapp.com/")) {
    if (url.endsWith(".png") || url.endsWith(".jpeg") || url.endsWith(".bmg") || url.endsWith(".jpg")) {
    } else {
      status = 415;
      body.error = "Only allow https://cdn.discordapp.com/ or picture";
      allowed = false;
    }
  } else {
    for (const discordVideoKey in discordVideo) {
      if (url.endsWith(discordVideo[discordVideoKey])) {
        allowed = false;
        if (url.startsWith("https://cdn.discordapp.com/")) {
          url = url + "?format=png";
          url = url.replace(
            "https://cdn.discordapp.com/",
            "https://media.discordapp.net/"
          );
          allowed = true
