import { useEffect, useState } from 'react'
import { NBA_TEAMS } from '../data/nbaTeams'

const SLOT   = 180
const CARD_W = 196

/* ─── 시리즈 카드 ─────────────────────────────────────────────── */
function SeriesCard({ series }) {
  const ht = NBA_TEAMS[series.home.tricode]    ?? { color: '#555', logo: '', name: '' }
  const vt = NBA_TEAMS[series.visitor.tricode] ?? { color: '#555', logo: '', name: '' }
  const hw = series.home.wins
  const vw = series.visitor.wins

  const homeWon    = series.isComplete && series.winnerId === series.home.teamId
  const visitorWon = series.isComplete && series.winnerId === series.visitor.teamId
  const active     = !series.isComplete && (hw + vw) > 0
  const upcoming   = !series.isComplete && hw === 0 && vw === 0
  const leader     = hw > vw ? series.home.tricode : vw > hw ? series.visitor.tricode : null

  const badge = series.isComplete
    ? { text: `${series.winnerTricode} 진출 🏆`, bg: 'rgba(251,191,36,0.1)', color: '#fbbf24', border: 'rgba(251,191,36,0.25)' }
    : upcoming
    ? { text: '대기 중', bg: 'rgba(255,255,255,0.04)', color: 'rgba(255,255,255,0.25)', border: 'rgba(255,255,255,0.07)' }
    : { text: `${leader} ${Math.max(hw,vw)}-${Math.min(hw,vw)} 리드`, bg: 'rgba(96,165,250,0.1)', color: '#60a5fa', border: 'rgba(96,165,250,0.22)' }

  return (
    <div style={{
      width: CARD_W, borderRadius: '16px', overflow: 'hidden',
      background: 'rgba(255,255,255,0.04)',
      border: `1px solid ${active ? 'rgba(255,255,255,0.13)' : 'rgba(255,255,255,0.07)'}`,
      opacity: series.isComplete ? 0.72 : 1,
    }}>
      <div style={{ height: '3px', background: `linear-gradient(to right,${vt.color},${ht.color})` }} />
      <div style={{ padding: '12px 12px 8px' }}>
        <TeamRow team={vt} tri={series.visitor.tricode} wins={vw} won={visitorWon} lost={homeWon} />
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
          padding: '6px 0', margin: '6px 0',
          borderTop: '1px solid rgba(255,255,255,0.05)',
          borderBottom: '1px solid rgba(255,255,255,0.05)',
        }}>
          <span style={{ fontSize: '26px', fontWeight: 900, letterSpacing: '-1px', lineHeight: 1,
            color: visitorWon ? '#fbbf24' : upcoming ? 'rgba(255,255,255,0.13)' : vw >= hw ? '#fff' : 'rgba(255,255,255,0.28)' }}>
            {vw}
          </span>
          <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.18)' }}>─</span>
          <span style={{ fontSize: '26px', fontWeight: 900, letterSpacing: '-1px', lineHeight: 1,
            color: homeWon ? '#fbbf24' : upcoming ? 'rgba(255,255,255,0.13)' : hw >= vw ? '#fff' : 'rgba(255,255,255,0.28)' }}>
            {hw}
          </span>
        </div>
        <TeamRow team={ht} tri={series.home.tricode} wins={hw} won={homeWon} lost={visitorWon} />
      </div>
      <div style={{
        margin: '0 8px 8px', padding: '4px 8px', borderRadius: '7px', textAlign: 'center',
        fontSize: '10px', fontWeight: 700, letterSpacing: '0.2px',
        background: badge.bg, border: `1px solid ${badge.border}`, color: badge.color,
      }}>{badge.text}</div>
    </div>
  )
}

function TeamRow({ team, tri, wins, won, lost }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', opacity: lost ? 0.27 : 1 }}>
      <div style={{
        width: '32px', height: '32px', borderRadius: '50%', flexShrink: 0,
        background: won ? `${team.color}22` : 'rgba(255,255,255,0.04)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        boxShadow: won ? `0 0 10px ${team.color}55` : 'none',
      }}>
        <img src={team.logo} alt={tri} style={{ width: '78%', height: '78%', objectFit: 'contain' }}
          onError={e => e.target.style.display = 'none'} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: '12px', fontWeight: won ? 800 : 600,
          color: won ? '#fff' : 'rgba(255,255,255,0.72)', letterSpacing: '0.2px' }}>{tri}</div>
        <div style={{ fontSize: '9px', color: 'rgba(255,255,255,0.27)', marginTop: '1px',
          whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{team.name}</div>
      </div>
      <div style={{ display: 'flex', gap: '3px' }}>
        {[0,1,2,3].map(i => (
          <div key={i} style={{
            width: '8px', height: '8px', borderRadius: '50%',
            background: i < wins ? (won ? '#fbbf24' : team.color) : 'rgba(255,255,255,0.1)',
          }} />
        ))}
      </div>
    </div>
  )
}

