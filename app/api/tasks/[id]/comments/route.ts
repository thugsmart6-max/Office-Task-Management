import { NextRequest, NextResponse } from "next/server";
import { requireApiUser } from "@/lib/session";
import { addComment, createCommentSchema, listComments } from "@/lib/comments";
import { jsonError } from "@/lib/email/send-summary";
import { serialize } from "@/lib/serialize";

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: Params) {
  const { user, error } = await requireApiUser();
  if (error) return error;
  try {
    const { id } = await params;
    const items = await listComments(user, id);
    return NextResponse.json({ items: serialize(items) });
  } catch (err) {
    return jsonError(err);
  }
}

export async function POST(req: NextRequest, { params }: Params) {
  const { user, error } = await requireApiUser();
  if (error) return error;
  try {
    const { id } = await params;
    const body = createCommentSchema.parse(await req.json());
    const comment = await addComment(user, id, body);
    return NextResponse.json(serialize(comment), { status: 201 });
  } catch (err) {
    return jsonError(err);
  }
}
