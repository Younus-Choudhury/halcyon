import { connection } from "next/server";
import { isBrief } from "@/lib/brief";
import { recommendLive } from "@/lib/live-search";

export async function POST(request: Request) {
  await connection();
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Send the brief as JSON." }, { status: 400 });
  }

  if (!isBrief(body)) {
    return Response.json({ error: "The brief is missing a month, a party, or a budget." }, { status: 400 });
  }

  try {
    const shortlist = await recommendLive(body);
    return Response.json(shortlist, {
      headers: { "Cache-Control": "no-store" },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "The search failed.";
    return Response.json({ error: message }, { status: 502 });
  }
}
