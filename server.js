// server.js
// where your node app starts

// we've started you off with Express (https://expressjs.com/)
// but feel free to use whatever libraries or frameworks you'd like through `package.json`.
const express = require("express");
const app = express();
//import NSFWModel from "./src/NSFWModel.js";


app.get("/", (request, response) => {
  response.sendFile(__dirname + "/views/index.html");
});

app.get("/api/graphical/classification/*", ((req, res) => {
  let url = req.url.replace("/api/graphical/classification/", "")
  console.log(req.url)
  res.status(405)
  res.send("<a href='"+url+"'>"+url+"</a> 405" )
}))

app.get("/api/*", (request, response) =>{
  response.status(404)
  response.send("restful ? 404")
})

// listen for requests :)
const listener = app.listen(process.env.PORT || 8080, () => {
  console.log("Your app is listening on port " + listener.address().port);
});
