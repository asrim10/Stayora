import mongoose, { Document, Schema } from "mongoose";
import { UserType } from "../types/user.type";

const UserSchema: Schema = new Schema<UserType>(
  {
    email: { type: String, required: true, unique: true },
    password: { type: String, required: false },
    username: { type: String, required: true, unique: true },
    fullName: { type: String },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
    imageUrl: { type: String, required: false },
    loginAttempts: { type: Number, default: 0 },
    lockUntil: { type: Date, default: null },
    passwordResetAttempts: { type: Number, default: 0 },
    resetLockUntil: { type: Date, default: null },
    mfaSecret: { type: String, default: null },
    mfaEnabled: { type: Boolean, default: false },
    googleId: { type: String, required: false, unique: true, sparse: true },
    authProvider: {
      type: String,
      enum: ["local", "google"],
      default: "local",
    },
  },
  {
    timestamps: true,
  },
);

export interface IUser extends UserType, Document {
  _id: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

export const UserModel = mongoose.model<IUser>("User", UserSchema);
