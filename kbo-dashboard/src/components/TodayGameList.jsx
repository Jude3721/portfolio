import TodayGameCard from './TodayGameCard'

export default function TodayGameList({ games, standings }) {
  const today = new Date().toLocaleDateString('ko-KR', {
    year: 'numeric', month: 'long', day: 'numeric', weekday: 'short',
  })

  return (
    <section style={{ width: '100%', padding: '28px 24px 24px' }}>
      {/* 섹션 헤더 */}
      <div style={{ marginBottom: '20px', textAlign: 'left' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
          <h2 style={{
            fontSize: '20px', fontWeight: 800, color: 'rgba(var(--fg-rgb),0.9)',
            letterSpacing: '-0.3px', margin: 0,
          }}>
            오늘의 경기
          </h2>
          {games.some(g => g.status === 'live') && (
            <span className="live-badge" style={{ fontSize: '10px' }}>
              <span className="live-dot" />LIVE
            </span>
          )}
        </div>
        <p style={{ fontSize: '13px', color: 'rgba(var(--fg-rgb),0.35)', letterSpacing: '0.3px' }}>
          {today}
        </p>
      </div>

      {/* 경기 없음 */}
      {games.length === 0 ? (
        <div style={{
          textAlign: 'center', padding: '64px 0',
          background: 'rgba(var(--fg-rgb),0.04)',
          backdropFilter: 'blur(12px)',
          border: '1px solid rgba(var(--fg-rgb),0.08)',
          borderRadius: '20px',
          color: 'rgba(var(--fg-rgb),0.4)',
        }}>
          <p style={{ fontSize: '40px', marginBottom: '12px' }}>⚾</p>
          <p style={{ fontSize: '14px', fontWeight: 500 }}>오늘 예정된 경기가 없습니다.</p>
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: '14px',
        }}>
          {games.map((game) => (
            <TodayGameCard key={game.id} game={game} standings={standings} />
          ))}
        </div>
      )}
    </section>
  )
}
