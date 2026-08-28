import mongoose, { Model, Schema, Types } from "mongoose";
import { Priority, TaskStatus } from "@/types";

export interface ITask {
  _id: Types.ObjectId;
  title: string;
  description?: string;
  assignedTo: Types.ObjectId;
  createdBy: Types.ObjectId;
  managerId: Types.ObjectId;
  startDate: Date;
  deadline: Date;
  priority: Priority;
  status: TaskStatus;
  blockedReason?: string;
  completionNote?: string;
  completedAt?: Date;
  deleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const TaskSchema = new Schema<ITask>(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    assignedTo: { type: Schema.Types.ObjectId, ref: "User", required: true },
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    managerId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    startDate: { type: Date, required: true },
    deadline: { type: Date, required: true },
    priority: {
      type: String,
      enum: ["low", "medium", "high"],
      default: "medium",
    },
    status: {
      type: String,
      enum: [
        "pending",
        "confirmed",
        "in_progress",
        "waiting",
        "done",
        "cancelled",
      ],
      default: "pending",
    },
    blockedReason: { type: String, trim: true },
    completionNote: { type: String, trim: true },
    completedAt: { type: Date },
    deleted: { type: Boolean, default: false, index: true },
  },
  { timestamps: true },
);

TaskSchema.index({ assignedTo: 1, status: 1, deadline: 1, deleted: 1 });
TaskSchema.index({ managerId: 1, deleted: 1 });
TaskSchema.index({ createdBy: 1 });

const Task: Model<ITask> =
  mongoose.models.Task || mongoose.model<ITask>("Task", TaskSchema);

export default Task;
