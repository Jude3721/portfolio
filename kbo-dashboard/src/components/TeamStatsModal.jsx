import { useEffect, useState } from 'react'
import { KBO_TEAMS } from '../data/mockGames'
import { fetchTeamStats } from '../services/kboApi'

const N = {
  raised: '8px 8px 20px var(--neu-sd), -5px -5px 13px var(--neu-sl)',
  inset:  'inset 2px 2px 6px var(--neu-sd), inset -1px -1px 4px var(--neu-sl)',
  subtle: '3px 3px 8px var(--neu-sd), -2px -2px 5px var(--neu-sl)',
}

function Th({ children, align = 'right' }) {
  return (
    <th style={{ padding: '10px 12px', fontSize: '11px', fontWeight: 700, letterSpacing: '0.3px', textAlign: align, color: 'rgba(var(--fg-rgb),0.3)', whiteSpace: 'nowrap', boxShadow: 'inset 0 -1px 0 rgba(var(--fg-rgb),0.05)' }}>
      {children}
    </th>
  )
}
function Td({ children, highlight, align = 'right' }) {
  return (
    <td style={{ padding: '10px 12px', fontSize: '13px', fontVariantNumeric: 'tabular-nums', textAlign: align, color: highlight ? '#c084fc' : 'rgba(var(--fg-rgb),0.78)', fontWeight: highlight ? 700 : 400, textShadow: highlight ? '0 0 8px rgba(192,132,252,0.4)' : 'none' }}>
      {children}
    </td>
  )
}

