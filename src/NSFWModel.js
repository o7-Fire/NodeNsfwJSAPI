// you can use any other http client

const axios = require("axios");
const tf = require("@tensorflow/tfjs-node");
const nsfw = require("nsfwjs");
const jpeg = require("jpeg-js");

tf.enableProdMode(); // enable on production

let model;
let currentModel = {
    url: "Default",
    size: "Default"
};
const supportGIF = process.env.SUPPORT_GIF_CLASSIFICATION
if (supportGIF)
    console.log("SUPPORT_GIF_CLASSIFICATION")
//Using n1 do 1 - (n1 - n2)
//basically a matrix
const report = {
    Drawing: {
        Hentai: "Anime",
        Sexy: "ArtificialProvocative",
        Neutral: "DigitalDrawing"
    },
    Neutral: {
        Drawing: "Digital",
        Sexy: {n1: "NaturallyProvocative"},
        Porn: {n1: "Disturbing"},
        Hentai: {n1: "SeductiveArt"}
    },
    Sexy: {
        Neutral: "SexuallyProvocative",
        Porn: "SeductivePorn"
    },
    Porn: {
        Sexy: {n1: "PornSeductive"},
        Hentai: {n1: "HentaiClips"},
        Neutral: {n1: "SoftPorn"}
    },
    Hentai: {
        Porn: "Doujin18",
        Drawing: {n1: "R34"}
    }
};
//what this
const convert = async img => {
    // Decoded image in UInt8 Byte array
    const image = await jpeg.decode(img, true);

    const numChannels = 3;
    const numPixels = image.width * image.height;
    const values = new Int32Array(numPixels * numChannels);

    for (let i = 0; i < numPixels; i++)
        for (let c = 0; c < numChannels; ++c)
            values[i * numChannels + c] = image.data[i * 4 + c];

    return tf.tensor3d(values, [image.height, image.width, numChannels], "int32");
};

function assignReport(t1, t2, reportPrediction) {
    let v2;
    let c2;
    let v1;
    let c1;
    c1 = t1.className;
    v1 = t1.probability;
    c2 = t2.className;
    v2 = t2.probability;
    if (report[c1][c2]) {
        let c3 = report[c1][c2];
        if (c3.n1) {
            reportPrediction[c3.n1] = v1 - v2;
            reportPrediction[c3.n1] = 1 - reportPrediction[c3.n1];
        } else {
            reportPrediction[c3] = v1 - v2;
        }
    } else {
        console.log("Not implemented: " + t1.className + ":" + t2.className);
    }
    return reportPrediction;
}

async function classify(image) {
    const prediction = await model.classify(image);
    let reportPrediction = {};
    let t1 = prediction[0];
    let t2 = prediction[1];
    let t3 = prediction[2];
    let t4 = prediction[4];
    reportPrediction = assignReport(t1, t2, reportPrediction);
    for (const predictionKey1 in prediction) {
        let c1 = prediction[predictionKey1].className;
        reportPrediction[c1] = prediction[predictionKey1].probability;
    }
    return reportPrediction
}

async function classifyGif(gif) {
    const arrayPredict = []
    for (const gifElement of gif) {
        arrayPredict.push(await classify(gifElement))
    }
    return arrayPredict;
}
function getImageType(content) {
    // Classify the contents of a file based on starting bytes (aka magic number:
    // https://en.wikipedia.org/wiki/Magic_number_(programming)#Magic_numbers_in_files)
    // This aligns with TensorFlow Core code:
    // https://github.com/tensorflow/tensorflow/blob/4213d5c1bd921f8d5b7b2dc4bbf1eea78d0b5258/tensorflow/core/kernels/decode_image_op.cc#L44
    if (content.length > 3 && content[0] === 255 && content[1] === 216 &&
        content[2] === 255) {
        // JPEG byte chunk starts with `ff d8 ff`
        return ImageType.JPEG;
    } else if (
        content.length > 4 && content[0] === 71 && content[1] === 73 &&
        content[2] === 70 && content[3] === 56) {
        // GIF byte chunk starts with `47 49 46 38`
        return ImageType.GIF;
    } else if (
        content.length > 8 && content[0] === 137 && content[1] === 80 &&
        content[2] === 78 && content[3] === 71 && content[4] === 13 &&
        content[5] === 10 && content[6] === 26 && content[7] === 10) {
        // PNG byte chunk starts with `\211 P N G \r \n \032 \n (89 50 4E 47 0D 0A
        // 1A 0A)`
        return ImageType.PNG;
    } else if (content.length > 3 && content[0] === 66 && content[1] === 77) {
        // BMP byte chunk starts with `42 4d`
        return ImageType.BMP;
    } else {
        throw new Error(
            'Expected image (BMP, JPEG, PNG, or GIF), but got unsupported ' +
            'image type');
    }
}

module.exports = {
    report: report,
    init: async function () {
        const model_url = process.env.NSFW_MODEL_URL;
        const shape_size = process.env.NSFW_MODEL_SHAPE_SIZE;

        // Load the model in the memory only once!
        if (!model) {
            try {
                //model_url, { size: parseInt(shape_size) }
                if (!model_url || !shape_size) model = await nsfw.load();
                else {
                    model = {};
                    model = await nsfw.load(model_url, {size: parseInt(shape_size)});
                    currentModel.size = shape_size;
                    currentModel.url = model_url;
                    console.info("Loaded: " + model_url + ":" + shape_size);
                }
                console.info("The NSFW Model was loaded successfully!");
            } catch (err) {
                console.error(err);
            }
        }
    },
    digest: async function (data) {
        // Image must be in tf.tensor3d format
        // you can convert image to tf.tensor3d with tf.node.decodeImage(Uint8Array,channels)
        let reportPrediction = {};
        let image = {};
        image.dispose = function () {
        }

        const gif = getImageType(data) === ImageType.GIF
      //if gif return 4D else 3D
        image = await tf.node.decodeImage(data,3);

        if (gif) {
            if (!supportGIF) throw new Error("GIF not supported by server config")
            reportPrediction = await classifyGif(image);
        } else {
            reportPrediction = await classify(image);
        }


        image.dispose(); // Tensor memory must be managed explicitly (it is not sufficient to let a tf.Tensor go out of scope for its memory to be released).
        reportPrediction.model = currentModel;
        return reportPrediction;
    },
    classify: async function (url) {
        let pic;
        let result = {};
        try {
            pic = await axios.get(url, {
                responseType: "arraybuffer",
                maxContentLength: 15e7
            });
        } catch (err) {
            console.error("Download Image Error:", err);
            result.error = err;
            return result;
        }
        try {
            result = this.digest(pic.data);
        } catch (err) {
            console.error("Prediction Error: ", err);
            result.error = err.toString();
            return result;
        }

        return result;
    }
};
