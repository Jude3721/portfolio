// 2026-04-08 기준 순위 — 4/7 경기 결과 반영
// 4/7 결과: 삼성 11-3 KIA, LG 2-0 NC, 한화 6-2 SSG, 키움 5-2 두산, KT 7-3 롯데
export const mockStandings = [
  { rank: 1,  team: 'SSG', games: 9, wins: 7, losses: 2, draws: 0, winRate: 0.778, gamesBehind: '-',  streak: '1연패' },
  { rank: 1,  team: 'KT',  games: 9, wins: 7, losses: 2, draws: 0, winRate: 0.778, gamesBehind: '-',  streak: '2연승' },
  { rank: 3,  team: 'NC',  games: 9, wins: 6, losses: 3, draws: 0, winRate: 0.667, gamesBehind: 1,   streak: '1연패' },
  { rank: 4,  team: '삼성', games: 9, wins: 5, losses: 3, draws: 1, winRate: 0.625, gamesBehind: 1.5, streak: '1연승' },
  { rank: 5,  team: 'LG',  games: 9, wins: 5, losses: 4, draws: 0, winRate: 0.556, gamesBehind: 2,   streak: '1연승' },
  { rank: 5,  team: '한화', games: 9, wins: 5, losses: 4, draws: 0, winRate: 0.556, gamesBehind: 2,   streak: '1연승' },
  { rank: 7,  team: '키움', games: 9, wins: 3, losses: 6, draws: 0, winRate: 0.333, gamesBehind: 4,   streak: '1연승' },
  { rank: 8,  team: '두산', games: 9, wins: 2, losses: 6, draws: 1, winRate: 0.250, gamesBehind: 4.5, streak: '1연패' },
  { rank: 9,  team: '롯데', games: 9, wins: 2, losses: 7, draws: 0, winRate: 0.222, gamesBehind: 5,   streak: '3연패' },
  { rank: 9,  team: 'KIA', games: 9, wins: 2, losses: 7, draws: 0, winRate: 0.222, gamesBehind: 5,   streak: '4연패' },
]
