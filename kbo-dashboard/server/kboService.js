/**
 * KBO 백엔드 서비스 - Node.js fetch 기반 (Puppeteer 없음)
 */
import { parse } from 'node-html-parser'

const KBO_BASE = 'https://www.koreabaseball.com'
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36'

const BASE_HEADERS = {
  'User-Agent': UA,
  'Referer': `${KBO_BASE}/Schedule/Schedule.aspx`,
  'Origin': KBO_BASE,
  'Accept-Language': 'ko-KR,ko;q=0.9',
}

// ─── 팀 코드 매핑 ─────────────────────────────────────────────
const TEAM_CODE_MAP = {
  OB: '두산', LG: 'LG', KT: 'KT', SK: 'SSG', SS: '삼성',
  LT: '롯데', HH: '한화', HT: 'KIA', NC: 'NC', WO: '키움',
}
const TEAM_KEY_TO_CODE = Object.fromEntries(
  Object.entries(TEAM_CODE_MAP).map(([c, k]) => [k, c])
)
const VALID_TEAMS = new Set(Object.values(TEAM_CODE_MAP))

const SITE_NAME_TO_KEY = {
  '두산': '두산', '두산베어스': '두산',
  'LG': 'LG', 'LG트윈스': 'LG',
  'KT': 'KT', 'KT위즈': 'KT',
  'SSG': 'SSG', 'SSG랜더스': 'SSG',
  '삼성': '삼성', '삼성라이온즈': '삼성',
  '롯데': '롯데', '롯데자이언츠': '롯데',
  '한화': '한화', '한화이글스': '한화',
  'KIA': 'KIA', 'KIA타이거즈': 'KIA',
  'NC': 'NC', 'NC다이노스': 'NC',
  '키움': '키움', '키움히어로즈': '키움',
}

// ─── 세션 관리 ────────────────────────────────────────────────
let _sessionCookies = ''
let _sessionExpiry = 0

async function getSession() {
  if (_sessionCookies && Date.now() < _sessionExpiry) return _sessionCookies

  console.log('[KBO] 세션 갱신 중...')
  const res = await fetch(`${KBO_BASE}/Schedule/Schedule.aspx`, {
    headers: BASE_HEADERS,
    redirect: 'follow',
  })

  const cookies = typeof res.headers.getSetCookie === 'function'
    ? res.headers.getSetCookie()
    : [res.headers.get('set-cookie')].filter(Boolean)

  _sessionCookies = cookies.map(c => c.split(';')[0]).join('; ')
  _sessionExpiry = Date.now() + 20 * 60 * 1000 // 20분
  console.log('[KBO] 세션 준비 완료')
  return _sessionCookies
}

function cookieHeader(extra = '') {
  return extra ? `${_sessionCookies}; ${extra}` : _sessionCookies
}

async function kboPost(path, params) {
  await getSession()
  const res = await fetch(`${KBO_BASE}${path}`, {
    method: 'POST',
    headers: {
      ...BASE_HEADERS,
      'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
      'X-Requested-With': 'XMLHttpRequest',
      'Cookie': _sessionCookies,
    },
    body: new URLSearchParams(params),
  })
  if (!res.ok) throw new Error(`KBO POST ${path} → ${res.status}`)
  const text = await res.text()
  try { return JSON.parse(text) } catch { throw new Error(`JSON 파싱 실패: ${text.slice(0, 200)}`) }
}

// ─── 캐시 ─────────────────────────────────────────────────────
const scheduleCache  = new Map() // dateStr → { data, exp }
const statsCache     = new Map() // teamCode → { data, exp }
const standingsCache = { data: null, exp: 0 }

const TTL_SCHEDULE  = 60_000
const TTL_STANDINGS = 60_000
const TTL_STATS     = 600_000

// ─── 경기 일정 파싱 ──────────────────────────────────────────
const STATUS_MAP = { '0': 'scheduled', '1': 'scheduled', '2': 'live', '3': 'final' }

