'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import oreoLogo from '@/logo/oreoLogo.png'
import { supabase } from '@/lib/supabase'
import { oreos } from '@/lib/oreos'

const ROUND_LABELS: Record<number, string> = {
  0: 'R16 • Mar 16',
  1: 'R16 • Mar 17',
  2: 'R16 • Mar 18',
  3: 'R16 • Mar 19',
  4: 'R16 • Mar 20',
  5: 'R16 • Mar 23',
  6: 'R16 • Mar 24',
  7: 'R16 • Mar 25',
  8: 'QF 1',
  9: 'QF 2',
  10: 'QF 3',
  11: 'QF 4',
  12: 'SF 1',
  13: 'SF 2',
  14: 'Champion',
}

export default function AdminPage() {
  const [authenticated, setAuthenticated] = useState<boolean | null>(null)
  const [password, setPassword] = useState('')
  const [loginError, setLoginError] = useState('')
  const [loading, setLoading] = useState(false)
  const [officialResults, setOfficialResults] = useState<Record<number, number>>({})
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [saveError, setSaveError] = useState('')

  useEffect(() => {
    fetch('/api/admin/me')
      .then((r) => r.ok)
      .then(setAuthenticated)
      .catch(() => setAuthenticated(false))
  }, [])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setLoginError('')
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      })
      const data = await res.json()
      if (!res.ok) {
        setLoginError(data.error || 'Invalid password')
        return
      }
      setAuthenticated(true)
    } catch {
      setLoginError('Login failed')
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    await fetch('/api/admin/logout', { method: 'POST' })
    setAuthenticated(false)
  }

  useEffect(() => {
    if (!authenticated) return
    async function fetchResults() {
      const { data } = await supabase.from('official_bracket').select('matchup_index, winner_id')
      if (data) {
        const map: Record<number, number> = {}
        data.forEach((r) => { map[r.matchup_index] = r.winner_id })
        setOfficialResults(map)
      }
    }
    fetchResults()
  }, [authenticated])

  const handleSave = async () => {
    setSaving(true)
    setSaved(false)
    setSaveError('')
    try {
      const rows: { matchup_index: number; winner_id: number }[] = []
      for (let i = 0; i <= 14; i++) {
        const winnerId = officialResults[i]
        if (winnerId) {
          rows.push({ matchup_index: i, winner_id: winnerId })
        }
      }
      const res = await fetch('/api/admin/save-official-bracket', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rows }),
      })
      const data = await res.json().catch(() => ({}))

      if (!res.ok) {
        const msg = data.error || (res.status === 401 ? 'Session expired. Please log in again.' : 'Save failed')
        setSaveError(msg)
        return
      }
      setSaved(true)
      // Refetch to confirm save (read-only, still uses anon client)
      const { data: refetch } = await supabase.from('official_bracket').select('matchup_index, winner_id')
      if (refetch) {
        const map: Record<number, number> = {}
        refetch.forEach((r) => { map[r.matchup_index] = r.winner_id })
        setOfficialResults(map)
      }
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Save failed'
      if (msg.toLowerCase().includes('load failed') || msg.toLowerCase().includes('fetch failed')) {
        setSaveError('Network error. Check: 1) Supabase project not paused (restore in dashboard), 2) Env vars in .env.local')
      } else {
        setSaveError(msg)
      }
    }
    setSaving(false)
  }

  if (authenticated === null) {
    return (
      <main className="min-h-screen bg-white text-slate-900 flex items-center justify-center">
        <p className="text-slate-600">Loading...</p>
      </main>
    )
  }

  if (!authenticated) {
    return (
      <main className="min-h-screen bg-white text-slate-900">
        <div className="w-full max-w-[95vw] lg:max-w-screen-2xl mx-auto px-6 py-8">
          <div className="text-center mb-8">
            <Link href="/">
              <Image src={oreoLogo} alt="Oreo Madness" width={oreoLogo.width} height={oreoLogo.height} className="mx-auto mb-2 h-auto w-auto max-h-32" priority />
            </Link>
            <h1 className="text-2xl font-bold text-orange-500">Admin Login</h1>
            <p className="text-slate-600 text-sm mt-1">Enter password to set official bracket</p>
          </div>

          <form onSubmit={handleLogin} className="max-w-md mx-auto bg-slate-50 rounded-2xl p-8 border border-slate-200 shadow-lg space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2 text-slate-700">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Admin password"
                className="w-full px-4 py-3 rounded-xl bg-white border border-slate-300 focus:border-orange-500 focus:outline-none text-slate-900"
                autoFocus
              />
            </div>
            {loginError && <p className="text-red-400 text-sm">{loginError}</p>}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-orange-500 hover:bg-orange-400 disabled:bg-slate-300 rounded-xl font-bold transition text-white disabled:text-slate-500"
            >
              {loading ? 'Logging in...' : 'Login'}
            </button>
          </form>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-white text-slate-900">
      <div className="w-full max-w-[95vw] lg:max-w-screen-2xl mx-auto px-6 py-8">
        <div className="text-center mb-8">
          <Link href="/">
            <Image src={oreoLogo} alt="Oreo Madness" width={oreoLogo.width} height={oreoLogo.height} className="mx-auto mb-2 h-auto w-auto max-h-32" priority />
          </Link>
          <h1 className="text-2xl font-bold text-orange-500">Set Official Bracket</h1>
          <p className="text-slate-600 text-sm mt-1">Enter the actual winners as the competition progresses</p>
          <div className="flex justify-center gap-4 mt-2">
            <Link href="/leaderboard" className="text-orange-500 hover:underline text-sm">Leaderboard</Link>
            <button onClick={handleLogout} className="text-slate-600 hover:text-slate-900 text-sm">
              Logout
            </button>
          </div>
        </div>

        <div className="max-w-xl mx-auto bg-slate-50 rounded-2xl p-6 border border-slate-200 shadow-lg">
          <div className="space-y-4">
            {[...Array(15)].map((_, i) => (
              <div key={i} className="flex items-center gap-3">
                <label className="w-24 text-sm text-slate-600 shrink-0">{ROUND_LABELS[i]}</label>
                <select
                  value={officialResults[i] || ''}
                  onChange={(e) => setOfficialResults((prev) => ({ ...prev, [i]: parseInt(e.target.value, 10) }))}
                  className="flex-1 px-4 py-2 rounded-xl bg-white border border-slate-300 focus:border-orange-500 focus:outline-none text-slate-900"
                >
                  <option value="">-- Pick winner --</option>
                  {oreos.map((o) => (
                    <option key={o.id} value={o.id}>#{o.seed} {o.name}</option>
                  ))}
                </select>
              </div>
            ))}
          </div>

          {saveError && <p className="text-red-400 text-sm mt-4">{saveError}</p>}
          <button
            onClick={handleSave}
            disabled={saving}
            className="mt-6 w-full py-3 bg-orange-500 hover:bg-orange-400 disabled:bg-slate-300 rounded-xl font-bold transition text-white disabled:text-slate-500"
          >
            {saving ? 'Saving...' : saved ? 'Saved to database' : 'Save to Database'}
          </button>
        </div>
      </div>
    </main>
  )
}
