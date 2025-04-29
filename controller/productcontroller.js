const Apifeatures = require("../utils/apifeatures");
const User = require("../models/usermodel");
const Product = require("../models/productmodel");
const Cookies = require("js-cookie")
const jwt = require("jsonwebtoken");
const { findById } = require("../models/usermodel");
const SEC_KEY = "This is ecommerce"

exports.createproduct = async (req, res, next) => {
    try {
        const { token } = req.cookies;
        const decoded = jwt.verify(token, SEC_KEY);
        req.body.user = decoded._id;
        const product = await Product.create(req.body);
        res.status(201).json({ success: true, product });
    } catch (error) {
        console.error("Error creating product:", error);
        res.status(500).json({ success: false, error: "Failed to create product" });
    }
};


exports.getallproducts = async (req, res) => {
    try {
        const resultperpage = 2;

        // Initially count all documents
        let productcount = await Product.countDocuments();
        const allproducts = await Product.find();
        

        const apifeatures = new Apifeatures(Product.find(), req.query).search().filter().pagination(resultperpage);
        const products = await apifeatures.query;

        // Recalculate product count based on filtered data
        productcount = await Product.countDocuments(apifeatures.query.getFilter());

        res.status(200).json({ success: true, productcount, products, resultperpage, allproducts });
    } catch (error) {
        console.error(error); // Log the error for debugging
        res.status(500).json({ success: false, error: "Failed to access the products" });
    }
};


exports.getoneproduct = async (req, res, next) => {
    try {
        const product = await Product.findById(req.params.id);
        if(!product){
            return res.status(400).json({success : false, message : "Product not found !"})
        }
        res.status(200).json({success : true, product});
    } catch (error) {
        console.error(error); 
        return res.status(500).json({success : false, message : "Internal Server Error"})
    }
}

exports.updatetheproduct = async (req, res, next) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) {
            return res.status(404).json({
                success: false,
                error: "Product not found!"
            });
        }
        const updatedProduct = await Product.findOneAndUpdate(
            { _id: req.params.id }, // Query condition to find the product by ID
            req.body,               // Data to update
            { new: true }           // Option to return the updated document
        );
        res.status(200).json({
            success: true,
            product: updatedProduct
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            success: false,
            error: "Server Error"
        });
    }
};

exports.deleteproduct = async (req, res, next) => {
    try {
        const product = await Product.findById({ _id: req.params.id }, req.body, { new: true });
        if (!product) {
            return res.status(500).json({
                success: false,
                error: "Product not found!"
            })
        }
        await Product.findOneAndDelete({ _id: req.params.id });
        res.status(200).json({
            success: true,
            message: "Product deleted successfully"
        });
    }
    catch (error) {
        console.log(error);
    }
}
exports.addreviews = async (req, res, next) => {
    try {
        const { rating, comment, productid } = req.body;
        const { token } = req.cookies;
        if (!token) {
            return res.status(400).json({ success: false, message: "Login with an account first" });
        }
        const product = await Product.findById(productid); // Corrected findById usage
        if (!product) {
            return res.status(400).json({ success: false, message: "Product does not exist" });
        }
        const decoded = jwt.verify(token, SEC_KEY);
        const userdata = await User.findById(decoded._id); // Assuming this is correctly defined elsewhere
        const review = {
            user: decoded._id,
            username: userdata.username,
            rating: Number(rating), // Changed to use the rating variable directly
            comment: comment // Changed to use the comment variable directly
        };
        const isReviewed = product.reviews.some(rev => rev.user.toString() === decoded._id.toString());
        if (isReviewed) {
            product.reviews.forEach((rev) => {
                if (rev.user.toString() === decoded._id.toString()) {
                    rev.rating = rating; // Updated rating value
                    rev.comment = comment; // Updated comment value
                }
            });
            await product.save(); // Save the updated product
            return res.status(200).json({ success: true, message: "Review updated successfully", product });
        }
        product.reviews.push(review);
        product.numberofrev = product.reviews.length;
        let avg = 0;
        product.reviews.forEach((rev) => {
            avg += rev.rating;
        });
        product.averageRating = avg / product.numberofrev;
        await product.save(); // Save the updated product
        return res.status(200).json({ success: true, message: "New review added successfully", product });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};

exports.getallreviews = async (req, res, next) => {
    try {
        const product = await Product.findById(req.query.id);
        if (!product) {
            return res.status(400).json({ success: false, message: "Product not found" });
        }
        res.status(200).json({ success: true, productId: req.query.id, reviews: product.reviews });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
}

exports.deletereview = async (req, res, next) => {
    try{
    const {token} = req.cookies;
    const decoded = jwt.verify(token, SEC_KEY);
    const product = await Product.findById(req.query.id);
    if(!product){
        return res.status(400).json({ success: false, message: "Product not found" });
    }
    const newreviews = await product.reviews.filter((rev)=>(rev.user.toString() !== req.query.id.toString()));
    if(newreviews === product.reviews){
        return res.status(400).json({ success: false, message: "Review not found" });
    }
    product.reviews = newreviews;
    product.numberofrev = product.reviews.length;
        let avg = 0;
        product.reviews.forEach((rev) => {
            avg += rev.rating;
        });
        product.averageRating = avg / product.numberofrev;
         
        return res.status(200).json({ success: true, message: "Review deleted successfully", product });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
}