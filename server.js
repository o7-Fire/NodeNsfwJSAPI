const {app} = require("./app.js");
const http = require("http");
const os = require("os");
const fs = require("fs");
const https = require("https");

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
