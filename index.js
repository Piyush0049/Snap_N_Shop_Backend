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

const allowedOrigins = [
  "https://ecommerce-frontend-web-ten.vercel.app",
  "http://localhost:3000",
  "http://localhost:5173", // If using Vite
];

const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or Postman)
    if (!origin) return callback(null, true);

    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      console.log('Origin not allowed:', origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
  credentials: true,
  optionsSuccessStatus: 200,
  maxAge: 86400 // Cache preflight response for 24 hours
};

// Apply CORS middleware
app.use(cors(corsOptions));

// Handle preflight requests
app.options("*", cors(corsOptions));

// Trust proxy (important for Vercel)
app.set('trust proxy', 1);

// Body parsing middlewares - AFTER CORS
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(fileUpload());

// Custom middleware to ensure CORS headers are always set
app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Access-Control-Allow-Credentials', 'true');
  }
  next();
});

// Routes
app.use("/api/v1/ord", orderRoutes);
app.use("/api/v1/prod", productRoutes);
app.use("/auth", userRoutes);
app.use("/api/v1/pay", paymentRoutes);

app.get("/", (req, res) => {
  res.send("The server is working");
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

module.exports = app;

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`App listening on http://localhost:${PORT}`);
});