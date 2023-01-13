const {decodeImage} = require("@tensorflow/tfjs-node/dist/image");
let NSFW_MODEL_URL = process.env.NSFW_MODEL_URL || "https://d1zv2aa70wpiur.cloudfront.net/tfjs_quant_nsfw_mobilenet/";
let NSFW_MODEL_SHAPE_SIZE = process.env.NSFW_MODEL_SHAPE_SIZE || 224;
const tf = require("@tensorflow/tfjs-node");
console.log("Please ignore that message");
const {NSFW_CLASSES} = require('./nsfw_classes')
const mobilenet = {
    model: undefined,
    endpoints: [],
    normalizationOffset: tf.scalar(255),
    intermediateModels: {},
    loading: false,
    classify
}

if (typeof NSFW_MODEL_URL === "string" && NSFW_MODEL_URL.endsWith("/")) {
    NSFW_MODEL_URL = `${NSFW_MODEL_URL}model.json`;
}

async function load() {
    //check if model is already loaded
    while (mobilenet.loading) {
        //wait
        await new Promise(resolve => setTimeout(resolve, 100));
    }
    if (mobilenet.model != null) {
        return mobilenet;
    }
    mobilenet.loading = true;
    try {
        if (process.env.NSFW_MODEL_GRAPH) {
            mobilenet.model = await tf.loadGraphModel(NSFW_MODEL_URL);
        } else {
            // this is a Layers Model
            const res = await fetch(NSFW_MODEL_URL);
            mobilenet.model = await tf.loadLayersModel(NSFW_MODEL_URL);
            mobilenet.endpoints = mobilenet.model.layers.map((l) => l.name);
        }
        mobilenet.loading = false;
    } catch (e) {
        console.error(e);
        mobilenet.loading = false;
        throw e;
    }
    // Warmup the model.
    const result = tf.tidy(() =>
        mobilenet.model.predict(tf.zeros([1, NSFW_MODEL_SHAPE_SIZE, NSFW_MODEL_SHAPE_SIZE, 3]))
    );
    await result.data();
    result.dispose();
    return mobilenet;
}

function infer(img, endpoint) {
    if (endpoint != null && mobilenet.endpoints.indexOf(endpoint) === -1) {
        throw new Error(
            `Unknown endpoint ${endpoint}. Available endpoints: ` +
            `${mobilenet.endpoints}.`
        );
    }

    return tf.tidy(() => {
        if (!(img instanceof tf.Tensor)) {

            //check if is instance of Uint8Array
            if (img instanceof Uint8Array) {
                img = decodeImage(img);
            } else {
                throw new Error("img is not a Tensor or Uint8Array");
            }
        }

        // Normalize the image from [0, 255] to [0, 1].
        const normalized = img
            .toFloat()
            .div(mobilenet.normalizationOffset);

        // Resize the image to
        let resized = normalized;
        const size = NSFW_MODEL_SHAPE_SIZE;
        // check width and height if resize needed
        if (img.shape[0] !== size || img.shape[1] !== size) {
            const alignCorners = true;
            resized = tf.image.resizeBilinear(
                normalized,
                [size, size],
                alignCorners
            );
        }

        // If its 3D Tensor, expand to 4D.
        const batched = resized.shape.length === 3 ? resized.reshape([1, size, size, 3]) : resized;

        let model;
        if (endpoint == null) {
            model = mobilenet.model;
        } else {
            if (
                mobilenet.model.hasOwnProperty("layers") &&
                mobilenet.intermediateModels[endpoint] == null
            ) {
                // @ts-ignore
                const layer = mobilenet.model.layers.find((l) => l.name === endpoint);
                mobilenet.intermediateModels[endpoint] = tf.model({
                    // @ts-ignore
                    inputs: mobilenet.model.inputs,
                    outputs: layer.output,
                });
            }
            model = mobilenet.intermediateModels[endpoint];
        }

        // return logits
        return model.predict(batched);
    });
}

async function classify(img, topk = 5) {
    const logits = infer(img);

    const classes = await getTopKClasses(logits, topk);

    logits.dispose();

    return classes;
}

async function classifyGif(gif, config = {topk: 5}) {
    let frameData = [];

    if (Buffer.isBuffer(gif)) {
        frameData = await gifFrames({url: gif, frames: 'all', outputType: 'jpg'});
    } else {
        frameData = await gifFrames({url: gif.src, frames: 'all', outputType: 'canvas'});
    }

    let acceptedFrames = [];
    if (typeof config.fps !== 'number') {
        acceptedFrames = frameData.map((_element, index) => index);
    } else {
        let totalTimeInMs = 0;
        for (let i = 0; i < frameData.length; i++) {
            totalTimeInMs = totalTimeInMs + (frameData[i].frameInfo.delay * 10);
        }

        const totalFrames = Math.floor(totalTimeInMs / 1000 * config.fps);
        if (totalFrames <= 1) {
            acceptedFrames = [Math.floor(frameData.length / 2)];
        } else if (totalFrames >= frameData.length) {
            acceptedFrames = frameData.map((_element, index) => index);
        } else {
            const interval = Math.floor(frameData.length / (totalFrames + 1));
            for (let i = 1; i <= totalFrames; i++) {
                acceptedFrames.push(i * interval);
            }
        }
    }

    const arrayOfPredictions = []
    for (let i = 0; i < acceptedFrames.length; i++) {
        const image = frameData[acceptedFrames[i]].getImage()
        const predictions = await classify(image, config.topk);

        if (typeof config.onFrame === 'function') {
            config.onFrame({
                index: acceptedFrames[i],
                totalFrames: frameData.length,
                predictions,
                image
            });
        }

        arrayOfPredictions.push(predictions);
    }

    return arrayOfPredictions;
}

async function getTopKClasses(logits, topK) {
    const values = await logits.data();

    const valuesAndIndices = [];
    for (let i = 0; i < values.length; i++) {
        valuesAndIndices.push({value: values[i], index: i});
    }
    valuesAndIndices.sort((a, b) => {
        return b.value - a.value;
    });
    const topkValues = new Float32Array(topK);
    const topkIndices = new Int32Array(topK);
    for (let i = 0; i < topK; i++) {
        topkValues[i] = valuesAndIndices[i].value;
        topkIndices[i] = valuesAndIndices[i].index;
    }

    const topClassesAndProbs = [];
    for (let i = 0; i < topkIndices.length; i++) {
        topClassesAndProbs.push({
            className: NSFW_CLASSES[topkIndices[i]],
            probability: topkValues[i],
        });
    }
    return topClassesAndProbs;
}

module.exports = {
    load,
    classify
}