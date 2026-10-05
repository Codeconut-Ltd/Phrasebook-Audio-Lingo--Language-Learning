CREATE TYPE public.phrase_status AS ENUM ('learning','learned');

CREATE TABLE public.profiles (
  id uuid PRIMARY KEY,
  display_name text,
  output_language text NOT NULL DEFAULT 'th-TH',
  round_size int NOT NULL DEFAULT 7 CHECK (round_size BETWEEN 1 AND 20),
  voice text NOT NULL DEFAULT 'Kore',
  theme text NOT NULL DEFAULT 'system' CHECK (theme IN ('light','dark','system')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own profile select" ON public.profiles FOR SELECT TO authenticated USING ((select auth.uid()) = id);
CREATE POLICY "own profile insert" ON public.profiles FOR INSERT TO authenticated WITH CHECK ((select auth.uid()) = id);
CREATE POLICY "own profile update" ON public.profiles FOR UPDATE TO authenticated USING ((select auth.uid()) = id) WITH CHECK ((select auth.uid()) = id);

CREATE TABLE public.phrases (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  text text NOT NULL CHECK (char_length(text) BETWEEN 1 AND 2000),
  language_code text NOT NULL CHECK (char_length(language_code) BETWEEN 2 AND 35),
  translation text CHECK (translation IS NULL OR char_length(translation) <= 2000),
  status public.phrase_status NOT NULL DEFAULT 'learning',
  times_reviewed int NOT NULL DEFAULT 0,
  times_correct int NOT NULL DEFAULT 0,
  last_reviewed_at timestamptz,
  audio_path text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX phrases_user_status_idx ON public.phrases(user_id, status);
CREATE INDEX phrases_user_created_idx ON public.phrases(user_id, created_at DESC);
CREATE INDEX phrases_user_lang_idx ON public.phrases(user_id, language_code);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.phrases TO authenticated;
GRANT ALL ON public.phrases TO service_role;
ALTER TABLE public.phrases ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own phrases select" ON public.phrases FOR SELECT TO authenticated USING ((select auth.uid()) = user_id);
CREATE POLICY "own phrases insert" ON public.phrases FOR INSERT TO authenticated WITH CHECK ((select auth.uid()) = user_id);
CREATE POLICY "own phrases update" ON public.phrases FOR UPDATE TO authenticated USING ((select auth.uid()) = user_id) WITH CHECK ((select auth.uid()) = user_id);
CREATE POLICY "own phrases delete" ON public.phrases FOR DELETE TO authenticated USING ((select auth.uid()) = user_id);

CREATE OR REPLACE FUNCTION public.touch_updated_at() RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END $$;
CREATE TRIGGER profiles_touch BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
CREATE TRIGGER phrases_touch BEFORE UPDATE ON public.phrases FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

CREATE OR REPLACE FUNCTION public.handle_new_user() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles(id, display_name) VALUES (NEW.id, split_part(NEW.email,'@',1)) ON CONFLICT DO NOTHING;
  RETURN NEW;
END $$;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

CREATE OR REPLACE FUNCTION public.pick_round(_n int)
RETURNS SETOF public.phrases LANGUAGE sql VOLATILE SECURITY INVOKER SET search_path = public AS $$
  SELECT * FROM public.phrases
  WHERE user_id = auth.uid()
  ORDER BY (status = 'learned'), times_correct, random()
  LIMIT LEAST(GREATEST(_n,1),20);
$$;
REVOKE EXECUTE ON FUNCTION public.pick_round(int) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.pick_round(int) TO authenticated;

CREATE POLICY "own audio read" ON storage.objects FOR SELECT TO authenticated USING (bucket_id = 'phrase-audio' AND (storage.foldername(name))[1] = (select auth.uid())::text);
CREATE POLICY "own audio insert" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'phrase-audio' AND (storage.foldername(name))[1] = (select auth.uid())::text);
CREATE POLICY "own audio update" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'phrase-audio' AND (storage.foldername(name))[1] = (select auth.uid())::text);
CREATE POLICY "own audio delete" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'phrase-audio' AND (storage.foldername(name))[1] = (select auth.uid())::text);