import { Button } from "@/design-system/codeconut-ltd-2019-2025-dx-42c1f0";
import { useAudioPlayer } from "@/hooks/useAudioPlayer";
import { PlayIcon, StopIcon } from "./Icons";

type Props = { phrase: { id: string; text: string; language_code: string }; size?: "sm" | "md" | "lg" };

export function PlayButton({ phrase, size = "lg" }: Props) {
  const player = useAudioPlayer();
  const playing = player.activeId === phrase.id;
  const loading = player.loadingId === phrase.id;
  return (
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
  );
}
