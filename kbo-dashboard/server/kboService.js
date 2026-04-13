/**
 * KBO 백엔드 서비스
 * Puppeteer(헤드리스 Chrome)로 koreabaseball.com 세션을 유지하며
 * 일정/라인업 데이터를 수집합니다.
 */

import puppeteer from 'puppeteer'

const BASE_URL = 'https://www.koreabaseball.com'

const TEAM_CODE_MAP = {
  OB: '두산', LG: 'LG', KT: 'KT', SK: 'SSG', SS: '삼성',
  LT: '롯데', HH: '한화', HT: 'KIA', NC: 'NC', WO: '키움',
}
const TEAM_KEY_TO_CODE = Object.fromEntries(
  Object.entries(TEAM_CODE_MAP).map(([c, k]) => [k, c])
)

const KBO_SCHEDULE_URL = 'https://www.koreabaseball.com/Schedule/Schedule.aspx'
const KBO_API_BASE     = 'https://www.koreabaseball.com'

// ─── 브라우저 + 세션 페이지 관리 ────────────────────────────
let _browser        = null
let _browserPromise = null
let _sessionPage    = null

async function getBrowser() {
  if (_browser) {
    try { await _browser.version(); return _browser } catch { _browser = null }
  }
  if (_browserPromise) return _browserPromise
  console.log('[KBO] 헤드리스 브라우저 시작...')
  _browserPromise = puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
  }).then(b => {
    _browser = b
    _browserPromise = null
    console.log('[KBO] 브라우저 준비 완료')
    return b
  }).catch(e => { _browserPromise = null; throw e })
  return _browserPromise
}

/** KBO 사이트 위에서 실행되는 세션 페이지 반환 (쿠키/세션 유지) */
async function getSessionPage() {
  const browser = await getBrowser()
  if (_sessionPage && !_sessionPage.isClosed()) return _sessionPage

  _sessionPage = await browser.newPage()
  console.log('[KBO] 세션 페이지 초기화 중...')
  await _sessionPage.goto(KBO_SCHEDULE_URL, { waitUntil: 'networkidle2', timeout: 30_000 })
  console.log('[KBO] 세션 페이지 준비 완료')
  return _sessionPage
}

/** KBO ASMX API POST (세션 페이지 컨텍스트에서 실행 → 인증 쿠키 자동 포함) */
async function kboPost(path, params) {
  const page = await getSessionPage()
  return page.evaluate(async ({ url, params }) => {
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
        'X-Requested-With': 'XMLHttpRequest',
      },
      body: new URLSearchParams(params),
    })
    return res.json()
  }, { url: `${KBO_API_BASE}${path}`, params })
}

// ─── 캐시 ────────────────────────────────────────────────────
const scheduleCache = new Map() // dateStr → { data, expiresAt }
const statsCache    = new Map() // teamId  → { data, expiresAt }
const CACHE_TTL       = 60_000  // 60초
const STATS_CACHE_TTL = 600_000 // 10분

// ─── 파싱 ────────────────────────────────────────────────────
const VALID_TEAMS = new Set(Object.values(TEAM_CODE_MAP))

function stripHtml(str) {
  return (str || '').replace(/<[^>]+>/g, '').trim()
}

/**
 * { row: [{Text, Class, RowSpan, ...}, ...], Class, OnClick, ... } 구조 파싱
 * - Class "day"   → 날짜 (RowSpan 처리: 없으면 이전 날짜 유지)
 * - Class "time"  → 시간
 * - Class "play"  → 팀명 + 스코어
 * - Class "relay" → gameId 링크
 * - cells[-2]     → 구장명
 */
