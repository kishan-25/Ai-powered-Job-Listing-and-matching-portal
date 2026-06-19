const jwt = require("jsonwebtoken");
const User  = require("../models/User");

const protect = async (req, res, next) => {
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
        try {
            token = req.headers.authorization.split(" ")[1];
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            req.user = await User.findById(decoded.id).select("-password");

            if (req.user && req.user.accountStatus === 'suspended') {
                return res.status(403).json({
                    success: false,
                    message: "Your account has been suspended. Please contact support."
                });
            }

            next();
        } catch (error) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized, token failed"
            })
        }
    }

    if(!token) {
        return res.status(401).json({ 
            success: false,
            message: "No token, authorization denied "
        })
    }
};

module.exports = { protect };