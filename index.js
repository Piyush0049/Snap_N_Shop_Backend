require("dotenv").config({
  path:
    process.env.NODE_ENV === "production"
      ? "backend/config/config.env"
      : ".env",
});

const express = require("express");
const cloudinary = require("cloudinary").v2;
const connectDB = require("./config/database");
const productRoutes = require("./routes/productroute");
const orderRoutes = require("./routes/orderroute");
const userRoutes = require("./routes/userroutes");
const paymentRoutes = require("./routes/paymentroute");
const fileUpload = require("express-fileupload");
const cookieParser = require("cookie-parser");
const cors = require("cors");

connectDB();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const app = express();

// ✅ Allowed origins
const allowedOrigins = [
  "https://ecommerce-frontend-web-ten.vercel.app",
  "http://localhost:3000"
];

// ✅ Dynamic CORS config
const corsOptions = {
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.log("Blocked origin:", origin);
      callback(new Error("Not allowed by CORS"));
    }
  },
  // methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  // allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
  credentials: true,
  // optionsSuccessStatus: 200,
};

app.use(cors(corsOptions));

// Force CORS headers on every response
app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin)) {
    res.header("Access-Control-Allow-Origin", origin);
    res.header("Access-Control-Allow-Credentials", "true");
    res.header("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE, OPTIONS");
    res.header("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Requested-With");
  }
  next();
});


// ✅ Explicit preflight handler
// app.options("*", (req, res) => {
//   res.header("Access-Control-Allow-Origin", req.headers.origin);
//   res.header("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE, OPTIONS");
//   res.header("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Requested-With");
//   res.header("Access-Control-Allow-Credentials", "true");
//   return res.sendStatus(200);
// });

// ✅ Trust proxy (important on Vercel for cookies + OAuth)
app.set("trust proxy", 1);

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(fileUpload());

// Routes
app.use("/api/v1/ord", orderRoutes);
app.use("/api/v1/prod", productRoutes);
app.use("/auth", userRoutes);
app.use("/api/v1/pay", paymentRoutes);

app.get("/", (req, res) => {
  res.send("The server is working ✅");
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: err.message || "Something broke!" });
});

module.exports = app;

// Local dev only
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`App listening on http://localhost:${PORT}`);
});