function parseGameList(gameList, dateStr) {
  if (!Array.isArray(gameList)) return []
  return gameList
    .filter(g => g.G_DT === dateStr)
    .map(g => {
      const status = STATUS_MAP[g.GAME_STATE_SC] || 'scheduled'
      const awayScore = status !== 'scheduled' ? (parseInt(g.T_SCORE_CN) ?? null) : null
      const homeScore = status !== 'scheduled' ? (parseInt(g.B_SCORE_CN) ?? null) : null
      const bases = status === 'live'
        ? [g.B1_BAT_ORDER_NO > 0, g.B2_BAT_ORDER_NO > 0, g.B3_BAT_ORDER_NO > 0]
        : null
      return {
        id: g.G_ID,
        status,
        time: g.G_TM?.slice(0, 5) || '',
        stadium: g.S_NM || '',
        awayTeam: TEAM_CODE_MAP[g.AWAY_ID] || g.AWAY_NM || '',
        homeTeam: TEAM_CODE_MAP[g.HOME_ID] || g.HOME_NM || '',
        awayScore,
        homeScore,
        inning: status === 'live' ? (g.GAME_INN_NO || null) : null,
        inningHalf: status === 'live' ? (g.GAME_TB_SC === 'T' ? '초' : '말') : null,
        outs: status === 'live' ? (g.OUT_CN ?? null) : null,
        bases,
        lineup: null,
        cancelSc: g.CANCEL_SC_ID !== '0' ? g.CANCEL_SC_NM : null,
      }
    })
}

export async function fetchSchedule(dateStr) {
  const cached = scheduleCache.get(dateStr)
  if (cached && Date.now() < cached.exp) return cached.data

  console.log(`[KBO] 경기 일정 조회: ${dateStr}`)
  const data = await kboPost('/ws/Main.asmx/GetKboGameList', {
    leId: '1', srId: '0,1,3,4,5,6,7,8,9', date: dateStr,
  })

  const games = parseGameList(data?.game || [], dateStr)
  console.log(`[KBO] 경기: ${games.length}개`)
  scheduleCache.set(dateStr, { data: games, exp: Date.now() + TTL_SCHEDULE })
  return games
}

// ─── 라인업 ──────────────────────────────────────────────────
export async function fetchLineup(gameId) {
  await getSession()
  const seasonId = gameId.slice(0, 4)

  console.log(`[KBO] 라인업 조회: ${gameId}`)
  let lineupData = null

  try {
    lineupData = await kboPost('/ws/Schedule.asmx/GetLineUpAnalysis', {
      gameId, leId: '1', srId: '0', seasonId,
    })
  } catch (e) {
    console.warn('[KBO] 라인업 조회 실패:', e.message)
    return null
  }

  if (!Array.isArray(lineupData) || lineupData.length < 5) return null

  // 선발투수: GetKboGameList에서 추출
  let awayPitcher = '미정'
  let homePitcher = '미정'
  try {
    const gameDate = gameId.slice(0, 8)
    const gl = await kboPost('/ws/Main.asmx/GetKboGameList', {
      leId: '1', srId: '0,1,3,4,5,6,7,8,9', date: gameDate,
    })
    const g = (gl?.game || []).find(g => g.G_ID === gameId)
    if (g) {
      awayPitcher = g.T_PIT_P_NM?.trim() || '미정'
      homePitcher = g.B_PIT_P_NM?.trim() || '미정'
    }
  } catch {}

  const parseBatters = (jsonStr) => {
    try {
      const parsed = typeof jsonStr === 'string' ? JSON.parse(jsonStr) : jsonStr
      return (parsed?.rows || []).map((rowObj, i) => {
        const cells = Array.isArray(rowObj.row) ? rowObj.row : []
        const strip = s => (s || '').replace(/<[^>]+>/g, '').trim()
        return { order: i + 1, pos: strip(cells[1]?.Text), name: strip(cells[2]?.Text) }
      }).filter(b => b.name)
    } catch { return [] }
  }

  return {
    away: { pitcher: { name: awayPitcher, hand: '-' }, batters: parseBatters(lineupData[4]?.[0]) },
    home: { pitcher: { name: homePitcher, hand: '-' }, batters: parseBatters(lineupData[3]?.[0]) },
  }
}

