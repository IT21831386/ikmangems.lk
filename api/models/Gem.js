import { Schema, model } from "mongoose";

const gemstoneSchema = new Schema(
  {
    
    name: {
      type: String,
      required: [true, "Gemstone name is required"],
      trim: true,
      minlength: [2, "Name must be at least 2 characters"],
      maxlength: [100, "Name cannot exceed 100 characters"],
      index: true, 
    },

    description: {
      type: String,
      required: [true, "Description is required"],
      trim: true,
      minlength: [10, "Description must be at least 10 characters"],
      maxlength: [1000, "Description cannot exceed 1000 characters"],
    },

    category: {
      type: String,
      required: [true, "Category is required"],
      enum: {
        values: ["Diamond", "Ruby", "Sapphire", "Emerald", "Topaz", "Garnet", "Amethyst", 
          "Citrine", "Aquamarine","Tourmaline", "Moonstone", "Peridot", "Opal", "Pearl", "Other",
        ],
        message: "Please select a valid category",
      },
      index: true,
    },

    weight: {
      type: Number,
      min: [0.01, "Weight must be at least 0.01 carats"],
      max: [10000, "Weight cannot exceed 10,000 carats"],
      validate: {
        validator: function (value) {
          return value > 0;
        },
        message: "Weight must be a positive number",
      },
    },

    weightUnit: {
      type: String,
      default: "carats",
      enum: ["carats", "grams"],
    },

    dimensions: {
      length: {
        type: Number,
        min: [0, "Length cannot be negative"],
        max: [1000, "Length seems unrealistic"],
      },
      width: {
        type: Number,
        min: [0, "Width cannot be negative"],
        max: [1000, "Width seems unrealistic"],
      },
      height: {
        type: Number,
        min: [0, "Height cannot be negative"],
        max: [1000, "Height seems unrealistic"],
      },
      unit: {
        type: String,
        default: "mm",
        enum: ["mm", "cm"],
      },
    },

    color: {
      type: String,
      trim: true,
      maxlength: [50, "Color description cannot exceed 50 characters"],
      validate: {
        validator: function (value) {
          return !value || /^[a-zA-Z\s\-]+$/.test(value);
        },
        message: "Color should only contain letters, spaces, and hyphens",
      },
    },

    clarity: {
      type: String,
      enum: {
        values: [
          "FL", "IF", "VVS1", "VVS2", "VS1", "VS2",
          "SI1", "SI2", "I1","I2", "I3", "Not Graded",
        ],
        message: "Please select a valid clarity grade",
      },
    },

    cut: {
      type: String,
      enum: {
        values: [
          "Round", "Princess", "Cushion", "Emerald", "Oval", "Radiant", "Asscher",
          "Marquise", "Heart", "Pear", "Cabochon", "Raw/Rough", "Other",
        ],
        message: "Please select a valid cut type",
      },
    },

    origin: {
      country: {
        type: String,
        trim: true,
        maxlength: [50, "Country name cannot exceed 50 characters"],
        validate: {
          validator: function (value) {
            return !value || /^[a-zA-Z\s\-]+$/.test(value);
          },
          message:
            "Country name should only contain letters, spaces, and hyphens",
        },
      },
      region: {
        type: String,
        trim: true,
        maxlength: [100, "Region name cannot exceed 100 characters"],
      },
      mine: {
        type: String,
        trim: true,
        maxlength: [100, "Mine name cannot exceed 100 characters"],
      },
      yearMined: {
        type: Number,
        min: [1800, "Year mined cannot be before 1800"],
        max: [new Date().getFullYear(), `Year mined cannot be in the future`],
        validate: {
          validator: function (value) {
            return !value || (Number.isInteger(value) && value > 0);
          },
          message: "Year mined must be a valid year",
        },
      },
    },

    images: [
      {
        url: {
          type: String,
          required: [true, "Image URL is required"],
        },
        alt: {
          type: String,
          default: function () {
            return `${this.parent().name} - Gemstone Image`;
          },
        },
        isPrimary: {
          type: Boolean,
          default: false,
        },
        uploadedAt: {
          type: Date,
          default: Date.now,
        },
        fileSize: Number,
        mimeType: String,
      },
    ],

    certificateDetails: {
      hasCertificate: {
        type: Boolean,
        default: false,
      },
      certificateNumber: {
        type: String,
        trim: true,
        maxlength: [50, "Certificate number cannot exceed 50 characters"],
        validate: {
          validator: function (value) {
            if (this.certificateDetails?.hasCertificate && !value) {
              return false;
            }
            return true;
          },
          message:
            "Certificate number is required when certificate is available",
        },
      },
      certifyingBody: {
        type: String,
        enum: {
          values: [
            "GIA", "AIGS", "Gubelin", "SSEF", "GRS", "Lotus", "EGL", "AGS", "Other", "None",
          ],
          message: "Please select a valid certifying body",
        },
        default: "None",
      },
      certificateImage: String,
      issueDate: {
        type: Date,
        validate: {
          validator: function (value) {
            return !value || value <= new Date();
          },
          message: "Certificate issue date cannot be in the future",
        },
      },
      expiryDate: {
        type: Date,
        validate: {
          validator: function (value) {
            if (this.certificateDetails?.issueDate && value) {
              return value > this.certificateDetails.issueDate;
            }
            return true;
          },
          message: "Certificate expiry date must be after issue date",
        },
      },
    },

    minimumBid: {
      type: Number,
      required: [true, "Minimum bid is required"],
      min: [1, "Minimum bid must be at least 1 LKR"],
      max: [100000000, "Minimum bid seems unrealistic"],
      index: true, 
    },

    reservePrice: {
      type: Number,
      min: [0, "Reserve price cannot be negative"],
      validate: {
        validator: function (value) {
          return !value || value >= this.minimumBid;
        },
        message: "Reserve price cannot be less than minimum bid",
      },
    },

    currency: {
      type: String,
      default: "LKR",
      enum: ["LKR", "USD"],
    },

    // Seller Information
    sellerId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Seller ID is required"],
      index: true,
    },

    sellerInfo: {
      name: {
        type: String,
        required: [true, "Seller name is required"],
        trim: true,
      },
      email: {
        type: String,
        required: [true, "Seller email is required"],
        trim: true,
        lowercase: true,
        validate: {
          validator: function (value) {
            return /^\S+@\S+\.\S+$/.test(value);
          },
          message: "Please provide a valid email address",
        },
      },
      phone: {
        type: String,
        trim: true,
        validate: {
          validator: function (value) {
            return !value || /^[\d\+\-\(\)\s]+$/.test(value);
          },
          message: "Please provide a valid phone number",
        },
      },
    },

    verificationStatus: {
      type: String,
      enum: {
        values: ["draft", "submitted", "under_review", "verified", "rejected"],
        message: "Invalid verification status",
      },
      default: "draft",
      index: true,
    },

    rejectionReason: {
      type: String,
      maxlength: [500, "Rejection reason cannot exceed 500 characters"],
    },

    verifiedAt: Date,
    verifiedBy: { type: Schema.Types.ObjectId, ref: "User" },
    rejectedAt: Date,
    rejectedBy: { type: Schema.Types.ObjectId, ref: "User" },

    documentValidation: {
      certificateVerified: { type: Boolean, default: false },
      documentsUploaded: [String],
      validationNotes: {
        type: String,
        maxlength: [1000, "Validation notes cannot exceed 1000 characters"],
      },
      validatedAt: Date,
      validatedBy: { type: Schema.Types.ObjectId, ref: "User" },
      autoValidationScore: {
        type: Number,
        min: 0,
        max: 1,
        default: 0,
      },
    },

    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },

    views: {
      type: Number,
      default: 0,
      min: 0,
    },

    featured: {
      type: Boolean,
      default: false,
      index: true,
    },

    tags: [
      {
        type: String,
        trim: true,
        maxlength: [30, "Tag cannot exceed 30 characters"],
      },
    ],
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

