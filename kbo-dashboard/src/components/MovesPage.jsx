import { useState, useEffect, useCallback } from 'react'
import { KBO_TEAMS } from '../data/mockGames'
import { fetchRosterMoves } from '../services/kboApi'

const N = {
  raised: '6px 6px 16px var(--neu-sd), -4px -4px 10px var(--neu-sl)',
  inset:  'inset 2px 2px 6px var(--neu-sd), inset -1px -1px 4px var(--neu-sl)',
  subtle: '3px 3px 8px var(--neu-sd), -2px -2px 5px var(--neu-sl)',
  btn:    '4px 4px 10px var(--neu-sd), -3px -3px 7px var(--neu-sl)',
}

const CATEGORIES = [
  { key: 'all',   label: '전체' },
  { key: 'up',    label: '1군 등록' },
  { key: 'rehab', label: '재활명단' },
  { key: 'trade', label: '트레이드' },
  { key: 'cut',   label: '방출/해지' },
  { key: 'sign',  label: 'FA/계약' },
]

function MoveRow({ move, isLast }) {
  const team = KBO_TEAMS[move.team]
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: '14px',
      padding: '14px 20px',
      boxShadow: isLast ? 'none' : 'inset 0 -1px 0 rgba(var(--fg-rgb),0.04)',
    }}>
      {/* 날짜 */}
      <span style={{ fontSize: '12px', color: 'rgba(var(--fg-rgb),0.3)', fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap', minWidth: '52px' }}>
        {move.date?.slice(5)}
      </span>

      {/* 구분 배지 */}
      <span style={{
        fontSize: '11px', fontWeight: 700, padding: '3px 8px', borderRadius: '99px',
        background: `${move.color}18`, color: move.color,
        border: `1px solid ${move.color}44`, whiteSpace: 'nowrap', flexShrink: 0,
      }}>
        {move.label}
      </span>

      {/* 팀 로고 + 이름 */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: '80px' }}>
        {team ? (
          <div style={{ width: '32px', height: '32px', borderRadius: '50%', flexShrink: 0, background: 'var(--neu-bg)', boxShadow: N.subtle, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <img src={team.logo} alt={team.short} style={{ width: '100%', height: '100%', borderRadius: '50%' }} onError={e => e.target.style.display = 'none'} />
          </div>
        ) : null}
        <span style={{ fontSize: '13px', fontWeight: 600, color: team?.color ?? 'rgba(var(--fg-rgb),0.6)', whiteSpace: 'nowrap' }}>
          {move.team}
        </span>
      </div>

      {/* 선수 이름 + 포지션 */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '6px', minWidth: 0 }}>
        <span style={{ fontSize: '15px', fontWeight: 700, color: 'rgba(var(--fg-rgb),0.85)' }}>{move.name}</span>
        {move.pos && (
          <span style={{ fontSize: '11px', fontWeight: 600, padding: '1px 5px', borderRadius: '4px', background: 'rgba(var(--fg-rgb),0.06)', color: 'rgba(var(--fg-rgb),0.4)', flexShrink: 0 }}>
            {move.pos}
          </span>
        )}
      </div>

      {/* 비고 */}
      {move.note && (
        <span style={{ fontSize: '12px', color: 'rgba(var(--fg-rgb),0.35)', whiteSpace: 'nowrap', maxWidth: '120px', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {move.note}
        </span>
      )}
    </div>
  )
}

export default function MovesPage() {
  const [moves, setMoves]         = useState([])
  const [loading, setLoading]     = useState(true)
  const [category, setCategory]   = useState('all')
  const [teamFilter, setTeamFilter] = useState('all')

  const load = useCallback(async () => {
    setLoading(true)
    try {
      setMoves(await fetchRosterMoves())
    } catch (err) {
      console.warn('[MovesPage]:', err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  const filtered = moves.filter(m => {
    if (category !== 'all' && m.category !== category) return false
    if (teamFilter !== 'all' && m.team !== teamFilter) return false
    return true
  })

  const teams = [...new Set(moves.map(m => m.team))].filter(Boolean).sort()

  return (
    <section style={{ width: '100%', padding: '28px 24px 40px' }}>
      {/* 헤더 */}
      <div style={{ marginBottom: '20px', textAlign: 'left', display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
        <div>
          <h2 style={{ fontSize: '20px', fontWeight: 800, color: 'rgba(var(--fg-rgb),0.88)', letterSpacing: '-0.3px', marginBottom: '4px' }}>
            로스터 무브
          </h2>
          <p style={{ fontSize: '13px', color: 'rgba(var(--fg-rgb),0.32)' }}>
            1군 등록 · 말소 · 트레이드 · FA · 해지 등 선수 이동 현황
          </p>
        </div>
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '8px' }}>
          {!loading && <span style={{ fontSize: '12px', color: 'rgba(var(--fg-rgb),0.3)' }}>{filtered.length}건</span>}
          <button onClick={load} style={{ padding: '5px 12px', borderRadius: '10px', fontSize: '12px', fontWeight: 600, border: 'none', cursor: 'pointer', background: 'var(--neu-bg)', boxShadow: N.btn, color: 'rgba(var(--fg-rgb),0.55)' }}>
            새로고침
          </button>
        </div>
      </div>

      {/* 카테고리 필터 */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '12px' }}>
        {CATEGORIES.map(c => {
          const isActive = category === c.key
          return (
            <button key={c.key} onClick={() => setCategory(c.key)} style={{
              padding: '6px 14px', borderRadius: '12px', fontSize: '13px', fontWeight: 700,
              border: 'none', cursor: 'pointer',
              background: 'var(--neu-bg)',
              boxShadow: isActive ? N.inset : N.btn,
              color: isActive ? 'rgba(var(--fg-rgb),0.85)' : 'rgba(var(--fg-rgb),0.45)',
              transition: 'all 0.15s',
            }}>
              {c.label}
            </button>
          )
        })}
      </div>

      {/* 팀 필터 */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '20px' }}>
        <button onClick={() => setTeamFilter('all')} style={{
          padding: '5px 12px', borderRadius: '10px', fontSize: '12px', fontWeight: 700,
          border: 'none', cursor: 'pointer', background: 'var(--neu-bg)',
          boxShadow: teamFilter === 'all' ? N.inset : N.subtle,
          color: teamFilter === 'all' ? 'rgba(var(--fg-rgb),0.85)' : 'rgba(var(--fg-rgb),0.4)',
        }}>전체 구단</button>
        {teams.map(t => {
          const team = KBO_TEAMS[t]
          const isActive = teamFilter === t
          return (
            <button key={t} onClick={() => setTeamFilter(t)} style={{
              padding: '5px 12px', borderRadius: '10px', fontSize: '12px', fontWeight: 700,
              border: isActive ? `1.5px solid ${team?.color ?? '#888'}66` : '1.5px solid transparent',
              cursor: 'pointer', background: 'var(--neu-bg)',
              boxShadow: isActive ? N.inset : N.subtle,
              color: isActive ? (team?.color ?? 'rgba(var(--fg-rgb),0.85)') : 'rgba(var(--fg-rgb),0.4)',
              transition: 'all 0.15s',
            }}>{t}</button>
          )
        })}
      </div>

      {/* 목록 */}
      <div style={{ borderRadius: '20px', overflow: 'hidden', background: 'var(--neu-bg)', boxShadow: N.raised }}>
        {loading ? (
          <div style={{ padding: '56px 0', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', color: 'rgba(var(--fg-rgb),0.3)' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ animation: 'spin 0.8s linear infinite' }}>
              <path d="M21 2v6h-6"/><path d="M3 12a9 9 0 0 1 15-6.7L21 8"/>
              <path d="M3 22v-6h6"/><path d="M21 12a9 9 0 0 1-15 6.7L3 16"/>
            </svg>
            <span style={{ fontSize: '14px' }}>데이터 조회 중...</span>
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: '56px 0', textAlign: 'center', fontSize: '14px', color: 'rgba(var(--fg-rgb),0.3)' }}>
            해당하는 기록이 없습니다
          </div>
        ) : (
          <>
            {/* 테이블 헤더 */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: '14px',
              padding: '10px 20px',
              boxShadow: 'inset 0 -1px 0 rgba(var(--fg-rgb),0.05)',
              fontSize: '12px', fontWeight: 700, letterSpacing: '0.5px', color: 'rgba(var(--fg-rgb),0.28)',
            }}>
              <span style={{ minWidth: '52px' }}>날짜</span>
              <span style={{ minWidth: '64px' }}>구분</span>
              <span style={{ minWidth: '80px' }}>구단</span>
              <span style={{ flex: 1 }}>선수</span>
              <span style={{ minWidth: '80px', textAlign: 'right' }}>비고</span>
            </div>
            {filtered.map((m, i) => (
              <MoveRow key={`${m.date}-${m.name}-${i}`} move={m} isLast={i === filtered.length - 1} />
            ))}
          </>
        )}
      </div>
    </section>
  )
}
