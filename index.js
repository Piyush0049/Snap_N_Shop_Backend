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

// ✅ Dynamic CORS
const allowedOrigins = [
  "https://ecommerce-frontend-web-ten.vercel.app",
  "http://localhost:3000",
];

const corsOptions = {
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  methods: ["GET", "POST", "PATCH", "DELETE", "PUT"],
  allowedHeaders: ["Content-Type", "Authorization", "x-requested-with"],
  credentials: true,
  optionsSuccessStatus: 200,
};

app.use(cors(corsOptions));
app.options("*", cors(corsOptions));

// Middlewares
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
app.use(fileUpload());

// Routes
app.use("/api/v1/ord", orderRoutes);
app.use("/api/v1/prod", productRoutes);
app.use("/auth", userRoutes);
app.use("/api/v1/pay", paymentRoutes);

app.get("/", (req, res) => {
  res.send("The server is working");
});

module.exports = app;

// Local dev only
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`App listening on http://localhost:${PORT}`);
  });
