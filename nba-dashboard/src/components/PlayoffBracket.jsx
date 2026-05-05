import { useEffect, useState } from 'react'
import { NBA_TEAMS } from '../data/nbaTeams'

/* ─── 시리즈 카드 ─────────────────────────────────────────────── */
function SeriesCard({ series }) {
  const ht  = NBA_TEAMS[series.home.tricode]    ?? { color: '#444', logo: '', name: series.home.tricode }
  const vt  = NBA_TEAMS[series.visitor.tricode] ?? { color: '#444', logo: '', name: series.visitor.tricode }
  const hw  = series.home.wins
  const vw  = series.visitor.wins

  const homeWon    = series.isComplete && series.winnerId === series.home.teamId
  const visitorWon = series.isComplete && series.winnerId === series.visitor.teamId
  const active     = !series.isComplete && (hw + vw) > 0
  const upcoming   = !series.isComplete && hw === 0 && vw === 0

  const leaderTri = hw > vw ? series.home.tricode : vw > hw ? series.visitor.tricode : null
  const statusBadge = series.isComplete
    ? { text: `${series.winnerTricode} 4강 진출`, bg: 'rgba(251,191,36,0.12)', color: '#fbbf24', border: 'rgba(251,191,36,0.3)' }
    : upcoming
    ? { text: '대기 중',   bg: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.3)', border: 'rgba(255,255,255,0.08)' }
    : { text: `${leaderTri} ${Math.max(hw,vw)}-${Math.min(hw,vw)} 리드`, bg: 'rgba(96,165,250,0.12)', color: '#60a5fa', border: 'rgba(96,165,250,0.25)' }

  return (
    <div style={{
      borderRadius: '18px',
      background: 'rgba(255,255,255,0.04)',
      border: `1px solid ${active ? 'rgba(255,255,255,0.14)' : 'rgba(255,255,255,0.07)'}`,
      overflow: 'hidden',
      opacity: series.isComplete ? 0.7 : 1,
      transition: 'opacity 0.2s',
      minWidth: '200px',
    }}>
      {/* 상단 컬러 바 */}
      <div style={{
        height: '3px',
        background: `linear-gradient(to right, ${vt.color}, ${ht.color})`,
      }} />

      <div style={{ padding: '14px 14px 10px' }}>
        {/* 원정팀 */}
        <TeamRow
          team={vt}
          tricode={series.visitor.tricode}
          wins={vw}
          isWinner={visitorWon}
          isLoser={homeWon}
          isLive={active}
        />

        {/* 시리즈 스코어 */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          gap: '12px', padding: '8px 0 6px',
          borderTop: '1px solid rgba(255,255,255,0.05)',
          borderBottom: '1px solid rgba(255,255,255,0.05)',
          margin: '8px 0',
        }}>
          <span style={{
            fontSize: '28px', fontWeight: 900, letterSpacing: '-1px', lineHeight: 1,
            color: visitorWon ? '#fbbf24' : upcoming ? 'rgba(255,255,255,0.15)' : vw > hw ? '#fff' : 'rgba(255,255,255,0.3)',
          }}>{vw}</span>
          <span style={{ fontSize: '13px', color: 'rgba(255,255,255,0.2)', fontWeight: 300 }}>─</span>
          <span style={{
            fontSize: '28px', fontWeight: 900, letterSpacing: '-1px', lineHeight: 1,
            color: homeWon ? '#fbbf24' : upcoming ? 'rgba(255,255,255,0.15)' : hw > vw ? '#fff' : 'rgba(255,255,255,0.3)',
          }}>{hw}</span>
        </div>

        {/* 홈팀 */}
        <TeamRow
          team={ht}
          tricode={series.home.tricode}
          wins={hw}
          isWinner={homeWon}
          isLoser={visitorWon}
          isLive={active}
        />
      </div>

      {/* 상태 배지 */}
      <div style={{
        margin: '0 10px 10px',
        padding: '5px 10px',
        borderRadius: '8px',
        background: statusBadge.bg,
        border: `1px solid ${statusBadge.border}`,
        textAlign: 'center',
        fontSize: '11px', fontWeight: 700, letterSpacing: '0.3px',
        color: statusBadge.color,
      }}>
        {series.isComplete && '🏆 '}{statusBadge.text}
      </div>
    </div>
  )
}

