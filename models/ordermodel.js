const mongoose = require("mongoose");
const orderschema = mongoose.Schema({
    shippinginfo : {
        address : {
            type : String,
            required : true
        },
        city : {
            type : String,
            required : true
        },
        state : {
            type : String,
            required : true
        },
        country : {
            type : String,
            required : true
        },
        pincode : {
            type : Number,
            required : true
        },
        phoneno : {
            type : Number,
            required : true,
        }
    },
    orderitems : [
        {
            name : {
                type : String,
                required : true
            },
            price : {
                type : String,
                required : true
            },
            quantity : {
                type : String,
                required : true
            },
            image : {
                type : String,
                required : true
            },
            product : {
                type : mongoose.Schema.ObjectId,
                required : true,
                ref : "Product"
            }
        }
    ],
    user : {
        type : mongoose.Schema.ObjectId,
        required : true,
        ref : "User"
    },
    paymentInfo: {
        id: {
          type: String,
          required: true,
        },
        status: {
          type: String,
          required: true,
        },
      },
      paidAt: {
        type: Date,
        required: true,
      },
      itemsPrice: {
        type: Number,
        required: true,
        default: 0,
      },
      taxPrice: {
        type: Number,
        required: true,
        default: 0,
      },
      shippingPrice: {
        type: Number,
        required: true,
        default: 0,
      },
      totalPrice: {
        type: Number,
        required: true,
        default: 0,
      },
      orderStatus: {
        type: String,
        required: true,
        default: "Processing",
      },
      deliveredAt : Date,
      createdAt: {
        type: Date,
        default: Date.now,
      },
})

module.exports = mongoose.model("Order", orderschema)