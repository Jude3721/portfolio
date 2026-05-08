import { useState, useEffect, useRef, useCallback } from 'react'
import { NBA_TEAMS } from '../data/nbaTeams'

const API_BASE   = import.meta.env.VITE_API_BASE ?? ''
const POLL_MS    = 2500

function formatTime(iso) {
  return new Date(iso).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })
}

function TeamLogo({ tri, size = 22 }) {
  const team = tri ? NBA_TEAMS[tri] : null
  if (!team) return null
  return (
    <img src={team.logo} alt={tri}
      style={{ width: size, height: size, objectFit: 'contain', flexShrink: 0 }}
      onError={e => e.target.style.display = 'none'}
    />
  )
}

export default function ChatRoom({ wishTeam }) {
  const [open, setOpen]           = useState(false)
  const [messages, setMessages]   = useState([])
  const [input, setInput]         = useState('')
  const [name, setName]           = useState(() => localStorage.getItem('nba_chat_name') || '')
  const [nameInput, setNameInput] = useState('')
  const [hasNew, setHasNew]       = useState(false)
  const [connected, setConnected] = useState(false)
  const [sending, setSending]     = useState(false)
  const bottomRef  = useRef(null)
  const lastIdRef  = useRef(0)
  const myName     = useRef(name)
  const openRef    = useRef(open)
  openRef.current  = open

  const saveName = () => {
    const n = nameInput.trim() || `농구팬${Math.floor(Math.random() * 9000 + 1000)}`
    localStorage.setItem('nba_chat_name', n)
    setName(n); myName.current = n
  }

  // 새 메시지 fetch
  const fetchNew = useCallback(async () => {
    try {
      const r = await fetch(`${API_BASE}/api/chat/messages?since=${lastIdRef.current}`)
      if (!r.ok) { setConnected(false); return }
      const d    = await r.json()
      const msgs = d.messages ?? []
      if (msgs.length > 0) {
        setMessages(prev => [...prev, ...msgs])
        lastIdRef.current = msgs[msgs.length - 1].id
        if (!openRef.current) setHasNew(true)
      }
      setConnected(true)
    } catch {
      setConnected(false)
    }
  }, [])

  // 초기 로드
  useEffect(() => {
    fetch(`${API_BASE}/api/chat/messages`)
      .then(r => r.json())
      .then(d => {
        const msgs = d.messages ?? []
        setMessages(msgs)
        if (msgs.length > 0) lastIdRef.current = msgs[msgs.length - 1].id
        setConnected(true)
      })
      .catch(() => setConnected(false))
  }, [])

  // 폴링
  useEffect(() => {
    const id = setInterval(fetchNew, POLL_MS)
    return () => clearInterval(id)
  }, [fetchNew])

  useEffect(() => {
    if (open) {
      setHasNew(false)
      setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 60)
    }
  }, [open])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const send = useCallback(async () => {
    if (!input.trim() || !name || sending) return
    const text = input.trim()
    setInput('')
    setSending(true)
    try {
      await fetch(`${API_BASE}/api/chat/messages`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ name, text, teamTri: wishTeam ?? null }),
      })
      await fetchNew()  // 즉시 갱신
    } catch {
      setConnected(false)
    } finally {
      setSending(false)
    }
  }, [input, name, wishTeam, sending, fetchNew])

  const onKey = e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send() } }

  const wishTeamInfo = wishTeam ? NBA_TEAMS[wishTeam] : null
  const accentColor  = wishTeamInfo?.color ?? '#F4A261'

  return (
    <>
      {open && (
        <div style={{
          position: 'fixed', bottom: '84px', right: '24px', zIndex: 1500,
          width: '320px', height: '460px',
          background: '#0f1117', borderRadius: '20px',
          border: `1px solid ${wishTeamInfo ? `${accentColor}50` : 'rgba(255,255,255,0.1)'}`,
          boxShadow: '0 16px 60px rgba(0,0,0,0.6)',
          display: 'flex', flexDirection: 'column',
          animation: 'chatFadeUp 0.2s ease',
        }}>
          {/* 헤더 */}
          <div style={{
            padding: '12px 14px', flexShrink: 0,
            borderBottom: '1px solid rgba(255,255,255,0.07)',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            background: wishTeamInfo ? `${accentColor}15` : 'transparent',
            borderRadius: '20px 20px 0 0',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              {wishTeamInfo && (
                <img src={wishTeamInfo.logo} alt={wishTeam}
                  style={{ width: '24px', height: '24px', objectFit: 'contain' }}
                  onError={e => e.target.style.display = 'none'}
                />
              )}
              <span style={{ fontSize: '13px', fontWeight: 800, color: '#fff' }}>🏀 NBA 채팅방</span>
              <span style={{ fontSize: '11px' }}>
                {connected
                  ? <span style={{ color: '#4ade80' }}>● 연결됨</span>
                  : <span style={{ color: '#f87171' }}>● 연결 중...</span>
                }
              </span>
            </div>
            <button onClick={() => setOpen(false)}
              style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', cursor: 'pointer', fontSize: '20px', lineHeight: 1 }}>
              ×
            </button>
          </div>

          {!name ? (
            /* 닉네임 설정 */
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '24px', gap: '12px' }}>
              <div style={{ marginBottom: '4px' }}>
                {wishTeamInfo
                  ? <img src={wishTeamInfo.logo} alt="" style={{ width: '52px', height: '52px', objectFit: 'contain' }} />
                  : <span style={{ fontSize: '40px' }}>👋</span>
                }
              </div>
              <p style={{ fontSize: '14px', fontWeight: 700, color: '#fff', textAlign: 'center' }}>닉네임을 설정하세요</p>
              <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.35)', textAlign: 'center' }}>비워두면 랜덤으로 배정됩니다</p>
              <input
                value={nameInput}
                onChange={e => setNameInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && saveName()}
                placeholder="닉네임 (최대 16자)"
                maxLength={16} autoFocus
                style={{
                  width: '100%', padding: '10px 14px', borderRadius: '10px',
                  background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)',
                  color: '#fff', fontSize: '14px', outline: 'none', boxSizing: 'border-box',
                }}
              />
              <button onClick={saveName} style={{
                width: '100%', padding: '11px', borderRadius: '10px', border: 'none',
                background: accentColor, color: '#fff', fontSize: '14px', fontWeight: 800, cursor: 'pointer',
              }}>
                입장하기
              </button>
            </div>
          ) : (
            <>
              {/* 메시지 목록 */}
              <div style={{ flex: 1, overflowY: 'auto', padding: '12px 10px 4px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {messages.length === 0 && (
                  <div style={{ textAlign: 'center', color: 'rgba(255,255,255,0.2)', fontSize: '13px', marginTop: '40px' }}>
                    첫 번째 메시지를 보내보세요!
                  </div>
                )}
                {messages.map(msg => {
                  const isMe    = msg.name === myName.current
                  const msgTeam = msg.teamTri ? NBA_TEAMS[msg.teamTri] : null
                  return (
                    <div key={msg.id} style={{ display: 'flex', flexDirection: 'column', alignItems: isMe ? 'flex-end' : 'flex-start' }}>
                      {/* 이름 + 팀 로고 */}
                      {!isMe && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '3px', marginLeft: '32px' }}>
                          {msgTeam && <TeamLogo tri={msg.teamTri} size={14} />}
                          <span style={{ fontSize: '10px', color: msgTeam ? msgTeam.color : 'rgba(255,255,255,0.35)' }}>
                            {msg.name}
                          </span>
                        </div>
                      )}

                      <div style={{ display: 'flex', alignItems: 'flex-end', gap: '5px', flexDirection: isMe ? 'row-reverse' : 'row' }}>
                        {/* 팀 로고 아바타 */}
                        <div style={{
                          width: '26px', height: '26px', borderRadius: '50%', flexShrink: 0,
                          background: msgTeam ? `${msgTeam.color}22` : 'rgba(255,255,255,0.08)',
                          border: msgTeam ? `1px solid ${msgTeam.color}50` : '1px solid rgba(255,255,255,0.1)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}>
                          {msgTeam
                            ? <TeamLogo tri={msg.teamTri} size={18} />
                            : <span style={{ fontSize: '12px' }}>🏀</span>
                          }
                        </div>

                        <div style={{
                          maxWidth: '190px', padding: '8px 11px',
                          borderRadius: isMe ? '14px 14px 4px 14px' : '14px 14px 14px 4px',
                          background: isMe ? accentColor : 'rgba(255,255,255,0.1)',
                          color: '#fff', fontSize: '13px', lineHeight: 1.45, wordBreak: 'break-word',
                        }}>
                          {msg.text}
                        </div>

                        <span style={{ fontSize: '9px', color: 'rgba(255,255,255,0.2)', flexShrink: 0 }}>
                          {formatTime(msg.time)}
                        </span>
                      </div>
                    </div>
                  )
                })}
                <div ref={bottomRef} />
              </div>

              {/* 입력창 */}
              <div style={{ padding: '8px 10px 12px', borderTop: '1px solid rgba(255,255,255,0.06)', flexShrink: 0 }}>
                {wishTeamInfo && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '6px' }}>
                    <TeamLogo tri={wishTeam} size={14} />
                    <span style={{ fontSize: '10px', color: accentColor, fontWeight: 700 }}>{wishTeamInfo.short} 팬</span>
                    <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.25)' }}>· {name}</span>
                  </div>
                )}
                <div style={{ display: 'flex', gap: '6px' }}>
                  <input
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    onKeyDown={onKey}
                    placeholder={sending ? '전송 중...' : '메시지 입력...'}
                    maxLength={300}
                    disabled={sending}
                    style={{
                      flex: 1, padding: '8px 12px', borderRadius: '10px',
                      background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)',
                      color: '#fff', fontSize: '13px', outline: 'none',
                      opacity: sending ? 0.6 : 1,
                    }}
                  />
                  <button
                    onClick={send}
                    disabled={!input.trim() || sending}
                    style={{
                      padding: '8px 13px', borderRadius: '10px', border: 'none',
                      background: (input.trim() && !sending) ? accentColor : 'rgba(255,255,255,0.07)',
                      color: (input.trim() && !sending) ? '#fff' : 'rgba(255,255,255,0.2)',
                      fontSize: '16px', cursor: (input.trim() && !sending) ? 'pointer' : 'default',
                      transition: 'all 0.15s', fontWeight: 700,
                    }}
                  >↑</button>
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* 플로팅 버튼 */}
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          position: 'fixed', bottom: '24px', right: '24px', zIndex: 1500,
          width: '52px', height: '52px', borderRadius: '50%', border: 'none',
          background: accentColor, cursor: 'pointer',
          boxShadow: `0 4px 20px ${accentColor}60`,
          transition: 'all 0.2s',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}
        onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.1)'}
        onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
      >
        {open ? (
          <span style={{ fontSize: '22px', color: '#fff' }}>×</span>
        ) : wishTeamInfo ? (
          <img src={wishTeamInfo.logo} alt={wishTeam}
            style={{ width: '30px', height: '30px', objectFit: 'contain' }}
            onError={e => { e.target.style.display='none' }}
          />
        ) : (
          <span style={{ fontSize: '22px' }}>💬</span>
        )}
        {hasNew && !open && (
          <span style={{
            position: 'absolute', top: '6px', right: '6px',
            width: '10px', height: '10px', borderRadius: '50%',
            background: '#f87171', border: '2px solid #0f1117',
          }} />
        )}
      </button>

      <style>{`
        @keyframes chatFadeUp {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </>
  )
}