function parseScheduleRows(data, dateStr) {
  const rowObjects = data.rows || []
  if (!rowObjects.length) return []

  const year = dateStr.slice(0, 4)
  let currentDateStr = ''
  const games = []

  for (const rowObj of rowObjects) {
    const cells = Array.isArray(rowObj.row) ? rowObj.row : []
    if (!cells.length) continue

    // 날짜 갱신 (RowSpan으로 인해 없을 수 있음 → 이전 값 유지)
    const dayCell = cells.find(c => c.Class === 'day')
    if (dayCell?.Text) {
      const m = dayCell.Text.match(/(\d{2})\.(\d{2})/)
      if (m) currentDateStr = `${year}${m[1]}${m[2]}`
    }

    if (!currentDateStr) continue
    if (currentDateStr > dateStr) break  // 날짜 지남 → 조기 종료
    if (currentDateStr !== dateStr) continue

    // 시간
    const timeCell = cells.find(c => c.Class === 'time')
    const time = stripHtml(timeCell?.Text) || '18:10'

    // 팀명 + 스코어
    const playCell = cells.find(c => c.Class === 'play')
    const playHtml = playCell?.Text || ''

    // 팀명: class 없는 <span>만 필터 → 첫 번째 = 원정, 마지막 = 홈
    const teamNames = [...playHtml.matchAll(/<span>([^<]+)<\/span>/g)]
      .map(m => m[1].trim())
      .filter(t => VALID_TEAMS.has(t))

    const awayTeam = teamNames[0] || ''
    const homeTeam = teamNames[1] || ''
    if (!awayTeam || !homeTeam) continue

    // 스코어 & 상태
    let status = 'scheduled'
    let awayScore = null
    let homeScore = null

    if (/<span class="(?:win|lose)">\d/.test(playHtml)) {
      // 종료
      const scores = [...playHtml.matchAll(/<span class="(?:win|lose)">(\d+)<\/span>/g)]
      awayScore = parseInt(scores[0]?.[1], 10) ?? null
      homeScore = parseInt(scores[1]?.[1], 10) ?? null
      status = 'final'
    } else {
      // 진행 중: <span class="cur_top|cur_bot"> 또는 숫자:숫자 패턴
      const liveScores = [...playHtml.matchAll(/<span>(\d+)<\/span>/g)]
        .map(m => parseInt(m[1], 10))
        .filter(n => !isNaN(n))
      if (liveScores.length >= 2) {
        ;[awayScore, homeScore] = liveScores
        status = 'live'
      }
    }

    // gameId (relay 링크에서 추출)
    const relayCell = cells.find(c => c.Class === 'relay')
    const gameIdMatch = (relayCell?.Text || '').match(/gameId=([A-Z0-9]+)/)
    const gameId = gameIdMatch?.[1] ||
      `${dateStr}${TEAM_KEY_TO_CODE[awayTeam] || ''}${TEAM_KEY_TO_CODE[homeTeam] || ''}0`

    // 구장: cells[-2] (끝에서 두 번째)
    const stadium = stripHtml(cells[cells.length - 2]?.Text) || ''

    games.push({
      id: gameId,
      status,
      time,
      stadium,
      awayTeam,
      homeTeam,
      awayScore,
      homeScore,
      inning: null,
      inningHalf: null,
      outs: null,
      bases: null,
      lineup: null,
    })
  }

  console.log(`[KBO] parseScheduleRows: ${games.length}경기 (${dateStr})`)
  return games
}

// ─── 라인업 파싱 ─────────────────────────────────────────────
function parseLineupRows(data) {
  const rows    = data.rows    || []
  const headers = data.headers || []
  if (!rows.length) return null

  console.log('[KBO] lineup headers:', JSON.stringify(headers))
  console.log('[KBO] lineup row[0]:', JSON.stringify(rows[0]).slice(0, 300))

  const away = { pitcher: null, batters: [] }
  const home = { pitcher: null, batters: [] }

  for (const rowObj of rows) {
    const cells = Array.isArray(rowObj.row) ? rowObj.row : []
    const get   = (i) => stripHtml(cells[i]?.Text || '')

    // 팀 구분 (away=원정, home=홈) — Class나 위치로 판단
    // 라인업 테이블은 보통 원정(좌)/홈(우) 두 컬럼 구조
    // 실제 구조 파악 후 정교화 필요 — 일단 전체 cells 로그
    console.log('[KBO] lineup cells:', cells.map((c, i) => `[${i}]${c.Class || ''}:${stripHtml(c.Text || '').slice(0, 20)}`).join(' | '))
    break // 첫 row만 확인
  }

  return null // 구조 확인 후 실제 파싱 구현
}

