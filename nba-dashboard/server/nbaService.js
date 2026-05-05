const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36'

const ID_TO_TRI = {
  1610612737:'ATL', 1610612738:'BOS', 1610612751:'BKN', 1610612766:'CHA',
  1610612741:'CHI', 1610612739:'CLE', 1610612742:'DAL', 1610612743:'DEN',
  1610612765:'DET', 1610612744:'GSW', 1610612745:'HOU', 1610612754:'IND',
  1610612746:'LAC', 1610612747:'LAL', 1610612763:'MEM', 1610612748:'MIA',
  1610612749:'MIL', 1610612750:'MIN', 1610612740:'NOP', 1610612752:'NYK',
  1610612760:'OKC', 1610612753:'ORL', 1610612755:'PHI', 1610612756:'PHX',
  1610612757:'POR', 1610612758:'SAC', 1610612759:'SAS', 1610612761:'TOR',
  1610612762:'UTA', 1610612764:'WAS',
}

const CDN_HEADERS = {
  'User-Agent': UA,
  'Accept': 'application/json, text/plain, */*',
  'Accept-Language': 'en-US,en;q=0.9',
  'Referer': 'https://www.nba.com/',
  'Origin': 'https://www.nba.com',
}

const STATS_HEADERS = {
  ...CDN_HEADERS,
  'Host': 'stats.nba.com',
  'x-nba-stats-token': 'true',
  'x-nba-stats-origin': 'stats',
  'Referer': 'https://stats.nba.com/',
  'Origin': 'https://stats.nba.com',
}

// ─── 캐시 ─────────────────────────────────────────────────────
const scoreboardCache = { data: null, exp: 0 }
const boxscoreCache   = new Map()  // gameId → { data, exp }
const standingsCache  = { data: null, exp: 0 }

const TTL_LIVE    =  25_000  // 라이브 경기 중 25초
const TTL_FINAL   = 300_000  // 종료된 경기 5분
const TTL_SCHED   =  60_000  // 예정 경기 1분
const TTL_STANDINGS = 300_000 // 순위 5분

// ─── 스코어보드 ────────────────────────────────────────────────
export async function fetchScoreboard() {
  if (scoreboardCache.data && Date.now() < scoreboardCache.exp) {
    return scoreboardCache.data
  }

  const res = await fetch(
    'https://cdn.nba.com/static/json/liveData/scoreboard/todaysScoreboard_00.json',
    { headers: CDN_HEADERS }
  )
  if (!res.ok) throw new Error(`NBA scoreboard ${res.status}`)

  const json = await res.json()
  const raw  = json?.scoreboard?.games ?? []
  const games = raw.map(parseGame)

  const hasLive  = games.some(g => g.status === 'live')
  const hasFinal = games.every(g => g.status === 'final')
  const ttl = hasLive ? TTL_LIVE : hasFinal ? TTL_FINAL : TTL_SCHED

  console.log(`[NBA] 경기: ${games.length}개 (라이브: ${hasLive ? 'O' : 'X'}, 캐시 ${ttl/1000}초)`)
  scoreboardCache.data = games
  scoreboardCache.exp  = Date.now() + ttl
  return games
}

function parseGame(g) {
  const statusMap = { 1: 'scheduled', 2: 'live', 3: 'final' }
  const status = statusMap[g.gameStatus] ?? 'scheduled'

  // 경기 시작 시간 (ET → KST +14시간)
  let timeKST = ''
  if (g.gameTimeUTC) {
    const d = new Date(g.gameTimeUTC)
    const kst = new Date(d.getTime() + 14 * 60 * 60 * 1000)
    const h = String(kst.getUTCHours()).padStart(2, '0')
    const m = String(kst.getUTCMinutes()).padStart(2, '0')
    timeKST = `${h}:${m}`
  }

  return {
    gameId:     g.gameId,
    gameCode:   g.gameCode ?? '',
    status,
    statusText: g.gameStatusText ?? '',
    period:     g.period ?? 0,
    gameClock:  g.gameClock ?? '',
    timeKST,
    awayTeam: {
      teamId:   g.awayTeam?.teamId,
      tricode:  g.awayTeam?.teamTricode ?? '',
      name:     g.awayTeam?.teamName ?? '',
      city:     g.awayTeam?.teamCity ?? '',
      score:    g.awayTeam?.score ?? 0,
      wins:     g.awayTeam?.wins ?? 0,
      losses:   g.awayTeam?.losses ?? 0,
    },
    homeTeam: {
      teamId:   g.homeTeam?.teamId,
      tricode:  g.homeTeam?.teamTricode ?? '',
      name:     g.homeTeam?.teamName ?? '',
      city:     g.homeTeam?.teamCity ?? '',
      score:    g.homeTeam?.score ?? 0,
      wins:     g.homeTeam?.wins ?? 0,
      losses:   g.homeTeam?.losses ?? 0,
    },
  }
}

