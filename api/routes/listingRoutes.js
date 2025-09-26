import { Router } from "express";
import {
  validateGemstone,
  validateUpdateGemstone,
  createGemstone,
  getGemstones,
  getGemstone,
  updateGemstone,
  deleteGemstone,
  verifyGemstone,
  rejectGemstone,
  bulkUpdateGemstones,
} from "../controllers/listingController.js";
import {
  placeBid,
  getBidsByGem,
  getBidsByUser,
} from "../controllers/bidController.js";

import multer, { diskStorage } from "multer";
import { extname } from "path";
import { body } from "express-validator";

const router = Router();

/* ====================== ENHANCED MULTER CONFIGURATION ====================== */
const storage = diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/gemstones/");
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = extname(file.originalname);
    cb(null, `gemstone-${uniqueSuffix}${ext}`);
  },
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new Error(
        "Invalid file type. Only JPEG, PNG, and WebP images are allowed."
      ),
      false
    );
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024, files: 10 },
});

/* ====================== AUTH MIDDLEWARE ====================== */
const authMiddleware = (req, res, next) => {
  try {
    // For development/testing purposes - in production, use proper JWT authentication
    const userType = req.headers["x-user-type"] || "seller";
    const users = {
      seller: {
        id: "650fbc9c6e3c4f0012345678",
        role: "seller",
        name: "Nuwani Seller",
        email: "nuwani@example.com",
        phone: "0771234567",
      },
      admin: {
        id: "650fbc9c6e3c4f0012345679",
        role: "admin",
        name: "Admin User",
        email: "admin@example.com",
        phone: "0771234568",
      },
      buyer: {
        id: "650fbc9c6e3c4f0012345680",
        role: "buyer",
        name: "Buyer User",
        email: "buyer@example.com",
        phone: "0771234569",
      },
    };
    req.user = users[userType] || users.seller;
    console.log(`Request from user: ${req.user.name} (${req.user.role})`);
    next();
  } catch (error) {
    res.status(401).json({
      success: false,
      message: "Authentication failed",
      error: error.message,
    });
  }
};

/* ====================== ERROR HANDLING MIDDLEWARE ====================== */
const handleMulterError = (error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === "LIMIT_FILE_SIZE")
      return res.status(400).json({
        success: false,
        message: "File too large. Maximum size is 5MB per file.",
      });
    if (error.code === "LIMIT_FILE_COUNT")
      return res.status(400).json({
        success: false,
        message: "Too many files. Maximum 5 files allowed.",
      });
    if (error.code === "LIMIT_UNEXPECTED_FILE")
      return res.status(400).json({
        success: false,
        message: "Unexpected field name for file upload.",
      });
  }
  if (error.message.includes("Invalid file type"))
    return res.status(400).json({ success: false, message: error.message });
  next(error);
};

const validateImageCount = (req, res, next) => {
  if (req.files && req.files.length === 0 && req.method === "POST") {
    return res.status(400).json({
      success: false,
      message: "At least one image is required for gemstone listing",
    });
  }
  next();
};

// Apply auth middleware
router.use(authMiddleware);

/* ====================== CRUD ROUTES ====================== */
router.post(
  "/",
  upload.array("images", 10),
  handleMulterError,
  validateImageCount,
  validateGemstone,
  createGemstone
);
router.get("/", getGemstones);
router.get("/:id", getGemstone);
router.put(
  "/:id",
  upload.array("images", 10),
  handleMulterError,
  validateUpdateGemstone,
  updateGemstone
);
router.delete("/:id", deleteGemstone);

/* ====================== ADMIN ROUTES ====================== */
router.post(
  "/:id/verify",
  body("verificationNotes").optional().isLength({ max: 500 }).trim(),
  verifyGemstone
);

router.post(
  "/:id/reject",
  body("rejectionReason").notEmpty().isLength({ min: 10, max: 500 }).trim(),
  body("suggestions").optional().isLength({ max: 1000 }).trim(),
  rejectGemstone
);

router.patch(
  "/bulk/update",
  body("gemstoneIds")
    .isArray({ min: 1 })
    .custom((ids) => {
      const validIds = ids.every(
        (id) => typeof id === "string" && id.match(/^[0-9a-fA-F]{24}$/)
      );
      if (!validIds)
        throw new Error("All gemstone IDs must be valid MongoDB ObjectIds");
      return true;
    }),
  body("updateData")
    .isObject()
    .custom((data) => {
      const allowedFields = [
        "verificationStatus",
        "isActive",
        "featured",
        "category",
      ];
      if (!Object.keys(data).some((key) => allowedFields.includes(key)))
        throw new Error(
          `Update data must contain at least one of: ${allowedFields.join(
            ", "
          )}`
        );
      return true;
    }),
  bulkUpdateGemstones
);

