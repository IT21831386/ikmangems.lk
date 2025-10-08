import mongoose from 'mongoose';

const ticketSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  subject: { type: String, required: true },
  inquiryType: {
    type: String,
    required: true,
    enum: ['general', 'seller', 'buyer', 'verification', 'support', 'auction', 'payment']
  },
  description: { type: String, required: true },
  attachment: { type: String }, // optional
  // status fields used by admin flows and UI badges
  status: { type: String, enum: ['open', 'in_progress', 'resolved', 'closed', 'pending'], default: 'open' },
  createdByAdmin: { type: Boolean, default: false },
  responses: [
    {
      sender: { type: String, enum: ['user', 'admin'], required: true },
      message: { type: String, required: true },
      attachment: { type: String },
      editedAt: { type: Date }
    }
  ]
}, {
  timestamps: true
});

const Ticket = mongoose.model('Ticket', ticketSchema);
export default Ticket;