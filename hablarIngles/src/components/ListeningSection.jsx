import { useState } from 'react'
import SectionShell from './SectionShell'

/* ─── data ─────────────────────────────────────────────────────── */
const OBJECTIVE = "Improve understanding of natural English and develop speaking rhythm."

const INSTRUCTIONS = [
  "Choose videos related to your interests: VFX, shaders, game development, programming, or technology.",
  "Prefer short clips between 2-5 minutes.",
  "Listen first without subtitles.",
  "Identify the general idea before searching for individual words.",
  "Use subtitles only after the first listening attempt.",
  "Extract useful expressions, not isolated vocabulary."
]

const SHADOWING_METHOD = [
  "Listen to one sentence.",
  "Pause the video.",
  "Repeat the sentence copying rhythm and intonation.",
  "Repeat until it feels natural.",
  "Record yourself if possible."
]

const REVIEW_ITEMS = [
  "Save useful expressions.",
  "Save difficult sounds.",
  "Save new technical vocabulary.",
  "Add mistakes discovered during listening."
]

const VIDEO_IDEAS = [
  'GDC talks — Game Developers Conference (YouTube)',
  'Corridor Crew — VFX artists react to movie effects',
  'The Cherno — C++ and game engine programming',
  'Sebastian Lague — creative programming & visual algorithms',
  'Fireship — concise programming topics',
  'Lex Fridman — deep technical conversations',
  'TED / TED-Ed — varied topics, clear pronunciation',
]

/* ─── sub-components ───────────────────────────────────────────── */
function RuleCard({ icon, title, text }) {
  return (
    <div className="listening-rule-card">
      <div className="listening-rule-icon">{icon}</div>
      <div>
        <h4>{title}</h4>
        <p>{text}</p>
      </div>
    </div>
  )
}

/* ─── Listening log ────────────────────────────────────────────── */
const EMPTY_LOG = { video: '', duration: '', understood: '', missed: '', expressions: '', shadowed: '' }

