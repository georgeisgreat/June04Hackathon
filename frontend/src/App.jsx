import { useState, useRef, useEffect } from 'react'
import './App.css'

// ── Mock seed data ────────────────────────────────────────────────────────────

const INIT_MINE = [
  { id: 'm1', role: 'user', content: 'is there a way to check redeemed or active coupons on my github account', ts: '10:32 AM' },
  { id: 'm2', role: 'assistant', content: 'There isn\'t a direct API to check "redeemed" or "active" coupons, but here are some approaches you can try:\n\n1. GitHub GraphQL API – You can query your account entitlements and benefits.\n2. Billing REST API – Check your active billing plans and associated discounts.\n3. Web UI Inspection – Sometimes the billing settings page shows active discounts.\n\nWant me to pull the relevant API docs and example queries for you?', ts: '10:32 AM' },
  { id: 'm3', role: 'user', content: 'yes, that would be helpful', ts: '10:33 AM' },
  { id: 'm4', role: 'assistant', content: 'Sure! I\'ll fetch the GraphQL and REST API details along with example queries.\n\n📄 GitHub GraphQL & Billing API Docs — Fetched 4 sources.', ts: '10:33 AM' },
]

const INIT_SHARED = [
  { id: 's1', author: 'Shreyas-30', content: 'Love the direction! Repo Radar could help devs quickly evaluate which repos are worth contributing to. The trend spotlight + health score combo is really powerful. 👍 2', ts: '10:41 AM', pushed: false },
  { id: 's2', author: 'Emily', content: 'Agree! I\'m thinking we can break it down into 3 core modules for MVP:\n• Trend Spotlight – detect emerging repos & topics\n• Health Score – activity, docs, tests, issues, responsiveness\n• Personalized Feed – tailored to dev interests & skills\n\nWe can start with GitHub data + simple heuristics and improve over time. 👍 1', ts: '10:43 AM', pushed: false },
  { id: 's3', author: 'Shreyas-30', content: 'For the health score, should we weight metrics differently? Maybe something like:\nhealth_score = (activity * 0.3) + (docs * 0.2) + (tests * 0.2) + (issues_response * 0.2) + (community * 0.1)\n\nWe can refine weights based on user feedback. 👍 1', ts: '10:48 AM', pushed: false },
  { id: 's4', author: 'Emily', content: 'That looks solid! GitHub GraphQL API for data, a small ETL job to aggregate metrics, PostgreSQL for storage, and a Next.js dashboard for the UI. We can deploy on Vercel + Edge Functions to keep it lean. 🚀 2', ts: '10:52 AM', pushed: false },
]

const INIT_COLLEAGUE = [
  { id: 'c1', role: 'user', content: 'What GitHub APIs should we use for the health score feature?', ts: '10:40 AM' },
  { id: 'c2', role: 'assistant', content: 'For the health score, I\'d recommend:\n\n1. REST API v3 – repo stats, commit activity, contributor stats\n2. GraphQL API v4 – flexible queries for issues, PRs, discussions\n3. Webhooks – real-time updates for activity tracking\n\nThe GraphQL API is most efficient for batching multiple metrics in one request.', ts: '10:40 AM' },
  { id: 'c3', role: 'user', content: 'Can you show me an example GraphQL query for repo health metrics?', ts: '10:45 AM' },
  { id: 'c4', role: 'assistant', content: 'Here\'s a query to get key health metrics:\n\nquery RepoHealth($owner: String!, $name: String!) {\n  repository(owner: $owner, name: $name) {\n    stargazerCount\n    forkCount\n    issues(states: OPEN) { totalCount }\n    pullRequests(states: OPEN) { totalCount }\n    defaultBranchRef {\n      target {\n        ... on Commit {\n          history(first: 1) {\n            nodes { committedDate }\n          }\n        }\n      }\n    }\n  }\n}', ts: '10:45 AM' },
]

// ── Mock AI ───────────────────────────────────────────────────────────────────

