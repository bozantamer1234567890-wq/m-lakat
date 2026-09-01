import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: Request) {
  const { sessionId } = await req.json();
  if (!sessionId) return NextResponse.json({ error: "sessionId gerekli" }, { status: 400 });

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const { error } = await supabase
    .from("sessions")
    .update({ phase: "completed", status: "completed", completed_at: new Date().toISOString() })
    .eq("id", sessionId)
    .eq("user_id", user.id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const base = process.env.NEXT_PUBLIC_SITE_URL ?? "";
  await fetch(`${base}/api/interview/feedback`, {
    method: "POST",
    headers: { "Content-Type": "application/json", cookie: req.headers.get("cookie") ?? "" },
    body: JSON.stringify({ sessionId }),
  }).catch(() => {});

  return NextResponse.json({ ok: true });
}
