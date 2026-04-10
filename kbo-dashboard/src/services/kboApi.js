/**
 * KBO 공식 API 서비스
 * CORS 우회: Vite dev proxy (/kbo-api → koreabaseball.com)
 */

const BASE = '/kbo-api'

// KBO 팀코드 → 우리 팀키 변환
const TEAM_CODE_MAP = {
  OB: '두산', LG: 'LG', KT: 'KT', SK: 'SSG', SS: '삼성',
  LT: '롯데', HH: '한화', HT: 'KIA', NC: 'NC', WO: '키움',
}

// 우리 팀키 → KBO 팀코드
const TEAM_KEY_TO_CODE = Object.fromEntries(
  Object.entries(TEAM_CODE_MAP).map(([code, key]) => [key, code])
)

// 팀명(한글) → 팀키
const TEAM_NAME_MAP = {
  '두산': '두산', 'LG': 'LG', 'KT': 'KT', 'SSG': 'SSG',
  '삼성': '삼성', '롯데': '롯데', '한화': '한화', 'KIA': 'KIA',
  'NC': 'NC', '키움': '키움',
}

function todayParts() {
  const d = new Date()
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return { year, month, day, dateStr: `${year}${month}${day}` }
}

function makeGameId(dateStr, awayCode, homeCode, n = 0) {
  return `${dateStr}${awayCode}${homeCode}${n}`
}

/** HTML 파싱: 경기 일정 테이블 → 게임 배열 */
function parseScheduleTable(html) {
  const parser = new DOMParser()
  const doc = parser.parseFromString(`<table>${html}</table>`, 'text/html')
  const rows = Array.from(doc.querySelectorAll('tr'))
  const { dateStr } = todayParts()
  const games = []

  for (const row of rows) {
    const cells = Array.from(row.querySelectorAll('td'))
    if (cells.length < 6) continue

    // 컬럼 순서: 시간, 원정팀, 원정점수, 홈팀, 홈점수, 상태, 구장 (구조 변동 가능)
    // KBO 공식 테이블: g_id 속성으로 gameId 추출
    const gid = row.getAttribute('g_id') || row.getAttribute('data-game-id')
    const awayCode = row.getAttribute('g_away_id') || ''
    const homeCode = row.getAttribute('g_home_id') || ''

    // 텍스트 추출 헬퍼
    const text = (i) => (cells[i]?.textContent || '').trim()

    let awayTeam = TEAM_CODE_MAP[awayCode] || ''
    let homeTeam = TEAM_CODE_MAP[homeCode] || ''

    // 속성이 없으면 텍스트로 파싱
    if (!awayTeam || !homeTeam) {
      // 구조: [시간] [원정팀명] [vs/스코어] [홈팀명] [구장] [상태]
      const names = cells
        .map((c) => c.textContent.trim())
        .filter((t) => TEAM_NAME_MAP[t])
      if (names.length >= 2) {
        awayTeam = TEAM_NAME_MAP[names[0]] || ''
        homeTeam = TEAM_NAME_MAP[names[1]] || ''
      }
    }

    if (!awayTeam || !homeTeam) continue

    // 스코어 파싱 (숫자 셀)
    const scoreCells = cells.filter((c) => /^\d+$/.test(c.textContent.trim()))
    const awayScore = scoreCells[0] ? parseInt(scoreCells[0].textContent.trim(), 10) : null
    const homeScore = scoreCells[1] ? parseInt(scoreCells[1].textContent.trim(), 10) : null

    // 상태 파싱
    const allText = row.textContent
    let status = 'scheduled'
    if (allText.includes('종료') || allText.includes('경기종료')) status = 'final'
    else if (allText.includes('회') || allText.includes('진행')) status = 'live'

    // 시간 파싱 (HH:MM 형태)
    const timeMatch = row.textContent.match(/(\d{1,2}:\d{2})/)
    const time = timeMatch ? timeMatch[1] : '18:10'

    // 구장 파싱 — 마지막 비숫자 셀들 중 팀명이 아닌 것
    const stadiumCell = cells.find((c) => {
      const t = c.textContent.trim()
      return t.length > 2 && !TEAM_NAME_MAP[t] && !/^\d+$/.test(t) && !t.match(/^\d{1,2}:\d{2}$/)
    })
    const stadium = stadiumCell?.textContent.trim() || ''

    // 이닝 정보 (라이브 경기)
    const inningMatch = allText.match(/(\d+)회\s*(초|말)/)
    const outsMatch = allText.match(/(\d+)사/)

    const gameId = gid || makeGameId(
      dateStr,
      TEAM_KEY_TO_CODE[awayTeam] || '',
      TEAM_KEY_TO_CODE[homeTeam] || '',
      0
    )

    games.push({
      id: gameId,
      status,
      time,
      stadium,
      awayTeam,
      homeTeam,
      awayScore: status !== 'scheduled' ? awayScore : null,
      homeScore: status !== 'scheduled' ? homeScore : null,
      inning: inningMatch ? parseInt(inningMatch[1], 10) : null,
      inningHalf: inningMatch ? inningMatch[2] : null,
      outs: outsMatch ? parseInt(outsMatch[1], 10) : null,
      bases: null,
      lineup: null,
    })
  }

  return games
}

