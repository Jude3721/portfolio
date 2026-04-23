import { useState, useEffect } from 'react'
import { KBO_TEAMS } from '../data/mockGames'
import { fetchTeamNews } from '../services/kboApi'

const TEAM_ORDER = ['LG', 'KT', '두산', 'SSG', 'NC', '삼성', '롯데', '한화', 'KIA', '키움']

function timeAgo(pubDate) {
  if (!pubDate) return ''
  const d = new Date(pubDate)
  if (isNaN(d)) return ''
  const diff = Date.now() - d.getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 60) return `${mins}분 전`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}시간 전`
  const days = Math.floor(hrs / 24)
  return `${days}일 전`
}

function NewsItem({ item, index }) {
  return (
    <a
      href={item.link}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-start gap-4 px-5 py-4 transition-colors duration-150 hover:opacity-80"
      style={{ borderBottom: '1px solid var(--border)', textDecoration: 'none' }}
    >
      <span
        className="text-xs font-bold tabular-nums shrink-0 mt-0.5 w-5 text-right"
        style={{ color: index < 3 ? 'var(--accent)' : 'var(--text)', opacity: index < 3 ? 1 : 0.5 }}
      >
        {index + 1}
      </span>
      <div className="flex-1 min-w-0 text-left">
        <p
          className="text-sm font-medium leading-snug mb-1.5 line-clamp-2"
          style={{ color: 'var(--text-h)' }}
        >
          {item.title}
        </p>
        {item.desc && (
          <p className="text-xs mb-1.5 line-clamp-2" style={{ color: 'var(--text)', opacity: 0.7 }}>
            {item.desc}
          </p>
        )}
        <div className="flex items-center gap-2">
          {item.source && (
            <span
              className="text-xs px-1.5 py-0.5 rounded"
              style={{ backgroundColor: 'var(--code-bg)', color: 'var(--text)' }}
            >
              {item.source}
            </span>
          )}
          <span className="text-xs" style={{ color: 'var(--text)', opacity: 0.6 }}>
            {timeAgo(item.pubDate)}
          </span>
        </div>
      </div>
      <svg
        className="shrink-0 mt-1 opacity-30"
        width="14"
        height="14"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
        <polyline points="15 3 21 3 21 9" />
        <line x1="10" y1="14" x2="21" y2="3" />
      </svg>
    </a>
  )
}

export default function NewsPage() {
  const [selectedTeam, setSelectedTeam] = useState('LG')
  const [news, setNews] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)
    setNews([])

    fetchTeamNews(selectedTeam)
      .then(data => { if (!cancelled) { setNews(data); setLoading(false) } })
      .catch(err => { if (!cancelled) { setError(err.message); setLoading(false) } })

    return () => { cancelled = true }
  }, [selectedTeam])

  const team = KBO_TEAMS[selectedTeam]

  return (
    <section className="w-full px-6 pb-10">
      {/* 섹션 제목 */}
      <div className="mb-6 text-left">
        <h2 className="text-xl font-bold mb-1" style={{ color: 'var(--text-h)' }}>
          구단별 인기 뉴스
        </h2>
        <p className="text-sm" style={{ color: 'var(--text)' }}>
          구단을 선택하면 최신 뉴스를 확인할 수 있습니다
        </p>
      </div>

      {/* 팀 선택 버튼 */}
      <div className="flex flex-wrap gap-2 mb-6">
        {TEAM_ORDER.map(key => {
          const t = KBO_TEAMS[key]
          const isActive = key === selectedTeam
          return (
            <button
              key={key}
              onClick={() => setSelectedTeam(key)}
              className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition-all duration-150"
              style={{
                backgroundColor: isActive ? t.color : 'var(--code-bg)',
                color: isActive ? t.textColor : 'var(--text-h)',
                border: isActive ? `2px solid ${t.color}` : '2px solid var(--border)',
                cursor: 'pointer',
              }}
            >
              <img
                src={t.logo}
                alt={t.short}
                className="w-5 h-5 object-contain"
                style={{ filter: isActive ? 'brightness(0) invert(1)' : 'none' }}
                onError={e => { e.target.style.display = 'none' }}
              />
              {t.short}
            </button>
          )
        })}
      </div>

      {/* 뉴스 카드 */}
      <div
        className="rounded-2xl overflow-hidden"
        style={{ border: '1px solid var(--border)', boxShadow: 'var(--shadow)' }}
      >
        {/* 카드 헤더 */}
        <div
          className="flex items-center gap-3 px-5 py-4"
          style={{
            backgroundColor: 'var(--code-bg)',
            borderBottom: '1px solid var(--border)',
          }}
        >
          <div
            className="w-7 h-7 rounded-full flex items-center justify-center shrink-0"
            style={{ backgroundColor: team.color }}
          >
            <img
              src={team.logo}
              alt={team.short}
              className="w-5 h-5 object-contain"
              style={{ filter: 'brightness(0) invert(1)' }}
              onError={e => { e.target.style.display = 'none' }}
            />
          </div>
          <span className="font-semibold text-sm" style={{ color: 'var(--text-h)' }}>
            {team.name} 뉴스
          </span>
          {!loading && news.length > 0 && (
            <span
              className="text-xs px-2 py-0.5 rounded-full ml-auto"
              style={{ backgroundColor: 'var(--accent-bg)', color: 'var(--accent)' }}
            >
              {news.length}건
            </span>
          )}
        </div>

        {/* 로딩 */}
        {loading && (
          <div className="py-16 flex flex-col items-center gap-3" style={{ color: 'var(--text)' }}>
            <svg
              width="24" height="24" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
              style={{ animation: 'spin 0.8s linear infinite', opacity: 0.4 }}
            >
              <path d="M21 2v6h-6" />
              <path d="M3 12a9 9 0 0 1 15-6.7L21 8" />
              <path d="M3 22v-6h6" />
              <path d="M21 12a9 9 0 0 1-15 6.7L3 16" />
            </svg>
            <span className="text-sm opacity-50">뉴스 불러오는 중...</span>
          </div>
        )}

        {/* 에러 */}
        {!loading && error && (
          <div className="py-16 text-center">
            <p className="text-sm opacity-50" style={{ color: 'var(--text)' }}>
              뉴스를 불러올 수 없습니다
            </p>
            <p className="text-xs opacity-30 mt-1" style={{ color: 'var(--text)' }}>{error}</p>
          </div>
        )}

        {/* 뉴스 목록 */}
        {!loading && !error && news.length === 0 && (
          <div className="py-16 text-center">
            <p className="text-sm opacity-50" style={{ color: 'var(--text)' }}>뉴스가 없습니다</p>
          </div>
        )}

        {!loading && !error && news.map((item, i) => (
          <NewsItem key={i} item={item} index={i} />
        ))}
      </div>
    </section>
  )
}
