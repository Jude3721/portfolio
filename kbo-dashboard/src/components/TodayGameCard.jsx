import { useState } from 'react'
import { KBO_TEAMS } from '../data/mockGames'
import LineupModal from './LineupModal'
import { fetchGameLineup } from '../services/kboApi'

const N = {
  raised: '6px 6px 16px var(--neu-sd), -4px -4px 10px var(--neu-sl)',
  hover:  '8px 8px 20px var(--neu-sd), -5px -5px 13px var(--neu-sl)',
  inset:  'inset 3px 3px 8px var(--neu-sd), inset -2px -2px 6px var(--neu-sl)',
}

function StatusBadge({ status }) {
  if (status === 'live')  return <span className="live-badge"><span className="live-dot" />LIVE</span>
  if (status === 'final') return <span className="status-badge-done">종료</span>
  return <span className="status-badge-sched">예정</span>
}

function calcWinProb(awayWR, homeWR) {
  const aw = awayWR ?? 0.5, hw = homeWR ?? 0.5
  const awayProb = aw / (aw + hw * 1.05)
  return { awayProb, homeProb: 1 - awayProb }
}

function WinProbBar({ awayTeam, homeTeam, awayWR, homeWR }) {
  const awayColor = KBO_TEAMS[awayTeam]?.color ?? '#888'
  const homeColor = KBO_TEAMS[homeTeam]?.color ?? '#888'
  const { awayProb, homeProb } = calcWinProb(awayWR, homeWR)
  const awayPct = Math.round(awayProb * 100)
  const favored = awayProb > homeProb ? awayTeam : homeTeam

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
        <span style={{ fontWeight: 700, color: awayColor }}>{awayPct}%</span>
        <span style={{ color: 'rgba(var(--fg-rgb), 0.25)', fontSize: '11px' }}>승리 예상</span>
        <span style={{ fontWeight: 700, color: homeColor }}>{100 - awayPct}%</span>
      </div>
      <div style={{ height: '6px', borderRadius: '99px', boxShadow: N.inset, overflow: 'hidden', display: 'flex' }}>
        <div style={{ width: `${awayPct}%`, background: `linear-gradient(to right, ${awayColor}, ${awayColor}bb)`, borderRadius: '99px 0 0 99px', transition: 'width 1s cubic-bezier(.4,0,.2,1)' }} />
        <div style={{ width: `${100-awayPct}%`, background: `linear-gradient(to left, ${homeColor}, ${homeColor}bb)`, borderRadius: '0 99px 99px 0', marginLeft: 'auto', transition: 'width 1s cubic-bezier(.4,0,.2,1)' }} />
      </div>
      <div style={{ textAlign: 'center', fontSize: '11px', color: 'rgba(var(--fg-rgb), 0.25)' }}>
        {KBO_TEAMS[favored]?.short} 우세
      </div>
    </div>
  )
}

function TeamBlock({ teamKey, score, side, isWinner, status }) {
  const team = KBO_TEAMS[teamKey]
  const isLive = status === 'live'
  const isScheduled = status === 'scheduled'

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', flex: 1 }}>
      <div style={{
        width: '54px', height: '54px', borderRadius: '50%',
        background: 'var(--neu-bg)',
        boxShadow: isLive ? `4px 4px 12px var(--neu-sd), -3px -3px 8px var(--neu-sl), 0 0 14px ${team.color}55` : N.raised,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        transition: 'box-shadow 0.3s',
      }}>
        <img src={team.logo} alt={team.name} style={{ width: '100%', height: '100%', borderRadius: '50%' }}
          onError={e => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex' }} />
        <div style={{ display: 'none', width: '100%', height: '100%', borderRadius: '50%', alignItems: 'center', justifyContent: 'center', background: team.color, color: '#fff', fontSize: '13px', fontWeight: 700 }}>
          {team.short}
        </div>
      </div>
      <span style={{ fontSize: '13px', fontWeight: 500, color: 'rgba(var(--fg-rgb), 0.5)' }}>{team.name}</span>
      {!isScheduled && score !== null && (
        <span style={{
          fontSize: '48px', fontWeight: 900, letterSpacing: '-2px', lineHeight: 1,
          color: isWinner ? 'rgb(var(--fg-rgb))' : 'rgba(var(--fg-rgb), 0.22)',
          transition: 'color 0.3s',
        }}>{score}</span>
      )}
    </div>
  )
}

