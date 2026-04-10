import TodayGameCard from './TodayGameCard'

export default function TodayGameList({ games, standings }) {
  const today = new Date().toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'short',
  })

  return (
    <section className="w-full px-6 py-8">
      <div className="mb-6 text-left">
        <h2 className="text-xl font-bold mb-1" style={{ color: 'var(--text-h)' }}>
          오늘의 경기
        </h2>
        <p className="text-sm" style={{ color: 'var(--text)' }}>
          {today}
        </p>
      </div>

      {games.length === 0 ? (
        <div
          className="text-center py-16 rounded-2xl"
          style={{ border: '1px solid var(--border)', color: 'var(--text)' }}
        >
          <p className="text-4xl mb-3">⚾</p>
          <p className="font-medium">오늘 예정된 경기가 없습니다.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {games.map((game) => (
            <TodayGameCard key={game.id} game={game} standings={standings} />
          ))}
        </div>
      )}
    </section>
  )
}
