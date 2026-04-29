import { useState, useEffect, useCallback } from 'react'
import { KBO_TEAMS } from '../data/mockGames'
import { fetchTeamNews } from '../services/kboApi'

const TEAM_ORDER = ['LG', 'KT', '두산', 'SSG', 'NC', '삼성', '롯데', '한화', 'KIA', '키움']

const N = {
  raised: '6px 6px 16px var(--neu-sd), -4px -4px 10px var(--neu-sl)',
  subtle: '3px 3px 8px var(--neu-sd), -2px -2px 5px var(--neu-sl)',
  btn:    '4px 4px 10px var(--neu-sd), -3px -3px 7px var(--neu-sl)',
  btnActive: 'inset 2px 2px 6px var(--neu-sd), inset -1px -1px 4px var(--neu-sl)',
}

function NewsCard({ article, teamColor }) {
  return (
    <a
      href={article.link}
      target="_blank"
      rel="noreferrer"
      style={{
        display: 'flex', flexDirection: 'column', gap: '10px',
        padding: '18px 20px', borderRadius: '18px', textDecoration: 'none',
        background: 'var(--neu-bg)', boxShadow: N.raised,
        transition: 'transform 0.15s, box-shadow 0.15s',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.transform = 'translateY(-2px)'
        e.currentTarget.style.boxShadow = '8px 8px 20px var(--neu-sd), -5px -5px 14px var(--neu-sl)'
      }}
      onMouseLeave={e => {
        e.currentTarget.style.transform = 'translateY(0)'
        e.currentTarget.style.boxShadow = N.raised
      }}
    >
      {/* 상단: 날짜 + 링크 아이콘 */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: '11px', color: 'rgba(var(--fg-rgb),0.28)', fontVariantNumeric: 'tabular-nums' }}>
          {formatDate(article.pubDate)}
        </span>
        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
          strokeLinecap="round" strokeLinejoin="round" style={{ color: 'rgba(var(--fg-rgb),0.18)', flexShrink: 0 }}>
          <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
          <polyline points="15 3 21 3 21 9"/>
          <line x1="10" y1="14" x2="21" y2="3"/>
        </svg>
      </div>

      {/* 제목 */}
      <p style={{
        fontSize: '14px', fontWeight: 700, lineHeight: 1.5,
        color: 'rgba(var(--fg-rgb),0.85)', flex: 1,
        display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden',
      }}>
        {article.title}
      </p>

      {/* 요약 */}
      {article.desc && (
        <p style={{
          fontSize: '12px', color: 'rgba(var(--fg-rgb),0.38)', lineHeight: 1.55,
          display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
        }}>
          {article.desc}
        </p>
      )}

      {/* 하단 구단색 바 */}
      <div style={{ height: '2px', borderRadius: '99px', background: `${teamColor}55`, marginTop: '2px' }} />
    </a>
  )
}

function formatDate(str) {
  if (!str) return ''
  const d = new Date(str)
  if (isNaN(d)) return str
  const now = new Date()
  const diffMs = now - d
  const diffMin = Math.floor(diffMs / 60000)
  if (diffMin < 60)  return `${diffMin}분 전`
  const diffHr = Math.floor(diffMin / 60)
  if (diffHr < 24)   return `${diffHr}시간 전`
  const diffDay = Math.floor(diffHr / 24)
  if (diffDay < 7)   return `${diffDay}일 전`
  return `${d.getMonth() + 1}.${d.getDate()}`
}

const PAGE_SIZE = 16

