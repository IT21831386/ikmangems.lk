import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";

import bodyParser from "body-parser";
import cookieParser from "cookie-parser";

import otpRoutes from "./routes/otpRoutes.js";
import authRouter from './routes/authRoutes.js';
import userRouter from './routes/userRoutes.js';

import paymentRoutes from "./routes/paymentRoutes.js";
import onlinePaymentRoutes from "./routes/onlinepaymentRoutes.js";
import { connectDB } from "./config/db.js";

//import rateLimiter from "./middleware/rateLimiter.js";

// Load .env file from root directory (one level up from api folder)
const rootPath = path.resolve();
const envPath = path.join(rootPath, '..', '.env');
dotenv.config({ path: envPath });

const app = express();
const PORT = process.env.PORT || 5001;
const __dirname = path.resolve();


app.use(cors({
    origin: process.env.FRONTEND_URL, //env > "http://localhost:5173" 
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
}));

//app.use(cors()); //commented by Dana++  
//app.use(bodyParser.json());
app.use(express.json()); // this middleware will parse JSON bodies: req.body
app.use(cookieParser());
app.use(express.urlencoded({ extended: true })); // for form data
app.use('/uploads', express.static(path.join(__dirname, 'uploads'))); // serve uploaded files
//app.use(rateLimiter);
 
app.get('/', (req, res) => res.send("API working"));//added by Dana

app.use("/api/payments", paymentRoutes);
app.use("/api/online-payments", onlinePaymentRoutes);


app.use('/api/auth', authRouter);
app.use('/api/user', userRouter);
app.use('/api/otp', otpRoutes);


// commented by Dana
//reason: to avoid multiple server instances trying to connect to the database simultaneously

/*connectDB().then(() => {
  app.listen(PORT, () => {
    console.log("Server started PORT:", PORT);
  });
}).catch((error) => {
  console.error("Failed to start server:", error);
  process.exit(1);
});*/


if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "../frontend/dist")));

  app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "../frontend", "dist", "index.html"));
  });
}

connectDB()
  .then(() => {
    app.listen(PORT, () => console.log(`Server started on PORT: ${PORT}`));
  })
  .catch(err => {
    console.error("Failed to connect to MongoDB", err);
  });
