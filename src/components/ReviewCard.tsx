import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Badge, Button, Card, Text, Textarea } from "@/design-system/codeconut-ltd-2019-2025-dx-42c1f0";
import { updatePhrase, type Phrase } from "@/lib/phrases.functions";
import { languageName } from "@/lib/languages";
import { useAutosave, type SaveState } from "@/hooks/useAutosave";
import { PlayButton } from "./PlayButton";

const SAVE_LABEL: Record<SaveState, string> = { idle: "", saving: "Saving…", saved: "Saved", error: "Save failed" };

type Props = {
  phrase: Phrase;
  index: number;
  result: boolean | undefined;
  onResult: (memorized: boolean) => void;
};

export function ReviewCard({ phrase, index, result, onResult }: Props) {
  const save = useServerFn(updatePhrase);
  const [text, setText] = useState(phrase.text);
  const [translation, setTranslation] = useState(phrase.translation ?? "");
  const [showTr, setShowTr] = useState(false);
  const textState = useAutosave(text, (v) => (v.trim() ? save({ data: { id: phrase.id, text: v } }) : Promise.reject()));
  const trState = useAutosave(translation, (v) => save({ data: { id: phrase.id, translation: v || null } }));
  const state = textState === "idle" ? trState : textState;

  return (
    <Card variant={result === undefined ? "outlined" : "filled"} padding="md">
      <div className="flex items-center gap-2">
        <Text as="span" size="small" tone="muted">{index + 1}</Text>
        <Badge variant="outline">{languageName(phrase.language_code)}</Badge>
        {result === true ? <Badge variant="success">Memorized</Badge> : null}
        {result === false ? <Badge variant="warning">Not yet</Badge> : null}
        <Text as="span" size="small" tone="muted" aria-live="polite" className="ml-auto">{SAVE_LABEL[state]}</Text>
      </div>
      <div className="mt-4 flex items-start gap-4">
        <PlayButton phrase={{ id: phrase.id, text, language_code: phrase.language_code }} />
        <Textarea
          aria-label="Phrase text"
          lang={phrase.language_code}
          rows={2}
          value={text}
          invalid={!text.trim()}
          onChange={(e) => setText(e.target.value)}
          className="font-serif text-h3"
        />
      </div>
      <div className="mt-4">
        {showTr ? (
          <Textarea
            aria-label="Translation"
            rows={1}
            placeholder="Add a translation (optional)"
            value={translation}
            onChange={(e) => setTranslation(e.target.value)}
          />
        ) : (
          <Button variant="ghost" size="sm" onClick={() => setShowTr(true)}>
            {translation ? "Show translation" : "Add translation"}
          </Button>
        )}
      </div>
      <div className="mt-6 flex flex-wrap gap-3">
        <Button variant={result === true ? "primary" : "outline"} onClick={() => onResult(true)}>Memorized</Button>
        <Button variant={result === false ? "secondary" : "outline"} onClick={() => onResult(false)}>Not yet</Button>
      </div>
    </Card>
  );
}
