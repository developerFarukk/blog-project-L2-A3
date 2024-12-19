
import bcrypt from 'bcrypt';
import { model, Schema } from "mongoose";
import { TUser } from "./user.interface";
import config from '../../config';


const userSchema = new Schema<TUser>(
    {

        password: {
            type: String,
            required: true,
            select: false
        },
        name: {
            type: String,
            required: [true, 'Name is required'],
            trim: true
        },
        email: {
            type: String,
            required: [true, 'Email is required'],
            unique: true,
            trim: true,
            validate: {
                validator: function (value: string) {
                    return /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/.test(value)
                },
                message: '{VALUE} is not a valid email',
            },
            immutable: true,
        },
        role: {
            type: String,
            enum: ['admin', 'user'],
            default: 'user'
        },
        status: {
            type: String,
            enum: ['in-progress', 'blocked'],
            default: 'in-progress',
        },
        isDeleted: {
            type: Boolean,
            default: false,
        },
    },
    {
        timestamps: true,
        // versionKey: false
    },
);

userSchema.pre('save', async function (next) {
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const user = this; // doc
    // hashing password and save into DB
    user.password = await bcrypt.hash(
        user.password,
        Number(config.bcrypt_salt_rounds),
    );
    next();
});

// set '' after saving password
userSchema.post('save', function (doc, next) {
    doc.password = '';
    next();
});


export const User = model<TUser>('User', userSchema);