/* ====================== INDEXES FOR PERFORMANCE ====================== */
gemstoneSchema.index({
  category: 1,
  sellerId: 1,
  verificationStatus: 1,
  minimumBid: 1,
  isActive: 1,
});

gemstoneSchema.index(
  {
    name: "text",
    description: "text",
    color: "text",
  },
  {
    weights: { name: 10, description: 5, color: 1 },
  }
);

gemstoneSchema.index({ createdAt: -1 });
gemstoneSchema.index({ minimumBid: 1, weight: 1 });

/* ====================== VIRTUAL FIELDS ====================== */
gemstoneSchema.virtual("primaryImage").get(function () {
  const primary = this.images.find((img) => img.isPrimary);
  return primary
    ? primary.url
    : this.images.length > 0
    ? this.images[0].url
    : null;
});

gemstoneSchema.virtual("totalImages").get(function () {
  return this.images.length;
});

gemstoneSchema.virtual("priceRange").get(function () {
  if (this.reservePrice && this.reservePrice > this.minimumBid) {
    return `${this.minimumBid} - ${this.reservePrice} ${this.currency}`;
  }
  return `${this.minimumBid}+ ${this.currency}`;
});

/* ====================== INSTANCE METHODS ====================== */
gemstoneSchema.methods.updateVerificationStatus = function (
  status,
  notes = "",
  adminId = null
) {
  this.verificationStatus = status;
  this.documentValidation.validationNotes = notes;
  this.documentValidation.validatedAt = new Date();

  if (adminId) {
    this.documentValidation.validatedBy = adminId;
  }

  if (status === "verified") {
    this.verifiedAt = new Date();
    this.verifiedBy = adminId;
  } else if (status === "rejected") {
    this.rejectedAt = new Date();
    this.rejectedBy = adminId;
  }

  return this.save();
};

