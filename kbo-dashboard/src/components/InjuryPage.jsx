import { useState, useEffect, useCallback } from 'react'
import { KBO_TEAMS } from '../data/mockGames'
import { fetchInjuries } from '../services/kboApi'

const TEAM_ORDER = ['LG', 'KT', '두산', 'SSG', 'NC', '삼성', '롯데', '한화', 'KIA', '키움']

const STATUS_STYLE = {
  DL:  { label: '부상자명단', bg: 'rgba(248,113,113,0.12)', color: '#f87171', border: 'rgba(248,113,113,0.35)' },
  재활: { label: '재활 중',   bg: 'rgba(251,146,60,0.12)',  color: '#fb923c', border: 'rgba(251,146,60,0.35)'  },
  결장: { label: '일시 결장', bg: 'rgba(250,204,21,0.12)',  color: '#facc15', border: 'rgba(250,204,21,0.3)'   },
}

const G = {
  bg: 'rgba(255,255,255,0.05)', bgDeep: 'rgba(255,255,255,0.03)',
  border: 'rgba(255,255,255,0.08)', blur: 'blur(16px)',
}

function InjuryRow({ player, teamColor, isLast }) {
  const s = STATUS_STYLE[player.status] ?? STATUS_STYLE['결장']
  return (
    <div style={{
      display: 'flex', alignItems: 'flex-start', gap: '14px', padding: '14px 20px',
      borderBottom: isLast ? 'none' : `1px solid ${G.border}`,
    }}>
      <span style={{
        fontSize: '10px', fontWeight: 700, padding: '3px 8px', borderRadius: '99px',
        background: s.bg, color: s.color, border: `1px solid ${s.border}`,
        boxShadow: `0 0 8px ${s.color}33`, whiteSpace: 'nowrap', flexShrink: 0, marginTop: '2px',
      }}>{s.label}</span>
      <div style={{ flex: 1, minWidth: 0, textAlign: 'left' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
          <span style={{ fontSize: '14px', fontWeight: 700, color: 'rgba(255,255,255,0.88)' }}>{player.name}</span>
          {player.pos && (
            <span style={{ fontSize: '10px', fontWeight: 600, padding: '2px 6px', borderRadius: '4px', background: 'rgba(255,255,255,0.07)', color: 'rgba(255,255,255,0.45)' }}>{player.pos}</span>
          )}
        </div>
        {player.injuryType && (
          <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.55)', marginBottom: '6px' }}>{player.injuryType}</p>
        )}
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          {player.since && (
            <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.3)' }}>등록: {player.since}</span>
          )}
          {player.eta && (
            <span style={{ fontSize: '11px', fontWeight: 600, color: teamColor, textShadow: `0 0 8px ${teamColor}66` }}>{player.eta}</span>
          )}
        </div>
      </div>
    </div>
  )
}

