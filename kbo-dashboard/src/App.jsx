import { useState, useEffect, useCallback, useRef } from 'react'
import TodayGameList from './components/TodayGameList'
import StandingsTable from './components/StandingsTable'
import TeamStatsModal from './components/TeamStatsModal'
import UpcomingSchedule from './components/UpcomingSchedule'
import InjuryPage from './components/InjuryPage'
import MovesPage from './components/MovesPage'
import NewsPage from './components/NewsPage'
import ThemePicker from './components/ThemePicker'
import WishTeamModal from './components/WishTeamModal'
import ChatRoom from './components/ChatRoom'
import { KBO_TEAMS } from './data/kboTeams'
import { mockGames, mockNextDayGames } from './data/mockGames'
import { mockStandings } from './data/mockStandings'
import { fetchTodayGamesWithLineup, fetchStandings, getDisplayDate } from './services/kboApi'

const NAV_TABS = [
  { id: 'games',  label: '⚾ 경기' },
  { id: 'injury', label: '🩹 부상리포트' },
  { id: 'moves',  label: '🔄 로스터 무브' },
  { id: 'news',   label: '📰 구단 뉴스' },
]

const N = {
  raised: '6px 6px 16px var(--neu-sd), -4px -4px 10px var(--neu-sl)',
  inset:  'inset 2px 2px 6px var(--neu-sd), inset -1px -1px 4px var(--neu-sl)',
  btn:    '4px 4px 10px var(--neu-sd), -3px -3px 7px var(--neu-sl)',
}

