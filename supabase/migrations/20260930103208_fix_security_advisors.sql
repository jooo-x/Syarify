/*
# Fix security advisor findings

1. Views: Recreate leaderboard and statistik_literasi as SECURITY INVOKER.
2. Function: Set search_path on search_materi.
3. Privileges: Revoke unnecessary INSERT/UPDATE/DELETE on read-only content tables.
*/

-- 1a. Fix leaderboard view
DROP VIEW IF EXISTS public.leaderboard;
CREATE VIEW public.leaderboard
WITH (security_invoker = true)
AS
SELECT
  nama_panggilan,
  SUM(poin) AS total_poin,
  COUNT(*)::int AS permainan
FROM public.skor
GROUP BY nama_panggilan
ORDER BY total_poin DESC
LIMIT 50;

-- 1b. Fix statistik_literasi view
DROP VIEW IF EXISTS public.statistik_literasi;
CREATE VIEW public.statistik_literasi
WITH (security_invoker = true)
AS
SELECT
  kode_peserta,
  COUNT(*)::int AS total_uji,
  ROUND(AVG(skor), 1) AS rata_rata,
  MAX(skor) AS tertinggi
FROM public.uji_literasi
GROUP BY kode_peserta
ORDER BY rata_rata DESC;

-- 2. Fix function search_path
ALTER FUNCTION public.search_materi(text[], integer) SET search_path = public;

-- 3. Revoke unnecessary privileges on content tables
REVOKE INSERT, UPDATE, DELETE ON public.modul FROM anon, authenticated;
REVOKE INSERT, UPDATE, DELETE ON public.materi FROM anon, authenticated;
REVOKE INSERT, UPDATE, DELETE ON public.istilah FROM anon, authenticated;
REVOKE INSERT, UPDATE, DELETE ON public.soal FROM anon, authenticated;
REVOKE INSERT, UPDATE, DELETE ON public.skenario_akad FROM anon, authenticated;
REVOKE UPDATE, DELETE ON public.skor FROM anon, authenticated;
REVOKE UPDATE, DELETE ON public.uji_literasi FROM anon, authenticated;

-- skor + uji_literasi need SELECT for the security_invoker views to work
GRANT SELECT ON public.skor TO anon, authenticated;
GRANT SELECT ON public.uji_literasi TO anon, authenticated;
GRANT SELECT ON public.leaderboard TO anon, authenticated;
GRANT SELECT ON public.statistik_literasi TO anon, authenticated;
