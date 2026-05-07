import { useState, useEffect } from 'react'
import { NBA_TEAMS, EAST_TEAMS, WEST_TEAMS } from '../data/nbaTeams'
import { fetchTradeNews, fetchTeamTrades } from '../services/nbaApi'

const CATEGORIES = [
  { id: 'all',    label: '전체',    color: '#94a3b8' },
  { id: 'rumors', label: '루머',    color: '#fbbf24' },
  { id: 'done',   label: '완료 딜', color: '#4ade80' },
  { id: 'team',   label: '팀별',    color: '#818cf8' },
]

function timeAgo(pubDate) {
  if (!pubDate) return ''
  const diff = Date.now() - new Date(pubDate).getTime()
  const m = Math.floor(diff / 60_000)
  if (m < 60)  return `${m}분 전`
  const h = Math.floor(m / 60)
  if (h < 24)  return `${h}시간 전`
  return `${Math.floor(h / 24)}일 전`
}

function CategoryTabs({ active, onChange }) {
  return (
    <div style={{ display: 'flex', gap: '6px', marginBottom: '20px', flexWrap: 'wrap' }}>
      {CATEGORIES.map(cat => {
        const isActive = cat.id === active
        return (
          <button
            key={cat.id}
            onClick={() => onChange(cat.id)}
            style={{
              padding: '7px 16px', borderRadius: '20px', cursor: 'pointer',
              border: 'none', fontSize: '13px', fontWeight: 700,
              background: isActive ? `${cat.color}22` : 'rgba(255,255,255,0.05)',
              color:      isActive ? cat.color : 'rgba(255,255,255,0.35)',
              outline:    isActive ? `1.5px solid ${cat.color}66` : '1.5px solid transparent',
              transition: 'all 0.15s',
            }}
            onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = 'rgba(255,255,255,0.09)' }}
            onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = 'rgba(255,255,255,0.05)' }}
          >
            {cat.label}
          </button>
        )
      })}
    </div>
  )
}

function TeamPicker({ selected, onChange }) {
  const renderGroup = (tris, label, color) => (
    <div style={{ marginBottom: '10px' }}>
      <div style={{ fontSize: '9px', fontWeight: 800, letterSpacing: '1px', color, marginBottom: '6px', paddingLeft: '2px' }}>
        {label}
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
        {tris.map(tri => {
          const team       = NBA_TEAMS[tri]
          const isSelected = tri === selected
          return (
            <button
              key={tri}
              onClick={() => onChange(tri)}
              title={team?.name}
              style={{
                display: 'flex', alignItems: 'center', gap: '5px',
                padding: '4px 10px 4px 6px', borderRadius: '20px',
                cursor: 'pointer', border: 'none',
                background: isSelected ? `${team?.color}33` : 'rgba(255,255,255,0.05)',
                outline:    isSelected ? `1.5px solid ${team?.color}99` : '1.5px solid transparent',
                transition: 'all 0.15s',
              }}
              onMouseEnter={e => { if (!isSelected) e.currentTarget.style.background = 'rgba(255,255,255,0.09)' }}
              onMouseLeave={e => { if (!isSelected) e.currentTarget.style.background = 'rgba(255,255,255,0.05)' }}
            >
              <img src={team?.logo} alt={tri}
                style={{ width: '18px', height: '18px', objectFit: 'contain' }}
                onError={e => e.target.style.display = 'none'}
              />
              <span style={{
                fontSize: '11px', fontWeight: isSelected ? 800 : 600,
                color: isSelected ? '#fff' : 'rgba(255,255,255,0.45)',
                letterSpacing: '0.3px',
              }}>{tri}</span>
            </button>
          )
        })}
      </div>
    </div>
  )

  return (
    <div style={{
      background: 'rgba(255,255,255,0.03)',
      border: '1px solid rgba(255,255,255,0.07)',
      borderRadius: '16px', padding: '14px 16px', marginBottom: '20px',
    }}>
      {renderGroup(EAST_TEAMS, 'EASTERN CONFERENCE', '#4FC3F7')}
      {renderGroup(WEST_TEAMS, 'WESTERN CONFERENCE', '#FF8A65')}
    </div>
  )
}

