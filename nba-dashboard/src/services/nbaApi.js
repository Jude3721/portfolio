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

export async function fetchStandings() {
  const res = await fetch(`${API_BASE}/api/standings`)
  if (!res.ok) throw new Error(`standings 오류: ${res.status}`)
  const data = await res.json()
  return data?.standings ?? []
}
