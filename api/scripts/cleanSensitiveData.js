import mongoose from 'mongoose';
import dotenv from 'dotenv';
import OnlinePayment from '../models/onlinepaymentModel.js';

// Load environment variables
dotenv.config();

const cleanSensitiveData = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/ikmangems');
    console.log('Connected to MongoDB');

    // Remove sensitive fields from all online payment documents
    const result = await OnlinePayment.updateMany(
      {}, // Match all documents
      {
        $unset: {
          cardNumber: 1,
          expiryMonth: 1,
          expiryYear: 1,
          cardHolderName: 1,
          cvvNumber: 1
        }
      }
    );

    console.log(`✅ Cleaned sensitive data from ${result.modifiedCount} online payment records`);
    console.log('🔒 Sensitive fields removed: cardNumber, expiryMonth, expiryYear, cardHolderName, cvvNumber');
    console.log('✅ Only safe data remains: cardType, amount, user details, transaction info');

  } catch (error) {
    console.error('❌ Error cleaning sensitive data:', error);
  } finally {
    // Close connection
    await mongoose.connection.close();
    console.log('📡 Database connection closed');
    process.exit(0);
  }
};

// Run the cleanup
cleanSensitiveData();
