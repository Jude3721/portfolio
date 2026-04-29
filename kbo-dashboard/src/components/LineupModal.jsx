import { useEffect, useState } from 'react'
import { KBO_TEAMS } from '../data/mockGames'
import { fetchTeamStats } from '../services/kboApi'

const N = {
  raised: '8px 8px 20px var(--neu-sd), -5px -5px 13px var(--neu-sl)',
  inset:  'inset 2px 2px 6px var(--neu-sd), inset -1px -1px 4px var(--neu-sl)',
  subtle: '3px 3px 8px var(--neu-sd), -2px -2px 5px var(--neu-sl)',
  card:   '6px 6px 16px var(--neu-sd), -4px -4px 10px var(--neu-sl)',
}

// ── 선수 카드 팝업 ─────────────────────────────────────────────
function StatCell({ label, value, highlight }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', padding: '10px 6px', borderRadius: '12px', background: 'var(--neu-bg)', boxShadow: N.inset, minWidth: '52px' }}>
      <span style={{ fontSize: '10px', fontWeight: 700, color: 'rgba(var(--fg-rgb),0.3)', letterSpacing: '0.3px' }}>{label}</span>
      <span style={{ fontSize: '16px', fontWeight: 800, fontVariantNumeric: 'tabular-nums', color: highlight ? '#c084fc' : 'rgba(var(--fg-rgb),0.88)', textShadow: highlight ? '0 0 8px rgba(192,132,252,0.45)' : 'none' }}>
        {value}
      </span>
    </div>
  )
}

function PlayerCard({ playerName, teamKey, pos, onClose }) {
  const [stats, setStats]     = useState(null)
  const [loading, setLoading] = useState(true)
  const team = KBO_TEAMS[teamKey]

  useEffect(() => {
    fetchTeamStats(teamKey)
      .then(data => {
        const b = data?.batters?.find(p => p.name === playerName)
        const p = data?.pitchers?.find(p => p.name === playerName)
        setStats(b ? { ...b, type: 'batter' } : p ? { ...p, type: 'pitcher' } : null)
      })
      .catch(() => setStats(null))
      .finally(() => setLoading(false))
  }, [playerName, teamKey])

  useEffect(() => {
    const onKey = e => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose])

  return (
    <div
      onClick={onClose}
      style={{ position: 'fixed', inset: 0, zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px', background: 'rgba(0,0,0,0.45)' }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{ width: '100%', maxWidth: '360px', borderRadius: '24px', overflow: 'hidden', background: 'var(--neu-bg)', boxShadow: N.raised }}
      >
        {/* 상단 컬러 바 */}
        <div style={{ height: '4px', background: `linear-gradient(to right, ${team.color}, ${team.color}66)` }} />

        <div style={{ padding: '20px 22px 22px' }}>
          {/* 헤더 */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--neu-bg)', boxShadow: N.card, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <img src={team.logo} alt={team.short} style={{ width: '100%', height: '100%', borderRadius: '50%' }} onError={e => e.target.style.display = 'none'} />
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '7px', marginBottom: '3px' }}>
                  <span style={{ fontSize: '17px', fontWeight: 800, color: 'rgba(var(--fg-rgb),0.9)', letterSpacing: '-0.3px' }}>{playerName}</span>
                  {pos && (
                    <span style={{ fontSize: '11px', fontWeight: 700, padding: '2px 7px', borderRadius: '5px', background: `${team.color}22`, color: team.color, border: `1px solid ${team.color}44` }}>{pos}</span>
                  )}
                </div>
                <span style={{ fontSize: '12px', color: 'rgba(var(--fg-rgb),0.38)' }}>{team.name} · 2026 시즌</span>
              </div>
            </div>
            <button
              onClick={onClose}
              style={{ width: '28px', height: '28px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--neu-bg)', boxShadow: N.subtle, border: 'none', color: 'rgba(var(--fg-rgb),0.4)', fontSize: '13px', cursor: 'pointer', flexShrink: 0 }}
              onMouseEnter={e => e.currentTarget.style.boxShadow = N.inset}
              onMouseLeave={e => e.currentTarget.style.boxShadow = N.subtle}
            >✕</button>
          </div>

          {/* 스탯 */}
          {loading ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '28px 0', color: 'rgba(var(--fg-rgb),0.3)' }}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ animation: 'spin 0.8s linear infinite' }}>
                <path d="M21 2v6h-6"/><path d="M3 12a9 9 0 0 1 15-6.7L21 8"/>
                <path d="M3 22v-6h6"/><path d="M21 12a9 9 0 0 1-15 6.7L3 16"/>
              </svg>
              <span style={{ fontSize: '13px' }}>스탯 조회 중...</span>
            </div>
          ) : !stats ? (
            <div style={{ textAlign: 'center', padding: '28px 0' }}>
              <p style={{ fontSize: '24px', marginBottom: '8px' }}>📊</p>
              <p style={{ fontSize: '13px', color: 'rgba(var(--fg-rgb),0.4)' }}>시즌 스탯 없음</p>
              <p style={{ fontSize: '11px', color: 'rgba(var(--fg-rgb),0.25)', marginTop: '4px' }}>외국인 또는 신인 선수일 수 있습니다</p>
            </div>
          ) : stats.type === 'batter' ? (
            <>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px', marginBottom: '8px' }}>
                <StatCell label="타율" value={stats.avg.toFixed(3)} highlight={stats.avg >= 0.350} />
                <StatCell label="홈런" value={stats.hr} highlight={stats.hr >= 10} />
                <StatCell label="타점" value={stats.rbi} highlight={stats.rbi >= 30} />
                <StatCell label="출루율" value={stats.obp.toFixed(3)} highlight={stats.obp >= 0.400} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
                <StatCell label="경기" value={stats.games} />
                <StatCell label="타수" value={stats.ab} />
                <StatCell label="안타" value={stats.hits} />
                <StatCell label="볼넷" value={stats.bb} />
              </div>
            </>
          ) : (
            <>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px', marginBottom: '8px' }}>
                <StatCell label="ERA" value={stats.era.toFixed(2)} highlight={stats.era < 3.00} />
                <StatCell label="승" value={stats.wins} highlight={stats.wins >= 5} />
                <StatCell label="탈삼진" value={stats.ks} highlight={stats.ks >= 50} />
                <StatCell label="WHIP" value={stats.whip.toFixed(2)} highlight={stats.whip < 1.00} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
                <StatCell label="경기" value={stats.games} />
                <StatCell label="이닝" value={stats.innings.toFixed(1)} />
                <StatCell label="패" value={stats.losses} />
                <StatCell label="세이브" value={stats.saves ?? 0} />
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

// ── 라인업 ────────────────────────────────────────────────────
function PitcherRow({ pitcher, teamKey, onPlayerClick }) {
  const team = KBO_TEAMS[teamKey]
  return (
    <div
      onClick={() => onPlayerClick(pitcher.name, teamKey, 'P')}
      style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 14px', borderRadius: '14px', marginBottom: '10px', boxShadow: N.inset, cursor: 'pointer', transition: 'opacity 0.15s' }}
      onMouseEnter={e => e.currentTarget.style.opacity = '0.75'}
      onMouseLeave={e => e.currentTarget.style.opacity = '1'}
    >
      <span style={{ fontSize: '10px', fontWeight: 800, padding: '2px 8px', borderRadius: '6px', background: team.color, color: '#fff', letterSpacing: '0.5px', flexShrink: 0 }}>선발</span>
      <span style={{ fontSize: '14px', fontWeight: 700, color: 'rgba(var(--fg-rgb),0.88)' }}>{pitcher.name}</span>
      {pitcher.hand && pitcher.hand !== '-' && <span style={{ fontSize: '11px', color: 'rgba(var(--fg-rgb),0.35)' }}>{pitcher.hand}</span>}
      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginLeft: 'auto', color: 'rgba(var(--fg-rgb),0.2)', flexShrink: 0 }}>
        <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
      </svg>
    </div>
  )
}

