import { useState, useEffect, useCallback } from 'react'
import { KBO_TEAMS } from '../data/mockGames'
import { fetchInjuries } from '../services/kboApi'

const TEAM_ORDER = ['LG', 'KT', '두산', 'SSG', 'NC', '삼성', '롯데', '한화', 'KIA', '키움']

const STATUS_STYLE = {
  DL:    { label: '부상자명단', bg: 'rgba(248,113,113,0.12)', color: '#f87171', border: 'rgba(248,113,113,0.35)' },
  재활:  { label: '재활 중',   bg: 'rgba(251,146,60,0.12)',  color: '#fb923c', border: 'rgba(251,146,60,0.35)'  },
  결장:  { label: '일시 결장', bg: 'rgba(250,204,21,0.12)',  color: '#facc15', border: 'rgba(250,204,21,0.3)'   },
  임의해지: { label: '임의해지', bg: 'rgba(148,163,184,0.1)', color: '#94a3b8', border: 'rgba(148,163,184,0.3)' },
}

const N = {
  raised: '6px 6px 16px var(--neu-sd), -4px -4px 10px var(--neu-sl)',
  inset:  'inset 3px 3px 8px var(--neu-sd), inset -2px -2px 6px var(--neu-sl)',
  subtle: '3px 3px 8px var(--neu-sd), -2px -2px 5px var(--neu-sl)',
  btn:    '4px 4px 10px var(--neu-sd), -3px -3px 7px var(--neu-sl)',
  btnActive: 'inset 2px 2px 6px var(--neu-sd), inset -1px -1px 4px var(--neu-sl)',
}

