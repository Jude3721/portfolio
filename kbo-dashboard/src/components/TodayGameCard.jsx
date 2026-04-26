import { useState } from 'react'
import { KBO_TEAMS } from '../data/mockGames'
import LineupModal from './LineupModal'
import { fetchGameLineup } from '../services/kboApi'

function StatusBadge({ status }) {
  if (status === 'live') {
    return (
      <span className="live-badge">
        <span className="live-dot" />
        LIVE
      </span>
    )
  }
  if (status === 'final') {
    return (
      <span className="status-badge-done">종료</span>
    )
  }
  return (
    <span className="status-badge-sched">예정</span>
  )
}

function calcWinProb(awayWR, homeWR) {
  const aw = awayWR ?? 0.5
  const hw = homeWR ?? 0.5
  const HOME_ADV = 1.05
  const awayProb = aw / (aw + hw * HOME_ADV)
  return { awayProb, homeProb: 1 - awayProb }
}

function WinProbBar({ awayTeam, homeTeam, awayWR, homeWR }) {
  const awayColor = KBO_TEAMS[awayTeam]?.color ?? '#888'
  const homeColor = KBO_TEAMS[homeTeam]?.color ?? '#888'
  const { awayProb, homeProb } = calcWinProb(awayWR, homeWR)
  const awayPct = Math.round(awayProb * 100)
  const homePct = 100 - awayPct
  const favored = awayProb > homeProb ? awayTeam : homeTeam

  return (
    <div className="w-full flex flex-col gap-1.5">
      <div className="flex justify-between items-center text-xs">
        <span className="font-bold tabular-nums" style={{ color: awayColor, textShadow: `0 0 8px ${awayColor}88` }}>
          {awayPct}%
        </span>
        <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: '10px' }}>승리 예상</span>
        <span className="font-bold tabular-nums" style={{ color: homeColor, textShadow: `0 0 8px ${homeColor}88` }}>
          {homePct}%
        </span>
      </div>

      {/* 그라디언트 승률 바 */}
      <div style={{
        height: '7px',
        borderRadius: '99px',
        overflow: 'hidden',
        background: 'rgba(255,255,255,0.06)',
        display: 'flex',
      }}>
        <div style={{
          width: `${awayPct}%`,
          height: '100%',
          background: `linear-gradient(to right, ${awayColor}, ${awayColor}bb)`,
          boxShadow: awayProb >= homeProb ? `0 0 10px ${awayColor}99` : 'none',
          borderRadius: '99px 0 0 99px',
          transition: 'width 1s cubic-bezier(0.4,0,0.2,1)',
        }} />
        <div style={{
          width: `${homePct}%`,
          height: '100%',
          background: `linear-gradient(to left, ${homeColor}, ${homeColor}bb)`,
          boxShadow: homeProb > awayProb ? `0 0 10px ${homeColor}99` : 'none',
          borderRadius: '0 99px 99px 0',
          marginLeft: 'auto',
          transition: 'width 1s cubic-bezier(0.4,0,0.2,1)',
        }} />
      </div>

      <div style={{ textAlign: 'center', fontSize: '10px', color: 'rgba(255,255,255,0.3)' }}>
        {KBO_TEAMS[favored]?.short} 우세
      </div>
    </div>
  )
}

function TeamBlock({ teamKey, score, side, isWinner, status }) {
  const team = KBO_TEAMS[teamKey]
  const isScheduled = status === 'scheduled'
  const isLive = status === 'live'

  return (
    <div className={`flex flex-col items-center gap-2 flex-1 ${side === 'away' ? 'items-end pr-4' : 'items-start pl-4'}`}>
      {/* 팀 로고 */}
      <div style={{
        width: '52px', height: '52px',
        borderRadius: '50%',
        background: `${team.color}22`,
        border: `1px solid ${team.color}44`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        boxShadow: isLive ? `0 0 12px ${team.color}55` : 'none',
        transition: 'box-shadow 0.3s',
      }}>
        <img
          src={team.logo}
          alt={team.name}
          style={{ width: '70%', height: '70%' }}
          onError={(e) => {
            e.target.style.display = 'none'
            e.target.nextSibling.style.display = 'flex'
          }}
        />
        <div
          style={{
            width: '100%', height: '100%', borderRadius: '50%',
            display: 'none', alignItems: 'center', justifyContent: 'center',
            backgroundColor: team.color, color: team.textColor,
            fontSize: '13px', fontWeight: 700,
          }}
        >
          {team.short}
        </div>
      </div>

      <span style={{ fontSize: '12px', fontWeight: 500, color: 'rgba(255,255,255,0.55)' }}>
        {team.name}
      </span>

      {!isScheduled && score !== null && (
        <span style={{
          fontSize: '42px',
          fontWeight: 900,
          letterSpacing: '-2px',
          lineHeight: 1,
          color: isWinner ? '#ffffff' : 'rgba(255,255,255,0.28)',
          textShadow: isWinner && isLive ? `0 0 20px rgba(255,255,255,0.4)` : 'none',
          transition: 'color 0.3s',
        }}>
          {score}
        </span>
      )}
    </div>
  )
}

function BasesDisplay({ bases }) {
  if (!bases) return null
  const [first, second, third] = bases
  return (
    <div className="relative w-8 h-8 shrink-0">
      <div className={`absolute w-2.5 h-2.5 rotate-45 top-0 left-1/2 -translate-x-1/2 rounded-sm border ${second ? 'bg-yellow-400 border-yellow-500' : 'border-gray-400 opacity-30'}`} />
      <div className={`absolute w-2.5 h-2.5 rotate-45 top-1/2 left-0 -translate-y-1/2 rounded-sm border ${third ? 'bg-yellow-400 border-yellow-500' : 'border-gray-400 opacity-30'}`} />
      <div className={`absolute w-2.5 h-2.5 rotate-45 top-1/2 right-0 -translate-y-1/2 rounded-sm border ${first ? 'bg-yellow-400 border-yellow-500' : 'border-gray-400 opacity-30'}`} />
    </div>
  )
}

