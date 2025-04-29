const SEC_KEY ="This is ecommerce";
const jwt = require("jsonwebtoken");
const User = require("../models/usermodel");

module.exports = authorizeroles = (roles) = async (req, res, next) => {
    try{
        const {token} = req.cookies;
        const decoded = jwt.verify(token, SEC_KEY);
        const user = await User.findById(decoded._id);
        if(user.work==="admin"){
            console.log("Welcome, Admin!")
            next();
        }
        else{
            return res.status(400).json({ success: false, message: "Access denied!" });
        }
    }
    catch(error){
        console.log(error)
        return res.status(500).json({ success: false, message: "Internal server error" }); 
    }
}
