import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { calculateScore } from '@/lib/scoring'

export type LeaderboardParticipant = {
  id: string
  username: string
  first_name: string
  last_name: string
  votes: Record<string, number>
  score: number
  created_at: string
}

export async function GET() {
  try {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    if (!url || !key) {
      return NextResponse.json({ error: 'Supabase not configured' }, { status: 500 })
    }
    const supabase = createClient(url, key)

    const [participantsRes, resultsRes] = await Promise.all([
      supabase
        .from('participants')
        .select('id, username, first_name, last_name, votes, created_at')
        .order('created_at', { ascending: false }),
      supabase.from('official_bracket').select('matchup_index, winner_id'),
    ])

    const resultsMap: Record<number, number> = {}
    if (resultsRes.data && !resultsRes.error) {
      resultsRes.data.forEach((r) => {
        resultsMap[Number(r.matchup_index)] = Number(r.winner_id)
      })
    }

    const hasResults = Object.keys(resultsMap).length > 0

    const participants: LeaderboardParticipant[] = (participantsRes.data || []).map((p) => ({
      id: p.id,
      username: p.username,
      first_name: p.first_name,
      last_name: p.last_name,
      votes: p.votes ?? {},
      score: hasResults ? calculateScore(p.votes ?? {}, resultsMap) : 0,
      created_at: p.created_at,
    }))

    participants.sort((a, b) => b.score - a.score)

    return NextResponse.json({
      participants,
      hasOfficialResults: hasResults,
    })
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : 'Failed to load leaderboard' },
      { status: 500 }
    )
  }
}
