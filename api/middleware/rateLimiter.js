
/*import ratelimit from "../config/upstash.js";

const rateLimiter = async (req, res, next) => {
  try {
    const { success, limit, reset, remaining } = await ratelimit.limit("my-rate-limit");
    
    console.log(`Rate limit check: success=${success}, remaining=${remaining}, limit=${limit}`);

    if (!success) {
      return res.status(429).json({
        message: "Too many requests, please try again later",
        
      });
    }

    next();
  } catch (error) {
    console.log("Rate limit error", error);
    // If rate limiter fails, allow the request to proceed
    next();
  }
};

export default rateLimiter;*//*
import ratelimit from "../config/upstash.js";

const rateLimiter = async (req, res, next) => {
  try {
    const { success } = await ratelimit.limit("my-rate-limit");

    if (!success) {
      return res.status(429).json({
        message: "Too many requests, please try again later",
      });
    }

    next();
  } catch (error) {
    console.log("Rate limit error", error);
    next(error);
  }
};

export default rateLimiter;*/