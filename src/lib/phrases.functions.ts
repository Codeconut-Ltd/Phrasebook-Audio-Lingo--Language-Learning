import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { LANGUAGE_CODE_PATTERN, VOICES } from "./languages";

const langSchema = z.string().trim().regex(LANGUAGE_CODE_PATTERN).max(35);
const textSchema = z.string().trim().min(1).max(2000);
const translationSchema = z.string().trim().max(2000).nullable();

export const PAGE_SIZE = 25;

export type Phrase = {
  id: string;
  text: string;
  language_code: string;
  translation: string | null;
  status: "learning" | "learned";
  times_reviewed: number;
  times_correct: number;
  last_reviewed_at: string | null;
  created_at: string;
};

const PHRASE_COLUMNS =
  "id, text, language_code, translation, status, times_reviewed, times_correct, last_reviewed_at, created_at";

export type Profile = {
  id: string;
  display_name: string | null;
  output_language: string;
  round_size: number;
  voice: string;
  theme: string;
};

export const getProfile = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<Profile> => {
    const { supabase, userId } = context;
    const cols = "id, display_name, output_language, round_size, voice, theme";
    const { data, error } = await supabase.from("profiles").select(cols).eq("id", userId).maybeSingle();
    if (error) throw new Error(error.message);
    if (data) return data;
    const { data: created, error: insErr } = await supabase
      .from("profiles")
      .insert({ id: userId })
      .select(cols)
      .single();
    if (insErr) throw new Error(insErr.message);
    return created;
  });

export const updateProfile = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z
      .object({
        output_language: langSchema.optional(),
        round_size: z.number().int().min(1).max(20).optional(),
        voice: z.enum(VOICES).optional(),
        theme: z.enum(["light", "dark", "system"]).optional(),
      })
      .parse(d),
  )
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase.from("profiles").update(data).eq("id", context.userId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const getStats = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase } = context;
    const count = async (status?: "learning" | "learned") => {
      let q = supabase.from("phrases").select("id", { count: "exact", head: true });
      if (status) q = q.eq("status", status);
      const { count: c, error } = await q;
      if (error) throw new Error(error.message);
      return c ?? 0;
    };
    const [total, learned, learning] = await Promise.all([count(), count("learned"), count("learning")]);
    const { data: langs } = await supabase.from("phrases").select("language_code").limit(1000);
    const languages = [...new Set((langs ?? []).map((l) => l.language_code))].sort();
    return { total, learned, learning, languages };
  });

export const addPhrase = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z.object({ text: textSchema, language_code: langSchema, translation: translationSchema }).parse(d),
  )
  .handler(async ({ data, context }): Promise<Phrase> => {
    const { data: row, error } = await context.supabase
      .from("phrases")
      .insert({ ...data, translation: data.translation || null, user_id: context.userId })
      .select(PHRASE_COLUMNS)
      .single();
    if (error) throw new Error(error.message);
    return row;
  });

export const updatePhrase = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z
      .object({
        id: z.string().uuid(),
        text: textSchema.optional(),
        language_code: langSchema.optional(),
        translation: translationSchema.optional(),
        status: z.enum(["learning", "learned"]).optional(),
      })
      .parse(d),
  )
  .handler(async ({ data, context }) => {
    const { id, ...patch } = data;
    const update: { text?: string; language_code?: string; translation?: string | null; status?: "learning" | "learned"; audio_path?: null } = { ...patch };
    if (patch.translation !== undefined) update.translation = patch.translation || null;
    if (patch.text !== undefined || patch.language_code !== undefined) update.audio_path = null;
    const { error } = await context.supabase.from("phrases").update(update).eq("id", id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const deletePhrase = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase.from("phrases").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const markResult = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ id: z.string().uuid(), memorized: z.boolean() }).parse(d))
  .handler(async ({ data, context }) => {
    const { supabase } = context;
    const { data: row, error } = await supabase
      .from("phrases")
      .select("times_reviewed, times_correct")
      .eq("id", data.id)
      .single();
    if (error) throw new Error(error.message);
    const { error: upErr } = await supabase
      .from("phrases")
      .update({
        status: data.memorized ? "learned" : "learning",
        times_reviewed: row.times_reviewed + 1,
        times_correct: row.times_correct + (data.memorized ? 1 : 0),
        last_reviewed_at: new Date().toISOString(),
      })
      .eq("id", data.id);
    if (upErr) throw new Error(upErr.message);
    return { ok: true };
  });

