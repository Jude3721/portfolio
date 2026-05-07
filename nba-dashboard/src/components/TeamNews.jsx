import { useState, useEffect } from 'react'
import { NBA_TEAMS, EAST_TEAMS, WEST_TEAMS } from '../data/nbaTeams'
import { fetchTeamNews } from '../services/nbaApi'

function timeAgo(pubDate) {
  if (!pubDate) return ''
  const diff = Date.now() - new Date(pubDate).getTime()
  const m = Math.floor(diff / 60_000)
  if (m < 60)  return `${m}분 전`
  const h = Math.floor(m / 60)
  if (h < 24)  return `${h}시간 전`
  return `${Math.floor(h / 24)}일 전`
}

function TeamPicker({ selected, onChange }) {
  const renderGroup = (tris, label, color) => (
    <div style={{ marginBottom: '10px' }}>
      <div style={{
        fontSize: '9px', fontWeight: 800, letterSpacing: '1px',
        color, marginBottom: '6px', paddingLeft: '2px',
      }}>
        {label}
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
        {tris.map(tri => {
          const team    = NBA_TEAMS[tri]
          const isSelected = tri === selected
          return (
            <button
              key={tri}
              onClick={() => onChange(tri)}
              title={team?.name}
              style={{
                display: 'flex', alignItems: 'center', gap: '5px',
                padding: '4px 10px 4px 6px',
                borderRadius: '20px', cursor: 'pointer', border: 'none',
                background: isSelected ? `${team?.color}33` : 'rgba(255,255,255,0.05)',
                outline: isSelected ? `1.5px solid ${team?.color}99` : '1.5px solid transparent',
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

function NewsCard({ item }) {
  return (
    <a
      href={item.link}
      target="_blank"
      rel="noopener noreferrer"
      style={{
        display: 'block', textDecoration: 'none',
        padding: '14px 16px',
        borderRadius: '14px',
        background: 'rgba(255,255,255,0.03)',
        border: '1px solid rgba(255,255,255,0.07)',
        transition: 'all 0.15s',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.background = 'rgba(255,255,255,0.06)'
        e.currentTarget.style.borderColor = 'rgba(255,255,255,0.13)'
        e.currentTarget.style.transform = 'translateY(-1px)'
      }}
      onMouseLeave={e => {
        e.currentTarget.style.background = 'rgba(255,255,255,0.03)'
        e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)'
        e.currentTarget.style.transform = 'translateY(0)'
      }}
    >
      <div style={{
        fontSize: '14px', fontWeight: 600, color: 'rgba(255,255,255,0.88)',
        lineHeight: 1.5, marginBottom: '8px',
      }}>
        {item.title}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
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
    </a>
  )
}

export default function TeamNews() {
  const [tri, setTri]         = useState('LAL')
  const [news, setNews]       = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState(null)

  useEffect(() => {
    setLoading(true)
    setError(null)
    setNews([])
    fetchTeamNews(tri)
      .then(items => setNews(items))
      .catch(err  => setError(err.message))
      .finally(() => setLoading(false))
  }, [tri])

  const team = NBA_TEAMS[tri]

  return (
    <section style={{ padding: '0 24px 48px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
        <h2 style={{ fontSize: '17px', fontWeight: 800, color: '#fff' }}>📰 팀 뉴스</h2>
        <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.25)' }}>Google News · 영문</span>
      </div>

      <TeamPicker selected={tri} onChange={setTri} />

      {/* 선택 팀 헤더 */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px',
      }}>
        <div style={{
          width: '36px', height: '36px', borderRadius: '50%',
          background: `${team?.color}22`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <img src={team?.logo} alt={tri}
            style={{ width: '26px', height: '26px', objectFit: 'contain' }}
            onError={e => e.target.style.display = 'none'}
          />
        </div>
        <div>
          <div style={{ fontSize: '15px', fontWeight: 800, color: '#fff' }}>{team?.name}</div>
          <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.3)', marginTop: '1px' }}>
            최근 뉴스 {news.length > 0 ? `${news.length}건` : ''}
          </div>
        </div>
      </div>

      {loading && (
        <div style={{ padding: '48px 0', textAlign: 'center', color: 'rgba(255,255,255,0.2)', fontSize: '13px' }}>
          뉴스 로딩 중...
        </div>
      )}

      {error && (
        <div style={{ padding: '32px 0', textAlign: 'center', color: 'rgba(255,100,100,0.6)', fontSize: '13px' }}>
          뉴스를 불러오지 못했습니다.
        </div>
      )}

      {!loading && !error && news.length === 0 && (
        <div style={{ padding: '48px 0', textAlign: 'center', color: 'rgba(255,255,255,0.2)', fontSize: '13px' }}>
          뉴스가 없습니다.
        </div>
      )}

      {!loading && news.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {news.map((item, i) => <NewsCard key={i} item={item} />)}
        </div>
      )}
    </section>
  )
}