// ─── 순위 ─────────────────────────────────────────────────────
export async function fetchStandings() {
  if (standingsCache.data && Date.now() < standingsCache.exp) return standingsCache.data

  console.log('[KBO] 순위 조회...')
  await getSession()

  const res = await fetch(`${KBO_BASE}/Record/TeamRank/TeamRankDaily.aspx`, {
    headers: { ...BASE_HEADERS, Cookie: _sessionCookies },
  })
  const html = await res.text()
  const root = parse(html)

  const selectors = [
    '#cphContents_cphContents_cphContents_udpRecord table tbody tr',
    'table.tData01 tbody tr',
    'table tbody tr',
  ]
  let rows = []
  for (const sel of selectors) {
    rows = root.querySelectorAll(sel)
    if (rows.length >= 5) break
  }

  console.log(`[KBO] 순위 rows: ${rows.length}`)

  const result = rows.map((tr, idx) => {
    const cells = tr.querySelectorAll('td').map(td => td.textContent.trim())
    if (cells.length < 7) return null

    const teamRaw = cells[1] || ''
    const teamKey = SITE_NAME_TO_KEY[teamRaw] || teamRaw
    if (!VALID_TEAMS.has(teamKey)) return null

    const gbRaw = cells[7]?.trim()
    const gamesBehind = !gbRaw || gbRaw === '-' || gbRaw === '0' ? '-' : parseFloat(gbRaw) || '-'

    const streakRaw = cells[9] || cells[8] || ''
    let streak = streakRaw
    const wm = streakRaw.match(/^(\d+)승$/)
    const lm = streakRaw.match(/^(\d+)패$/)
    if (wm) streak = `${wm[1]}연승`
    else if (lm) streak = `${lm[1]}연패`

    return {
      rank: parseInt(cells[0]) || idx + 1,
      team: teamKey,
      games: parseInt(cells[2]) || 0,
      wins: parseInt(cells[3]) || 0,
      losses: parseInt(cells[4]) || 0,
      draws: parseInt(cells[5]) || 0,
      winRate: parseFloat(cells[6]) || 0,
      gamesBehind,
      streak,
    }
  }).filter(Boolean)

  console.log(`[KBO] 순위: ${result.length}팀`)
  standingsCache.data = result
  standingsCache.exp = Date.now() + TTL_STANDINGS
  return result
}

// ─── 팀 선수 스탯 ────────────────────────────────────────────
const KBO_TEAM_CODES = new Set(['OB','LG','KT','SK','SS','LT','HH','HT','NC','WO'])

function mergeCookies(base, incoming) {
  const map = new Map()
  for (const c of base.split('; ').filter(Boolean)) {
    const i = c.indexOf('='); if (i < 0) continue
    map.set(c.slice(0, i), c.slice(i + 1))
  }
  for (const c of incoming) {
    const part = c.split(';')[0].trim(); const i = part.indexOf('='); if (i < 0) continue
    map.set(part.slice(0, i), part.slice(i + 1))
  }
  return [...map.entries()].map(([k, v]) => `${k}=${v}`).join('; ')
}

function getSetCookies(res) {
  return typeof res.headers.getSetCookie === 'function'
    ? res.headers.getSetCookie()
    : [res.headers.get('set-cookie')].filter(Boolean)
}

async function scrapeStatsPage(path, teamCode) {
  await getSession()
  const url = `${KBO_BASE}${path}`

  // 1. GET → form 필드 탐색 + VIEWSTATE 추출
  const initRes = await fetch(url, { headers: { ...BASE_HEADERS, Cookie: _sessionCookies } })
  _sessionCookies = mergeCookies(_sessionCookies, getSetCookies(initRes))
  const initHtml = await initRes.text()
  const root0 = parse(initHtml)

  // 모든 input 값 수집
  const formInputs = {}
  root0.querySelectorAll('input[name]').forEach(inp => {
    const name = inp.getAttribute('name')
    if (name) formInputs[name] = inp.getAttribute('value') || ''
  })

  // 팀 드롭다운 동적 탐지 (옵션값에 KBO 팀코드 포함 여부로 판단)
  let teamSelName = null
  root0.querySelectorAll('select[name]').forEach(sel => {
    const name = sel.getAttribute('name')
    if (!name) return
    const optVals = sel.querySelectorAll('option').map(o => o.getAttribute('value') || '')
    if (optVals.some(v => KBO_TEAM_CODES.has(v))) {
      teamSelName = name
      formInputs[name] = teamCode // 팀 선택
    } else {
      // 다른 드롭다운은 현재 선택값 또는 첫 번째 옵션 유지
      const sel2 = sel.querySelector('option[selected]')
      formInputs[name] = sel2?.getAttribute('value') || optVals[0] || ''
    }
  })

  console.log(`[KBO] team select: ${teamSelName ?? '(not found)'} = ${teamCode}`)

  // UpdatePanel 없이 일반 폼 POST → 서버가 팀 필터 적용 후 전체 HTML 반환
  formInputs['__EVENTTARGET']   = teamSelName || ''
  formInputs['__EVENTARGUMENT'] = ''
  delete formInputs['__ASYNCPOST']

  const postRes = await fetch(url, {
    method: 'POST',
    headers: {
      ...BASE_HEADERS,
      'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
      'Cookie': _sessionCookies,
    },
    body: new URLSearchParams(formInputs),
    redirect: 'follow',
  })
  _sessionCookies = mergeCookies(_sessionCookies, getSetCookies(postRes))
  const postHtml = await postRes.text()
  return parse(postHtml)
}

