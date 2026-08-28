import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json(
    { error: "Email signup is closed. Use Google." },
    { status: 410 },
  );
}