// ─── 공통: 페이지 XHR 인터셉트 헬퍼 ────────────────────────────
async function fetchViaPage(url, interceptKeyword, fallbackEval, fallbackArgs) {
  const browser = await getBrowser()
  const page    = await browser.newPage()
  let intercepted = null

  page.on('response', async (res) => {
    const resUrl = res.url()
    if (resUrl.includes('.asmx') || resUrl.includes('/api/')) {
      console.log('[KBO] XHR:', resUrl.split('koreabaseball.com')[1] || resUrl)
    }
    if (resUrl.includes(interceptKeyword)) {
      try {
        const text = await res.text()
        console.log(`[KBO] intercept(${interceptKeyword}) raw:`, text.slice(0, 400))
        const json = JSON.parse(text)
        if (json) intercepted = json  // 조건 완화: null이 아니면 저장
      } catch (e) {
        console.log(`[KBO] intercept parse 실패:`, e.message.slice(0, 100))
      }
    }
  })

  try {
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 30_000 })

    if (!intercepted && fallbackEval) {
      intercepted = fallbackArgs !== undefined
        ? await page.evaluate(fallbackEval, fallbackArgs)
        : await page.evaluate(fallbackEval)
    }

    return intercepted
  } finally {
    await page.close()
  }
}

// ─── 공개 API ─────────────────────────────────────────────────

/**
 * GetKboGameList 응답으로 당일 경기 목록 파싱
 * GAME_STATE_SC: "0"=예정, "1"=경기전, "2"=진행중, "3"=종료
 * T_ = 선공(원정), B_ = 후공(홈)
 */
