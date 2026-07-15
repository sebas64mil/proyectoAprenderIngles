import { useState, useCallback } from 'react'
import SectionShell from './SectionShell'

/* ─── helpers ─────────────────────────────────────────────────── */
function getSounds(category) {
  return category?.sounds ?? category?.pairs ?? []
}

function totalPracticedInCategory(category) {
  return getSounds(category).filter((s) => s.practiceCount > 0).length
}

function xpFromCategory(categories) {
  return categories.reduce(
    (sum, cat) => sum + getSounds(cat).reduce((s2, sound) => s2 + sound.practiceCount * 10, 0),
    0,
  )
}

function levelFromXp(xp) {
  if (xp < 50) return { level: 1, title: 'Beginner', next: 50 }
  if (xp < 150) return { level: 2, title: 'Explorer', next: 150 }
  if (xp < 300) return { level: 3, title: 'Practitioner', next: 300 }
  if (xp < 500) return { level: 4, title: 'Advanced', next: 500 }
  return { level: 5, title: 'Master', next: null }
}

const INSTRUCTIONS = [
  "Practice sounds individually before combining them.",
  "Focus on mouth position, tongue position, and airflow.",
  "Practice minimal pairs that change only one sound.",
  "Repeat words slowly first, then increase speed.",
  "Use tongue twisters to combine sounds naturally."
]

const SESSION_STRUCTURE = [
  "1. Review the sound.",
  "2. Practice individual words.",
  "3. Practice minimal pairs.",
  "4. Repeat sentences.",
  "5. Practice a tongue twister."
]

const EXAMPLES = [
  { contrast: "SH vs CH", words: ["ship / chip", "sheep / cheap", "share / chair"] },
  { contrast: "R vs L", words: ["right / light", "road / load"] }
]

