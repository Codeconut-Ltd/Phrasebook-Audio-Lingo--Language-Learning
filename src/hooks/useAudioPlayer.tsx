import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { useServerFn } from "@tanstack/react-start";
import { speak } from "@/lib/phrases.functions";

type PlayerState = {
  activeId: string | null;
  loadingId: string | null;
  error: string | null;
  /** Which engine is playing activeId: ElevenLabs audio or the device voice fallback. */
  engine: "elevenlabs" | "device" | null;
};
type PlayerApi = PlayerState & {
  toggle: (p: { id: string; text: string; language_code: string }) => void;
  stop: () => void;
};

const AudioCtx = createContext<PlayerApi | null>(null);

/** Single shared player so only one phrase plays at a time. */
export function AudioPlayerProvider({ children }: { children: ReactNode }) {
  const speakFn = useServerFn(speak);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const reqRef = useRef(0);
  const [state, setState] = useState<PlayerState>({ activeId: null, loadingId: null, error: null, engine: null });

  const stop = useCallback(() => {
    reqRef.current++;
    audioRef.current?.pause();
    audioRef.current = null;
    if (typeof window !== "undefined") window.speechSynthesis?.cancel();
    setState((s) => ({ ...s, activeId: null, loadingId: null }));
  }, []);

  useEffect(() => stop, [stop]);

  const fallback = useCallback((id: string, text: string, lang: string) => {
    if (!("speechSynthesis" in window)) return false;
    const u = new SpeechSynthesisUtterance(text);
    u.lang = lang;
    u.onend = () => setState((s) => (s.activeId === id ? { ...s, activeId: null } : s));
    window.speechSynthesis.speak(u);
    setState({ activeId: id, loadingId: null, error: null, engine: "device" });
    return true;
  }, []);

  const toggle = useCallback<PlayerApi["toggle"]>(
    (p) => {
      if (state.activeId === p.id || state.loadingId === p.id) return stop();
      stop();
      const req = ++reqRef.current;
      setState({ activeId: null, loadingId: p.id, error: null, engine: null });
      speakFn({ data: { id: p.id } })
        .then((res) => {
          if (req !== reqRef.current) return;
          if ("fallback" in res) {
            if (!fallback(p.id, p.text, p.language_code))
              setState({ activeId: null, loadingId: null, error: "Audio unavailable", engine: null });
            return;
          }
          const audio = new Audio(res.url);
          audioRef.current = audio;
          audio.onended = () => setState((s) => ({ ...s, activeId: null }));
          audio
            .play()
            .then(() => setState({ activeId: p.id, loadingId: null, error: null, engine: "elevenlabs" }))
            .catch(() => setState({ activeId: null, loadingId: null, error: "Playback blocked", engine: null }));
        })
        .catch(() => {
          if (req !== reqRef.current) return;
          if (!fallback(p.id, p.text, p.language_code))
            setState({ activeId: null, loadingId: null, error: "Speech failed", engine: null });
        });
    },
    [state.activeId, state.loadingId, stop, speakFn, fallback],
  );

  return <AudioCtx.Provider value={{ ...state, toggle, stop }}>{children}</AudioCtx.Provider>;
}

export function useAudioPlayer() {
  const ctx = useContext(AudioCtx);
  if (!ctx) throw new Error("useAudioPlayer requires AudioPlayerProvider");
  return ctx;
}