function TeamRow({ team, tricode, wins, isWinner, isLoser, isLive }) {
  const color = team.color
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: '10px',
      opacity: isLoser ? 0.28 : 1,
      transition: 'opacity 0.2s',
    }}>
      {/* 로고 */}
      <div style={{
        width: '36px', height: '36px', flexShrink: 0,
        borderRadius: '50%',
        background: isWinner ? `${color}22` : 'rgba(255,255,255,0.04)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        boxShadow: isWinner ? `0 0 12px ${color}55` : 'none',
        transition: 'all 0.3s',
      }}>
        <img src={team.logo} alt={tricode}
          style={{ width: '78%', height: '78%', objectFit: 'contain' }}
          onError={e => e.target.style.display = 'none'}
        />
      </div>

      {/* 팀명 */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontSize: '13px', fontWeight: isWinner ? 800 : 600,
          color: isWinner ? '#fff' : 'rgba(255,255,255,0.75)',
          letterSpacing: '0.2px',
        }}>{tricode}</div>
        <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.3)', marginTop: '1px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {team.name}
        </div>
      </div>

      {/* 승수 도트 */}
      <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
        {[0,1,2,3].map(i => (
          <div key={i} style={{
            width: '9px', height: '9px', borderRadius: '50%',
            background: i < wins
              ? (isWinner ? '#fbbf24' : color)
              : 'rgba(255,255,255,0.1)',
            boxShadow: i < wins && isWinner ? `0 0 6px ${color}` : 'none',
            transition: 'all 0.3s',
          }} />
        ))}
      </div>
    </div>
  )
}

/* ─── 라운드 컬럼 ────────────────────────────────────────────── */
function RoundColumn({ round, confFilter, showConnector }) {
  const series = round.series.filter(s =>
    confFilter === 'all' ? true : s.conf === confFilter
  )
  if (series.length === 0) return null

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', flex: '0 0 auto', width: '204px' }}>
      {series.map((s, i) => (
        <div key={s.seriesId} style={{ display: 'flex', alignItems: 'center' }}>
          <SeriesCard series={s} />
          {showConnector && (
            <div style={{
              width: '16px', height: '2px',
              background: 'rgba(255,255,255,0.08)',
              flexShrink: 0,
            }} />
          )}
        </div>
      ))}
    </div>
  )
}

