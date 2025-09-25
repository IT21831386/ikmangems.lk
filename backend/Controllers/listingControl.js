import Gemstone from "../Model/listingModel.js";
import { body, validationResult } from "express-validator";
import fs from 'fs/promises';

/* ----------------------  FORM VALIDATION ---------------------- */
export const validateGemstone = [
  // Enhanced name validation
  body("name")
    .notEmpty().withMessage("Name is required")
    .isLength({ min: 2, max: 100 }).withMessage("Name must be between 2-100 characters")
    .matches(/^[a-zA-Z\s\-\.']+$/).withMessage("Name allows letters, spaces, hyphens, periods and apostrophes only")
    .trim(),
  
  // Enhanced description validation
  body("description")
    .notEmpty().withMessage("Description is required")
    .isLength({ min: 10, max: 1000 }).withMessage("Description must be between 10-1000 characters")
    .trim(),
  
  // Enhanced category validation
  body("category")
    .notEmpty().withMessage("Category is required")
    .isIn([
      "Diamond","Ruby","Sapphire","Emerald","Topaz","Garnet",
      "Amethyst","Citrine","Aquamarine","Tourmaline","Moonstone",
      "Peridot","Opal","Pearl","Other"
    ]).withMessage("Please select a valid category"),
  
  // Enhanced minimum bid validation
  body("minimumBid")
    .notEmpty().withMessage("Minimum bid is required")
    .isNumeric().withMessage("Minimum bid must be a valid number")
    .isFloat({ min: 1 }).withMessage("Minimum bid must be at least 1 LKR")
    .toFloat(),
  
  // Weight validation
  body("weight")
    .optional()
    .isNumeric().withMessage("Weight must be a valid number")
    .isFloat({ min: 0.01, max: 10000 }).withMessage("Weight must be between 0.01 and 10,000 carats")
    .toFloat(),
  
  // Color validation
  body("color")
    .optional()
    .isLength({ min: 2, max: 50 }).withMessage("Color description must be between 2-50 characters")
    .matches(/^[a-zA-Z\s\-]+$/).withMessage("Color should only contain letters, spaces, and hyphens")
    .trim(),
  
  // Origin validation
  body("origin")
    .optional()
    .isLength({ min: 2, max: 50 }).withMessage("Origin must be between 2-50 characters")
    .trim(),
  
  // Custom validation for file uploads (handled in controller)
  body("imageCount")
    .optional()
    .custom((value, { req }) => {
      if (req.files && req.files.length > 10) {
        throw new Error("Maximum 10 images allowed");
      }
      return true;
    })
];

export const validateUpdateGemstone = [
  body("name")
    .optional()
    .isLength({ min: 2, max: 100 }).withMessage("Name must be between 2-100 characters")
    .matches(/^[a-zA-Z\s\-\.']+$/).withMessage("Name allows letters, spaces, hyphens, periods and apostrophes only")
    .trim(),
  
  body("description")
    .optional()
    .isLength({ min: 10, max: 1000 }).withMessage("Description must be between 10-1000 characters")
    .trim(),
  
  body("category")
    .optional()
    .isIn([
      "Diamond","Ruby","Sapphire","Emerald","Topaz","Garnet",
      "Amethyst","Citrine","Aquamarine","Tourmaline","Moonstone",
      "Peridot","Opal","Pearl","Other"
    ]).withMessage("Please select a valid category"),
  
  body("minimumBid")
    .optional()
    .isFloat({ min: 1 }).withMessage("Minimum bid must be at least 1 LKR")
    .toFloat(),
  
  body("weight")
    .optional()
    .isFloat({ min: 0.01, max: 10000 }).withMessage("Weight must be between 0.01 and 10,000 carats")
    .toFloat(),
  
  body("color")
    .optional()
    .isLength({ min: 2, max: 50 }).withMessage("Color description must be between 2-50 characters")
    .trim()
];

/* ---------------------- HELPER FUNCTIONS ---------------------- */
const formatValidationErrors = (errors) => {
  return errors.array().map(error => ({
    field: error.path || error.param,
    message: error.msg,
    value: error.value,
    location: error.location
  }));
};

const cleanupFiles = async (files) => {
  if (files && Array.isArray(files)) {
    await Promise.all(files.map(file => 
      fs.unlink(file.path).catch(err => 
        console.error(`Failed to delete file ${file.path}:`, err)
      )
    ));
  }
};

const processImages = (files, gemstroneName) => {
  if (!files || !Array.isArray(files)) return [];
  
  return files.map((file, index) => ({
    url: file.path,
    alt: `${gemstroneName} - Image ${index + 1}`,
    isPrimary: index === 0, // First image is primary
    uploadedAt: new Date()
  }));
};

/* ---------------------- CREATE GEMSTONE ---------------------- */
export async function createGemstone(req, res) {
  try {
    // 1. Enhanced validation
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      await cleanupFiles(req.files);
      return res.status(400).json({ 
        success: false,
        message: "Validation failed", 
        errors: formatValidationErrors(errors),
        totalErrors: errors.array().length
      });
    }

    // 2. Authorization check
    if (!req.user || req.user.role !== "seller") {
      await cleanupFiles(req.files);
      return res.status(403).json({ 
        success: false,
        message: "Only sellers can create listings" 
      });
    }

    // 3. Image validation
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: "At least one image is required for gemstone listing"
      });
    }

    if (req.files.length > 5) {
      await cleanupFiles(req.files);
      return res.status(400).json({
        success: false,
        message: "Maximum 5 images allowed per listing"
      });
    }

    // 4. Extract and process data
    const { name, description, category, minimumBid, origin, color, weight } = req.body;
    const images = processImages(req.files, name);

    // 5. Create gemstone with enhanced data structure
    const gemstone = new Gemstone({
      name: name.trim(),
      description: description.trim(),
      category,
      images,
      minimumBid: parseFloat(minimumBid),
      origin: origin ? origin.trim() : undefined,
      color: color ? color.trim() : undefined,
      weight: weight ? parseFloat(weight) : undefined,
      sellerId: req.user.id,
      sellerInfo: { 
        name: req.user.name, 
        email: req.user.email, 
        phone: req.user.phone 
      },
      verificationStatus: "draft",
      isActive: true
    });

    await gemstone.save();

    // 6. Enhanced response
    res.status(201).json({ 
      success: true,
      message: "Gemstone created successfully", 
      data: {
        gemstone: {
          id: gemstone._id,
          name: gemstone.name,
          category: gemstone.category,
          minimumBid: gemstone.minimumBid,
          verificationStatus: gemstone.verificationStatus,
          imageCount: images.length,
          createdAt: gemstone.createdAt
        },
        nextSteps: [
          "Review your listing details",
          "Submit for verification when ready",
          "Wait for admin approval"
        ]
      }
    });

  } catch (err) {
    console.error("Create gemstone error:", err);
    await cleanupFiles(req.files);
    
    // Enhanced error handling
    if (err.name === 'ValidationError') {
      const validationErrors = Object.keys(err.errors).map(key => ({
        field: key,
        message: err.errors[key].message
      }));
      
      return res.status(400).json({
        success: false,
        message: "Database validation failed",
        errors: validationErrors
      });
    }
    
    res.status(500).json({ 
      success: false,
      message: "Error creating gemstone", 
      error: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
    });
  }
}