function parseGameList(gameList, dateStr) {
  if (!Array.isArray(gameList)) return []
  const games = gameList.filter(g => g.G_DT === dateStr)

  const STATUS_MAP = { '0': 'scheduled', '1': 'scheduled', '2': 'live', '3': 'final' }

  return games.map(g => {
    const status = STATUS_MAP[g.GAME_STATE_SC] || 'scheduled'
    const awayScore = status !== 'scheduled' ? (parseInt(g.T_SCORE_CN) ?? null) : null
    const homeScore = status !== 'scheduled' ? (parseInt(g.B_SCORE_CN) ?? null) : null

    // 주자 정보
    const bases = status === 'live' ? [
      g.B1_BAT_ORDER_NO > 0,
      g.B2_BAT_ORDER_NO > 0,
      g.B3_BAT_ORDER_NO > 0,
    ] : null

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
  if (cached && Date.now() < cached.expiresAt) {
    console.log(`[KBO] 캐시 반환 (${dateStr})`)
    return cached.data
  }

  console.log(`[KBO] GetKboGameList 로드: ${dateStr}`)

  // GetKboGameList: 세션 페이지 컨텍스트에서 POST
  const data = await kboPost('/ws/Main.asmx/GetKboGameList', {
    leId: '1', srId: '0,1,3,4,5,6,7,8,9', date: dateStr,
  })

  const games = data?.game ? parseGameList(data.game, dateStr) : []
  console.log(`[KBO] parseGameList: ${games.length}경기 (${dateStr})`)

  scheduleCache.set(dateStr, { data: games, expiresAt: Date.now() + CACHE_TTL })
  return games
}

export async function fetchLineup(gameId) {
  const gameDate = gameId.slice(0, 8)
  const seasonId = gameId.slice(0, 4)
  const pageUrl  = `${KBO_API_BASE}/Schedule/GameCenter/Main.aspx?gameDate=${gameDate}&gameId=${gameId}&section=LINEUP`
  console.log('[KBO] lineup 페이지 로드:', pageUrl)

  const browser = await getBrowser()
  const page    = await browser.newPage()
  let lineupData  = null
  let gameListData = null

  page.on('response', async (res) => {
    const url = res.url()
    if (url.includes('GetLineUpAnalysis')) {
      try {
        const text = await res.text()
        lineupData = JSON.parse(text)
        console.log('[KBO] GetLineUpAnalysis intercepted')
      } catch (e) {
        console.log('[KBO] GetLineUpAnalysis parse 실패:', e.message.slice(0, 80))
      }
    }
    if (url.includes('GetKboGameList')) {
      try {
        const text = await res.text()
        gameListData = JSON.parse(text)
        console.log('[KBO] GetKboGameList intercepted')
      } catch {}
    }
  })

  try {
    await page.goto(pageUrl, { waitUntil: 'networkidle2', timeout: 30_000 })

    // fallback: POST 직접 호출
    if (!lineupData) {
      lineupData = await page.evaluate(async (gid, sid) => {
        const r = await fetch('https://www.koreabaseball.com/ws/Schedule.asmx/GetLineUpAnalysis', {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8', 'X-Requested-With': 'XMLHttpRequest' },
          body: new URLSearchParams({ gameId: gid, leId: '1', srId: '0', seasonId: sid }),
        })
        const text = await r.text()
        try { return JSON.parse(text) } catch { return null }
      }, gameId, seasonId)
    }
  } finally {
    await page.close()
  }

  if (!lineupData) return null

  // 배열 형태: [LINEUP_CK, homeTeamInfo, awayTeamInfo, homeBattersJson, awayBattersJson]
  if (Array.isArray(lineupData) && lineupData.length >= 5) {
    return parseLineupArray(lineupData, gameListData, gameId)
  }

  return null
}

/**
 * GetLineUpAnalysis 응답 파싱
 * data[0]: [{LINEUP_CK}]
 * data[1]: [{T_ID, T_NM}] → 홈팀
 * data[2]: [{T_ID, T_NM}] → 원정팀
 * data[3]: JSON string → 홈 타자 rows {row: [{Text: order/pos/name/war}]}
 * data[4]: JSON string → 원정 타자 rows
 *
 * GetKboGameList: T_PIT_P_NM=원정선발, B_PIT_P_NM=홈선발
 */
function parseLineupArray(data, gameListData, gameId) {
  const homeTeamId = data[1]?.[0]?.T_ID
  const awayTeamId = data[2]?.[0]?.T_ID

  const parseBatters = (jsonStr) => {
    try {
      const parsed = typeof jsonStr === 'string' ? JSON.parse(jsonStr) : jsonStr
      return (parsed?.rows || []).map((rowObj, i) => {
        const cells = Array.isArray(rowObj.row) ? rowObj.row : []
        return {
          order: i + 1,
          pos: stripHtml(cells[1]?.Text || ''),
          name: stripHtml(cells[2]?.Text || ''),
        }
      }).filter(b => b.name)
    } catch {
      return []
    }
  }

  const homeBatters = parseBatters(data[3]?.[0])
  const awayBatters = parseBatters(data[4]?.[0])

  // 선발투수: GetKboGameList에서 추출 (T=선공=원정, B=후공=홈)
  let awayPitcherName = ''
  let homePitcherName = ''
  if (gameListData?.game) {
    const g = gameListData.game.find(g => g.G_ID === gameId)
    if (g) {
      awayPitcherName = (g.T_PIT_P_NM || '').trim()
      homePitcherName = (g.B_PIT_P_NM || '').trim()
    }
  }

  console.log(`[KBO] lineup parsed: ${homeTeamId}(홈) ${homeBatters.length}명 vs ${awayTeamId}(원정) ${awayBatters.length}명`)
  console.log(`[KBO] 선발: 원정=${awayPitcherName || '미정'}, 홈=${homePitcherName || '미정'}`)

  return {
    away: {
      pitcher: { name: awayPitcherName || '미정', hand: '-' },
      batters: awayBatters,
    },
    home: {
      pitcher: { name: homePitcherName || '미정', hand: '-' },
      batters: homeBatters,
    },
  }
}

// ─── 순위 ────────────────────────────────────────────────────

const standingsCache = { data: null, expiresAt: 0 }
const STANDINGS_CACHE_TTL = 60_000 // 60초

/** KBO 사이트 팀명 → 대시보드 팀 키 */
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

export async function fetchStandings() {
  if (standingsCache.data && Date.now() < standingsCache.expiresAt) {
    console.log('[KBO] standings 캐시 반환')
    return standingsCache.data
  }

  console.log('[KBO] standings 스크래핑...')
  const browser = await getBrowser()
  const page = await browser.newPage()

  try {
    await page.goto(`${BASE_URL}/Record/TeamRank/TeamRankDaily.aspx`, {
      waitUntil: 'networkidle2',
      timeout: 30_000,
    })

    const rows = await page.evaluate(() => {
      // KBO 순위 테이블 — 여러 선택자 시도
      const selectors = [
        '#cphContents_cphContents_cphContents_udpRecord table tbody tr',
        'table.tData01 tbody tr',
        'table tbody tr',
      ]
      let trs = []
      for (const sel of selectors) {
        trs = Array.from(document.querySelectorAll(sel))
        if (trs.length >= 5) break
      }
      return trs.map(tr =>
        Array.from(tr.querySelectorAll('td')).map(td => td.textContent.trim())
      ).filter(cells => cells.length >= 7)
    })

    console.log(`[KBO] standings raw rows: ${rows.length}`)

    const result = rows.map((cells, idx) => {
      // 컬럼: 순위, 팀명, 경기, 승, 패, 무, 승률, 게임차, 최근10경기, 연속
      const teamRaw = cells[1] || ''
      const teamKey = SITE_NAME_TO_KEY[teamRaw] || teamRaw
      const gamesBehindRaw = cells[7]?.trim()
      const gamesBehind =
        gamesBehindRaw === '-' || gamesBehindRaw === '0' || gamesBehindRaw === ''
          ? '-'
          : parseFloat(gamesBehindRaw) || '-'

      // 연속 컬럼 (cells[9]): "2연승", "1연패" 등
      // 일부 표기: "W2" / "L1" 형식도 정규화
      const streakRaw = cells[9] || cells[8] || ''
      let streak = streakRaw
      // 사이트 표기 정규화: "7승" → "7연승", "3패" → "3연패", "W2" → "2연승"
      const winMatch  = streakRaw.match(/^(\d+)승$/)
      const loseMatch = streakRaw.match(/^(\d+)패$/)
      const wMatch    = streakRaw.match(/^W(\d+)$/i)
      const lMatch    = streakRaw.match(/^L(\d+)$/i)
      if (winMatch)  streak = `${winMatch[1]}연승`
      else if (loseMatch) streak = `${loseMatch[1]}연패`
      else if (wMatch)    streak = `${wMatch[1]}연승`
      else if (lMatch)    streak = `${lMatch[1]}연패`

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
    }).filter(s => VALID_TEAMS.has(s.team))

    console.log(`[KBO] standings 파싱: ${result.length}팀`)
    standingsCache.data = result
    standingsCache.expiresAt = Date.now() + STANDINGS_CACHE_TTL
    return result
  } finally {
    await page.close()
  }
}

// ─── 팀 선수 스탯 ────────────────────────────────────────────

const TEAM_SEL_ID = 'cphContents_cphContents_cphContents_ddlTeam_ddlTeam'

/** "17 2/3" → 17.2 (KBO 이닝 표기 변환) */
function parseIP(str) {
  const m = String(str).trim().match(/^(\d+)\s+(\d+)\/3$/)
  if (m) return parseFloat(`${m[1]}.${m[2]}`)
  return parseFloat(str) || 0
}

/** Puppeteer로 팀 선택 후 테이블 rows 반환 */
async function scrapeStatsPage(path, teamCode) {
  const browser = await getBrowser()
  const page = await browser.newPage()
  try {
    const url = `${KBO_API_BASE}${path}`
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 30_000 })
    await page.select(`#${TEAM_SEL_ID}`, teamCode)
    // 팀 선택 후 페이지 reload 대기
    await Promise.race([
      page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 10_000 }),
      new Promise(r => setTimeout(r, 3_000)),
    ])
    return page.evaluate(() => {
      const table = document.querySelector('table')
      return Array.from(table?.querySelectorAll('tr') || []).map(r =>
        Array.from(r.querySelectorAll('th,td')).map(c => c.textContent.trim())
      )
    })
  } finally {
    await page.close()
  }
}

