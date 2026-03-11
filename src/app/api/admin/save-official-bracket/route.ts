import { NextRequest, NextResponse } from 'next/server'
import { isAdmin } from '@/lib/admin-auth'
import { createServerSupabaseClient } from '@/lib/supabase-server'

export async function POST(req: NextRequest) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let body: { rows: { matchup_index: number; winner_id: number }[] }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const { rows } = body
  if (!Array.isArray(rows)) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }

  const validated = rows
    .filter((r) => typeof r?.matchup_index === 'number' && typeof r?.winner_id === 'number')
    .filter((r) => r.matchup_index >= 0 && r.matchup_index <= 14)
    .map((r) => ({
      matchup_index: r.matchup_index,
      winner_id: r.winner_id,
      updated_at: new Date().toISOString(),
    }))

  try {
    const supabase = createServerSupabaseClient()

    // Replace entire bracket: delete existing rows, then insert new (allows clearing picks)
    const { error: deleteError } = await supabase.from('official_bracket').delete().gte('matchup_index', 0)
    if (deleteError) {
      return NextResponse.json({ error: deleteError.message }, { status: 500 })
    }

    // Insert the new rows (if any)
    if (validated.length > 0) {
      const { error: insertError } = await supabase.from('official_bracket').insert(validated)
      if (insertError) {
        return NextResponse.json({ error: insertError.message }, { status: 500 })
      }
    }

    return NextResponse.json({ success: true })
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : 'Save failed' },
      { status: 500 }
    )
  }
}
