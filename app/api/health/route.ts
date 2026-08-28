import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";

export async function GET() {
  const uri = process.env.MONGODB_URI || "";
  const local =
    uri.includes("127.0.0.1") || uri.includes("localhost");
  try {
    await connectDB();
    return NextResponse.json({ ok: true, local });
  } catch {
    return NextResponse.json(
      {
        ok: false,
        local,
        error: local
          ? "MongoDB is not running on this PC. Use your MongoDB Atlas connection string in MONGODB_URI."
          : "Could not reach MongoDB. Check MONGODB_URI, username/password, and Atlas Network Access.",
      },
      { status: 503 },
    );
  }
}
