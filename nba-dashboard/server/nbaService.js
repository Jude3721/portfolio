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

// ─── 플레이오프 브래킷 ──────────────────────────────────────────
const playoffCache = { data: null, exp: 0 }
const TTL_PLAYOFF  = 120_000 // 2분

const ROUND_LABEL = { '01': '1라운드', '02': '컨퍼런스 세미파이널', '03': '컨퍼런스 파이널', '04': 'NBA 파이널' }

export async function fetchPlayoffBracket() {
  if (playoffCache.data && Date.now() < playoffCache.exp) return playoffCache.data

  const season = getCurrentSeason()
  console.log(`[NBA] 플레이오프 브래킷 조회: ${season}`)

  // 시리즈 구조 + 경기 결과 병렬 fetch
  const [seriesRes, logRes] = await Promise.all([
    fetch(`https://stats.nba.com/stats/commonplayoffseries?LeagueID=00&Season=${season}&SeriesID=`, { headers: STATS_HEADERS }),
    fetch(`https://stats.nba.com/stats/leaguegamelog?LeagueID=00&Season=${season}&SeasonType=Playoffs&PlayerOrTeam=T&Direction=DESC&Sorter=DATE`, { headers: STATS_HEADERS }),
  ])
  if (!seriesRes.ok) throw new Error(`playoff series ${seriesRes.status}`)
  if (!logRes.ok)    throw new Error(`playoff gamelog ${logRes.status}`)

  const seriesJson = await seriesRes.json()
  const logJson    = await logRes.json()

  // 시리즈별 팀-게임 매핑
  const seriesRows = seriesJson.resultSets[0].rowSet ?? []
  const seriesMap  = new Map() // seriesId → { seriesId, homeId, visitorId, gameIds[] }
  for (const [gameId, homeId, visitorId, seriesId] of seriesRows) {
    if (!seriesMap.has(seriesId)) seriesMap.set(seriesId, { seriesId, homeId, visitorId, gameIds: new Set() })
    seriesMap.get(seriesId).gameIds.add(gameId)
  }

  // 게임 결과 집계: gameId → { winnerId }
  const logHeaders = logJson.resultSets[0].headers
  const logRows    = logJson.resultSets[0].rowSet ?? []
  const iTeamId    = logHeaders.indexOf('TEAM_ID')
  const iGameId    = logHeaders.indexOf('GAME_ID')
  const iWL        = logHeaders.indexOf('WL')
  const gameWinner = new Map() // gameId → winnerId
  for (const row of logRows) {
    if (row[iWL] === 'W') gameWinner.set(row[iGameId], row[iTeamId])
  }

  // 시리즈별 승수 계산
  const bracket = {}
  for (const [seriesId, { homeId, visitorId, gameIds }] of seriesMap) {
    const roundCode = seriesId.slice(6, 8)  // e.g. '01', '02'
    const seriesNum = parseInt(seriesId.slice(8), 10)
    const conf      = roundCode === '01'
      ? (seriesNum <= 3 ? 'East' : 'West')
      : (roundCode === '02' ? (seriesNum <= 1 ? 'East' : 'West') : 'Finals')

    let homeWins = 0, visitorWins = 0
    for (const gId of gameIds) {
      const winner = gameWinner.get(gId)
      if (winner === homeId)    homeWins++
      else if (winner === visitorId) visitorWins++
    }

    const isComplete = homeWins === 4 || visitorWins === 4
    const winnerId   = isComplete ? (homeWins === 4 ? homeId : visitorId) : null

    const entry = {
      seriesId,
      roundCode,
      roundLabel: ROUND_LABEL[roundCode] ?? roundCode,
      conf,
      home:    { teamId: homeId,    tricode: ID_TO_TRI[homeId]    ?? '', wins: homeWins },
      visitor: { teamId: visitorId, tricode: ID_TO_TRI[visitorId] ?? '', wins: visitorWins },
      isComplete,
      winnerId,
      winnerTricode: winnerId ? ID_TO_TRI[winnerId] : null,
    }

    if (!bracket[roundCode]) bracket[roundCode] = []
    bracket[roundCode].push(entry)
  }

  // 라운드별 정렬
  const rounds = ['01', '02', '03', '04']
    .filter(r => bracket[r])
    .map(r => ({ code: r, label: ROUND_LABEL[r], series: bracket[r] }))

  console.log(`[NBA] 플레이오프: ${rounds.length}라운드, 총 ${Object.values(bracket).flat().length}시리즈`)
  playoffCache.data = rounds
  playoffCache.exp  = Date.now() + TTL_PLAYOFF
  return rounds
}
