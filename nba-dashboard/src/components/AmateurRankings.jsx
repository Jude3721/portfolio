import { useState, useEffect } from 'react'
import { fetchAmateurRankings } from '../services/nbaApi'

const POS_COLOR = {
  PG: '#4FC3F7', SG: '#81D4FA', SF: '#4ade80', PF: '#F4A261', C: '#f87171',
}
const POSITIONS = ['ALL', 'PG', 'SG', 'SF', 'PF', 'C']

function Stars({ count }) {
  return (
    <span style={{ letterSpacing: '-1px', fontSize: '13px' }}>
      {Array.from({ length: 5 }).map((_, i) => (
        <span key={i} style={{ color: i < count ? '#F4A261' : 'rgba(255,255,255,0.1)' }}>★</span>
      ))}
    </span>
  )
}

function PosTag({ pos }) {
  return (
    <span style={{
      padding: '3px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: 700,
      background: `${POS_COLOR[pos] ?? '#888'}22`,
      color: POS_COLOR[pos] ?? 'rgba(255,255,255,0.4)',
    }}>
      {pos}
    </span>
  )
}

function CollegeTable({ players, posFilter }) {
  const [sortKey, setSortKey] = useState('pts')

  const filtered = (posFilter === 'ALL' ? players : players.filter(p => p.position === posFilter))
    .slice().sort((a, b) => b[sortKey] - a[sortKey])
    .map((p, i) => ({ ...p, rank: i + 1 }))

  const SortBtn = ({ k, label }) => (
    <button
      onClick={() => setSortKey(k)}
      style={{
        padding: '5px 12px', borderRadius: '16px', fontSize: '11px', fontWeight: 700,
        border: 'none', cursor: 'pointer', transition: 'all 0.15s',
        background: sortKey === k ? '#4FC3F7' : 'rgba(255,255,255,0.07)',
        color: sortKey === k ? '#000' : 'rgba(255,255,255,0.45)',
      }}
    >
      {label}
    </button>
  )

  return (
    <>
      <div style={{ display: 'flex', gap: '6px', marginBottom: '16px', flexWrap: 'wrap' }}>
        <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.3)', alignSelf: 'center', marginRight: '4px' }}>정렬</span>
        <SortBtn k="pts" label="득점" />
        <SortBtn k="reb" label="리바운드" />
        <SortBtn k="ast" label="어시스트" />
        <SortBtn k="stl" label="스틸" />
        <SortBtn k="blk" label="블록" />
      </div>

      <div style={{
        background: 'rgba(255,255,255,0.03)', borderRadius: '16px',
        border: '1px solid rgba(255,255,255,0.06)', overflow: 'hidden',
      }}>
        {/* 헤더 */}
        <div style={{
          display: 'grid', gridTemplateColumns: '48px 1fr 70px 1fr 56px 56px 56px',
          padding: '11px 16px', borderBottom: '1px solid rgba(255,255,255,0.06)',
          fontSize: '11px', fontWeight: 700, color: 'rgba(255,255,255,0.3)',
          textTransform: 'uppercase', letterSpacing: '0.5px',
        }}>
          <span>#</span>
          <span>선수</span>
          <span style={{ textAlign: 'center' }}>포지션</span>
          <span>학교</span>
          <span style={{ textAlign: 'right', color: sortKey === 'pts' ? '#4FC3F7' : undefined }}>PTS</span>
          <span style={{ textAlign: 'right', color: sortKey === 'reb' ? '#4FC3F7' : undefined }}>REB</span>
          <span style={{ textAlign: 'right', color: sortKey === 'ast' ? '#4FC3F7' : undefined }}>AST</span>
        </div>

        {filtered.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'rgba(255,255,255,0.25)', fontSize: '13px' }}>
            데이터가 없습니다
          </div>
        ) : filtered.map((p, i) => (
          <div
            key={i}
            style={{
              display: 'grid', gridTemplateColumns: '48px 1fr 70px 1fr 56px 56px 56px',
              padding: '12px 16px', alignItems: 'center',
              borderBottom: i < filtered.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none',
              background: i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.01)',
            }}
          >
            <span style={{
              fontSize: '14px', fontWeight: 900,
              color: p.rank <= 3 ? '#F4A261' : p.rank <= 10 ? '#fff' : 'rgba(255,255,255,0.45)',
            }}>
              {p.rank}
            </span>

            <span style={{ fontSize: '14px', fontWeight: 700 }}>{p.name}</span>

            <div style={{ textAlign: 'center' }}><PosTag pos={p.position} /></div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              {p.schoolLogo && (
                <img src={p.schoolLogo} alt="" style={{ height: '20px', objectFit: 'contain', flexShrink: 0 }} />
              )}
              <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {p.school}
              </span>
            </div>

            {[p.pts, p.reb, p.ast].map((val, vi) => (
              <span key={vi} style={{
                textAlign: 'right', fontSize: '13px', fontWeight: 700,
                color: vi === ['pts','reb','ast'].indexOf(sortKey) ? '#4FC3F7' : 'rgba(255,255,255,0.7)',
              }}>
                {val.toFixed(1)}
              </span>
            ))}
          </div>
        ))}
      </div>
    </>
  )
}

