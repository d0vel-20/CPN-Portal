import { timeStamp } from 'console';
import mongoose, { Schema, Document, Types } from 'mongoose';

// Define the interface for the Admin document
export interface IPaymentplan extends Document {
  _id: Types.ObjectId;
  user_id: Types.ObjectId;
  amount: number;
  course_id: Types.ObjectId;
  installments: number;
  estimate: number;
  last_payment_date: string;
  next_payment_date: string;
  reg_date: string;

}


const PaymentplanSchema: Schema = new Schema({
  user_id: {
    type: String,
    required: true,
    ref: ''
  },
  amount: {
    type: Number,
    required: true,
  },
  course_id: {
    type: String,
    required: true,
    ref: 'Course'
  },
  installments: {
    type: Number,
    required: true,
    ref: ''
  },
  estimate: {
    type: Number,
    required: true,
  },
  last_payment_date: {
    type: String,
    required: true,
  },
  next_payment_date: {
    type: String,
    required: true,
  },
  reg_date:{
    type:String,
    required: true,
  }
  
},
{timestamps: true}
);


const Paymentplan = mongoose.model<IPaymentplan>('Paymentplan', PaymentplanSchema);
export default Paymentplan;