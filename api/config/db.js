import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config(); // make sure .env is loaded

export const connectDB = async () => {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error("MONGO_URI is not defined in .env file");
    }

    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ MONGODB CONNECTED SUCCESSFULLY!");
  } catch (error) {
    console.error("❌ Error connecting to MongoDB:", error.message);
    process.exit(1);
  }
};
