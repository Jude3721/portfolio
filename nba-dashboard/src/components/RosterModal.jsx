import { useEffect, useState } from 'react'
import { fetchRoster } from '../services/nbaApi'
import { NBA_TEAMS } from '../data/nbaTeams'

const POS_COLOR = {
  'G':   '#60a5fa', 'G-F': '#818cf8',
  'F':   '#34d399', 'F-G': '#6ee7b7', 'F-C': '#a7f3d0',
  'C':   '#fb923c',
}

function PlayerCard({ p, teamColor }) {
  const posColor = POS_COLOR[p.position] ?? '#94a3b8'
  const expLabel = p.exp === 'R' ? 'R' : p.exp === '0' ? 'R' : `${p.exp}Y`
  const photoUrl = `https://cdn.nba.com/headshots/nba/latest/1040x760/${p.playerId}.png`

  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: '12px',
      padding: '10px 14px',
      borderRadius: '12px',
      background: 'rgba(255,255,255,0.04)',
      border: '1px solid rgba(255,255,255,0.06)',
      transition: 'background 0.15s',
    }}
      onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.07)'}
      onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.04)'}
    >
      {/* 선수 사진 */}
      <div style={{
        width: '44px', height: '44px', borderRadius: '50%', flexShrink: 0, overflow: 'hidden',
        background: `${teamColor}22`,
        border: `1.5px solid ${teamColor}44`,
      }}>
        <img
          src={photoUrl}
          alt={p.name}
          style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top' }}
          onError={e => {
            e.target.style.display = 'none'
            e.target.nextSibling.style.display = 'flex'
          }}
        />
        <div style={{
          display: 'none', width: '100%', height: '100%',
          alignItems: 'center', justifyContent: 'center',
          fontSize: '14px', fontWeight: 800, color: teamColor,
        }}>
          {p.name.split(' ').map(w => w[0]).join('').slice(0, 2)}
        </div>
      </div>

      {/* 번호 */}
      <div style={{
        width: '28px', textAlign: 'right', flexShrink: 0,
        fontSize: '13px', fontWeight: 700, color: 'rgba(255,255,255,0.3)',
      }}>
        #{p.num}
      </div>

      {/* 이름 */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: '13px', fontWeight: 700, color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {p.name}
        </div>
        <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.3)', marginTop: '2px' }}>
          {p.height} · {p.weight}lbs
        </div>
      </div>

      {/* 포지션 */}
      <div style={{
        padding: '3px 8px', borderRadius: '6px', flexShrink: 0,
        fontSize: '11px', fontWeight: 800, letterSpacing: '0.3px',
        background: `${posColor}18`, color: posColor,
        border: `1px solid ${posColor}33`,
      }}>
        {p.position}
      </div>

      {/* 나이 */}
      <div style={{ width: '30px', textAlign: 'center', flexShrink: 0 }}>
        <div style={{ fontSize: '13px', fontWeight: 600, color: 'rgba(255,255,255,0.65)' }}>{p.age}</div>
        <div style={{ fontSize: '9px', color: 'rgba(255,255,255,0.25)' }}>AGE</div>
      </div>

      {/* 경력 */}
      <div style={{ width: '28px', textAlign: 'center', flexShrink: 0 }}>
        <div style={{ fontSize: '12px', fontWeight: 600,
          color: expLabel === 'R' ? '#fbbf24' : 'rgba(255,255,255,0.5)' }}>
          {expLabel}
        </div>
        <div style={{ fontSize: '9px', color: 'rgba(255,255,255,0.25)' }}>EXP</div>
      </div>
    </div>
  )
}

export default function RosterModal({ team, teamId, onClose }) {
  const [players, setPlayers] = useState([])
  const [loading, setLoading] = useState(true)
  const t = NBA_TEAMS[team] ?? { name: team, color: '#888', logo: '' }

  useEffect(() => {
    fetchRoster(teamId)
      .then(setPlayers)
      .catch(err => console.warn('roster 오류:', err.message))
      .finally(() => setLoading(false))
  }, [teamId])

  const groups = [
    { label: 'Guards',   pos: ['G', 'G-F'] },
    { label: 'Forwards', pos: ['F', 'F-G', 'F-C'] },
    { label: 'Centers',  pos: ['C'] },
  ]

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 1000,
        background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(6px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '20px',
      }}
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div style={{
        width: '100%', maxWidth: '680px', maxHeight: '88vh',
        background: '#12121f', borderRadius: '24px',
        boxShadow: `0 24px 60px rgba(0,0,0,0.7), 0 0 0 1px ${t.color}22`,
        display: 'flex', flexDirection: 'column', overflow: 'hidden',
      }}>
        {/* 헤더 */}
        <div style={{
          padding: '20px 24px 16px',
          background: `linear-gradient(135deg, ${t.color}18, transparent)`,
          borderBottom: '1px solid rgba(255,255,255,0.07)',
          display: 'flex', alignItems: 'center', gap: '14px',
        }}>
          <div style={{
            width: '48px', height: '48px', borderRadius: '50%', flexShrink: 0,
            background: `${t.color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: `0 0 16px ${t.color}44`,
          }}>
            <img src={t.logo} alt={team}
              style={{ width: '78%', height: '78%', objectFit: 'contain' }}
              onError={e => e.target.style.display = 'none'}
            />
          </div>
          <div>
            <div style={{ fontSize: '18px', fontWeight: 800, color: '#fff' }}>{t.name}</div>
            <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.35)', marginTop: '2px' }}>
              {loading ? '로딩 중...' : `${players.length}명 로스터 · 2025-26`}
            </div>
          </div>
          <button onClick={onClose} style={{
            marginLeft: 'auto', background: 'rgba(255,255,255,0.08)', border: 'none',
            borderRadius: '50%', width: '32px', height: '32px', cursor: 'pointer',
            color: 'rgba(255,255,255,0.6)', fontSize: '16px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>✕</button>
        </div>

        {/* 바디 */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px' }}>
          {loading
            ? <div style={{ padding: '40px', textAlign: 'center', color: 'rgba(255,255,255,0.25)', fontSize: '14px' }}>로딩 중...</div>
            : groups.map(g => {
                const gPlayers = players.filter(p => g.pos.includes(p.position))
                if (gPlayers.length === 0) return null
                return (
                  <div key={g.label} style={{ marginBottom: '20px' }}>
                    <div style={{
                      fontSize: '11px', fontWeight: 800, letterSpacing: '1px',
                      color: 'rgba(255,255,255,0.3)', marginBottom: '8px',
                    }}>
                      {g.label.toUpperCase()}
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      {gPlayers.map(p => (
                        <PlayerCard key={p.playerId} p={p} teamColor={t.color} />
                      ))}
                    </div>
                  </div>
                )
              })
          }
        </div>
      </div>
    </div>
  )
}
