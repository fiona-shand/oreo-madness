-- Run this in Supabase SQL Editor to add the official bracket table
-- (for comparing participant brackets to the real winners)

CREATE TABLE IF NOT EXISTS official_bracket (
  matchup_index INTEGER PRIMARY KEY,
  winner_id INTEGER NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE official_bracket ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public read official_bracket" ON official_bracket;
CREATE POLICY "Allow public read official_bracket" ON official_bracket
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow public insert official_bracket" ON official_bracket;
CREATE POLICY "Allow public insert official_bracket" ON official_bracket
  FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public update official_bracket" ON official_bracket;
CREATE POLICY "Allow public update official_bracket" ON official_bracket
  FOR UPDATE USING (true);
