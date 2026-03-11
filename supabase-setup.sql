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

-- Table for actual results (you'll update this as the real competition happens)
CREATE TABLE IF NOT EXISTS results (
  id INTEGER PRIMARY KEY,
  matchup_index INTEGER NOT NULL,
  winner_id INTEGER NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Allow anyone to read results
CREATE POLICY "Allow public read results" ON results
  FOR SELECT USING (true);

-- Allow anyone to update results
CREATE POLICY "Allow public update results" ON results
  FOR UPDATE USING (true);

-- Insert Round 1 results (update as competition progresses)
-- Format: (id, matchup_index, winner_id)
-- INSERT INTO results (id, matchup_index, winner_id) VALUES 
--   (1, 0, 1),  -- Classic beat Toffee Crunch
--   (2, 1, 2),  -- Mint beat Dark Chocolate
--   ...