/* ====================== UTILITY ROUTES ====================== */
router.get("/filters/options", (req, res) => {
  res.json({
    success: true,
    data: {
      categories: [
        "Diamond",
        "Ruby",
        "Sapphire",
        "Emerald",
        "Topaz",
        "Garnet",
        "Amethyst",
        "Citrine",
        "Aquamarine",
        "Tourmaline",
        "Moonstone",
        "Peridot",
        "Opal",
        "Pearl",
        "Other",
      ],
      clarityGrades: [
        "FL",
        "IF",
        "VVS1",
        "VVS2",
        "VS1",
        "VS2",
        "SI1",
        "SI2",
        "I1",
        "I2",
        "I3",
        "Not Graded",
      ],
      cutTypes: [
        "Round",
        "Princess",
        "Cushion",
        "Emerald",
        "Oval",
        "Radiant",
        "Asscher",
        "Marquise",
        "Heart",
        "Pear",
        "Cabochon",
        "Raw/Rough",
        "Other",
      ],
      certifyingBodies: [
        "GIA",
        "AIGS",
        "Gübelin",
        "SSEF",
        "GRS",
        "Lotus",
        "EGL",
        "AGS",
        "Other",
        "None",
      ],
      currencies: ["LKR", "USD"],
      weightUnits: ["carats", "grams"],
      verificationStatuses:
        req.user?.role === "buyer"
          ? ["verified"]
          : ["draft", "submitted", "under_review", "verified", "rejected"],
      priceRanges: [
        { label: "Under 10,000", min: 0, max: 10000 },
        { label: "10,000 - 50,000", min: 10000, max: 50000 },
        { label: "50,000 - 100,000", min: 50000, max: 100000 },
        { label: "100,000 - 500,000", min: 100000, max: 500000 },
        { label: "Above 500,000", min: 500000, max: null },
      ],
      weightRanges: [
        { label: "Under 1 carat", min: 0, max: 1 },
        { label: "1-2 carats", min: 1, max: 2 },
        { label: "2-5 carats", min: 2, max: 5 },
        { label: "5-10 carats", min: 5, max: 10 },
        { label: "Above 10 carats", min: 10, max: null },
      ],
    },
  });
});

router.get("/stats/overview", (req, res) => {
  if (req.user?.role !== "admin")
    return res
      .status(403)
      .json({ success: false, message: "Access denied. Admin role required." });
  res.json({
    success: true,
    data: {
      total: 0,
      verified: 0,
      pending: 0,
      rejected: 0,
      draft: 0,
      categories: {},
      priceStats: { average: 0, minimum: 0, maximum: 0 },
    },
  });
});

/* ====================== SEARCH ROUTES ====================== */
router.get("/search/advanced", (req, res) => {
  req.query.search = req.query.q || req.query.query;
  getGemstones(req, res);
});

router.get("/search/suggestions", (req, res) => {
  const { q } = req.query;
  if (!q || q.length < 2)
    return res.json({
      success: true,
      data: {
        suggestions: [],
        categories: ["Diamond", "Ruby", "Sapphire", "Emerald"],
      },
    });
  const mockSuggestions = [
    "Diamond ring",
    "Ruby necklace",
    "Sapphire earrings",
    "Emerald bracelet",
  ].filter((item) => item.toLowerCase().includes(q.toLowerCase()));
  res.json({ success: true, data: { suggestions: mockSuggestions, query: q } });
});

/* ====================== Bid Place ====================== */
router.post("/bids", placeBid);
router.get("/bids/:gemId", getBidsByGem);
router.get("/my-bids", getBidsByUser);

/* ====================== ERROR HANDLING ====================== */
// Catch-all 404 for this router
router.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Gemstone route not found",
    availableRoutes: [
      "GET /",
      "GET /:id",
      "POST /",
      "PUT /:id",
      "DELETE /:id",
      "POST /:id/verify",
      "POST /:id/reject",
      "GET /filters/options",
      "GET /search/advanced",
      "POST /bids",
      "GET /bids/:id",
      "GET /my-bids",
    ],
  });
});

export default router;