gemstoneSchema.methods.incrementViews = function () {
  this.views += 1;
  return this.save();
};

gemstoneSchema.methods.setPrimaryImage = function (imageIndex) {
  this.images.forEach((img, index) => {
    img.isPrimary = index === imageIndex;
  });
  return this.save();
};

/* ====================== STATIC METHODS ====================== */
gemstoneSchema.statics.findByCategory = function (category, limit = 50) {
  return this.find({
    category,
    verificationStatus: "verified",
    isActive: true,
  })
    .populate("sellerId", "name email")
    .limit(limit)
    .sort({ createdAt: -1 });
};

gemstoneSchema.statics.findInPriceRange = function (
  minPrice,
  maxPrice,
  limit = 50
) {
  return this.find({
    minimumBid: { $gte: minPrice, $lte: maxPrice },
    verificationStatus: "verified",
    isActive: true,
  })
    .populate("sellerId", "name email")
    .limit(limit)
    .sort({ minimumBid: 1 });
};

gemstoneSchema.statics.searchGemstones = function (searchTerm, limit = 50) {
  return this.find(
    {
      $text: { $search: searchTerm },
      verificationStatus: "verified",
      isActive: true,
    },
    {
      score: { $meta: "textScore" },
    }
  )
    .sort({ score: { $meta: "textScore" } })
    .limit(limit);
};

gemstoneSchema.statics.getStatistics = function () {
  return this.aggregate([
    {
      $group: {
        _id: null,
        totalGemstones: { $sum: 1 },
        verified: {
          $sum: { $cond: [{ $eq: ["$verificationStatus", "verified"] }, 1, 0] },
        },
        pending: {
          $sum: {
            $cond: [{ $eq: ["$verificationStatus", "submitted"] }, 1, 0],
          },
        },
        avgPrice: { $avg: "$minimumBid" },
        categories: { $addToSet: "$category" },
      },
    },
  ]);
};

/* ====================== MIDDLEWARE ====================== */
gemstoneSchema.pre("save", function (next) {
  if (this.images.length > 0 && !this.images.some((img) => img.isPrimary)) {
    this.images[0].isPrimary = true;
  }

  if (
    this.isModified("name") ||
    this.isModified("color") ||
    this.isModified("category")
  ) {
    this.tags = [
      this.category?.toLowerCase(),
      this.color?.toLowerCase(),
      ...this.name.toLowerCase().split(" "),
    ].filter(Boolean);
  }

  next();
});

gemstoneSchema.pre("remove", async function (next) {
  console.log(`Cleaning up files for gemstone: ${this.name}`);
  next();
});

export default model("Gemstone", gemstoneSchema);
