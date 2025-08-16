const mongoose = require("mongoose");

const connecttodatabase = async () => {
  try {
    await mongoose.connect(process.env.DB_URI, {
      serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 10s
      socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
      
    });

    console.log(`Database connected: ${mongoose.connection.host}`);
  } catch (error) {
    console.error("Initial DB connection error:", error);
    process.exit(1); // Optional: Stop server if DB is unreachable at start
  }
};

module.exports = connecttodatabase;