const AI_ANSWERS = {
  health: 'Health score weights I\'d suggest:\n• Commit frequency (30%) — recent activity signals liveness\n• Issue response time (25%) — maintainer responsiveness\n• Documentation (20%) — README + wiki quality\n• Test coverage (15%) — CI/CD presence\n• Community (10%) — contributor count, discussion activity',
  api: 'GitHub GraphQL API v4 is the best choice — batch multiple metrics in one round trip:\n\nquery {\n  repository(owner: "owner", name: "repo") {\n    stargazerCount\n    issues(states: OPEN) { totalCount }\n    pullRequests(states: OPEN) { totalCount }\n  }\n}\n\nAuthenticated requests get 5,000 points/hour. Use a personal access token.',
  deploy: 'Free deploy stack for the hackathon:\n1. Vercel – Next.js frontend (generous free tier)\n2. Railway – FastAPI backend (free trial credits)\n3. Supabase – PostgreSQL (free tier, 500 MB)\n\nTotal cost: $0. Deploy time: ~15 min.',
  default: 'Good question! Here\'s my take based on the shared context:\n\nStart simple — validate with real GitHub data before adding algorithm complexity. The key for a hackathon demo is a working end-to-end flow: fetch data → compute score → show badge. You can tune weights later.',
}

function mockAI(text) {
  return new Promise(res => setTimeout(() => {
    const q = text.toLowerCase()
    if (q.match(/health|score|weight|metric/)) return res(AI_ANSWERS.health)
    if (q.match(/api|graphql|query|rest/)) return res(AI_ANSWERS.api)
    if (q.match(/deploy|host|vercel|railway/)) return res(AI_ANSWERS.deploy)
    res(AI_ANSWERS.default)
  }, 700 + Math.random() * 600))
}

function ts() {
  return new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
}

let _seq = 500
const uid = () => `g${_seq++}`

// ── Design tokens ─────────────────────────────────────────────────────────────

const C = {
  bg: '#0d1117',
  surface: '#161b22',
  sidebar: '#13111a',
  border: '#21262d',
  border2: '#30363d',
  border3: '#444c56',
  text: '#e6edf3',
  textSub: '#8b949e',
  textMuted: '#484f58',
  green: '#3fb950',
  greenBg: '#1a2e1a',
  greenBorder: '#238636',
  blue: '#388bfd',
  blueBg: '#1c1f2e',
  blueBorder: '#1f3a6e',
  purple: '#a371f7',
  avatarColors: { S: '#f78166', E: '#3fb950', Y: '#388bfd', R: '#d2a8ff', A: '#79c0ff', default: '#8b949e' },
}

// ── Atoms ─────────────────────────────────────────────────────────────────────

function Avatar({ name, bot, size = 26 }) {
  if (bot) {
    return (
      <div style={{
        width: size, height: size, borderRadius: 6, flexShrink: 0,
        background: `linear-gradient(135deg, ${C.purple}, ${C.blue})`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: size * 0.52,
      }}>⚡</div>
    )
  }
  const letter = (name || '?')[0].toUpperCase()
  const bg = C.avatarColors[letter] || C.avatarColors.default
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%', flexShrink: 0,
      background: bg,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: size * 0.42, fontWeight: 700, color: '#0d1117',
    }}>{letter}</div>
  )
}

function GhostBtn({ children, onClick, active, accent, small, style: extra }) {
  const [hov, setHov] = useState(false)
  const clr = active ? C.green : accent ? C.blue : C.textSub
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        background: active ? C.greenBg : hov ? '#1c2128' : 'transparent',
        border: `1px solid ${active ? C.greenBorder : hov ? C.border3 : C.border2}`,
        borderRadius: 6,
        color: clr,
        fontSize: small ? 11 : 12,
        padding: small ? '2px 9px' : '4px 12px',
        cursor: 'pointer',
        display: 'inline-flex', alignItems: 'center', gap: 4,
        transition: 'all 0.12s',
        whiteSpace: 'nowrap',
        lineHeight: 1.5,
        ...extra,
      }}
    >{children}</button>
  )
}

