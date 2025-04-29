const express = require("express");
const authorizeroles = require("../middleware/authwork")
const { createuser, userlogin, userlogout, userdelete, forgotpassword, resetpassword, getuserprofile, updatepassword, updateprofile, getallusers,changeTheWorkbByAdmin } = require("../controller/usercontroller");
const router = express.Router();
router.route("/createuser").post(createuser)
router.route("/login").post(userlogin)
router.route("/userlogout").get(userlogout)
router.route("/userdelete").delete(userdelete)
router.route("/password/forgot").post(forgotpassword)
router.route("/password/reset/:token").put(resetpassword)
router.route("/me").get(getuserprofile)
router.route("/updatepassword").put(updatepassword)
router.route("/updateprofile").put(updateprofile)
router.route("/getalluserprofile").get(authorizeroles, getallusers)
router.route("/changerole").put(authorizeroles, changeTheWorkbByAdmin)
module.exports = router;