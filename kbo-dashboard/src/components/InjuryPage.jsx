import { useState } from 'react'
import { KBO_TEAMS } from '../data/mockGames'
import { mockInjuries } from '../data/mockInjuries'

const TEAM_ORDER = ['LG', 'KT', '두산', 'SSG', 'NC', '삼성', '롯데', '한화', 'KIA', '키움']

const STATUS_STYLE = {
  DL:   { label: '부상자명단', bg: 'rgba(239,68,68,0.15)',  color: '#f87171' },
  재활:  { label: '재활 중',   bg: 'rgba(251,146,60,0.15)', color: '#fb923c' },
  결장:  { label: '일시 결장', bg: 'rgba(234,179,8,0.15)',  color: '#facc15' },
}

function InjuryRow({ player, teamColor }) {
  const s = STATUS_STYLE[player.status] ?? STATUS_STYLE['결장']
  return (
    <div
      className="flex items-start gap-4 px-5 py-4"
      style={{ borderBottom: '1px solid var(--border)' }}
    >
      {/* 상태 배지 */}
      <span
        className="text-xs font-semibold px-2 py-0.5 rounded-full shrink-0 mt-0.5"
        style={{ backgroundColor: s.bg, color: s.color, whiteSpace: 'nowrap' }}
      >
        {s.label}
      </span>

      <div className="flex-1 min-w-0 text-left">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-sm font-semibold" style={{ color: 'var(--text-h)' }}>
            {player.name}
          </span>
          <span
            className="text-xs px-1.5 py-0.5 rounded"
            style={{ backgroundColor: 'var(--code-bg)', color: 'var(--text)', opacity: 0.8 }}
          >
            {player.pos}
          </span>
        </div>
        <p className="text-xs mb-1" style={{ color: 'var(--text)', opacity: 0.85 }}>
          {player.injuryType}
        </p>
        <div className="flex items-center gap-3">
          <span className="text-xs" style={{ color: 'var(--text)', opacity: 0.55 }}>
            등록: {player.since}
          </span>
          <span
            className="text-xs font-medium"
            style={{ color: teamColor, opacity: 0.9 }}
          >
            {player.eta}
          </span>
        </div>
      </div>
    </div>
  )
}

export default function InjuryPage() {
  const [selectedTeam, setSelectedTeam] = useState('LG')

  const team = KBO_TEAMS[selectedTeam]
  const players = mockInjuries[selectedTeam] ?? []

  const dlCount    = players.filter(p => p.status === 'DL').length
  const rehabCount = players.filter(p => p.status === '재활').length
  const outCount   = players.filter(p => p.status === '결장').length

  return (
    <section className="w-full px-6 pb-10">
      {/* 섹션 제목 */}
      <div className="mb-6 text-left">
        <h2 className="text-xl font-bold mb-1" style={{ color: 'var(--text-h)' }}>
          구단별 부상 리포트
        </h2>
        <p className="text-sm" style={{ color: 'var(--text)', opacity: 0.7 }}>
          구단을 선택하면 현재 부상 · 결장 선수 현황을 확인할 수 있습니다
        </p>
      </div>

      {/* 팀 선택 버튼 */}
      <div className="flex flex-wrap gap-2 mb-6">
        {TEAM_ORDER.map(key => {
          const t = KBO_TEAMS[key]
          const isActive = key === selectedTeam
          const count = (mockInjuries[key] ?? []).length
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
              {count > 0 && (
                <span
                  className="text-xs font-bold px-1.5 py-0.5 rounded-full"
                  style={{
                    backgroundColor: isActive ? 'rgba(255,255,255,0.25)' : 'rgba(239,68,68,0.15)',
                    color: isActive ? '#fff' : '#f87171',
                    minWidth: '18px',
                    textAlign: 'center',
                  }}
                >
                  {count}
                </span>
              )}
            </button>
          )
        })}
      </div>

      {/* 부상 카드 */}
      <div
        className="rounded-2xl overflow-hidden"
        style={{ border: '1px solid var(--border)', boxShadow: 'var(--shadow)' }}
      >
        {/* 카드 헤더 */}
        <div
          className="flex items-center gap-3 px-5 py-4"
          style={{ backgroundColor: 'var(--code-bg)', borderBottom: '1px solid var(--border)' }}
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
            {team.name} 부상 리포트
          </span>

          {/* 요약 배지 */}
          <div className="ml-auto flex items-center gap-2">
            {dlCount > 0 && (
              <span className="text-xs px-2 py-0.5 rounded-full font-medium"
                style={{ backgroundColor: 'rgba(239,68,68,0.15)', color: '#f87171' }}>
                부상자명단 {dlCount}명
              </span>
            )}
            {rehabCount > 0 && (
              <span className="text-xs px-2 py-0.5 rounded-full font-medium"
                style={{ backgroundColor: 'rgba(251,146,60,0.15)', color: '#fb923c' }}>
                재활 {rehabCount}명
              </span>
            )}
            {outCount > 0 && (
              <span className="text-xs px-2 py-0.5 rounded-full font-medium"
                style={{ backgroundColor: 'rgba(234,179,8,0.15)', color: '#facc15' }}>
                결장 {outCount}명
              </span>
            )}
          </div>
        </div>

        {/* 부상 선수 없음 */}
        {players.length === 0 && (
          <div className="py-16 text-center">
            <p className="text-2xl mb-2">✅</p>
            <p className="text-sm font-medium" style={{ color: 'var(--text-h)' }}>
              부상 · 결장 선수 없음
            </p>
            <p className="text-xs mt-1" style={{ color: 'var(--text)', opacity: 0.5 }}>
              현재 전원 정상 출전 가능합니다
            </p>
          </div>
        )}

        {/* 부상 선수 목록 */}
        {players.map((player, i) => (
          <InjuryRow key={i} player={player} teamColor={team.color} />
        ))}
      </div>

      {/* 안내 문구 */}
      <p className="text-xs mt-4 text-center" style={{ color: 'var(--text)', opacity: 0.4 }}>
        * 부상 정보는 목업 데이터입니다. 실제 상황과 다를 수 있습니다.
      </p>
    </section>
  )
}
