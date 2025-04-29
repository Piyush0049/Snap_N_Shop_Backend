const Order = require("../models/ordermodel");
const Product = require("../models/productmodel")
const bcrypt = require("bcrypt");
const Cookies = require("js-cookie")
const SEC_KEY = "This is ecommerce";
const jwt = require("jsonwebtoken");
exports.createorder = async (req, res, next) => {
    try {
        const { token } = req.cookies;
        const decoded = jwt.verify(token, SEC_KEY);
        const { shippinginfo, orderitems, paymentInfo, itemsPrice, taxPrice, shippingPrice, totalPrice} = req.body;
        const order = await Order.create({
            shippinginfo, orderitems, paymentInfo, itemsPrice, taxPrice, shippingPrice, totalPrice, user: decoded._id, paidAt: Date.now()
        });
        return res.status(200).json({ success: true, order });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
}

//FOR ADMINS ONLY
exports.getsingleorder = async (req, res, next) => {
    try {
        const { token } = req.cookies;
        const decoded = jwt.verify(token, SEC_KEY);
        
        // Find the order based on the user
        let order = await Order.findOne({ _id: req.params.id }).populate("user", "username email");
        if (!order) {
            return res.status(400).json({ success: false, message: "Order not found" });
        }
        
        return res.status(200).json({ success: true, order });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
};



exports.getallmyorders = async (req, res, next) => {
    try {
        const { token } = req.cookies;
        const decoded = jwt.verify(token, SEC_KEY);
        const order = await Order.find({ user: decoded._id });
        if (!order) {
            return res.status(400).json({ success: false, message: "No orders to display" });
        }
        let totalbill=0;
        order.forEach(tot => {
            totalbill += tot.totalprice;  
        })
        return res.status(200).json({ success: true, order, TotalAmountSpent : totalbill });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
}

//FOR ADMINS ONLY
exports.everyorder = async (req, res, next) => {
    try{
        const order = await Order.find();
        return res.status(200).json({success : true, order})
    }catch(error){
        console.log(error);
        return res.status(500).json({success : false, message : "Internal Server Error"});
    }
}


//FOR ADMINS ONLY
exports.updateorder = async (req, res, next) => {
    try{
        const { token } = req.cookies;
        const decoded = jwt.verify(token, SEC_KEY);
        const order = await Order.findOne({_id : req.params.id});
        if(order.orderStatus==="delivered"){
            return res.status(400).json({success : false, message : "Order has already been delivered"});
        }
        if(req.body.orderStatus==="shipped"){
            order.orderitems.forEach(o => {
                updatestock(o.quantity, o.product)
            });
            updatestock(order);
            order.orderStatus = req.body.orderStatus;
        }
        if(req.body.orderStatus==="delivered"){
            order.deliveredAt = Date.now();
            order.orderStatus = req.body.orderStatus;
        }
        await order.save();
        return res.status(200).json({success : true, message : "Order has been updated successfully", order});
    }catch(error){
        console.log(error);
        return res.status(500).json({success : false, message : "Internal server error"});
    }
}

async function updatestock(quantity, id) {
    try {
        const productdet = await Product.findById(id);
        if (!productdet) {
            console.log(`Product with id ${id} not found`);
            return;
        }
        console.log(productdet.stock);
        productdet.stock -= quantity;
        await productdet.save();
    } catch (error) {
        console.error(error);
    }
}


exports.deleteorder = async (req, res, next) => {
    const order = await Order.findById(req.params.id);
    if(!order){
        return res.status(400).json({success : false, message : "Order is not available"});
    }
    await Order.findOneAndDelete({_id : req.params.id});
    return res.status(200).json({success : true, message : "Order has been deleted successfully"})
}