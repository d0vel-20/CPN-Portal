import { timeStamp } from 'console';
import mongoose, { Schema, Document, Types } from 'mongoose';


// Define interface
export interface IStudent extends Document {
    _id: Types.ObjectId;
    fullname: string;
    email: string;
    phone: number;
    centerId: mongoose.Schema.Types.ObjectId;
    courses: Types.Array<Types.ObjectId>;
    reg_date: string;
}

const StudentShema: Schema = new Schema({
    fullname:{
        type: String,
        required: true,
    },
    email:{
        type: String,
        required: true,
        unique: true,   
    },
    phone:{
        type: Number,
        required: true,
    },
    centerId:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Center', // Referencing the Center model
        required: true,
    },
    courses: [{
        type: Schema.Types.ObjectId,
        ref: 'Course',
    }],
    reg_date:{
        type: String,
        required: true,
    }
},
{timestamps: true}
);

const Student = mongoose.model<IStudent>('Student', StudentShema);
export default Student;