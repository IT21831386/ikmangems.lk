import mongoose from 'mongoose';

const faqSchema = new mongoose.Schema({
  question: {
    type: String,
    required: [true, 'Question is required'],
    trim: true,
    maxlength: [500, 'Question cannot exceed 500 characters']
  },
  answer: {
    type: String,
    required: [true, 'Answer is required'],
    trim: true,
    maxlength: [2000, 'Answer cannot exceed 2000 characters']
  },
  category: {
    type: String,
    enum: ['general', 'seller', 'buyer', 'auction', 'payment', 'verification', 'support'],
    default: 'general'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  priority: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  tags: [{
    type: String,
    trim: true
  }],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false
  },
  lastModifiedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});


// Virtual for formatted creation date
faqSchema.virtual('createdAtFormatted').get(function() {
  return this.createdAt.toLocaleDateString();
});

// Virtual for formatted update date
faqSchema.virtual('updatedAtFormatted').get(function() {
  return this.updatedAt.toLocaleDateString();
});

// Ensure virtual fields are serialized
faqSchema.set('toJSON', { virtuals: true });
faqSchema.set('toObject', { virtuals: true });

export default mongoose.model('FAQ', faqSchema);
