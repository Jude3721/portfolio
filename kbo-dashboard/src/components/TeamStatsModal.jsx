import { useEffect } from 'react'
import { KBO_TEAMS } from '../data/mockGames'
import { mockPlayerStats } from '../data/mockPlayerStats'

function StatHeader({ children, align = 'right' }) {
  return (
    <th
      className={`py-2 px-3 text-xs font-semibold text-${align}`}
      style={{ color: 'var(--text)', backgroundColor: 'var(--code-bg)' }}
    >
      {children}
    </th>
  )
}

function StatCell({ children, highlight, align = 'right' }) {
  return (
    <td
      className={`py-2.5 px-3 text-sm tabular-nums text-${align}`}
      style={{ color: highlight ? 'var(--accent)' : 'var(--text-h)' }}
    >
      {children}
    </td>
  )
}

function BatterTable({ batters }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm border-collapse">
        <thead>
          <tr style={{ borderBottom: '1px solid var(--border)' }}>
            <StatHeader align="left">선수</StatHeader>
            <StatHeader>포지션</StatHeader>
            <StatHeader>경기</StatHeader>
            <StatHeader>타수</StatHeader>
            <StatHeader>안타</StatHeader>
            <StatHeader>홈런</StatHeader>
            <StatHeader>타점</StatHeader>
            <StatHeader>볼넷</StatHeader>
            <StatHeader>타율</StatHeader>
            <StatHeader>출루율</StatHeader>
          </tr>
        </thead>
        <tbody>
          {batters.map((p, i) => (
            <tr
              key={p.name}
              style={{ borderBottom: i < batters.length - 1 ? '1px solid var(--border)' : 'none' }}
            >
              <StatCell align="left">{p.name}</StatCell>
              <StatCell align="center">
                <span
                  className="inline-block px-1.5 py-0.5 rounded text-xs font-medium"
                  style={{ backgroundColor: 'var(--accent-bg)', color: 'var(--accent)' }}
                >
                  {p.pos}
                </span>
              </StatCell>
              <StatCell>{p.games}</StatCell>
              <StatCell>{p.ab}</StatCell>
              <StatCell>{p.hits}</StatCell>
              <StatCell highlight={p.hr > 0}>{p.hr}</StatCell>
              <StatCell>{p.rbi}</StatCell>
              <StatCell>{p.bb}</StatCell>
              <StatCell highlight={p.avg >= 0.400}>{p.avg.toFixed(3)}</StatCell>
              <StatCell highlight={p.obp >= 0.450}>{p.obp.toFixed(3)}</StatCell>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function PitcherTable({ pitchers }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm border-collapse">
        <thead>
          <tr style={{ borderBottom: '1px solid var(--border)' }}>
            <StatHeader align="left">선수</StatHeader>
            <StatHeader>구분</StatHeader>
            <StatHeader>경기</StatHeader>
            <StatHeader>이닝</StatHeader>
            <StatHeader>승</StatHeader>
            <StatHeader>패</StatHeader>
            <StatHeader>탈삼진</StatHeader>
            <StatHeader>피안타</StatHeader>
            <StatHeader>SV</StatHeader>
            <StatHeader>ERA</StatHeader>
            <StatHeader>WHIP</StatHeader>
          </tr>
        </thead>
        <tbody>
          {pitchers.map((p, i) => (
            <tr
              key={p.name}
              style={{ borderBottom: i < pitchers.length - 1 ? '1px solid var(--border)' : 'none' }}
            >
              <StatCell align="left">{p.name}</StatCell>
              <StatCell align="center">
                <span
                  className="inline-block px-1.5 py-0.5 rounded text-xs font-medium"
                  style={{ backgroundColor: 'var(--social-bg)', color: 'var(--text)' }}
                >
                  {p.pos}
                </span>
              </StatCell>
              <StatCell>{p.games}</StatCell>
              <StatCell>{p.innings.toFixed(1)}</StatCell>
              <StatCell highlight={p.wins > 0}>{p.wins}</StatCell>
              <StatCell>{p.losses}</StatCell>
              <StatCell>{p.ks}</StatCell>
              <StatCell>{p.hits}</StatCell>
              <StatCell highlight={(p.saves ?? 0) > 0}>{p.saves ?? 0}</StatCell>
              <StatCell highlight={p.era < 2.00}>{p.era.toFixed(2)}</StatCell>
              <StatCell highlight={p.whip < 1.00}>{p.whip.toFixed(2)}</StatCell>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default function TeamStatsModal({ teamKey, onClose }) {
  const team = KBO_TEAMS[teamKey]
  const stats = mockPlayerStats[teamKey]

  useEffect(() => {
    const handleKey = (e) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [onClose])

  if (!team || !stats) return null

  return (
    <>
      {/* 딤 배경 */}
      <div
        className="fixed inset-0 z-40"
        style={{ backgroundColor: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(2px)' }}
        onClick={onClose}
      />

      {/* 모달 패널 */}
      <div
        className="fixed right-0 top-0 bottom-0 z-50 flex flex-col overflow-hidden"
        style={{
          width: 'min(680px, 100vw)',
          backgroundColor: 'var(--bg)',
          borderLeft: '1px solid var(--border)',
          boxShadow: '-8px 0 32px rgba(0,0,0,0.2)',
        }}
      >
        {/* 헤더 */}
        <div
          className="flex items-center justify-between px-6 py-4 shrink-0"
          style={{ borderBottom: '1px solid var(--border)' }}
        >
          <div className="flex items-center gap-3">
            <img
              src={team.logo}
              alt={team.name}
              className="w-10 h-10 object-contain"
              onError={(e) => { e.target.style.display = 'none' }}
            />
            <div>
              <h2 className="text-lg font-bold m-0" style={{ color: 'var(--text-h)', fontSize: '1.1rem' }}>
                {team.name}
              </h2>
              <p className="text-xs mt-0.5" style={{ color: 'var(--text)' }}>
                2026 시즌 선수 스탯
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-lg transition-colors"
            style={{ color: 'var(--text)', backgroundColor: 'var(--code-bg)' }}
          >
            ✕
          </button>
        </div>

        {/* 바디 (스크롤) */}
        <div className="flex-1 overflow-y-auto px-6 py-5 flex flex-col gap-6">
          {/* 팀 컬러 배너 */}
          <div
            className="rounded-xl px-4 py-3 flex items-center gap-3"
            style={{ backgroundColor: team.color + '22', border: `1px solid ${team.color}44` }}
          >
            <div
              className="w-1 h-10 rounded-full"
              style={{ backgroundColor: team.color }}
            />
            <div>
              <p className="text-xs font-semibold" style={{ color: team.color }}>타자 {stats.batters.length}명 · 투수 {stats.pitchers.length}명</p>
              <p className="text-xs mt-0.5" style={{ color: 'var(--text)' }}>4월 7일 기준 · 강조색은 상위 스탯</p>
            </div>
          </div>

          {/* 타자 스탯 */}
          <section>
            <h3 className="text-sm font-bold mb-3" style={{ color: 'var(--text-h)' }}>
              타자
            </h3>
            <div
              className="rounded-xl overflow-hidden"
              style={{ border: '1px solid var(--border)' }}
            >
              <BatterTable batters={stats.batters} />
            </div>
          </section>

          {/* 투수 스탯 */}
          <section>
            <h3 className="text-sm font-bold mb-3" style={{ color: 'var(--text-h)' }}>
              투수
            </h3>
            <div
              className="rounded-xl overflow-hidden"
              style={{ border: '1px solid var(--border)' }}
            >
              <PitcherTable pitchers={stats.pitchers} />
            </div>
          </section>
        </div>
      </div>
    </>
  )
}
