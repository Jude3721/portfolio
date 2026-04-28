import { useEffect } from 'react'
import { KBO_TEAMS } from '../data/mockGames'

const N = {
  raised: '8px 8px 20px var(--neu-sd), -5px -5px 13px var(--neu-sl)',
  inset:  'inset 2px 2px 6px var(--neu-sd), inset -1px -1px 4px var(--neu-sl)',
  subtle: '3px 3px 8px var(--neu-sd), -2px -2px 5px var(--neu-sl)',
}

function PitcherRow({ pitcher, teamColor }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 14px', borderRadius: '14px', marginBottom: '10px', boxShadow: N.inset }}>
      <span style={{ fontSize: '10px', fontWeight: 800, padding: '2px 8px', borderRadius: '6px', background: teamColor, color: '#fff', letterSpacing: '0.5px', flexShrink: 0 }}>선발</span>
      <span style={{ fontSize: '14px', fontWeight: 700, color: 'rgba(var(--fg-rgb),0.88)' }}>{pitcher.name}</span>
      {pitcher.hand && pitcher.hand !== '-' && <span style={{ fontSize: '11px', color: 'rgba(var(--fg-rgb),0.35)' }}>{pitcher.hand}</span>}
    </div>
  )
}

function BatterList({ batters }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
      {batters.map(b => (
        <div key={b.order} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '7px 10px', borderRadius: '10px', cursor: 'default' }}
          onMouseEnter={e => { e.currentTarget.style.boxShadow = N.inset }}
          onMouseLeave={e => { e.currentTarget.style.boxShadow = 'none' }}
        >
          <span style={{ width: '16px', textAlign: 'right', fontSize: '11px', fontWeight: 800, color: 'rgba(var(--fg-rgb),0.28)', fontVariantNumeric: 'tabular-nums' }}>{b.order}</span>
          <span style={{ width: '48px', textAlign: 'center', fontSize: '10px', fontWeight: 700, padding: '2px 4px', borderRadius: '4px', background: 'rgba(var(--fg-rgb),0.06)', color: 'rgba(var(--fg-rgb),0.4)' }}>{b.pos}</span>
          <span style={{ fontSize: '13px', color: 'rgba(var(--fg-rgb),0.8)' }}>{b.name}</span>
        </div>
      ))}
    </div>
  )
}

function TeamColumn({ teamKey, side, lineup }) {
  const team = KBO_TEAMS[teamKey]
  const data = lineup[side]
  const sideLabel = side === 'away' ? '원정' : '홈'
  return (
    <div style={{ flex: 1, minWidth: 0 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
        <div style={{ width: '32px', height: '32px', borderRadius: '50%', boxShadow: N.subtle, background: 'var(--neu-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <img src={team.logo} alt={team.name} style={{ width: '100%', height: '100%', borderRadius: '50%' }} onError={e => e.target.style.display = 'none'} />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '13px', fontWeight: 700, color: 'rgba(var(--fg-rgb),0.88)' }}>{team.name}</span>
          <span style={{ fontSize: '9px', fontWeight: 700, padding: '1px 6px', borderRadius: '4px', background: `${team.color}22`, color: team.color, border: `1px solid ${team.color}44`, letterSpacing: '0.3px' }}>
            {sideLabel}
          </span>
        </div>
      </div>
      <PitcherRow pitcher={data.pitcher} teamColor={team.color} />
      <BatterList batters={data.batters} />
    </div>
  )
}


export default function LineupModal({ game, loading = false, onClose }) {
  const awayTeam = KBO_TEAMS[game.awayTeam]
  const homeTeam = KBO_TEAMS[game.homeTeam]

  useEffect(() => {
    const onKey = e => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose])

  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px', background: 'rgba(0,0,0,0.55)' }}>
      <div onClick={e => e.stopPropagation()} style={{
        width: '100%', maxWidth: '520px', maxHeight: '90vh', overflowY: 'auto',
        borderRadius: '28px', padding: '24px',
        display: 'flex', flexDirection: 'column', gap: '16px',
        background: 'var(--neu-bg)',
        boxShadow: N.raised,
      }}>
        {/* 헤더 */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
          <div>
            <h3 style={{ fontSize: '16px', fontWeight: 800, color: 'rgba(var(--fg-rgb),0.9)', margin: '0 0 4px', letterSpacing: '-0.3px' }}>선발 라인업</h3>
            <p style={{ fontSize: '12px', color: 'rgba(var(--fg-rgb),0.32)' }}>{game.stadium} · {game.time}</p>
          </div>
          <button onClick={onClose} style={{
            width: '30px', height: '30px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'var(--neu-bg)', boxShadow: N.subtle, border: 'none',
            color: 'rgba(var(--fg-rgb),0.45)', fontSize: '13px', cursor: 'pointer',
          }}
            onMouseEnter={e => e.currentTarget.style.boxShadow = N.inset}
            onMouseLeave={e => e.currentTarget.style.boxShadow = N.subtle}
          >✕</button>
        </div>

        {/* VS */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px' }}>
          <span style={{ fontSize: '14px', fontWeight: 800, color: awayTeam.color }}>{awayTeam.short}</span>
          <span style={{ fontSize: '12px', color: 'rgba(var(--fg-rgb),0.2)', fontWeight: 300 }}>VS</span>
          <span style={{ fontSize: '14px', fontWeight: 800, color: homeTeam.color }}>{homeTeam.short}</span>
        </div>

        <div style={{ height: '1px', background: 'rgba(var(--fg-rgb),0.06)' }} />

        {loading ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '48px 0', gap: '8px', color: 'rgba(var(--fg-rgb),0.3)' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ animation: 'spin 0.8s linear infinite' }}>
              <path d="M21 2v6h-6"/><path d="M3 12a9 9 0 0 1 15-6.7L21 8"/>
              <path d="M3 22v-6h6"/><path d="M21 12a9 9 0 0 1-15 6.7L3 16"/>
            </svg>
            <span style={{ fontSize: '13px' }}>라인업 불러오는 중...</span>
          </div>
        ) : !game.lineup ? (
          <div style={{ textAlign: 'center', padding: '48px 0', fontSize: '13px', color: 'rgba(var(--fg-rgb),0.3)' }}>라인업 미확정</div>
        ) : (
          <div style={{ display: 'flex', gap: '16px' }}>
            <TeamColumn teamKey={game.awayTeam} side="away" lineup={game.lineup} />
            <div style={{ width: '1px', background: 'rgba(var(--fg-rgb),0.06)', flexShrink: 0 }} />
            <TeamColumn teamKey={game.homeTeam} side="home" lineup={game.lineup} />
          </div>
        )}
      </div>
    </div>
  )
}
