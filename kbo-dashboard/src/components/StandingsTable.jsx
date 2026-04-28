import { useState, useEffect, useRef } from 'react'
import { KBO_TEAMS } from '../data/mockGames'

const N = {
  raised: '6px 6px 16px var(--neu-sd), -4px -4px 10px var(--neu-sl)',
  inset:  'inset 2px 2px 6px var(--neu-sd), inset -1px -1px 4px var(--neu-sl)',
  subtle: '3px 3px 8px var(--neu-sd), -2px -2px 5px var(--neu-sl)',
}

const GRID = '2.2rem 2.8rem 1fr 3rem 3rem 3rem 3rem 10rem 5rem'

function RankChange({ delta }) {
  if (!delta) return (
    <span style={{ fontSize: '11px', color: 'rgba(var(--fg-rgb),0.2)', lineHeight: 1 }}>—</span>
  )
  const up = delta > 0
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: '1px',
      fontSize: '10px', fontWeight: 800, lineHeight: 1,
      color: up ? '#4ade80' : '#f87171',
    }}>
      {up ? '▲' : '▼'}{Math.abs(delta)}
    </span>
  )
}

function StreakBadge({ streak }) {
  const isWin  = streak.includes('연승')
  const isLose = streak.includes('연패')
  const color  = isWin ? '#4ade80' : isLose ? '#f87171' : 'rgba(var(--fg-rgb), 0.35)'
  const bg     = isWin ? 'rgba(74,222,128,0.12)' : isLose ? 'rgba(248,113,113,0.12)' : 'rgba(var(--fg-rgb), 0.05)'
  const border = isWin ? 'rgba(74,222,128,0.3)'  : isLose ? 'rgba(248,113,113,0.3)'  : 'rgba(var(--fg-rgb), 0.08)'
  return (
    <span style={{ display: 'inline-block', padding: '2px 8px', borderRadius: '99px', fontSize: '11px', fontWeight: 700, background: bg, color, border: `1px solid ${border}` }}>
      {streak}
    </span>
  )
}

function WinRateBar({ winRate, teamColor }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
      <span style={{ fontSize: '13px', fontVariantNumeric: 'tabular-nums', width: '44px', textAlign: 'right', color: 'rgba(var(--fg-rgb), 0.8)', fontWeight: 600 }}>
        {winRate.toFixed(3)}
      </span>
      <div style={{ width: '56px', height: '5px', borderRadius: '99px', boxShadow: N.inset, overflow: 'hidden' }}>
        <div style={{ height: '100%', borderRadius: '99px', width: `${winRate * 100}%`, background: `linear-gradient(to right, ${teamColor}, ${teamColor}bb)`, transition: 'width 0.8s ease' }} />
      </div>
    </div>
  )
}

const STORAGE_KEY = 'kbo-standings-snapshot'
const SNAPSHOT_TTL = 60 * 60 * 1000 // 1시간마다 스냅샷 갱신

