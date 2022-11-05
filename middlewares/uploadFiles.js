const multer = require("multer");


const uploadFile = (req, res, next) => {
    const storage = multer.memoryStorage();
    const upload = multer({
        storage: storage,
        fileFilter: (req, file, cb) => {//only allow jpg, jpeg, png, bmp, gif
            if (!file.mimetype.match(/\/(jpg|jpeg|png|bmp|gif)$/)) {
                cb({
                    msg: "Only image files are allowed!",
                    code: 400
                }, false);
                return;
            }
            //check if file size is too big
            const maxSize = process.env.MAX_FILE_SIZE || 1024 * 1024 * 10;
            if (file.size > maxSize) {
                cb({
                    msg: "File size is too big!, Max size is " + maxSize + " bytes",
                    code: 400
                }, false);
                return;
            }
            //check if there too much files uploaded at once
            const maxFiles = process.env.MAX_FILES || 10;
            if (req.files && req.files.length >= maxFiles) {
                cb({
                    msg: "Too many files uploaded at once!, Max files is " + maxFiles,
                    code: 400
                }, false);
                return;
            }
            cb(null, true);
        },
    }).any();

    upload(req, res, (err) => {
        if (err instanceof multer.MulterError) {
            return res.status(500).json({
                success: false,
                error_code: err.code || "ERR_UPLOAD",
                message: err.msg || "Upload Error Occured.",
            });
        } else if (err) {
            return res.status(400).json({
                success: false,
                error_code: err.code || "ERR_UPLOAD_ERROR",
                message: err.msg,
            });
        } else {
            next();
        }
    });
};

module.exports = {uploadFile};