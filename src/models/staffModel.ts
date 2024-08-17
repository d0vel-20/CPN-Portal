import { timeStamp } from 'console';
import mongoose, { Schema, Document, Types } from 'mongoose';


// Define interface
export interface IStaff extends Document {
    _id: Types.ObjectId;
    fullname: string;
    email: string;
    phone: number;
    center: string;
    courses: Types.Array<Types.ObjectId>;
    salary: number;
}

const StaffShema: Schema = new Schema({
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
    center:{
        type: String,
        required: true,
    },
    courses: [{
        type: Schema.Types.ObjectId,
        ref: 'Course',
    }],
    salary:{
        type: Number,
        required: true,
    },
},
{timestamps: true}
);

const Staff = mongoose.model<IStaff>('Staff', StaffShema);
export default Staff;