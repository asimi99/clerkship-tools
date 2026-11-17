// Supabase Edge Function "coach". Deploy with JWT verification OFF so guests can use it.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.4";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};
const USER_DAILY = Number(Deno.env.get("USER_DAILY") ?? 60);
const GUEST_DAILY = Number(Deno.env.get("GUEST_DAILY") ?? 10);
const PDF_USER_DAILY = Number(Deno.env.get("PDF_USER_DAILY") ?? 15);
const PDF_GUEST_DAILY = Number(Deno.env.get("PDF_GUEST_DAILY") ?? 3);
const MODELS: Record<string, string> = {
  quick: Deno.env.get("MODEL_QUICK") ?? "claude-haiku-5-5",
  default: "claude-sonnet-5-5",
  complex: Deno.env.get("MODEL_COMPLEX") ?? "claude-opus-5-5",
};

async function sha(s: string) {
  const b = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(s));
  return [...new Uint8Array(b)].map((x) => x.toString(16).padStart(2, "0")).join("").slice(0, 32);
}
const fail = (status: number, msg: string) => new Response(msg, { status, headers: CORS });

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });
  if (req.method !== "POST") return fail(405, "method");

  const admin = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);

  // who is calling
  const token = (req.headers.get("authorization") ?? "").replace(/^Bearer\s+/i, "");
  let userId: string | null = null;
  if (token && token !== Deno.env.get("SUPABASE_ANON_KEY")) {
    const { data } = await admin.auth.getUser(token);
    userId = data?.user?.id ?? null;
  }
  let key: string, limit: number;
  if (userId) { key = "u:" + userId; limit = USER_DAILY; }
  else {
    const ip = (req.headers.get("x-forwarded-for") ?? "").split(",")[0].trim() || "unknown";
    key = "g:" + await sha(ip); limit = GUEST_DAILY;
  }

  // parse and cap input
  let body: any;
  try { body = await req.json(); } catch { return fail(400, "bad json"); }
  if (Array.isArray(body.pdfs) && body.pdfs.length) { key = "p" + key; limit = userId ? PDF_USER_DAILY : PDF_GUEST_DAILY; }
  const images = Array.isArray(body.images) ? body.images.slice(0, 4) : [];
  const pdfs = Array.isArray(body.pdfs) ? body.pdfs.slice(0, 1) : [];
  for (const p of pdfs) {
    if (typeof p?.data !== "string" || p.data.length > 28_000_000) return fail(413, "pdf too large");
  }
  for (const im of images) {
    if (typeof im?.data !== "string" || im.data.length > 3_500_000) return fail(413, "image too large");
  }
  let turns: { role: string; content: any }[];
  if (typeof body.input === "string") turns = [{ role: "user", content: body.input.slice(0, 30000) }];
  else if (Array.isArray(body.input)) {
    turns = body.input.slice(-20).map((t: any) => ({
      role: t.role === "assistant" ? "assistant" : "user",
      content: String(t.content ?? "").slice(0, 30000),
    }));
  } else return fail(400, "bad input");
  if (!turns.length || turns[turns.length - 1].role !== "user") return fail(400, "bad input");
  if (pdfs.length) {
    const first = turns.findIndex((t) => t.role === "user");
    const t = turns[first];
    t.content = [
      ...pdfs.map((p: any) => ({ type: "document", source: { type: "base64", media_type: "application/pdf", data: p.data } })),
      { type: "text", text: t.content },
    ];
  } else if (images.length) {
    const first = turns.findIndex((t) => t.role === "user");
    const t = turns[first];
    t.content = [
      ...images.map((im: any) => ({ type: "image", source: { type: "base64", media_type: im.media_type || "image/jpeg", data: im.data } })),
      { type: "text", text: t.content },
    ];
  }

  // rate limit (counts one per request)
  const { data: n, error } = await admin.rpc("bump_usage", { k: key });
  if (error) return fail(500, "usage");
  if ((n as number) > limit) return fail(429, "limit");

  const model = MODELS[body.tier as string] ?? MODELS.default;
  const up = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-api-key": Deno.env.get("ANTHROPIC_API_KEY") ?? "",
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({ model, max_tokens: 64000, stream: true, messages: turns }),
  });
  if (!up.ok || !up.body) return fail(502, "upstream " + up.status);

  // pass the raw SSE through: parsing here burns edge CPU time and cut long answers off
  return new Response(up.body, { headers: { ...CORS, "Content-Type": "text/event-stream; charset=utf-8", "Cache-Control": "no-store" } });
});
