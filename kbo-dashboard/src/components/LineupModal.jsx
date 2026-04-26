import { useEffect } from 'react'
import { KBO_TEAMS } from '../data/mockGames'

const G = { bg: 'rgba(13,13,26,0.75)', border: 'rgba(255,255,255,0.1)', blur: 'blur(24px)' }

function PitcherRow({ pitcher, teamColor }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px', borderRadius: '12px', marginBottom: '10px', background: `linear-gradient(135deg, ${teamColor}22, ${teamColor}0a)`, border: `1px solid ${teamColor}44` }}>
      <span style={{ fontSize: '10px', fontWeight: 800, padding: '2px 7px', borderRadius: '4px', background: teamColor, color: '#fff', letterSpacing: '0.5px', boxShadow: `0 0 8px ${teamColor}66`, flexShrink: 0 }}>선발</span>
      <span style={{ fontSize: '14px', fontWeight: 700, color: 'rgba(255,255,255,0.9)' }}>{pitcher.name}</span>
      {pitcher.hand && pitcher.hand !== '-' && <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.35)' }}>{pitcher.hand}</span>}
    </div>
  )
}

function BatterList({ batters }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
      {batters.map((b) => (
        <div key={b.order}
          style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '7px 10px', borderRadius: '8px', transition: 'background 0.15s', cursor: 'default' }}
          onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
        >
          <span style={{ width: '16px', textAlign: 'right', fontSize: '11px', fontWeight: 800, color: 'rgba(255,255,255,0.3)', fontVariantNumeric: 'tabular-nums' }}>{b.order}</span>
          <span style={{ width: '32px', textAlign: 'center', fontSize: '10px', fontWeight: 700, padding: '2px 4px', borderRadius: '4px', background: 'rgba(255,255,255,0.07)', color: 'rgba(255,255,255,0.45)' }}>{b.pos}</span>
          <span style={{ fontSize: '13px', color: 'rgba(255,255,255,0.82)' }}>{b.name}</span>
        </div>
      ))}
    </div>
  )
}

function TeamColumn({ teamKey, side, lineup }) {
  const team = KBO_TEAMS[teamKey]
  const data = lineup[side]
  return (
    <div style={{ flex: 1, minWidth: 0 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
        <div style={{ width: '30px', height: '30px', borderRadius: '50%', flexShrink: 0, background: `${team.color}22`, border: `1px solid ${team.color}55`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <img src={team.logo} alt={team.name} style={{ width: '70%', height: '70%' }} onError={e => { e.target.style.display = 'none' }} />
        </div>
        <div>
          <div style={{ fontSize: '13px', fontWeight: 700, color: 'rgba(255,255,255,0.9)' }}>{team.name}</div>
          <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.35)' }}>{side === 'away' ? '원정' : '홈'}</div>
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
    const onKey = (e) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose])

  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px', background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(6px)', WebkitBackdropFilter: 'blur(6px)' }}>
      <div onClick={e => e.stopPropagation()} style={{ width: '100%', maxWidth: '520px', maxHeight: '90vh', overflowY: 'auto', borderRadius: '24px', padding: '22px', display: 'flex', flexDirection: 'column', gap: '16px', background: G.bg, backdropFilter: G.blur, WebkitBackdropFilter: G.blur, border: `1px solid ${G.border}`, boxShadow: '0 24px 80px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.1)' }}>

        {/* 헤더 */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
          <div>
            <h3 style={{ fontSize: '16px', fontWeight: 800, color: 'rgba(255,255,255,0.92)', margin: '0 0 4px', letterSpacing: '-0.3px' }}>선발 라인업</h3>
            <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.35)' }}>{game.stadium} · {game.time}</p>
          </div>
          <button onClick={onClose}
            style={{ width: '28px', height: '28px', borderRadius: '50%', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,255,255,0.08)', border: `1px solid ${G.border}`, color: 'rgba(255,255,255,0.5)', fontSize: '13px', cursor: 'pointer', transition: 'all 0.2s' }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.14)'}
            onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.08)'}
          >✕</button>
        </div>

        {/* 팀 vs */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', padding: '4px 0' }}>
          <span style={{ fontSize: '14px', fontWeight: 800, color: awayTeam.color, textShadow: `0 0 10px ${awayTeam.color}88` }}>{awayTeam.short}</span>
          <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.25)', fontWeight: 300 }}>VS</span>
          <span style={{ fontSize: '14px', fontWeight: 800, color: homeTeam.color, textShadow: `0 0 10px ${homeTeam.color}88` }}>{homeTeam.short}</span>
        </div>

        <div style={{ height: '1px', background: G.border }} />

        {loading ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '48px 0', gap: '8px', color: 'rgba(255,255,255,0.35)' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ animation: 'spin 0.8s linear infinite' }}>
              <path d="M21 2v6h-6"/><path d="M3 12a9 9 0 0 1 15-6.7L21 8"/>
              <path d="M3 22v-6h6"/><path d="M21 12a9 9 0 0 1-15 6.7L3 16"/>
            </svg>
            <span style={{ fontSize: '13px' }}>라인업 불러오는 중...</span>
          </div>
        ) : !game.lineup ? (
          <div style={{ textAlign: 'center', padding: '48px 0', fontSize: '13px', color: 'rgba(255,255,255,0.35)' }}>라인업 미확정</div>
        ) : (
          <div style={{ display: 'flex', gap: '16px' }}>
            <TeamColumn teamKey={game.awayTeam} side="away" lineup={game.lineup} />
            <div style={{ width: '1px', background: G.border, flexShrink: 0 }} />
            <TeamColumn teamKey={game.homeTeam} side="home" lineup={game.lineup} />
          </div>
        )}
      </div>
    </div>
  )
}
