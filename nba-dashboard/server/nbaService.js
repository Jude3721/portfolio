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

const EAST_TEAM_IDS = new Set([
  1610612737, // ATL
  1610612738, // BOS
  1610612751, // BKN
  1610612766, // CHA
  1610612741, // CHI
  1610612739, // CLE
  1610612765, // DET
  1610612754, // IND
  1610612748, // MIA
  1610612749, // MIL
  1610612752, // NYK
  1610612753, // ORL
  1610612755, // PHI
  1610612761, // TOR
  1610612764, // WAS
])

const CDN_HEADERS = {
  'User-Agent': UA,
  'Accept': 'application/json, text/plain, */*',
  'Accept-Language': 'en-US,en;q=0.9',
  'Referer': 'https://www.nba.com/',
  'Origin': 'https://www.nba.com',
}

const STATS_HEADERS = {
  ...CDN_HEADERS,
  'x-nba-stats-token': 'true',
  'x-nba-stats-origin': 'stats',
  'Referer': 'https://stats.nba.com/',
  'Origin': 'https://stats.nba.com',
}

const TRI_TO_ESPN_ID = {
  ATL:1,  BOS:2,  BKN:17, CHA:30, CHI:4,  CLE:5,  DAL:6,  DEN:7,
  DET:8,  GSW:9,  HOU:10, IND:11, LAC:12, LAL:13, MEM:29, MIA:14,
  MIL:15, MIN:16, NOP:3,  NYK:18, OKC:25, ORL:19, PHI:20, PHX:21,
  POR:22, SAC:23, SAS:24, TOR:28, UTA:26, WAS:27,
}

// ─── 경기 일정 ─────────────────────────────────────────────────
const scheduleCache = { data: null, exp: 0 }
const TTL_SCHEDULE  = 3_600_000 // 1시간

export async function fetchUpcomingGames(days = 7) {
  if (scheduleCache.data && Date.now() < scheduleCache.exp) {
    return sliceUpcoming(scheduleCache.data, days)
  }

  const res = await fetch(
    'https://cdn.nba.com/static/json/staticData/scheduleLeagueV2.json',
    { headers: CDN_HEADERS }
  )
  if (!res.ok) throw new Error(`schedule ${res.status}`)

  const json = await res.json()
  const gameDates = json?.leagueSchedule?.gameDates ?? []

  console.log(`[NBA] 시즌 일정: ${gameDates.length}일`)
  scheduleCache.data = gameDates
  scheduleCache.exp  = Date.now() + TTL_SCHEDULE
  return sliceUpcoming(gameDates, days)
}

function sliceUpcoming(gameDates, days) {
  const now    = Date.now()
  const cutoff = now + days * 86_400_000

  // gameId → entry 로 KST 날짜 기준 머지
  const byDate = new Map()

  for (const { games } of gameDates) {
    for (const g of games) {
      if (g.gameStatus !== 1) continue                       // 예정 경기만
      const gameMs = new Date(g.gameDateTimeUTC).getTime()
      if (gameMs <= now || gameMs >= cutoff) continue        // 이미 지났거나 너무 먼 미래 제외

      // KST 기준 날짜 키
      const kst    = new Date(gameMs + 9 * 3_600_000)
      const key    = `${kst.getUTCFullYear()}-${String(kst.getUTCMonth()+1).padStart(2,'0')}-${String(kst.getUTCDate()).padStart(2,'0')}`
      const hh     = String(kst.getUTCHours()).padStart(2, '0')
      const mm     = String(kst.getUTCMinutes()).padStart(2, '0')

      if (!byDate.has(key)) byDate.set(key, { dateStr: key, dateKR: formatDateKR(kst), games: [] })
      byDate.get(key).games.push({
        gameId:   g.gameId,
        timeKST:  `${hh}:${mm}`,
        awayTeam: { tricode: g.awayTeam.teamTricode, name: g.awayTeam.teamName, city: g.awayTeam.teamCity },
        homeTeam: { tricode: g.homeTeam.teamTricode, name: g.homeTeam.teamName, city: g.homeTeam.teamCity },
      })
    }
  }

  return [...byDate.values()].sort((a, b) => a.dateStr < b.dateStr ? -1 : 1)
}