function parseIP(str) {
  const m = String(str).trim().match(/^(\d+)\s+(\d+)\/3$/)
  return m ? parseFloat(`${m[1]}.${m[2]}`) : parseFloat(str) || 0
}

export async function fetchTeamStats(teamKorName) {
  const teamCode = TEAM_KEY_TO_CODE[teamKorName]
  if (!teamCode) return null

  const cached = statsCache.get(teamCode)
  if (cached && Date.now() < cached.exp) return cached.data

  console.log(`[KBO] 팀 스탯: ${teamKorName}(${teamCode})`)

  const [h1root, h2root, p1root] = await Promise.all([
    scrapeStatsPage('/Record/Player/HitterBasic/Basic1.aspx', teamCode),
    scrapeStatsPage('/Record/Player/HitterBasic/Basic2.aspx', teamCode),
    scrapeStatsPage('/Record/Player/PitcherBasic/Basic1.aspx', teamCode),
  ])

  const tableRows = (root) =>
    root.querySelectorAll('tr').map(tr =>
      tr.querySelectorAll('th,td').map(c => c.textContent.trim())
    ).filter(cells => cells.length >= 5)

  const h1rows = tableRows(h1root)
  const h2rows = tableRows(h2root)
  const p1rows = tableRows(p1root)

  // r[2] = 팀명 컬럼 (서버 필터 실패 시 클라이언트 필터 fallback)
  const teamMatch = (r) => {
    const cell = r[2] || ''
    return SITE_NAME_TO_KEY[cell] === teamKorName || cell === teamKorName
  }

  const h2map = new Map()
  for (const r of h2rows.slice(1)) {
    if (r[1] && teamMatch(r)) h2map.set(r[1], { bb: parseInt(r[4]) || 0, obp: parseFloat(r[10]) || 0 })
  }

  // 컬럼: 순위(0) | 선수명(1) | 팀명(2) | 타율(3) | 경기(4) | 타석(5) | 타수(6) | 득점(7)
  //       안타(8) | 2루타(9) | 3루타(10) | 홈런(11) | 타점(12) | 도루(13)
  const batters = h1rows.slice(1)
    .filter(r => r[1] && r[1] !== '선수명' && teamMatch(r))
    .map(r => {
      const extra = h2map.get(r[1]) || {}
      return {
        name: r[1], avg: parseFloat(r[3]) || 0, games: parseInt(r[4]) || 0,
        ab: parseInt(r[6]) || 0, hits: parseInt(r[8]) || 0,
        hr: parseInt(r[11]) || 0, rbi: parseInt(r[12]) || 0,
        bb: extra.bb || 0, obp: extra.obp || 0,
      }
    })

  // 컬럼: 순위(0) | 선수명(1) | 팀명(2) | ERA(3) | 경기(4) | 승(5) | 패(6) | 세(7)
  //       홀드(8) | 블론(9) | 이닝(10) | 피안타(11) | 피홈런(12) | 볼넷(13) | 사구(14) | 삼진(15)
  //       실점(16) | 자책(17) | WHIP(18)
  const pitchers = p1rows.slice(1)
    .filter(r => r[1] && r[1] !== '선수명' && teamMatch(r))
    .map(r => ({
      name: r[1], era: parseFloat(r[3]) || 0, games: parseInt(r[4]) || 0,
      wins: parseInt(r[5]) || 0, losses: parseInt(r[6]) || 0, saves: parseInt(r[7]) || 0,
      innings: parseIP(r[10]), hits: parseInt(r[11]) || 0,
      ks: parseInt(r[15]) || 0, whip: parseFloat(r[18]) || 0,
    }))

  console.log(`[KBO] ${teamKorName}: 타자 ${batters.length}명, 투수 ${pitchers.length}명`)
  const data = { batters, pitchers }
  statsCache.set(teamCode, { data, exp: Date.now() + TTL_STATS })
  return data
}
