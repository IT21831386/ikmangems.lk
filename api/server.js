import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import cookieParser from "cookie-parser";
import { join } from "path";

import otpRoutes from "./routes/otpRoutes.js";
import authRouter from "./routes/authRoutes.js";
import userRouter from "./routes/userRoutes.js";
import paymentRoutes from "./routes/paymentRoutes.js";
import onlinePaymentRoutes from "./routes/onlinepaymentRoutes.js";
import { connectDB } from "./config/db.js";
import bidRoutes from "./routes/bidRoutes.js";
import gemstoneRoutes from "./routes/listingRoutes.js";

// Load .env file from root directory (one level up from api folder)
const rootPath = path.resolve();
const envPath = path.join(rootPath, "..", ".env");
dotenv.config();

const corsOptions = {
  origin: "http://localhost:5173", // your frontend origin
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "x-user-type"], // allow your custom header here
  credentials: true, // if you use cookies or auth headers
};

console.log("Loading env from:", envPath);
console.log("JWT_SECRET:", process.env.JWT_SECRET);

const app = express();

app.use(cors(corsOptions));
const PORT = process.env.PORT || 5001;
const __dirname = path.resolve();

// CORS configuration
app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

// Middleware
app.use(express.json()); // parse JSON bodies
app.use(express.urlencoded({ extended: true })); // parse URL-encoded bodies
app.use(cookieParser());
app.use("/uploads", express.static(path.join(__dirname, "uploads"))); // serve uploaded files

// Routes
app.use("/api/payments", paymentRoutes);
app.use("/api/online-payments", onlinePaymentRoutes);
app.use("/api/auth", authRouter);
app.use("/api/user", userRouter);
app.use("/api/otp", otpRoutes);
app.use("/api/bids", bidRoutes);
app.use("/uploads", express.static(join(process.cwd(), "uploads")));
app.use("/gemstone", gemstoneRoutes);

// Simple API check route
app.get("/", (req, res) => res.send("API working"));

// Serve frontend in production
if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "../frontend/dist")));

  app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "../frontend/dist/index.html"));
  });
}

// Connect to MongoDB and start server
connectDB()
  .then(() => {
    app.listen(PORT, () => console.log(`Server started on PORT: ${PORT}`));
  })
  .catch((err) => {
    console.error("Failed to connect to MongoDB", err);
  });
