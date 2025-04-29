const express = require("express");
const isauthenticated = require("../middleware/auth")
const authorizeroles = require("../middleware/authwork");
const { processpayment, getstripeapikey } = require("../controller/paymentcontroller");
const router = express.Router();
router.route("/payment/process").post(processpayment);
router.route("/stripeapikey").get(getstripeapikey);
module.exports = router
