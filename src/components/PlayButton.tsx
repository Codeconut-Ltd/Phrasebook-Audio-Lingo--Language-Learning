import { Button, Text } from "@/design-system/codeconut-ltd-2019-2025-dx-42c1f0";
import { useAudioPlayer } from "@/hooks/useAudioPlayer";
import { PlayIcon, StopIcon } from "./Icons";

type Props = { phrase: { id: string; text: string; language_code: string }; size?: "sm" | "md" | "lg" };

export function PlayButton({ phrase, size = "lg" }: Props) {
  const player = useAudioPlayer();
  const playing = player.activeId === phrase.id;
  const loading = player.loadingId === phrase.id;
  const device = playing && player.engine === "device";
  return (
    <span className="inline-flex items-center gap-2">
    <Button
      variant={playing ? "accent" : "outline"}
      size={size}
      loading={loading}
      aria-label={playing ? "Stop audio" : "Play audio"}
      aria-pressed={playing}
      onClick={() => player.toggle(phrase)}
    >
      {loading ? null : playing ? <StopIcon /> : <PlayIcon />}
    </Button>
      {device ? <Text size="small" tone="muted" aria-live="polite" className="whitespace-nowrap">Device voice</Text> : null}
    </span>
  );
}
