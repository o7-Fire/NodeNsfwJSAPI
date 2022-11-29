const cache = require('../config/cache');
const NSFWModel = require('../models/NSFWModel');

exports.health = async function (req, res) {
    try {
        const data = await NSFWModel.classify(NSFWModel.TEST_URL);
        res.status(200).json({
            status: "SUCCESS",
            error_code: "",
            message: "OK",
            data: data,
        });
    } catch (error) {
        console.error(error);
        res.status(error.status || 500).json({
            status: "ERROR",
            error_code: "ERR_HEALTH",
            message: error.message,
        });
    }
}

exports.getCategories = async function (req, res) {
    try {
        const data = NSFWModel.categories;
        res.status(200).json({
            status: "SUCCESS",
            error_code: "",
            message: "OK",
            data: data,
        });
    } catch (error) {
        res.status(error.status || 500).json({
            status: "ERROR",
            error_code: "ERR_GET_CATEGORIES",
            message: error.message,
        });
    }
}

exports.getHosts = async function (req, res) {
    try {
        const data = NSFWModel.hostsFilter();
        res.status(200).json({
            status: "SUCCESS",
            error_code: "",
            message: "OK",
            data: data,
        });
    } catch (error) {
        res.status(error.status || 500).json({
            status: "ERROR",
            error_code: "ERR_GET_HOSTS",
            message: error.message,
        });
    }
}

exports.checkHost = async function (req, res) {
    try {
        const host = req.params.host;
        const data = NSFWModel.hostAllowed(host);
        res.status(200).json({
            status: "SUCCESS",
            error_code: "",
            message: "OK",
            data: {
                host: host,
                allowed: data,
            }
        });
    } catch (error) {
        res.status(error.status || 500).json({
            status: "ERROR",
            error_code: "ERR_CHECK_HOST",
            message: error.message,
        });
    }
}

exports.classifyUrl = async function (req, res) {
    try {
        const url = req.params.url;
        const data = await NSFWModel.classify(url);
        res.status(200).json({
            status: "SUCCESS",
            error_code: "",
            message: "OK",
            data: data,
        });
    } catch (error) {
        res.status(error.status || 500).json({
            status: "ERROR",
            error_code: "ERR_CLASSIFY_URL",
            message: error.message,
        });
    }
}

exports.classifyUpload = async function (req, res) {
    try {
        const files = req.files;
        const datas = [];
        for (let i = 0; i < files.length; i++) {
            const blob = files[i].buffer;
            const data = await NSFWModel.digest(blob);
            datas.push(data);
        }

        res.status(200).json({
            status: "SUCCESS",
            error_code: "",
            message: "OK",
            data: datas,
        });
    } catch (error) {
        res.status(error.status || 500).json({
            status: "ERROR",
            error_code: "ERR_CLASSIFY_UPLOAD",
            message: error.message,
        });
    }
}
/**
 *
 * @param req
 * @param res
 * @returns {Promise<void>}
 */
exports.hashUrl = async function (req, res) {
    try {
        const url = req.params.url;
        const hash = NSFWModel.hashData(url);
        const data = {
            url: url,
            hash: hash,
            hex: hash,
            data: await cache.get(hash),
        }

        res.status(200).json({
            status: "SUCCESS",
            error_code: "",
            message: "OK",
            data: data,
        });
    } catch (error) {
        res.status(error.status || 500).json({
            status: "ERROR",
            error_code: "ERR_HASH_URL",
            message: error.message,
        });
    }
}

exports.hashUpload = async function (req, res) {
    try {
        const files = req.files;
        const datas = [];
        for (let i = 0; i < files.length; i++) {
            const blob = files[i].buffer;
            const hash = NSFWModel.hashData(blob);
            const data = {
                url: files[i].originalname,
                hash: hash,
                hex: hash,
                data: await cache.get(hash),
            }
            datas.push(data);
        }

        res.status(200).json({
            status: "SUCCESS",
            error_code: "",
            message: "OK",
            data: datas,
        });
    } catch (error) {
        res.status(error.status || 500).json({
            status: "ERROR",
            error_code: "ERR_HASH_UPLOAD",
            message: error.message,
        });
    }
}


