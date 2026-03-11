'use client'

import { useState } from 'react'
import { getOreoById } from '@/lib/oreos'

type Vote = {
  matchupIndex: number
  winnerId: number
}

type BracketProps = {
  votes: Vote[]
  onVoteChange: (votes: Vote[]) => void
}

const matchups = [
  { idx: 0, date: 'Mar 16', seed1: 1, seed2: 9 },
  { idx: 1, date: 'Mar 17', seed1: 8, seed2: 10 },
  { idx: 2, date: 'Mar 18', seed1: 5, seed2: 11 },
  { idx: 3, date: 'Mar 19', seed1: 4, seed2: 12 },
  { idx: 4, date: 'Mar 20', seed1: 6, seed2: 13 },
  { idx: 5, date: 'Mar 23', seed1: 3, seed2: 14 },
  { idx: 6, date: 'Mar 24', seed1: 7, seed2: 15 },
  { idx: 7, date: 'Mar 25', seed1: 2, seed2: 16 },
]

export default function Bracket({ votes, onVoteChange }: BracketProps) {
  const [selectedMatchup, setSelectedMatchup] = useState<{round: string, idx: number, seed1: number, seed2: number} | null>(null)

  const getModalTitle = () => {
    if (!selectedMatchup) return ''
    if (selectedMatchup.round === 'r16') return matchups[selectedMatchup.idx]?.date ?? ''
    if (selectedMatchup.round === 'qf') return 'Quarterfinal'
    if (selectedMatchup.round === 'sf') return 'Semifinal'
    return 'Championship'
  }

  const getWinner = (idx: number) => votes.find(v => v.matchupIndex === idx)?.winnerId ?? null

  // Bracket progression: QF 8,9 feed left SF 12; QF 10,11 feed right SF 13; SF 12,13 feed Final 14
  const getQFMatchup = (qfIdx: number): [number, number] => {
    const pairs: [number, number][] = [[0, 1], [2, 3], [4, 5], [6, 7]]
    const [a, b] = pairs[qfIdx]
    const wa = getWinner(a), wb = getWinner(b)
    return (wa && wb) ? [wa, wb] : [0, 0]
  }
  const getSFMatchup = (sfIdx: number): [number, number] => {
    const pairs: [number, number][] = [[8, 9], [10, 11]]
    const [a, b] = pairs[sfIdx]
    const wa = getWinner(a), wb = getWinner(b)
    return (wa && wb) ? [wa, wb] : [0, 0]
  }
  const getFinalMatchup = (): [number, number] => {
    const wa = getWinner(12), wb = getWinner(13)
    return (wa && wb) ? [wa, wb] : [0, 0]
  }

  const r16Done = votes.filter(v => v.matchupIndex < 8).length === 8
  const qfDone = votes.filter(v => v.matchupIndex >= 8 && v.matchupIndex < 12).length === 4
  const sfDone = votes.filter(v => v.matchupIndex >= 12 && v.matchupIndex < 14).length === 2

  const handlePick = (winnerId: number) => {
    if (!selectedMatchup) return
    const { round, idx } = selectedMatchup

    let matchupIndex: number
    if (round === 'r16') matchupIndex = idx
    else if (round === 'qf') matchupIndex = 8 + idx
    else if (round === 'sf') matchupIndex = 12 + idx
    else matchupIndex = 14 // final

    const newVotes = votes.filter(v => v.matchupIndex !== matchupIndex)
    newVotes.push({ matchupIndex, winnerId })
    onVoteChange(newVotes)
    setSelectedMatchup(null)
  }

  const OreoLine = ({ id, isWinner }: { id: number | null; isWinner: boolean }) => {
    const o = id ? getOreoById(id) : null
    if (!o) return <div className="text-slate-500 text-center">TBD</div>
    return (
      <div className={`text-center ${isWinner ? 'text-orange-400 font-bold' : 'text-slate-300'}`}>
        <span className="text-slate-500 font-medium">#{o.seed}</span> {o.name}
      </div>
    )
  }

  const MatchupBox = ({
    round,
    idx,
    seed1,
    seed2,
    disabled,
    matchupIndex,
  }: {
    round: string
    idx: number
    seed1: number
    seed2: number
    disabled?: boolean
    matchupIndex?: number
  }) => {
    const mi = matchupIndex ?? (round === 'r16' ? idx : round === 'qf' ? 8 + idx : round === 'sf' ? 12 + idx : 14)
    const winner = getWinner(mi)
    const o1 = getOreoById(seed1)
    const o2 = getOreoById(seed2)

    return (
      <button
        onClick={() => !disabled && setSelectedMatchup({ round, idx, seed1, seed2 })}
        disabled={disabled}
        className={`
          ${boxWidth} p-4 rounded-2xl border text-sm leading-snug transition-all
          ${disabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}
          ${winner ? 'border-green-500 bg-green-500/20' : 'border-slate-600 bg-slate-800 hover:border-orange-500'}
        `}
      >
        <div className="flex flex-col gap-1">
          <OreoLine id={seed1} isWinner={winner === (o1?.id ?? seed1)} />
          <div className="text-slate-500 text-xs text-center">vs</div>
          <OreoLine id={seed2} isWinner={winner === (o2?.id ?? seed2)} />
        </div>
      </button>
    )
  }

  const boxWidth = 'w-60 min-w-60'
  const ConnectorV = () => <div className="w-10 shrink-0 border-r-2 border-slate-500 self-stretch" />
  const bracketH = 760
  const rowGap = 'gap-12'

  return (
    <div className="w-full py-8">
      <div className="overflow-x-auto flex justify-center min-w-0">
        <div className="flex items-stretch gap-0">
          {/* LEFT HALF */}
          <div className="flex items-center shrink-0 gap-0">
            <div className={`flex flex-col justify-around ${rowGap}`} style={{ height: bracketH }}>
              {matchups.slice(0, 4).map((m, i) => (
                <div key={i} className="h-28 flex items-center">
                  <MatchupBox round="r16" idx={i} seed1={m.seed1} seed2={m.seed2} disabled={r16Done} />
                </div>
              ))}
            </div>
            <ConnectorV />
            <div className={`flex flex-col justify-around pl-12 ${rowGap}`} style={{ height: bracketH }}>
              {[0, 1].map((i) => {
                const [s1, s2] = r16Done ? getQFMatchup(i) : [0, 0]
                return (
                  <div key={i} className="h-28 flex items-center">
                    <MatchupBox round="qf" idx={i} seed1={s1} seed2={s2} disabled={!r16Done} />
                  </div>
                )
              })}
            </div>
            <ConnectorV />
            <div className={`flex flex-col justify-around pl-12 ${rowGap}`} style={{ height: bracketH }}>
              <div className="h-28 flex items-center">
                {(() => {
                  const [s1, s2] = qfDone ? getSFMatchup(0) : [0, 0]
                  return <MatchupBox round="sf" idx={0} seed1={s1} seed2={s2} disabled={!qfDone} matchupIndex={12} />
                })()}
              </div>
            </div>
          </div>

          {/* CENTER - Championship: 1 (left) vs 1 (right) */}
          <div className="flex flex-col items-center justify-center px-12 shrink-0 border-x-2 border-slate-500 mx-16">
            <div className="h-28 flex items-center">
              {(() => {
                const [s1, s2] = sfDone ? getFinalMatchup() : [0, 0]
                return (
                  <MatchupBox
                    round="final"
                    idx={0}
                    seed1={s1}
                    seed2={s2}
                    disabled={!sfDone}
                    matchupIndex={14}
                  />
                )
              })()}
            </div>
          </div>

          {/* RIGHT HALF */}
          <div className="flex items-center shrink-0 gap-0">
            <div className={`flex flex-col justify-center pr-12 ${rowGap}`} style={{ height: bracketH }}>
              {(() => {
                const [s1, s2] = qfDone ? getSFMatchup(1) : [0, 0]
                return <MatchupBox round="sf" idx={1} seed1={s1} seed2={s2} disabled={!qfDone} matchupIndex={13} />
              })()}
            </div>
            <div className="w-10 shrink-0 border-l-2 border-slate-500 self-stretch" />
            <div className={`flex flex-col justify-around pr-12 ${rowGap}`} style={{ height: bracketH }}>
              {[2, 3].map((i) => {
                const [s1, s2] = r16Done ? getQFMatchup(i) : [0, 0]
                return (
                  <div key={i} className="h-28 flex items-center">
                    <MatchupBox round="qf" idx={i} seed1={s1} seed2={s2} disabled={!r16Done} />
                  </div>
                )
              })}
            </div>
            <div className="w-10 shrink-0 border-l-2 border-slate-500 self-stretch" />
            <div className={`flex flex-col justify-around ${rowGap}`} style={{ height: bracketH }}>
              {matchups.slice(4, 8).map((m, i) => (
                <div key={i} className="h-28 flex items-center">
                  <MatchupBox round="r16" idx={i + 4} seed1={m.seed1} seed2={m.seed2} disabled={r16Done} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Modal */}
      {selectedMatchup && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 rounded-2xl p-8 max-w-md w-full border border-slate-700">
            <h3 className="text-xl font-bold mb-2 text-center">{getModalTitle()}</h3>
            <p className="text-slate-400 text-center mb-6">Who wins?</p>
            <div className="flex gap-4">
              {[selectedMatchup.seed1, selectedMatchup.seed2].map((seed) => {
                const oreo = getOreoById(seed)
                if (!oreo) return null
                return (
                  <button
                    key={seed}
                    onClick={() => handlePick(oreo.id)}
                    className="flex-1 p-6 rounded-2xl bg-slate-800 border-2 border-slate-600 hover:border-orange-500 transition-all text-center"
                  >
                    <div className="text-slate-500 text-sm font-medium">#{oreo.seed}</div>
                    <div className="text-lg font-bold">{oreo.name}</div>
                  </button>
                )
              })}
            </div>
            <button onClick={() => setSelectedMatchup(null)} className="mt-6 w-full py-3 bg-slate-700 hover:bg-slate-600 rounded-xl transition">
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className="text-center mt-6 text-slate-400 text-sm">
        Picks: {votes.length} / 15
        {!r16Done && ' · Complete Round of 16 first!'}
        {r16Done && !qfDone && ' · Pick Quarterfinals!'}
        {qfDone && !sfDone && ' · Pick Semifinals!'}
        {sfDone && votes.length < 15 && ' · Pick Champion!'}
      </div>
    </div>
  )
}