export async function fetchTeamStats(teamKorName) {
  const teamCode = TEAM_KEY_TO_CODE[teamKorName]
  if (!teamCode) return null

  const cached = statsCache.get(teamCode)
  if (cached && Date.now() < cached.expiresAt) {
    console.log(`[KBO] stats 캐시 반환 (${teamCode})`)
    return cached.data
  }

  console.log(`[KBO] stats 스크래핑: ${teamKorName}(${teamCode})`)

  // 3개 페이지 병렬 로드
  const [h1rows, h2rows, p1rows] = await Promise.all([
    scrapeStatsPage('/Record/Player/HitterBasic/Basic1.aspx', teamCode),
    scrapeStatsPage('/Record/Player/HitterBasic/Basic2.aspx', teamCode),
    scrapeStatsPage('/Record/Player/PitcherBasic/Basic1.aspx', teamCode),
  ])

  // 헤더 행 제거 (첫 번째 row)
  // 타자 Basic1: [순위,선수명,팀명,AVG,G,PA,AB,R,H,2B,3B,HR,TB,RBI,SAC,SF,...]
  // 타자 Basic2: [순위,선수명,팀명,AVG,BB,IBB,HBP,SO,GDP,SLG,OBP,OPS,...]
  // 투수 Basic1: [순위,선수명,팀명,ERA,G,W,L,SV,HLD,WPCT,IP,H,HR,BB,HBP,SO,R,ER,WHIP]

  // Basic2 → name→{bb, obp} 맵
  const h2map = new Map()
  for (const r of h2rows.slice(1)) {
    if (r[1]) h2map.set(r[1], { bb: parseInt(r[4]) || 0, obp: parseFloat(r[10]) || 0 })
  }

  const batters = h1rows.slice(1)
    .filter(r => r[1] && r[1] !== '선수명')
    .map(r => {
      const extra = h2map.get(r[1]) || { bb: 0, obp: 0 }
      return {
        name: r[1],
        avg: parseFloat(r[3]) || 0,
        games: parseInt(r[4]) || 0,
        ab: parseInt(r[6]) || 0,
        hits: parseInt(r[8]) || 0,
        hr: parseInt(r[11]) || 0,
        rbi: parseInt(r[13]) || 0,
        bb: extra.bb,
        obp: extra.obp,
      }
    })

  const pitchers = p1rows.slice(1)
    .filter(r => r[1] && r[1] !== '선수명')
    .map(r => ({
      name: r[1],
      era: parseFloat(r[3]) || 0,
      games: parseInt(r[4]) || 0,
      wins: parseInt(r[5]) || 0,
      losses: parseInt(r[6]) || 0,
      saves: parseInt(r[7]) || 0,
      innings: parseIP(r[10]),
      hits: parseInt(r[11]) || 0,
      ks: parseInt(r[15]) || 0,
      whip: parseFloat(r[18]) || 0,
    }))

  console.log(`[KBO] stats: ${teamKorName} 타자 ${batters.length}명, 투수 ${pitchers.length}명`)

  const data = { batters, pitchers }
  statsCache.set(teamCode, { data, expiresAt: Date.now() + STATS_CACHE_TTL })
  return data
}