function App() {
  const [activeTab, setActiveTab]             = useState('games')
  const [selectedTeam, setSelectedTeam]       = useState(null)
  const [games, setGames]                     = useState(mockGames)
  const [standings, setStandings]             = useState(mockStandings)
  const [prevStandings, setPrevStandings]     = useState(null)
  const [standingsSource, setStandingsSource] = useState('mock')
  const [lastUpdated, setLastUpdated]         = useState(new Date())
  const [isRefreshing, setIsRefreshing]       = useState(false)
  const [dataSource, setDataSource]           = useState('mock')
  const [countdown, setCountdown]             = useState(0)
  const intervalRef  = useRef(null)
  const countdownRef = useRef(null)
  const [wishTeam, setWishTeam]         = useState(() => localStorage.getItem('kbo_wish_team') || null)
  const [showWishModal, setShowWishModal] = useState(false)

  const handleWishSelect = team => {
    if (team) localStorage.setItem('kbo_wish_team', team)
    else localStorage.removeItem('kbo_wish_team')
    setWishTeam(team)
  }

  const hasLiveGame      = games.some((g) => g.status === 'live')
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
      const { standings: liveStandings, prevStandings: livePrev } = await fetchStandings()
      if (liveStandings.length > 0) {
        setStandings(liveStandings)
        setStandingsSource('live')
        if (livePrev) setPrevStandings(livePrev)
      } else {
        setStandings(mockStandings)
        setStandingsSource('mock')
      }
    } catch (err) {
      console.warn('순위 API 오류, mock 사용:', err.message)
      setStandings(mockStandings)
    }
    setLastUpdated(new Date())
    setIsRefreshing(false)
  }, [])

  useEffect(() => { refresh() }, []) // eslint-disable-line

  useEffect(() => {
    const scheduleSwitch = () => {
      const now = new Date(); const target = new Date(now)
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
    refresh(); startCountdown(REFRESH_INTERVAL)
    if (intervalRef.current) clearInterval(intervalRef.current)
    intervalRef.current = setInterval(() => { refresh(); startCountdown(REFRESH_INTERVAL) }, REFRESH_INTERVAL * 1000)
  }, [refresh, startCountdown, REFRESH_INTERVAL])

  const { isNextDay, year, month, day } = getDisplayDate()
  const dateStr = `${year}.${month}.${day}`
  const timeStr = lastUpdated.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })

  return (
    <>
    {showWishModal && (
      <WishTeamModal
        wishTeam={wishTeam}
        onSelect={handleWishSelect}
        onClose={() => setShowWishModal(false)}
      />
    )}
    <ChatRoom wishTeam={wishTeam} />
    <main>
      {/* ── 헤더 (NBA 스타일) ── */}
      <header style={{
        position: 'sticky', top: 0, zIndex: 100,
        background: 'rgba(10,10,20,0.94)', backdropFilter: 'blur(12px)',
        borderBottom: '1px solid rgba(255,255,255,0.07)',
        padding: '14px 24px',
      }}>
        {/* 상단 행 */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
          {/* 좌측: 로고 + 날짜 */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '22px', fontWeight: 900, letterSpacing: '-0.5px', color: '#fff' }}>
              ⚾ KBO
            </span>
            <span style={{ fontSize: '13px', color: 'rgba(255,255,255,0.35)' }}>Dashboard</span>
            <span style={{
              fontSize: '12px', fontWeight: 700, padding: '2px 9px', borderRadius: '99px',
              background: isNextDay ? 'rgba(165,180,252,0.15)' : 'rgba(74,222,128,0.12)',
              border: `1px solid ${isNextDay ? 'rgba(165,180,252,0.3)' : 'rgba(74,222,128,0.3)'}`,
              color: isNextDay ? '#a5b4fc' : '#4ade80',
            }}>
              {isNextDay ? '내일' : '오늘'} {dateStr}
            </span>
          </div>

          {/* 우측: 컨트롤 */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            {/* 실시간 / 카운트다운 */}
            {dataSource === 'live'
              ? <span className="live-badge"><span className="live-dot" />실시간</span>
              : null
            }
            {hasLiveGame && countdown > 0 && (
              <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.25)', fontVariantNumeric: 'tabular-nums' }}>
                {countdown}s
              </span>
            )}
            <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.25)' }}>{timeStr}</span>

            {/* 위시팀 버튼 */}
            <button
              onClick={() => setShowWishModal(true)}
              title="응원 팀 선택"
              style={{
                display: 'flex', alignItems: 'center', gap: '6px',
                padding: '5px 10px', borderRadius: '8px', border: 'none', cursor: 'pointer',
                background: wishTeam ? `${KBO_TEAMS[wishTeam]?.color}25` : 'rgba(255,255,255,0.06)',
                outline: wishTeam ? `1px solid ${KBO_TEAMS[wishTeam]?.color}60` : '1px solid rgba(255,255,255,0.1)',
                color: wishTeam ? '#fff' : 'rgba(255,255,255,0.5)',
                fontSize: '12px', fontWeight: 700, transition: 'all 0.15s',
              }}
            >
              {wishTeam ? (
                <>
                  <span style={{
                    width: '16px', height: '16px', borderRadius: '50%',
                    background: KBO_TEAMS[wishTeam]?.color,
                    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '7px', fontWeight: 800, color: '#fff', flexShrink: 0,
                  }}>
                    {KBO_TEAMS[wishTeam]?.short.slice(0, 2)}
                  </span>
                  {KBO_TEAMS[wishTeam]?.short}
                </>
              ) : (
                <span>⭐ 내 팀</span>
              )}
            </button>

            {/* 새로고침 버튼 */}
            <button
              onClick={handleManualRefresh}
              disabled={isRefreshing}
              style={{
                padding: '5px 12px', borderRadius: '8px', fontSize: '12px', fontWeight: 600,
                border: '1px solid rgba(255,255,255,0.1)', cursor: isRefreshing ? 'not-allowed' : 'pointer',
                background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.5)',
                opacity: isRefreshing ? 0.5 : 1, transition: 'all 0.15s',
                display: 'flex', alignItems: 'center', gap: '5px',
              }}
            >
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
                style={{ animation: isRefreshing ? 'spin 0.8s linear infinite' : 'none' }}>
                <path d="M21 2v6h-6"/><path d="M3 12a9 9 0 0 1 15-6.7L21 8"/>
                <path d="M3 22v-6h6"/><path d="M21 12a9 9 0 0 1-15 6.7L3 16"/>
              </svg>
              {isRefreshing ? '···' : '새로고침'}
            </button>
          </div>
        </div>

        {/* 탭 내비게이션 */}
        <nav style={{ display: 'flex', gap: '4px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          {NAV_TABS.map(tab => {
            const isActive = activeTab === tab.id
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  padding: '9px 18px', border: 'none', cursor: 'pointer',
                  borderRadius: '10px 10px 0 0', fontSize: '13px', fontWeight: 700,
                  background: isActive ? 'rgba(255,255,255,0.07)' : 'transparent',
                  color: isActive ? '#fff' : 'rgba(255,255,255,0.35)',
                  borderBottom: isActive ? '2px solid #4ade80' : '2px solid transparent',
                  transition: 'all 0.15s',
                }}
              >
                {tab.label}
              </button>
            )
          })}
        </nav>
      </header>

      {/* ── 콘텐츠 ── */}
      {activeTab === 'games' && (
        <>
          <TodayGameList games={games} standings={standings} />
          <UpcomingSchedule />
          <StandingsTable standings={standings} prevStandings={prevStandings} onTeamClick={setSelectedTeam} dataSource={standingsSource} />
        </>
      )}
      {activeTab === 'injury' && <InjuryPage />}
      {activeTab === 'moves'  && <MovesPage />}
      {activeTab === 'news'   && <NewsPage />}
      {selectedTeam && <TeamStatsModal teamKey={selectedTeam} onClose={() => setSelectedTeam(null)} />}
    </main>
    <ThemePicker />
  </>
  )
}

export default App
