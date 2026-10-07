-- 1. Tighten INSERT policies on skor: add WITH CHECK that constrains poin and sumber values
--    The old policy used WITH CHECK (true), meaning any row shape was accepted as long as
--    the DB CHECK constraints passed. The DB constraints are good (poin 0-1000, sumber enum,
--    nama 2-20 chars) so this is defence-in-depth rather than a fix for a live exploit.
DROP POLICY IF EXISTS "kirim skor" ON public.skor;
CREATE POLICY "kirim skor" ON public.skor
  FOR INSERT TO anon, authenticated
  WITH CHECK (
    char_length(nama_panggilan) BETWEEN 2 AND 20
    AND poin BETWEEN 0 AND 1000
    AND sumber IN ('kuis', 'simulasi', 'tantangan_harian')
  );

-- 2. Same for uji_literasi
DROP POLICY IF EXISTS "kirim uji" ON public.uji_literasi;
CREATE POLICY "kirim uji" ON public.uji_literasi
  FOR INSERT TO anon, authenticated
  WITH CHECK (
    char_length(kode_peserta) BETWEEN 3 AND 20
    AND skor BETWEEN 0 AND 100
    AND tahap IN ('pre', 'post')
  );

-- 3. Restrict EXECUTE on search_materi to authenticated only (was PUBLIC by default)
REVOKE EXECUTE ON FUNCTION public.search_materi(text[], integer) FROM anon;
GRANT EXECUTE ON FUNCTION public.search_materi(text[], integer) TO authenticated;
