// you can use any other http client
const axios = require("axios");
const tf = require("@tensorflow/tfjs-node");
const nsfw = require("nsfwjs");
const jpeg = require("jpeg-js");
tf.enableProdMode(); // enable on production

let model;
let currentModel = {
    url : "Default",
    size : "Default"
}
//Using n1 do 1 - (n1 - n2)
const report = {
    Drawing: {
        Hentai: "Anime",
        Sexy: "ArtificialProvocative",
        Neutral: "DigitalDrawing"
    },
    Neutral: {
        Drawing: "Digital" ,
        Sexy:  "NaturallyProvocative" ,
        Porn:  "Disturbing" ,
        Hentai:  "SeductiveArt"
    },
    Sexy: {
        Neutral: "SexuallyProvocative",
        Porn:  "SeductivePorn"
    },
    Porn: {
        Sexy: "PornSeductive",
        Hentai:  {n1: "HentaiClips"},
        Neutral: "SoftPorn"
    },
    Hentai: {
        Porn: "Doujin",
        Drawing: {n1: "R34"}
    }//try n1 or not
}; //Combining thing make new thing
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
    return reportPrediction
}
module.exports = {
    list: report,
    init: async function() {
        const model_url = process.env.NSFW_MODEL_URL;
        const shape_size = process.env.NSFW_MODEL_SHAPE_SIZE;

        // Load the model in the memory only once!
        if (!model) {
            try {
                //model_url, { size: parseInt(shape_size) }
                if (!model_url || !shape_size) model = await nsfw.load();
                else {
                    model = await nsfw.load(model_url, { size: parseInt(shape_size) });
                    currentModel.size = shape_size
                    currentModel.url = model_url
                    console.info("Loaded: " + model_url + ":" + shape_size);
                }
                console.info("The NSFW Model was loaded successfully!");
            } catch (err) {
                console.error(err);
            }
        }
    },
    classify: async function(url) {
        let pic;
        let result = {};

        try {
            pic = await axios.get(url, {
                responseType: "arraybuffer"
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
            let prediction;
            if (url.toString().endsWith(".gif")) {
                prediction = await model.classifyGif(image);
            } else {
                prediction = await model.classify(image);
            }
            let reportPrediction = {};
            let t1 = prediction[0];
            let t2 = prediction[1];
            let t3 = prediction[2];
            let t4 = prediction[4];
            reportPrediction = assignReport(t1, t2, reportPrediction);
            //reportPrediction = assignReport(t3, t4, reportPrediction);
            image.dispose(); // Tensor memory must be managed explicitly (it is not sufficient to let a tf.Tensor go out of scope for its memory to be released).
            for (const predictionKey1 in prediction) {
                let c1 = prediction[predictionKey1].className;
                reportPrediction[c1] = prediction[predictionKey1].probability;
            }
            /*
                  for (const predictionKey1 in prediction) {
                      let c1 = prediction[predictionKey1].className;
                      let v1 = prediction[predictionKey1].probability;
                      for (const predictionKey2 in prediction) {

                          let c2 = prediction[predictionKey2].className;
                          let v2 = prediction[predictionKey2].probability;
                          c1 = t1.className
                          v1 = t1.probability
                          c2 = t2.className
                          v2 = t2.probability
                          let c3 = report[c1][c2];
                          if (!c3) continue;
                          if(c3.n1) {
                              reportPrediction[c3.n1] = v1 - v2;
                              reportPrediction[c3.n1] = 1 - reportPrediction[c3.n1]
                          }else {
                              reportPrediction[c3] =  v1 - v2;
                          }
                      }
                  }

                   */
            reportPrediction["Goodluck Figuring out this data"] = 0;
            //reportPrediction["ModelURL "+  currentModel.name] = 0
            //reportPrediction["ModelSize "+  currentModel.size] = 0
            reportPrediction.model = currentModel
            result = reportPrediction;
        } catch (err) {
            console.error("Prediction Error: ", err);
            result.error = "Model is not loaded yet!";
            return result;
        }

        return result;
    }
};
