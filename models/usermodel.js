const mongoose = require("mongoose");
const validator = require("validator")
const crypto = require("crypto")
const userschema = new mongoose.Schema({
    username : {
        type : String,
        required : [true, "Enter the correct username"]
    },
    email : {
        type : String,
        required : [true, "Enter the correct email"],
        validate : [validator.isEmail, "Enter a valid email"]
    },
    password : {
        type : String,
        required : [true, "Enter the correct password"],
        minlength : 8,
        select : false
    },
    avatar : {
        public_id : {
            type : String,
        },
        url : {
            type : String,
        }
    },
    work : {
        type : String,
        default : "user"
    },
    createdAt : {
        type : Date,
        default : Date.now 
    },
    resetpasswordtoken : String,
    resetpasswordexpire : Date,
})

userschema.methods.getresetpassword = function(){
    const resettoken = crypto.randomBytes(20).toString("hex");
    this.resetpasswordtoken = crypto.createHash("sha256").update(resettoken).digest("hex");
    this.resetpasswordexpire = Date.now() + 900000;
    return resettoken;
}


module.exports = mongoose.model("User", userschema)