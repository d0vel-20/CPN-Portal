import { timeStamp } from 'console';
import mongoose, { Schema, Document, Types } from 'mongoose';

// Define the interface for the Admin document
export interface IPayment extends Document {
  _id: Types.ObjectId;
  user_id: Types.ObjectId;
  amount: number;
  payment_plan_id: Types.ObjectId;
  message: string,
  disclaimer: string,
  payment_date: string,

}


const PaymentSchema: Schema = new Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'Student'
  },
  amount: {
    type: Number,
    required: true,
  },
  payment_plan_id: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'Paymentplan'
  },
  message: {
    type: String,
    default: '',
  },
  disclaimer: {
    type: String,
    default: '',
  },
  payment_date: {
    type: String,
    required: true,
  },
},
{timestamps: true}
);


const Payment = mongoose.model<IPayment>('Payment', PaymentSchema);
export default Payment;