function GameInfo({ game }) {
  const { status, time, stadium, inning, inningHalf, outs, bases } = game
  return (
    <div className="flex flex-col items-center gap-1.5 text-xs" style={{ color: 'rgba(255,255,255,0.45)' }}>
      {status === 'live' && (
        <div className="flex items-center gap-3">
          <BasesDisplay bases={bases} />
          <div className="flex flex-col items-center">
            <span style={{ fontWeight: 600, fontSize: '14px', color: 'rgba(255,255,255,0.85)' }}>
              {inning}회 {inningHalf}
            </span>
            <span style={{ opacity: 0.5 }}>{outs}사</span>
          </div>
        </div>
      )}
      {status === 'final' && (
        <span style={{ opacity: 0.5, fontWeight: 500 }}>최종 결과</span>
      )}
      {status === 'scheduled' && (
        <span style={{ fontWeight: 600, fontSize: '15px', color: 'rgba(255,255,255,0.8)' }}>
          {time}
        </span>
      )}
      <span style={{ opacity: 0.4 }}>{stadium}</span>
    </div>
  )
}

export default function TodayGameCard({ game, standings = [] }) {
  const { status, awayTeam, homeTeam, awayScore, homeScore } = game
  const isFinal  = status === 'final'
  const awayWins = isFinal && awayScore > homeScore
  const homeWins = isFinal && homeScore > awayScore

  const awayWR = standings.find((s) => s.team === awayTeam)?.winRate
  const homeWR = standings.find((s) => s.team === homeTeam)?.winRate

  const awayColor = KBO_TEAMS[awayTeam]?.color ?? '#888'
  const homeColor = KBO_TEAMS[homeTeam]?.color ?? '#888'

  const [showLineup, setShowLineup]       = useState(false)
  const [lineup, setLineup]               = useState(game.lineup)
  const [lineupLoading, setLineupLoading] = useState(false)
  const [hovered, setHovered]             = useState(false)

  const handleCardClick = async () => {
    setShowLineup(true)
    if (!lineup && !lineupLoading) {
      setLineupLoading(true)
      try {
        const result = await fetchGameLineup(game.id)
        setLineup(result)
      } catch (err) {
        console.warn('lineup fetch 실패:', err.message)
      } finally {
        setLineupLoading(false)
      }
    }
  }

  return (
    <>
      {showLineup && (
        <LineupModal
          game={{ ...game, lineup }}
          loading={lineupLoading}
          onClose={() => setShowLineup(false)}
        />
      )}

      <div
        onClick={handleCardClick}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          position: 'relative',
          borderRadius: '20px',
          padding: '20px',
          cursor: 'pointer',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
          /* Glassmorphism */
          background: `linear-gradient(135deg, ${awayColor}1a 0%, ${homeColor}1a 100%)`,
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          border: `1px solid rgba(255,255,255,${hovered ? '0.16' : '0.09'})`,
          boxShadow: hovered
            ? `0 20px 60px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.12)`
            : `0 8px 32px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.08)`,
          transform: hovered ? 'translateY(-4px)' : 'translateY(0)',
          transition: 'transform 0.25s ease, box-shadow 0.25s ease, border-color 0.25s ease',
        }}
      >
        {/* 팀 컬러 글로우 (배경 장식) */}
        <div style={{
          position: 'absolute', inset: 0, pointerEvents: 'none',
          background: `radial-gradient(ellipse 60% 50% at 20% 80%, ${awayColor}14, transparent),
                       radial-gradient(ellipse 60% 50% at 80% 20%, ${homeColor}14, transparent)`,
          borderRadius: 'inherit',
        }} />

        {/* 상태 배지 */}
        <div className="flex items-center justify-between" style={{ position: 'relative' }}>
          <StatusBadge status={status} />
        </div>

        {/* 팀 + 스코어 */}
        <div className="flex items-center justify-between" style={{ position: 'relative' }}>
          <TeamBlock
            teamKey={awayTeam}
            score={awayScore}
            side="away"
            isWinner={isFinal ? awayWins : true}
            status={status}
          />
          <div className="flex flex-col items-center px-2 shrink-0">
            {status === 'scheduled' ? (
              <span style={{ fontSize: '20px', fontWeight: 700, color: 'rgba(255,255,255,0.2)' }}>VS</span>
            ) : (
              <span style={{ fontSize: '26px', fontWeight: 200, color: 'rgba(255,255,255,0.25)' }}>:</span>
            )}
          </div>
          <TeamBlock
            teamKey={homeTeam}
            score={homeScore}
            side="home"
            isWinner={isFinal ? homeWins : true}
            status={status}
          />
        </div>

        {/* 승률 예측 바 */}
        {status !== 'final' && (
          <div style={{ position: 'relative' }}>
            <WinProbBar
              awayTeam={awayTeam}
              homeTeam={homeTeam}
              awayWR={awayWR}
              homeWR={homeWR}
            />
          </div>
        )}

        {/* 게임 정보 */}
        <div style={{
          position: 'relative',
          borderTop: '1px solid rgba(255,255,255,0.07)',
          paddingTop: '14px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <GameInfo game={game} />
        </div>

        {/* 라인업 힌트 */}
        <div style={{ textAlign: 'center', fontSize: '10px', color: 'rgba(255,255,255,0.2)', position: 'relative' }}>
          클릭하여 선발 라인업 보기
        </div>
      </div>
    </>
  )
}
