export default function StadiumBackground() {
  return (
    <div
      aria-hidden="true"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 0,
        pointerEvents: 'none',
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <svg
        viewBox="0 0 800 700"
        xmlns="http://www.w3.org/2000/svg"
        style={{
          width: '90vw',
          maxWidth: '900px',
          opacity: 0.07,
          transform: 'perspective(900px) rotateX(38deg) scale(1.15)',
          transformOrigin: 'center 60%',
          filter: 'drop-shadow(0 60px 80px rgba(0,0,0,0.5))',
        }}
      >
        <defs>
          <radialGradient id="fieldGrad" cx="50%" cy="60%" r="55%">
            <stop offset="0%" stopColor="#3a7d2c" />
            <stop offset="100%" stopColor="#2a5c1e" />
          </radialGradient>
          <radialGradient id="infield" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#c8935a" />
            <stop offset="100%" stopColor="#a8723a" />
          </radialGradient>
          <radialGradient id="standGrad" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#4a4a5a" />
            <stop offset="100%" stopColor="#2a2a36" />
          </radialGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="3" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <linearGradient id="trackGrad" cx="50%" cy="50%" r="50%" gradientUnits="objectBoundingBox">
            <stop offset="0%" stopColor="#b87040" />
            <stop offset="100%" stopColor="#8a5030" />
          </linearGradient>
        </defs>

        {/* ── 외벽 / 관중석 외곽 ── */}
        <ellipse cx="400" cy="370" rx="370" ry="320" fill="#1e1e28" />

        {/* 관중석 계단식 (여러 겹) */}
        <ellipse cx="400" cy="370" rx="355" ry="305" fill="#252533" />
        <ellipse cx="400" cy="370" rx="335" ry="285" fill="#2a2a3c" />
        <ellipse cx="400" cy="370" rx="312" ry="263" fill="#1e2030" />

        {/* 관중석 좌석 줄 (가는 선) */}
        {[0, 1, 2, 3, 4, 5, 6].map((i) => (
          <ellipse
            key={i}
            cx="400"
            cy="370"
            rx={295 - i * 20}
            ry={248 - i * 17}
            fill="none"
            stroke="#3a3a52"
            strokeWidth="1.5"
          />
        ))}

        {/* 관중석 색상 구역 */}
        <ellipse cx="400" cy="370" rx="215" ry="178" fill="#1a3a22" />

        {/* ── 경고트랙 ── */}
        <ellipse cx="400" cy="370" rx="215" ry="178" fill="#8a5030" />
        <ellipse cx="400" cy="370" rx="200" ry="163" fill="url(#fieldGrad)" />

        {/* ── 외야 잔디 줄무늬 (교차) ── */}
        {[-4, -3, -2, -1, 0, 1, 2, 3, 4].map((i) => (
          <ellipse
            key={i}
            cx="400"
            cy="370"
            rx={200 - Math.abs(i) * 3}
            ry={163 - Math.abs(i) * 2.5}
            fill="none"
            stroke={i % 2 === 0 ? '#2e6622' : '#3a7d2c'}
            strokeWidth="10"
            strokeOpacity="0.5"
          />
        ))}

        {/* ── 내야 흙 (다이아몬드 반경) ── */}
        <circle cx="400" cy="395" r="88" fill="#b87040" />
        <circle cx="400" cy="395" r="85" fill="url(#infield)" />

        {/* ── 내야 잔디 ── */}
        <rect
          x="340"
          y="335"
          width="120"
          height="120"
          rx="4"
          fill="#3a8030"
          transform="rotate(45 400 395)"
        />

        {/* ── 파울라인 ── */}
        <line x1="400" y1="395" x2="175" y2="170" stroke="white" strokeWidth="1.5" strokeOpacity="0.6" />
        <line x1="400" y1="395" x2="625" y2="170" stroke="white" strokeWidth="1.5" strokeOpacity="0.6" />

        {/* ── 투수 마운드 ── */}
        <ellipse cx="400" cy="385" rx="12" ry="9" fill="#c89858" />
        <ellipse cx="400" cy="385" rx="7" ry="5" fill="#d8aa68" />
        {/* 투수판 */}
        <rect x="394" y="382" width="12" height="4" rx="1" fill="white" fillOpacity="0.8" />

        {/* ── 홈플레이트 ── */}
        <polygon points="400,458 408,452 408,444 392,444 392,452" fill="white" fillOpacity="0.9" />

        {/* ── 베이스 ── */}
        {/* 1루 */}
        <rect x="480" y="372" width="14" height="14" rx="2" fill="white" fillOpacity="0.9"
          transform="rotate(45 487 379)" />
        {/* 2루 */}
        <rect x="393" y="293" width="14" height="14" rx="2" fill="white" fillOpacity="0.9"
          transform="rotate(45 400 300)" />
        {/* 3루 */}
        <rect x="306" y="372" width="14" height="14" rx="2" fill="white" fillOpacity="0.9"
          transform="rotate(45 313 379)" />

        {/* ── 베이스 라인 ── */}
        <polygon
          points="400,451 487,379 400,307 313,379"
          fill="none"
          stroke="white"
          strokeWidth="1.5"
          strokeOpacity="0.7"
        />

        {/* ── 홈플레이트~베이스 흙길 ── */}
        <line x1="400" y1="451" x2="487" y2="379" stroke="#c89858" strokeWidth="6" strokeOpacity="0.4" />
        <line x1="400" y1="451" x2="313" y2="379" stroke="#c89858" strokeWidth="6" strokeOpacity="0.4" />

        {/* ── 덕아웃 ── */}
        <rect x="296" y="448" width="60" height="20" rx="4" fill="#1a1a28" stroke="#444" strokeWidth="1" />
        <rect x="444" y="448" width="60" height="20" rx="4" fill="#1a1a28" stroke="#444" strokeWidth="1" />

        {/* ── 조명탑 (4개) ── */}
        {[
          { x: 148, y: 175 },
          { x: 652, y: 175 },
          { x: 88, y: 370 },
          { x: 712, y: 370 },
        ].map((pos, i) => (
          <g key={i}>
            <line x1={pos.x} y1={pos.y} x2={pos.x} y2={pos.y + 48} stroke="#666" strokeWidth="4" />
            <rect x={pos.x - 10} y={pos.y - 6} width="20" height="8" rx="2" fill="#888" />
            <ellipse cx={pos.x} cy={pos.y - 3} rx="14" ry="5" fill="#ffe066" fillOpacity="0.55" filter="url(#glow)" />
          </g>
        ))}

        {/* ── 중앙 로고 원 ── */}
        <circle cx="400" cy="395" r="18" fill="none" stroke="white" strokeWidth="1" strokeOpacity="0.25" />
        <text
          x="400"
          y="399"
          textAnchor="middle"
          fontSize="11"
          fontWeight="bold"
          fill="white"
          fillOpacity="0.35"
          fontFamily="system-ui, sans-serif"
          letterSpacing="1"
        >
          KBO
        </text>
      </svg>
    </div>
  )
}