/* ---------------------- GET ALL GEMSTONES ---------------------- */
export async function getGemstones(req, res) {
  try {
    // 1. Enhanced pagination with validation
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(Math.max(1, parseInt(req.query.limit) || 10), 50); // Max 50 per page
    const skip = (page - 1) * limit;

    // 2. Enhanced query building
    let query = { isActive: true }; // Fixed: was checking 'status' field

    // Category filter
    if (req.query.category && req.query.category !== 'all') {
      query.category = req.query.category;
    }

    // Enhanced price range filter with validation
    if (req.query.minPrice || req.query.maxPrice) {
      query.minimumBid = {};
      if (req.query.minPrice) {
        const minPrice = parseFloat(req.query.minPrice);
        if (!isNaN(minPrice) && minPrice >= 0) {
          query.minimumBid.$gte = minPrice;
        }
      }
      if (req.query.maxPrice) {
        const maxPrice = parseFloat(req.query.maxPrice);
        if (!isNaN(maxPrice) && maxPrice >= 0) {
          query.minimumBid.$lte = maxPrice;
        }
      }
    }

    // Weight filter
    if (req.query.minWeight || req.query.maxWeight) {
      query.weight = {};
      if (req.query.minWeight) {
        const minWeight = parseFloat(req.query.minWeight);
        if (!isNaN(minWeight) && minWeight >= 0) {
          query.weight.$gte = minWeight;
        }
      }
      if (req.query.maxWeight) {
        const maxWeight = parseFloat(req.query.maxWeight);
        if (!isNaN(maxWeight) && maxWeight >= 0) {
          query.weight.$lte = maxWeight;
        }
      }
    }

    // Color filter
    if (req.query.color) {
      query.color = { $regex: req.query.color, $options: 'i' };
    }

    // Search functionality
    if (req.query.search) {
      query.$or = [
        { name: { $regex: req.query.search, $options: 'i' } },
        { description: { $regex: req.query.search, $options: 'i' } },
        { color: { $regex: req.query.search, $options: 'i' } }
      ];
    }

    // 3. Role-based filtering
    if (req.user?.role === "buyer" || !req.user) {
      query.verificationStatus = "verified";
    } else if (req.user?.role === "seller") {
      query.sellerId = req.user.id;
    }

    // 4. Enhanced sorting
    const validSortFields = ['createdAt', 'minimumBid', 'weight', 'name'];
    const sortBy = validSortFields.includes(req.query.sortBy) ? req.query.sortBy : 'createdAt';
    const sortOrder = req.query.sortOrder === 'asc' ? 1 : -1;
    const sortQuery = { [sortBy]: sortOrder };

    // 5. Execute queries with enhanced data selection
    const [gemstones, total] = await Promise.all([
      Gemstone.find(query)
        .sort(sortQuery)
        .skip(skip)
        .limit(limit)
        .select(req.user?.role === 'admin' ? {} : '-documentValidation -sellerInfo.phone'),
      Gemstone.countDocuments(query)
    ]);

    // 6. Calculate enhanced pagination
    const totalPages = Math.ceil(total / limit);

    // 7. Get filter statistics
    const stats = await Gemstone.aggregate([
      { $match: query },
      {
        $group: {
          _id: null,
          avgPrice: { $avg: "$minimumBid" },
          minPrice: { $min: "$minimumBid" },
          maxPrice: { $max: "$minimumBid" },
          totalListings: { $sum: 1 }
        }
      }
    ]);

    // 8. Enhanced response
    res.status(200).json({
      success: true,
      data: {
        gemstones,
        pagination: {
          currentPage: page,
          limit,
          total,
          totalPages,
          hasNext: page < totalPages,
          hasPrev: page > 1,
          nextPage: page < totalPages ? page + 1 : null,
          prevPage: page > 1 ? page - 1 : null
        },
        statistics: stats[0] || {
          avgPrice: 0,
          minPrice: 0,
          maxPrice: 0,
          totalListings: 0
        },
        filters: {
          applied: {
            category: req.query.category || null,
            search: req.query.search || null,
            priceRange: {
              min: req.query.minPrice || null,
              max: req.query.maxPrice || null
            },
            weightRange: {
              min: req.query.minWeight || null,
              max: req.query.maxWeight || null
            },
            color: req.query.color || null
          },
          available: {
            categories: ["Diamond","Ruby","Sapphire","Emerald","Topaz","Garnet","Amethyst","Citrine","Aquamarine","Tourmaline","Moonstone","Peridot","Opal","Pearl","Other"]
          }
        },
        sorting: {
          sortBy,
          sortOrder: sortOrder === 1 ? 'asc' : 'desc'
        }
      }
    });

  } catch (err) {
    console.error("Get gemstones error:", err);
    res.status(500).json({ 
      success: false,
      message: "Error fetching gemstones", 
      error: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
    });
  }
}

