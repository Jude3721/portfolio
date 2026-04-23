import { useState, useEffect, useCallback, useRef } from 'react'
import TodayGameList from './components/TodayGameList'
import StandingsTable from './components/StandingsTable'
import TeamStatsModal from './components/TeamStatsModal'
import NewsPage from './components/NewsPage'
import { mockGames, mockNextDayGames } from './data/mockGames'
import { mockStandings } from './data/mockStandings'
import { fetchTodayGamesWithLineup, fetchStandings, getDisplayDate } from './services/kboApi'

const NAV_TABS = [
  { id: 'games', label: '경기' },
  { id: 'news',  label: '뉴스' },
]

function App() {
  const [activeTab, setActiveTab]           = useState('games')
  const [selectedTeam, setSelectedTeam]     = useState(null)
  const [games, setGames]                   = useState(mockGames)
  const [standings, setStandings]           = useState(mockStandings)
  const [standingsSource, setStandingsSource] = useState('mock')
  const [lastUpdated, setLastUpdated]       = useState(new Date())
  const [isRefreshing, setIsRefreshing]     = useState(false)
  const [dataSource, setDataSource]         = useState('mock')
  const [countdown, setCountdown]           = useState(0)
  const intervalRef  = useRef(null)
  const countdownRef = useRef(null)

  const hasLiveGame = games.some((g) => g.status === 'live')
  const REFRESH_INTERVAL = hasLiveGame ? 30 : 60

  const startCountdown = useCallback((seconds) => {
    setCountdown(seconds)
    if (countdownRef.current) clearInterval(countdownRef.current)
    countdownRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) { clearInterval(countdownRef.current); return 0 }
        return prev - 1
      })
    }, 1000)
  }, [])

  const refresh = useCallback(async () => {
    setIsRefreshing(true)
    const { isNextDay } = getDisplayDate()
    const fallbackGames = isNextDay ? mockNextDayGames : mockGames
    try {
      const liveGames = await fetchTodayGamesWithLineup()
      const merged = liveGames.map((liveGame) => {
        const mock = fallbackGames.find(
          (m) => m.awayTeam === liveGame.awayTeam && m.homeTeam === liveGame.homeTeam
        )
        return { ...liveGame, lineup: liveGame.lineup ?? mock?.lineup ?? null, bases: liveGame.bases ?? mock?.bases ?? null }
      })
      setGames(merged)
      setDataSource('live')
    } catch (err) {
      console.warn('KBO API 오류, mock 데이터 사용:', err.message)
      setGames([...fallbackGames])
      setDataSource('mock')
    }
    try {
      const liveStandings = await fetchStandings()
      if (liveStandings.length > 0) { setStandings(liveStandings); setStandingsSource('live') }
      else { setStandings(mockStandings); setStandingsSource('mock') }
    } catch (err) {
      console.warn('순위 API 오류, mock 사용:', err.message)
      setStandings(mockStandings)
      setStandingsSource('mock')
    }
    setLastUpdated(new Date())
    setIsRefreshing(false)
  }, [])

  useEffect(() => { refresh() }, []) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const scheduleSwitch = () => {
      const now = new Date()
      const target = new Date(now)
      target.setHours(22, 0, 0, 0)
      if (now >= target) target.setDate(target.getDate() + 1)
      const t = setTimeout(() => { refresh(); scheduleSwitch() }, target - now)
      return t
    }
    const t = scheduleSwitch()
    return () => clearTimeout(t)
  }, [refresh])

  useEffect(() => {
    if (intervalRef.current) clearInterval(intervalRef.current)
    startCountdown(REFRESH_INTERVAL)
    intervalRef.current = setInterval(() => { refresh(); startCountdown(REFRESH_INTERVAL) }, REFRESH_INTERVAL * 1000)
    return () => { clearInterval(intervalRef.current); if (countdownRef.current) clearInterval(countdownRef.current) }
  }, [REFRESH_INTERVAL, refresh, startCountdown])

  const handleManualRefresh = useCallback(() => {
    refresh()
    startCountdown(REFRESH_INTERVAL)
    if (intervalRef.current) clearInterval(intervalRef.current)
    intervalRef.current = setInterval(() => { refresh(); startCountdown(REFRESH_INTERVAL) }, REFRESH_INTERVAL * 1000)
  }, [refresh, startCountdown, REFRESH_INTERVAL])

  const { isNextDay, year, month, day } = getDisplayDate()
  const dateLabel = isNextDay ? '내일 경기' : '오늘 경기'
  const dateStr   = `${year}.${month}.${day}`
  const timeStr   = lastUpdated.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })

  return (
    <main>
      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>

      {/* ── 헤더 ── */}
      <header
        className="px-6 py-4 border-b"
        style={{ borderColor: 'var(--border)' }}
      >
        {/* 상단 행: 로고 + 날짜 배지 + 새로고침 컨트롤 */}
        <div className="flex items-center gap-2 mb-3">
          <span className="text-2xl">⚾</span>
          <h1 className="text-lg font-bold m-0" style={{ color: 'var(--text-h)', fontSize: '1.125rem' }}>
            KBO 대시보드
          </h1>
          <span
            className="text-xs px-2 py-0.5 rounded-full font-medium"
            style={{
              backgroundColor: isNextDay ? 'rgba(99,102,241,0.15)' : 'rgba(34,197,94,0.12)',
              color: isNextDay ? '#818cf8' : '#4ade80',
            }}
          >
            {dateLabel} {dateStr}
          </span>

          <div className="ml-auto flex items-center gap-3">
            {dataSource === 'live' ? (
              <span className="text-xs font-semibold text-green-500">● 실시간</span>
            ) : (
              <span className="text-xs opacity-40" style={{ color: 'var(--text)' }}>목업 데이터</span>
            )}
            {hasLiveGame && (
              <span className="text-xs font-medium" style={{ color: 'var(--text)', opacity: 0.6 }}>
                {countdown}초 후 업데이트
              </span>
            )}
            <span className="text-xs tabular-nums" style={{ color: 'var(--text)' }}>
              업데이트 {timeStr}
            </span>
            <button
              onClick={handleManualRefresh}
              disabled={isRefreshing}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-opacity duration-150"
              style={{
                backgroundColor: 'var(--code-bg)',
                border: '1px solid var(--border)',
                color: 'var(--text-h)',
                opacity: isRefreshing ? 0.5 : 1,
                cursor: isRefreshing ? 'not-allowed' : 'pointer',
              }}
            >
              <svg
                width="12" height="12" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
                style={{ animation: isRefreshing ? 'spin 0.8s linear infinite' : 'none' }}
              >
                <path d="M21 2v6h-6" />
                <path d="M3 12a9 9 0 0 1 15-6.7L21 8" />
                <path d="M3 22v-6h6" />
                <path d="M21 12a9 9 0 0 1-15 6.7L3 16" />
              </svg>
              새로고침
            </button>
          </div>
        </div>

        {/* 하단 행: 네비게이션 탭 */}
        <nav className="flex items-center gap-1">
          {NAV_TABS.map(tab => {
            const isActive = activeTab === tab.id
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className="px-4 py-1.5 rounded-lg text-sm font-medium transition-all duration-150"
                style={{
                  backgroundColor: isActive ? 'var(--accent-bg)' : 'transparent',
                  color: isActive ? 'var(--accent)' : 'var(--text)',
                  border: isActive ? '1px solid var(--accent-border)' : '1px solid transparent',
                  cursor: 'pointer',
                }}
              >
                {tab.label}
              </button>
            )
          })}
        </nav>
      </header>

      {/* ── 페이지 콘텐츠 ── */}
      {activeTab === 'games' && (
        <>
          <TodayGameList games={games} standings={standings} />
          <StandingsTable standings={standings} onTeamClick={setSelectedTeam} dataSource={standingsSource} />
        </>
      )}

      {activeTab === 'news' && <NewsPage />}

      {selectedTeam && (
        <TeamStatsModal teamKey={selectedTeam} onClose={() => setSelectedTeam(null)} />
      )}
    </main>
  )
}

export default App
