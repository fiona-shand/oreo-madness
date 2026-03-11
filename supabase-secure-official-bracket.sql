-- SECURE official_bracket: Remove public write access
-- Run this in Supabase SQL Editor after initial setup
-- Only admins (via API with service role) can write; anyone can read

DROP POLICY IF EXISTS "Allow public insert official_bracket" ON official_bracket;
DROP POLICY IF EXISTS "Allow public update official_bracket" ON official_bracket;

-- Keep read - anyone can view official results
-- (INSERT and UPDATE policies removed = only service role can write)