/* ---------------------- GET SINGLE GEMSTONE ---------------------- */
export async function getGemstone(req, res) {
  try {
    // 1. Validate ID format
    const gemstoneId = req.params.id;
    if (!gemstoneId.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        success: false,
        message: "Invalid gemstone ID format"
      });
    }

    // 2. Find gemstone
    const gemstone = await Gemstone.findById(gemstoneId);
    if (!gemstone) {
      return res.status(404).json({ 
        success: false,
        message: "Gemstone not found" 
      });
    }

    // 3. Enhanced access control
    if ((req.user?.role === "buyer" || !req.user) && 
        (!gemstone.isActive || gemstone.verificationStatus !== "verified")) {
      return res.status(403).json({ 
        success: false,
        message: "This gemstone listing is not available for viewing" 
      });
    }

    if (req.user?.role === "seller" && gemstone.sellerId.toString() !== req.user.id) {
      return res.status(403).json({ 
        success: false,
        message: "You can only view your own gemstone listings" 
      });
    }

    // 4. Get related gemstones
    const relatedGemstones = await Gemstone.find({
      category: gemstone.category,
      _id: { $ne: gemstone._id },
      verificationStatus: "verified",
      isActive: true
    })
    .limit(4)
    .select('name images minimumBid category')
    .sort({ createdAt: -1 });

    // 5. Prepare response data
    const gemstoneData = gemstone.toObject();
    if (req.user?.role !== 'admin') {
      delete gemstoneData.documentValidation;
      if (req.user?.role !== 'seller' || gemstone.sellerId.toString() !== req.user.id) {
        delete gemstoneData.sellerInfo?.phone;
      }
    }

    // 6. Enhanced response
    res.status(200).json({
      success: true,
      data: {
        gemstone: gemstoneData,
        related: relatedGemstones,
        permissions: {
          canEdit: req.user?.role === 'admin' || 
                   (req.user?.role === 'seller' && gemstone.sellerId.toString() === req.user.id),
          canDelete: req.user?.role === 'admin' || 
                    (req.user?.role === 'seller' && gemstone.sellerId.toString() === req.user.id),
          canVerify: req.user?.role === 'admin',
          canBid: req.user?.role === 'buyer' && gemstone.verificationStatus === 'verified'
        }
      }
    });

  } catch (err) {
    console.error("Get gemstone error:", err);
    res.status(500).json({ 
      success: false,
      message: "Error fetching gemstone", 
      error: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
    });
  }
}

