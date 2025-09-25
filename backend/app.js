import express from "express";
import { connect } from "mongoose";
import gemstoneRoutes from "./Routes/listingRoute.js"; 
import { join } from "path";
import dotenv from "dotenv";
import cors from "cors";

// Load environment variables from .env file
dotenv.config();

const app = express();

// Enable CORS
app.use(cors());

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded images statically
app.use("/uploads", express.static(join(process.cwd(), "uploads"))); 

// Routes
app.use("/gemstone", gemstoneRoutes);

// MongoDB connection
const mongoUri = process.env.MONGO_URI;
const PORT = process.env.PORT || 5001;

connect(mongoUri)
  .then(() => {
    console.log("Connected to MongoDB");
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch(err => console.log("MongoDB connection error:", err));