function BatterTable({ batters }) {
  const [hovered, setHovered] = useState(null)
  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead><tr><Th align="left">선수</Th><Th>경기</Th><Th>타수</Th><Th>안타</Th><Th>홈런</Th><Th>타점</Th><Th>볼넷</Th><Th>타율</Th><Th>출루율</Th></tr></thead>
        <tbody>
          {batters.map((p, i) => (
            <tr key={p.name} onMouseEnter={() => setHovered(i)} onMouseLeave={() => setHovered(null)}
              style={{ boxShadow: hovered === i ? N.inset : (i < batters.length-1 ? 'inset 0 -1px 0 rgba(var(--fg-rgb),0.04)' : 'none'), transition: 'box-shadow 0.15s' }}>
              <Td align="left">{p.name}</Td><Td>{p.games}</Td><Td>{p.ab}</Td><Td>{p.hits}</Td>
              <Td highlight={p.hr > 0}>{p.hr}</Td><Td>{p.rbi}</Td><Td>{p.bb}</Td>
              <Td highlight={p.avg >= 0.400}>{p.avg.toFixed(3)}</Td>
              <Td highlight={p.obp >= 0.450}>{p.obp.toFixed(3)}</Td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function PitcherTable({ pitchers }) {
  const [hovered, setHovered] = useState(null)
  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead><tr><Th align="left">선수</Th><Th>경기</Th><Th>이닝</Th><Th>승</Th><Th>패</Th><Th>SV</Th><Th>탈삼진</Th><Th>피안타</Th><Th>ERA</Th><Th>WHIP</Th></tr></thead>
        <tbody>
          {pitchers.map((p, i) => (
            <tr key={p.name} onMouseEnter={() => setHovered(i)} onMouseLeave={() => setHovered(null)}
              style={{ boxShadow: hovered === i ? N.inset : (i < pitchers.length-1 ? 'inset 0 -1px 0 rgba(var(--fg-rgb),0.04)' : 'none'), transition: 'box-shadow 0.15s' }}>
              <Td align="left">{p.name}</Td><Td>{p.games}</Td><Td>{p.innings.toFixed(1)}</Td>
              <Td highlight={p.wins > 0}>{p.wins}</Td><Td>{p.losses}</Td>
              <Td highlight={(p.saves ?? 0) > 0}>{p.saves ?? 0}</Td>
              <Td>{p.ks}</Td><Td>{p.hits}</Td>
              <Td highlight={p.era < 2.00}>{p.era.toFixed(2)}</Td>
              <Td highlight={p.whip < 1.00}>{p.whip.toFixed(2)}</Td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default function TeamStatsModal({ teamKey, onClose }) {
  const team = KBO_TEAMS[teamKey]
  const [stats, setStats]     = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState(null)
  const [updatedAt, setUpdatedAt] = useState(null)

  useEffect(() => {
    const onKey = e => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose])

  useEffect(() => {
    if (!teamKey) return
    setLoading(true); setError(null)
    fetchTeamStats(teamKey)
      .then(data => { setStats(data); setUpdatedAt(new Date()) })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false))
  }, [teamKey])

  if (!team) return null

  return (
    <>
      <div onClick={onClose} style={{ position: 'fixed', inset: 0, zIndex: 40, background: 'rgba(0,0,0,0.45)' }} />
      <div style={{
        position: 'fixed', right: 0, top: 0, bottom: 0, zIndex: 50,
        width: 'min(680px,100vw)', display: 'flex', flexDirection: 'column', overflow: 'hidden',
        background: 'var(--neu-bg)',
        boxShadow: '-8px 0 32px var(--neu-sd), 4px 0 16px var(--neu-sl)',
      }}>
        {/* 팀 컬러 상단 라인 */}
        <div style={{ height: '3px', background: `linear-gradient(to right, ${team.color}, ${team.color}44, transparent)`, flexShrink: 0 }} />

        {/* 헤더 */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 24px', boxShadow: 'inset 0 -1px 0 rgba(var(--fg-rgb),0.05)', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{ width: '46px', height: '46px', borderRadius: '50%', background: 'var(--neu-bg)', boxShadow: N.raised, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <img src={team.logo} alt={team.name} style={{ width: '100%', height: '100%', borderRadius: '50%' }} onError={e => e.target.style.display = 'none'} />
            </div>
            <div>
              <h2 style={{ fontSize: '17px', fontWeight: 800, color: 'rgba(var(--fg-rgb),0.9)', letterSpacing: '-0.3px', marginBottom: '3px' }}>{team.name}</h2>
              <p style={{ fontSize: '11px', color: 'rgba(var(--fg-rgb),0.32)' }}>
                2026 시즌 선수 스탯
                {updatedAt && <span style={{ marginLeft: '6px', color: 'rgba(var(--fg-rgb),0.22)' }}>· {updatedAt.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })} 기준</span>}
              </p>
            </div>
          </div>
          <button onClick={onClose} style={{
            width: '34px', height: '34px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'var(--neu-bg)', boxShadow: N.subtle, border: 'none',
            color: 'rgba(var(--fg-rgb),0.45)', fontSize: '14px', cursor: 'pointer',
          }}
            onMouseEnter={e => e.currentTarget.style.boxShadow = N.inset}
            onMouseLeave={e => e.currentTarget.style.boxShadow = N.subtle}
          >✕</button>
        </div>

        {/* 바디 */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {loading ? (
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '80px 0', gap: '10px', color: 'rgba(var(--fg-rgb),0.3)' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ animation: 'spin 0.8s linear infinite' }}>
                <path d="M21 2v6h-6"/><path d="M3 12a9 9 0 0 1 15-6.7L21 8"/>
                <path d="M3 22v-6h6"/><path d="M21 12a9 9 0 0 1-15 6.7L3 16"/>
              </svg>
              <span style={{ fontSize: '14px' }}>스탯 불러오는 중...</span>
            </div>
          ) : error ? (
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '80px 0', fontSize: '14px', color: 'rgba(var(--fg-rgb),0.3)' }}>데이터를 불러올 수 없습니다</div>
          ) : stats && (
            <>
              <div style={{ padding: '14px 18px', borderRadius: '16px', display: 'flex', alignItems: 'center', gap: '12px', boxShadow: N.inset }}>
                <div style={{ width: '4px', height: '38px', borderRadius: '99px', background: team.color, flexShrink: 0 }} />
                <div>
                  <p style={{ fontSize: '12px', fontWeight: 700, color: team.color, marginBottom: '3px' }}>타자 {stats.batters.length}명 · 투수 {stats.pitchers.length}명</p>
                  <p style={{ fontSize: '11px', color: 'rgba(var(--fg-rgb),0.35)' }}>보라색 강조 = 상위 스탯</p>
                </div>
              </div>

              <section>
                <h3 style={{ fontSize: '11px', fontWeight: 700, color: 'rgba(var(--fg-rgb),0.4)', marginBottom: '10px', letterSpacing: '2px', textTransform: 'uppercase' }}>타자</h3>
                <div style={{ borderRadius: '16px', overflow: 'hidden', background: 'var(--neu-bg)', boxShadow: N.raised }}>
                  <BatterTable batters={stats.batters} />
                </div>
              </section>

              <section>
                <h3 style={{ fontSize: '11px', fontWeight: 700, color: 'rgba(var(--fg-rgb),0.4)', marginBottom: '10px', letterSpacing: '2px', textTransform: 'uppercase' }}>투수</h3>
                <div style={{ borderRadius: '16px', overflow: 'hidden', background: 'var(--neu-bg)', boxShadow: N.raised }}>
                  <PitcherTable pitchers={stats.pitchers} />
                </div>
              </section>
            </>
          )}
        </div>
      </div>
    </>
  )
}