function formatDateKR(date) {
  const days = ['일', '월', '화', '수', '목', '금', '토']
  const m  = date.getUTCMonth() + 1
  const d  = date.getUTCDate()
  const wd = days[date.getUTCDay()]
  return `${m}월 ${d}일 (${wd})`
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

// ─── 팀 로스터 ────────────────────────────────────────────────────
const rosterCache = new Map() // teamId → { data, exp }
const TTL_ROSTER  = 600_000  // 10분

export async function fetchRoster(teamId) {
  const cached = rosterCache.get(teamId)
  if (cached && Date.now() < cached.exp) return cached.data

  const season = getCurrentSeason()
  console.log(`[NBA] 로스터 조회: teamId=${teamId} season=${season}`)

  let players
  try {
    players = await fetchRosterFromNBA(teamId, season)
  } catch (err) {
    console.warn(`[NBA] stats.nba.com 실패(${err.message}), ESPN 폴백`)
    players = await fetchRosterFromESPN(teamId)
  }

  console.log(`[NBA] 로스터: ${players.length}명`)
  rosterCache.set(teamId, { data: players, exp: Date.now() + TTL_ROSTER })
  return players
}

async function fetchRosterFromNBA(teamId, season) {
  const res = await fetch(
    `https://stats.nba.com/stats/commonteamroster?Season=${season}&TeamID=${teamId}`,
    { headers: STATS_HEADERS }
  )
  if (!res.ok) throw new Error(`NBA roster ${res.status}`)

  const json    = await res.json()
  const headers = json?.resultSets?.[0]?.headers ?? []
  const rows    = json?.resultSets?.[0]?.rowSet   ?? []
  const idx     = name => headers.indexOf(name)

  const players = rows.map(r => ({
    playerId:    r[idx('PLAYER_ID')],
    name:        r[idx('PLAYER')]       ?? '',
    num:         r[idx('NUM')]          ?? '',
    position:    r[idx('POSITION')]     ?? '',
    height:      r[idx('HEIGHT')]       ?? '',
    weight:      r[idx('WEIGHT')]       ?? '',
    age:         r[idx('AGE')]          ?? '',
    exp:         r[idx('EXP')]          ?? '',
    school:      r[idx('SCHOOL')]       ?? '',
    howAcquired: r[idx('HOW_ACQUIRED')] ?? '',
  }))

  const posOrder = { G: 0, 'G-F': 1, F: 2, 'F-G': 3, 'F-C': 4, C: 5 }
  players.sort((a, b) => (posOrder[a.position] ?? 9) - (posOrder[b.position] ?? 9))
  return players
}

async function fetchRosterFromESPN(teamId) {
  const tri    = ID_TO_TRI[teamId]
  const espnId = TRI_TO_ESPN_ID[tri]
  if (!espnId) throw new Error(`ESPN ID 없음: ${tri}`)

  const res = await fetch(
    `https://site.api.espn.com/apis/site/v2/sports/basketball/nba/teams/${espnId}/roster`,
    { headers: { 'User-Agent': UA, 'Accept': 'application/json' } }
  )
  if (!res.ok) throw new Error(`ESPN roster ${res.status}`)

  const json    = await res.json()
  // athletes는 flat 배열
  const players = (json.athletes ?? []).map(p => ({
    playerId:    p.id,
    name:        p.fullName                  ?? '',
    num:         p.jersey                    ?? '',
    position:    p.position?.abbreviation    ?? '',
    height:      p.displayHeight             ?? '',
    weight:      String(p.weight             ?? ''),
    age:         p.age                       ?? '',
    exp:         String(p.experience?.years  ?? '0'),
    school:      p.college?.name             ?? '',
    howAcquired: '',
  }))

  const posOrder = { G: 0, 'G-F': 1, F: 2, 'F-G': 3, 'F-C': 4, C: 5 }
  players.sort((a, b) => (posOrder[a.position] ?? 9) - (posOrder[b.position] ?? 9))
  return players
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
  for (const [rawGameId, rawHomeId, rawVisitorId, seriesId] of seriesRows) {
    const gameId    = String(rawGameId)
    const homeId    = Number(rawHomeId)
    const visitorId = Number(rawVisitorId)
    if (!seriesMap.has(seriesId)) seriesMap.set(seriesId, { seriesId, homeId, visitorId, gameIds: new Set() })
    seriesMap.get(seriesId).gameIds.add(gameId)
  }

  // 게임 결과 집계: gameId → winnerId
  const logHeaders = logJson.resultSets[0].headers
  const logRows    = logJson.resultSets[0].rowSet ?? []
  const iTeamId    = logHeaders.indexOf('TEAM_ID')
  const iGameId    = logHeaders.indexOf('GAME_ID')
  const iWL        = logHeaders.indexOf('WL')
  const gameWinner = new Map() // gameId → winnerId
  for (const row of logRows) {
    if (row[iWL] === 'W') gameWinner.set(String(row[iGameId]), Number(row[iTeamId]))
  }

  // 시리즈별 승수 계산
  const bracket = {}
  for (const [seriesId, { homeId, visitorId, gameIds }] of seriesMap) {
    const roundCode = seriesId.slice(6, 8)  // e.g. '01', '02'
    const conf      = roundCode === '04' ? 'Finals'
      : (EAST_TEAM_IDS.has(homeId) ? 'East' : 'West')

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

// ─── 팀 뉴스 ───────────────────────────────────────────────────
const TRI_TO_QUERY = {
  ATL:'Atlanta Hawks',         BOS:'Boston Celtics',        BKN:'Brooklyn Nets',
  CHA:'Charlotte Hornets',     CHI:'Chicago Bulls',         CLE:'Cleveland Cavaliers',
  DAL:'Dallas Mavericks',      DEN:'Denver Nuggets',        DET:'Detroit Pistons',
  GSW:'Golden State Warriors', HOU:'Houston Rockets',       IND:'Indiana Pacers',
  LAC:'LA Clippers',           LAL:'Los Angeles Lakers',    MEM:'Memphis Grizzlies',
  MIA:'Miami Heat',            MIL:'Milwaukee Bucks',       MIN:'Minnesota Timberwolves',
  NOP:'New Orleans Pelicans',  NYK:'New York Knicks',       OKC:'Oklahoma City Thunder',
  ORL:'Orlando Magic',         PHI:'Philadelphia 76ers',    PHX:'Phoenix Suns',
  POR:'Portland Trail Blazers',SAC:'Sacramento Kings',      SAS:'San Antonio Spurs',
  TOR:'Toronto Raptors',       UTA:'Utah Jazz',             WAS:'Washington Wizards',
}

const newsCache = new Map() // tri → { data, exp }
const TTL_NEWS  = 600_000   // 10분

export async function fetchTeamNews(tri) {
  const cached = newsCache.get(tri)
  if (cached && Date.now() < cached.exp) return cached.data

  const query = TRI_TO_QUERY[tri]
  if (!query) throw new Error(`Unknown team: ${tri}`)

  const url = `https://news.google.com/rss/search?q=${encodeURIComponent(query + ' NBA')}&hl=en-US&gl=US&ceid=US:en`
  const res  = await fetch(url, { headers: CDN_HEADERS })
  if (!res.ok) throw new Error(`news fetch ${res.status}`)

  const xml        = await res.text()
  const rawItems   = parseRSS(xml).sort((a, b) => new Date(b.pubDate) - new Date(a.pubDate)).slice(0, 20)
  const translated = await translateTitles(rawItems.map(i => i.title))
  const items      = rawItems.map((item, i) => ({ ...item, title: translated[i] ?? item.title }))

  console.log(`[NBA] 뉴스: ${tri} ${items.length}건 (번역 완료)`)
  newsCache.set(tri, { data: items, exp: Date.now() + TTL_NEWS })
  return items
}

async function translateTitle(text) {
  try {
    const url  = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=ko&dt=t&q=${encodeURIComponent(text)}`
    const res  = await fetch(url, { headers: { 'User-Agent': UA } })
    if (!res.ok) return text
    const data = await res.json()
    return (data[0] ?? []).map(s => s[0]).join('').trim() || text
  } catch {
    return text
  }
}

async function translateTitles(titles) {
  const results = await Promise.allSettled(titles.map(t => translateTitle(t)))
  return results.map((r, i) => r.status === 'fulfilled' ? r.value : titles[i])
}

// ─── 트레이드 뉴스 ─────────────────────────────────────────────
const TRADE_QUERIES = {
  all:     'NBA trade 2026',
  rumors:  'NBA trade rumor 2026',
  done:    'NBA trade deal agreed 2026',
}

const tradeCache = new Map() // key → { data, exp }
const TTL_TRADE  = 300_000   // 5분

export async function fetchTradeNews(category = 'all', tri = null) {
  const key    = tri ? `team:${tri}` : `cat:${category}`
  const cached = tradeCache.get(key)
  if (cached && Date.now() < cached.exp) return cached.data

  let query
  if (tri) {
    const teamName = TRI_TO_QUERY[tri]
    if (!teamName) throw new Error(`Unknown team: ${tri}`)
    query = `"${teamName}" trade rumor 2026`
  } else {
    query = TRADE_QUERIES[category] ?? TRADE_QUERIES.all
  }

  const url  = `https://news.google.com/rss/search?q=${encodeURIComponent(query)}&hl=en-US&gl=US&ceid=US:en`
  const res  = await fetch(url, { headers: CDN_HEADERS })
  if (!res.ok) throw new Error(`trade news fetch ${res.status}`)

  const xml        = await res.text()
  const rawItems   = parseRSS(xml).sort((a, b) => new Date(b.pubDate) - new Date(a.pubDate)).slice(0, 20)
  const translated = await translateTitles(rawItems.map(i => i.title))
  const items      = rawItems.map((item, i) => ({ ...item, title: translated[i] ?? item.title }))

  console.log(`[NBA] 트레이드 뉴스: ${key} ${items.length}건`)
  tradeCache.set(key, { data: items, exp: Date.now() + TTL_TRADE })
  return items
}

function parseRSS(xml) {
  const getCDATA = s => s.replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1').trim()
  const getTag   = (s, tag) => {
    const m = s.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`))
    return m ? getCDATA(m[1]).trim() : ''
  }
  const escRe = s => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

  const items = []
  for (const [, body] of xml.matchAll(/<item>([\s\S]*?)<\/item>/g)) {
    const source  = getTag(body, 'source')
    let   title   = getTag(body, 'title')
    if (source) title = title.replace(new RegExp(`\\s*[-–]\\s*${escRe(source)}\\s*$`), '').trim()
    const link    = body.match(/<link>([\s\S]*?)<\/link>/)?.[1]?.trim() ?? ''
    const pubDate = getTag(body, 'pubDate')
    if (title) items.push({ title, link, source, pubDate })
  }
  return items
}
