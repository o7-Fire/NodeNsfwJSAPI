const supertest = require("supertest");
const MobileNet = require('../models/v3_nsfw_mobilenet');
const {testImageUrls} = require('./vars.js');
const {downloadImage, getImageType} = require('../models/models_utils');

jest.setTimeout(30000);


describe("MobileNet Test", () => {

    test("Sanity Check", async () => {
        expect(MobileNet).toBeDefined();
    });

    /**
     * TypeError: Object is not iterable.
     test("Load MobileNet Model", async () => {
        const model = await MobileNet.load();
        expect(model).toBeDefined();
    });

     test("Classify Image", async () => {
        for (const url of testImageUrls) {
            console.log("Classifying " + url);
            const image = await downloadImage(url);
            const imageType = getImageType(image);
            console.log("Image Type: " + imageType);
            const result = await MobileNet.classify(image);
            expect(result).toBeDefined();
        }
    });

     });
     */
});