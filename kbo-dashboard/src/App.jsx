import { useState, useEffect, useCallback, useRef } from 'react'
import TodayGameList from './components/TodayGameList'
import StandingsTable from './components/StandingsTable'
import TeamStatsModal from './components/TeamStatsModal'
import InjuryPage from './components/InjuryPage'
import MovesPage from './components/MovesPage'
import ThemePicker from './components/ThemePicker'
import { mockGames, mockNextDayGames } from './data/mockGames'
import { mockStandings } from './data/mockStandings'
import { fetchTodayGamesWithLineup, fetchStandings, getDisplayDate } from './services/kboApi'

const NAV_TABS = [
  { id: 'games',  label: '⚾ 경기' },
  { id: 'injury', label: '🩹 부상리포트' },
  { id: 'moves',  label: '🔄 로스터 무브' },
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
  const [standingsSource, setStandingsSource] = useState('mock')
  const [lastUpdated, setLastUpdated]         = useState(new Date())
  const [isRefreshing, setIsRefreshing]       = useState(false)
  const [dataSource, setDataSource]           = useState('mock')
  const [countdown, setCountdown]             = useState(0)
  const intervalRef  = useRef(null)
  const countdownRef = useRef(null)

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
      const liveStandings = await fetchStandings()
      if (liveStandings.length > 0) { setStandings(liveStandings); setStandingsSource('live') }
      else { setStandings(mockStandings); setStandingsSource('mock') }
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
    <main>
      {/* ── 헤더 ── */}
      <header style={{
        background: 'var(--neu-bg)',
        boxShadow: '0 4px 14px var(--neu-sd), 0 -2px 6px var(--neu-sl)',
        padding: '14px 24px 0',
        position: 'sticky', top: 0, zIndex: 50,
      }}>
        {/* 상단 행 */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px', flexWrap: 'wrap' }}>

          {/* 로고 + 타이틀 */}
          <span style={{ fontSize: '20px' }}>⚾</span>
          <span style={{ fontSize: '16px', fontWeight: 800, color: 'rgba(var(--fg-rgb), 0.92)', letterSpacing: '-0.3px' }}>
            KBO 대시보드
          </span>

          {/* 날짜 배지 */}
          <span style={{
            fontSize: '11px', fontWeight: 700, letterSpacing: '0.5px',
            padding: '3px 10px', borderRadius: '99px',
            background: isNextDay ? 'rgba(99,102,241,0.15)' : 'rgba(74,222,128,0.12)',
            border: `1px solid ${isNextDay ? 'rgba(99,102,241,0.35)' : 'rgba(74,222,128,0.3)'}`,
            color: isNextDay ? '#a5b4fc' : '#4ade80',
          }}>
            {isNextDay ? '내일' : '오늘'} {dateStr}
          </span>

          {/* 디자인 프리뷰 링크 — 개발 환경에서만 노출 */}
          {import.meta.env.DEV && (
            <a
              href="/portfolio/kbo-dashboard/design-preview.html"
              target="_blank"
              rel="noreferrer"
              style={{
                fontSize: '11px', fontWeight: 600, padding: '3px 10px', borderRadius: '99px',
                background: 'rgba(var(--fg-rgb), 0.05)', border: '1px solid rgba(var(--fg-rgb), 0.1)',
                color: 'rgba(var(--fg-rgb), 0.4)', textDecoration: 'none', transition: 'all 0.15s',
              }}
              onMouseEnter={e => { e.currentTarget.style.color = 'rgba(var(--fg-rgb), 0.75)'; e.currentTarget.style.borderColor = 'rgba(var(--fg-rgb), 0.25)' }}
              onMouseLeave={e => { e.currentTarget.style.color = 'rgba(var(--fg-rgb), 0.4)';  e.currentTarget.style.borderColor = 'rgba(var(--fg-rgb), 0.1)' }}
            >
              Design Preview
            </a>
          )}

          {/* 우측 컨트롤 */}
          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
            {/* 데이터 소스 */}
            {dataSource === 'live' ? (
              <span className="live-badge"><span className="live-dot" />실시간</span>
            ) : (
              <span style={{ fontSize: '11px', color: 'rgba(var(--fg-rgb), 0.3)', letterSpacing: '0.5px' }}>목업 데이터</span>
            )}

            {/* 카운트다운 */}
            {hasLiveGame && countdown > 0 && (
              <span style={{ fontSize: '11px', color: 'rgba(var(--fg-rgb), 0.35)', fontVariantNumeric: 'tabular-nums' }}>
                {countdown}초 후 갱신
              </span>
            )}

            {/* 업데이트 시간 */}
            <span style={{ fontSize: '11px', color: 'rgba(var(--fg-rgb), 0.3)', fontVariantNumeric: 'tabular-nums' }}>
              {timeStr}
            </span>

            {/* 새로고침 버튼 */}
            <button
              onClick={handleManualRefresh}
              disabled={isRefreshing}
              style={{
                display: 'flex', alignItems: 'center', gap: '6px',
                padding: '6px 14px', borderRadius: '10px',
                background: 'var(--neu-bg)',
                border: 'none',
                boxShadow: isRefreshing ? N.inset : N.btn,
                color: 'rgba(var(--fg-rgb), 0.65)',
                fontSize: '12px', fontWeight: 600,
                cursor: isRefreshing ? 'not-allowed' : 'pointer',
                opacity: isRefreshing ? 0.5 : 1,
                transition: 'all 0.2s',
              }}
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
                style={{ animation: isRefreshing ? 'spin 0.8s linear infinite' : 'none' }}>
                <path d="M21 2v6h-6"/><path d="M3 12a9 9 0 0 1 15-6.7L21 8"/>
                <path d="M3 22v-6h6"/><path d="M21 12a9 9 0 0 1-15 6.7L3 16"/>
              </svg>
              새로고침
            </button>
          </div>
        </div>

        {/* 탭 내비게이션 */}
        <nav style={{ display: 'flex', gap: '4px' }}>
          {NAV_TABS.map(tab => {
            const isActive = activeTab === tab.id
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  padding: '8px 18px',
                  borderRadius: '10px 10px 0 0',
                  fontSize: '13px', fontWeight: 600,
                  cursor: 'pointer', border: 'none',
                  background: 'var(--neu-bg)',
                  color: isActive ? '#c084fc' : 'rgba(var(--fg-rgb), 0.38)',
                  border: 'none',
                  boxShadow: isActive ? N.inset : 'none',
                  transition: 'all 0.2s',
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
          <StandingsTable standings={standings} onTeamClick={setSelectedTeam} dataSource={standingsSource} />
        </>
      )}
      {activeTab === 'injury' && <InjuryPage />}
      {activeTab === 'moves'  && <MovesPage />}
      {selectedTeam && <TeamStatsModal teamKey={selectedTeam} onClose={() => setSelectedTeam(null)} />}
    </main>
    <ThemePicker />
  </>
  )
}

export default App