/** HTML 파싱: 선발 라인업 테이블 → lineup 객체 */
function parseLineupHtml(html) {
  const parser = new DOMParser()
  const doc = parser.parseFromString(html, 'text/html')

  function extractBatters(tableEl) {
    if (!tableEl) return []
    const rows = Array.from(tableEl.querySelectorAll('tr')).slice(1) // skip header
    return rows.map((row, idx) => {
      const cells = Array.from(row.querySelectorAll('td'))
      return {
        order: idx + 1,
        pos: cells[1]?.textContent.trim() || '',
        name: cells[2]?.textContent.trim() || cells[0]?.textContent.trim() || '',
      }
    }).filter((b) => b.name)
  }

  function extractPitcher(tableEl) {
    if (!tableEl) return null
    const row = tableEl.querySelector('tr:not(:first-child)')
    if (!row) return null
    const cells = Array.from(row.querySelectorAll('td'))
    const name = cells[0]?.textContent.trim() || ''
    const handText = cells[1]?.textContent.trim() || ''
    const hand = handText.includes('좌') ? '좌완' : '우완'
    return { name, hand }
  }

  const tables = doc.querySelectorAll('table')
  if (tables.length < 2) return null

  const awayBatters = extractBatters(tables[0])
  const homeBatters = extractBatters(tables[1])
  const awayPitcher = extractPitcher(tables[2] || null) || { name: '미정', hand: '-' }
  const homePitcher = extractPitcher(tables[3] || null) || { name: '미정', hand: '-' }

  if (!awayBatters.length || !homeBatters.length) return null

  return {
    away: { pitcher: awayPitcher, batters: awayBatters },
    home: { pitcher: homePitcher, batters: homeBatters },
  }
}

/** 오늘 경기 일정 조회 */
export async function fetchTodaySchedule() {
  const { year, month, dateStr } = todayParts()

  const res = await fetch(`${BASE}/ws/Schedule.asmx/GetScheduleList`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
      'X-Requested-With': 'XMLHttpRequest',
    },
    body: new URLSearchParams({
      leId: '1',
      srIdList: '0,1,3,4,5',
      seasonId: String(year),
      gameMonth: month,
      teamId: '0',
    }),
  })

  if (!res.ok) throw new Error(`Schedule fetch failed: ${res.status}`)
  const data = await res.json()
  const html = data?.d?.table1 || data?.d?.result || ''
  if (!html) throw new Error('No schedule HTML in response')

  const allGames = parseScheduleTable(html)
  // 오늘 날짜 경기만 필터 (gameId 앞 8자리)
  return allGames.filter((g) => String(g.id).startsWith(dateStr))
}

/** 선발 라인업 조회 */
export async function fetchLineup(gameId) {
  const res = await fetch(`${BASE}/ws/Schedule.asmx/GetLineUpAnalysis`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
      'X-Requested-With': 'XMLHttpRequest',
    },
    body: new URLSearchParams({
      gameId,
      leId: '1',
      srId: '0',
    }),
  })

  if (!res.ok) throw new Error(`Lineup fetch failed: ${res.status}`)
  const data = await res.json()

  // 응답 구조: data.d = { table1, table2, ... } or data.d = HTML string
  const html = typeof data?.d === 'string'
    ? data.d
    : (data?.d?.table1 || '') + (data?.d?.table2 || '')

  if (!html) throw new Error('No lineup HTML in response')
  return parseLineupHtml(html)
}

/** 오늘 경기 + 라인업 통합 조회 */
export async function fetchTodayGamesWithLineup() {
  const games = await fetchTodaySchedule()

  // 라인업 병렬 조회 (실패해도 무시)
  await Promise.allSettled(
    games.map(async (game) => {
      try {
        const lineup = await fetchLineup(game.id)
        if (lineup) game.lineup = lineup
      } catch {
        // 라인업 미확정 or API 오류 → lineup: null 유지
      }
    })
  )

  return games
}
