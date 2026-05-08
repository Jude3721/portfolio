import { useState, useEffect, useRef, useCallback } from 'react'
import { KBO_TEAMS } from '../data/kboTeams'

const API_BASE    = import.meta.env.VITE_API_BASE ?? ''
const POLL_MS     = 3000
const RETRY_MS    = 10000
const NICK_TIMEOUT_MS = 5 * 60 * 1000

function formatTime(iso) {
  return new Date(iso).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })
}

function TeamBadge({ teamKey, size = 24 }) {
  const team = teamKey ? KBO_TEAMS[teamKey] : null
  if (!team) return null
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%', flexShrink: 0,
      background: team.color,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: size * 0.33, fontWeight: 800, color: '#fff',
    }}>
      {team.short.slice(0, 2)}
    </div>
  )
}

// 공유 닉네임 상태 (새로고침 방지용)
let nickCheckedAt = 0

export default function ChatRoom({ wishTeam }) {
  const [open, setOpen]             = useState(false)
  const [messages, setMessages]     = useState([])
  const [input, setInput]           = useState('')
  const [name, setName]             = useState(() => localStorage.getItem('kbo_chat_name') || '')
  const [nameInput, setNameInput]   = useState('')
  const [nickError, setNickError]   = useState('')
  const [nickChecking, setNickChecking] = useState(false)
  const [hasNew, setHasNew]         = useState(false)
  const [connected, setConnected]   = useState(false)
  const [serverReady, setServerReady] = useState(false)
  const [sending, setSending]       = useState(false)
  const bottomRef = useRef(null)
  const lastIdRef = useRef(0)
  const myName    = useRef(name)
  const openRef   = useRef(open)
  openRef.current = open

  const wishInfo  = wishTeam ? KBO_TEAMS[wishTeam] : null
  const accent    = wishInfo?.color ?? '#c084fc'

  // 닉네임 중복 체크
  const checkNickname = async (n) => {
    if (!n?.trim()) return false
    try {
      const r = await fetch(`${API_BASE}/api/chat/nickname/check`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ name: n.trim() }),
      })
      const d = await r.json()
      return d.available ?? true
    } catch {
      return true // 서버 오류 시 허용
    }
  }

  const saveName = async () => {
    const n = nameInput.trim() || `야구팬${Math.floor(Math.random() * 9000 + 1000)}`
    setNickChecking(true)
    setNickError('')
    const available = await checkNickname(n)
    setNickChecking(false)
    if (!available) {
      setNickError(`'${n}'은(는) 이미 사용 중입니다. 다른 닉네임을 입력하거나 5분 후 재시도하세요.`)
      return
    }
    localStorage.setItem('kbo_chat_name', n)
    setName(n); myName.current = n
    nickCheckedAt = Date.now()
  }

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

  // 초기 연결
  useEffect(() => {
    let retryId = null
    const tryConnect = async () => {
      try {
        const r = await fetch(`${API_BASE}/api/chat/messages`)
        if (!r.ok) throw new Error(`${r.status}`)
        const d    = await r.json()
        const msgs = d.messages ?? []
        setMessages(msgs)
        if (msgs.length > 0) lastIdRef.current = msgs[msgs.length - 1].id
        setServerReady(true); setConnected(true)
      } catch {
        setServerReady(false); setConnected(false)
        retryId = setTimeout(tryConnect, RETRY_MS)
      }
    }
    tryConnect()
    return () => clearTimeout(retryId)
  }, [])

  useEffect(() => {
    if (!serverReady) return
    const id = setInterval(fetchNew, POLL_MS)
    return () => clearInterval(id)
  }, [serverReady, fetchNew])

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
    if (!input.trim() || !name || sending || !serverReady) return
    const text = input.trim()
    setInput('')
    setSending(true)
    try {
      await fetch(`${API_BASE}/api/chat/messages`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ name, text, teamKey: wishTeam ?? null }),
      })
      await fetchNew()
    } catch {
      setConnected(false)
    } finally {
      setSending(false)
    }
  }, [input, name, wishTeam, sending, serverReady, fetchNew])

  const onKey = e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send() } }

  const N = {
    raised: '6px 6px 16px var(--neu-sd), -4px -4px 10px var(--neu-sl)',
    inset:  'inset 2px 2px 6px var(--neu-sd), inset -1px -1px 4px var(--neu-sl)',
  }

  return (
    <>
      {open && (
        <div style={{
          position: 'fixed', bottom: '84px', right: '24px', zIndex: 1500,
          width: '320px', height: '460px',
          background: 'var(--neu-bg)',
          boxShadow: '12px 12px 32px var(--neu-sd), -8px -8px 20px var(--neu-sl)',
          borderRadius: '20px',
          display: 'flex', flexDirection: 'column',
          animation: 'kboChatUp 0.2s ease',
        }}>
          {/* 헤더 */}
          <div style={{
            padding: '12px 14px', flexShrink: 0,
            borderBottom: '1px solid rgba(var(--fg-rgb),0.06)',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            borderRadius: '20px 20px 0 0',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              {wishInfo && <TeamBadge teamKey={wishTeam} size={22} />}
              <span style={{ fontSize: '13px', fontWeight: 800, color: 'rgba(var(--fg-rgb),0.85)' }}>
                ⚾ KBO 채팅방
              </span>
              <span style={{ fontSize: '11px' }}>
                {connected
                  ? <span style={{ color: '#4ade80' }}>● 연결됨</span>
                  : serverReady
                    ? <span style={{ color: '#facc15' }}>● 재연결 중...</span>
                    : <span style={{ color: 'rgba(var(--fg-rgb),0.3)' }}>● 준비 중...</span>
                }
              </span>
            </div>
            <button onClick={() => setOpen(false)} style={{
              background: 'var(--neu-bg)', border: 'none', cursor: 'pointer',
              boxShadow: N.raised, borderRadius: '8px',
              width: '28px', height: '28px',
              fontSize: '16px', color: 'rgba(var(--fg-rgb),0.45)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>×</button>
          </div>

          {!name ? (
            /* 닉네임 설정 */
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '24px', gap: '10px' }}>
              <div style={{ fontSize: '40px', marginBottom: '4px' }}>
                {wishInfo
                  ? <TeamBadge teamKey={wishTeam} size={52} />
                  : '👋'
                }
              </div>
              <p style={{ fontSize: '14px', fontWeight: 700, color: 'rgba(var(--fg-rgb),0.8)', textAlign: 'center' }}>
                닉네임을 설정하세요
              </p>
              <p style={{ fontSize: '12px', color: 'rgba(var(--fg-rgb),0.35)', textAlign: 'center' }}>
                비워두면 랜덤으로 배정됩니다
              </p>
              <input
                value={nameInput}
                onChange={e => { setNameInput(e.target.value); setNickError('') }}
                onKeyDown={e => e.key === 'Enter' && saveName()}
                placeholder="닉네임 (최대 16자)"
                maxLength={16} autoFocus
                style={{
                  width: '100%', padding: '10px 14px', borderRadius: '10px',
                  background: 'var(--neu-bg)',
                  boxShadow: N.inset,
                  border: nickError ? `1px solid #f87171` : '1px solid transparent',
                  color: 'rgba(var(--fg-rgb),0.85)', fontSize: '14px', outline: 'none',
                  boxSizing: 'border-box',
                }}
              />
              {nickError && (
                <p style={{ fontSize: '11px', color: '#f87171', textAlign: 'center', lineHeight: 1.4 }}>
                  {nickError}
                </p>
              )}
              <button
                onClick={saveName}
                disabled={nickChecking}
                style={{
                  width: '100%', padding: '11px', borderRadius: '10px', border: 'none',
                  background: accent, color: '#fff',
                  fontSize: '14px', fontWeight: 800,
                  cursor: nickChecking ? 'not-allowed' : 'pointer',
                  opacity: nickChecking ? 0.7 : 1,
                  boxShadow: `0 4px 14px ${accent}50`,
                }}
              >
                {nickChecking ? '확인 중...' : '입장하기'}
              </button>
            </div>
          ) : (
            <>
              {/* 메시지 목록 */}
              <div style={{ flex: 1, overflowY: 'auto', padding: '12px 10px 4px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {messages.length === 0 && (
                  <div style={{ textAlign: 'center', marginTop: '40px' }}>
                    {serverReady
                      ? <span style={{ fontSize: '13px', color: 'rgba(var(--fg-rgb),0.25)' }}>첫 번째 메시지를 보내보세요!</span>
                      : <div>
                          <div style={{ fontSize: '24px', marginBottom: '8px' }}>⏳</div>
                          <span style={{ fontSize: '13px', color: 'rgba(var(--fg-rgb),0.3)' }}>서버 준비 중...<br/>잠시만 기다려주세요</span>
                        </div>
                    }
                  </div>
                )}
                {messages.map(msg => {
                  const isMe   = msg.name === myName.current
                  const mTeam  = msg.teamKey ? KBO_TEAMS[msg.teamKey] : null
                  return (
                    <div key={msg.id} style={{ display: 'flex', flexDirection: 'column', alignItems: isMe ? 'flex-end' : 'flex-start' }}>
                      {!isMe && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '3px', marginLeft: '32px' }}>
                          {mTeam && <TeamBadge teamKey={msg.teamKey} size={13} />}
                          <span style={{ fontSize: '10px', color: mTeam ? mTeam.color : 'rgba(var(--fg-rgb),0.35)' }}>
                            {msg.name}
                          </span>
                        </div>
                      )}
                      <div style={{ display: 'flex', alignItems: 'flex-end', gap: '5px', flexDirection: isMe ? 'row-reverse' : 'row' }}>
                        {/* 아바타 */}
                        <div style={{
                          width: '26px', height: '26px', borderRadius: '50%', flexShrink: 0,
                          background: mTeam ? mTeam.color : 'var(--neu-bg)',
                          boxShadow: mTeam ? `0 2px 8px ${mTeam.color}50` : N.raised,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: '9px', fontWeight: 800, color: '#fff',
                        }}>
                          {mTeam ? mTeam.short.slice(0, 2) : '⚾'}
                        </div>

                        <div style={{
                          maxWidth: '190px', padding: '8px 11px',
                          borderRadius: isMe ? '14px 14px 4px 14px' : '14px 14px 14px 4px',
                          background: isMe ? accent : 'var(--neu-bg)',
                          boxShadow: isMe ? `0 3px 10px ${accent}40` : N.raised,
                          color: isMe ? '#fff' : 'rgba(var(--fg-rgb),0.8)',
                          fontSize: '13px', lineHeight: 1.45, wordBreak: 'break-word',
                        }}>
                          {msg.text}
                        </div>

                        <span style={{ fontSize: '9px', color: 'rgba(var(--fg-rgb),0.25)', flexShrink: 0 }}>
                          {formatTime(msg.time)}
                        </span>
                      </div>
                    </div>
                  )
                })}
                <div ref={bottomRef} />
              </div>

              {/* 입력창 */}
              <div style={{ padding: '8px 10px 12px', borderTop: '1px solid rgba(var(--fg-rgb),0.06)', flexShrink: 0 }}>
                {wishInfo && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '6px' }}>
                    <TeamBadge teamKey={wishTeam} size={14} />
                    <span style={{ fontSize: '10px', color: accent, fontWeight: 700 }}>{wishInfo.short} 팬</span>
                    <span style={{ fontSize: '10px', color: 'rgba(var(--fg-rgb),0.3)' }}>· {name}</span>
                  </div>
                )}
                <div style={{ display: 'flex', gap: '6px' }}>
                  <input
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    onKeyDown={onKey}
                    placeholder={sending ? '전송 중...' : '메시지 입력...'}
                    maxLength={300}
                    disabled={sending || !serverReady}
                    style={{
                      flex: 1, padding: '8px 12px', borderRadius: '10px',
                      background: 'var(--neu-bg)', boxShadow: N.inset,
                      border: 'none',
                      color: 'rgba(var(--fg-rgb),0.85)', fontSize: '13px', outline: 'none',
                      opacity: (sending || !serverReady) ? 0.6 : 1,
                    }}
                  />
                  <button
                    onClick={send}
                    disabled={!input.trim() || sending || !serverReady}
                    style={{
                      padding: '8px 13px', borderRadius: '10px', border: 'none',
                      background: (input.trim() && !sending && serverReady) ? accent : 'var(--neu-bg)',
                      boxShadow: (input.trim() && !sending && serverReady) ? `0 3px 10px ${accent}50` : N.raised,
                      color: (input.trim() && !sending && serverReady) ? '#fff' : 'rgba(var(--fg-rgb),0.3)',
                      fontSize: '16px', cursor: (input.trim() && !sending && serverReady) ? 'pointer' : 'default',
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
          background: wishInfo ? wishInfo.color : 'var(--neu-bg)',
          boxShadow: wishInfo ? `0 4px 20px ${wishInfo.color}60` : N.raised,
          cursor: 'pointer', transition: 'all 0.2s',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '22px', color: wishInfo ? '#fff' : 'rgba(var(--fg-rgb),0.6)',
        }}
        onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.1)'}
        onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
      >
        {open ? '×' : (wishInfo ? wishInfo.short.slice(0, 2) : '⚾')}
        {hasNew && !open && (
          <span style={{
            position: 'absolute', top: '6px', right: '6px',
            width: '10px', height: '10px', borderRadius: '50%',
            background: '#f87171', border: '2px solid var(--neu-bg)',
          }} />
        )}
      </button>

      <style>{`
        @keyframes kboChatUp {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </>
  )
}