/* ─── 플레이스홀더 ─────────────────────────────────────────────── */
function PlaceholderCard({ label }) {
  return (
    <div style={{
      width: CARD_W, borderRadius: '16px',
      background: 'rgba(255,255,255,0.02)',
      border: '1px dashed rgba(255,255,255,0.07)',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      gap: '6px', minHeight: '120px',
    }}>
      <div style={{ fontSize: '18px', opacity: 0.15 }}>🏀</div>
      <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.18)', fontWeight: 600 }}>{label}</div>
    </div>
  )
}

/* ─── 브래킷 컬럼 ─────────────────────────────────────────────── */
function BracketCol({ series = [], slotsPerCard, placeholder, placeholderLabel, placeholderCount = 1 }) {
  const items = placeholder
    ? Array.from({ length: placeholderCount }).map((_, i) => ({ _ph: true, id: i }))
    : series

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flexShrink: 0 }}>
      {items.map((s) => (
        <div key={s._ph ? s.id : s.seriesId} style={{
          height: SLOT * slotsPerCard,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          {s._ph
            ? <PlaceholderCard label={placeholderLabel} />
            : <SeriesCard series={s} />
          }
        </div>
      ))}
    </div>
  )
}

/* ─── 라운드 라벨 ─────────────────────────────────────────────── */
function RoundLabel({ label, active, color }) {
  return (
    <div style={{
      width: CARD_W, textAlign: 'center', fontSize: '10px', fontWeight: 700,
      letterSpacing: '0.7px', color: active ? color : 'rgba(255,255,255,0.28)',
      paddingBottom: '8px', flexShrink: 0,
    }}>
      {label.toUpperCase()}
      {active && <span style={{
        display: 'inline-block', width: '5px', height: '5px', borderRadius: '50%',
        background: color, marginLeft: '5px', verticalAlign: 'middle',
        boxShadow: `0 0 6px ${color}`,
      }} />}
    </div>
  )
}

/* ─── 컨퍼런스 섹션 ───────────────────────────────────────────── */
function ConfSection({ label, color, align = 'left', roundLabels, children }) {
  return (
    <div style={{
      display: 'flex', flexDirection: 'column',
      border: `1px solid ${color}28`,
      borderRadius: '16px',
      background: `${color}06`,
      overflow: 'hidden',
      flexShrink: 0,
    }}>
      {/* 컨퍼런스 헤더 */}
      <div style={{
        padding: '8px 16px',
        background: `${color}0f`,
        borderBottom: `1px solid ${color}18`,
        fontSize: '10px', fontWeight: 800, letterSpacing: '1px', color,
        textAlign: align,
      }}>
        {align === 'left' ? `◀ ${label}` : `${label} ▶`}
      </div>

      {/* 라운드 라벨 행 */}
      <div style={{ display: 'flex', gap: '8px', padding: '10px 12px 0', justifyContent: align === 'left' ? 'flex-start' : 'flex-end' }}>
        {roundLabels.map((r, i) => (
          <RoundLabel key={i} label={r.label} active={r.active} color={color} />
        ))}
      </div>

      {/* 카드 컬럼 행 */}
      <div style={{ display: 'flex', gap: '8px', padding: '0 12px 12px' }}>
        {children}
      </div>
    </div>
  )
}