// ── Message bubbles ───────────────────────────────────────────────────────────

function AIMsg({ msg, onShare }) {
  const [hov, setHov] = useState(false)
  return (
    <div
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{ marginBottom: 16, display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 5 }}>
        <Avatar bot size={22} />
        <span style={{ fontSize: 12.5, fontWeight: 500, color: '#c9d1d9' }}>GitHub Copilot</span>
        <span style={{ fontSize: 11, color: C.textMuted }}>{msg.ts}</span>
      </div>
      <div style={{
        maxWidth: '92%', background: C.surface,
        border: `1px solid ${C.border2}`,
        borderRadius: '2px 10px 10px 10px',
        padding: '9px 13px', fontSize: 13, lineHeight: 1.7,
        color: C.text, whiteSpace: 'pre-wrap', wordBreak: 'break-word',
        fontFamily: 'inherit',
      }}>{msg.content}</div>
      {hov && onShare && (
        <div style={{ marginTop: 5, display: 'flex', gap: 6 }}>
          <GhostBtn small onClick={() => onShare(msg)}>↑ Share to shared chat</GhostBtn>
        </div>
      )}
    </div>
  )
}

function UserMsg({ msg }) {
  return (
    <div style={{ marginBottom: 16, display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
      <span style={{ fontSize: 11, color: C.textMuted, marginBottom: 4 }}>{msg.ts}</span>
      <div style={{
        maxWidth: '85%', background: '#2d333b',
        border: `1px solid ${C.border3}`,
        borderRadius: '10px 10px 2px 10px',
        padding: '9px 13px', fontSize: 13, lineHeight: 1.7,
        color: C.text, whiteSpace: 'pre-wrap', wordBreak: 'break-word',
        fontFamily: 'inherit',
      }}>{msg.content}</div>
    </div>
  )
}

// ── Chat input bar ────────────────────────────────────────────────────────────

function InputBar({ onSend, placeholder, footer }) {
  const [val, setVal] = useState('')
  const send = () => { if (val.trim()) { onSend(val.trim()); setVal('') } }
  return (
    <div style={{ padding: '10px 14px 0', borderTop: `1px solid ${C.border}`, flexShrink: 0 }}>
      <div style={{
        background: C.surface, border: `1px solid ${C.border2}`,
        borderRadius: 10, padding: '8px 12px',
        display: 'flex', alignItems: 'center', gap: 8,
      }}>
        <input
          value={val}
          onChange={e => setVal(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { send(); e.preventDefault() } }}
          placeholder={placeholder}
          style={{
            flex: 1, background: 'transparent', border: 'none', outline: 'none',
            color: C.text, fontSize: 13, fontFamily: 'inherit',
          }}
        />
        <button
          onClick={send}
          style={{
            background: val.trim() ? C.greenBorder : 'transparent',
            border: `1px solid ${val.trim() ? '#2ea043' : C.border2}`,
            borderRadius: 6, padding: '3px 11px',
            color: val.trim() ? '#fff' : C.textMuted,
            fontSize: 13, cursor: val.trim() ? 'pointer' : 'default',
            transition: 'all 0.12s',
          }}
        >↑</button>
      </div>
      {footer && (
        <div style={{ textAlign: 'center', fontSize: 11, color: C.textMuted, padding: '7px 0 10px' }}>
          {footer}
        </div>
      )}
    </div>
  )
}

// ── Typing indicator ──────────────────────────────────────────────────────────

function Typing() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
      <Avatar bot size={22} />
      <span style={{ fontSize: 12.5, fontWeight: 500, color: '#c9d1d9' }}>GitHub Copilot</span>
      <span style={{ fontSize: 12, color: C.textMuted, animation: 'pulse 1.2s ease-in-out infinite' }}>thinking…</span>
    </div>
  )
}

// ── Left panel — my private chat ──────────────────────────────────────────────

