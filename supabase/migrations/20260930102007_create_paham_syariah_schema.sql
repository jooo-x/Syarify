/*
# Paham Syariah: Initial Database Schema

## Overview
Full schema for the Paham Syariah educational web app — tables for learning content,
quiz/simulation data, player scores, and literacy assessments.

## New Tables
- `modul` — Learning modules (slug, judul, ringkasan, urutan, sumber_bab)
- `materi` — Learning materials per module (judul, isi, halaman_buku, perlu_verifikasi, full-text search)
- `istilah` — Glossary of Arabic/Islamic finance terms (istilah, arab, arti, contoh, modul_slug)
- `soal` — Quiz questions with JSONB options (pertanyaan, opsi, jawaban, penjelasan)
- `skenario_akad` — Contract simulation scenarios (cerita, akad_benar, opsi, penjelasan)
- `skor` — Player scores (nama_panggilan, poin, sumber)
- `uji_literasi` — Pre/post literacy test scores for research

## Views
- `leaderboard` — Top 50 players by total points
- `statistik_literasi` — Average pre/post literacy scores

## Security
- RLS enabled on ALL tables
- Content tables (modul, materi, istilah, soal, skenario_akad): public SELECT for anon+authenticated
- Player tables (skor, uji_literasi): public INSERT only (read via views)

## Functions
- `search_materi(terms, lim)` — Full-text search across materi for AI assistant
*/

-- ========== KONTEN ==========
CREATE TABLE IF NOT EXISTS modul (
  id serial PRIMARY KEY,
  slug text UNIQUE NOT NULL,
  judul text NOT NULL,
  ringkasan text,
  urutan int NOT NULL DEFAULT 0,
  sumber_bab text
);

CREATE TABLE IF NOT EXISTS materi (
  id serial PRIMARY KEY,
  modul_id int NOT NULL REFERENCES modul(id) ON DELETE CASCADE,
  judul text NOT NULL,
  isi text NOT NULL,
  halaman_buku text,
  perlu_verifikasi boolean NOT NULL DEFAULT false,
  fts tsvector GENERATED ALWAYS AS (
    to_tsvector('simple', coalesce(judul, '') || ' ' || coalesce(isi, ''))
  ) STORED
);
CREATE INDEX IF NOT EXISTS materi_fts_idx ON materi USING gin (fts);

CREATE TABLE IF NOT EXISTS istilah (
  id serial PRIMARY KEY,
  istilah text NOT NULL,
  arab text,
  arti text NOT NULL,
  contoh text,
  modul_slug text
);

CREATE TABLE IF NOT EXISTS soal (
  id serial PRIMARY KEY,
  modul_slug text,
  pertanyaan text NOT NULL,
  opsi jsonb NOT NULL,
  jawaban int NOT NULL,
  penjelasan text NOT NULL
);

CREATE TABLE IF NOT EXISTS skenario_akad (
  id serial PRIMARY KEY,
  cerita text NOT NULL,
  akad_benar text NOT NULL,
  opsi jsonb NOT NULL,
  penjelasan text NOT NULL
);

-- ========== DATA PEMAIN ==========
CREATE TABLE IF NOT EXISTS skor (
  id bigserial PRIMARY KEY,
  nama_panggilan text NOT NULL CHECK (char_length(nama_panggilan) BETWEEN 2 AND 20),
  poin int NOT NULL CHECK (poin BETWEEN 0 AND 1000),
  sumber text NOT NULL CHECK (sumber IN ('kuis', 'simulasi', 'tantangan_harian')),
  dibuat timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS uji_literasi (
  id bigserial PRIMARY KEY,
  kode_peserta text NOT NULL CHECK (char_length(kode_peserta) BETWEEN 3 AND 20),
  tahap text NOT NULL CHECK (tahap IN ('pre', 'post')),
  skor int NOT NULL CHECK (skor BETWEEN 0 AND 100),
  kelompok_usia text CHECK (kelompok_usia IN ('remaja', 'dewasa', 'lansia')),
  dibuat timestamptz NOT NULL DEFAULT now()
);

CREATE OR REPLACE VIEW leaderboard AS
  SELECT nama_panggilan, sum(poin)::int AS total_poin, count(*)::int AS permainan
  FROM skor
  GROUP BY nama_panggilan
  ORDER BY total_poin DESC
  LIMIT 50;

CREATE OR REPLACE VIEW statistik_literasi AS
  SELECT tahap, count(*)::int AS jumlah, round(avg(skor), 1) AS rata_rata
  FROM uji_literasi
  GROUP BY tahap;

-- ========== RLS ==========
ALTER TABLE modul ENABLE ROW LEVEL SECURITY;
ALTER TABLE materi ENABLE ROW LEVEL SECURITY;
ALTER TABLE istilah ENABLE ROW LEVEL SECURITY;
ALTER TABLE soal ENABLE ROW LEVEL SECURITY;
ALTER TABLE skenario_akad ENABLE ROW LEVEL SECURITY;
ALTER TABLE skor ENABLE ROW LEVEL SECURITY;
ALTER TABLE uji_literasi ENABLE ROW LEVEL SECURITY;

-- Content: public read
DROP POLICY IF EXISTS "baca modul" ON modul;
CREATE POLICY "baca modul" ON modul FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "baca materi" ON materi;
CREATE POLICY "baca materi" ON materi FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "baca istilah" ON istilah;
CREATE POLICY "baca istilah" ON istilah FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "baca soal" ON soal;
CREATE POLICY "baca soal" ON soal FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "baca skenario" ON skenario_akad;
CREATE POLICY "baca skenario" ON skenario_akad FOR SELECT TO anon, authenticated USING (true);

-- Player data: insert only (read via views)
DROP POLICY IF EXISTS "kirim skor" ON skor;
CREATE POLICY "kirim skor" ON skor FOR INSERT TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "kirim uji" ON uji_literasi;
CREATE POLICY "kirim uji" ON uji_literasi FOR INSERT TO anon, authenticated WITH CHECK (true);

-- ========== SEARCH FUNCTION ==========
CREATE OR REPLACE FUNCTION search_materi(terms text[], lim int DEFAULT 4)
RETURNS TABLE (id int, judul text, isi text, modul_judul text, halaman_buku text, rank real)
LANGUAGE sql STABLE AS $$
  SELECT m.id, m.judul, m.isi, d.judul AS modul_judul, m.halaman_buku,
         ts_rank(m.fts, to_tsquery('simple', array_to_string(terms, ' | '))) AS rank
  FROM materi m
  JOIN modul d ON d.id = m.modul_id
  WHERE coalesce(array_length(terms, 1), 0) > 0
    AND m.fts @@ to_tsquery('simple', array_to_string(terms, ' | '))
  ORDER BY rank DESC
  LIMIT lim;
$$;
