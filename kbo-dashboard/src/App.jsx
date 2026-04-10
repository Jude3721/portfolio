import { useState, useEffect, useCallback } from 'react'
import TodayGameList from './components/TodayGameList'
import StandingsTable from './components/StandingsTable'
import TeamStatsModal from './components/TeamStatsModal'
import { mockGames } from './data/mockGames'
import { mockStandings } from './data/mockStandings'
import { fetchTodayGamesWithLineup } from './services/kboApi'

function App() {
  const [selectedTeam, setSelectedTeam] = useState(null)
  const [games, setGames] = useState(mockGames)
  const [standings, setStandings] = useState(mockStandings)
  const [lastUpdated, setLastUpdated] = useState(new Date())
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [dataSource, setDataSource] = useState('mock') // 'live' | 'mock'

  const refresh = useCallback(async () => {
    setIsRefreshing(true)
    try {
      const liveGames = await fetchTodayGamesWithLineup()
      if (liveGames.length > 0) {
        // 실시간 데이터가 있으면 사용, 라인업은 mock으로 보완
        const merged = liveGames.map((liveGame) => {
          const mock = mockGames.find(
            (m) => m.awayTeam === liveGame.awayTeam && m.homeTeam === liveGame.homeTeam
          )
          return {
            ...liveGame,
            lineup: liveGame.lineup ?? mock?.lineup ?? null,
            bases: liveGame.bases ?? mock?.bases ?? null,
          }
        })
        setGames(merged)
        setDataSource('live')
      } else {
        setGames([...mockGames])
        setDataSource('mock')
      }
    } catch (err) {
      console.warn('KBO API 오류, mock 데이터 사용:', err.message)
      setGames([...mockGames])
      setDataSource('mock')
    }
    setLastUpdated(new Date())
    setIsRefreshing(false)
  }, [])

  // 초기 로드 + 60초마다 자동 새로고침
  useEffect(() => {
    refresh()
    const id = setInterval(refresh, 60_000)
    return () => clearInterval(id)
  }, [refresh])

  const timeStr = lastUpdated.toLocaleTimeString('ko-KR', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  })

  return (
    <main>
      <header
        className="px-6 py-4 flex items-center gap-2 border-b"
        style={{ borderColor: 'var(--border)' }}
      >
        <span className="text-2xl">⚾</span>
        <h1 className="text-lg font-bold m-0" style={{ color: 'var(--text-h)', fontSize: '1.125rem' }}>
          KBO 대시보드
        </h1>

        <div className="ml-auto flex items-center gap-3">
          {dataSource === 'live' ? (
            <span className="text-xs font-semibold text-green-500">● 실시간</span>
          ) : (
            <span className="text-xs opacity-40" style={{ color: 'var(--text)' }}>목업 데이터</span>
          )}
          <span className="text-xs tabular-nums" style={{ color: 'var(--text)' }}>
            업데이트 {timeStr}
          </span>
          <button
            onClick={refresh}
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
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{
                animation: isRefreshing ? 'spin 0.8s linear infinite' : 'none',
              }}
            >
              <path d="M21 2v6h-6" />
              <path d="M3 12a9 9 0 0 1 15-6.7L21 8" />
              <path d="M3 22v-6h6" />
              <path d="M21 12a9 9 0 0 1-15 6.7L3 16" />
            </svg>
            새로고침
          </button>
        </div>
      </header>

      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>

      <TodayGameList games={games} standings={standings} />
      <StandingsTable standings={standings} onTeamClick={setSelectedTeam} />

      {selectedTeam && (
        <TeamStatsModal
          teamKey={selectedTeam}
          onClose={() => setSelectedTeam(null)}
        />
      )}
    </main>
  )
}

export default App