function MyPanel({ messages, loading, onSend, onShare, pulledCount }) {
  const bottomRef = useRef(null)
  useEffect(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), [messages, loading])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', borderRight: `1px solid ${C.border}` }}>
      {/* header */}
      <div style={{
        padding: '0 14px', height: 52, borderBottom: `1px solid ${C.border}`,
        display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0,
      }}>
        <span style={{ fontSize: 13.5, fontWeight: 600, color: C.text, flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          Hackathon idea brainstorm
        </span>
        <span style={{
          fontSize: 11, padding: '2px 8px', borderRadius: 20,
          background: '#1c2128', color: C.textSub, border: `1px solid ${C.border3}`,
          display: 'flex', alignItems: 'center', gap: 4, whiteSpace: 'nowrap',
        }}>🔒 Private chat</span>
      </div>

      {/* pulled context pill */}
      {pulledCount > 0 && (
        <div style={{
          margin: '8px 14px', padding: '7px 11px',
          background: C.blueBg, border: `1px solid ${C.blueBorder}`,
          borderRadius: 6, fontSize: 12, color: '#7ca8f7',
          display: 'flex', alignItems: 'center', gap: 6,
        }}>
          <span>⚡</span>
          <span>{pulledCount} shared item{pulledCount !== 1 ? 's' : ''} grounding this conversation</span>
        </div>
      )}

      {/* messages */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '12px 14px 4px' }}>
        {messages.map(m =>
          m.role === 'assistant'
            ? <AIMsg key={m.id} msg={m} onShare={onShare} />
            : <UserMsg key={m.id} msg={m} />
        )}
        {loading && <Typing />}
        <div ref={bottomRef} />
      </div>

      <InputBar
        onSend={onSend}
        placeholder="Message Copilot…"
        footer="🔒 Private chat between you and Copilot · Claude Haiku 4.5"
      />
    </div>
  )
}

// ── Middle panel — shared room ────────────────────────────────────────────────

