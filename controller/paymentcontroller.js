const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

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
        console.log( "msdmsdp", error); 
    }
}
