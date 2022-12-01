//////////////////////// General Test ////////////////////////
const supertest = require("supertest");
const {app} = require('../app.js');
const request = supertest(app);

describe("Root Endpoint Test", () => {
    test("GET /", async () => {
        return request.get("/").expect(200);
    });
});

describe("404 Random Path Test", () => {
    for (let i = 0; i < 5; i++) {
        const path = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
        test("GET /" + path, async () => {
            return request.get("/" + path).expect(404);
        });
    }
});
