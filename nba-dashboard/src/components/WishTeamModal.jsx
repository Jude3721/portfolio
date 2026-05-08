import { useEffect } from 'react'
import { NBA_TEAMS, EAST_TEAMS, WEST_TEAMS } from '../data/nbaTeams'

export default function WishTeamModal({ wishTeam, onSelect, onClose }) {
  useEffect(() => {
    const onKey = e => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  const TeamBtn = ({ tri }) => {
    const team     = NBA_TEAMS[tri]
    const isWish   = wishTeam === tri
    return (
      <button
        onClick={() => { onSelect(isWish ? null : tri); onClose() }}
        title={team.name}
        style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px',
          padding: '10px 8px', borderRadius: '12px', border: 'none', cursor: 'pointer',
          background: isWish ? `${team.color}30` : 'rgba(255,255,255,0.04)',
          outline: isWish ? `2px solid ${team.color}` : '2px solid transparent',
          transition: 'all 0.15s',
        }}
        onMouseEnter={e => { if (!isWish) e.currentTarget.style.background = 'rgba(255,255,255,0.09)' }}
        onMouseLeave={e => { if (!isWish) e.currentTarget.style.background = 'rgba(255,255,255,0.04)' }}
      >
        <img src={team.logo} alt={tri}
          style={{ width: '36px', height: '36px', objectFit: 'contain' }}
          onError={e => e.target.style.display = 'none'}
        />
        <span style={{ fontSize: '10px', fontWeight: 700, color: isWish ? '#fff' : 'rgba(255,255,255,0.5)' }}>
          {tri}
        </span>
        {isWish && <span style={{ fontSize: '8px', color: '#F4A261', fontWeight: 800 }}>★ 내 팀</span>}
      </button>
    )
  }

  const Section = ({ label, teams }) => (
    <div style={{ marginBottom: '20px' }}>
      <p style={{ fontSize: '11px', fontWeight: 700, color: 'rgba(255,255,255,0.3)', marginBottom: '10px', letterSpacing: '1px' }}>
        {label}
      </p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '6px' }}>
        {teams.map(tri => <TeamBtn key={tri} tri={tri} />)}
      </div>
    </div>
  )

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 2000,
        background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(6px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: '#0f1117', borderRadius: '20px',
          border: '1px solid rgba(255,255,255,0.1)',
          padding: '28px', width: '420px', maxWidth: '95vw',
          maxHeight: '85vh', overflowY: 'auto',
          boxShadow: '0 24px 80px rgba(0,0,0,0.6)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
          <div>
            <h2 style={{ fontSize: '16px', fontWeight: 800, color: '#fff' }}>위시 팀 선택</h2>
            <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.3)', marginTop: '3px' }}>
              응원하는 팀을 선택하세요
            </p>
          </div>
          {wishTeam && (
            <button
              onClick={() => { onSelect(null); onClose() }}
              style={{
                padding: '6px 12px', borderRadius: '8px', fontSize: '11px', fontWeight: 700,
                border: '1px solid rgba(255,100,100,0.3)', background: 'rgba(255,100,100,0.1)',
                color: 'rgba(255,100,100,0.8)', cursor: 'pointer',
              }}
            >
              선택 해제
            </button>
          )}
        </div>

        <Section label="EASTERN CONFERENCE" teams={EAST_TEAMS} />
        <Section label="WESTERN CONFERENCE" teams={WEST_TEAMS} />
      </div>
    </div>
  )
}
