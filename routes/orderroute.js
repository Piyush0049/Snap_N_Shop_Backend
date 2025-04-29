const express = require("express");
const isauthenticated = require("../middleware/auth")
const authorizeroles = require("../middleware/authwork")
const {createorder, getsingleorder, getallmyorders, everyorder, updateorder, deleteorder} = require("../controller/ordercontroller");
const router = express.Router();
router.route("/order/create").post(isauthenticated,createorder);
router.route("/getoneorder/:id").get(isauthenticated, authorizeroles, getsingleorder);
router.route("/getallmyorders").get(isauthenticated, getallmyorders);
router.route("/allorders").get(isauthenticated, authorizeroles, everyorder);
router.route("/updateorder/:id").put(isauthenticated, authorizeroles, updateorder);
router.route("/deleteorder/:id").delete(deleteorder);
module.exports = router