function SharedPanel({ items, onPull, pulled, onSend }) {
  const bottomRef = useRef(null)
  const [notify, setNotify] = useState(true)
  useEffect(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), [items])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', borderRight: `1px solid ${C.border}` }}>
      {/* header */}
      <div style={{
        padding: '0 14px', height: 52, borderBottom: `1px solid ${C.border}`,
        display: 'flex', alignItems: 'center', gap: 7, flexShrink: 0,
      }}>
        <span style={{ fontSize: 13.5, fontWeight: 600, color: C.text }}>Copilot friends</span>
        <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 20, background: C.greenBg, color: C.green, border: `1px solid ${C.greenBorder}` }}>
          Shared
        </span>
        <span style={{ fontSize: 11, color: C.textMuted }}>• 2 members</span>
        <span style={{ fontSize: 11, color: C.green, display: 'flex', alignItems: 'center', gap: 4 }}>
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: C.green, display: 'inline-block', animation: 'pulse 2s infinite' }} />
          Live
        </span>
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 5 }}>
          {['Invite', 'Share', 'Sync'].map(l => <GhostBtn key={l} small>{l}</GhostBtn>)}
          <GhostBtn small>···</GhostBtn>
        </div>
      </div>

      {/* notification banner */}
      {notify && (
        <div style={{
          margin: '8px 14px', padding: '10px 13px',
          background: C.surface, border: `1px solid ${C.border2}`,
          borderRadius: 6, display: 'flex', gap: 10, alignItems: 'flex-start',
        }}>
          <span style={{ fontSize: 16, marginTop: 1 }}>ℹ️</span>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 13, fontWeight: 500, color: C.text }}>Context from your private chat has been shared</div>
            <div style={{ fontSize: 12, color: C.textSub, marginTop: 2 }}>
              GitHub GraphQL &amp; Billing API Docs and related messages from "Hackathon idea brainstorm"
            </div>
          </div>
          <GhostBtn small accent>View details</GhostBtn>
          <button
            onClick={() => setNotify(false)}
            style={{ background: 'none', border: 'none', color: C.textMuted, cursor: 'pointer', fontSize: 15, lineHeight: 1, padding: '0 2px' }}
          >✕</button>
        </div>
      )}

      {/* shared messages */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '10px 14px 4px' }}>
        {items.map(item => (
          <div key={item.id} style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
            <Avatar name={item.author} size={28} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 3 }}>
                <span style={{ fontSize: 13, fontWeight: 600, color: C.text }}>{item.author}</span>
                <span style={{ fontSize: 11, color: C.textMuted }}>{item.ts}</span>
                {item.pushed && (
                  <span style={{
                    fontSize: 10, padding: '1px 6px', borderRadius: 10,
                    background: C.blueBg, color: '#7ca8f7', border: `1px solid ${C.blueBorder}`,
                  }}>pushed from chat</span>
                )}
              </div>
              <div style={{ fontSize: 13, lineHeight: 1.7, color: C.text, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                {item.content}
              </div>
              <div style={{ marginTop: 7 }}>
                <GhostBtn
                  small
                  active={pulled.has(item.id)}
                  onClick={() => onPull(item.id)}
                >
                  {pulled.has(item.id) ? '✓ Pulled into my chat' : '↓ Pull into my chat'}
                </GhostBtn>
              </div>
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      <InputBar
        onSend={onSend}
        placeholder="Message everyone…"
        footer="🔓 Shared · Messages and context sync in real time · Learn more"
      />
    </div>
  )
}

// ── Right panel — colleague's chat ────────────────────────────────────────────

function ColleaguePanel({ messages, loading, onSend }) {
  const bottomRef = useRef(null)
  useEffect(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), [messages, loading])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* header */}
      <div style={{
        padding: '0 14px', height: 52, borderBottom: `1px solid ${C.border}`,
        display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0,
      }}>
        <Avatar name="Emily" size={22} />
        <span style={{ fontSize: 13.5, fontWeight: 600, color: C.text, flex: 1 }}>Emily's Chat</span>
        <span style={{
          fontSize: 11, padding: '2px 8px', borderRadius: 20,
          background: '#1c2128', color: C.textSub, border: `1px solid ${C.border3}`,
        }}>🔒 Private chat</span>
      </div>

      {/* messages */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '12px 14px 4px' }}>
        {messages.map(m =>
          m.role === 'assistant'
            ? <AIMsg key={m.id} msg={m} />
            : <UserMsg key={m.id} msg={m} />
        )}
        {loading && <Typing />}
        <div ref={bottomRef} />
      </div>

      <InputBar
        onSend={onSend}
        placeholder="Message Copilot… (Emily)"
        footer="🔒 Private chat between Emily and Copilot · Claude Haiku 4.5"
      />
    </div>
  )
}

// ── Sidebar ───────────────────────────────────────────────────────────────────

