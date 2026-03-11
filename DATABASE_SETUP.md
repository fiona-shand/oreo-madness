# Oreo Madness – Database Setup

## 1. Fix environment variables

Your `.env` or `.env.local` must use this format (no `export`):

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

Get these values from [Supabase Dashboard](https://supabase.com/dashboard) → Your Project → **Settings** → **API**.

---

## 2. Create the database tables

1. Open [Supabase Dashboard](https://supabase.com/dashboard) → your project
2. Go to **SQL Editor**
3. Run the contents of `supabase-setup.sql`:

```sql
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

ALTER TABLE participants ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public insert" ON participants
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public read" ON participants
  FOR SELECT USING (true);

CREATE INDEX IF NOT EXISTS idx_participants_username ON participants(username);
CREATE INDEX IF NOT EXISTS idx_participants_created_at ON participants(created_at DESC);
```

4. Run the **official bracket** table (for comparing brackets to real winners). In a new query, run `supabase-official-bracket.sql` or:

```sql
CREATE TABLE IF NOT EXISTS official_bracket (
  matchup_index INTEGER PRIMARY KEY,
  winner_id INTEGER NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
ALTER TABLE official_bracket ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read official_bracket" ON official_bracket FOR SELECT USING (true);
CREATE POLICY "Allow public insert official_bracket" ON official_bracket FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update official_bracket" ON official_bracket FOR UPDATE USING (true);
```

5. Click **Run** (or press Cmd+Enter).

---

## 3. Restart the dev server

After changing `.env` or `.env.local`:

```bash
# Stop the server (Ctrl+C) then:
npm run dev
```

---

## 4. Set admin password

In `.env.local`, set `ADMIN_PASSWORD` to a secret only you know. This protects `/admin` where you enter the official bracket winners.

```
ADMIN_PASSWORD=your-secret-password
```

Restart the dev server after changing.

## 6. Set the official bracket (optional)

When the real competition has winners, go to **/admin** on your site, log in with your password, and enter the actual winners for each round. The leaderboard will automatically calculate everyone's scores.

## 7. Verify the connection

1. Register with a new username
2. Make bracket picks
3. Click **Save Bracket**
4. In Supabase, open **Table Editor** → `participants` and confirm your row appears.

5. Visit **/leaderboard** to see all participants. Visit **/admin** and log in with your ADMIN_PASSWORD to set the official bracket.

---

## Troubleshooting

### "Could not find the table 'public.official_bracket' in the schema cache"

The `official_bracket` table hasn’t been created yet. Create it by running the SQL in **Supabase Dashboard** → **SQL Editor**:

1. Copy the contents of `supabase-official-bracket.sql`
2. Paste into a new query
3. Click **Run**

You can also run the full `supabase-setup.sql` (it creates both `participants` and `official_bracket`).

### "TypeError: Load failed" when saving official results

This is usually a network/connection issue:

1. **Supabase project paused** – Free-tier projects pause after inactivity. In [Supabase Dashboard](https://supabase.com/dashboard), open your project and click **Restore** if it’s paused.
2. **Env vars** – Ensure `.env.local` has valid `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` and restart the dev server.
3. **Network** – Try another network (e.g. mobile hotspot) to rule out firewall/ad blocker issues.
