const Utils = require('../models/models_utils');
require("dotenv").config({
    path: __dirname + "/.env" + (process.env.NODE_ENV ? "." + process.env.NODE_ENV : "")
});
module.exports = {
    testImageUrls: [
        "https://cdn.discordapp.com/attachments/997389718163566652/1000542968052207708/unknown.png",
        "https://github.com/o7-Fire/General/raw/master/AI/Logo/Accomplish-o7.png",
        "https://picsum.photos/224",
        "https://upload.wikimedia.org/wikipedia/commons/3/3e/Exploding_Wikipedia-logo.gif",
        Utils.TEST_URL
    ],
    TEST_URL: Utils.TEST_URL,
}
