import { useState } from 'react'
import { NBA_TEAMS, EAST_TEAMS, WEST_TEAMS } from '../data/nbaTeams'
import RosterModal from './RosterModal'

function TeamRow({ s, rank, color, onTeamClick }) {
  const team = NBA_TEAMS[s.tricode] ?? { name: s.name, short: s.name, color: '#888', logo: '' }
  const streak = s.streak ?? ''
  const streakColor = streak.startsWith('W') ? '#4ade80' : '#f87171'

  return (
    <tr
      style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', transition: 'background 0.15s', cursor: 'pointer' }}
      onClick={() => onTeamClick(s)}
      onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
    >
      <td style={{ padding: '10px 8px', width: '32px', textAlign: 'center', fontSize: '13px', color: 'rgba(255,255,255,0.35)' }}>
        {rank <= 6
          ? <span style={{ color, fontWeight: 700 }}>{rank}</span>
          : <span>{rank}</span>
        }
      </td>
      <td style={{ padding: '10px 8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ width: '28px', height: '28px', flexShrink: 0 }}>
            <img src={team.logo} alt={s.tricode}
              style={{ width: '100%', height: '100%', objectFit: 'contain' }}
              onError={e => e.target.style.display = 'none'}
            />
          </div>
          <div>
            <div style={{ fontSize: '14px', fontWeight: rank <= 8 ? 700 : 500, color: '#fff' }}>{s.city}</div>
            <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.35)' }}>{s.name}</div>
          </div>
        </div>
      </td>
      <td style={{ textAlign: 'center', padding: '10px 8px', fontSize: '14px', fontWeight: 700, color: '#fff' }}>{s.wins}</td>
      <td style={{ textAlign: 'center', padding: '10px 8px', fontSize: '14px', color: 'rgba(255,255,255,0.6)' }}>{s.losses}</td>
      <td style={{ textAlign: 'center', padding: '10px 8px', fontSize: '13px', fontWeight: 600, color }}>
        {(s.winPct * 100).toFixed(1)}%
      </td>
      <td style={{ textAlign: 'center', padding: '10px 8px', fontSize: '13px', color: 'rgba(255,255,255,0.35)' }}>{s.gb}</td>
      <td style={{ textAlign: 'center', padding: '10px 8px', fontSize: '12px', color: 'rgba(255,255,255,0.45)' }}>{s.last10}</td>
      <td style={{ textAlign: 'center', padding: '10px 8px', fontSize: '12px', fontWeight: 700, color: streakColor }}>{streak}</td>
      <td style={{ padding: '10px 8px', textAlign: 'center' }}>
        <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.2)' }}>로스터 →</span>
      </td>
    </tr>
  )
}

export default function StandingsTable({ standings = [] }) {
  const [conf, setConf]         = useState('east')
  const [selected, setSelected] = useState(null)

  const confColor = conf === 'east' ? '#4FC3F7' : '#FF8A65'
  const teams     = conf === 'east' ? EAST_TEAMS : WEST_TEAMS

  const filtered = teams
    .map(tri => standings.find(s => s.tricode === tri))
    .filter(Boolean)
    .sort((a, b) => b.winPct - a.winPct)

  const cols = ['#', '팀', 'W', 'L', 'PCT', 'GB', 'L10', 'STRK', '']

  return (
    <section style={{ padding: '0 24px 40px' }}>
      {selected && (
        <RosterModal
          team={selected.tricode}
          teamId={selected.teamId}
          onClose={() => setSelected(null)}
        />
      )}

      {/* 헤더 */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
        <div>
          <h2 style={{ fontSize: '17px', fontWeight: 800, color: '#fff', letterSpacing: '-0.3px' }}>
            컨퍼런스 순위
          </h2>
          <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.25)', marginTop: '3px' }}>
            팀 클릭 시 로스터 확인
          </p>
        </div>
        <div style={{ display: 'flex', gap: '6px' }}>
          {['east', 'west'].map(c => (
            <button
              key={c}
              onClick={() => setConf(c)}
              style={{
                padding: '6px 16px', borderRadius: '10px', border: 'none', cursor: 'pointer',
                fontSize: '12px', fontWeight: 700,
                background: conf === c ? (c === 'east' ? '#4FC3F7' : '#FF8A65') : 'rgba(255,255,255,0.07)',
                color: conf === c ? '#000' : 'rgba(255,255,255,0.45)',
                transition: 'all 0.15s',
              }}
            >
              {c === 'east' ? 'EAST' : 'WEST'}
            </button>
          ))}
        </div>
      </div>

      <div style={{
        borderRadius: '16px',
        background: 'rgba(255,255,255,0.03)',
        border: '1px solid rgba(255,255,255,0.07)',
        overflow: 'hidden',
      }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
              {cols.map((c, i) => (
                <th key={i} style={{
                  padding: '10px 8px', fontSize: '11px', fontWeight: 600,
                  color: 'rgba(255,255,255,0.3)', textAlign: c === '팀' ? 'left' : 'center',
                }}>{c}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((s, i) => (
              <TeamRow key={s.tricode} s={s} rank={i + 1} color={confColor} onTeamClick={setSelected} />
            ))}
          </tbody>
        </table>
      </div>
      <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.2)', marginTop: '8px', textAlign: 'right' }}>
        6위까지 플레이오프 직행
      </p>
    </section>
  )
}
