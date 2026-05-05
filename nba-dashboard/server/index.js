import express from 'express'
import { fetchScoreboard, fetchBoxscore, fetchStandings, fetchPlayoffBracket } from './nbaService.js'

const ALLOWED_ORIGINS = [
  'https://jude3721.github.io',
  'http://localhost:5173',
  'http://localhost:4173',
]

const app  = express()
const PORT = process.env.PORT || 3002

app.use((req, res, next) => {
  const origin = req.headers.origin
  if (ALLOWED_ORIGINS.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin)
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS')
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  }
  if (req.method === 'OPTIONS') return res.sendStatus(204)
  next()
})

app.get('/api/scoreboard', async (req, res) => {
  try {
    const games = await fetchScoreboard()
    res.json({ games })
  } catch (err) {
    console.error('[server] scoreboard error:', err.message)
    res.status(500).json({ error: err.message })
  }
})

app.get('/api/boxscore/:gameId', async (req, res) => {
  try {
    const data = await fetchBoxscore(req.params.gameId)
    res.json(data)
  } catch (err) {
    console.error('[server] boxscore error:', err.message)
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

app.get('/api/playoff', async (req, res) => {
  try {
    const rounds = await fetchPlayoffBracket()
    res.json({ rounds })
  } catch (err) {
    console.error('[server] playoff error:', err.message)
    res.status(500).json({ error: err.message })
  }
})

app.listen(PORT, () => {
  console.log(`NBA 백엔드 서버: http://localhost:${PORT}`)
})
