// server.js
// where your node app starts

// we've started you off with Express (https://expressjs.com/)
// but feel free to use whatever libraries or frameworks you'd like through `package.json`.

const startTime = Date.now();

require("dotenv").config({
    path: __dirname + "/.env" + (process.env.NODE_ENV ? "." + process.env.NODE_ENV : "")
});
process.env.TEST_MODE = (process.env.NODE_ENV === "test") + "";
console.info("Starting server in " + process.env.NODE_ENV + " mode");

const express = require("express");
const swaggerUi = require('swagger-ui-express');
const cors = require("cors");
const compression = require("compression");
const cookieParser = require("cookie-parser");
const morgan = require("morgan");
const helmet = require("helmet")
const path = require("path");
const fs = require('fs');

const app = express();
const cache = require('./config/cache');
const nsfwModel = require("./models/NSFWModel");

nsfwModel.init().then(() => {
    console.log("Model loaded in", Date.now() - startTime, "ms");
});


//what is this
app.head("/", (request, response) => {
    response.status(200);
});

app.use(function (req, res, next) {
    if (!process.env.NODE_NSFW_KEY) {
        next();
    } else if (!req.headers.authorization && !!process.env.NODE_NSFW_KEY) {
        console.log("No auth");
        return res.status(403).json({
            error: "No Authorization Provided"
        });
    } else if (req.headers.authorization !== process.env.NODE_NSFW_KEY) {
        console.log("invalid auth");
        return res.status(451).json({
            error: "Invalid Authorization"
        });
    } else {
        next();
    }
});

app.use(helmet());
app.use(compression());
app.disable("x-powered-by");
app.use(express.urlencoded({extended: true}));
app.use(express.json());
app.use(express.raw());


/* Start Logging */
const log_path = process.env.LOG_PATH || path.join(__dirname, "logs");

// if log path not exist, log_path folder will be created
if (!fs.existsSync(log_path)) {
    fs.mkdirSync(log_path, {recursive: true});
}

// Log all error requests status
app.use(
    morgan("combined", {
        skip: (req, res) => {
            return res.statusCode < 400;
        },
        stream: fs.createWriteStream(path.join(log_path, "error.log"), {
            flags: "a",
        }),
    })
);

// Log all success request status
app.use(
    morgan("combined", {
        skip: (req, res) => {
            return res.statusCode > 400;
        },
        stream: fs.createWriteStream(path.join(log_path, "access.log"), {
            flags: "a",
        }),
    })
);
/* End Logging */

/* Dynamic CORS */
app.use(
    cors({
        origin: "*",
    })
);
/* End Dynamic CORS */

/* Start Cookie Settings */
app.use(cookieParser());
/* End Cookie Settings */

/* Start of Routing Modules */
const v3_router = require("./routes/v3_route");
v3_router(app);

/* End of Routing Modules */


const apiVersion = process.env.API_VERSION || "v3";
const testURL = "/api/" + apiVersion + "/health";
const indexHtml = fs.readFileSync(process.cwd() + "/views/index.html").toString().replace("API_VERSIONING", apiVersion).replace("TEST_URL", testURL);
app.get("/", (request, response) => {
    response.send(indexHtml);
});

const docsFolder = process.cwd() + "/docs/";
let docs = require(docsFolder + 'docs.json');

app.use("/docs", swaggerUi.serve, swaggerUi.setup(docs, {
    explorer: true,
}));
app.get("*", function (req, res) {
    res.status(404);

    // respond with json
    if (req.accepts("json")) {
        res.json({
            status: "ERROR",
            error_code: "404",
            message: "Not found",
        });
        return;
    }

    // default to plain-text. send()
    res.type("txt").send("Not found");
});



module.exports = {
    app,
    apiVersion,
    testURL,
}
