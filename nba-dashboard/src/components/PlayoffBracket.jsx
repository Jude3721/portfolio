import { useState, useEffect } from 'react'
import { NBA_TEAMS } from '../data/nbaTeams'

function SeriesCard({ series, compact = false }) {
  const home    = NBA_TEAMS[series.home.tricode]
  const visitor = NBA_TEAMS[series.visitor.tricode]
  const hw      = series.home.wins
  const vw      = series.visitor.wins

  const homeLeads    = hw > vw
  const visitorLeads = vw > hw
  const tied         = hw === vw

  const statusText = series.isComplete
    ? `${series.winnerTricode} 승리`
    : hw === 0 && vw === 0
    ? '대기 중'
    : `${hw > vw ? series.home.tricode : series.visitor.tricode} ${Math.max(hw,vw)}-${Math.min(hw,vw)} 리드`

  return (
    <div style={{
      background: 'rgba(255,255,255,0.04)',
      border: `1px solid ${series.isComplete ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.12)'}`,
      borderRadius: '14px',
      padding: compact ? '10px 12px' : '12px 14px',
      display: 'flex', flexDirection: 'column', gap: '6px',
      opacity: series.isComplete ? 0.65 : 1,
    }}>
      {/* 상단 팀 */}
      <TeamLine
        tricode={series.visitor.tricode}
        team={visitor}
        wins={vw}
        isWinner={series.isComplete && series.winnerId === series.visitor.teamId}
        isLeading={!series.isComplete && visitorLeads}
        isLoser={series.isComplete && series.winnerId !== series.visitor.teamId}
      />
      {/* 하단 팀 */}
      <TeamLine
        tricode={series.home.tricode}
        team={home}
        wins={hw}
        isWinner={series.isComplete && series.winnerId === series.home.teamId}
        isLeading={!series.isComplete && homeLeads}
        isLoser={series.isComplete && series.winnerId !== series.home.teamId}
      />
      {/* 시리즈 상태 */}
      <div style={{
        fontSize: '10px', textAlign: 'center', marginTop: '2px',
        color: series.isComplete ? '#fbbf24' : tied && hw > 0 ? '#60a5fa' : 'rgba(255,255,255,0.3)',
        fontWeight: 600, letterSpacing: '0.3px',
      }}>
        {statusText}
      </div>
    </div>
  )
}

function TeamLine({ tricode, team, wins, isWinner, isLeading, isLoser }) {
  const color = team?.color ?? '#888'
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: '8px',
      opacity: isLoser ? 0.35 : 1,
    }}>
      <div style={{ width: '22px', height: '22px', flexShrink: 0 }}>
        <img src={team?.logo} alt={tricode}
          style={{ width: '100%', height: '100%', objectFit: 'contain' }}
          onError={e => e.target.style.display = 'none'}
        />
      </div>
      <span style={{
        flex: 1, fontSize: '13px', fontWeight: isWinner || isLeading ? 700 : 500,
        color: isWinner ? '#fff' : isLeading ? '#fff' : 'rgba(255,255,255,0.6)',
      }}>
        {tricode}
      </span>
      <div style={{
        display: 'flex', gap: '3px', alignItems: 'center',
      }}>
        {[0,1,2,3].map(i => (
          <div key={i} style={{
            width: '8px', height: '8px', borderRadius: '50%',
            background: i < wins ? (isWinner ? '#fbbf24' : color) : 'rgba(255,255,255,0.12)',
            transition: 'background 0.3s',
          }} />
        ))}
      </div>
    </div>
  )
}

function RoundColumn({ label, eastSeries, westSeries, isFinals }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', minWidth: '170px' }}>
      {/* 라운드 라벨 */}
      <div style={{
        fontSize: '11px', fontWeight: 700, color: 'rgba(255,255,255,0.35)',
        textAlign: 'center', letterSpacing: '0.5px',
        padding: '4px 0 8px',
        borderBottom: '1px solid rgba(255,255,255,0.07)',
        marginBottom: '4px',
      }}>
        {label.toUpperCase()}
      </div>

      {isFinals
        ? (westSeries ?? eastSeries ?? []).map(s => <SeriesCard key={s.seriesId} series={s} />)
        : (
          <>
            {/* EAST */}
            <div style={{ fontSize: '10px', fontWeight: 700, color: '#4FC3F7', letterSpacing: '1px', marginBottom: '4px' }}>
              EAST
            </div>
            {eastSeries.map(s => <SeriesCard key={s.seriesId} series={s} />)}

            <div style={{ height: '12px' }} />

            {/* WEST */}
            <div style={{ fontSize: '10px', fontWeight: 700, color: '#FF8A65', letterSpacing: '1px', marginBottom: '4px' }}>
              WEST
            </div>
            {westSeries.map(s => <SeriesCard key={s.seriesId} series={s} />)}
          </>
        )
      }
    </div>
  )
}

export default function PlayoffBracket() {
  const [rounds, setRounds]   = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState(null)

  useEffect(() => {
    fetch('/api/playoff')
      .then(r => r.json())
      .then(d => { setRounds(d.rounds ?? []); setLoading(false) })
      .catch(e => { setError(e.message); setLoading(false) })
  }, [])

  if (loading) return (
    <section style={{ padding: '0 24px 40px' }}>
      <div style={{ padding: '40px 0', textAlign: 'center', color: 'rgba(255,255,255,0.25)', fontSize: '14px' }}>
        플레이오프 데이터 로딩 중...
      </div>
    </section>
  )

  if (error || rounds.length === 0) return null

  return (
    <section style={{ padding: '0 24px 40px' }}>
      {/* 섹션 헤더 */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
        <h2 style={{ fontSize: '17px', fontWeight: 800, color: '#fff' }}>🏆 플레이오프 브래킷</h2>
        <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.25)' }}>
          {new Date().getFullYear() - 1}-{String(new Date().getFullYear()).slice(2)} 시즌
        </span>
      </div>

      {/* 브래킷 */}
      <div style={{
        overflowX: 'auto',
        paddingBottom: '8px',
      }}>
        <div style={{
          display: 'flex',
          gap: '16px',
          alignItems: 'flex-start',
          minWidth: 'max-content',
        }}>
          {rounds.map(round => {
            const isFinals = round.code === '04'
            const eastSeries = round.series.filter(s => s.conf === 'East')
            const westSeries = round.series.filter(s => s.conf === 'West')
            const finalsSeries = round.series.filter(s => s.conf === 'Finals')

            return (
              <RoundColumn
                key={round.code}
                label={round.label}
                eastSeries={isFinals ? null : eastSeries}
                westSeries={isFinals ? null : westSeries}
                isFinals={isFinals}
              />
            )
          })}
        </div>
      </div>
    </section>
  )
}
