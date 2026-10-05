import { Suspense, useState, type ReactNode } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { Button, Container, Text, textLinkVariants, useTheme } from "@/design-system/codeconut-ltd-2019-2025-dx-42c1f0";
import { supabase } from "@/integrations/supabase/client";
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

type AppShellProps = {
  children: ReactNode;
  width?: "narrow" | "content" | "wide";
};

export function AppShell({ children, width = "narrow" }: AppShellProps) {
  const { theme, toggleTheme } = useTheme();
  const [open, setOpen] = useState(false);
  const qc = useQueryClient();
  const navigate = useNavigate();

  async function signOut() {
    await qc.cancelQueries();
    qc.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border bg-background">
        <Container className="grid min-h-16 grid-cols-[minmax(0,1fr)_auto] items-center gap-4 py-2 sm:flex">
          <Link to="/" aria-label="Home" className="flex min-w-0 items-center gap-2">
            <Text as="span" weight="semibold" className="truncate">Phrasebook</Text>
          </Link>
          <nav aria-label="Main" className="order-3 col-span-2 flex items-center gap-4 sm:order-none sm:col-span-1">
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
          <div className="flex shrink-0 items-center gap-1 sm:ml-auto">
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
        <Container width="narrow" className="pt-6">
          <Suspense fallback={<Text tone="muted">Loading settings…</Text>}>
            <SettingsPanel onClose={() => setOpen(false)} />
          </Suspense>
        </Container>
      ) : null}
      <main>
        <Container width={width} className="py-8 md:py-12">{children}</Container>
      </main>
    </div>
  );
}
