const axios = require('axios');
const TEST_URL = process.env.TEST_URL || "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b6/SIPI_Jelly_Beans_4.1.07.tiff/lossy-page1-256px-SIPI_Jelly_Beans_4.1.07.tiff.jpg";

function getImageType(content) {
    // Classify the contents of a file based on starting bytes (aka magic number:
    // https://en.wikipedia.org/wiki/Magic_number_(programming)#Magic_numbers_in_files)
    // This aligns with TensorFlow Core code:
    // https://github.com/tensorflow/tensorflow/blob/4213d5c1bd921f8d5b7b2dc4bbf1eea78d0b5258/tensorflow/core/kernels/decode_image_op.cc#L44
    //if not buffer or Uint8Array
    if (!(content instanceof Buffer) && !(content instanceof Uint8Array)) {
        throw new Error('Expected image buffer or Uint8Array, got ' + (typeof content));
    }
    if (content.length > 3 && content[0] === 255 && content[1] === 216 &&
        content[2] === 255) {
        // JPEG byte chunk starts with `ff d8 ff`
        return "JPEG";
    } else if (
        content.length > 4 && content[0] === 71 && content[1] === 73 &&
        content[2] === 70 && content[3] === 56) {
        // GIF byte chunk starts with `47 49 46 38`
        return "GIF";
    } else if (
        content.length > 8 && content[0] === 137 && content[1] === 80 &&
        content[2] === 78 && content[3] === 71 && content[4] === 13 &&
        content[5] === 10 && content[6] === 26 && content[7] === 10) {
        // PNG byte chunk starts with `\211 P N G \r \n \032 \n (89 50 4E 47 0D 0A
        // 1A 0A)`
        return "PNG";
    } else if (content.length > 3 && content[0] === 66 && content[1] === 77) {
        // BMP byte chunk starts with `42 4d`
        return "BMP";
    } else {
        throw new Error(
            'Expected image (BMP, JPEG, PNG, or GIF), but got unsupported ' +
            'image type');
    }
}


function hostsFilter() {
    const allowedHost = (process.env.ALLOWED_HOST || "cdn.discordapp.com;media.discordapp.net;github.com").split(";");
    const blockedHost = (process.env.BLOCKED_HOST || "localhost;127.0.0.1;::1").split(";");
    const allowedAll = !!process.env.ALLOW_ALL_HOST;
    return {
        allowedHost: allowedHost,
        blockedHost: blockedHost,
        allowedAll: allowedAll
    }
}

function hostAllowed(host) {
    const filter = hostsFilter();
    if (filter.blockedHost.includes(host)) {
        return false;
    }
    if (filter.allowedAll) {
        return true;
    }
    return filter.allowedHost.includes(host);
}

async function downloadImage(url) {
    let pic;
    let result = {};
    let redirectCounter = 0;
    while (true) {
        if (redirectCounter > 5) {
            return {error: "Too many redirects", status: 400};
        }
        try {
            const host = new URL(url).hostname;

            if (this.hostAllowed(host)) {
                pic = await axios.get(url, {
                    responseType: "arraybuffer",
                    maxContentLength: 15e7,
                    maxRedirects: 0,
                    validateStatus: function (status) {
                        return status >= 200 && status < 400; // default
                    }
                });
                //check if 3XX and location header
                if (pic.status >= 300 && pic.status < 400 && pic.headers.location) {
                    //check if start with http
                    if (pic.headers.location.startsWith("http")) {
                        url = pic.headers.location;
                        redirectCounter++;
                        continue;
                    } else {
                        url = new URL(url).origin + pic.headers.location;
                    }
                    redirectCounter++;

                } else {
                    break;
                }
            } else {
                throw {
                    message: "Host not allowed: " + host,
                    status: 403
                };
            }
        } catch (err) {
            result.message = "Download Image Error for \"" + url + "\": " + (err ? (err.message ? err.message + " " + err.status : err) : "Unknown Error");//most readable code in here
            console.error(result.message);
            result.status = err.response ? err.response.status : (err.status || 500);
            throw result;
        }
    }
    return pic.data;
}

module.exports = {getImageType, hostAllowed, downloadImage, hosts: hostsFilter(), TEST_URL};