export default function InjuryPage() {
  const [selectedTeam, setSelectedTeam] = useState('LG')
  const [hoveredTeam, setHoveredTeam]   = useState(null)
  const [players, setPlayers]           = useState([])
  const [loading, setLoading]           = useState(false)
  const [dataSource, setDataSource]     = useState('live')

  const loadInjuries = useCallback(async (teamKey) => {
    setLoading(true)
    setPlayers([])
    try {
      const data = await fetchInjuries(teamKey)
      setPlayers(data)
      setDataSource('live')
    } catch (err) {
      console.warn('[InjuryPage] 부상자 API 오류:', err.message)
      setPlayers([])
      setDataSource('error')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadInjuries(selectedTeam)
  }, [selectedTeam, loadInjuries])

  const team        = KBO_TEAMS[selectedTeam]
  const dlCount     = players.filter(p => p.status === 'DL').length
  const rehabCount  = players.filter(p => p.status === '재활').length
  const outCount    = players.filter(p => p.status === '결장').length

  return (
    <section style={{ width: '100%', padding: '28px 24px 40px' }}>
      {/* 섹션 헤더 */}
      <div style={{ marginBottom: '20px', textAlign: 'left', display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
        <div>
          <h2 style={{ fontSize: '18px', fontWeight: 800, color: 'rgba(255,255,255,0.9)', letterSpacing: '-0.3px', margin: '0 0 4px' }}>구단별 부상 리포트</h2>
          <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.35)' }}>구단을 선택하면 현재 부상 · 결장 선수 현황을 확인할 수 있습니다</p>
        </div>
        <div style={{ marginLeft: 'auto' }}>
          {dataSource === 'live'
            ? <span className="live-badge" style={{ fontSize: '10px' }}><span className="live-dot" />실시간</span>
            : <span style={{ fontSize: '11px', color: 'rgba(255,100,100,0.7)' }}>연결 오류</span>
          }
        </div>
      </div>

      {/* 팀 선택 버튼 */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '20px' }}>
        {TEAM_ORDER.map(key => {
          const t        = KBO_TEAMS[key]
          const isActive = key === selectedTeam
          const isHover  = hoveredTeam === key
          return (
            <button key={key}
              onClick={() => setSelectedTeam(key)}
              onMouseEnter={() => setHoveredTeam(key)}
              onMouseLeave={() => setHoveredTeam(null)}
              style={{
                display: 'flex', alignItems: 'center', gap: '6px',
                padding: '7px 14px', borderRadius: '12px', fontSize: '12px', fontWeight: 700, cursor: 'pointer',
                background: isActive ? `linear-gradient(135deg, ${t.color}44, ${t.color}22)` : isHover ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.05)',
                border: isActive ? `1px solid ${t.color}88` : `1px solid ${G.border}`,
                color: isActive ? '#fff' : 'rgba(255,255,255,0.6)',
                boxShadow: isActive ? `0 0 16px ${t.color}44` : 'none',
                backdropFilter: 'blur(8px)', transition: 'all 0.2s',
              }}
            >
              <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: isActive ? `${t.color}44` : 'rgba(255,255,255,0.06)', border: `1px solid ${isActive ? t.color + '66' : 'transparent'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <img src={t.logo} alt={t.short} style={{ width: '70%', height: '70%' }} onError={e => { e.target.style.display = 'none' }} />
              </div>
              {t.short}
            </button>
          )
        })}
      </div>

      {/* 부상 카드 */}
      <div style={{ borderRadius: '20px', overflow: 'hidden', background: G.bg, backdropFilter: G.blur, WebkitBackdropFilter: G.blur, border: `1px solid ${G.border}`, boxShadow: '0 8px 32px rgba(0,0,0,0.3)' }}>
        {/* 카드 헤더 */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '14px 20px', background: `linear-gradient(to right, ${team.color}1a, ${G.bgDeep})`, borderBottom: `1px solid ${G.border}` }}>
          <div style={{ width: '28px', height: '28px', borderRadius: '50%', flexShrink: 0, background: team.color, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: `0 0 12px ${team.color}66` }}>
            <img src={team.logo} alt={team.short} style={{ width: '70%', height: '70%' }} onError={e => { e.target.style.display = 'none' }} />
          </div>
          <span style={{ fontSize: '14px', fontWeight: 700, color: 'rgba(255,255,255,0.88)' }}>{team.name} 부상 리포트</span>
          <div style={{ marginLeft: 'auto', display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
            {loading && <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.35)' }}>조회 중...</span>}
            {!loading && dlCount > 0    && <span style={{ fontSize: '11px', padding: '3px 10px', borderRadius: '99px', fontWeight: 700, background: 'rgba(248,113,113,0.12)', color: '#f87171', border: '1px solid rgba(248,113,113,0.3)' }}>부상자명단 {dlCount}명</span>}
            {!loading && rehabCount > 0 && <span style={{ fontSize: '11px', padding: '3px 10px', borderRadius: '99px', fontWeight: 700, background: 'rgba(251,146,60,0.12)', color: '#fb923c', border: '1px solid rgba(251,146,60,0.3)' }}>재활 {rehabCount}명</span>}
            {!loading && outCount > 0   && <span style={{ fontSize: '11px', padding: '3px 10px', borderRadius: '99px', fontWeight: 700, background: 'rgba(250,204,21,0.12)', color: '#facc15', border: '1px solid rgba(250,204,21,0.25)' }}>결장 {outCount}명</span>}
          </div>
        </div>

        {/* 로딩 */}
        {loading && (
          <div style={{ padding: '56px 0', textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', color: 'rgba(255,255,255,0.35)' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ animation: 'spin 0.8s linear infinite' }}>
              <path d="M21 2v6h-6"/><path d="M3 12a9 9 0 0 1 15-6.7L21 8"/>
              <path d="M3 22v-6h6"/><path d="M21 12a9 9 0 0 1-15 6.7L3 16"/>
            </svg>
            <span style={{ fontSize: '13px' }}>부상자 명단 조회 중...</span>
          </div>
        )}

        {/* 선수 없음 */}
        {!loading && players.length === 0 && (
          <div style={{ padding: '56px 0', textAlign: 'center' }}>
            <p style={{ fontSize: '32px', marginBottom: '10px' }}>✅</p>
            <p style={{ fontSize: '14px', fontWeight: 600, color: 'rgba(255,255,255,0.7)', marginBottom: '4px' }}>부상 · 결장 선수 없음</p>
            <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.3)' }}>
              {dataSource === 'error' ? '데이터를 불러올 수 없습니다' : '현재 전원 정상 출전 가능합니다'}
            </p>
          </div>
        )}

        {/* 선수 목록 */}
        {!loading && players.map((player, i) => (
          <InjuryRow key={i} player={player} teamColor={team.color} isLast={i === players.length - 1} />
        ))}
      </div>
    </section>
  )
}
