import { useState, useEffect, useRef } from 'react'
import SectionShell from './SectionShell'

/* ─── constants ────────────────────────────────────────────────── */
const PRESET_MINUTES = [5, 10, 15, 20, 30, 45]

const INSTRUCTIONS = [
  "Choose 3-5 English structures before starting the conversation.",
  "The conversation should focus on real topics, especially game development, VFX, shaders, programming, technology, and daily life.",
  "Answer using the microphone instead of writing. The goal is to practice real speaking.",
  "Do not translate every sentence from Spanish. Try to create ideas directly in English.",
  "Focus on organizing ideas clearly before trying to speak perfectly.",
  "After each answer, review corrections and try to repeat the improved version."
]

const CHATGPT_RULES = [
  "Ask open questions that require complete answers.",
  "Do not interrupt pronunciation while speaking.",
  "Focus corrections on sentence structure, grammar, vocabulary, and prepositions.",
  "Explain why a sentence is incorrect.",
  "Provide a more natural version of the sentence.",
  "Encourage the user to answer again using the corrected structure."
]

const SESSION_STRUCTURE = [
  "1. Warm-up conversation (5 minutes).",
  "2. Main topic discussion (15-30 minutes).",
  "3. Correction and improvement phase.",
  "4. Repeat important corrected sentences.",
  "5. Save mistakes and structures for the next session."
]

/* ─── helpers ──────────────────────────────────────────────────── */
function formatCountdown(seconds) {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

/* ─── sub-components ───────────────────────────────────────────── */
function InstructionPanel() {
  const [open, setOpen] = useState(false)
  return (
    <div className="instruction-panel">
      <button type="button" className="instruction-toggle" onClick={() => setOpen((v) => !v)} aria-expanded={open}>
        <span>📋 How to run a conversation session</span>
        <span className="toggle-chevron">{open ? '▲' : '▼'}</span>
      </button>
      {open && (
        <div className="instruction-body">
          <p className="instruction-intro">
            <strong>Objective:</strong> Improve spontaneous speaking by using English structures naturally in real conversations.
          </p>
          <p className="instruction-label">Instructions:</p>
          <ol className="instruction-list">
            {INSTRUCTIONS.map((step, i) => <li key={i}>{step}</li>)}
          </ol>
          <p className="instruction-label">ChatGPT Rules / Prompt for your partner:</p>
          <ul className="instruction-list" style={{ listStyleType: 'disc', paddingLeft: '24px' }}>
            {CHATGPT_RULES.map((rule, i) => <li key={i}>{rule}</li>)}
          </ul>
          <p className="instruction-label">Session structure:</p>
          <ol className="instruction-list">
            {SESSION_STRUCTURE.map((step, i) => <li key={i}>{step}</li>)}
          </ol>
        </div>
      )}
    </div>
  )
}

/* ─── Countdown Timer ──────────────────────────────────────────── */
function CountdownTimer() {
  const [selectedMinutes, setSelectedMinutes] = useState(15)
  const [customInput, setCustomInput] = useState('')
  const [secondsLeft, setSecondsLeft] = useState(null)
  const [running, setRunning] = useState(false)
  const [finished, setFinished] = useState(false)
  const intervalRef = useRef(null)

  // derived
  const totalSeconds = (Number(customInput) || selectedMinutes) * 60
  const displaySeconds = secondsLeft ?? totalSeconds
  const pct = secondsLeft != null ? (secondsLeft / totalSeconds) * 100 : 100
  const isWarning = secondsLeft != null && secondsLeft <= 60 && secondsLeft > 0
  const isDanger  = secondsLeft != null && secondsLeft <= 10 && secondsLeft > 0

  useEffect(() => {
    if (running && secondsLeft != null) {
      intervalRef.current = setInterval(() => {
        setSecondsLeft((prev) => {
          if (prev <= 1) {
            clearInterval(intervalRef.current)
            setRunning(false)
            setFinished(true)
            return 0
          }
          return prev - 1
        })
      }, 1000)
    } else {
      clearInterval(intervalRef.current)
    }
    return () => clearInterval(intervalRef.current)
  }, [running])

  const handleStart = () => {
    const secs = (Number(customInput) > 0 ? Number(customInput) : selectedMinutes) * 60
    setSecondsLeft(secs)
    setFinished(false)
    setRunning(true)
  }

  const handlePause = () => setRunning(false)
  const handleResume = () => { if (secondsLeft > 0) setRunning(true) }

  const handleReset = () => {
    clearInterval(intervalRef.current)
    setRunning(false)
    setSecondsLeft(null)
    setFinished(false)
  }

  const handlePreset = (min) => {
    setSelectedMinutes(min)
    setCustomInput('')
    handleReset()
  }

  return (
    <div className="countdown-card">
      <div className="countdown-header">
        <h3>Session countdown</h3>
        <p>Set your time, start the session, then talk. The timer will alert you when the session ends.</p>
      </div>

      {/* Preset buttons */}
      <div className="countdown-presets">
        {PRESET_MINUTES.map((min) => (
          <button
            key={min}
            type="button"
            className={`preset-btn${selectedMinutes === min && !customInput ? ' is-active' : ''}`}
            onClick={() => handlePreset(min)}
            disabled={running}
          >
            {min}m
          </button>
        ))}
        <input
          type="number"
          min="1"
          max="120"
          className="custom-minutes-input"
          value={customInput}
          onChange={(e) => { setCustomInput(e.target.value); setSelectedMinutes(0); handleReset() }}
          placeholder="Custom"
          disabled={running}
        />
      </div>

      {/* Ring + time display */}
      <div className="countdown-ring-wrap">
        <svg className="countdown-ring" viewBox="0 0 120 120">
          <circle className="ring-bg" cx="60" cy="60" r="52" />
          <circle
            className={`ring-fill${isWarning ? ' warning' : ''}${isDanger ? ' danger' : ''}`}
            cx="60" cy="60" r="52"
            strokeDasharray="326.7"
            strokeDashoffset={326.7 * (1 - pct / 100)}
          />
        </svg>
        <div className={`countdown-time${isWarning ? ' warning' : ''}${isDanger ? ' danger' : ''}`}>
          {formatCountdown(displaySeconds)}
        </div>
      </div>

      {/* Finished alert */}
      {finished && (
        <div className="countdown-finished">
          ⏰ Time is up! Ask your partner or ChatGPT to review your sentences.
        </div>
      )}

      {/* Controls */}
      <div className="countdown-controls">
        {secondsLeft == null && !finished && (
          <button type="button" className="primary-button" onClick={handleStart}>
            ▶ Start session
          </button>
        )}
        {running && (
          <button type="button" className="secondary-button" onClick={handlePause}>
            ⏸ Pause
          </button>
        )}
        {!running && secondsLeft != null && !finished && (
          <button type="button" className="primary-button" onClick={handleResume}>
            ▶ Resume
          </button>
        )}
        {(running || secondsLeft != null || finished) && (
          <button type="button" className="secondary-button" onClick={handleReset}>
            ↺ Reset
          </button>
        )}
      </div>
    </div>
  )
}

/* ─── main component ───────────────────────────────────────────── */
export default function ConversationSection() {
  return (
    <SectionShell
      id="conversation"
      title="Conversation Practice"
      description="Set a session time, start speaking in English, and use the structures you have been training."
    >
      <InstructionPanel />
      <CountdownTimer />
    </SectionShell>
  )
}