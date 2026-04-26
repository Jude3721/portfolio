import { useState } from 'react'
import { KBO_TEAMS } from '../data/mockGames'

const G = {
  bg:     'rgba(255,255,255,0.05)',
  bgDeep: 'rgba(255,255,255,0.03)',
  border: 'rgba(255,255,255,0.08)',
  blur:   'blur(16px)',
}

function StreakBadge({ streak }) {
  const isWin  = streak.includes('연승')
  const isLose = streak.includes('연패')
  const color  = isWin ? '#4ade80' : isLose ? '#f87171' : 'rgba(255,255,255,0.4)'
  const bg     = isWin ? 'rgba(74,222,128,0.12)' : isLose ? 'rgba(248,113,113,0.12)' : 'rgba(255,255,255,0.05)'
  const border = isWin ? 'rgba(74,222,128,0.3)'  : isLose ? 'rgba(248,113,113,0.3)'  : 'rgba(255,255,255,0.1)'
  return (
    <span style={{
      display: 'inline-block', padding: '2px 8px', borderRadius: '99px',
      fontSize: '11px', fontWeight: 700,
      background: bg, color, border: `1px solid ${border}`,
      boxShadow: isWin || isLose ? `0 0 8px ${color}44` : 'none',
    }}>{streak}</span>
  )
}

function WinRateBar({ winRate, teamColor }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
      <span style={{ fontSize: '13px', fontVariantNumeric: 'tabular-nums', width: '44px', textAlign: 'right', color: 'rgba(255,255,255,0.85)', fontWeight: 600 }}>
        {winRate.toFixed(3)}
      </span>
      <div style={{ width: '56px', height: '5px', borderRadius: '99px', background: 'rgba(255,255,255,0.07)', overflow: 'hidden' }}>
        <div style={{
          height: '100%', borderRadius: '99px', width: `${winRate * 100}%`,
          background: `linear-gradient(to right, ${teamColor}, ${teamColor}bb)`,
          boxShadow: `0 0 6px ${teamColor}88`, transition: 'width 0.8s ease',
        }} />
      </div>
    </div>
  )
}

export default function StandingsTable({ standings = [], onTeamClick, dataSource = 'mock' }) {
  const [hoveredRow, setHoveredRow] = useState(null)
  const dateStr = new Date().toLocaleDateString('ko-KR', { month: 'long', day: 'numeric' })

  return (
    <section style={{ width: '100%', padding: '0 24px 40px' }}>
      <div style={{ marginBottom: '16px', textAlign: 'left', display: 'flex', alignItems: 'center', gap: '10px' }}>
        <h2 style={{ fontSize: '18px', fontWeight: 800, color: 'rgba(255,255,255,0.9)', letterSpacing: '-0.3px', margin: 0 }}>
          2026 시즌 순위
        </h2>
        {dataSource === 'live'
          ? <span className="live-badge" style={{ fontSize: '10px' }}><span className="live-dot" />실시간</span>
          : <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.3)' }}>목업 데이터</span>
        }
        <span style={{ marginLeft: 'auto', fontSize: '11px', color: 'rgba(255,255,255,0.3)' }}>
          {dateStr} 기준 · 구단 클릭 → 선수 스탯
        </span>
      </div>

      <div style={{
        borderRadius: '20px', overflow: 'hidden',
        background: G.bg, backdropFilter: G.blur, WebkitBackdropFilter: G.blur,
        border: `1px solid ${G.border}`, boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
      }}>
        {/* 헤더 */}
        <div style={{
          display: 'grid', gridTemplateColumns: '2.2rem 1fr 3rem 3rem 3rem 3rem 10rem 5rem',
          padding: '10px 16px', background: G.bgDeep, borderBottom: `1px solid ${G.border}`,
          fontSize: '11px', fontWeight: 700, letterSpacing: '0.5px', color: 'rgba(255,255,255,0.35)',
        }}>
          <span style={{ textAlign: 'center' }}>순위</span>
          <span style={{ paddingLeft: '8px' }}>구단</span>
          <span style={{ textAlign: 'center' }}>경기</span>
          <span style={{ textAlign: 'center' }}>승</span>
          <span style={{ textAlign: 'center' }}>패</span>
          <span style={{ textAlign: 'center' }}>무</span>
          <span style={{ textAlign: 'center' }}>승률</span>
          <span style={{ textAlign: 'center' }}>연속</span>
        </div>

        {standings.map((row, idx) => {
          const team   = KBO_TEAMS[row.team]
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
                display: 'grid', gridTemplateColumns: '2.2rem 1fr 3rem 3rem 3rem 3rem 10rem 5rem',
                alignItems: 'center', padding: '12px 16px',
                borderBottom: isLast ? 'none' : `1px solid ${G.border}`,
                background: isHover ? `linear-gradient(to right, ${team.color}14, rgba(255,255,255,0.04))` : 'transparent',
                cursor: 'pointer', transition: 'background 0.2s',
              }}
            >
              <span style={{
                textAlign: 'center', fontSize: '13px', fontWeight: 800, fontVariantNumeric: 'tabular-nums',
                color: isTop3 ? '#c084fc' : 'rgba(255,255,255,0.45)',
                textShadow: isTop3 ? '0 0 10px rgba(192,132,252,0.5)' : 'none',
              }}>{row.rank}</span>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', paddingLeft: '8px' }}>
                <div style={{
                  width: '28px', height: '28px', borderRadius: '50%', flexShrink: 0,
                  background: `${team.color}22`, border: `1px solid ${team.color}44`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <img src={team.logo} alt={team.name} style={{ width: '70%', height: '70%' }}
                    onError={e => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex' }} />
                  <div style={{ display: 'none', width: '100%', height: '100%', borderRadius: '50%', alignItems: 'center', justifyContent: 'center', background: team.color, color: team.textColor, fontSize: '9px', fontWeight: 700 }}>{team.short}</div>
                </div>
                <span style={{ fontSize: '13px', fontWeight: 600, color: 'rgba(255,255,255,0.85)' }}>{team.name}</span>
              </div>

              <span style={{ textAlign: 'center', fontSize: '13px', color: 'rgba(255,255,255,0.5)', fontVariantNumeric: 'tabular-nums' }}>{row.games}</span>
              <span style={{ textAlign: 'center', fontSize: '13px', fontWeight: 700, color: '#4ade80', fontVariantNumeric: 'tabular-nums' }}>{row.wins}</span>
              <span style={{ textAlign: 'center', fontSize: '13px', fontWeight: 700, color: '#f87171', fontVariantNumeric: 'tabular-nums' }}>{row.losses}</span>
              <span style={{ textAlign: 'center', fontSize: '13px', color: 'rgba(255,255,255,0.4)', fontVariantNumeric: 'tabular-nums' }}>{row.draws}</span>
              <div style={{ display: 'flex', justifyContent: 'center' }}><WinRateBar winRate={row.winRate} teamColor={team.color} /></div>
              <div style={{ display: 'flex', justifyContent: 'center' }}><StreakBadge streak={row.streak} /></div>
            </div>
          )
        })}
      </div>
    </section>
  )
}