/* ─── 파이널 섹션 ─────────────────────────────────────────────── */
function FinalsSection({ series, hasFin, isActive }) {
  const GOLD = '#fbbf24'
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      flexShrink: 0, padding: '0 8px',
    }}>
      <div style={{
        fontSize: '10px', fontWeight: 800, letterSpacing: '0.7px',
        color: isActive ? GOLD : 'rgba(255,255,255,0.28)',
        marginBottom: '8px', textAlign: 'center',
        display: 'flex', alignItems: 'center', gap: '5px',
      }}>
        🏆 NBA 파이널
        {isActive && <span style={{
          display: 'inline-block', width: '5px', height: '5px', borderRadius: '50%',
          background: GOLD, boxShadow: `0 0 6px ${GOLD}`,
        }} />}
      </div>
      {hasFin
        ? series.map(s => <SeriesCard key={s.seriesId} series={s} />)
        : <PlaceholderCard label="파이널 대기" />
      }
    </div>
  )
}

/* ─── 메인 ─────────────────────────────────────────────────────── */
export default function PlayoffBracket() {
  const [rounds, setRounds]   = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/playoff')
      .then(r => r.json())
      .then(d => { setRounds(d.rounds ?? []); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  if (loading) return (
    <section style={{ padding: '0 24px 40px' }}>
      <div style={{ padding: '32px 0', textAlign: 'center', color: 'rgba(255,255,255,0.2)', fontSize: '13px' }}>
        플레이오프 로딩 중...
      </div>
    </section>
  )
  if (rounds.length === 0) return null

  const getConf = (code, conf) => {
    const r = rounds.find(r => r.code === code)
    if (!r) return []
    return r.series.filter(s => s.conf === conf).sort((a, b) => a.seriesId < b.seriesId ? -1 : 1)
  }

  const r1E = getConf('01', 'East')
  const r1W = getConf('01', 'West')
  const r2E = getConf('02', 'East')
  const r2W = getConf('02', 'West')
  const cfE = getConf('03', 'East')
  const cfW = getConf('03', 'West')
  const fin = rounds.find(r => r.code === '04')?.series ?? []

  const hasR2  = r2E.length > 0 || r2W.length > 0
  const hasCF  = cfE.length > 0 || cfW.length > 0
  const hasFin = fin.length > 0

  const activeCode = rounds.filter(r => r.series.some(s => !s.isComplete)).at(-1)?.code
  const isActive   = (code) => code === activeCode

  const EAST_COLOR = '#4FC3F7'
  const WEST_COLOR = '#FF8A65'

  const eastRounds = [
    { label: '1라운드',         active: isActive('01') },
    { label: '세미파이널',       active: isActive('02') },
    { label: '컨퍼런스 파이널',  active: isActive('03') },
  ]
  const westRounds = [
    { label: '컨퍼런스 파이널',  active: isActive('03') },
    { label: '세미파이널',       active: isActive('02') },
    { label: '1라운드',         active: isActive('01') },
  ]

  return (
    <section style={{ padding: '0 24px 48px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
        <h2 style={{ fontSize: '17px', fontWeight: 800, color: '#fff' }}>🏆 플레이오프 브래킷</h2>
        <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.25)' }}>2025-26 시즌</span>
      </div>

      <div style={{ overflowX: 'auto', paddingBottom: '8px' }}>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center', minWidth: 'max-content' }}>

          {/* ── EASTERN CONFERENCE ── */}
          <ConfSection label="EASTERN CONFERENCE" color={EAST_COLOR} align="left" roundLabels={eastRounds}>
            <BracketCol series={r1E} slotsPerCard={1} />
            <BracketCol
              series={r2E} slotsPerCard={2}
              placeholder={!hasR2} placeholderLabel="대기 중" placeholderCount={2}
            />
            <BracketCol
              series={cfE} slotsPerCard={4}
              placeholder={!hasCF} placeholderLabel="ECF 대기" placeholderCount={1}
            />
          </ConfSection>

          {/* ── NBA FINALS ── */}
          <FinalsSection series={fin} hasFin={hasFin} isActive={isActive('04')} />

          {/* ── WESTERN CONFERENCE ── */}
          <ConfSection label="WESTERN CONFERENCE" color={WEST_COLOR} align="right" roundLabels={westRounds}>
            <BracketCol
              series={cfW} slotsPerCard={4}
              placeholder={!hasCF} placeholderLabel="WCF 대기" placeholderCount={1}
            />
            <BracketCol
              series={r2W} slotsPerCard={2}
              placeholder={!hasR2} placeholderLabel="대기 중" placeholderCount={2}
            />
            <BracketCol series={r1W} slotsPerCard={1} />
          </ConfSection>

        </div>
      </div>
    </section>
  )
}
