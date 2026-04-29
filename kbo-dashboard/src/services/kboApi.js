/**
 * KBO 프론트엔드 API 클라이언트
 * 실제 KBO 연동은 백엔드 서버(server/index.js)가 담당
 */

// 개발: '' (Vite 프록시), 배포: Render URL (VITE_API_BASE 환경변수)
const API_BASE = import.meta.env.VITE_API_BASE ?? ''

/**
 * 22:00 이후에는 다음날 날짜를 반환
 * @returns {{ year, month, day, dateStr, isNextDay: boolean }}
 */
export function getDisplayDate() {
  const now = new Date()
  const isNextDay = now.getHours() >= 22
  const base = isNextDay
    ? new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1)
    : now
  const year  = base.getFullYear()
  const month = String(base.getMonth() + 1).padStart(2, '0')
  const day   = String(base.getDate()).padStart(2, '0')
  return { year, month, day, dateStr: `${year}${month}${day}`, isNextDay }
}

/** 오늘(또는 내일) 경기 목록 조회 */
export async function fetchTodayGamesWithLineup() {
  const { dateStr } = getDisplayDate()
  const res = await fetch(`${API_BASE}/api/schedule?date=${dateStr}`)
  if (!res.ok) throw new Error(`백엔드 오류: ${res.status}`)
  const { games } = await res.json()
  return games ?? []
}

/** 특정 경기 라인업 조회 */
export async function fetchGameLineup(gameId) {
  const res = await fetch(`${API_BASE}/api/lineup/${gameId}`)
  if (!res.ok) throw new Error(`lineup 오류: ${res.status}`)
  const data = await res.json()
  return data?.lineup ?? null
}

/** 시즌 순위 조회 */
export async function fetchStandings() {
  const res = await fetch(`${API_BASE}/api/standings`)
  if (!res.ok) throw new Error(`standings 오류: ${res.status}`)
  const data = await res.json()
  return data?.standings ?? []
}

/** 팀 선수 스탯 조회 */
export async function fetchTeamStats(teamKey) {
  const res = await fetch(`${API_BASE}/api/stats/${encodeURIComponent(teamKey)}`)
  if (!res.ok) throw new Error(`stats 오류: ${res.status}`)
  return res.json()
}

/** 팀 부상자 명단 조회 */
export async function fetchInjuries(teamKey) {
  const res = await fetch(`${API_BASE}/api/injuries/${encodeURIComponent(teamKey)}`)
  if (!res.ok) return []
  const data = await res.json()
  return data?.injuries ?? []
}

/** 로스터 무브 (등록/말소/트레이드) 조회 */
export async function fetchRosterMoves() {
  const res = await fetch(`${API_BASE}/api/moves`)
  if (!res.ok) throw new Error(`moves 오류: ${res.status}`)
  const data = await res.json()
  return data?.moves ?? []
}

/** 팀 뉴스 조회 (page: 1-based) */
export async function fetchTeamNews(teamKey, page = 1) {
  const res = await fetch(`${API_BASE}/api/news/${encodeURIComponent(teamKey)}?page=${page}`)
  if (!res.ok) return { news: [], total: 0 }
  const data = await res.json()
  return { news: data?.news ?? [], total: data?.total ?? 0 }
}
