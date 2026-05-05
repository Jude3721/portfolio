import { useState, useEffect } from 'react'
import { fetchBoxscore } from '../services/nbaApi'
import { NBA_TEAMS } from '../data/nbaTeams'

function PlayerRow({ p, color }) {
  const fg  = p.stats.fga  ? `${p.stats.fgm}/${p.stats.fga}`  : '-'
  const tp  = p.stats.tpa  ? `${p.stats.tpm}/${p.stats.tpa}`  : '-'
  const ft  = p.stats.fta  ? `${p.stats.ftm}/${p.stats.fta}`  : '-'
  const pm  = p.stats.plusMinus > 0 ? `+${p.stats.plusMinus}` : `${p.stats.plusMinus}`

  return (
    <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
      <td style={{ padding: '8px 6px', whiteSpace: 'nowrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {p.starter && <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: color, flexShrink: 0, display: 'inline-block' }} />}
          {!p.starter && <span style={{ width: '6px', flexShrink: 0, display: 'inline-block' }} />}
          <span style={{ fontSize: '13px', fontWeight: p.starter ? 700 : 400, color: p.starter ? '#fff' : 'rgba(255,255,255,0.55)' }}>
            {p.name}
          </span>
          <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.2)' }}>#{p.jerseyNum}</span>
        </div>
      </td>
      <td style={{ textAlign: 'center', padding: '8px 6px', fontSize: '12px', color: 'rgba(255,255,255,0.35)' }}>{p.stats.minutes}</td>
      <td style={{ textAlign: 'center', padding: '8px 6px', fontSize: '14px', fontWeight: 700, color: p.stats.points >= 20 ? color : '#fff' }}>{p.stats.points}</td>
      <td style={{ textAlign: 'center', padding: '8px 6px', fontSize: '12px', color: 'rgba(255,255,255,0.7)' }}>{fg}</td>
      <td style={{ textAlign: 'center', padding: '8px 6px', fontSize: '12px', color: 'rgba(255,255,255,0.7)' }}>{tp}</td>
      <td style={{ textAlign: 'center', padding: '8px 6px', fontSize: '12px', color: 'rgba(255,255,255,0.7)' }}>{ft}</td>
      <td style={{ textAlign: 'center', padding: '8px 6px', fontSize: '13px', color: 'rgba(255,255,255,0.7)' }}>{p.stats.rebounds}</td>
      <td style={{ textAlign: 'center', padding: '8px 6px', fontSize: '13px', color: 'rgba(255,255,255,0.7)' }}>{p.stats.assists}</td>
      <td style={{ textAlign: 'center', padding: '8px 6px', fontSize: '12px', color: 'rgba(255,255,255,0.5)' }}>{p.stats.steals}</td>
      <td style={{ textAlign: 'center', padding: '8px 6px', fontSize: '12px', color: 'rgba(255,255,255,0.5)' }}>{p.stats.blocks}</td>
      <td style={{ textAlign: 'center', padding: '8px 6px', fontSize: '12px', color: p.stats.plusMinus > 0 ? '#4ade80' : p.stats.plusMinus < 0 ? '#f87171' : 'rgba(255,255,255,0.35)' }}>
        {pm}
      </td>
    </tr>
  )
}

function TeamTable({ team }) {
  const color = NBA_TEAMS[team.tricode]?.color ?? '#888'
  const cols = ['선수', 'MIN', 'PTS', 'FG', '3P', 'FT', 'REB', 'AST', 'STL', 'BLK', '+/-']

  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '600px' }}>
        <thead>
          <tr>
            {cols.map(c => (
              <th key={c} style={{
                padding: '6px', fontSize: '11px', fontWeight: 600,
                color: 'rgba(255,255,255,0.28)', textAlign: c === '선수' ? 'left' : 'center',
                borderBottom: '1px solid rgba(255,255,255,0.08)',
              }}>{c}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {team.players.map(p => <PlayerRow key={p.personId} p={p} color={color} />)}
        </tbody>
      </table>
    </div>
  )
}

export default function BoxscoreModal({ gameId, game, onClose }) {
  const [data, setData]       = useState(null)
  const [loading, setLoading] = useState(true)
  const [tab, setTab]         = useState('away')

  useEffect(() => {
    fetchBoxscore(gameId)
      .then(setData)
      .catch(err => console.warn('boxscore 오류:', err.message))
      .finally(() => setLoading(false))
  }, [gameId])

  const awayColor = NBA_TEAMS[game.awayTeam.tricode]?.color ?? '#888'
  const homeColor = NBA_TEAMS[game.homeTeam.tricode]?.color ?? '#888'

  const activeTeam = tab === 'away' ? data?.awayTeam : data?.homeTeam
  const activeColor = tab === 'away' ? awayColor : homeColor

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
        width: '100%', maxWidth: '860px', maxHeight: '90vh',
        background: '#1a1a2e', borderRadius: '24px',
        boxShadow: '0 24px 60px rgba(0,0,0,0.7)',
        display: 'flex', flexDirection: 'column', overflow: 'hidden',
      }}>
        {/* 헤더 */}
        <div style={{
          padding: '20px 24px 16px',
          background: `linear-gradient(135deg, ${awayColor}22, ${homeColor}22)`,
          borderBottom: '1px solid rgba(255,255,255,0.07)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <span style={{ fontSize: '18px', fontWeight: 800, color: '#fff' }}>
              {game.awayTeam.tricode} {game.status !== 'scheduled' ? `${game.awayTeam.score} - ${game.homeTeam.score}` : 'vs'} {game.homeTeam.tricode}
            </span>
            {game.status === 'live' && (
              <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)' }}>
                {game.period > 4 ? `OT${game.period - 4}` : `Q${game.period}`} {game.gameClock}
              </span>
            )}
          </div>
          <button onClick={onClose} style={{
            background: 'rgba(255,255,255,0.08)', border: 'none', borderRadius: '50%',
            width: '32px', height: '32px', cursor: 'pointer', color: 'rgba(255,255,255,0.6)',
            fontSize: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>✕</button>
        </div>

        {/* 탭 */}
        <div style={{ display: 'flex', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
          {['away', 'home'].map(t => {
            const tri   = t === 'away' ? game.awayTeam.tricode : game.homeTeam.tricode
            const color = t === 'away' ? awayColor : homeColor
            const isActive = tab === t
            return (
              <button
                key={t}
                onClick={() => setTab(t)}
                style={{
                  flex: 1, padding: '12px', border: 'none', cursor: 'pointer',
                  background: 'transparent',
                  color: isActive ? '#fff' : 'rgba(255,255,255,0.35)',
                  fontWeight: isActive ? 700 : 400,
                  fontSize: '14px',
                  borderBottom: isActive ? `2px solid ${color}` : '2px solid transparent',
                  transition: 'all 0.15s',
                }}
              >
                {tri} {t === 'away' ? '(원정)' : '(홈)'}
              </button>
            )
          })}
        </div>

        {/* 내용 */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px' }}>
          {loading && (
            <div style={{ padding: '40px', textAlign: 'center', color: 'rgba(255,255,255,0.3)', fontSize: '14px' }}>
              로딩 중...
            </div>
          )}
          {!loading && activeTeam && <TeamTable team={activeTeam} color={activeColor} />}
          {!loading && !activeTeam && (
            <div style={{ padding: '40px', textAlign: 'center', color: 'rgba(255,255,255,0.3)', fontSize: '14px' }}>
              데이터를 불러올 수 없습니다
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
