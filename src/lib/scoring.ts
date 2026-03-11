// Compare participant bracket to official results and calculate score

export type VotesMap = Record<string, number> // matchup_index (as string from JSON) -> winner_id

// Points per round: R16 = 50, QF = 100, SF = 200, Final = 300
function getPointsForMatchup(matchupIndex: number): number {
  if (matchupIndex < 8) return 50   // Round of 16
  if (matchupIndex < 12) return 100 // Quarter finals
  if (matchupIndex < 14) return 200 // Semi finals
  return 300                          // Championship
}

export function calculateScore(
  votes: VotesMap | Record<number, number> | null | undefined,
  officialResults: Record<number, number> // matchup_index -> winner_id
): number {
  if (!votes || typeof votes !== 'object') return 0
  let score = 0
  for (let i = 0; i <= 14; i++) {
    const playerPick = votes[String(i)] ?? votes[i]
    const actualWinner = officialResults[i]
    if (playerPick != null && actualWinner != null && Number(playerPick) === Number(actualWinner)) {
      score += getPointsForMatchup(i)
    }
  }
  return score
}

export function getMaxPossibleScore(): number {
  return 1500 // R16 (8×50) + QF (4×100) + SF (2×200) + Champion (1×300)
}
