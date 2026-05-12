import { useState, useEffect } from 'react'
import { fetchDraftProspects } from '../services/nbaApi'
import { NBA_TEAMS } from '../data/nbaTeams'

const POSITIONS = ['ALL', 'PG', 'SG', 'SF', 'PF', 'C']

const POS_COLOR = {
  PG: '#4FC3F7', SG: '#81D4FA', SF: '#4ade80', PF: '#F4A261', C: '#f87171',
}

function timeAgo(pubDate) {
  if (!pubDate) return ''
  const diff = Date.now() - new Date(pubDate).getTime()
  const m = Math.floor(diff / 60000)
  if (m < 60)  return `${m}분 전`
  const h = Math.floor(m / 60)
  if (h < 24)  return `${h}시간 전`
  return `${Math.floor(h / 24)}일 전`
}

function Countdown({ target }) {
  const [diff, setDiff] = useState(null)

  useEffect(() => {
    const calc = () => {
      const ms = new Date(target) - Date.now()
      if (ms <= 0) { setDiff(null); return }
      setDiff({
        d: Math.floor(ms / 86400000),
        h: Math.floor((ms % 86400000) / 3600000),
        m: Math.floor((ms % 3600000) / 60000),
      })
    }
    calc()
    const id = setInterval(calc, 60000)
    return () => clearInterval(id)
  }, [target])

  if (!diff) return null

  return (
    <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', marginTop: '20px' }}>
      {[['일', diff.d], ['시간', diff.h], ['분', diff.m]].map(([unit, val]) => (
        <div key={unit} style={{
          background: 'rgba(255,255,255,0.06)', borderRadius: '14px',
          padding: '14px 22px', textAlign: 'center', minWidth: '70px',
          border: '1px solid rgba(255,255,255,0.07)',
        }}>
          <div style={{ fontSize: '26px', fontWeight: 900, color: '#F4A261' }}>{val}</div>
          <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.35)', marginTop: '4px' }}>{unit}</div>
        </div>
      ))}
    </div>
  )
}

function NewsCard({ item }) {
  return (
    <a
      href={item.link}
      target="_blank"
      rel="noreferrer"
      style={{
        display: 'block', textDecoration: 'none',
        background: 'rgba(255,255,255,0.03)',
        border: '1px solid rgba(255,255,255,0.06)',
        borderRadius: '12px', padding: '14px 16px',
        transition: 'background 0.15s',
      }}
      onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.06)'}
      onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.03)'}
    >
      <p style={{ fontSize: '13px', fontWeight: 600, color: '#fff', lineHeight: 1.5, marginBottom: '6px' }}>
        {item.title}
      </p>
      <div style={{ display: 'flex', gap: '8px', fontSize: '11px', color: 'rgba(255,255,255,0.3)' }}>
        {item.source && <span>{item.source}</span>}
        {item.pubDate && <span>· {timeAgo(item.pubDate)}</span>}
      </div>
    </a>
  )
}

