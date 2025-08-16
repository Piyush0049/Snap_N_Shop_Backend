const express = require("express");
const isauthenticated = require("../middleware/auth")
const authorizeroles = require("../middleware/authwork");
const { processpayment, getstripeapikey, razorpayment } = require("../controller/paymentcontroller");
const router = express.Router();
router.route("/payment/process").post(processpayment);
router.route("/stripeapikey").get(getstripeapikey);
router.route("/razorpay").post(razorpayment);
module.exports = router
