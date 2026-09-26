const POLLINATIONS_IMAGE_ORIGIN = "https://gen.pollinations.ai";

export const AGENT_AVATAR_PROMPT =
  "Minimal circular app icon of a friendly weather assistant, sun and cloud, flat design, centered, no text, no watermark";

export function buildPollinationsImageUrl(prompt: string) {
  const url = new URL(
    `${POLLINATIONS_IMAGE_ORIGIN}/image/${encodeURIComponent(prompt)}`,
  );
  url.searchParams.set("model", "black-forest-labs/flux.1-schnell");
  return url;
}

export async function fetchPollinationsImage(prompt: string) {
  const url = buildPollinationsImageUrl(prompt);
  const headers = new Headers();
  const apiKey = process.env.POLLINATIONS_API_KEY;

  if (apiKey) {
    headers.set("Authorization", `Bearer ${apiKey}`);
  }

  const response = await fetch(url, {
    headers,
    next: { revalidate: 86_400 },
  });

  if (!response.ok) {
    throw new Error(
      `Pollinations image request failed (${response.status}). Set POLLINATIONS_API_KEY if generation requires auth.`,
    );
  }

  return response;
}