function HsTable({ players, posFilter }) {
  const filtered = posFilter === 'ALL' ? players : players.filter(p => p.position === posFilter)

  if (filtered.length === 0) return (
    <div style={{ padding: '40px', textAlign: 'center', color: 'rgba(255,255,255,0.25)', fontSize: '13px' }}>
      데이터가 없습니다
    </div>
  )

  return (
    <div style={{
      background: 'rgba(255,255,255,0.03)', borderRadius: '16px',
      border: '1px solid rgba(255,255,255,0.06)', overflow: 'hidden',
    }}>
      {/* 헤더 */}
      <div style={{
        display: 'grid', gridTemplateColumns: '48px 1fr 70px 100px 1fr 1fr',
        padding: '11px 16px', borderBottom: '1px solid rgba(255,255,255,0.06)',
        fontSize: '11px', fontWeight: 700, color: 'rgba(255,255,255,0.3)',
        textTransform: 'uppercase', letterSpacing: '0.5px',
      }}>
        <span>#</span>
        <span>선수</span>
        <span style={{ textAlign: 'center' }}>포지션</span>
        <span style={{ textAlign: 'center' }}>등급</span>
        <span>출신지</span>
        <span>커밋 학교</span>
      </div>

      {filtered.map((p, i) => (
        <div
          key={i}
          style={{
            display: 'grid', gridTemplateColumns: '48px 1fr 70px 100px 1fr 1fr',
            padding: '12px 16px', alignItems: 'center',
            borderBottom: i < filtered.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none',
            background: i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.01)',
          }}
        >
          <span style={{
            fontSize: '14px', fontWeight: 900,
            color: p.rank <= 5 ? '#F4A261' : p.rank <= 20 ? '#fff' : 'rgba(255,255,255,0.45)',
          }}>
            {p.rank}
          </span>

          <span style={{ fontSize: '14px', fontWeight: 700 }}>{p.name}</span>

          <div style={{ textAlign: 'center' }}><PosTag pos={p.position} /></div>

          <div style={{ textAlign: 'center' }}>
            {p.stars > 0
              ? <Stars count={p.stars} />
              : <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.3)' }}>-</span>
            }
          </div>

          <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)' }}>{p.hometown}</span>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            {p.committedLogo && (
              <img src={p.committedLogo} alt="" style={{ height: '20px', objectFit: 'contain', flexShrink: 0 }} />
            )}
            <span style={{
              fontSize: '12px', fontWeight: p.committed ? 600 : 400,
              color: p.committed ? '#4ade80' : 'rgba(255,255,255,0.25)',
            }}>
              {p.committed ?? '미정'}
            </span>
          </div>
        </div>
      ))}
    </div>
  )
}

