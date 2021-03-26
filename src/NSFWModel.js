// you can use any other http client
const axios = require( "axios");
const tf =  require( "@tensorflow/tfjs-node");
const nsfw = require( "nsfwjs");

tf.enableProdMode(); // enable on production

let model


module.exports = {
    init: async function(){
        const model_url = process.env.NSFW_MODEL_URL | "https://ml.files-sashido.cloud/models/nsfw_mobilenet_v2/93/";
        const shape_size =  process.env.NSFW_MODEL_SHAPE_SIZE | "224";

        // Load the model in the memory only once!
        if (!model) {
            try {
                //model_url, { size: parseInt(shape_size) }
                if(!model_url || !shape_size)
                    model = await nsfw.load()
                else {
                    model = await nsfw.load(model_url, {size: parseInt(shape_size)});
                    console.info("Loaded: " + model_url + ":" + shape_size)
                }
                console.info("The NSFW Model was loaded successfully!");
            } catch (err) {
                console.error(err);
            }
        }
    },
    classify: async function (url) {
        let pic;
        let result = {};


        try {
            pic = await axios.get(url, {
                responseType: "arraybuffer",
            });
        } catch (err) {
            console.error("Download Image Error:", err);
            result.error = err;
            return result;
        }

        try {
            // Image must be in tf.tensor3d format
            // you can convert image to tf.tensor3d with tf.node.decodeImage(Uint8Array,channels)
            const image = await tf.node.decodeImage(pic.data, 3);
            let prediction
            if(url.toString().endsWith(".gif")){
                prediction = await model.classifyGif(image)
            }else {
                prediction = await model.classify(image);
            }

            image.dispose(); // Tensor memory must be managed explicitly (it is not sufficient to let a tf.Tensor go out of scope for its memory to be released).

            result = prediction;
        } catch (err) {
            console.error("Prediction Error: ", err);
            result.error = "Model is not loaded yet!";
            return result;
        }

        return result;
    }
}