function NewsCard({ item, accentColor }) {
  return (
    <a
      href={item.link}
      target="_blank"
      rel="noopener noreferrer"
      style={{
        display: 'flex', gap: '12px', textDecoration: 'none',
        padding: '14px 16px', borderRadius: '14px',
        background: 'rgba(255,255,255,0.03)',
        border: '1px solid rgba(255,255,255,0.07)',
        borderLeft: `3px solid ${accentColor}55`,
        transition: 'all 0.15s',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.background    = 'rgba(255,255,255,0.06)'
        e.currentTarget.style.borderColor   = `rgba(255,255,255,0.13)`
        e.currentTarget.style.transform     = 'translateY(-1px)'
      }}
      onMouseLeave={e => {
        e.currentTarget.style.background    = 'rgba(255,255,255,0.03)'
        e.currentTarget.style.borderColor   = 'rgba(255,255,255,0.07)'
        e.currentTarget.style.transform     = 'translateY(0)'
      }}
    >
      <div style={{
        width: '3px', flexShrink: 0, borderRadius: '2px',
        background: `${accentColor}44`, alignSelf: 'stretch',
        display: 'none',
      }} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontSize: '14px', fontWeight: 600, color: 'rgba(255,255,255,0.88)',
          lineHeight: 1.5, marginBottom: '8px',
        }}>
          {item.title}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          {item.source && (
            <span style={{
              fontSize: '11px', fontWeight: 700,
              color: 'rgba(255,255,255,0.35)',
              background: 'rgba(255,255,255,0.06)',
              padding: '2px 7px', borderRadius: '6px',
            }}>
              {item.source}
            </span>
          )}
          <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.22)' }}>
            {timeAgo(item.pubDate)}
          </span>
        </div>
      </div>
    </a>
  )
}

export default function TradeNews() {
  const [category, setCategory] = useState('all')
  const [selectedTri, setSelectedTri] = useState('LAL')
  const [news, setNews]         = useState([])
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState(null)

  const activeColor = CATEGORIES.find(c => c.id === category)?.color ?? '#94a3b8'

  useEffect(() => {
    setLoading(true)
    setError(null)
    setNews([])

    const req = category === 'team'
      ? fetchTeamTrades(selectedTri)
      : fetchTradeNews(category)

    req
      .then(items => setNews(items))
      .catch(err  => setError(err.message))
      .finally(() => setLoading(false))
  }, [category, selectedTri])

  const team = NBA_TEAMS[selectedTri]

  return (
    <section style={{ padding: '0 24px 48px' }}>
      {/* 헤더 */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
        <h2 style={{ fontSize: '17px', fontWeight: 800, color: '#fff' }}>🔄 트레이드 & 루머</h2>
        <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.25)' }}>Google News · 한글 번역</span>
      </div>

      {/* 카테고리 탭 */}
      <CategoryTabs active={category} onChange={setCategory} />

      {/* 팀 선택기 (팀별 모드) */}
      {category === 'team' && (
        <>
          <TeamPicker selected={selectedTri} onChange={setSelectedTri} />
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
            <div style={{
              width: '36px', height: '36px', borderRadius: '50%',
              background: `${team?.color}22`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <img src={team?.logo} alt={selectedTri}
                style={{ width: '26px', height: '26px', objectFit: 'contain' }}
                onError={e => e.target.style.display = 'none'}
              />
            </div>
            <div>
              <div style={{ fontSize: '15px', fontWeight: 800, color: '#fff' }}>{team?.name}</div>
              <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.3)', marginTop: '1px' }}>
                트레이드 루머 {news.length > 0 ? `${news.length}건` : ''}
              </div>
            </div>
          </div>
        </>
      )}

      {/* 카테고리 설명 (팀별 아닐 때) */}
      {category !== 'team' && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px',
          padding: '8px 12px', borderRadius: '10px',
          background: `${activeColor}0d`, border: `1px solid ${activeColor}22`,
        }}>
          <span style={{ fontSize: '12px', color: activeColor, fontWeight: 600 }}>
            {{
              all:    '전체 NBA 트레이드 뉴스',
              rumors: '트레이드 루머 및 관측',
              done:   '성사된 트레이드 딜',
            }[category]}
          </span>
          {news.length > 0 && (
            <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.25)', marginLeft: 'auto' }}>
              {news.length}건
            </span>
          )}
        </div>
      )}

      {/* 상태 */}
      {loading && (
        <div style={{ padding: '48px 0', textAlign: 'center', color: 'rgba(255,255,255,0.2)', fontSize: '13px' }}>
          불러오는 중...
        </div>
      )}
      {error && (
        <div style={{ padding: '32px 0', textAlign: 'center', color: 'rgba(255,100,100,0.6)', fontSize: '13px' }}>
          데이터를 불러오지 못했습니다.
        </div>
      )}
      {!loading && !error && news.length === 0 && (
        <div style={{ padding: '48px 0', textAlign: 'center', color: 'rgba(255,255,255,0.2)', fontSize: '13px' }}>
          관련 뉴스가 없습니다.
        </div>
      )}

      {/* 뉴스 목록 */}
      {!loading && news.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {news.map((item, i) => (
            <NewsCard key={i} item={item} accentColor={activeColor} />
          ))}
        </div>
      )}
    </section>
  )
}