function BasesDisplay({ bases }) {
  if (!bases) return null
  const [first, second, third] = bases
  return (
    <div className="relative w-8 h-8 shrink-0">
      <div className={`absolute w-2.5 h-2.5 rotate-45 top-0 left-1/2 -translate-x-1/2 rounded-sm border ${second ? 'bg-yellow-400 border-yellow-500' : 'border-gray-600 opacity-30'}`} />
      <div className={`absolute w-2.5 h-2.5 rotate-45 top-1/2 left-0 -translate-y-1/2 rounded-sm border ${third  ? 'bg-yellow-400 border-yellow-500' : 'border-gray-600 opacity-30'}`} />
      <div className={`absolute w-2.5 h-2.5 rotate-45 top-1/2 right-0 -translate-y-1/2 rounded-sm border ${first  ? 'bg-yellow-400 border-yellow-500' : 'border-gray-600 opacity-30'}`} />
    </div>
  )
}

function GameInfo({ game }) {
  const { status, time, stadium, inning, inningHalf, outs, bases } = game
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', color: 'rgba(var(--fg-rgb), 0.4)', fontSize: '13px' }}>
      {status === 'live' && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <BasesDisplay bases={bases} />
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <span style={{ fontWeight: 700, fontSize: '15px', color: 'rgba(var(--fg-rgb), 0.8)' }}>{inning}회 {inningHalf}</span>
            <span style={{ opacity: 0.5 }}>{outs}사</span>
          </div>
        </div>
      )}
      {status === 'final'     && <span style={{ opacity: 0.5, fontWeight: 500 }}>최종 결과</span>}
      {status === 'scheduled' && <span style={{ fontWeight: 700, fontSize: '16px', color: 'rgba(var(--fg-rgb), 0.75)' }}>{time}</span>}
      <span style={{ opacity: 0.4 }}>{stadium}</span>
    </div>
  )
}

export default function TodayGameCard({ game, standings = [] }) {
  const { status, awayTeam, homeTeam, awayScore, homeScore } = game
  const isFinal  = status === 'final'
  const awayWins = isFinal && awayScore > homeScore
  const homeWins = isFinal && homeScore > awayScore

  const awayWR = standings.find(s => s.team === awayTeam)?.winRate
  const homeWR = standings.find(s => s.team === homeTeam)?.winRate
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
      try { setLineup(await fetchGameLineup(game.id)) }
      catch (err) { console.warn('lineup fetch 실패:', err.message) }
      finally { setLineupLoading(false) }
    }
  }

  return (
    <>
      {showLineup && (
        <LineupModal game={{ ...game, lineup }} loading={lineupLoading} onClose={() => setShowLineup(false)} />
      )}
      <div
        onClick={handleCardClick}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          position: 'relative', borderRadius: '24px', padding: '22px',
          cursor: 'pointer', overflow: 'hidden',
          display: 'flex', flexDirection: 'column', gap: '16px',
          background: 'var(--neu-bg)',
          boxShadow: hovered ? N.hover : N.raised,
          transform: hovered ? 'translateY(-3px)' : 'translateY(0)',
          transition: 'transform 0.25s ease, box-shadow 0.25s ease',
        }}
      >
        {/* 팀 컬러 상단 라인 */}
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, height: '3px',
          background: `linear-gradient(to right, ${awayColor}, ${homeColor})`,
          borderRadius: '24px 24px 0 0',
        }} />

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <StatusBadge status={status} />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <TeamBlock teamKey={awayTeam} score={awayScore} side="away" isWinner={isFinal ? awayWins : true} status={status} />
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '0 8px' }}>
            {status === 'scheduled'
              ? <span style={{ fontSize: '20px', fontWeight: 700, color: 'rgba(var(--fg-rgb), 0.18)' }}>VS</span>
              : <span style={{ fontSize: '26px', fontWeight: 200, color: 'rgba(var(--fg-rgb), 0.2)' }}>:</span>
            }
          </div>
          <TeamBlock teamKey={homeTeam} score={homeScore} side="home" isWinner={isFinal ? homeWins : true} status={status} />
        </div>

        {status !== 'final' && <WinProbBar awayTeam={awayTeam} homeTeam={homeTeam} awayWR={awayWR} homeWR={homeWR} />}

        <div style={{
          borderTop: '1px solid rgba(var(--fg-rgb), 0.06)', paddingTop: '12px',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <GameInfo game={game} />
        </div>

        <div style={{ textAlign: 'center', fontSize: '11px', color: 'rgba(var(--fg-rgb), 0.18)' }}>
          클릭하여 선발 라인업 보기
        </div>
      </div>
    </>
  )
}
