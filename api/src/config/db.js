

import mongoose from "mongoose";

export const connectDB = async () => {
  try {
    // Use environment variable or fallback to local MongoDB
    const mongoURI = process.env.MONGO_URI || 'mongodb://localhost:27017/payment_db';
    await mongoose.connect(mongoURI);
    console.log("MONGODB CONNECTED SUCCESSFULLY!");
  } catch (error) {
    console.error("Error connecting to MONGODB", error);
    console.log("Trying to connect to local MongoDB...");
    
    // Try local MongoDB as fallback
    try {
      await mongoose.connect('mongodb://localhost:27017/payment_db');
      console.log("MONGODB CONNECTED SUCCESSFULLY (Local)!");
    } catch (localError) {
      console.error("Failed to connect to local MongoDB:", localError);
      console.log("Please install MongoDB locally or set up MongoDB Atlas");
      process.exit(1);
    }
  }
};