import { KBO_TEAMS } from '../data/mockGames'

function StreakBadge({ streak }) {
  const isWin = streak.includes('연승')
  const isLose = streak.includes('연패')

  let color = 'var(--text)'
  let bg = 'var(--code-bg)'
  if (isWin) { color = '#16a34a'; bg = 'rgba(22,163,74,0.1)' }
  if (isLose) { color = '#dc2626'; bg = 'rgba(220,38,38,0.1)' }

  return (
    <span
      className="inline-block px-2 py-0.5 rounded text-xs font-semibold"
      style={{ color, backgroundColor: bg }}
    >
      {streak}
    </span>
  )
}

function WinRateBar({ winRate }) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-sm tabular-nums w-12 text-right" style={{ color: 'var(--text-h)' }}>
        {winRate.toFixed(3)}
      </span>
      <div className="w-16 h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--border)' }}>
        <div
          className="h-full rounded-full"
          style={{ width: `${winRate * 100}%`, backgroundColor: 'var(--accent)' }}
        />
      </div>
    </div>
  )
}

export default function StandingsTable({ standings = [], onTeamClick, dataSource = 'mock' }) {
  const dateStr = new Date().toLocaleDateString('ko-KR', { month: 'long', day: 'numeric' })

  return (
    <section className="w-full px-6 pb-10">
      <div className="mb-6 text-left">
        <div className="flex items-center gap-2 mb-1">
          <h2 className="text-xl font-bold" style={{ color: 'var(--text-h)' }}>
            2026 시즌 순위
          </h2>
          {dataSource === 'live' ? (
            <span className="text-xs font-semibold text-green-500">● 실시간</span>
          ) : (
            <span className="text-xs opacity-40" style={{ color: 'var(--text)' }}>목업 데이터</span>
          )}
        </div>
        <p className="text-sm" style={{ color: 'var(--text)' }}>
          {dateStr} 기준 · 구단 클릭 시 선수 스탯 확인
        </p>
      </div>

      <div
        className="rounded-2xl overflow-hidden"
        style={{ border: '1px solid var(--border)', boxShadow: 'var(--shadow)' }}
      >
        {/* 테이블 헤더 */}
        <div
          className="grid text-xs font-semibold px-4 py-3"
          style={{
            gridTemplateColumns: '2rem 1fr 3rem 3rem 3rem 3rem 10rem 5rem',
            color: 'var(--text)',
            backgroundColor: 'var(--code-bg)',
            borderBottom: '1px solid var(--border)',
          }}
        >
          <span className="text-center">순위</span>
          <span className="pl-2">구단</span>
          <span className="text-center">경기</span>
          <span className="text-center">승</span>
          <span className="text-center">패</span>
          <span className="text-center">무</span>
          <span className="text-center">승률</span>
          <span className="text-center">연속</span>
        </div>

        {/* 테이블 바디 */}
        {standings.map((row, idx) => {
          const team = KBO_TEAMS[row.team]
          if (!team) return null
          const isTop3 = row.rank <= 3
          const isLast = idx === standings.length - 1

          return (
            <div
              key={`${row.rank}-${row.team}`}
              className="grid items-center px-4 py-3 transition-colors duration-150 cursor-pointer hover:opacity-75"
              style={{
                gridTemplateColumns: '2rem 1fr 3rem 3rem 3rem 3rem 10rem 5rem',
                backgroundColor: 'var(--bg)',
                borderBottom: isLast ? 'none' : '1px solid var(--border)',
              }}
              onClick={() => onTeamClick(row.team)}
            >
              {/* 순위 */}
              <span
                className="text-center text-sm font-bold tabular-nums"
                style={{ color: isTop3 ? 'var(--accent)' : 'var(--text)' }}
              >
                {row.rank}
              </span>

              {/* 구단 */}
              <div className="flex items-center gap-2 pl-2">
                <img
                  src={team.logo}
                  alt={team.name}
                  className="w-7 h-7 object-contain shrink-0"
                  onError={(e) => {
                    e.target.style.display = 'none'
                    e.target.nextSibling.style.display = 'flex'
                  }}
                />
                <div
                  className="w-7 h-7 rounded-full items-center justify-center text-xs font-bold hidden shrink-0"
                  style={{ backgroundColor: team.color, color: team.textColor }}
                >
                  {team.short}
                </div>
                <span className="text-sm font-medium" style={{ color: 'var(--text-h)' }}>
                  {team.name}
                </span>
              </div>

              {/* 경기수 */}
              <span className="text-center text-sm tabular-nums" style={{ color: 'var(--text)' }}>
                {row.games}
              </span>

              {/* 승 */}
              <span className="text-center text-sm font-semibold tabular-nums" style={{ color: '#16a34a' }}>
                {row.wins}
              </span>

              {/* 패 */}
              <span className="text-center text-sm font-semibold tabular-nums" style={{ color: '#dc2626' }}>
                {row.losses}
              </span>

              {/* 무 */}
              <span className="text-center text-sm tabular-nums" style={{ color: 'var(--text)' }}>
                {row.draws}
              </span>

              {/* 승률 */}
              <div className="flex justify-center">
                <WinRateBar winRate={row.winRate} />
              </div>

              {/* 연속 */}
              <div className="flex justify-center">
                <StreakBadge streak={row.streak} />
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}