export default function AmateurRankings() {
  const [data, setData]       = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState(null)
  const [tab, setTab]         = useState('college')      // 'college' | 'hs'
  const [hsClass, setHsClass] = useState(null)           // 클래스 연도 (hs만)
  const [posFilter, setPosFilter] = useState('ALL')

  useEffect(() => {
    fetchAmateurRankings()
      .then(d => {
        setData(d)
        const classes = Object.keys(d.hs ?? {}).map(Number).sort((a, b) => b - a)
        if (classes.length > 0) setHsClass(classes[0])
      })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return (
    <div style={{ padding: '80px 24px', textAlign: 'center', color: 'rgba(255,255,255,0.3)' }}>
      <div style={{ fontSize: '36px', marginBottom: '12px' }}>🏫</div>
      <p style={{ fontSize: '14px' }}>랭킹 데이터 로딩 중...</p>
    </div>
  )

  if (error) return (
    <div style={{ padding: '80px 24px', textAlign: 'center', color: 'rgba(255,100,100,0.6)' }}>
      <p>데이터를 불러올 수 없습니다: {error}</p>
    </div>
  )

  const college     = data?.college ?? []
  const hsClasses   = Object.keys(data?.hs ?? {}).map(Number).sort((a, b) => b - a)
  const hsPlayers   = hsClass ? (data?.hs?.[hsClass] ?? []) : []

  const Tab = ({ id, label, count }) => (
    <button
      onClick={() => { setTab(id); setPosFilter('ALL') }}
      style={{
        padding: '9px 20px', border: 'none', cursor: 'pointer',
        borderRadius: '10px 10px 0 0', fontSize: '13px', fontWeight: 700,
        background: tab === id ? 'rgba(255,255,255,0.07)' : 'transparent',
        color: tab === id ? '#fff' : 'rgba(255,255,255,0.35)',
        borderBottom: tab === id ? '2px solid #F4A261' : '2px solid transparent',
        transition: 'all 0.15s',
      }}
    >
      {label}
      {count != null && (
        <span style={{ marginLeft: '6px', fontSize: '11px', color: 'rgba(255,255,255,0.3)' }}>
          {count}
        </span>
      )}
    </button>
  )

  return (
    <div style={{ padding: '0 24px 40px' }}>
      {/* 헤더 */}
      <div style={{ marginBottom: '20px' }}>
        <h2 style={{ fontSize: '17px', fontWeight: 800, color: '#fff', marginBottom: '4px' }}>
          아마추어 랭킹
        </h2>
        <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.28)' }}>
          대학 선수 시즌 스탯 · 고교 리크루팅 랭킹
        </p>
      </div>

      {/* 탭 */}
      <div style={{
        display: 'flex', gap: '2px', marginBottom: '20px',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
      }}>
        <Tab id="college" label="🎓 대학생" count={college.length} />
        <Tab id="hs"      label="🏫 고등학생" count={hsPlayers.length} />
      </div>

      {/* 포지션 필터 */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', flexWrap: 'wrap' }}>
        {POSITIONS.map(pos => (
          <button
            key={pos}
            onClick={() => setPosFilter(pos)}
            style={{
              padding: '5px 13px', borderRadius: '20px', fontSize: '12px', fontWeight: 700,
              border: 'none', cursor: 'pointer', transition: 'all 0.15s',
              background: posFilter === pos ? (POS_COLOR[pos] ?? '#F4A261') : 'rgba(255,255,255,0.07)',
              color: posFilter === pos ? '#000' : 'rgba(255,255,255,0.45)',
            }}
          >
            {pos}
          </button>
        ))}

        {/* 고교 클래스 선택 */}
        {tab === 'hs' && hsClasses.length > 1 && (
          <div style={{ marginLeft: 'auto', display: 'flex', gap: '6px' }}>
            {hsClasses.map(yr => (
              <button
                key={yr}
                onClick={() => setHsClass(yr)}
                style={{
                  padding: '5px 13px', borderRadius: '20px', fontSize: '12px', fontWeight: 700,
                  border: 'none', cursor: 'pointer', transition: 'all 0.15s',
                  background: hsClass === yr ? '#4ade80' : 'rgba(255,255,255,0.07)',
                  color: hsClass === yr ? '#000' : 'rgba(255,255,255,0.45)',
                }}
              >
                {yr}클래스
              </button>
            ))}
          </div>
        )}
      </div>

      {/* 콘텐츠 */}
      {tab === 'college' && (
        college.length === 0
          ? <div style={{ padding: '60px', textAlign: 'center', color: 'rgba(255,255,255,0.25)', fontSize: '13px' }}>
              대학 선수 데이터를 불러올 수 없습니다
            </div>
          : <CollegeTable players={college} posFilter={posFilter} />
      )}

      {tab === 'hs' && (
        hsPlayers.length === 0
          ? <div style={{ padding: '60px', textAlign: 'center', color: 'rgba(255,255,255,0.25)', fontSize: '13px' }}>
              고교 선수 데이터를 불러올 수 없습니다
            </div>
          : <HsTable players={hsPlayers} posFilter={posFilter} />
      )}
    </div>
  )
}
