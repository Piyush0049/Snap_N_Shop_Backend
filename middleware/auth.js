const SEC_KEY ="This is ecommerce";
const jwt = require("jsonwebtoken");
const User = require("../models/usermodel");

module.exports = isauthenticated =  async (req, res, next) => {
    try {
        const { token } = req.cookies;

        if (!token) {
            return res.status(400).json({ success: false, message: "Login with an account first" });
        }

        const decoded = jwt.verify(token, SEC_KEY);

        if (decoded) {
            console.log(token)
            return next();
        } else {
            return res.status(400).json({ success: false, message: "Invalid User" });
        }
    } catch (error) {
        console.log(error);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
};
