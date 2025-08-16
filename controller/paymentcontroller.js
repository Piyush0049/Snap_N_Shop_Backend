const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const Razorpay = require("razorpay");


const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_SECRET,
});

exports.processpayment = async (req, res, next) => {
    const mypayment = await stripe.paymentIntents.create({
        amount: req.body.amount,
        description: req.body.description,

        currency: "inr",
        metadata: {
            company: "Snap & Shop"
        }
    });
    res.status(200).json({ success: true, client_secret: mypayment.client_secret })
}


exports.getstripeapikey = async (req, res, next) => {
    try {
        res.status(200).json({ success: true, stripeapikey: process.env.STRIPE_API_KEY });
    } catch (error) {
        console.log("msdmsdp", error);
    }
}


exports.razorpayment = async (req, res, next) => {
    try {
        const { amount } = req.body; // amount in INR

        const options = {
            amount: amount * 100, // amount in paise
            currency: "INR",
            receipt: "order_rcptid_" + Math.floor(Math.random() * 10000),
        };

        const order = await razorpay.orders.create(options);
        res.json({ success: true, order });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};