export default function DraftProspects() {
  const [data, setData]         = useState(null)
  const [loading, setLoading]   = useState(true)
  const [error, setError]       = useState(null)
  const [posFilter, setPosFilter] = useState('ALL')

  useEffect(() => {
    fetchDraftProspects()
      .then(setData)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return (
    <div style={{ padding: '80px 24px', textAlign: 'center', color: 'rgba(255,255,255,0.3)' }}>
      <div style={{ fontSize: '36px', marginBottom: '12px' }}>🎯</div>
      <p style={{ fontSize: '14px' }}>드래프트 데이터 로딩 중...</p>
    </div>
  )

  if (error) return (
    <div style={{ padding: '80px 24px', textAlign: 'center', color: 'rgba(255,100,100,0.6)' }}>
      <p>데이터를 불러올 수 없습니다: {error}</p>
    </div>
  )

  const isPicks     = data?.type === 'picks'
  const prospects   = data?.prospects ?? []
  const pickOrder   = data?.pickOrder ?? []
  const news        = data?.news ?? []
  const year        = data?.year ?? new Date().getFullYear()
  const draftDate   = data?.draftDate

  const filtered = posFilter === 'ALL'
    ? prospects
    : prospects.filter(p => p.position === posFilter)

  return (
    <div style={{ padding: '0 24px 40px' }}>
      {/* 헤더 */}
      <div style={{ marginBottom: '24px' }}>
        <h2 style={{ fontSize: '17px', fontWeight: 800, color: '#fff', marginBottom: '4px' }}>
          {year} NBA 드래프트
        </h2>
        <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.28)' }}>
          {isPicks ? `${prospects.length}명 확정` : '예상 순위 · 드래프트 전'}
        </p>
      </div>

      {isPicks ? (
        <>
          {/* 포지션 필터 */}
          <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', flexWrap: 'wrap' }}>
            {POSITIONS.map(pos => (
              <button
                key={pos}
                onClick={() => setPosFilter(pos)}
                style={{
                  padding: '6px 14px', borderRadius: '20px', fontSize: '12px', fontWeight: 700,
                  border: 'none', cursor: 'pointer', transition: 'all 0.15s',
                  background: posFilter === pos ? (POS_COLOR[pos] ?? '#F4A261') : 'rgba(255,255,255,0.07)',
                  color: posFilter === pos ? '#000' : 'rgba(255,255,255,0.5)',
                }}
              >
                {pos}
              </button>
            ))}
          </div>

          {/* 픽 테이블 */}
          <div style={{
            background: 'rgba(255,255,255,0.03)', borderRadius: '16px',
            border: '1px solid rgba(255,255,255,0.06)', overflow: 'hidden',
            marginBottom: '32px',
          }}>
            {/* 헤더 행 */}
            <div style={{
              display: 'grid', gridTemplateColumns: '56px 1fr 72px 1fr 80px',
              padding: '11px 20px', borderBottom: '1px solid rgba(255,255,255,0.06)',
              fontSize: '11px', fontWeight: 700, color: 'rgba(255,255,255,0.3)',
              textTransform: 'uppercase', letterSpacing: '0.5px',
            }}>
              <span>픽</span>
              <span>선수</span>
              <span style={{ textAlign: 'center' }}>포지션</span>
              <span>학교/소속</span>
              <span style={{ textAlign: 'right' }}>구단</span>
            </div>

            {filtered.length === 0 ? (
              <div style={{ padding: '40px', textAlign: 'center', color: 'rgba(255,255,255,0.25)', fontSize: '13px' }}>
                해당 포지션 데이터가 없습니다
              </div>
            ) : filtered.map((p, i) => (
              <div
                key={i}
                style={{
                  display: 'grid', gridTemplateColumns: '56px 1fr 72px 1fr 80px',
                  padding: '13px 20px', alignItems: 'center',
                  borderBottom: i < filtered.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none',
                  background: i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.01)',
                }}
              >
                {/* 픽 번호 */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{
                    fontSize: p.rank <= 5 ? '16px' : '14px', fontWeight: 900,
                    color: p.rank <= 5 ? '#F4A261' : p.rank <= 14 ? '#fff' : 'rgba(255,255,255,0.5)',
                  }}>
                    {p.rank}
                  </span>
                  {p.round === 1 && p.rank <= 14 && (
                    <span style={{
                      fontSize: '9px', fontWeight: 700, padding: '2px 5px', borderRadius: '4px',
                      background: 'rgba(244,162,97,0.15)', color: '#F4A261',
                    }}>LOT</span>
                  )}
                </div>

                {/* 선수명 */}
                <span style={{ fontSize: '14px', fontWeight: 700 }}>{p.name}</span>

                {/* 포지션 */}
                <div style={{ textAlign: 'center' }}>
                  <span style={{
                    padding: '3px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: 700,
                    background: `${POS_COLOR[p.position] ?? '#888'}22`,
                    color: POS_COLOR[p.position] ?? 'rgba(255,255,255,0.4)',
                  }}>
                    {p.position}
                  </span>
                </div>

                {/* 학교 */}
                <span style={{ fontSize: '13px', color: 'rgba(255,255,255,0.5)' }}>{p.school}</span>

                {/* 구단 */}
                <div style={{ textAlign: 'right' }}>
                  {p.teamLogo
                    ? <img src={p.teamLogo} alt={p.team} style={{ height: '26px', objectFit: 'contain' }} />
                    : <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)' }}>{p.team}</span>
                  }
                </div>
              </div>
            ))}
          </div>
        </>
      ) : (
        /* 드래프트 전 상태 */
        <div style={{
          background: 'rgba(255,255,255,0.03)', borderRadius: '16px',
          border: '1px solid rgba(255,255,255,0.07)',
          padding: '40px 24px', textAlign: 'center', marginBottom: '32px',
        }}>
          <div style={{ fontSize: '48px', marginBottom: '12px' }}>🏆</div>
          <h3 style={{ fontSize: '18px', fontWeight: 800, marginBottom: '6px' }}>
            {year} NBA 드래프트
          </h3>
          <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.4)' }}>
            예정일 {draftDate} · 드래프트 확정 후 순위가 업데이트됩니다
          </p>
          {draftDate && <Countdown target={draftDate} />}
        </div>
      )}

      {/* 구단 픽 순서 */}
      {pickOrder.length > 0 && (
        <div style={{ marginBottom: '32px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
            <h3 style={{ fontSize: '14px', fontWeight: 700, color: 'rgba(255,255,255,0.6)', letterSpacing: '0.3px' }}>
              구단 픽 순서
            </h3>
            {!isPicks && (
              <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.25)', fontWeight: 500 }}>
                로터리 확정
              </span>
            )}
          </div>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(72px, 1fr))',
            gap: '8px',
          }}>
            {pickOrder.map(p => {
              const teamInfo = NBA_TEAMS[p.team]
              const color = p.teamColor ?? teamInfo?.color
              return (
                <div
                  key={p.rank}
                  style={{
                    background: color ? `${color}18` : 'rgba(255,255,255,0.03)',
                    border: `1px solid ${color ? `${color}30` : 'rgba(255,255,255,0.06)'}`,
                    borderRadius: '10px', padding: '8px 6px',
                    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '5px',
                  }}
                >
                  <span style={{
                    fontSize: p.rank <= 5 ? '13px' : '11px', fontWeight: 900,
                    color: p.rank <= 5 ? '#F4A261' : p.rank <= 14 ? '#fff' : 'rgba(255,255,255,0.45)',
                  }}>
                    #{p.rank}
                  </span>
                  {(p.teamLogo ?? teamInfo?.logo)
                    ? <img src={p.teamLogo ?? teamInfo?.logo} alt={p.team} style={{ height: '28px', objectFit: 'contain' }} />
                    : <span style={{ fontSize: '11px', fontWeight: 700, color: 'rgba(255,255,255,0.7)' }}>{p.team}</span>
                  }
                  <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.35)', fontWeight: 600 }}>{p.team}</span>
                  {p.via && (
                    <span style={{ fontSize: '9px', color: 'rgba(255,255,255,0.2)', fontWeight: 500 }}>via {p.via}</span>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* 드래프트 뉴스 */}
      {news.length > 0 && (
        <div>
          <h3 style={{ fontSize: '14px', fontWeight: 700, color: 'rgba(255,255,255,0.6)', marginBottom: '12px', letterSpacing: '0.3px' }}>
            드래프트 최신 뉴스
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {news.map((item, i) => <NewsCard key={i} item={item} />)}
          </div>
        </div>
      )}
    </div>
  )
}