function ListeningLog() {
  const [entries, setEntries] = useState([])
  const [draft, setDraft] = useState(EMPTY_LOG)
  const [step, setStep] = useState(1) // wizard steps 1-3

  const setField = (key, value) => setDraft((prev) => ({ ...prev, [key]: value }))

  const handleSave = () => {
    if (!draft.video.trim() && !draft.understood.trim()) return
    setEntries((prev) => [{ ...draft, id: Date.now() }, ...prev])
    setDraft(EMPTY_LOG)
    setStep(1)
  }

  return (
    <div className="listening-log">
      <div className="listening-log-header">
        <span className="section-label">📓 Session log</span>
        <p>Track each listening session. Compare what you understood with the real subtitles.</p>
      </div>

      {/* Step wizard */}
      <div className="log-steps">
        <div className="log-step-tabs">
          {['1. Listen', '2. Compare', '3. Shadow'].map((label, i) => (
            <button
              key={label}
              type="button"
              className={`log-step-tab${step === i + 1 ? ' is-active' : ''}`}
              onClick={() => setStep(i + 1)}
            >
              {label}
            </button>
          ))}
        </div>

        {step === 1 && (
          <div className="log-form">
            <label className="field-block">
              <span>Video / source</span>
              <input type="text" value={draft.video} onChange={(e) => setField('video', e.target.value)} placeholder="e.g. GDC talk: 'Building a Shader System'" />
            </label>
            <label className="field-block">
              <span>Duration listened</span>
              <input type="text" value={draft.duration} onChange={(e) => setField('duration', e.target.value)} placeholder="e.g. 5 min, 00:00–05:30" />
            </label>
            <label className="field-block">
              <span>What you understood (without subtitles)</span>
              <textarea rows={4} value={draft.understood} onChange={(e) => setField('understood', e.target.value)} placeholder="Write the key ideas, words, or phrases you caught…" />
            </label>
            <button type="button" className="primary-button" onClick={() => setStep(2)}>Next →</button>
          </div>
        )}

        {step === 2 && (
          <div className="log-form">
            <p className="step-hint">Now check the subtitles and see what you missed or misunderstood.</p>
            <label className="field-block">
              <span>What you missed or got wrong</span>
              <textarea rows={4} value={draft.missed} onChange={(e) => setField('missed', e.target.value)} placeholder="Write the parts you didn't catch or misunderstood…" />
            </label>
            <label className="field-block">
              <span>Expressions / structures to save</span>
              <textarea rows={4} value={draft.expressions} onChange={(e) => setField('expressions', e.target.value)} placeholder="Natural phrases, connectors, idioms, technical vocabulary…" />
            </label>
            <div className="button-row">
              <button type="button" className="secondary-button" onClick={() => setStep(1)}>← Back</button>
              <button type="button" className="primary-button" onClick={() => setStep(3)}>Next →</button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="log-form">
            <p className="step-hint">Pick 2–3 sentences from the video and shadow them. Write the ones you practiced.</p>
            <label className="field-block">
              <span>Sentences you shadowed</span>
              <textarea rows={4} value={draft.shadowed} onChange={(e) => setField('shadowed', e.target.value)} placeholder="e.g. 'The main goal is to reduce draw calls.'" />
            </label>
            <div className="button-row">
              <button type="button" className="secondary-button" onClick={() => setStep(2)}>← Back</button>
              <button type="button" className="primary-button" onClick={handleSave}>✅ Save session</button>
            </div>
          </div>
        )}
      </div>

      {/* Past entries */}
      {entries.length > 0 && (
        <div className="log-history">
          <span className="section-label">Past listening sessions</span>
          <div className="log-entry-list">
            {entries.map((entry) => (
              <div key={entry.id} className="log-entry">
                <div className="log-entry-head">
                  <strong>{entry.video || 'Untitled session'}</strong>
                  {entry.duration && <span className="log-duration">⏱ {entry.duration}</span>}
                </div>
                <div className="log-entry-grid">
                  <div>
                    <span className="section-label">Understood</span>
                    <p>{entry.understood || '—'}</p>
                  </div>
                  <div>
                    <span className="section-label">Missed</span>
                    <p>{entry.missed || '—'}</p>
                  </div>
                  <div>
                    <span className="section-label">Expressions saved</span>
                    <p>{entry.expressions || '—'}</p>
                  </div>
                  <div>
                    <span className="section-label">Shadowed sentences</span>
                    <p>{entry.shadowed || '—'}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

/* ─── main component ───────────────────────────────────────────── */
export default function ListeningSection() {
  const [tab, setTab] = useState('rules')

  return (
    <SectionShell
      id="listening"
      title="Listening & Shadowing"
      description="Improve comprehension by listening without subtitles, comparing what you understood, and shadowing natural speech."
    >
      {/* Tab bar */}
      <div className="listening-tabs">
        <button type="button" className={`pill-button${tab === 'rules' ? ' is-active' : ''}`} onClick={() => setTab('rules')}>
          📋 Rules
        </button>
        <button type="button" className={`pill-button${tab === 'method' ? ' is-active' : ''}`} onClick={() => setTab('method')}>
          🔁 Shadowing method
        </button>
        <button type="button" className={`pill-button${tab === 'videos' ? ' is-active' : ''}`} onClick={() => setTab('videos')}>
          🎬 Video ideas
        </button>
        <button type="button" className={`pill-button${tab === 'log' ? ' is-active' : ''}`} onClick={() => setTab('log')}>
          📓 Session log
        </button>
      </div>

      {tab === 'rules' && (
        <div className="method-card">
          <h3>Instructions</h3>
          <p><strong>Objective:</strong> {OBJECTIVE}</p>
          <ol className="shadowing-steps">
            {INSTRUCTIONS.map((step, i) => (
              <li key={i} className="shadowing-step">
                <span className="step-number">{i + 1}</span>
                <span>{step}</span>
              </li>
            ))}
          </ol>
        </div>
      )}

      {tab === 'method' && (
        <div className="method-card">
          <h3>Shadowing Method</h3>
          <ol className="shadowing-steps">
            {SHADOWING_METHOD.map((step, i) => (
              <li key={i} className="shadowing-step">
                <span className="step-number">{i + 1}</span>
                <span>{step}</span>
              </li>
            ))}
          </ol>
          <div className="method-tips">
            <h4>⚡ Review / What to save:</h4>
            <ul>
              {REVIEW_ITEMS.map((item, i) => (
                <li key={i}>{item}</li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {tab === 'videos' && (
        <div className="video-ideas-card">
          <h3>Recommended video sources</h3>
          <p>Choose topics related to your interests. You will understand more and stay motivated longer.</p>
          <ul className="video-list">
            {VIDEO_IDEAS.map((idea) => (
              <li key={idea} className="video-item">
                <span className="video-bullet">▸</span>
                <span>{idea}</span>
              </li>
            ))}
          </ul>
          <div className="video-tip">
            <strong>Tip:</strong> Start with speakers who speak clearly and at a medium pace. Increase difficulty as you improve.
          </div>
        </div>
      )}

      {tab === 'log' && <ListeningLog />}
    </SectionShell>
  )
}
