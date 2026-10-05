import { useEffect, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Alert, Button, Card, CardDescription, Container, Field, Heading, Input, Text } from "@/design-system/codeconut-ltd-2019-2025-dx-42c1f0";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/auth")({
  staticData: { sitemap: true },
  head: () => ({
    meta: [
      { title: "Sign in — Phrasebook" },
      { name: "description", content: "Sign in to your Phrasebook to practise phrases by ear." },
      { property: "og:title", content: "Sign in — Phrasebook" },
      { property: "og:description", content: "Sign in to your Phrasebook to practise phrases by ear." },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://audio-lingo-flash.lovable.app/auth" },
      { name: "twitter:card", content: "summary" },
    ],
    links: [{ rel: "canonical", href: "https://audio-lingo-flash.lovable.app/auth" }],
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) navigate({ to: "/", replace: true });
    });
  }, [navigate]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const res =
      mode === "signin"
        ? await supabase.auth.signInWithPassword({ email, password })
        : await supabase.auth.signUp({ email, password, options: { emailRedirectTo: window.location.origin } });
    setBusy(false);
    if (res.error) return setError(res.error.message);
    if (res.data.session) navigate({ to: "/", replace: true });
    else setError("Check your email to confirm your account.");
  }

  return (
    <main className="flex min-h-screen items-center bg-surface py-8">
      <Container width="narrow">
        <Card variant="raised" padding="lg" className="mx-auto max-w-md bg-background">
          <div className="flex flex-col items-center text-center">
            <Text as="span" size="lead" weight="semibold">Phrasebook</Text>
            <Heading level={1} className="mt-6">{mode === "signin" ? "Welcome back" : "Create your account"}</Heading>
            <CardDescription className="mt-2">Learn phrases by ear, in any language.</CardDescription>
          </div>
          <form onSubmit={submit} className="mt-6 flex flex-col gap-4">
            <Field htmlFor="email" label="Email address" required>
              <Input id="email" type="email" autoComplete="email" placeholder="name@example.com" required value={email} onChange={(e) => setEmail(e.target.value)} />
            </Field>
            <Field htmlFor="password" label="Password" required>
              <Input id="password" type="password" minLength={6} required autoComplete={mode === "signin" ? "current-password" : "new-password"} value={password} onChange={(e) => setPassword(e.target.value)} />
            </Field>
            {error ? <Alert tone="warning">{error}</Alert> : null}
            <Button type="submit" block loading={busy}>{mode === "signin" ? "Sign in to Phrasebook" : "Create account"}</Button>
            <Button variant="ghost" onClick={() => setMode(mode === "signin" ? "signup" : "signin")}>
              {mode === "signin" ? "No account? Sign up" : "Have an account? Sign in"}
            </Button>
          </form>
        </Card>
      </Container>
    </main>
  );
}
