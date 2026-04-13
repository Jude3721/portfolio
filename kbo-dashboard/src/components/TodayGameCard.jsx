import { useState } from 'react'
import { KBO_TEAMS } from '../data/mockGames'
import LineupModal from './LineupModal'
import { fetchGameLineup } from '../services/kboApi'

function StatusBadge({ status }) {
  if (status === 'live') {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-red-500">
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500" />
        </span>
        LIVE
      </span>
    )
  }
  if (status === 'final') {
    return (
      <span className="text-xs font-semibold" style={{ color: 'var(--text)' }}>
        종료
      </span>
    )
  }
  return (
    <span className="text-xs font-semibold" style={{ color: 'var(--text)' }}>
      예정
    </span>
  )
}

// 양팀 승률 + 홈 이점(5%)으로 경기 승리 확률 계산
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
        <span className="font-bold tabular-nums" style={{ color: awayColor }}>
          {awayPct}%
        </span>
        <span className="opacity-40 text-[10px]">승리 예상</span>
        <span className="font-bold tabular-nums" style={{ color: homeColor }}>
          {homePct}%
        </span>
      </div>

      {/* 확률 바 */}
      <div className="flex h-1.5 rounded-full overflow-hidden w-full">
        <div
          className="h-full transition-all duration-500"
          style={{ width: `${awayPct}%`, backgroundColor: awayColor, opacity: awayProb >= homeProb ? 1 : 0.45 }}
        />
        <div
          className="h-full transition-all duration-500"
          style={{ width: `${homePct}%`, backgroundColor: homeColor, opacity: homeProb > awayProb ? 1 : 0.45 }}
        />
      </div>

      {/* 예상 승팀 */}
      <div className="text-center text-[10px] opacity-50">
        {KBO_TEAMS[favored]?.short} 우세
      </div>
    </div>
  )
}

function TeamBlock({ teamKey, score, side, isWinner, status }) {
  const team = KBO_TEAMS[teamKey]
  const isScheduled = status === 'scheduled'

  return (
    <div className={`flex flex-col items-center gap-2 flex-1 ${side === 'away' ? 'items-end pr-4' : 'items-start pl-4'}`}>
      <div className="w-14 h-14 flex items-center justify-center">
        <img
          src={team.logo}
          alt={team.name}
          className="w-full h-full object-contain"
          onError={(e) => {
            e.target.style.display = 'none'
            e.target.nextSibling.style.display = 'flex'
          }}
        />
        <div
          className="w-14 h-14 rounded-full items-center justify-center text-sm font-bold shadow-md hidden"
          style={{ backgroundColor: team.color, color: team.textColor }}
        >
          {team.short}
        </div>
      </div>
      <span className="text-xs font-medium" style={{ color: 'var(--text)' }}>
        {team.name}
      </span>
      {!isScheduled && score !== null && (
        <span
          className="text-4xl font-black tracking-tight"
          style={{ color: isWinner ? 'var(--text-h)' : 'var(--text)', opacity: isWinner ? 1 : 0.4 }}
        >
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
    <div className="flex flex-col items-center gap-1.5 text-xs" style={{ color: 'var(--text)' }}>
      {status === 'live' && (
        <div className="flex items-center gap-3">
          <BasesDisplay bases={bases} />
          <div className="flex flex-col items-center">
            <span className="font-semibold text-sm" style={{ color: 'var(--text-h)' }}>
              {inning}회 {inningHalf}
            </span>
            <span className="opacity-60">{outs}사</span>
          </div>
        </div>
      )}
      {status === 'final' && (
        <span className="font-medium opacity-60">최종 결과</span>
      )}
      {status === 'scheduled' && (
        <span className="font-semibold text-base" style={{ color: 'var(--text-h)' }}>
          {time}
        </span>
      )}
      <span className="opacity-50">{stadium}</span>
    </div>
  )
}

export default function TodayGameCard({ game, standings = [] }) {
  const { status, awayTeam, homeTeam, awayScore, homeScore } = game
  const isFinal = status === 'final'
  const awayWins = isFinal && awayScore > homeScore
  const homeWins = isFinal && homeScore > awayScore

  const awayWR = standings.find((s) => s.team === awayTeam)?.winRate
  const homeWR = standings.find((s) => s.team === homeTeam)?.winRate

  const [showLineup, setShowLineup] = useState(false)
  const [lineup, setLineup] = useState(game.lineup)
  const [lineupLoading, setLineupLoading] = useState(false)

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
      className="rounded-2xl p-5 flex flex-col gap-4 transition-shadow duration-200 hover:shadow-lg cursor-pointer"
      style={{
        background: 'var(--bg)',
        border: '1px solid var(--border)',
        boxShadow: 'var(--shadow)',
      }}
      onClick={handleCardClick}
    >
      {/* 상태 배지 */}
      <div className="flex items-center justify-between">
        <StatusBadge status={status} />
      </div>

      {/* 팀 + 스코어 */}
      <div className="flex items-center justify-between">
        <TeamBlock
          teamKey={awayTeam}
          score={awayScore}
          side="away"
          isWinner={isFinal ? awayWins : true}
          status={status}
        />

        <div className="flex flex-col items-center px-2 shrink-0">
          {status === 'scheduled' ? (
            <span className="text-xl font-bold opacity-25" style={{ color: 'var(--text-h)' }}>
              VS
            </span>
          ) : (
            <span className="text-2xl font-light opacity-30" style={{ color: 'var(--text-h)' }}>
              :
            </span>
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

      {/* 승리 확률 예측 (예정/진행 중 경기에만 표시) */}
      {status !== 'final' && (
        <WinProbBar
          awayTeam={awayTeam}
          homeTeam={homeTeam}
          awayWR={awayWR}
          homeWR={homeWR}
        />
      )}

      {/* 게임 정보 */}
      <div
        className="border-t pt-3 flex items-center justify-center"
        style={{ borderColor: 'var(--border)' }}
      >
        <GameInfo game={game} />
      </div>

      {/* 라인업 힌트 */}
      <div className="text-center text-[10px] opacity-30" style={{ color: 'var(--text)' }}>
        클릭하여 선발 라인업 보기
      </div>
    </div>
    </>
  )
}
