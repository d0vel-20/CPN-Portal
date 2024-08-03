import mongoose, { Schema, Document } from 'mongoose';

export interface ICenter extends Document {
    name: string;
    location: string;
    code: string;
}

const CenterSchema: Schema = new Schema({
    name:{
        type: String,
        required: true,
    },
    location:{
        type: String,
        required: true,
    },
    code:{
        type: String,
        required: true,
    },
});

const Center = mongoose.model<ICenter>('Center', CenterSchema);
export default Center;