export default function StandingsTable({ standings = [], onTeamClick, dataSource = 'mock' }) {
  const [hoveredRow, setHoveredRow] = useState(null)
  const [rankChanges, setRankChanges] = useState({})
  const didInit = useRef(false)
  const dateStr = new Date().toLocaleDateString('ko-KR', { month: 'long', day: 'numeric' })

  useEffect(() => {
    if (!standings.length || didInit.current) return
    didInit.current = true

    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      const snap = raw ? JSON.parse(raw) : null

      if (snap?.ranks) {
        const changes = {}
        standings.forEach(s => {
          const prev = snap.ranks[s.team]
          changes[s.team] = prev !== undefined ? prev - s.rank : undefined
        })
        setRankChanges(changes)
      }

      // 1시간 이상 지났거나 스냅샷 없으면 현재로 갱신
      if (!snap || Date.now() - snap.savedAt > SNAPSHOT_TTL) {
        const ranks = Object.fromEntries(standings.map(s => [s.team, s.rank]))
        localStorage.setItem(STORAGE_KEY, JSON.stringify({ ranks, savedAt: Date.now() }))
      }
    } catch { /* ignore */ }
  }, [standings])

  return (
    <section style={{ width: '100%', padding: '0 24px 40px' }}>
      <div style={{ marginBottom: '16px', textAlign: 'left', display: 'flex', alignItems: 'center', gap: '10px' }}>
        <h2 style={{ fontSize: '18px', fontWeight: 800, color: 'rgba(var(--fg-rgb), 0.88)', letterSpacing: '-0.3px' }}>
          2026 시즌 순위
        </h2>
        {dataSource === 'live'
          ? <span className="live-badge" style={{ fontSize: '10px' }}><span className="live-dot" />실시간</span>
          : <span style={{ fontSize: '11px', color: 'rgba(var(--fg-rgb), 0.3)' }}>목업 데이터</span>
        }
        <span style={{ marginLeft: 'auto', fontSize: '11px', color: 'rgba(var(--fg-rgb), 0.3)' }}>
          {dateStr} 기준 · 구단 클릭 → 선수 스탯
        </span>
      </div>

      <div style={{ borderRadius: '20px', overflow: 'hidden', background: 'var(--neu-bg)', boxShadow: N.raised }}>
        {/* 헤더 */}
        <div style={{
          display: 'grid', gridTemplateColumns: GRID,
          padding: '12px 18px',
          boxShadow: 'inset 0 -1px 0 rgba(var(--fg-rgb),0.05)',
          fontSize: '11px', fontWeight: 700, letterSpacing: '0.5px', color: 'rgba(var(--fg-rgb), 0.3)',
        }}>
          <span style={{ textAlign: 'center' }}>순위</span>
          <span style={{ textAlign: 'center' }}>변동</span>
          <span style={{ paddingLeft: '8px' }}>구단</span>
          <span style={{ textAlign: 'center' }}>경기</span>
          <span style={{ textAlign: 'center' }}>승</span>
          <span style={{ textAlign: 'center' }}>패</span>
          <span style={{ textAlign: 'center' }}>무</span>
          <span style={{ textAlign: 'center' }}>승률</span>
          <span style={{ textAlign: 'center' }}>연속</span>
        </div>

        {standings.map((row, idx) => {
          const team    = KBO_TEAMS[row.team]
          if (!team) return null
          const isTop3  = row.rank <= 3
          const isLast  = idx === standings.length - 1
          const isHover = hoveredRow === idx
          return (
            <div key={`${row.rank}-${row.team}`}
              onMouseEnter={() => setHoveredRow(idx)}
              onMouseLeave={() => setHoveredRow(null)}
              onClick={() => onTeamClick(row.team)}
              style={{
                display: 'grid', gridTemplateColumns: GRID,
                alignItems: 'center', padding: '13px 18px',
                boxShadow: isHover ? N.inset : (isLast ? 'none' : 'inset 0 -1px 0 rgba(var(--fg-rgb),0.04)'),
                background: isHover ? 'rgba(var(--fg-rgb),0.02)' : 'transparent',
                cursor: 'pointer', transition: 'box-shadow 0.2s, background 0.2s',
              }}
            >
              <span style={{
                textAlign: 'center', fontSize: '13px', fontWeight: 800, fontVariantNumeric: 'tabular-nums',
                color: isTop3 ? '#c084fc' : 'rgba(var(--fg-rgb), 0.35)',
              }}>{row.rank}</span>

              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <RankChange delta={rankChanges[row.team]} />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', paddingLeft: '8px' }}>
                <div style={{ width: '30px', height: '30px', borderRadius: '50%', flexShrink: 0, background: 'var(--neu-bg)', boxShadow: N.subtle, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <img src={team.logo} alt={team.name} style={{ width: '100%', height: '100%', borderRadius: '50%' }}
                    onError={e => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex' }} />
                  <div style={{ display: 'none', width: '100%', height: '100%', borderRadius: '50%', alignItems: 'center', justifyContent: 'center', background: team.color, color: team.textColor, fontSize: '9px', fontWeight: 700 }}>{team.short}</div>
                </div>
                <span style={{ fontSize: '13px', fontWeight: 600, color: 'rgba(var(--fg-rgb), 0.82)' }}>{team.name}</span>
              </div>

              <span style={{ textAlign: 'center', fontSize: '13px', color: 'rgba(var(--fg-rgb), 0.45)', fontVariantNumeric: 'tabular-nums' }}>{row.games}</span>
              <span style={{ textAlign: 'center', fontSize: '13px', fontWeight: 700, color: '#4ade80', fontVariantNumeric: 'tabular-nums' }}>{row.wins}</span>
              <span style={{ textAlign: 'center', fontSize: '13px', fontWeight: 700, color: '#f87171', fontVariantNumeric: 'tabular-nums' }}>{row.losses}</span>
              <span style={{ textAlign: 'center', fontSize: '13px', color: 'rgba(var(--fg-rgb), 0.35)', fontVariantNumeric: 'tabular-nums' }}>{row.draws}</span>
              <div style={{ display: 'flex', justifyContent: 'center' }}><WinRateBar winRate={row.winRate} teamColor={team.color} /></div>
              <div style={{ display: 'flex', justifyContent: 'center' }}><StreakBadge streak={row.streak} /></div>
            </div>
          )
        })}
      </div>
    </section>
  )
}