/* ---------------------- UPDATE GEMSTONE ---------------------- */
export async function updateGemstone(req, res) {
  try {
    // 1. Enhanced validation
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      await cleanupFiles(req.files);
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: formatValidationErrors(errors)
      });
    }

    // 2. Find gemstone
    const gemstone = await Gemstone.findById(req.params.id);
    if (!gemstone) {
      await cleanupFiles(req.files);
      return res.status(404).json({ 
        success: false,
        message: "Gemstone not found" 
      });
    }

    // 3. Authorization check
    if (req.user?.role !== "admin" && gemstone.sellerId.toString() !== req.user.id) {
      await cleanupFiles(req.files);
      return res.status(403).json({ 
        success: false,
        message: "Not authorized to update this gemstone" 
      });
    }

    // 4. Store original data for comparison
    const originalStatus = gemstone.verificationStatus;
    const originalImages = [...gemstone.images];

    // 5. Enhanced field updates with validation
    const updateableFields = ["name", "description", "category", "minimumBid", "origin", "color", "weight"];
    let hasContentChanges = false;

    updateableFields.forEach(field => {
      if (req.body[field] !== undefined && req.body[field] !== gemstone[field]) {
        if (field === 'name' || field === 'description' || field === 'color' || field === 'origin') {
          gemstone[field] = req.body[field].trim();
        } else {
          gemstone[field] = req.body[field];
        }
        hasContentChanges = true;
      }
    });

    // 6. Enhanced image handling
    if (req.files && req.files.length > 0) {
      if (req.files.length > 5) {
        await cleanupFiles(req.files);
        return res.status(400).json({
          success: false,
          message: "Maximum 5 images allowed"
        });
      }

      const newImages = processImages(req.files, gemstone.name);
      
      if (req.body.replaceImages === 'true') {
        // Clean up old images
        await Promise.all(originalImages.map(img => 
          fs.unlink(img.url).catch(err => 
            console.error(`Failed to delete old image ${img.url}:`, err)
          )
        ));
        gemstone.images = newImages;
        gemstone.images[0].isPrimary = true;
      } else {
        // Add new images
        gemstone.images.push(...newImages);
      }
      hasContentChanges = true;
    }

    // 7. Update verification status logic
    let statusMessage = "Gemstone updated successfully";
    if (hasContentChanges && req.user.role !== 'admin' && originalStatus === 'verified') {
      gemstone.verificationStatus = "submitted";
      statusMessage += ". Your listing will be reviewed again due to content changes.";
    } else if (req.user.role !== 'admin') {
      gemstone.verificationStatus = "submitted";
    }

    // 8. Save changes
    await gemstone.save();

    // 9. Enhanced response
    res.status(200).json({ 
      success: true,
      message: statusMessage, 
      data: {
        gemstone: {
          id: gemstone._id,
          name: gemstone.name,
          category: gemstone.category,
          verificationStatus: gemstone.verificationStatus,
          updatedAt: gemstone.updatedAt
        },
        changes: {
          contentModified: hasContentChanges,
          statusChanged: gemstone.verificationStatus !== originalStatus,
          requiresReVerification: gemstone.verificationStatus === "submitted"
        }
      }
    });

  } catch (err) {
    console.error("Update gemstone error:", err);
    await cleanupFiles(req.files);
    
    if (err.name === 'ValidationError') {
      const validationErrors = Object.keys(err.errors).map(key => ({
        field: key,
        message: err.errors[key].message
      }));
      
      return res.status(400).json({
        success: false,
        message: "Database validation failed",
        errors: validationErrors
      });
    }
    
    res.status(500).json({ 
      success: false,
      message: "Error updating gemstone", 
      error: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
    });
  }
}

