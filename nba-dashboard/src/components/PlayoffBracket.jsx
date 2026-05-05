import { useEffect, useState } from 'react'
import { NBA_TEAMS } from '../data/nbaTeams'

const SLOT = 180   // R1 카드 1슬롯 높이(px)
const CARD_W = 196 // 카드 폭(px)


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
    ? { text: '대기 중',  bg: 'rgba(255,255,255,0.04)', color: 'rgba(255,255,255,0.25)', border: 'rgba(255,255,255,0.07)' }
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
        {/* 스코어 */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
          padding: '6px 0', margin: '6px 0',
          borderTop: '1px solid rgba(255,255,255,0.05)', borderBottom: '1px solid rgba(255,255,255,0.05)',
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
            boxShadow: i < wins && won ? `0 0 5px ${team.color}` : 'none',
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
      width: CARD_W, borderRadius: '16px', overflow: 'hidden',
      background: 'rgba(255,255,255,0.02)',
      border: '1px dashed rgba(255,255,255,0.07)',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      gap: '6px', minHeight: '110px',
    }}>
      <div style={{ fontSize: '18px', opacity: 0.15 }}>🏀</div>
      <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.18)', fontWeight: 600 }}>{label}</div>
    </div>
  )
}

function Connector() {
  return <div style={{ width: '8px', flexShrink: 0 }} />
}

/* ─── 브래킷 컬럼 ─────────────────────────────────────────────── */
function BracketCol({ series, slotsPerCard, placeholder, placeholderLabel, placeholderCount }) {
  if (placeholder) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', flexShrink: 0 }}>
        {Array.from({ length: placeholderCount }).map((_, i) => (
          <div key={i} style={{
            height: SLOT * slotsPerCard,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: '6px 0',
          }}>
            <PlaceholderCard label={placeholderLabel} />
          </div>
        ))}
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flexShrink: 0 }}>
      {series.map(s => (
        <div key={s.seriesId} style={{
          height: SLOT * slotsPerCard,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: '6px 0',
        }}>
          <SeriesCard series={s} />
        </div>
      ))}
    </div>
  )
}

