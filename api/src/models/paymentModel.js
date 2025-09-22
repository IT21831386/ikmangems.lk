import mongoose from "mongoose";

// 1st step: You need to create a schema
// 2nd step: You would create a model based off of that schema

const paymentSchema = new mongoose.Schema({
    amount:{
        type:Number,
        required:true,
     },
     paiddate:{
        type:Date,
        required:true,
    },
    bank:{
        type:String,
        required:true,
    },
     branch:{
        type:String,
        required:true,
    },
     slip:{
        type:String, // Store the image URL/path
        required:true,
    },
     remark:{
        type:String,
        //required:true,
    },
    fullName:{
        type:String,
        required:true,
    },
    emailAddress:{
        type:String,
        required:true,
    },
    contactNumber:{
        type:String,
        required:true,
    },
    billingAddress:{
        type:String,
        required:true,
    },
    auctionId:{
        type:String,
        required:true,
    },
    status:{
        type:String,
        enum: ['pending', 'success', 'failure'],
        default: 'pending',
    }
  },
  { timestamps: true } // createdAt, updatedAt
);

const Payment = mongoose.model("Payment", paymentSchema);

export default Payment;