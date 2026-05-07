import { useEffect, useState } from 'react'
import { NBA_TEAMS } from '../data/nbaTeams'
import { fetchUpcomingGames } from '../services/nbaApi'

function TeamChip({ tricode }) {
  const team = NBA_TEAMS[tricode] ?? { color: '#888', logo: '', name: tricode }
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
      <div style={{
        width: '26px', height: '26px', borderRadius: '50%', flexShrink: 0,
        background: `${team.color}18`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <img src={team.logo} alt={tricode}
          style={{ width: '18px', height: '18px', objectFit: 'contain' }}
          onError={e => e.target.style.display = 'none'}
        />
      </div>
      <span style={{ fontSize: '12px', fontWeight: 700, color: 'rgba(255,255,255,0.7)', letterSpacing: '0.3px' }}>
        {tricode}
      </span>
    </div>
  )
}

function GameRow({ game }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: '10px',
      padding: '9px 14px', borderRadius: '12px',
      background: 'rgba(255,255,255,0.03)',
      border: '1px solid rgba(255,255,255,0.06)',
    }}>
      <span style={{
        fontSize: '12px', fontWeight: 700, color: 'rgba(255,255,255,0.35)',
        minWidth: '42px', fontVariantNumeric: 'tabular-nums',
      }}>
        {game.timeKST}
      </span>
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flex: 1 }}>
        <TeamChip tricode={game.awayTeam.tricode} />
        <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.18)', fontWeight: 600 }}>@</span>
        <TeamChip tricode={game.homeTeam.tricode} />
      </div>
    </div>
  )
}

function DateGroup({ dateKR, games }) {
  return (
    <div>
      <div style={{
        fontSize: '11px', fontWeight: 800, letterSpacing: '0.5px',
        color: 'rgba(255,255,255,0.3)',
        padding: '0 4px', marginBottom: '6px',
      }}>
        {dateKR}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', marginBottom: '16px' }}>
        {games.map(g => <GameRow key={g.gameId} game={g} />)}
      </div>
    </div>
  )
}

export default function UpcomingGames() {
  const [dates, setDates]     = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchUpcomingGames(7)
      .then(setDates)
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  if (loading) return null
  if (dates.length === 0) return null

  const totalGames = dates.reduce((s, d) => s + d.games.length, 0)

  return (
    <section style={{ padding: '0 24px 40px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
        <h2 style={{ fontSize: '17px', fontWeight: 800, color: '#fff' }}>📅 다가오는 경기</h2>
        <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.25)' }}>
          7일 이내 · {totalGames}경기
        </span>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
        gap: '0 24px',
      }}>
        {dates.map(d => (
          <DateGroup key={d.dateStr} dateKR={d.dateKR} games={d.games} />
        ))}
      </div>
    </section>
  )
}