/* ─── 메인 컴포넌트 ──────────────────────────────────────────── */
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
      <div style={{ padding: '32px 0', textAlign: 'center', color: 'rgba(255,255,255,0.2)', fontSize: '13px' }}>
        플레이오프 로딩 중...
      </div>
    </section>
  )
  if (error || rounds.length === 0) return null

  const activeRound = rounds.filter(r => r.series.some(s => !s.isComplete)).at(-1)?.label ?? ''

  const ROUND_ORDER = ['01', '02', '03', '04']
  const orderedRounds = ROUND_ORDER.map(code => rounds.find(r => r.code === code)).filter(Boolean)

  // 플레이스홀더 라운드 (아직 시작 안 한 라운드)
  const ROUND_LABELS = { '03': '컨퍼런스 파이널', '04': 'NBA 파이널' }
  const existCodes   = new Set(rounds.map(r => r.code))
  const placeholder  = ['03', '04'].filter(c => !existCodes.has(c)).map(c => ({
    code: c, label: ROUND_LABELS[c], series: [], placeholder: true,
  }))
  const allRounds = [...orderedRounds, ...placeholder]

  return (
    <section style={{ padding: '0 24px 48px' }}>
      {/* 헤더 */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
        <h2 style={{ fontSize: '17px', fontWeight: 800, color: '#fff', letterSpacing: '-0.3px' }}>
          🏆 플레이오프 브래킷
        </h2>
        <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.25)' }}>
          2025-26 시즌
        </span>
        {activeRound && (
          <span style={{
            marginLeft: 'auto',
            fontSize: '11px', fontWeight: 700, padding: '3px 10px',
            borderRadius: '99px', letterSpacing: '0.3px',
            background: 'rgba(96,165,250,0.12)', color: '#60a5fa',
            border: '1px solid rgba(96,165,250,0.25)',
          }}>
            ● {activeRound} 진행 중
          </span>
        )}
      </div>

      {/* 컨퍼런스 레이블 */}
      <div style={{ display: 'flex', gap: '6px', marginBottom: '12px' }}>
        <div style={{
          flex: 1, padding: '6px 14px', borderRadius: '8px',
          background: 'rgba(79,195,247,0.07)', border: '1px solid rgba(79,195,247,0.15)',
          fontSize: '11px', fontWeight: 800, letterSpacing: '1px', color: '#4FC3F7',
        }}>
          ⬛ EASTERN CONFERENCE
        </div>
        <div style={{
          flex: 1, padding: '6px 14px', borderRadius: '8px',
          background: 'rgba(255,138,101,0.07)', border: '1px solid rgba(255,138,101,0.15)',
          fontSize: '11px', fontWeight: 800, letterSpacing: '1px', color: '#FF8A65',
        }}>
          ⬛ WESTERN CONFERENCE
        </div>
      </div>

      {/* 브래킷 래퍼 */}
      <div style={{ overflowX: 'auto', paddingBottom: '8px' }}>
        {/* EAST 행 */}
        <ConferenceRow rounds={allRounds} conf="East" color="#4FC3F7" />
        <div style={{ height: '16px' }} />
        {/* WEST 행 */}
        <ConferenceRow rounds={allRounds} conf="West" color="#FF8A65" />
      </div>
    </section>
  )
}

/* ─── 컨퍼런스 행 ────────────────────────────────────────────── */
function ConferenceRow({ rounds, conf, color }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0' }}>
      {rounds.map((round, ri) => {
        const isFinals = round.code === '04'
        const series   = isFinals
          ? round.series
          : round.series.filter(s => s.conf === conf)
        const isLast   = ri === rounds.length - 1

        return (
          <div key={round.code} style={{ display: 'flex', alignItems: 'center' }}>
            {/* 라운드 컬럼 */}
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {/* 라운드 헤더 */}
              <div style={{
                fontSize: '10px', fontWeight: 700, letterSpacing: '0.8px',
                color: round.placeholder ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.4)',
                textAlign: 'center',
                marginBottom: '8px',
                padding: '4px 6px',
                borderRadius: '6px',
                background: round.placeholder ? 'transparent' : 'rgba(255,255,255,0.04)',
              }}>
                {round.label.toUpperCase()}
              </div>

              {/* 시리즈 카드 or 플레이스홀더 */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', width: '204px' }}>
                {round.placeholder || series.length === 0
                  ? <PlaceholderCard conf={conf} round={round.label} color={color} />
                  : series.map(s => <SeriesCard key={s.seriesId} series={s} />)
                }
              </div>
            </div>

            {/* 라운드 간 화살표 */}
            {!isLast && (
              <div style={{
                width: '24px', height: '2px', flexShrink: 0, alignSelf: 'center',
                background: `linear-gradient(to right, rgba(255,255,255,0.1), ${color}44)`,
                position: 'relative',
                marginTop: '24px',
              }}>
                <div style={{
                  position: 'absolute', right: '-4px', top: '50%',
                  transform: 'translateY(-50%)',
                  width: 0, height: 0,
                  borderTop: '4px solid transparent',
                  borderBottom: '4px solid transparent',
                  borderLeft: `6px solid ${color}55`,
                }} />
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

function PlaceholderCard({ conf, round, color }) {
  return (
    <div style={{
      borderRadius: '18px',
      background: 'rgba(255,255,255,0.02)',
      border: '1px dashed rgba(255,255,255,0.07)',
      minWidth: '204px',
      padding: '20px 14px',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      gap: '6px',
      minHeight: '110px',
    }}>
      <div style={{ fontSize: '20px', opacity: 0.2 }}>🏀</div>
      <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.2)', fontWeight: 600, textAlign: 'center' }}>
        {round} 대기 중
      </div>
    </div>
  )
}
