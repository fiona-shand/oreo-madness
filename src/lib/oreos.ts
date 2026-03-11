// Oreo data and bracket configuration
export const oreos = [
  { id: 1, name: 'Classic', seed: 1 },
  { id: 2, name: 'Mint', seed: 8 },
  { id: 3, name: 'Thins', seed: 5 },
  { id: 4, name: 'Goldens', seed: 4 },
  { id: 5, name: 'Bday Cake', seed: 6 },
  { id: 6, name: 'Peanut Butter', seed: 3 },
  { id: 7, name: 'Lemon', seed: 7 },
  { id: 8, name: 'Reeses', seed: 2 },
  { id: 9, name: 'Toffee Crunch', seed: 16 },
  { id: 10, name: 'Dark Chocolate', seed: 9 },
  { id: 11, name: 'Java Chip', seed: 12 },
  { id: 12, name: 'Marvel', seed: 13 },
  { id: 13, name: 'Mega Stuffed', seed: 11 },
  { id: 14, name: 'Easter', seed: 14 },
  { id: 15, name: 'Cookie Dough', seed: 10 },
  { id: 16, name: 'Loaded Oreo', seed: 15 },
] as const

export type Oreo = typeof oreos[number]

// Round 1 matchups (by date)
export const matchups = [
  { date: 'Monday, March 16', oreo1: 1, oreo2: 9 },      // Classic vs Toffee Crunch
  { date: 'Tuesday, March 17', oreo1: 2, oreo2: 10 },     // Mint vs Dark Chocolate
  { date: 'Wednesday, March 18', oreo1: 3, oreo2: 11 },   // Thins vs Java Chip
  { date: 'Thursday, March 19', oreo1: 4, oreo2: 12 },   // Goldens vs Marvel
  { date: 'Friday, March 20', oreo1: 5, oreo2: 13 },      // Bday Cake vs Mega Stuffed
  { date: 'Monday, March 23', oreo1: 6, oreo2: 14 },     // Peanut Butter vs Easter
  { date: 'Tuesday, March 24', oreo1: 7, oreo2: 15 },   // Lemon vs Cookie Dough
  { date: 'Wednesday, March 25', oreo1: 8, oreo2: 16 }, // Reeses vs Loaded Oreo
] as const

export type Matchup = typeof matchups[number]

// Get oreo by ID
export function getOreoById(id: number): Oreo | undefined {
  return oreos.find(o => o.id === id)
}
