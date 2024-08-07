import mongoose, { Schema, Document, Types } from 'mongoose';

export interface ICourses extends Document {
    _id: Types.ObjectId;
    title: string;
    duration: number;
    amount: number;
}

const CourseSchema: Schema = new Schema({
    title: {
    type: String,
    required: true,
    },
    duration: {
    type: Number,
    required: true,
    unique: true,
    },
    amount: {
    type: Number,
    required: true,
    },
},
{timestamps: true}
);




const Course = mongoose.model<ICourses>('Course', CourseSchema);
export default Course;