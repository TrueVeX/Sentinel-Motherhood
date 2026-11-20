import { update } from "@/lib/store";

export const runtime = "nodejs";

const EMPTY_STATS = { visits: 0, questions: 0, aiAnswers: 0, offlineAnswers: 0 };
function count(key: keyof typeof EMPTY_STATS) {
  update("stats", EMPTY_STATS, (s) => ({ ...s, [key]: s[key] + 1 })).catch(() => undefined);
}

// Works with either an OpenRouter key (sk-or-...) or an NVIDIA key (nvapi-...).
// Both services use the same OpenAI-style chat format, so only the address and model differ.
const PROVIDERS = {
  openrouter: { url: "https://openrouter.ai/api/v1/chat/completions", model: "google/gemma-4-31b-it:free" },
  nvidia: { url: "https://integrate.api.nvidia.com/v1/chat/completions", model: "google/gemma-3-12b-it" }
};

// Free OpenRouter models get busy, so OpenRouter tries these in order until one answers.
const OPENROUTER_BACKUPS = ["google/gemma-4-26b-a4b-it:free", "nvidia/nemotron-3.5-lightning:free"];

function pickProvider() {
  // Any of these names works: OPENROUTER_API_KEY, NVIDIA_API_KEY or plain API_KEY.
  const apiKey = (process.env.OPENROUTER_API_KEY || process.env.NVIDIA_API_KEY || process.env.API_KEY)?.trim();
  if (!apiKey) return null;
  const isOpenRouter = !!process.env.OPENROUTER_API_KEY || apiKey.startsWith("sk-or-");
  const provider = isOpenRouter ? PROVIDERS.openrouter : PROVIDERS.nvidia;
  const model = process.env.AI_MODEL || (!isOpenRouter && process.env.NVIDIA_MODEL) || provider.model;
  return { apiKey, url: provider.url, model, isOpenRouter };
}

const SYSTEM_PROMPT = `You are Sentinel, a warm and friendly motherhood guide in a student science fair app called Sentinel Motherhood.
Answer questions about pregnancy, birth, postpartum recovery, newborn care and early parenting.
Keep answers short: 2 to 5 sentences or a few bullet points, in simple everyday language.
Give general information only. Never diagnose. If something sounds urgent or worrying, kindly suggest contacting a midwife, doctor or emergency services.
If a question is unrelated to motherhood or family, gently steer back to those topics.`;

type ChatMessage = { role: "user" | "assistant"; content: string };

function cleanMessages(input: unknown): ChatMessage[] | null {
  if (!Array.isArray(input)) return null;
  const messages = input
    .filter(
      (m): m is ChatMessage =>
        !!m &&
        (m.role === "user" || m.role === "assistant") &&
        typeof m.content === "string" &&
        m.content.trim().length > 0
    )
    .map((m) => ({ role: m.role, content: m.content.slice(0, 1000) }))
    .slice(-12);
  return messages.length && messages[messages.length - 1].role === "user" ? messages : null;
}

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "bad_request" }, { status: 400 });
  }
  const messages = cleanMessages((body as { messages?: unknown })?.messages);
  if (!messages) return Response.json({ error: "bad_request" }, { status: 400 });
  count("questions");

  const provider = pickProvider();
  if (!provider) return Response.json({ error: "missing_key" }, { status: 503 });

  let upstream: Response;
  try {
    upstream = await fetch(provider.url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${provider.apiKey}`,
        "Content-Type": "application/json",
        Accept: "text/event-stream",
        ...(provider.isOpenRouter ? { "X-Title": "Sentinel Motherhood" } : {})
      },
      body: JSON.stringify({
        model: provider.model,
        ...(provider.isOpenRouter && !process.env.AI_MODEL
          ? { models: [provider.model, ...OPENROUTER_BACKUPS] }
          : {}),
        messages: [{ role: "system", content: SYSTEM_PROMPT }, ...messages],
        temperature: 0.5,
        // Some backup models "think" before answering; keep that short and hidden, and leave room for the answer.
        max_tokens: provider.isOpenRouter ? 1500 : 400,
        ...(provider.isOpenRouter ? { reasoning: { effort: "low", exclude: true } } : {}),
        stream: true
      }),
      signal: AbortSignal.timeout(30000)
    });
  } catch {
    return Response.json({ error: "unreachable" }, { status: 502 });
  }

  if (!upstream.ok || !upstream.body) {
    console.error("AI API error", upstream.status, await upstream.text().catch(() => ""));
    return Response.json({ error: "upstream", status: upstream.status }, { status: 502 });
  }

  count("aiAnswers");

  // Turn the OpenAI-style event stream into plain text chunks for the browser.
  const decoder = new TextDecoder();
  const encoder = new TextEncoder();
  let buffer = "";
  const stream = upstream.body.pipeThrough(
    new TransformStream<Uint8Array, Uint8Array>({
      transform(chunk, controller) {
        buffer += decoder.decode(chunk, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";
        for (const line of lines) {
          const data = line.trim();
          if (!data.startsWith("data:")) continue;
          const payload = data.slice(5).trim();
          if (payload === "[DONE]") continue;
          try {
            const text = JSON.parse(payload)?.choices?.[0]?.delta?.content;
            if (text) controller.enqueue(encoder.encode(text));
          } catch {
            /* ignore partial or non-JSON lines */
          }
        }
      }
    })
  );

  return new Response(stream, {
    headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "no-store" }
  });
}
