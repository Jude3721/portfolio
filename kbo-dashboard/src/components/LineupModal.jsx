import { useEffect } from 'react'
import { KBO_TEAMS } from '../data/mockGames'

function PitcherRow({ pitcher, teamColor }) {
  return (
    <div
      className="flex items-center gap-3 px-3 py-2 rounded-lg mb-3"
      style={{ backgroundColor: teamColor + '18' }}
    >
      <span
        className="text-[10px] font-bold px-1.5 py-0.5 rounded"
        style={{ backgroundColor: teamColor, color: '#fff' }}
      >
        선발
      </span>
      <span className="text-sm font-bold" style={{ color: 'var(--text-h)' }}>
        {pitcher.name}
      </span>
      <span className="text-xs opacity-50">{pitcher.hand}</span>
    </div>
  )
}

function BatterList({ batters }) {
  return (
    <div className="flex flex-col gap-0.5">
      {batters.map((b) => (
        <div
          key={b.order}
          className="flex items-center gap-2.5 px-2 py-1.5 rounded-md hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
        >
          <span
            className="w-4 text-right text-xs font-bold tabular-nums opacity-40"
            style={{ color: 'var(--text-h)' }}
          >
            {b.order}
          </span>
          <span
            className="w-8 text-center text-[10px] font-semibold px-1 py-0.5 rounded"
            style={{ background: 'var(--border)', color: 'var(--text)' }}
          >
            {b.pos}
          </span>
          <span className="text-sm" style={{ color: 'var(--text-h)' }}>
            {b.name}
          </span>
        </div>
      ))}
    </div>
  )
}

function TeamColumn({ teamKey, side, lineup }) {
  const team = KBO_TEAMS[teamKey]
  const data = lineup[side]

  return (
    <div className="flex-1 min-w-0">
      {/* 팀 헤더 */}
      <div className="flex items-center gap-2 mb-3">
        <img
          src={team.logo}
          alt={team.name}
          className="w-7 h-7 object-contain"
          onError={(e) => { e.target.style.display = 'none' }}
        />
        <div>
          <div className="text-xs font-bold" style={{ color: 'var(--text-h)' }}>
            {team.name}
          </div>
          <div className="text-[10px] opacity-40" style={{ color: 'var(--text)' }}>
            {side === 'away' ? '원정' : '홈'}
          </div>
        </div>
      </div>

      <PitcherRow pitcher={data.pitcher} teamColor={team.color} />
      <BatterList batters={data.batters} />
    </div>
  )
}

export default function LineupModal({ game, onClose }) {
  const awayTeam = KBO_TEAMS[game.awayTeam]
  const homeTeam = KBO_TEAMS[game.homeTeam]

  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose])

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg rounded-2xl p-5 flex flex-col gap-4 max-h-[90vh] overflow-y-auto"
        style={{
          background: 'var(--bg)',
          border: '1px solid var(--border)',
          boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* 헤더 */}
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold" style={{ color: 'var(--text-h)' }}>
              선발 라인업
            </h3>
            <p className="text-xs opacity-50" style={{ color: 'var(--text)' }}>
              {game.stadium} · {game.time}
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center rounded-full text-sm opacity-40 hover:opacity-80 transition-opacity"
            style={{ background: 'var(--border)', color: 'var(--text-h)' }}
          >
            ✕
          </button>
        </div>

        {/* 팀 vs */}
        <div className="flex items-center justify-center gap-3 py-1">
          <span className="text-sm font-bold" style={{ color: awayTeam.color }}>
            {awayTeam.short}
          </span>
          <span className="text-xs opacity-30" style={{ color: 'var(--text-h)' }}>VS</span>
          <span className="text-sm font-bold" style={{ color: homeTeam.color }}>
            {homeTeam.short}
          </span>
        </div>

        {/* 구분선 */}
        <div style={{ borderTop: '1px solid var(--border)' }} />

        {/* 라인업 양쪽 */}
        <div className="flex gap-4">
          <TeamColumn teamKey={game.awayTeam} side="away" lineup={game.lineup} />
          <div style={{ width: '1px', background: 'var(--border)' }} />
          <TeamColumn teamKey={game.homeTeam} side="home" lineup={game.lineup} />
        </div>
      </div>
    </div>
  )
}