function InjuryRow({ player, teamColor, isLast }) {
  const s = STATUS_STYLE[player.status] ?? STATUS_STYLE['결장']
  return (
    <div style={{
      display: 'flex', alignItems: 'flex-start', gap: '14px', padding: '16px 22px',
      boxShadow: isLast ? 'none' : 'inset 0 -1px 0 rgba(var(--fg-rgb),0.04)',
    }}>
      <span style={{ fontSize: '10px', fontWeight: 700, padding: '3px 8px', borderRadius: '99px', background: s.bg, color: s.color, border: `1px solid ${s.border}`, whiteSpace: 'nowrap', flexShrink: 0, marginTop: '2px' }}>
        {s.label}
      </span>
      <div style={{ flex: 1, minWidth: 0, textAlign: 'left' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
          <span style={{ fontSize: '14px', fontWeight: 700, color: 'rgba(var(--fg-rgb), 0.85)' }}>{player.name}</span>
          {player.pos && (
            <span style={{ fontSize: '10px', fontWeight: 600, padding: '2px 6px', borderRadius: '4px', background: 'rgba(var(--fg-rgb),0.06)', color: 'rgba(var(--fg-rgb),0.4)' }}>{player.pos}</span>
          )}
        </div>
        {player.injuryType && <p style={{ fontSize: '12px', color: 'rgba(var(--fg-rgb),0.5)', marginBottom: '6px' }}>{player.injuryType}</p>}
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          {player.since && <span style={{ fontSize: '11px', color: 'rgba(var(--fg-rgb),0.28)' }}>등록: {player.since}</span>}
          {player.eta   && <span style={{ fontSize: '11px', fontWeight: 600, color: s.color }}>{player.eta}</span>}
        </div>
      </div>
    </div>
  )
}

export default function InjuryPage() {
  const [selectedTeam, setSelectedTeam] = useState('LG')
  const [players, setPlayers]           = useState([])
  const [loading, setLoading]           = useState(false)
  const [dataSource, setDataSource]     = useState('live')

  const loadInjuries = useCallback(async (teamKey) => {
    setLoading(true); setPlayers([])
    try {
      setPlayers(await fetchInjuries(teamKey))
      setDataSource('live')
    } catch (err) {
      console.warn('[InjuryPage]:', err.message)
      setDataSource('error')
    } finally { setLoading(false) }
  }, [])

  useEffect(() => { loadInjuries(selectedTeam) }, [selectedTeam, loadInjuries])

  const team       = KBO_TEAMS[selectedTeam]
  const dlCount      = players.filter(p => p.status === 'DL').length
  const rehabCount   = players.filter(p => p.status === '재활').length
  const outCount     = players.filter(p => p.status === '결장').length
  const dismissCount = players.filter(p => p.status === '임의해지').length

  return (
    <section style={{ width: '100%', padding: '28px 24px 40px' }}>
      <div style={{ marginBottom: '20px', textAlign: 'left', display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
        <div>
          <h2 style={{ fontSize: '18px', fontWeight: 800, color: 'rgba(var(--fg-rgb),0.88)', letterSpacing: '-0.3px', marginBottom: '4px' }}>구단별 부상 리포트</h2>
          <p style={{ fontSize: '12px', color: 'rgba(var(--fg-rgb),0.32)' }}>구단을 선택하면 현재 부상 · 결장 선수 현황을 확인할 수 있습니다</p>
        </div>
        <div style={{ marginLeft: 'auto' }}>
          {dataSource === 'live'
            ? <span className="live-badge" style={{ fontSize: '10px' }}><span className="live-dot" />실시간</span>
            : <span style={{ fontSize: '11px', color: 'rgba(255,100,100,0.7)' }}>연결 오류</span>
          }
        </div>
      </div>

      {/* 팀 버튼 */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginBottom: '24px' }}>
        {TEAM_ORDER.map(key => {
          const t = KBO_TEAMS[key]
          const isActive = key === selectedTeam
          return (
            <button key={key}
              onClick={() => setSelectedTeam(key)}
              style={{
                display: 'flex', alignItems: 'center', gap: '7px',
                padding: '8px 16px', borderRadius: '14px', fontSize: '12px', fontWeight: 700, cursor: 'pointer',
                background: 'var(--neu-bg)',
                boxShadow: isActive ? N.btnActive : N.btn,
                border: isActive ? `1.5px solid ${t.color}66` : '1.5px solid transparent',
                color: isActive ? t.color : 'rgba(var(--fg-rgb),0.55)',
                transition: 'all 0.2s',
              }}
            >
              <div style={{ width: '20px', height: '20px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <img src={t.logo} alt={t.short} style={{ width: '100%', height: '100%' }} onError={e => e.target.style.display = 'none'} />
              </div>
              {t.short}
            </button>
          )
        })}
      </div>

      {/* 부상 카드 */}
      <div style={{ borderRadius: '20px', overflow: 'hidden', background: 'var(--neu-bg)', boxShadow: N.raised }}>
        {/* 카드 헤더 */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '16px 22px', boxShadow: 'inset 0 -1px 0 rgba(var(--fg-rgb),0.05)' }}>
          <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--neu-bg)', boxShadow: N.subtle, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <img src={team.logo} alt={team.short} style={{ width: '100%', height: '100%', borderRadius: '50%' }} onError={e => e.target.style.display = 'none'} />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: '3px', height: '20px', borderRadius: '99px', background: team.color }} />
            <span style={{ fontSize: '14px', fontWeight: 700, color: 'rgba(var(--fg-rgb),0.85)' }}>{team.name} 부상 리포트</span>
          </div>
          <div style={{ marginLeft: 'auto', display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
            {loading && <span style={{ fontSize: '11px', color: 'rgba(var(--fg-rgb),0.3)' }}>조회 중...</span>}
            {!loading && dlCount > 0    && <span style={{ fontSize: '11px', padding: '3px 10px', borderRadius: '99px', fontWeight: 700, background: 'rgba(248,113,113,0.12)', color: '#f87171', border: '1px solid rgba(248,113,113,0.3)' }}>부상자명단 {dlCount}명</span>}
            {!loading && rehabCount > 0 && <span style={{ fontSize: '11px', padding: '3px 10px', borderRadius: '99px', fontWeight: 700, background: 'rgba(251,146,60,0.12)',  color: '#fb923c', border: '1px solid rgba(251,146,60,0.3)'  }}>재활 {rehabCount}명</span>}
            {!loading && outCount > 0     && <span style={{ fontSize: '11px', padding: '3px 10px', borderRadius: '99px', fontWeight: 700, background: 'rgba(250,204,21,0.12)',  color: '#facc15', border: '1px solid rgba(250,204,21,0.25)'  }}>결장 {outCount}명</span>}
            {!loading && dismissCount > 0 && <span style={{ fontSize: '11px', padding: '3px 10px', borderRadius: '99px', fontWeight: 700, background: 'rgba(148,163,184,0.1)', color: '#94a3b8', border: '1px solid rgba(148,163,184,0.3)' }}>임의해지 {dismissCount}명</span>}
          </div>
        </div>

        {loading && (
          <div style={{ padding: '56px 0', textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', color: 'rgba(var(--fg-rgb),0.3)' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ animation: 'spin 0.8s linear infinite' }}>
              <path d="M21 2v6h-6"/><path d="M3 12a9 9 0 0 1 15-6.7L21 8"/>
              <path d="M3 22v-6h6"/><path d="M21 12a9 9 0 0 1-15 6.7L3 16"/>
            </svg>
            <span style={{ fontSize: '13px' }}>부상자 명단 조회 중...</span>
          </div>
        )}

        {!loading && players.length === 0 && (
          <div style={{ padding: '56px 0', textAlign: 'center' }}>
            <p style={{ fontSize: '32px', marginBottom: '10px' }}>✅</p>
            <p style={{ fontSize: '14px', fontWeight: 600, color: 'rgba(var(--fg-rgb),0.65)', marginBottom: '4px' }}>부상 · 결장 선수 없음</p>
            <p style={{ fontSize: '12px', color: 'rgba(var(--fg-rgb),0.28)' }}>
              {dataSource === 'error' ? '데이터를 불러올 수 없습니다' : '현재 전원 정상 출전 가능합니다'}
            </p>
          </div>
        )}

        {!loading && players.map((player, i) => (
          <InjuryRow key={i} player={player} teamColor={team.color} isLast={i === players.length - 1} />
        ))}
      </div>
    </section>
  )
}
