const mongoose = require("mongoose");

const connecttodatabase = async()=>{
    try {
    await mongoose.connect(process.env.DB_URI);
    console.log('MongoDB connected');
  } catch (err) {
    console.error('Database connection error:', err);
  }
}
module.exports = connecttodatabase;