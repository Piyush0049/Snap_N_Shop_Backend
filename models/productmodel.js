// models/productmodel.js
const mongoose = require("mongoose");
const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    reviews: [
        {
            username: {
                type: String,
                required: true
            },
            user: {
                type: mongoose.Schema.ObjectId,
                ref: "User",
                required: true,
            },
            rating: {
                type: Number,
                required: true,
                max : [5,"Rating can not be more than 5"],
                min : [0, "Rating cannot be less than 0"]
            },
            comment: {
                type: String,
                required: true,
            },
        },
    ],
    averageRating : {
        type : Number,
        default : 0
    },
    images: [{
        public_id: {
            type: String,
            required: true
        },
        url: {
            type: String,
            required: true
        }
    }],
    numberofrev : {
        type: Number,
        default : 0
    },
    category: {
        type: String,
        required: true
    },
    stock: {
        type: Number,
        required: true
    },
    user: {
        type: mongoose.Schema.ObjectId,
        ref: "User",
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model("Product", productSchema);
