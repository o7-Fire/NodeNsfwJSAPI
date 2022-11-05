// server.js
// where your node app starts

// we've started you off with Express (https://expressjs.com/)
// but feel free to use whatever libraries or frameworks you'd like through `package.json`.

const startTime = Date.now();
require("dotenv").config();

const express = require("express");
const cors = require("cors");
const compression = require("compression");
const helmet = require("helmet");
const cookieParser = require("cookie-parser");
const morgan = require("morgan");
const path = require("path");
let expressOasGenerator;
if (process.env.TEST_MODE) {
    console.log("TEST MODE");
    expressOasGenerator = require('express-oas-generator');
}
const app = express();
if (process.env.TEST_MODE) {
    const SPEC_OUTPUT_FILE_BEHAVIOR = {
        PRESERVE: 'PRESERVE',
        RECREATE: 'RECREATE'
    };
    expressOasGenerator.handleResponses(app, {
        specOutputPath: './docs/generated.json',
        alwaysServeDocs: true,
        writeIntervalMs: 100,
        specOutputFileBehavior: SPEC_OUTPUT_FILE_BEHAVIOR.RECREATE
    });
}
const fs = require('fs');
const http = require('http');
const https = require('https');
const swaggerUi = require('swagger-ui-express');

const cache = require('./config/cache');
const nsfwModel = require("./models/NSFWModel");

nsfwModel.init().then(() => {
    cache.clear();
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


const apiVersion = "v3";
const testURL = "/api/" + apiVersion + "/health";
const indexHtml = fs.readFileSync(process.cwd() + "/views/index.html").toString().replaceAll("API_VERSIONING", apiVersion).replaceAll("TEST_URL", testURL);
app.get("/", (request, response) => {
    response.send(indexHtml);
});

const docsFolder = process.cwd() + "/docs/";
let docs = require(docsFolder + 'generated.json');
const os = require("os");
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


//HTTP Server stuff here
if (process.env.TEST_MODE) {
    expressOasGenerator.handleRequests();
}

const httpPort = process.env.PORT || 5656;
const httpsPort = process.env.PORT_HTTPS || 5657;
try {
    const httpServer = http.createServer(app);
    httpServer.listen(httpPort, "0.0.0.0", back => {
        console.log("Http server listening on port : " + httpPort)
        console.log("http://localhost:" + httpPort)
        //print all local ip
        const interfaces = os.networkInterfaces();
        for (const name of Object.keys(interfaces)) {
            for (const net of interfaces[name]) {
                console.log("http://" + net.address + ":" + httpPort)
            }
        }
    });
    let certsFolder = process.env.CERT_PATH || process.cwd() + '/certsFiles/';
//end with /
    if (!certsFolder.endsWith('/')) {
        certsFolder = certsFolder + '/';
    }
    if (fs.existsSync(certsFolder)) {
        try {

            const credentials = {};
            const certFilesName = ['certificate.crt', 'fullchain.pem'];
            const keyFilesName = ['key.key', 'privkey.pem', 'private.key', 'privatekey.pem'];
            const caFilesName = ['ca.crt', 'chain.pem', 'chain.cert.pem'];
            for (const certFileName of certFilesName) {
                if (fs.existsSync(certsFolder + certFileName)) {
                    credentials.cert = fs.readFileSync(certsFolder + certFileName);
                    console.log('cert file found : ' + certsFolder + certFileName);
                    break;
                }
            }
            if (!credentials.cert) {
                console.error('cert file not found in : ' + certsFolder);
            }
            for (const keyFileName of keyFilesName) {
                if (fs.existsSync(certsFolder + keyFileName)) {
                    credentials.key = fs.readFileSync(certsFolder + keyFileName);
                    console.log('key file found : ' + certsFolder + keyFileName);
                    break;
                }
            }
            if (!credentials.key) {
                console.error('key file not found in : ' + certsFolder);
            }
            for (const caFileName of caFilesName) {
                if (fs.existsSync(certsFolder + caFileName)) {
                    credentials.ca = fs.readFileSync(certsFolder + caFileName);
                    console.log('ca file found : ' + certsFolder + caFileName);
                    break;
                }
            }
            if (!credentials.ca) {
                console.log('ca file not found in : ' + certsFolder);
            }
            const httpsServer = https.createServer(credentials, app);
            httpsServer.listen(httpsPort, () => {
                console.log("Https server listing on port : " + httpsPort)
                console.log("https://localhost:" + httpsPort)
            });
        } catch (e) {
            console.log("Can't start Https server");
            console.log(e);
        }
    } else {
        console.log("Can't start Https server, certs folder not found");
    }
} catch (e) {
    console.log("Can't start Http server");
    console.log(e);
    if (!process.env.TEST_MODE) {
        process.exit(1);
    }
}

module.exports = {
    app
}