/* ---------------------- DELETE GEMSTONE ---------------------- */
export async function deleteGemstone(req, res) {
  try {
    // 1. Find gemstone
    const gemstone = await Gemstone.findById(req.params.id);
    if (!gemstone) {
      return res.status(404).json({ 
        success: false,
        message: "Gemstone not found" 
      });
    }

    // 2. Authorization check
    if (req.user?.role !== "admin" && gemstone.sellerId.toString() !== req.user.id) {
      return res.status(403).json({ 
        success: false,
        message: "Not authorized to delete this gemstone" 
      });
    }

    // 3. Enhanced deletion logic
    const isPermanent = req.query.permanent === 'true' && req.user?.role === 'admin';

    if (isPermanent) {
      // Permanent deletion (admin only)
      await Promise.all(gemstone.images.map(img => 
        fs.unlink(img.url).catch(err => 
          console.error(`Failed to delete image ${img.url}:`, err)
        )
      ));

      await Gemstone.findByIdAndDelete(req.params.id);
      
      res.status(200).json({
        success: true,
        message: "Gemstone permanently deleted",
        data: { deletionType: 'permanent' }
      });
    } else {
      // Soft deletion
      gemstone.isActive = false;
      await gemstone.save();

      res.status(200).json({
        success: true,
        message: "Gemstone soft-deleted successfully",
        data: { 
          deletionType: 'soft',
          canRestore: req.user?.role === 'admin'
        }
      });
    }

  } catch (err) {
    console.error("Delete gemstone error:", err);
    res.status(500).json({ 
      success: false,
      message: "Error deleting gemstone", 
      error: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
    });
  }
}

