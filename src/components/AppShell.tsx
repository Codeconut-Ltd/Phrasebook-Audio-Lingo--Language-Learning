import { Suspense, useEffect, useState, type ReactNode } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Button, Container, Logo, Text, textLinkVariants, useTheme } from "@/design-system/codeconut-ltd-2019-2025-dx-42c1f0";
import { supabase } from "@/integrations/supabase/client";
import { profileQuery } from "@/lib/queries";
import { GearIcon, MoonIcon, SunIcon } from "./Icons";
import { SettingsPanel } from "./SettingsPanel";

export function resolveTheme(choice: string): "light" | "dark" {
  if (choice === "light" || choice === "dark") return choice;
  return typeof window !== "undefined" && window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

const NAV = [
  { to: "/", label: "Home" },
  { to: "/library", label: "Library" },
] as const;

export function AppShell({ children }: { children: ReactNode }) {
  const { theme, toggleTheme, setTheme } = useTheme();
  const [open, setOpen] = useState(false);
  const qc = useQueryClient();
  const navigate = useNavigate();
  const { data: profile } = useQuery(profileQuery);

  useEffect(() => {
    if (profile) setTheme(resolveTheme(profile.theme));
  }, [profile, setTheme]);

  async function signOut() {
    await qc.cancelQueries();
    qc.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border">
        <Container className="flex h-16 items-center gap-4">
          <Link to="/" aria-label="Home" className="flex items-center gap-2">
            <Logo variant="symbol" size="sm" />
            <Text as="span" weight="semibold">Phrasebook</Text>
          </Link>
          <nav aria-label="Main" className="flex items-center gap-4">
            {NAV.map((n) => (
              <Link
                key={n.to}
                to={n.to}
                className={textLinkVariants({ variant: "quiet" })}
                activeProps={{ className: textLinkVariants({ variant: "standalone" }) }}
                activeOptions={{ exact: true }}
              >
                {n.label}
              </Link>
            ))}
          </nav>
          <div className="ml-auto flex items-center gap-1">
            <Button variant="ghost" size="sm" aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"} onClick={toggleTheme}>
              {theme === "dark" ? <SunIcon /> : <MoonIcon />}
            </Button>
            <Button variant="ghost" size="sm" aria-label="Settings" aria-expanded={open} onClick={() => setOpen((o) => !o)}>
              <GearIcon />
            </Button>
            <Button variant="ghost" size="sm" onClick={signOut}>Sign out</Button>
          </div>
        </Container>
      </header>
      {open ? (
        <Container className="pt-6">
          <Suspense fallback={<Text tone="muted">Loading settings…</Text>}>
            <SettingsPanel onClose={() => setOpen(false)} />
          </Suspense>
        </Container>
      ) : null}
      <main>
        <Container className="py-8 md:py-12">{children}</Container>
      </main>
    </div>
  );
}
