-- Add sumber table and new columns for v3 data
CREATE TABLE IF NOT EXISTS sumber (
  id text PRIMARY KEY,
  jenis text NOT NULL,
  judul text NOT NULL,
  penulis text NOT NULL,
  tahun int,
  catatan text NOT NULL
);

-- Add sumber_id columns
ALTER TABLE materi ADD COLUMN IF NOT EXISTS sumber_id text REFERENCES sumber(id);
ALTER TABLE istilah ADD COLUMN IF NOT EXISTS sumber_id text REFERENCES sumber(id);
ALTER TABLE soal ADD COLUMN IF NOT EXISTS sumber_id text REFERENCES sumber(id);
ALTER TABLE soal ADD COLUMN IF NOT EXISTS jawaban_teks text;
ALTER TABLE skenario_akad ADD COLUMN IF NOT EXISTS sumber_id text REFERENCES sumber(id);

-- Update jawaban_teks from existing data
UPDATE soal SET jawaban_teks = opsi->>jawaban WHERE jawaban_teks IS NULL;

-- RLS for sumber table
ALTER TABLE sumber ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "baca sumber" ON sumber;
CREATE POLICY "baca sumber" ON sumber FOR SELECT TO anon, authenticated USING (true);
GRANT SELECT ON sumber TO anon, authenticated;

-- Clear old content data and re-seed from v3
DELETE FROM skenario_akad;
DELETE FROM soal;
DELETE FROM istilah;
DELETE FROM materi;
DELETE FROM modul;
DELETE FROM sumber;