/* ─── sub-components ──────────────────────────────────────────── */
function InstructionPanel() {
  const [open, setOpen] = useState(false)
  return (
    <div className="instruction-panel">
      <button
        type="button"
        className="instruction-toggle"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
      >
        <span>📋 How to practice phonetics</span>
        <span className="toggle-chevron">{open ? '▲' : '▼'}</span>
      </button>
      {open && (
        <div className="instruction-body">
          <p className="instruction-intro">
            <strong>Objective:</strong> Improve pronunciation by training individual sounds and difficult contrasts.
          </p>
          <p className="instruction-label">Instructions:</p>
          <ol className="instruction-list">
            {INSTRUCTIONS.map((step, i) => <li key={i}>{step}</li>)}
          </ol>
          <p className="instruction-label">Session structure:</p>
          <ol className="instruction-list">
            {SESSION_STRUCTURE.map((step, i) => <li key={i}>{step}</li>)}
          </ol>
          <p className="instruction-label">Key contrast examples:</p>
          <ul className="instruction-list" style={{ listStyleType: 'none', paddingLeft: 0 }}>
            {EXAMPLES.map((ex, i) => (
              <li key={i} style={{ marginBottom: '10px', padding: '10px', background: 'var(--surface-strong)', borderRadius: '8px', border: '1px solid var(--border)' }}>
                <strong>{ex.contrast}</strong>
                <p style={{ margin: '4px 0 0', color: 'var(--text-muted)' }}>{ex.words.join(' · ')}</p>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}

function XpBar({ xp }) {
  const { level, title, next } = levelFromXp(xp)
  const prevThreshold = [0, 0, 50, 150, 300, 500][level]
  const pct = next ? Math.round(((xp - prevThreshold) / (next - prevThreshold)) * 100) : 100
  return (
    <div className="xp-bar-wrap">
      <div className="xp-bar-label">
        <span className="xp-level-badge">Lv {level} · {title}</span>
        <span className="xp-value">⚡ {xp} XP</span>
      </div>
      <div className="progress-track">
        <div className="progress-fill xp-fill" style={{ width: `${pct}%` }} />
      </div>
      {next && <p className="xp-hint">{next - xp} XP to level {level + 1}</p>}
    </div>
  )
}

function CategoryBar({ categories, activeCategoryId, onSelect }) {
  return (
    <div className="category-selector">
      {categories.map((cat) => {
        const sounds = getSounds(cat)
        const practiced = sounds.filter((s) => s.practiceCount > 0).length
        const pct = sounds.length ? Math.round((practiced / sounds.length) * 100) : 0
        return (
          <button
            key={cat.id}
            type="button"
            className={`category-pill${activeCategoryId === cat.id ? ' is-active' : ''}`}
            onClick={() => onSelect(cat.id)}
          >
            <span className="cat-name">{cat.name}</span>
            <span className="cat-progress">{pct}%</span>
          </button>
        )
      })}
    </div>
  )
}

function SoundGrid({ sounds, activeSoundId, onSelect, onRandom }) {
  return (
    <div className="sound-grid-wrap">
      <div className="sound-grid-header">
        <span className="section-label">Choose a sound</span>
        <button type="button" className="random-btn" onClick={onRandom}>
          🎲 Random
        </button>
      </div>
      <div className="sound-grid">
        {sounds.map((sound) => {
          const mastered = sound.practiceCount >= 5
          return (
            <button
              key={sound.id}
              type="button"
              className={`sound-chip${activeSoundId === sound.id ? ' is-active' : ''}${mastered ? ' is-mastered' : ''}`}
              onClick={() => onSelect(sound.id)}
              title={sound.label}
            >
              <span className="sound-ipa">{sound.symbol ?? sound.label}</span>
              {mastered && <span className="mastered-dot" title="Mastered" />}
            </button>
          )
        })}
      </div>
    </div>
  )
}

function PracticeCard({ sound, onMarkPractice, wordDraft, setWordDraft, onAddWord, onUpdateNotes, formatDate }) {
  const mastered = sound.practiceCount >= 5
  return (
    <div className="practice-card">
      {/* IPA hero */}
      <div className="ipa-hero">
        <span className="ipa-symbol">{sound.symbol ?? sound.label}</span>
        <div className="ipa-meta">
          <h3>{sound.label}</h3>
          {mastered && <span className="mastered-badge">🏅 Mastered</span>}
        </div>
      </div>

      {/* Notes / mouth position */}
      {sound.notes && (
        <div className="sound-notes">
          <span className="section-label">Mouth position</span>
          <p>{sound.notes}</p>
        </div>
      )}

      {/* Example words */}
      {sound.words && sound.words.length > 0 && (
        <div className="sound-words">
          <span className="section-label">Practice words</span>
          <div className="chip-row">
            {sound.words.map((word) => (
              <span key={word} className="chip word-chip">{word}</span>
            ))}
          </div>
        </div>
      )}

      {/* Add word */}
      <div className="word-entry-row">
        <input
          type="text"
          value={wordDraft}
          onChange={(e) => setWordDraft(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') onAddWord() }}
          placeholder="Add a word or phrase to practice…"
        />
        <button type="button" className="secondary-button" onClick={onAddWord}>
          Add
        </button>
      </div>

      {/* Notes textarea */}
      <label className="field-block">
        <span>Your notes</span>
        <textarea
          rows={3}
          value={sound.notes ?? ''}
          onChange={(e) => onUpdateNotes(e.target.value)}
          placeholder="Write pronunciation reminders or self-correction notes…"
        />
      </label>

      {/* Stats + action */}
      <div className="practice-card-footer">
        <div className="practice-stats">
          <span>🔁 Practiced <strong>{sound.practiceCount}</strong> times</span>
          {sound.lastPracticed && (
            <span>📅 Last: <strong>{formatDate(sound.lastPracticed)}</strong></span>
          )}
          <span>⚡ +10 XP per practice</span>
        </div>
        <button type="button" className="primary-button mark-btn" onClick={onMarkPractice}>
          ✅ Mark as practiced
        </button>
      </div>
    </div>
  )
}

/* ─── main component ──────────────────────────────────────────── */
export default function PhoneticsSection({
  phonetics,
  wordDrafts,
  setWordDrafts,
  onMarkPractice,
  onAddWord,
  onUpdateNotes,
  formatDate,
}) {
  const [activeCategoryId, setActiveCategoryId] = useState(phonetics[0]?.id ?? null)
  const [activeSoundId, setActiveSoundId] = useState(null)

  const activeCategory = phonetics.find((c) => c.id === activeCategoryId)
  const sounds = activeCategory ? getSounds(activeCategory) : []
  const activeSound = sounds.find((s) => s.id === activeSoundId) ?? null

  const xp = xpFromCategory(phonetics)

  const handleSelectCategory = useCallback((catId) => {
    setActiveCategoryId(catId)
    setActiveSoundId(null)
  }, [])

  const handleSelectSound = useCallback((soundId) => {
    setActiveSoundId(soundId)
  }, [])

  const handleRandom = useCallback(() => {
    if (!sounds.length) return
    const idx = Math.floor(Math.random() * sounds.length)
    setActiveSoundId(sounds[idx].id)
  }, [sounds])

  const handleAddWord = useCallback(() => {
    if (!activeCategory || !activeSound) return
    onAddWord(activeCategory.id, activeSound.id)
  }, [activeCategory, activeSound, onAddWord])

  // Category progress bar
  const catProgress = activeCategory
    ? { total: sounds.length, practiced: totalPracticedInCategory(activeCategory) }
    : null

  return (
    <SectionShell id="phonetics" title="Phonetic Training" description="Select a category, pick a sound, and train your pronunciation with IPA symbols and example words.">
      <InstructionPanel />

      <XpBar xp={xp} />

      {/* Category progress */}
      {catProgress && (
        <div className="cat-progress-row">
          <span className="section-label">
            {activeCategory.name} — {catProgress.practiced}/{catProgress.total} sounds practiced
          </span>
          <div className="progress-track">
            <div
              className="progress-fill"
              style={{ width: `${catProgress.total ? (catProgress.practiced / catProgress.total) * 100 : 0}%` }}
            />
          </div>
        </div>
      )}

      <CategoryBar
        categories={phonetics}
        activeCategoryId={activeCategoryId}
        onSelect={handleSelectCategory}
      />

      {activeCategory && (
        <SoundGrid
          sounds={sounds}
          activeSoundId={activeSoundId}
          onSelect={handleSelectSound}
          onRandom={handleRandom}
        />
      )}

      {activeSound && activeCategory ? (
        <PracticeCard
          sound={activeSound}
          onMarkPractice={() => onMarkPractice(activeCategory.id, activeSound.id)}
          wordDraft={wordDrafts[activeSound.id] || ''}
          setWordDraft={(val) =>
            setWordDrafts((prev) => ({ ...prev, [activeSound.id]: val }))
          }
          onAddWord={handleAddWord}
          onUpdateNotes={(val) => onUpdateNotes(activeCategory.id, activeSound.id, val)}
          formatDate={formatDate}
        />
      ) : (
        <div className="empty-state phonetics-empty">
          {activeCategory
            ? '← Select a sound above or press 🎲 Random to start practicing.'
            : 'Select a category to get started.'}
        </div>
      )}
    </SectionShell>
  )
}