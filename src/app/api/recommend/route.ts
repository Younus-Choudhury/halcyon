import { connection } from "next/server";
import { generateShortlist, isHolidayAnswers } from "@/lib/ai-recommend";

export const maxDuration = 120;

export async function POST(request: Request) {
  await connection();
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Send the answers as JSON." }, { status: 400 });
  }

  if (!isHolidayAnswers(body)) {
    return Response.json({ error: "The twelve answers are incomplete." }, { status: 400 });
  }

  try {
    const places = await generateShortlist({
      ...body,
      travellingFor: body.travellingFor.trim(),
      remember: body.remember.trim(),
      avoid: body.avoid.trim(),
      loved: body.loved.trim(),
    });
    return Response.json({ places }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    const message = error instanceof Error ? error.message : "The shortlist was not written.";
    return Response.json({ error: message }, { status: 502 });
  }
}
