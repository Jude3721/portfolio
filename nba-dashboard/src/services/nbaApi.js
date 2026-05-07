const API_BASE = import.meta.env.VITE_API_BASE ?? ''

export async function fetchTodayGames() {
  const res = await fetch(`${API_BASE}/api/scoreboard`)
  if (!res.ok) throw new Error(`scoreboard 오류: ${res.status}`)
  const data = await res.json()
  return data?.games ?? []
}

export async function fetchBoxscore(gameId) {
  const res = await fetch(`${API_BASE}/api/boxscore/${gameId}`)
  if (!res.ok) throw new Error(`boxscore 오류: ${res.status}`)
  return res.json()
}

export async function fetchRoster(teamId) {
  const res = await fetch(`${API_BASE}/api/roster/${teamId}`)
  if (!res.ok) throw new Error(`roster 오류: ${res.status}`)
  const data = await res.json()
  return data?.players ?? []
}

export async function fetchPlayoffBracket() {
  const res = await fetch(`${API_BASE}/api/playoff`)
  if (!res.ok) throw new Error(`playoff 오류: ${res.status}`)
  const data = await res.json()
  return data?.rounds ?? []
}

export async function fetchStandings() {
  const res = await fetch(`${API_BASE}/api/standings`)
  if (!res.ok) throw new Error(`standings 오류: ${res.status}`)
  const data = await res.json()
  return data?.standings ?? []
}

export async function fetchTeamNews(tri) {
  const res = await fetch(`${API_BASE}/api/news/${tri}`)
  if (!res.ok) throw new Error(`news 오류: ${res.status}`)
  const data = await res.json()
  return data?.items ?? []
}