/* ─── 라운드 헤더 ─────────────────────────────────────────────── */
function RoundHeader({ label, width, color, active }) {
  return (
    <div style={{
      width, textAlign: 'center', fontSize: '10px', fontWeight: 800,
      letterSpacing: '0.8px', padding: '4px 0 10px',
      color: active ? color : 'rgba(255,255,255,0.3)',
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

  const r1E  = getConf('01', 'East')
  const r1W  = getConf('01', 'West')
  const r2E  = getConf('02', 'East')
  const r2W  = getConf('02', 'West')
  const cfE  = getConf('03', 'East')
  const cfW  = getConf('03', 'West')
  const fin  = rounds.find(r => r.code === '04')?.series ?? []

  const hasR2  = r2E.length > 0 || r2W.length > 0
  const hasCF  = cfE.length > 0 || cfW.length > 0
  const hasFin = fin.length > 0

  const activeCode = rounds.filter(r => r.series.some(s => !s.isComplete)).at(-1)?.code
  const isActive = (code) => code === activeCode

  const totalH = SLOT * 4   // R1×4 = 4슬롯
  const EAST_COLOR = '#4FC3F7'
  const WEST_COLOR = '#FF8A65'
  const GOLD_COLOR = '#fbbf24'

  // 헤더 행 너비 계산
  const colW  = CARD_W        // 카드 컬럼
  const conW  = 18            // 커넥터 컬럼
  const gapW  = 0

  return (
    <section style={{ padding: '0 24px 48px' }}>
      {/* 섹션 헤더 */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
        <h2 style={{ fontSize: '17px', fontWeight: 800, color: '#fff' }}>🏆 플레이오프 브래킷</h2>
        <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.25)' }}>2025-26 시즌</span>
        <div style={{ marginLeft: 'auto', display: 'flex', gap: '12px', alignItems: 'center' }}>
          <span style={{ fontSize: '11px', color: EAST_COLOR, fontWeight: 700 }}>◀ EAST</span>
          <span style={{ fontSize: '11px', color: GOLD_COLOR, fontWeight: 700 }}>FINALS</span>
          <span style={{ fontSize: '11px', color: WEST_COLOR, fontWeight: 700 }}>WEST ▶</span>
        </div>
      </div>

      <div style={{ overflowX: 'auto', paddingBottom: '8px' }}>
        {/* ── 라운드 헤더 행 ── */}
        <div style={{ display: 'flex', marginBottom: '0', alignItems: 'center' }}>
          {/* East side headers */}
          <RoundHeader label="1라운드" width={colW} color={EAST_COLOR} active={isActive('01')} />
          <div style={{ width: conW }} />
          <RoundHeader label="세미파이널" width={colW} color={EAST_COLOR} active={isActive('02')} />
          <div style={{ width: conW }} />
          <RoundHeader label="컨퍼런스 파이널" width={colW} color={EAST_COLOR} active={isActive('03')} />
          <div style={{ width: conW }} />
          {/* Finals */}
          <RoundHeader label="NBA 파이널" width={colW} color={GOLD_COLOR} active={isActive('04')} />
          <div style={{ width: conW }} />
          {/* West side headers */}
          <RoundHeader label="컨퍼런스 파이널" width={colW} color={WEST_COLOR} active={isActive('03')} />
          <div style={{ width: conW }} />
          <RoundHeader label="세미파이널" width={colW} color={WEST_COLOR} active={isActive('02')} />
          <div style={{ width: conW }} />
          <RoundHeader label="1라운드" width={colW} color={WEST_COLOR} active={isActive('01')} />
        </div>

        {/* ── 컨퍼런스 레이블 ── */}
        <div style={{ display: 'flex', gap: '6px', marginBottom: '10px' }}>
          <div style={{
            flex: 1, padding: '5px 12px', borderRadius: '8px',
            background: 'rgba(79,195,247,0.07)', border: '1px solid rgba(79,195,247,0.14)',
            fontSize: '10px', fontWeight: 800, letterSpacing: '1px', color: EAST_COLOR,
          }}>EASTERN CONFERENCE</div>
          <div style={{
            flex: 1, padding: '5px 12px', borderRadius: '8px',
            background: 'rgba(255,138,101,0.07)', border: '1px solid rgba(255,138,101,0.14)',
            fontSize: '10px', fontWeight: 800, letterSpacing: '1px', color: WEST_COLOR, textAlign: 'right',
          }}>WESTERN CONFERENCE</div>
        </div>

        {/* ── 브래킷 본체 ── */}
        <div style={{ display: 'flex', alignItems: 'stretch' }}>

          {/* ── EAST 1R ── */}
          <BracketCol series={r1E} slotsPerCard={1} />
          <Connector />

          {/* ── EAST 2R ── */}
          {hasR2
            ? <BracketCol series={r2E} slotsPerCard={2} />
            : <BracketCol placeholder placeholderLabel="대기 중" placeholderCount={2} slotsPerCard={2} />
          }
          <Connector />

          {/* ── EAST CF ── */}
          {hasCF
            ? <BracketCol series={cfE} slotsPerCard={4} />
            : <BracketCol placeholder placeholderLabel="ECF 대기" placeholderCount={1} slotsPerCard={4} />
          }
          <Connector />

          {/* ── FINALS ── */}
          {hasFin
            ? <BracketCol series={fin} slotsPerCard={4} />
            : <BracketCol placeholder placeholderLabel="NBA 파이널" placeholderCount={1} slotsPerCard={4} />
          }

          <Connector />

          {/* ── WEST CF ── */}
          {hasCF
            ? <BracketCol series={cfW} slotsPerCard={4} />
            : <BracketCol placeholder placeholderLabel="WCF 대기" placeholderCount={1} slotsPerCard={4} />
          }
          <Connector />

          {/* ── WEST 2R ── */}
          {hasR2
            ? <BracketCol series={r2W} slotsPerCard={2} />
            : <BracketCol placeholder placeholderLabel="대기 중" placeholderCount={2} slotsPerCard={2} />
          }
          <Connector />

          {/* ── WEST 1R ── */}
          <BracketCol series={r1W} slotsPerCard={1} />
        </div>
      </div>
    </section>
  )
}
