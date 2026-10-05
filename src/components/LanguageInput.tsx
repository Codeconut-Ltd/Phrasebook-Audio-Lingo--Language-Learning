import { Input } from "@/design-system/codeconut-ltd-2019-2025-dx-42c1f0";
import { LANGUAGES } from "@/lib/languages";

type Props = { id: string; value: string; onChange: (v: string) => void; size?: "sm" | "md" | "lg"; "aria-label"?: string };

/** Language code picker: curated suggestions, any BCP-47 code allowed. */
export function LanguageInput({ id, value, onChange, size = "md", ...rest }: Props) {
  return (
    <>
      <Input
        id={id}
        list="language-codes"
        value={value}
        size={size}
        autoComplete="off"
        spellCheck={false}
        onChange={(e) => onChange(e.target.value)}
        aria-label={rest["aria-label"]}
      />
      <datalist id="language-codes">
        {LANGUAGES.map((l) => (
          <option key={l.code} value={l.code}>
            {l.name}
          </option>
        ))}
      </datalist>
    </>
  );
}
