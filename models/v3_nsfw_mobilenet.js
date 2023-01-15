const {decodeImage} = require("@tensorflow/tfjs-node/dist/image");
let NSFW_MODEL_URL = process.env.NSFW_MODEL_URL || "https://d1zv2aa70wpiur.cloudfront.net/tfjs_quant_nsfw_mobilenet/";
let NSFW_MODEL_SHAPE_SIZE = process.env.NSFW_MODEL_SHAPE_SIZE || 224;
const tf = require("@tensorflow/tfjs-node");
const {NSFW_CLASSES, NSFW_CLASSES_EXTENDED, interpolateClasses, standardizeData} = require('./nsfw_classes')
const ModelUtils = require("./models_utils");

tf.enableProdMode();
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
    if (!!mobilenet.model) {
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
    if (mobilenet.model == null) {
        await load();
    }
    if (typeof img === 'string' || img instanceof String) {
        img = await ModelUtils.decodeImage(img);
    }
    const logits = infer(img);

    const classes = await getTopKClasses(logits, topk);

    logits.dispose();

    return classes;
}

//return 2d array of predictions
//[ {"label": 0.5, "label2": 0.3}, {"label": 0.5, "label2": 0.3} ]
//the first array is the frame, the second is the label

/**
 * I think this is more consistent
 * [
 *   {
 *     "result": 0.99506014585495,
 *     "label": "Neutral"
 *   },
 *   {
 *     "result": 0.004820775706321001,
 *     "label": "Drawing"
 *   },
 *   {
 *     "result": 0.00010097925405716524,
 *     "label": "Hentai"
 *   },
 *   {
 *     "result": 0.000016720894564059563,
 *     "label": "Porn"
 *   },
 *   {
 *     "result": 0.000001418997953805956,
 *     "label": "Sexy"
 *   }
 * ]
 * @param logits
 * @param topK
 * @returns {Promise<*>}
 */
async function getTopKClasses(logits, topK) {
    const values = await logits.array();
    const labeled = values.map((results, i) => {
        const valuesAndLabels = [];
        for (let j = 0; j < results.length; j++) {
            valuesAndLabels.push({
                value: results[j],
                label: NSFW_CLASSES[j],
            });
        }
        valuesAndLabels.sort((a, b) => {
            return b.value - a.value;
        });
        valuesAndLabels.push(interpolateClasses(valuesAndLabels[0], valuesAndLabels[1]));
        valuesAndLabels.sort((a, b) => {
            return b.value - a.value;
        });
        return valuesAndLabels.slice(0, topK);
    });
    return standardizeData(labeled);
}

module.exports = {
    load,
    classify
}