import { useState, useEffect, useCallback } from 'react'
import GameCard from './components/GameCard'
import StandingsTable from './components/StandingsTable'
import PlayoffBracket from './components/PlayoffBracket'
import TeamNews from './components/TeamNews'
import TradeNews from './components/TradeNews'
import UpcomingGames from './components/UpcomingGames'
import DraftProspects from './components/DraftProspects'
import { fetchTodayGames, fetchStandings } from './services/nbaApi'
import './App.css'

const TABS = [
  { id: 'games',     label: '🏀 오늘 경기' },
  { id: 'standings', label: '📊 순위' },
  { id: 'news',      label: '📰 팀 뉴스' },
  { id: 'trades',    label: '🔄 트레이드' },
  { id: 'draft',     label: '🎯 드래프트' },
]

const REFRESH_MS = 30_000

export default function App() {
  const [activeTab, setActiveTab]       = useState('games')
  const [games, setGames]               = useState([])
  const [standings, setStandings]       = useState([])
  const [lastUpdated, setLastUpdated]   = useState(new Date())
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [gamesSource, setGamesSource]   = useState('loading')

  const loadAll = useCallback(async (showRefresh = false) => {
    if (showRefresh) setIsRefreshing(true)
    try {
      const [g, s] = await Promise.all([fetchTodayGames(), fetchStandings()])
      if (g.length > 0) { setGames(g); setGamesSource('live') }
      if (s.length > 0) setStandings(s)
      setLastUpdated(new Date())
    } catch (err) {
      console.warn('데이터 로드 오류:', err.message)
      setGamesSource('error')
    } finally {
      if (showRefresh) setIsRefreshing(false)
    }
  }, [])

  useEffect(() => { loadAll() }, [loadAll])
  useEffect(() => {
    const id = setInterval(() => loadAll(), REFRESH_MS)
    return () => clearInterval(id)
  }, [loadAll])

  const now     = lastUpdated
  const timeStr = now.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
  const dateStr = `${now.getMonth() + 1}.${now.getDate()}`
  const hasLive = games.some(g => g.status === 'live')

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', color: '#fff' }}>
      {/* 헤더 */}
      <header style={{
        position: 'sticky', top: 0, zIndex: 100,
        background: 'rgba(10,10,20,0.92)', backdropFilter: 'blur(12px)',
        borderBottom: '1px solid rgba(255,255,255,0.07)',
        padding: '14px 24px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ fontSize: '22px', fontWeight: 900, letterSpacing: '-0.5px' }}>
            🏀 NBA
          </span>
          <span style={{ fontSize: '13px', color: 'rgba(255,255,255,0.35)' }}>Dashboard</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {hasLive && <span className="live-badge"><span className="live-dot" />LIVE</span>}
          <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.25)' }}>{dateStr} {timeStr}</span>
          <button
            onClick={() => loadAll(true)}
            disabled={isRefreshing}
            style={{
              padding: '5px 12px', borderRadius: '8px', fontSize: '12px', fontWeight: 600,
              border: '1px solid rgba(255,255,255,0.1)', cursor: isRefreshing ? 'not-allowed' : 'pointer',
              background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.5)',
              opacity: isRefreshing ? 0.5 : 1,
            }}
          >
            {isRefreshing ? '···' : '새로고침'}
          </button>
        </div>
      </header>

      {/* 탭 */}
      <nav style={{
        display: 'flex', gap: '4px', padding: '12px 24px 0',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        background: 'rgba(10,10,20,0.7)',
      }}>
        {TABS.map(t => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            style={{
              padding: '9px 18px', border: 'none', cursor: 'pointer',
              borderRadius: '10px 10px 0 0', fontSize: '13px', fontWeight: 700,
              background: activeTab === t.id ? 'rgba(255,255,255,0.07)' : 'transparent',
              color: activeTab === t.id ? '#fff' : 'rgba(255,255,255,0.35)',
              borderBottom: activeTab === t.id ? '2px solid #F4A261' : '2px solid transparent',
              transition: 'all 0.15s',
            }}
          >
            {t.label}
          </button>
        ))}
      </nav>

      {/* 콘텐츠 */}
      <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '24px 0' }}>
        {activeTab === 'games' && (
          <section style={{ padding: '0 24px 40px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
              <div>
                <h2 style={{ fontSize: '17px', fontWeight: 800, color: '#fff', marginBottom: '4px' }}>오늘 경기</h2>
                <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.28)' }}>
                  KST 기준 · 경기 클릭 시 박스스코어
                </p>
              </div>
              {gamesSource === 'live'
                ? <span className="live-badge" style={{ fontSize: '11px' }}><span className="live-dot" />실시간</span>
                : gamesSource === 'error'
                ? <span style={{ fontSize: '12px', color: 'rgba(255,100,100,0.7)' }}>연결 오류</span>
                : null
              }
            </div>

            {games.length === 0
              ? (
                <div style={{ padding: '60px 0', textAlign: 'center', color: 'rgba(255,255,255,0.25)' }}>
                  <p style={{ fontSize: '40px', marginBottom: '12px' }}>🏀</p>
                  <p style={{ fontSize: '16px', fontWeight: 600 }}>오늘 경기가 없습니다</p>
                </div>
              )
              : (
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                  gap: '16px',
                }}>
                  {games.map(g => <GameCard key={g.gameId} game={g} />)}
                </div>
              )
            }
          </section>
        )}

        {activeTab === 'games' && <UpcomingGames />}
        {activeTab === 'games' && <PlayoffBracket />}

        {activeTab === 'standings' && (
          <StandingsTable standings={standings} />
        )}

        {activeTab === 'news'   && <TeamNews />}
        {activeTab === 'trades' && <TradeNews />}
        {activeTab === 'draft'  && <DraftProspects />}
      </main>
    </div>
  )
}