// ─── 박스스코어 ────────────────────────────────────────────────
export async function fetchBoxscore(gameId) {
  const cached = boxscoreCache.get(gameId)
  if (cached && Date.now() < cached.exp) return cached.data

  const res = await fetch(
    `https://cdn.nba.com/static/json/liveData/boxscore/boxscore_${gameId}.json`,
    { headers: CDN_HEADERS }
  )
  if (!res.ok) throw new Error(`NBA boxscore ${res.status}`)

  const json = await res.json()
  const g    = json?.game ?? {}
  const status = { 1: 'scheduled', 2: 'live', 3: 'final' }[g.gameStatus] ?? 'scheduled'

  const data = {
    gameId:   g.gameId,
    status,
    period:   g.period ?? 0,
    gameClock: g.gameClock ?? '',
    arena:    g.arena?.arenaName ?? '',
    homeTeam: parseBoxTeam(g.homeTeam),
    awayTeam: parseBoxTeam(g.awayTeam),
  }

  const ttl = status === 'live' ? TTL_LIVE : TTL_FINAL
  boxscoreCache.set(gameId, { data, exp: Date.now() + ttl })
  return data
}

function parseBoxTeam(t) {
  if (!t) return null
  return {
    teamId:  t.teamId,
    tricode: t.teamTricode ?? '',
    name:    t.teamName ?? '',
    city:    t.teamCity ?? '',
    score:   t.score ?? 0,
    periods: (t.periods ?? []).map(p => ({ period: p.period, score: p.score ?? 0 })),
    players: (t.players ?? [])
      .filter(p => p.statistics?.minutesCalculated !== 'PT00M')
      .map(p => ({
        personId:  p.personId,
        name:      `${p.firstName} ${p.familyName}`,
        jerseyNum: p.jerseyNum ?? '',
        position:  p.position ?? '',
        starter:   p.starter === '1' || p.starter === true,
        stats: {
          minutes: formatMinutes(p.statistics?.minutes ?? ''),
          points:  p.statistics?.points ?? 0,
          rebounds: p.statistics?.reboundsTotal ?? 0,
          assists:  p.statistics?.assists ?? 0,
          steals:   p.statistics?.steals ?? 0,
          blocks:   p.statistics?.blocks ?? 0,
          turnovers: p.statistics?.turnovers ?? 0,
          fgm: p.statistics?.fieldGoalsMade ?? 0,
          fga: p.statistics?.fieldGoalsAttempted ?? 0,
          tpm: p.statistics?.threePointersMade ?? 0,
          tpa: p.statistics?.threePointersAttempted ?? 0,
          ftm: p.statistics?.freeThrowsMade ?? 0,
          fta: p.statistics?.freeThrowsAttempted ?? 0,
          plusMinus: p.statistics?.plusMinusPoints ?? 0,
        },
      }))
      .sort((a, b) => b.stats.points - a.stats.points),
  }
}

function formatMinutes(iso) {
  // "PT32M15.00S" → "32:15"
  const m = iso.match(/PT(\d+)M([\d.]+)S/)
  if (!m) return '0:00'
  return `${m[1]}:${String(Math.floor(parseFloat(m[2]))).padStart(2, '0')}`
}

// ─── 순위 ──────────────────────────────────────────────────────
export async function fetchStandings() {
  if (standingsCache.data && Date.now() < standingsCache.exp) {
    return standingsCache.data
  }

  const season = getCurrentSeason()
  console.log(`[NBA] 순위 조회: ${season}`)

  const res = await fetch(
    `https://stats.nba.com/stats/leaguestandingsv3?LeagueID=00&Season=${season}&SeasonType=Regular+Season&Section=overall`,
    { headers: STATS_HEADERS }
  )
  if (!res.ok) throw new Error(`NBA standings ${res.status}`)

  const json     = await res.json()
  const headers  = json?.resultSets?.[0]?.headers ?? []
  const rows     = json?.resultSets?.[0]?.rowSet   ?? []

  const idx = (name) => headers.indexOf(name)
  const standings = rows.map(r => ({
    teamId:      r[idx('TeamID')],
    tricode:     ID_TO_TRI[r[idx('TeamID')]] ?? '',
    city:        r[idx('TeamCity')] ?? '',
    name:        r[idx('TeamName')] ?? '',
    conference:  r[idx('Conference')] ?? '',
    confRank:    r[idx('PlayoffRank')] ?? 0,
    wins:        r[idx('WINS')] ?? 0,
    losses:      r[idx('LOSSES')] ?? 0,
    winPct:      parseFloat(r[idx('WinPCT')] ?? 0),
    gb:          r[idx('ConferenceGamesBack')] ?? '-',
    last10:      r[idx('L10')] ?? '',
    streak:      r[idx('strCurrentStreak')] ?? '',
    homeRec:     r[idx('HOME')] ?? '',
    awayRec:     r[idx('ROAD')] ?? '',
  }))

  console.log(`[NBA] 순위: ${standings.length}팀`)
  standingsCache.data = standings
  standingsCache.exp  = Date.now() + TTL_STANDINGS
  return standings
}

function getCurrentSeason() {
  const now   = new Date()
  const year  = now.getFullYear()
  const month = now.getMonth() + 1
  // NBA 시즌: 10월 시작 → 당해년-다음년 (예: 2024-25)
  const startYear = month >= 10 ? year : year - 1
  return `${startYear}-${String(startYear + 1).slice(2)}`
}
