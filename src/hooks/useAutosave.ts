import { useEffect, useRef, useState } from "react";

const AUTOSAVE_DELAY_MS = 600;

export type SaveState = "idle" | "saving" | "saved" | "error";

/** Debounces `value` and calls `save` when it differs from the last persisted value. */
export function useAutosave(value: string, save: (v: string) => Promise<unknown>, enabled = true) {
  const [state, setState] = useState<SaveState>("idle");
  const lastSaved = useRef(value);
  const saveRef = useRef(save);
  saveRef.current = save;

  useEffect(() => {
    if (!enabled || value === lastSaved.current) return;
    const t = setTimeout(() => {
      setState("saving");
      saveRef
        .current(value)
        .then(() => {
          lastSaved.current = value;
          setState("saved");
        })
        .catch(() => setState("error"));
    }, AUTOSAVE_DELAY_MS);
    return () => clearTimeout(t);
  }, [value, enabled]);

  return state;
}
