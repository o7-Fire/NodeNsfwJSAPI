const v3Controller = require('../controllers/v3_controller');
const {uploadFile} = require('../middlewares/uploadFiles');
const {cacheMiddleware} = require('../middlewares/cacheMiddleware');
const {healthAuth} = require('../middlewares/auth');

//Only cache GET requests
module.exports = (app) => {

    app.get('/api/v3/health', healthAuth, v3Controller.health);
    app.get('/api/v3/meta/categories', v3Controller.getCategories);
    app.get('/api/v3/meta/hosts', v3Controller.getHosts);
    app.get('/api/v3/meta/hosts/:host', v3Controller.checkHost);
    app.get('/api/v3/classification/:url', cacheMiddleware, v3Controller.classifyUrl);
    app.post('/api/v3/classification', uploadFile, v3Controller.classifyUpload);
    app.get('/api/v3/hash/:hex', v3Controller.hashUrl);
    app.post('/api/v3/hash', uploadFile, v3Controller.hashUpload);
}
