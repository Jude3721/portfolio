import { useState, useEffect } from 'react'

export default function ThemePicker() {
  const [theme, setTheme] = useState(() => localStorage.getItem('kbo-theme') || 'violet')

  useEffect(() => {
    document.documentElement.dataset.theme = theme === 'violet' ? '' : theme
  }, [theme])

  const toggle = () => {
    const next = theme === 'violet' ? 'snow' : 'violet'
    setTheme(next)
    localStorage.setItem('kbo-theme', next)
  }

  const isLight = theme === 'snow'

  return (
    <button
      onClick={toggle}
      title={isLight ? '다크 모드로 전환' : '라이트 모드로 전환'}
      style={{
        position: 'fixed', bottom: '24px', right: '24px', zIndex: 100,
        width: '44px', height: '44px', borderRadius: '50%',
        cursor: 'pointer', border: 'none',
        background: 'var(--neu-bg)',
        boxShadow: '5px 5px 14px var(--neu-sd), -3px -3px 9px var(--neu-sl)',
        fontSize: '18px',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        transition: 'box-shadow 0.2s, transform 0.2s',
      }}
      onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.08)'}
      onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
      onMouseDown={e => e.currentTarget.style.boxShadow = 'inset 3px 3px 8px var(--neu-sd), inset -2px -2px 5px var(--neu-sl)'}
      onMouseUp={e => e.currentTarget.style.boxShadow = '5px 5px 14px var(--neu-sd), -3px -3px 9px var(--neu-sl)'}
    >
      {isLight ? '🌙' : '☀️'}
    </button>
  )
}
