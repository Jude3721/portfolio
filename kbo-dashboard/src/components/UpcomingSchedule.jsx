import { useEffect, useState } from 'react'
import { KBO_TEAMS } from '../data/mockGames'
import { fetchUpcomingSchedule } from '../services/kboApi'

const N = {
  card:  '4px 4px 10px var(--neu-sd), -3px -3px 7px var(--neu-sl)',
  inset: 'inset 2px 2px 5px var(--neu-sd), inset -1px -1px 3px var(--neu-sl)',
}

function TeamLogo({ teamKey, size = 28 }) {
  const team = KBO_TEAMS[teamKey]
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%',
      background: 'var(--neu-bg)',
      boxShadow: N.card,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      flexShrink: 0,
    }}>
      <img
        src={team?.logo} alt={teamKey}
        style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }}
        onError={e => { e.target.style.display = 'none' }}
      />
    </div>
  )
}

function GameRow({ game }) {
  const awayColor = KBO_TEAMS[game.awayTeam]?.color ?? '#888'
  const homeColor = KBO_TEAMS[game.homeTeam]?.color ?? '#888'

  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: '8px',
      padding: '8px 12px', borderRadius: '14px',
      background: 'var(--neu-bg)', boxShadow: N.card,
    }}>
      {/* 시간 */}
      <span style={{
        fontSize: '12px', fontWeight: 700, color: 'rgba(var(--fg-rgb), 0.4)',
        minWidth: '36px', fontVariantNumeric: 'tabular-nums', flexShrink: 0,
      }}>
        {game.time || '미정'}
      </span>

      {/* 원정팀 */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '5px', flex: 1, minWidth: 0 }}>
        <TeamLogo teamKey={game.awayTeam} size={24} />
        <span style={{ fontSize: '12px', fontWeight: 700, color: awayColor, whiteSpace: 'nowrap' }}>
          {KBO_TEAMS[game.awayTeam]?.short ?? game.awayTeam}
        </span>
      </div>

      {/* VS */}
      <span style={{ fontSize: '10px', fontWeight: 800, color: 'rgba(var(--fg-rgb), 0.18)', flexShrink: 0 }}>
        VS
      </span>

      {/* 홈팀 */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '5px', flex: 1, minWidth: 0, justifyContent: 'flex-end' }}>
        <span style={{ fontSize: '12px', fontWeight: 700, color: homeColor, whiteSpace: 'nowrap' }}>
          {KBO_TEAMS[game.homeTeam]?.short ?? game.homeTeam}
        </span>
        <TeamLogo teamKey={game.homeTeam} size={24} />
      </div>

      {/* 구장 */}
      <span style={{
        fontSize: '10px', color: 'rgba(var(--fg-rgb), 0.25)',
        minWidth: '52px', textAlign: 'right', flexShrink: 0,
        whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
      }}>
        {game.stadium || ''}
      </span>
    </div>
  )
}

function DateGroup({ dateKR, games }) {
  return (
    <div style={{ marginBottom: '16px' }}>
      <div style={{
        fontSize: '11px', fontWeight: 800, letterSpacing: '0.4px',
        color: 'rgba(var(--fg-rgb), 0.35)',
        padding: '0 4px', marginBottom: '8px',
      }}>
        {dateKR}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        {games.map(g => <GameRow key={g.id} game={g} />)}
      </div>
    </div>
  )
}

export default function UpcomingSchedule() {
  const [dates, setDates]     = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchUpcomingSchedule(7)
      .then(setDates)
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  if (loading || dates.length === 0) return null

  const totalGames = dates.reduce((s, d) => s + d.games.length, 0)

  return (
    <section style={{ padding: '0 20px 32px' }}>
      {/* 헤더 */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: '10px',
        marginBottom: '16px', paddingBottom: '12px',
        borderBottom: '1px solid rgba(var(--fg-rgb), 0.06)',
      }}>
        <span style={{ fontSize: '16px', fontWeight: 800, color: 'rgba(var(--fg-rgb), 0.75)' }}>
          📅 다가오는 경기
        </span>
        <span style={{
          fontSize: '12px', fontWeight: 600,
          padding: '2px 8px', borderRadius: '99px',
          background: 'rgba(var(--fg-rgb), 0.05)',
          color: 'rgba(var(--fg-rgb), 0.3)',
          boxShadow: N.inset,
        }}>
          {totalGames}경기
        </span>
      </div>

      {/* 날짜별 경기 그리드 */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
        gap: '0 24px',
      }}>
        {dates.map(d => (
          <DateGroup key={d.dateStr} dateKR={d.dateKR} games={d.games} />
        ))}
      </div>
    </section>
  )
}