/* ---------------------- BULK OPERATIONS (NEW FEATURE) ---------------------- */
export async function bulkUpdateGemstones(req, res) {
  try {
    if (req.user?.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Only admins can perform bulk operations"
      });
    }

    const { gemstoneIds, updateData } = req.body;

    if (!Array.isArray(gemstoneIds) || gemstoneIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Gemstone IDs array is required"
      });
    }

    const result = await Gemstone.updateMany(
      { _id: { $in: gemstoneIds } },
      { $set: updateData },
      { runValidators: true }
    );

    res.status(200).json({
      success: true,
      message: `Updated ${result.modifiedCount} gemstones`,
      data: {
        matchedCount: result.matchedCount,
        modifiedCount: result.modifiedCount
      }
    });

  } catch (err) {
    console.error("Bulk update error:", err);
    res.status(500).json({
      success: false,
      message: "Error performing bulk update",
      error: err.message
    });
  }
}

/* ---------------------- ADMIN VERIFY/REJECT  ---------------------- */
export async function verifyGemstone(req, res) {
  try {
    if (req.user?.role !== "admin") {
      return res.status(403).json({ 
        success: false,
        message: "Only admins can verify listings" 
      });
    }

    const gemstone = await Gemstone.findById(req.params.id);
    if (!gemstone) {
      return res.status(404).json({ 
        success: false,
        message: "Gemstone not found" 
      });
    }

    const { verificationNotes } = req.body;

    gemstone.verificationStatus = "verified";
    gemstone.verifiedAt = new Date();
    gemstone.verifiedBy = req.user.id;

    if (verificationNotes) {
      gemstone.documentValidation = gemstone.documentValidation || {};
      gemstone.documentValidation.validationNotes = verificationNotes;
      gemstone.documentValidation.validatedAt = new Date();
    }

    await gemstone.save();

    res.status(200).json({ 
      success: true,
      message: "Gemstone verified successfully", 
      data: {
        gemstone: {
          id: gemstone._id,
          name: gemstone.name,
          verificationStatus: gemstone.verificationStatus,
          verifiedAt: gemstone.verifiedAt
        }
      }
    });

  } catch (err) {
    console.error("Verify gemstone error:", err);
    res.status(500).json({ 
      success: false,
      message: "Error verifying gemstone", 
      error: err.message 
    });
  }
}

export async function rejectGemstone(req, res) {
  try {
    if (req.user?.role !== "admin") {
      return res.status(403).json({ 
        success: false,
        message: "Only admins can reject listings" 
      });
    }

    const { rejectionReason, suggestions } = req.body;
    
    if (!rejectionReason) {
      return res.status(400).json({ 
        success: false,
        message: "Rejection reason is required" 
      });
    }

    const gemstone = await Gemstone.findById(req.params.id);
    if (!gemstone) {
      return res.status(404).json({ 
        success: false,
        message: "Gemstone not found" 
      });
    }

    gemstone.verificationStatus = "rejected";
    gemstone.rejectionReason = rejectionReason;
    gemstone.rejectedAt = new Date();
    gemstone.rejectedBy = req.user.id;

    if (suggestions) {
      gemstone.documentValidation = gemstone.documentValidation || {};
      gemstone.documentValidation.validationNotes = suggestions;
      gemstone.documentValidation.validatedAt = new Date();
    }

    await gemstone.save();

    res.status(200).json({ 
      success: true,
      message: "Gemstone rejected successfully", 
      data: {
        gemstone: {
          id: gemstone._id,
          name: gemstone.name,
          verificationStatus: gemstone.verificationStatus,
          rejectionReason: gemstone.rejectionReason,
          rejectedAt: gemstone.rejectedAt
        },
        canResubmit: true
      }
    });

  } catch (err) {
    console.error("Reject gemstone error:", err);
    res.status(500).json({ 
      success: false,
      message: "Error rejecting gemstone", 
      error: err.message 
    });
  }
}