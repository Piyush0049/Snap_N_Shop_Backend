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

app.use(
  cors({
    origin: [
      "https://ecommerce-frontend-web-ten.vercel.app",
      "https://main--dulcet-conkies-e3a8f0.netlify.app",
      "http://localhost:3000",
      "https://main--ecommercefrontend123654.netlify.app",
    ],
    methods: ["GET", "POST", "PATCH", "DELETE", "PUT"],
    allowedHeaders: ["Content-Type"],
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
app.use(fileUpload());

app.use("/api/v1", orderRoutes);
app.use("/api/v1", productRoutes);
app.use("/auth", userRoutes);
app.use("/api/v1", paymentRoutes);

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