function BatterList({ batters, teamKey, onPlayerClick }) {
  const [hovered, setHovered] = useState(null)
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
      {batters.map((b, i) => (
        <div
          key={b.order}
          onClick={() => onPlayerClick(b.name, teamKey, b.pos)}
          style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '7px 10px', borderRadius: '10px', cursor: 'pointer', boxShadow: hovered === i ? N.inset : 'none', transition: 'box-shadow 0.15s' }}
          onMouseEnter={() => setHovered(i)}
          onMouseLeave={() => setHovered(null)}
        >
          <span style={{ width: '16px', textAlign: 'right', fontSize: '11px', fontWeight: 800, color: 'rgba(var(--fg-rgb),0.28)', fontVariantNumeric: 'tabular-nums' }}>{b.order}</span>
          <span style={{ width: '48px', textAlign: 'center', fontSize: '10px', fontWeight: 700, padding: '2px 4px', borderRadius: '4px', background: 'rgba(var(--fg-rgb),0.06)', color: 'rgba(var(--fg-rgb),0.4)' }}>{b.pos}</span>
          <span style={{ fontSize: '13px', color: 'rgba(var(--fg-rgb),0.8)', flex: 1 }}>{b.name}</span>
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'rgba(var(--fg-rgb),0.15)', flexShrink: 0 }}>
            <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
        </div>
      ))}
    </div>
  )
}

function TeamColumn({ teamKey, side, lineup, onPlayerClick }) {
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
      <PitcherRow pitcher={data.pitcher} teamKey={teamKey} onPlayerClick={onPlayerClick} />
      <BatterList batters={data.batters} teamKey={teamKey} onPlayerClick={onPlayerClick} />
    </div>
  )
}

export default function LineupModal({ game, loading = false, onClose }) {
  const awayTeam = KBO_TEAMS[game.awayTeam]
  const homeTeam = KBO_TEAMS[game.homeTeam]
  const [selectedPlayer, setSelectedPlayer] = useState(null) // { name, teamKey, pos }

  useEffect(() => {
    const onKey = e => { if (e.key === 'Escape') { if (selectedPlayer) setSelectedPlayer(null); else onClose() } }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose, selectedPlayer])

  const handlePlayerClick = (name, teamKey, pos) => setSelectedPlayer({ name, teamKey, pos })

  return (
    <>
      <div onClick={() => { if (selectedPlayer) { setSelectedPlayer(null); return } onClose() }} style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px', background: 'rgba(0,0,0,0.55)' }}>
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
              <p style={{ fontSize: '11px', color: 'rgba(var(--fg-rgb),0.22)', marginTop: '3px' }}>선수 클릭 시 개인 스탯 확인</p>
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
              <TeamColumn teamKey={game.awayTeam} side="away" lineup={game.lineup} onPlayerClick={handlePlayerClick} />
              <div style={{ width: '1px', background: 'rgba(var(--fg-rgb),0.06)', flexShrink: 0 }} />
              <TeamColumn teamKey={game.homeTeam} side="home" lineup={game.lineup} onPlayerClick={handlePlayerClick} />
            </div>
          )}
        </div>
      </div>

      {selectedPlayer && (
        <PlayerCard
          playerName={selectedPlayer.name}
          teamKey={selectedPlayer.teamKey}
          pos={selectedPlayer.pos}
          onClose={() => setSelectedPlayer(null)}
        />
      )}
    </>
  )
}
