import jwt from "jsonwebtoken";

// Main authentication middleware
const userAuth = (req, res, next) => {
  const { token } = req.cookies;

  if (!token) {
    return res
      .status(401)
      .json({ success: false, message: "Not authorized. Please log in." });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (!decoded.id) {
      return res.status(401).json({
        success: false,
        message: "Invalid token. Please log in again.",
      });
    }

    req.user = {
      id: decoded.id,
      role: decoded.role, // make sure to include role in JWT when signing
    };

    next();
  } catch (error) {
    res.status(401).json({
      success: false,
      message: "Token expired or invalid. Please log in again.",
    });
  }
};

// Role-based authorization middleware
export const authorizeRoles =
  (...roles) =>
  (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: "Access denied. Insufficient permissions.",
      });
    }
    next();
  };

export default userAuth;
