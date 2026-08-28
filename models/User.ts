import mongoose, { Model, Schema, Types } from "mongoose";
import { JobRole, Role, SummaryFrequency } from "@/types";

export interface IEmailPrefs {
  notifyOnTaskDone: boolean;
  summaryFrequency: SummaryFrequency;
  summaryEnabled: boolean;
}

export interface IUser {
  _id: Types.ObjectId;
  name: string;
  email: string;
  passwordHash?: string;
  image?: string;
  role: Role;
  jobRole?: JobRole;
  onboarded: boolean;
  managerId?: Types.ObjectId;
  emailPrefs: IEmailPrefs;
  createdAt: Date;
  updatedAt: Date;
}

const EmailPrefsSchema = new Schema<IEmailPrefs>(
  {
    notifyOnTaskDone: { type: Boolean, default: true },
    summaryFrequency: {
      type: String,
      enum: ["daily", "weekly", "off"],
      default: "weekly",
    },
    summaryEnabled: { type: Boolean, default: true },
  },
  { _id: false },
);

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    passwordHash: { type: String },
    image: { type: String },
    role: {
      type: String,
      enum: ["admin", "manager", "user"],
      default: "user",
      index: true,
    },
    jobRole: {
      type: String,
      enum: ["editor", "developer", "admin", "manager", "digital_marketing"],
    },
    onboarded: { type: Boolean, default: true },
    managerId: { type: Schema.Types.ObjectId, ref: "User", index: true },
    emailPrefs: { type: EmailPrefsSchema, default: () => ({}) },
  },
  { timestamps: true },
);

UserSchema.index({ managerId: 1, role: 1 });

if (mongoose.models.User) {
  delete mongoose.models.User;
}

const User: Model<IUser> = mongoose.model<IUser>("User", UserSchema);

export default User;