function Sidebar() {
  return (
    <div style={{
      width: 216, background: C.sidebar, borderRight: `1px solid ${C.border}`,
      display: 'flex', flexDirection: 'column', flexShrink: 0,
    }}>
      {/* brand */}
      <div style={{ padding: '13px 12px 10px', borderBottom: `1px solid ${C.border}` }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{
            width: 26, height: 26, borderRadius: 6,
            background: `linear-gradient(135deg, ${C.purple}, ${C.blue})`,
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14,
          }}>⚡</div>
          <span style={{ fontSize: 14, fontWeight: 600, color: C.text }}>GitHub Copilot</span>
        </div>
      </div>

      {/* nav */}
      <div style={{ padding: '6px 4px' }}>
        {[
          ['✏️', 'New chat'],
          ['🤖', 'Agents'],
          ['🌐', 'Spaces'],
          ['⚡', 'Spark', 'Preview'],
        ].map(([icon, label, badge]) => (
          <button key={label} style={{
            width: '100%', display: 'flex', alignItems: 'center', gap: 8,
            padding: '7px 10px', background: 'transparent', border: 'none',
            borderRadius: 6, color: C.textSub, fontSize: 13, cursor: 'pointer', textAlign: 'left',
          }}>
            <span>{icon}</span>
            <span style={{ flex: 1 }}>{label}</span>
            {badge && (
              <span style={{
                fontSize: 10, padding: '1px 6px', borderRadius: 10,
                background: '#1c2128', color: C.textSub, border: `1px solid ${C.border2}`,
              }}>{badge}</span>
            )}
          </button>
        ))}

        {/* chat history */}
        <div style={{ margin: '10px 10px 5px', fontSize: 11, color: C.textMuted, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          Today
        </div>
        {[
          ['Hackathon idea brainstorm', true],
          ['API integration help', false],
        ].map(([label, active]) => (
          <button key={label} style={{
            width: '100%', padding: '6px 10px',
            background: active ? '#1c2128' : 'transparent',
            border: 'none', borderRadius: 6,
            color: active ? C.text : C.textSub,
            fontSize: 12.5, cursor: 'pointer', textAlign: 'left',
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          }}>{label}</button>
        ))}
      </div>

      {/* user footer */}
      <div style={{
        marginTop: 'auto', padding: '12px', borderTop: `1px solid ${C.border}`,
        display: 'flex', alignItems: 'center', gap: 8,
      }}>
        <Avatar name="Shreyas-30" size={26} />
        <div>
          <div style={{ fontSize: 12.5, fontWeight: 500, color: C.text }}>Shreyas-30</div>
          <div style={{ fontSize: 11, color: C.textMuted }}>Copilot Free</div>
        </div>
      </div>
    </div>
  )
}

// ── Root ──────────────────────────────────────────────────────────────────────

export default function App() {
  const [mine, setMine] = useState(INIT_MINE)
  const [shared, setShared] = useState(INIT_SHARED)
  const [colleague, setColleague] = useState(INIT_COLLEAGUE)
  const [pulled, setPulled] = useState(new Set())
  const [myLoading, setMyLoading] = useState(false)
  const [colleagueLoading, setColleagueLoading] = useState(false)

  async function sendMine(text) {
    setMine(p => [...p, { id: uid(), role: 'user', content: text, ts: ts() }])
    setMyLoading(true)
    const reply = await mockAI(text)
    setMyLoading(false)
    setMine(p => [...p, { id: uid(), role: 'assistant', content: reply, ts: ts() }])
  }

  function shareMsg(msg) {
    const idx = mine.findIndex(m => m.id === msg.id)
    const prevMsg = idx > 0 && mine[idx - 1].role === 'user' ? mine[idx - 1] : null
    const content = prevMsg
      ? `Q: ${prevMsg.content}\n\nA: ${msg.content}`
      : msg.content
    setShared(p => [...p, { id: uid(), author: 'Shreyas-30', content, ts: ts(), pushed: true }])
  }

  function sendShared(text) {
    setShared(p => [...p, { id: uid(), author: 'Shreyas-30', content: text, ts: ts(), pushed: false }])
  }

  function pullItem(id) {
    setPulled(p => new Set([...p, id]))
  }

  async function sendColleague(text) {
    setColleague(p => [...p, { id: uid(), role: 'user', content: text, ts: ts() }])
    setColleagueLoading(true)
    const reply = await mockAI(text)
    setColleagueLoading(false)
    setColleague(p => [...p, { id: uid(), role: 'assistant', content: reply, ts: ts() }])
  }

  return (
    <div style={{
      display: 'flex', height: '100vh', background: C.bg,
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif',
      color: C.text, overflow: 'hidden',
    }}>
      <Sidebar />
      <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', overflow: 'hidden' }}>
        <MyPanel
          messages={mine}
          loading={myLoading}
          onSend={sendMine}
          onShare={shareMsg}
          pulledCount={pulled.size}
        />
        <SharedPanel
          items={shared}
          onPull={pullItem}
          pulled={pulled}
          onSend={sendShared}
        />
        <ColleaguePanel
          messages={colleague}
          loading={colleagueLoading}
          onSend={sendColleague}
        />
      </div>
    </div>
  )
}
