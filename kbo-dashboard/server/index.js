import { readFileSync } from 'fs'
import { resolve } from 'path'
import express from 'express'
import { fetchSchedule, fetchLineup, fetchTeamStats, fetchStandings } from './kboService.js'

// .env 로드
try {
  const lines = readFileSync(resolve(process.cwd(), '.env'), 'utf-8').split('\n')
  for (const line of lines) {
    const [key, ...rest] = line.split('=')
    if (key?.trim() && rest.length) process.env[key.trim()] = rest.join('=').trim()
  }
} catch { /* .env 없어도 무시 */ }

const app = express()
const PORT = 3001

function getDisplayDateStr() {
  const now = new Date()
  const isNextDay = now.getHours() >= 22
  const base = isNextDay
    ? new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1)
    : now
  const y = base.getFullYear()
  const m = String(base.getMonth() + 1).padStart(2, '0')
  const d = String(base.getDate()).padStart(2, '0')
  return `${y}${m}${d}`
}

app.get('/api/schedule', async (req, res) => {
  const date = req.query.date || getDisplayDateStr()
  try {
    const games = await fetchSchedule(date)
    res.json({ games, date })
  } catch (err) {
    console.error('[server] schedule error:', err.message)
    res.status(500).json({ error: err.message })
  }
})

app.get('/api/lineup/:gameId', async (req, res) => {
  try {
    const lineup = await fetchLineup(req.params.gameId)
    res.json({ lineup })
  } catch (err) {
    console.error('[server] lineup error:', err.message)
    res.status(500).json({ error: err.message })
  }
})

app.get('/api/standings', async (req, res) => {
  try {
    const standings = await fetchStandings()
    res.json({ standings })
  } catch (err) {
    console.error('[server] standings error:', err.message)
    res.status(500).json({ error: err.message })
  }
})

app.get('/api/stats/:teamKey', async (req, res) => {
  try {
    const stats = await fetchTeamStats(decodeURIComponent(req.params.teamKey))
    if (!stats) return res.status(404).json({ error: '팀을 찾을 수 없습니다' })
    res.json(stats)
  } catch (err) {
    console.error('[server] stats error:', err.message)
    res.status(500).json({ error: err.message })
  }
})

app.listen(PORT, () => {
  console.log(`KBO 백엔드 서버: http://localhost:${PORT}`)
})
