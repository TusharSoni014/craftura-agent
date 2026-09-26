import { AGENT_AVATAR_PROMPT, fetchPollinationsImage } from "@/lib/agent/pollinations";

export const runtime = "nodejs";

export async function GET() {
  try {
    const image = await fetchPollinationsImage(AGENT_AVATAR_PROMPT);
    const contentType = image.headers.get("content-type") ?? "image/jpeg";
    const body = await image.arrayBuffer();

    return new Response(body, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=86400",
      },
    });
  } catch (error) {
    return Response.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Could not generate agent avatar.",
      },
      { status: 502 },
    );
  }
}
