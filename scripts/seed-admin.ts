import { config } from "dotenv";
import { resolve } from "path";

config({ path: resolve(process.cwd(), ".env.local"), override: true });
import mongoose from "mongoose";
import User from "../models/User";

async function main() {
  const uri = process.env.MONGODB_URI;
  const email = process.env.ADMIN_BOOTSTRAP_EMAIL?.toLowerCase();
  if (!uri || !email) {
    throw new Error("MONGODB_URI and ADMIN_BOOTSTRAP_EMAIL are required");
  }

  await mongoose.connect(uri, { serverSelectionTimeoutMS: 20000 });
  const existing = await User.findOne({ email });
  if (!existing) {
    console.log("No user with that Google email yet. Sign in with Google once; they will become admin.");
    await mongoose.disconnect();
    return;
  }

  existing.role = "admin";
  existing.onboarded = true;
  existing.jobRole = existing.jobRole || "admin";
  existing.managerId = undefined;
  existing.passwordHash = undefined;
  await existing.save();
  console.log("Promoted to admin:", existing.name);
  await mongoose.disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
