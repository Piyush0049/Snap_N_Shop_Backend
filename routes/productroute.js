const express = require("express");
const isauthenticated = require("../middleware/auth")
const authorizeroles = require("../middleware/authwork")
const { getallproducts, createproduct, updatetheproduct, deleteproduct, addreviews, getallreviews, deletereview, getoneproduct } = require("../controller/productcontroller");
const router = express.Router();
router.route("/products").get( getallproducts)
router.route("/product/:id").get( getoneproduct)
router.route("/product/create").post(isauthenticated, authorizeroles, createproduct)
router.route("/product/:id").put(isauthenticated, authorizeroles, updatetheproduct).delete(isauthenticated, authorizeroles, deleteproduct)
router.route("/product/addreview").post(isauthenticated, addreviews)
router.route("/reviews").get( getallreviews).delete(isauthenticated, deletereview)
module.exports = router