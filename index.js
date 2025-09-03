// index.js
require("dotenv").config({
  path:
    process.env.NODE_ENV === "production"
      ? "backend/config/config.env"
      : ".env",
});

const express = require("express");
const serverless = require("serverless-http");
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

// ✅ Allowed frontend origins
const allowedOrigins = [
  "https://ecommerce-frontend-web-ten.vercel.app",
  "http://localhost:3000"
];

const corsOptions = {
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true); // ✅ Allow request
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  methods: ["GET", "POST", "PATCH", "DELETE", "PUT"],
  allowedHeaders: ["Content-Type", "Authorization", "x-requested-with"],
  credentials: true,
};

// ✅ Apply CORS before routes
app.use(cors(corsOptions));
app.options("*", cors(corsOptions));

// Extra fallback (for Vercel edge cases)
app.use((req, res, next) => {
  if (allowedOrigins.includes(req.headers.origin)) {
    res.header("Access-Control-Allow-Origin", req.headers.origin);
  }
  res.header("Access-Control-Allow-Credentials", "true");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, PATCH, OPTIONS");
  next();
});

app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
app.use(fileUpload());

// ✅ Routes
app.use("/api/v1/ord", orderRoutes);
app.use("/api/v1/prod", productRoutes);
app.use("/auth", userRoutes);
app.use("/api/v1/pay", paymentRoutes);

app.get("/", (req, res) => {
  res.send("The server is working");
});

module.exports = app;

if (process.env.PORT && process.env.NODE_ENV !== "production") {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`App listening on http://localhost:${PORT}`);
  });
}
