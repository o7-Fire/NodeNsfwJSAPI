//jest and supertest
//version 3
const supertest = require("supertest");
const {app} = require('../app.js');
const request = supertest(app);

const NSFWModel = require('../models/NSFWModel');
const cache = require('../config/cache');
const model = require('../models/NSFWModel');
/**
 *     app.get('/api/v3/health', healthAuth, v3Controller.health);
 *     app.get('/api/v3/meta/categories', v3Controller.getCategories);
 *     app.get('/api/v3/meta/hosts', v3Controller.getHosts);
 *     app.get('/api/v3/meta/hosts/:host', v3Controller.checkHost);
 *     app.get('/api/v3/classification/:url', cacheMiddleware, v3Controller.classifyUrl);
 *     app.post('/api/v3/classification', uploadFile, v3Controller.classifyUpload);
 *     app.get('/api/v3/hash/:url', cacheMiddleware, v3Controller.hashUrl);
 *     app.post('/api/v3/hash', uploadFile, v3Controller.hashUpload);
 */

beforeAll(async () => {
    //await cache.connect();
    await model.init();
});

describe("v3 Static API Test", () => {
    test("GET /api/v3/health", async () => {
        return request.get("/api/v3/health").expect(200);
    });
    test("GET /api/v3/meta/categories", async () => {
        return request.get("/api/v3/meta/categories").expect(200);
    });
    test("GET /api/v3/meta/hosts", async () => {
        return request.get("/api/v3/meta/hosts").expect(200);
    });
    //get testUrl host
    const host = new URL(NSFWModel.TEST_URL).host;
    test("GET /api/v3/meta/hosts/:host", async () => {
        return request.get("/api/v3/meta/hosts/" + host).expect(200).expect((res) => {
            expect(res.body.data.allowed).toBe(true);
        });
    });

})

afterAll(async () => {
    await cache.close();
    await new Promise(resolve => setTimeout(() => resolve(), 500)); // avoid jest open handle error

});
