import { useEffect } from 'react'
import { KBO_TEAMS, KBO_TEAM_KEYS } from '../data/kboTeams'

export default function WishTeamModal({ wishTeam, onSelect, onClose }) {
  useEffect(() => {
    const onKey = e => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 2000,
        background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: 'rgba(10,10,20,0.97)',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: '20px', padding: '24px',
          width: '400px', maxWidth: '95vw',
          boxShadow: '0 24px 80px rgba(0,0,0,0.7)',
        }}
      >
        {/* 헤더 */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
          <div>
            <h2 style={{ fontSize: '16px', fontWeight: 800, color: '#fff' }}>응원 팀 선택</h2>
            <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.35)', marginTop: '3px' }}>
              내가 응원하는 KBO 팀을 선택하세요
            </p>
          </div>
          {wishTeam && (
            <button
              onClick={() => { onSelect(null); onClose() }}
              style={{
                padding: '5px 12px', borderRadius: '8px', fontSize: '11px', fontWeight: 700,
                border: '1px solid rgba(255,100,100,0.3)', background: 'rgba(255,100,100,0.1)',
                color: 'rgba(255,100,100,0.8)', cursor: 'pointer',
              }}
            >
              선택 해제
            </button>
          )}
        </div>

        {/* 팀 그리드 */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '10px' }}>
          {KBO_TEAM_KEYS.map(key => {
            const team   = KBO_TEAMS[key]
            const isWish = wishTeam === key
            return (
              <button
                key={key}
                onClick={() => { onSelect(isWish ? null : key); onClose() }}
                title={team.name}
                style={{
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px',
                  padding: '12px 6px', borderRadius: '14px', border: 'none', cursor: 'pointer',
                  background: isWish ? `${team.color}30` : 'rgba(255,255,255,0.04)',
                  outline: isWish ? `2px solid ${team.color}` : '2px solid transparent',
                  transition: 'all 0.15s',
                }}
                onMouseEnter={e => { if (!isWish) e.currentTarget.style.background = 'rgba(255,255,255,0.09)' }}
                onMouseLeave={e => { if (!isWish) e.currentTarget.style.background = 'rgba(255,255,255,0.04)' }}
              >
                <img
                  src={team.logo}
                  alt={team.short}
                  style={{ width: '40px', height: '40px', objectFit: 'contain' }}
                  onError={e => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex' }}
                />
                {/* 로고 로드 실패 시 fallback */}
                <div style={{
                  display: 'none', width: '40px', height: '40px', borderRadius: '50%',
                  background: team.color, alignItems: 'center', justifyContent: 'center',
                  fontSize: '10px', fontWeight: 800, color: '#fff',
                }}>
                  {team.short.slice(0, 2)}
                </div>
                <span style={{
                  fontSize: '11px', fontWeight: 700, color: isWish ? '#fff' : 'rgba(255,255,255,0.55)',
                }}>
                  {team.short}
                </span>
                {isWish && <span style={{ fontSize: '9px', color: '#F4A261', fontWeight: 800 }}>★ 내 팀</span>}
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
