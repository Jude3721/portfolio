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
        background: 'rgba(0,0,0,0.35)', backdropFilter: 'blur(6px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: 'var(--neu-bg)',
          boxShadow: '12px 12px 30px var(--neu-sd), -8px -8px 20px var(--neu-sl)',
          borderRadius: '24px',
          padding: '28px 24px',
          width: '360px', maxWidth: '95vw',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
          <div>
            <h2 style={{ fontSize: '16px', fontWeight: 800, color: 'rgba(var(--fg-rgb),0.9)' }}>
              응원 팀 선택
            </h2>
            <p style={{ fontSize: '12px', color: 'rgba(var(--fg-rgb),0.35)', marginTop: '3px' }}>
              내가 응원하는 KBO 팀을 선택하세요
            </p>
          </div>
          {wishTeam && (
            <button
              onClick={() => { onSelect(null); onClose() }}
              style={{
                padding: '5px 12px', borderRadius: '8px', fontSize: '11px', fontWeight: 700,
                border: 'none', cursor: 'pointer',
                background: 'var(--neu-bg)',
                boxShadow: '3px 3px 8px var(--neu-sd), -2px -2px 5px var(--neu-sl)',
                color: 'rgba(var(--fg-rgb),0.5)',
              }}
            >
              선택 해제
            </button>
          )}
        </div>

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
                  padding: '10px 4px', borderRadius: '14px', border: 'none', cursor: 'pointer',
                  background: isWish ? team.color : 'var(--neu-bg)',
                  boxShadow: isWish
                    ? `0 4px 14px ${team.color}60`
                    : '4px 4px 10px var(--neu-sd), -3px -3px 7px var(--neu-sl)',
                  transition: 'all 0.18s',
                }}
                onMouseEnter={e => { if (!isWish) e.currentTarget.style.boxShadow = 'inset 2px 2px 6px var(--neu-sd), inset -1px -1px 4px var(--neu-sl)' }}
                onMouseLeave={e => { if (!isWish) e.currentTarget.style.boxShadow = '4px 4px 10px var(--neu-sd), -3px -3px 7px var(--neu-sl)' }}
              >
                {/* 팀 컬러 원 */}
                <div style={{
                  width: '32px', height: '32px', borderRadius: '50%',
                  background: isWish ? 'rgba(255,255,255,0.2)' : team.color,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '10px', fontWeight: 800, color: '#fff',
                  flexShrink: 0,
                }}>
                  {team.short.slice(0, 2)}
                </div>
                <span style={{
                  fontSize: '10px', fontWeight: 700,
                  color: isWish ? '#fff' : 'rgba(var(--fg-rgb),0.55)',
                  textAlign: 'center', lineHeight: 1.2,
                }}>
                  {team.short}
                </span>
                {isWish && <span style={{ fontSize: '8px', color: 'rgba(255,255,255,0.8)', fontWeight: 800 }}>★ 내 팀</span>}
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
