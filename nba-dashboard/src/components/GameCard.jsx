import { useState } from 'react'
import { NBA_TEAMS } from '../data/nbaTeams'
import BoxscoreModal from './BoxscoreModal'

function StatusBadge({ status, statusText }) {
  if (status === 'live')  return <span className="live-badge"><span className="live-dot" />LIVE</span>
  if (status === 'final') return <span className="badge-final">FINAL</span>
  return <span className="badge-sched">{statusText}</span>
}

function TeamBlock({ tricode, score, isWinner, status }) {
  const team = NBA_TEAMS[tricode] ?? { name: tricode, short: tricode, color: '#888', logo: '' }
  const isScheduled = status === 'scheduled'

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', flex: 1 }}>
      <div style={{
        width: '52px', height: '52px', borderRadius: '50%',
        background: 'var(--card-bg)',
        boxShadow: status === 'live'
          ? `4px 4px 12px rgba(0,0,0,0.3), -3px -3px 8px rgba(255,255,255,0.05), 0 0 14px ${team.color}66`
          : '4px 4px 12px rgba(0,0,0,0.3), -3px -3px 8px rgba(255,255,255,0.05)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        transition: 'box-shadow 0.3s',
      }}>
        <img src={team.logo} alt={team.name}
          style={{ width: '78%', height: '78%', objectFit: 'contain' }}
          onError={e => { e.target.style.display = 'none' }}
        />
      </div>
      <span style={{ fontSize: '13px', fontWeight: 700, color: 'rgba(255,255,255,0.5)', letterSpacing: '0.5px' }}>
        {tricode}
      </span>
      {!isScheduled && (
        <span style={{
          fontSize: '44px', fontWeight: 900, letterSpacing: '-2px', lineHeight: 1,
          color: isWinner ? '#fff' : 'rgba(255,255,255,0.2)',
          transition: 'color 0.3s',
        }}>
          {score}
        </span>
      )}
    </div>
  )
}

export default function GameCard({ game }) {
  const [showBox, setShowBox] = useState(false)
  const { status, period, gameClock, timeKST, awayTeam, homeTeam } = game

  const awayWins = status === 'final' && awayTeam.score > homeTeam.score
  const homeWins = status === 'final' && homeTeam.score > awayTeam.score
  const awayColor = NBA_TEAMS[awayTeam.tricode]?.color ?? '#888'
  const homeColor = NBA_TEAMS[homeTeam.tricode]?.color ?? '#888'

  const periodLabel = period > 4 ? `OT${period - 4}` : period ? `Q${period}` : ''

  return (
    <>
      {showBox && <BoxscoreModal gameId={game.gameId} game={game} onClose={() => setShowBox(false)} />}
      <div
        onClick={() => setShowBox(true)}
        style={{
          position: 'relative', borderRadius: '20px', padding: '20px',
          cursor: 'pointer', overflow: 'hidden',
          display: 'flex', flexDirection: 'column', gap: '14px',
          background: 'var(--card-bg)',
          boxShadow: '6px 6px 16px rgba(0,0,0,0.4), -3px -3px 10px rgba(255,255,255,0.04)',
          transition: 'transform 0.2s, box-shadow 0.2s',
        }}
        onMouseEnter={e => {
          e.currentTarget.style.transform = 'translateY(-3px)'
          e.currentTarget.style.boxShadow = '10px 10px 24px rgba(0,0,0,0.5), -4px -4px 12px rgba(255,255,255,0.05)'
        }}
        onMouseLeave={e => {
          e.currentTarget.style.transform = 'translateY(0)'
          e.currentTarget.style.boxShadow = '6px 6px 16px rgba(0,0,0,0.4), -3px -3px 10px rgba(255,255,255,0.04)'
        }}
      >
        {/* 팀 컬러 상단 바 */}
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, height: '3px',
          background: `linear-gradient(to right, ${awayColor}, ${homeColor})`,
        }} />

        {/* 상태 배지 */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <StatusBadge status={status} statusText={game.statusText} />
          {status === 'live' && (
            <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)', fontVariantNumeric: 'tabular-nums' }}>
              {periodLabel} {gameClock}
            </span>
          )}
        </div>

        {/* 팀 스코어 */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <TeamBlock tricode={awayTeam.tricode} score={awayTeam.score} isWinner={awayWins} status={status} />
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', padding: '0 10px' }}>
            {status === 'scheduled'
              ? <span style={{ fontSize: '18px', fontWeight: 700, color: 'rgba(255,255,255,0.15)' }}>VS</span>
              : <span style={{ fontSize: '22px', fontWeight: 200, color: 'rgba(255,255,255,0.15)' }}>:</span>
            }
          </div>
          <TeamBlock tricode={homeTeam.tricode} score={homeTeam.score} isWinner={homeWins} status={status} />
        </div>

        {/* 하단 정보 */}
        <div style={{
          borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '10px',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px',
          fontSize: '12px', color: 'rgba(255,255,255,0.28)',
        }}>
          {status === 'scheduled' && <span style={{ fontWeight: 700, fontSize: '14px', color: 'rgba(255,255,255,0.6)' }}>{timeKST} KST</span>}
          {status === 'live'      && <span>{awayTeam.wins}-{awayTeam.losses} @ {homeTeam.wins}-{homeTeam.losses}</span>}
          {status === 'final'     && <span>클릭하여 박스스코어 보기</span>}
        </div>
      </div>
    </>
  )
}
