//jest and supertest
//version 3
const supertest = require("supertest");
const {app} = require('../app.js');
const request = supertest(app);
const {testImageUrls, TEST_URL} = require('./vars.js');
const cache = require('../config/cache');
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

jest.setTimeout(30000);

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
    const host = new URL(TEST_URL).host;
    test("GET /api/v3/meta/hosts/:host", async () => {
        return request.get("/api/v3/meta/hosts/" + host).expect(200).expect((res) => {
            expect(res.body.data.allowed).toBe(true);
        });
    });
});

describe("v3 Classification API Test", () => {
    for (const url of testImageUrls) {
        test("GET /api/v3/classification/" + url, async () => {
            return await request.get("/api/v3/classification/" + encodeURIComponent(url))
                .expect(200)
                .expect('Content-Type', /json/)
                .expect((res) => {
                    expect(res.body.data.data).toBeDefined();
                });
        });
    }
    test("GET /api/v3/classification Cache Test", async () => {
        for (let i = 0; i < 10; i++) {
            await request.get("/api/v3/classification/" + encodeURIComponent(TEST_URL))
                .expect(200)
                .expect('Content-Type', /json/)
                .expect((res) => {
                    expect(res.body.data.data).toBeDefined();
                });
        }
    });
    test("POST /api/v3/classification", async () => {
        return request.post("/api/v3/classification").attach("file", "test/assets/1.png").expect(200);
    });
    test("POST /api/v3/classification Cache Test", async () => {
        for (let i = 0; i < 10; i++) {
            await request.post("/api/v3/classification").attach("file", "test/assets/1.png").expect(200);
        }
    });

    test("GET /api/v3/hash/:hash", async () => {
        //TODO get hash from request above
        const hash = "8d311167da7ea1130a1e9983adbd034e9613f3e6e5f36fe87da811d9173374b1";
        return request.get("/api/v3/hash/" + hash).expect(200);
    });
    test("POST /api/v3/hash", async () => {
        return request.post("/api/v3/hash").attach("file", "test/assets/1.png").expect(200);
    });
});

afterAll(async () => {
    await cache.clear();
    await cache.close();
    await new Promise(resolve => setTimeout(() => resolve(), 5000)); // avoid jest open handle error

});
