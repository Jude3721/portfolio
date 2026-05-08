import { useState, useEffect, useRef, useCallback } from 'react'
import { io } from 'socket.io-client'

const API_BASE = import.meta.env.VITE_API_BASE ?? ''

let socket = null
function getSocket() {
  if (!socket) {
    socket = io(API_BASE || undefined, { transports: ['websocket', 'polling'] })
  }
  return socket
}

function formatTime(iso) {
  const d = new Date(iso)
  return d.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })
}

export default function ChatRoom() {
  const [open, setOpen]         = useState(false)
  const [messages, setMessages] = useState([])
  const [input, setInput]       = useState('')
  const [name, setName]         = useState(() => localStorage.getItem('nba_chat_name') || '')
  const [nameInput, setNameInput] = useState('')
  const [online, setOnline]     = useState(0)
  const [hasNew, setHasNew]     = useState(false)
  const [connected, setConnected] = useState(false)
  const bottomRef = useRef(null)
  const myName    = useRef(name)

  // 닉네임 설정
  const saveName = () => {
    const n = nameInput.trim() || `농구팬${Math.floor(Math.random() * 9000 + 1000)}`
    localStorage.setItem('nba_chat_name', n)
    setName(n)
    myName.current = n
  }

  useEffect(() => {
    const s = getSocket()

    s.on('connect',        () => setConnected(true))
    s.on('disconnect',     () => setConnected(false))
    s.on('chat:online',    count => setOnline(count))
    s.on('chat:history',   msgs => setMessages(msgs))
    s.on('chat:message',   msg => {
      setMessages(prev => [...prev, msg])
      if (!open) setHasNew(true)
    })

    return () => {
      s.off('connect'); s.off('disconnect')
      s.off('chat:online'); s.off('chat:history'); s.off('chat:message')
    }
  }, [open])

  useEffect(() => {
    if (open) {
      setHasNew(false)
      setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 50)
    }
  }, [open])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const send = useCallback(() => {
    if (!input.trim() || !name) return
    getSocket().emit('chat:message', { name, text: input.trim() })
    setInput('')
  }, [input, name])

  const onKey = e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send() } }

  // 닉네임 입력 화면
  const showNamePrompt = !name

  return (
    <>
      {/* 채팅 패널 */}
      {open && (
        <div style={{
          position: 'fixed', bottom: '84px', right: '24px', zIndex: 1500,
          width: '320px', height: '460px',
          background: '#0f1117', borderRadius: '20px',
          border: '1px solid rgba(255,255,255,0.1)',
          boxShadow: '0 16px 60px rgba(0,0,0,0.6)',
          display: 'flex', flexDirection: 'column',
          animation: 'fadeUp 0.2s ease',
        }}>
          {/* 헤더 */}
          <div style={{
            padding: '14px 16px', borderBottom: '1px solid rgba(255,255,255,0.07)',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            flexShrink: 0,
          }}>
            <div>
              <span style={{ fontSize: '14px', fontWeight: 800, color: '#fff' }}>🏀 NBA 채팅방</span>
              <span style={{
                marginLeft: '8px', fontSize: '11px', color: 'rgba(255,255,255,0.3)',
              }}>
                {connected
                  ? <><span style={{ color: '#4ade80' }}>●</span> {online}명 접속</>
                  : <span style={{ color: '#f87171' }}>● 연결 중...</span>
                }
              </span>
            </div>
            <button
              onClick={() => setOpen(false)}
              style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', cursor: 'pointer', fontSize: '18px', lineHeight: 1 }}
            >
              ×
            </button>
          </div>

          {showNamePrompt ? (
            /* 닉네임 설정 화면 */
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '24px', gap: '12px' }}>
              <div style={{ fontSize: '32px', marginBottom: '4px' }}>👋</div>
              <p style={{ fontSize: '14px', fontWeight: 700, color: '#fff', textAlign: 'center' }}>닉네임을 설정하세요</p>
              <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.35)', textAlign: 'center' }}>비워두면 랜덤으로 배정됩니다</p>
              <input
                value={nameInput}
                onChange={e => setNameInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && saveName()}
                placeholder="닉네임 (최대 16자)"
                maxLength={16}
                autoFocus
                style={{
                  width: '100%', padding: '10px 14px', borderRadius: '10px',
                  background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)',
                  color: '#fff', fontSize: '14px', outline: 'none',
                  boxSizing: 'border-box',
                }}
              />
              <button
                onClick={saveName}
                style={{
                  width: '100%', padding: '11px', borderRadius: '10px', border: 'none',
                  background: '#F4A261', color: '#000', fontSize: '14px', fontWeight: 800, cursor: 'pointer',
                }}
              >
                입장하기
              </button>
            </div>
          ) : (
            <>
              {/* 메시지 목록 */}
              <div style={{ flex: 1, overflowY: 'auto', padding: '12px 12px 4px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {messages.length === 0 && (
                  <div style={{ textAlign: 'center', color: 'rgba(255,255,255,0.2)', fontSize: '13px', marginTop: '40px' }}>
                    첫 번째 메시지를 보내보세요!
                  </div>
                )}
                {messages.map(msg => {
                  const isMe = msg.name === myName.current
                  return (
                    <div key={msg.id} style={{ display: 'flex', flexDirection: 'column', alignItems: isMe ? 'flex-end' : 'flex-start' }}>
                      {!isMe && (
                        <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.35)', marginBottom: '3px', marginLeft: '4px' }}>
                          {msg.name}
                        </span>
                      )}
                      <div style={{ display: 'flex', alignItems: 'flex-end', gap: '5px', flexDirection: isMe ? 'row-reverse' : 'row' }}>
                        <div style={{
                          maxWidth: '200px', padding: '8px 12px', borderRadius: isMe ? '14px 14px 4px 14px' : '14px 14px 14px 4px',
                          background: isMe ? '#F4A261' : 'rgba(255,255,255,0.1)',
                          color: isMe ? '#000' : '#fff',
                          fontSize: '13px', lineHeight: 1.45, wordBreak: 'break-word',
                          fontWeight: isMe ? 600 : 400,
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

              {/* 내 닉네임 표시 + 입력창 */}
              <div style={{ padding: '10px 12px 14px', borderTop: '1px solid rgba(255,255,255,0.06)', flexShrink: 0 }}>
                <div style={{ display: 'flex', gap: '6px' }}>
                  <input
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    onKeyDown={onKey}
                    placeholder={`${name}(으)로 메시지 전송...`}
                    maxLength={300}
                    style={{
                      flex: 1, padding: '9px 12px', borderRadius: '10px',
                      background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)',
                      color: '#fff', fontSize: '13px', outline: 'none',
                    }}
                  />
                  <button
                    onClick={send}
                    disabled={!input.trim()}
                    style={{
                      padding: '9px 14px', borderRadius: '10px', border: 'none',
                      background: input.trim() ? '#F4A261' : 'rgba(255,255,255,0.07)',
                      color: input.trim() ? '#000' : 'rgba(255,255,255,0.2)',
                      fontSize: '15px', cursor: input.trim() ? 'pointer' : 'default',
                      transition: 'all 0.15s', fontWeight: 700,
                    }}
                  >
                    ↑
                  </button>
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
          background: open ? '#F4A261' : 'rgba(244,162,97,0.9)',
          color: '#000', fontSize: '22px', cursor: 'pointer',
          boxShadow: '0 4px 20px rgba(244,162,97,0.4)',
          transition: 'all 0.2s',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}
        onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.1)'}
        onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
      >
        {open ? '×' : '💬'}
        {hasNew && !open && (
          <span style={{
            position: 'absolute', top: '6px', right: '6px',
            width: '10px', height: '10px', borderRadius: '50%',
            background: '#f87171', border: '2px solid #0f1117',
          }} />
        )}
      </button>

      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </>
  )
}
