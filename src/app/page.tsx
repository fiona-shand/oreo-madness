'use client'

import { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import oreoLogo from '@/logo/oreoLogo.png'
import { supabase } from '@/lib/supabase'
import { getOreoById, getOreoImageById } from '@/lib/oreos'
import Bracket from '@/components/Bracket'

type User = {
  username: string
  firstName: string
  lastName: string
}

type Vote = {
  matchupIndex: number
  winnerId: number
}

export default function Home() {
  const [step, setStep] = useState<'register' | 'vote' | 'results'>('register')
  const [user, setUser] = useState<User | null>(null)
  const [username, setUsername] = useState('')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [usernameError, setUsernameError] = useState('')
  const [votes, setVotes] = useState<Vote[]>([])
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [email, setEmail] = useState('')
  const [dbError, setDbError] = useState('')
  const [officialResults, setOfficialResults] = useState<Record<number, number>>({})

  const confettiFired = useRef(false)

  // Fetch official bracket for score display
  useEffect(() => {
    supabase.from('official_bracket').select('matchup_index, winner_id').then(({ data }) => {
      if (data) {
        const map: Record<number, number> = {}
        data.forEach((r) => { map[r.matchup_index] = r.winner_id })
        setOfficialResults(map)
      }
    })
  }, [])

  // Fire confetti instantly when results screen appears (script preloaded in layout)
  useEffect(() => {
    if (step !== 'results' || confettiFired.current) return
    confettiFired.current = true

    try {
      const confettiFn = (window as unknown as { confetti?: (opts: object) => void }).confetti
      if (typeof confettiFn !== 'function') return

      const colors = ['#f97316', '#fb923c', '#fdba74', '#fed7aa', '#fff7ed']
      const duration = 3 * 1000
      const end = Date.now() + duration

      const frame = () => {
        if (Date.now() > end) return
        try {
          confettiFn({ particleCount: 4, angle: 60, spread: 55, startVelocity: 50, origin: { x: 0.2, y: 0.5 }, colors })
          confettiFn({ particleCount: 4, angle: 120, spread: 55, startVelocity: 50, origin: { x: 0.8, y: 0.5 }, colors })
        } catch {
          // ignore confetti errors
        }
        requestAnimationFrame(frame)
      }
      frame()
    } catch {
      // confetti not available or failed - continue without it
    }
  }, [step])

  const checkUsername = async () => {
    if (!username.trim()) {
      setUsernameError('Username is required')
      return
    }
    
    try {
      const { data, error } = await supabase
        .from('participants')
        .select('username')
        .eq('username', username.toLowerCase())
        .single()
    
      if (data) {
        setUsernameError('Username already taken! Please choose another.')
      } else {
        setUsernameError('')
      }
    } catch (e) {
      // Table might not exist yet - allow it
      setUsernameError('')
    }
  }

  const register = async () => {
    if (!username.trim() || !firstName.trim() || !lastName.trim()) {
      setUsernameError('All fields are required')
      return
    }

    // Check username (may fail if table doesn't exist)
    try {
      const { data: existing } = await supabase
        .from('participants')
        .select('username')
        .eq('username', username.toLowerCase())
        .single()
    
      if (existing) {
        setUsernameError('Username already taken!')
        return
      }
    } catch (e) {
      // Table doesn't exist - continue
    }

    setUser({ username: username.toLowerCase(), firstName, lastName })
    setStep('vote')
  }

  const saveBracket = async () => {
    if (!user) return
    setSaving(true)
    setDbError('')

    // Build votes object
    const votesObject: Record<number, number> = {}
    votes.forEach(v => {
      votesObject[v.matchupIndex] = v.winnerId
    })

    try {
      const { error } = await supabase
        .from('participants')
        .insert({
          username: user.username,
          first_name: user.firstName,
          last_name: user.lastName,
          votes: votesObject,
          email: email || null,
          created_at: new Date().toISOString()
        })

      if (error) {
        console.error('Supabase error:', error)
        // Try saving to localStorage as fallback
        const localData = {
          username: user.username,
          firstName: user.firstName,
          lastName: user.lastName,
          votes: votesObject,
          email: email,
          savedAt: new Date().toISOString()
        }
        localStorage.setItem('oreoBracket', JSON.stringify(localData))
        setSaved(true)
        setStep('results')
      } else {
        setSaved(true)
        setStep('results')
      }
    } catch (e) {
      // Save to localStorage as fallback
      const localData = {
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
        votes: votesObject,
        email: email,
        savedAt: new Date().toISOString()
      }
      localStorage.setItem('oreoBracket', JSON.stringify(localData))
      setSaved(true)
      setStep('results')
    }
    setSaving(false)
  }

  return (
    <main className="min-h-screen bg-white text-slate-900 w-full">
      <div className="w-full max-w-[100vw] mx-auto px-2 sm:px-4 py-2">
        {/* Header */}
        <div className="text-center mb-4">
          <Link href="/">
            <Image
              src={oreoLogo}
              alt="Oreo Madness"
              width={oreoLogo.width}
              height={oreoLogo.height}
              className="mx-auto mb-1 h-auto w-auto max-h-24 md:max-h-28"
              priority
            />
          </Link>
          <p className="text-slate-600 text-sm">Predict the Best Oreo Bracket</p>
          <Link href="/leaderboard" className="text-orange-500 hover:underline text-sm mt-2 inline-block">View Leaderboard →</Link>
        </div>

        <div className="origin-top">
        {step === 'register' && (
          <div className="max-w-xl mx-auto bg-slate-50 rounded-2xl p-5 shadow-lg border border-slate-200">
            <h2 className="text-xl font-bold mb-4 text-center">Create Your Bracket</h2>
            
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium mb-2 text-slate-700">Username</label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value.toLowerCase())}
                  onBlur={checkUsername}
                  placeholder=""
                  className="w-full px-3 py-2 rounded-lg bg-white border border-slate-300 focus:border-orange-500 focus:outline-none placeholder-slate-400 text-slate-900"
                />
                {usernameError && (
                  <p className="text-red-400 text-sm mt-2">{usernameError}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2 text-slate-700">First Name</label>
                  <input
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder=""
                    className="w-full px-3 py-2 rounded-lg bg-white border border-slate-300 focus:border-orange-500 focus:outline-none placeholder-slate-400 text-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2 text-slate-700">Last Name</label>
                  <input
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder=""
                    className="w-full px-3 py-2 rounded-lg bg-white border border-slate-300 focus:border-orange-500 focus:outline-none placeholder-slate-400 text-slate-900"
                  />
                </div>
              </div>

              <button
                onClick={register}
                disabled={!username || !firstName || !lastName}
                className="w-full py-3 bg-orange-500 hover:bg-orange-400 disabled:bg-slate-300 disabled:cursor-not-allowed rounded-xl font-bold text-lg transition shadow-lg text-white"
              >
                Start Picking!
              </button>
            </div>
          </div>
        )}

        {step === 'vote' && user && (
          <div className="space-y-4 w-full max-w-[100vw] overflow-x-auto">
            <div className="text-center">
              <h2 className="text-xl font-bold mb-1">Make Your Picks</h2>
              <p className="text-slate-600">Click any matchup to pick your winner</p>
            </div>

            <div className="w-full min-w-max">
              <Bracket votes={votes} onVoteChange={setVotes} />
            </div>

            {/* Save section */}
            {votes.length > 0 && (
              <div className="max-w-xl mx-auto bg-slate-50 rounded-2xl p-4 space-y-3 border border-slate-200 shadow-lg">
                <h3 className="text-lg font-bold text-center">Save Your Bracket!</h3>
                
                {votes.length < 15 && (
                  <p className="text-center text-amber-600 text-sm">
                    {votes.length < 8
                      ? `Pick all 8 Round of 16 matchups first`
                      : `You've picked ${votes.length}/15 — complete the bracket to pick your champion!`}
                  </p>
                )}
                
                <div>
                  <label className="block text-sm font-medium mb-2 text-slate-700">
                    Email (optional - we'll send you a copy)
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder=""
                    className="w-full px-3 py-2 rounded-lg bg-white border border-slate-300 focus:border-orange-500 focus:outline-none placeholder-slate-400 text-slate-900"
                  />
                </div>

                {dbError && (
                  <p className="text-amber-400 text-sm text-center">{dbError}</p>
                )}

                <button
                  onClick={saveBracket}
                  disabled={saving}
                  className="w-full py-3 bg-green-500 hover:bg-green-400 disabled:bg-slate-300 rounded-xl font-bold text-lg transition shadow-lg text-white disabled:text-slate-500"
                >
                  {saving ? 'Saving...' : 'Save Bracket'}
                </button>
              </div>
            )}
          </div>
        )}

        {step === 'results' && user && (() => {
          try {
            const champVote = votes.find(v => v.matchupIndex === 14)
            const winnerId = champVote ? Number(champVote.winnerId) : undefined
            const champ = winnerId != null ? getOreoById(winnerId) : null
            const champImg = winnerId != null ? getOreoImageById(winnerId) : null
            if (!champ || !champImg) return <p className="text-center text-slate-600 py-8">Complete your bracket to pick a champion.</p>
            return (
              <div className="relative min-h-[75vh] flex flex-col items-center justify-center py-12 px-4">
                <div className="absolute inset-0 bg-gradient-to-b from-orange-50 via-white to-amber-50" />
                <div className="relative flex flex-col items-center gap-8 max-w-3xl mx-auto animate-champion-reveal">
                  <div className="text-center space-y-2">
                    <p className="text-orange-500 font-bold text-sm uppercase tracking-[0.2em]">Bracket complete</p>
                    <h2 className="text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight">YOUR CHAMPION</h2>
                  </div>
                  <div className="relative">
                    <div className="absolute -inset-4 bg-gradient-to-r from-orange-400 to-amber-500 rounded-3xl blur-xl opacity-30" />
                    <div className="relative rounded-2xl border-4 border-orange-500 bg-white p-8 shadow-2xl ring-4 ring-orange-200/50">
                      <Image src={champImg} alt={champ.name} width={220} height={220} className="rounded-[5px] object-cover mx-auto" />
                    </div>
                  </div>
                  <div className="text-center space-y-1">
                    <p className="text-3xl md:text-4xl font-black text-orange-600">#{champ.seed} {champ.name}</p>
                    <p className="text-slate-500 font-medium">The undisputed winner</p>
                  </div>
                </div>
              </div>
            )
          } catch (e) {
            console.error('Results render error:', e)
            return (
              <div className="py-12 text-center">
                <p className="text-slate-600 mb-4">Bracket saved! Thanks for playing.</p>
                <Link href="/leaderboard" className="text-orange-500 hover:underline">View Leaderboard</Link>
              </div>
            )
          }
        })()}
        </div>
      </div>
    </main>
  )
}