export const getRound = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ n: z.number().int().min(1).max(20) }).parse(d))
  .handler(async ({ data, context }): Promise<Phrase[]> => {
    const { data: rows, error } = await context.supabase.rpc("pick_round", { _n: data.n });
    if (error) throw new Error(error.message);
    return (rows ?? []).map((r) => ({
      id: r.id,
      text: r.text,
      language_code: r.language_code,
      translation: r.translation,
      status: r.status,
      times_reviewed: r.times_reviewed,
      times_correct: r.times_correct,
      last_reviewed_at: r.last_reviewed_at,
      created_at: r.created_at,
    }));
  });

export const listSchema = z.object({
  page: z.number().int().min(1).default(1),
  status: z.enum(["all", "learning", "learned"]).default("all"),
  lang: z.string().max(35).default(""),
  q: z.string().max(200).default(""),
  sort: z.enum(["created_desc", "created_asc", "text_asc", "reviewed_desc"]).default("created_desc"),
});
export type ListParams = z.infer<typeof listSchema>;

export const listPhrases = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => listSchema.parse(d))
  .handler(async ({ data, context }) => {
    let q = context.supabase.from("phrases").select(PHRASE_COLUMNS, { count: "exact" });
    if (data.status !== "all") q = q.eq("status", data.status);
    if (data.lang) q = q.eq("language_code", data.lang);
    if (data.q.trim()) {
      const term = data.q.trim().replace(/[\\%_]/g, (m) => `\\${m}`);
      q = q.or(`text.ilike.%${term.replace(/[,()]/g, " ")}%,translation.ilike.%${term.replace(/[,()]/g, " ")}%`);
    }
    const order = {
      created_desc: { col: "created_at", asc: false },
      created_asc: { col: "created_at", asc: true },
      text_asc: { col: "text", asc: true },
      reviewed_desc: { col: "last_reviewed_at", asc: false },
    }[data.sort];
    q = q.order(order.col, { ascending: order.asc, nullsFirst: false });
    const from = (data.page - 1) * PAGE_SIZE;
    const { data: rows, error, count } = await q.range(from, from + PAGE_SIZE - 1);
    if (error) throw new Error(error.message);
    return { rows: (rows ?? []) as Phrase[], total: count ?? 0 };
  });

async function sha1(input: string): Promise<string> {
  const buf = await crypto.subtle.digest("SHA-1", new TextEncoder().encode(input));
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, "0")).join("").slice(0, 16);
}

const TTS_MODEL = "google/gemini-3.1-flash-tts-preview";
const GATEWAY = "https://ai.gateway.lovable.dev";

/** Returns a signed URL to cached speech audio for a phrase; synthesizes once per text/voice. */
export const speak = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }): Promise<{ url: string } | { error: string }> => {
    const { supabase, userId } = context;
    const [{ data: phrase, error }, { data: profile }] = await Promise.all([
      supabase.from("phrases").select("id, text, language_code, audio_path").eq("id", data.id).single(),
      supabase.from("profiles").select("voice").eq("id", userId).maybeSingle(),
    ]);
    if (error) return { error: "Phrase not found" };
    const voice = profile?.voice ?? "Kore";
    const hash = await sha1(`${phrase.text}|${phrase.language_code}|${voice}|${TTS_MODEL}`);
    const path = `${userId}/${phrase.id}-${hash}.wav`;

    if (phrase.audio_path !== path) {
      const apiKey = process.env["LOVABLE_API_KEY"];
      if (!apiKey) return { error: "Speech is not configured" };
      const res = await fetch(`${GATEWAY}/v1/audio/speech`, {
        method: "POST",
        headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          model: TTS_MODEL,
          contents: [{ role: "user", parts: [{ text: phrase.text }] }],
          generationConfig: {
            responseModalities: ["AUDIO"],
            speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: voice } } },
          },
          stream_format: "audio",
        }),
      });
      if (!res.ok) {
        const body = await res.text();
        console.error(`TTS failed [${res.status}]: ${body}`);
        if (res.status === 402) return { error: "AI credits exhausted" };
        if (res.status === 429) return { error: "Too many requests, try again shortly" };
        return { error: `Speech failed (${res.status})` };
      }
      const audio = await res.arrayBuffer();
      const { error: upErr } = await supabase.storage
        .from("phrase-audio")
        .upload(path, audio, { contentType: "audio/wav", upsert: true });
      if (upErr) return { error: upErr.message };
      if (phrase.audio_path) await supabase.storage.from("phrase-audio").remove([phrase.audio_path]);
      await supabase.from("phrases").update({ audio_path: path }).eq("id", phrase.id);
    }
    const { data: signed, error: sErr } = await supabase.storage.from("phrase-audio").createSignedUrl(path, 3600);
    if (sErr || !signed) return { error: sErr?.message ?? "Could not load audio" };
    return { url: signed.signedUrl };
  });
