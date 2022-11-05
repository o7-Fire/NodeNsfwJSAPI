const jwtAuth = (req, res, next) => {
    const token = req.header("x-auth-token");
    if (!token) {
        return res.status(401).json({
            success: false,
            error_code: "ERR_AUTH",
            message: "No token, authorization denied",
        });
    }
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded.user;
        next();
    } catch (err) {
        res.status(401).json({
            success: false,
            error_code: "ERR_AUTH",
            message: "Token is not valid",
        });
    }
}

const healthAuth = (req, res, next) => {
    if (!process.env.NODE_HEALTH_AUTH) {
        return next();
    }
    const authHeader = req.header("Authorization");
    if (!authHeader) {
        return res.status(401).json({
            success: false,
            error_code: "ERR_AUTH",
            message: "No token, authorization denied",
        });
    }
    if (authHeader !== process.env.NODE_HEALTH_AUTH) {
        return res.status(401).json({
            success: false,
            error_code: "ERR_AUTH",
            message: "Token is not valid",
        });
    }
    next();
}

module.exports = {jwtAuth, healthAuth};