export default function NewsPage() {
  const [selectedTeam, setSelectedTeam] = useState('LG')
  const [articles, setArticles]         = useState([])
  const [total, setTotal]               = useState(0)
  const [page, setPage]                 = useState(1)
  const [loading, setLoading]           = useState(false)
  const [dataSource, setDataSource]     = useState('live')

  const loadNews = useCallback(async (teamKey, p) => {
    setLoading(true)
    setArticles([])
    try {
      const { news, total: t } = await fetchTeamNews(teamKey, p)
      setArticles(news)
      setTotal(t)
      setDataSource('live')
    } catch (err) {
      console.warn('[NewsPage]:', err.message)
      setDataSource('error')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { loadNews(selectedTeam, page) }, [selectedTeam, page, loadNews])

  const totalPages = Math.max(1, Math.ceil(Math.min(total, 1000) / PAGE_SIZE))

  const handleTeamChange = (key) => {
    setSelectedTeam(key)
    setPage(1)
  }

  const handlePage = (p) => {
    setPage(p)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const team = KBO_TEAMS[selectedTeam]

  return (
    <section style={{ width: '100%', padding: '28px 24px 40px' }}>
      {/* 헤더 */}
      <div style={{ marginBottom: '20px', textAlign: 'left', display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
        <div>
          <h2 style={{ fontSize: '20px', fontWeight: 800, color: 'rgba(var(--fg-rgb),0.88)', letterSpacing: '-0.3px', marginBottom: '4px' }}>
            구단별 뉴스
          </h2>
          <p style={{ fontSize: '13px', color: 'rgba(var(--fg-rgb),0.32)' }}>
            구단을 선택하면 최신 뉴스를 확인할 수 있습니다
          </p>
        </div>
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '8px' }}>
          {!loading && articles.length > 0 && (
            <span style={{ fontSize: '12px', color: 'rgba(var(--fg-rgb),0.3)' }}>{articles.length}건</span>
          )}
          {dataSource === 'live'
            ? <span className="live-badge" style={{ fontSize: '11px' }}><span className="live-dot" />실시간</span>
            : <span style={{ fontSize: '12px', color: 'rgba(255,100,100,0.7)' }}>연결 오류</span>
          }
          <button
            onClick={() => loadNews(selectedTeam, page)}
            style={{
              padding: '5px 12px', borderRadius: '10px', fontSize: '12px', fontWeight: 600,
              border: 'none', cursor: 'pointer', background: 'var(--neu-bg)',
              boxShadow: N.btn, color: 'rgba(var(--fg-rgb),0.55)',
            }}
          >
            새로고침
          </button>
        </div>
      </div>

      {/* 팀 선택 버튼 */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginBottom: '24px' }}>
        {TEAM_ORDER.map(key => {
          const t = KBO_TEAMS[key]
          const isActive = key === selectedTeam
          return (
            <button
              key={key}
              onClick={() => handleTeamChange(key)}
              style={{
                display: 'flex', alignItems: 'center', gap: '7px',
                padding: '8px 16px', borderRadius: '14px', fontSize: '13px', fontWeight: 700, cursor: 'pointer',
                background: 'var(--neu-bg)',
                boxShadow: isActive ? N.btnActive : N.btn,
                border: isActive ? `1.5px solid ${t.color}66` : '1.5px solid transparent',
                color: isActive ? t.color : 'rgba(var(--fg-rgb),0.55)',
                transition: 'all 0.2s',
              }}
            >
              <div style={{ width: '20px', height: '20px', borderRadius: '50%', flexShrink: 0 }}>
                <img src={t.logo} alt={t.short} style={{ width: '100%', height: '100%' }} onError={e => e.target.style.display = 'none'} />
              </div>
              {t.short}
            </button>
          )
        })}
      </div>

      {/* 섹션 헤더 */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
        <div style={{
          width: '28px', height: '28px', borderRadius: '50%', background: 'var(--neu-bg)',
          boxShadow: N.subtle, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
        }}>
          <img src={team.logo} alt={team.short} style={{ width: '100%', height: '100%', borderRadius: '50%' }} onError={e => e.target.style.display = 'none'} />
        </div>
        <div style={{ width: '3px', height: '18px', borderRadius: '99px', background: team.color }} />
        <span style={{ fontSize: '15px', fontWeight: 700, color: 'rgba(var(--fg-rgb),0.8)' }}>
          {team.name} 최신 뉴스
        </span>
      </div>

      {loading && (
        <div style={{ padding: '56px 0', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', color: 'rgba(var(--fg-rgb),0.3)' }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
            style={{ animation: 'spin 0.8s linear infinite' }}>
            <path d="M21 2v6h-6"/><path d="M3 12a9 9 0 0 1 15-6.7L21 8"/>
            <path d="M3 22v-6h6"/><path d="M21 12a9 9 0 0 1-15 6.7L3 16"/>
          </svg>
          <span style={{ fontSize: '14px' }}>뉴스 조회 중...</span>
        </div>
      )}

      {!loading && articles.length === 0 && (
        <div style={{ padding: '56px 0', textAlign: 'center' }}>
          <p style={{ fontSize: '36px', marginBottom: '10px' }}>📰</p>
          <p style={{ fontSize: '15px', fontWeight: 600, color: 'rgba(var(--fg-rgb),0.65)', marginBottom: '4px' }}>
            뉴스가 없습니다
          </p>
          <p style={{ fontSize: '13px', color: 'rgba(var(--fg-rgb),0.28)' }}>
            {dataSource === 'error' ? '데이터를 불러올 수 없습니다' : '최신 뉴스가 없습니다'}
          </p>
        </div>
      )}

      {!loading && articles.length > 0 && (
        <>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: '16px',
          }}>
            {articles.map((article, i) => (
              <NewsCard
                key={`${article.link ?? ''}-${i}`}
                article={article}
                teamColor={team.color}
              />
            ))}
          </div>

          {/* 페이지네이션 */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginTop: '28px', flexWrap: 'wrap' }}>
            {/* 이전 */}
            <button
              onClick={() => handlePage(page - 1)}
              disabled={page === 1}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                width: '34px', height: '34px', borderRadius: '10px', border: 'none', cursor: page === 1 ? 'not-allowed' : 'pointer',
                background: 'var(--neu-bg)',
                boxShadow: page === 1 ? N.btnActive : N.btn,
                color: page === 1 ? 'rgba(var(--fg-rgb),0.2)' : 'rgba(var(--fg-rgb),0.6)',
                transition: 'all 0.15s',
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="15 18 9 12 15 6"/>
              </svg>
            </button>

            {/* 페이지 번호 */}
            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter(p => p === 1 || p === totalPages || Math.abs(p - page) <= 2)
              .reduce((acc, p, idx, arr) => {
                if (idx > 0 && p - arr[idx - 1] > 1) acc.push('...')
                acc.push(p)
                return acc
              }, [])
              .map((p, i) => p === '...' ? (
                <span key={`dot-${i}`} style={{ fontSize: '13px', color: 'rgba(var(--fg-rgb),0.25)', padding: '0 4px' }}>···</span>
              ) : (
                <button
                  key={p}
                  onClick={() => handlePage(p)}
                  style={{
                    width: '34px', height: '34px', borderRadius: '10px', border: 'none', cursor: p === page ? 'default' : 'pointer',
                    background: 'var(--neu-bg)',
                    boxShadow: p === page ? N.btnActive : N.btn,
                    color: p === page ? team.color : 'rgba(var(--fg-rgb),0.5)',
                    fontSize: '13px', fontWeight: p === page ? 800 : 600,
                    transition: 'all 0.15s',
                  }}
                >
                  {p}
                </button>
              ))
            }

            {/* 다음 */}
            <button
              onClick={() => handlePage(page + 1)}
              disabled={page === totalPages}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                width: '34px', height: '34px', borderRadius: '10px', border: 'none', cursor: page === totalPages ? 'not-allowed' : 'pointer',
                background: 'var(--neu-bg)',
                boxShadow: page === totalPages ? N.btnActive : N.btn,
                color: page === totalPages ? 'rgba(var(--fg-rgb),0.2)' : 'rgba(var(--fg-rgb),0.6)',
                transition: 'all 0.15s',
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="9 18 15 12 9 6"/>
              </svg>
            </button>

            {/* 현재 위치 텍스트 */}
            <span style={{ fontSize: '12px', color: 'rgba(var(--fg-rgb),0.28)', marginLeft: '4px' }}>
              {page} / {totalPages} 페이지 ({total.toLocaleString()}건)
            </span>
          </div>
        </>
      )}
    </section>
  )
}
