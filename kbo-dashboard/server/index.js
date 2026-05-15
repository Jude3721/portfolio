// KBO 백엔드 서버
import { readFileSync } from 'fs'
import { resolve } from 'path'
import express from 'express'
import { fetchSchedule, fetchLineup, fetchTeamStats, fetchStandings, fetchTeamNews, fetchInjuries, fetchRosterMoves, fetchUpcomingSchedule, fetchHeadToHead } from './kboService.js'

const ALLOWED_ORIGINS = [
  'https://jude3721.github.io',
  'http://localhost:5173',
  'http://localhost:4173',
]

// .env 로드
try {
  const lines = readFileSync(resolve(process.cwd(), '.env'), 'utf-8').split('\n')
  for (const line of lines) {
    const [key, ...rest] = line.split('=')
    if (key?.trim() && rest.length) process.env[key.trim()] = rest.join('=').trim()
  }
} catch { /* .env 없어도 무시 */ }

const app = express()
const PORT = process.env.PORT || 3001

app.use(express.json())

app.use((req, res, next) => {
  const origin = req.headers.origin
  if (ALLOWED_ORIGINS.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin)
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  }
  if (req.method === 'OPTIONS') return res.sendStatus(204)
  next()
})

// ─── 채팅 ──────────────────────────────────────────────────────
const chatMessages    = []
const MAX_MSG         = 80
const nickActivity    = new Map()   // name → lastActiveMs
const NICK_TIMEOUT_MS = 5 * 60 * 1000

app.post('/api/chat/nickname/check', (req, res) => {
  const name = req.body?.name?.trim()
  if (!name) return res.json({ available: false, reason: '닉네임을 입력해주세요' })
  const last    = nickActivity.get(name)
  const isTaken = last && Date.now() - last < NICK_TIMEOUT_MS
  res.json({ available: !isTaken })
})

app.get('/api/chat/messages', (req, res) => {
  const since = parseInt(req.query.since ?? '0')
  const msgs  = since ? chatMessages.filter(m => m.id > since) : chatMessages.slice(-30)
  res.json({ messages: msgs })
})

app.post('/api/chat/messages', (req, res) => {
  const { name, text, teamKey } = req.body ?? {}
  if (!text?.trim()) return res.status(400).json({ error: 'text required' })
  const msg = {
    id:      Date.now(),
    name:    (name?.trim() || 'Guest').slice(0, 16),
    text:    text.trim().slice(0, 300),
    time:    new Date().toISOString(),
    teamKey: teamKey ?? null,
  }
  chatMessages.push(msg)
  if (chatMessages.length > MAX_MSG) chatMessages.shift()
  nickActivity.set(msg.name, Date.now())
  res.json({ message: msg })
})

function getDisplayDateStr() {
  const now = new Date()
  const h = now.getHours(), min = now.getMinutes()
  const isNextDay = (h === 23 && min >= 30) || h < 6
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

app.get('/api/upcoming', async (req, res) => {
  try {
    const days  = Math.min(parseInt(req.query.days ?? '7'), 14)
    const dates = await fetchUpcomingSchedule(days)
    res.json({ dates })
  } catch (err) {
    console.error('[server] upcoming error:', err.message)
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
    const { standings, prevStandings } = await fetchStandings()
    res.json({ standings, prevStandings })
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

app.get('/api/injuries/:teamKey', async (req, res) => {
  try {
    const injuries = await fetchInjuries(decodeURIComponent(req.params.teamKey))
    res.json({ injuries })
  } catch (err) {
    console.error('[server] injuries error:', err.message)
    res.json({ injuries: [], error: err.message })
  }
})

app.get('/api/news/:teamKey', async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1)
    const result = await fetchTeamNews(decodeURIComponent(req.params.teamKey), page)
    res.json(result)
  } catch (err) {
    console.error('[server] news error:', err.message)
    res.json({ news: [], total: 0, error: err.message })
  }
})

app.get('/api/h2h/:awayTeam/:homeTeam', async (req, res) => {
  try {
    const away = decodeURIComponent(req.params.awayTeam)
    const home = decodeURIComponent(req.params.homeTeam)
    const h2h  = await fetchHeadToHead(away, home)
    res.json({ h2h })
  } catch (err) {
    console.error('[server] h2h error:', err.message)
    res.json({ h2h: null })
  }
})

app.get('/api/moves', async (req, res) => {
  try {
    const moves = await fetchRosterMoves()
    res.json({ moves })
  } catch (err) {
    console.error('[server] moves error:', err.message)
    res.json({ moves: [], error: err.message })
  }
})

app.listen(PORT, () => {
  console.log(`KBO 백엔드 서버: http://localhost:${PORT}`)
})
