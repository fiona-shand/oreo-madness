-- OREO MADNESS DATABASE SETUP
-- Run this in Supabase SQL Editor

-- Create participants table
CREATE TABLE IF NOT EXISTS participants (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  votes JSONB NOT NULL DEFAULT '{}',
  email TEXT,
  score INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE participants ENABLE ROW LEVEL SECURITY;

-- Allow anyone to insert
CREATE POLICY "Allow public insert" ON participants
  FOR INSERT WITH CHECK (true);

-- Allow anyone to read
CREATE POLICY "Allow public read" ON participants
  FOR SELECT USING (true);

-- Index for faster lookups
CREATE INDEX IF NOT EXISTS idx_participants_username ON participants(username);
CREATE INDEX IF NOT EXISTS idx_participants_created_at ON participants(created_at DESC);

-- Official bracket results: matchup_index 0-14, winner_id per matchup
-- Set these as the real competition plays out (use /admin page)
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
