import { useState, useCallback, useMemo, useEffect } from 'react'
import SectionShell from './SectionShell'

/* ─── helpers ──────────────────────────────────────────────────── */
function getAllStructures(structures) {
  return structures.flatMap((cat) =>
    cat.items.map((item) => ({ ...item, categoryId: cat.id, categoryTitle: cat.title })),
  )
}

function totalPracticed(structures) {
  return structures.reduce((sum, cat) => sum + cat.items.filter((i) => i.practiceCount > 0).length, 0)
}

function totalItems(structures) {
  return structures.reduce((sum, cat) => sum + cat.items.length, 0)
}

function totalXp(structures) {
  return structures.reduce(
    (sum, cat) => sum + cat.items.reduce((s2, item) => s2 + item.practiceCount * 15, 0),
    0,
  )
}

function levelFromXp(xp) {
  if (xp < 60) return { level: 1, title: 'Beginner', next: 60 }
  if (xp < 180) return { level: 2, title: 'Builder', next: 180 }
  if (xp < 360) return { level: 3, title: 'Practitioner', next: 360 }
  if (xp < 600) return { level: 4, title: 'Fluent', next: 600 }
  return { level: 5, title: 'Master', next: null }
}

function pickRandom(all, excludeId) {
  const pool = all.length > 1 ? all.filter((s) => s.id !== excludeId) : all
  return pool[Math.floor(Math.random() * pool.length)]
}

const INSTRUCTIONS = [
  "Practice 3-5 structures per session.",
  "Use the structures in different contexts, not only isolated sentences.",
  "Create examples related to personal interests and technical topics.",
  "Repeat the same structure with different vocabulary.",
  "Focus on using the structure naturally during conversation."
]

const PRACTICE_METHOD = [
  "1. Learn the pattern.",
  "2. Understand when it is used.",
  "3. Create simple examples.",
  "4. Use it during conversation.",
  "5. Review mistakes and repeat."
]

const EXAMPLES = [
  { structure: "I use X to + verb", practice: "I use shaders to create visual effects." },
  { structure: "The main goal is to + verb", practice: "The main goal is to improve immersion." },
  { structure: "Compared to X, Y is...", practice: "Compared to particles, shaders are more flexible." }
]

/* ─── sub-components ───────────────────────────────────────────── */
function InstructionPanel() {
  const [open, setOpen] = useState(false)
  return (
    <div className="instruction-panel">
      <button type="button" className="instruction-toggle" onClick={() => setOpen((v) => !v)} aria-expanded={open}>
        <span>📋 How to train structures</span>
        <span className="toggle-chevron">{open ? '▲' : '▼'}</span>
      </button>
      {open && (
        <div className="instruction-body">
          <p className="instruction-intro">
            <strong>Objective:</strong> Build automatic sentence patterns instead of translating from Spanish.
          </p>
          <p className="instruction-label">Instructions:</p>
          <ol className="instruction-list">
            {INSTRUCTIONS.map((step, i) => <li key={i}>{step}</li>)}
          </ol>
          <p className="instruction-label">Practice method:</p>
          <ol className="instruction-list">
            {PRACTICE_METHOD.map((step, i) => <li key={i}>{step}</li>)}
          </ol>
          <p className="instruction-label">Key examples:</p>
          <ul className="instruction-list" style={{ listStyleType: 'none', paddingLeft: 0 }}>
            {EXAMPLES.map((ex, i) => (
              <li key={i} style={{ marginBottom: '10px', padding: '10px', background: 'var(--surface-strong)', borderRadius: '8px', border: '1px solid var(--border)' }}>
                <strong>{ex.structure}</strong>
                <p style={{ margin: '4px 0 0', fontStyle: 'italic', color: 'var(--accent-strong)' }}>"{ex.practice}"</p>
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
  const prevThreshold = [0, 0, 60, 180, 360, 600][level]
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

function GlobalProgress({ structures }) {
  const practiced = totalPracticed(structures)
  const total = totalItems(structures)
  const pct = total ? Math.round((practiced / total) * 100) : 0
  return (
    <div className="global-progress">
      <div className="global-progress-label">
        <span className="section-label">Overall progress</span>
        <span className="gp-fraction">{practiced}/{total} structures practiced</span>
      </div>
      <div className="progress-track large">
        <div className="progress-fill" style={{ width: `${pct}%` }} />
        <span className="progress-pct">{pct}%</span>
      </div>
      <div className="cat-progress-list">
        {structures.map((cat) => {
          const cp = cat.items.filter((i) => i.practiceCount > 0).length
          const ct = cat.items.length
          const cpct = ct ? Math.round((cp / ct) * 100) : 0
          return (
            <div key={cat.id} className="cat-mini-progress">
              <span className="cat-mini-name">{cat.title}</span>
              <div className="progress-track mini">
                <div className="progress-fill" style={{ width: `${cpct}%` }} />
              </div>
              <span className="cat-mini-pct">{cp}/{ct}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function Flashcard({ structure, onRemember, onSkip, skipped }) {
  if (!structure) {
    return (
      <div className="flashcard empty-flashcard">
        <p>🎉 You have practiced all structures! Keep reviewing to strengthen them.</p>
      </div>
    )
  }
  const mastered = structure.practiceCount >= 5
  return (
    <div className={`flashcard${mastered ? ' is-mastered' : ''}`}>
      <div className="flashcard-header">
        <span className="flashcard-category">{structure.categoryTitle}</span>
        {mastered && <span className="mastered-badge">🏅 Mastered</span>}
        {skipped && <span className="skipped-badge">⏭ Skipped before</span>}
      </div>
      <div className="flashcard-pattern">
        <span className="structure-label">Pattern</span>
        <h2 className="structure-name">{structure.name}</h2>
      </div>
      <div className="flashcard-body">
        <div className="flashcard-section">
          <span className="section-label">When to use it</span>
          <p>{structure.explanation}</p>
        </div>
        {structure.examples?.length > 0 && (
          <div className="flashcard-section">
            <span className="section-label">Examples</span>
            <ul className="example-list-ul">
              {structure.examples.map((ex) => (
                <li key={ex} className="example-item">"{ex}"</li>
              ))}
            </ul>
          </div>
        )}
      </div>
      <div className="flashcard-stats">
        <span>🔁 Practiced <strong>{structure.practiceCount}×</strong></span>
        <span>⚡ +15 XP</span>
      </div>
      <div className="flashcard-actions">
        <button type="button" className="secondary-button skip-btn" onClick={onSkip}>⏭ Skip</button>
        <button type="button" className="primary-button remember-btn" onClick={onRemember}>✅ I remember it</button>
      </div>
    </div>
  )
}

/* ─── Category browser ─────────────────────────────────────────── */
function CategoryBrowser({ structures }) {
  const [openCatId, setOpenCatId] = useState(null)

  return (
    <div className="cat-browser">
      <div className="cat-browser-header">
        <span className="section-label">📚 All structures by category</span>
      </div>
      <div className="cat-browser-list">
        {structures.map((cat) => {
          const practiced = cat.items.filter((i) => i.practiceCount > 0).length
          const pct = cat.items.length ? Math.round((practiced / cat.items.length) * 100) : 0
          const isOpen = openCatId === cat.id
          return (
            <div key={cat.id} className={`cat-entry${isOpen ? ' is-open' : ''}`}>
              <button
                type="button"
                className="cat-entry-toggle"
                onClick={() => setOpenCatId(isOpen ? null : cat.id)}
              >
                <div className="cat-entry-left">
                  <span className="cat-entry-name">{cat.title}</span>
                  <div className="cat-entry-bar">
                    <div className="progress-track mini">
                      <div className="progress-fill" style={{ width: `${pct}%` }} />
                    </div>
                    <span className="cat-entry-frac">{practiced}/{cat.items.length}</span>
                  </div>
                </div>
                <span className="cat-entry-chevron">{isOpen ? '▲' : '▼'}</span>
              </button>
              {isOpen && (
                <div className="cat-entry-items">
                  {cat.items.map((item) => (
                    <div key={item.id} className={`structure-row${item.practiceCount > 0 ? ' is-done' : ''}`}>
                      <div className="structure-row-top">
                        <span className="structure-row-name">{item.name}</span>
                        {item.practiceCount >= 5 && <span className="mastered-badge">🏅</span>}
                        {item.practiceCount > 0 && item.practiceCount < 5 && (
                          <span className="practiced-badge">✓ {item.practiceCount}×</span>
                        )}
                      </div>
                      <p className="structure-row-expl">{item.explanation}</p>
                      <div className="structure-row-examples">
                        {item.examples.slice(0, 2).map((ex) => (
                          <span key={ex} className="example-inline">"{ex}"</span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

/* ─── Random Set Browser ───────────────────────────────────────── */
function RandomSetBrowser({ structures, allStructures, onMarkPractice }) {
  const [set, setSet] = useState([])

  const reshuffle = useCallback(() => {
    if (!allStructures.length) return
    const shuffled = [...allStructures].sort(() => Math.random() - 0.5)
    setSet(shuffled.slice(0, 4))
  }, [allStructures])

  useEffect(() => {
    reshuffle()
  }, [reshuffle])

  return (
    <div className="random-set-browser">
      <div className="random-set-header">
        <span className="section-label">🎲 Quick practice set (4 random structures)</span>
        <button type="button" className="random-btn" onClick={reshuffle}>
          🔄 Refresh set
        </button>
      </div>
      <div className="random-set-grid">
        {set.map((savedItem) => {
          const item = allStructures.find((s) => s.id === savedItem.id) ?? savedItem
          const mastered = item.practiceCount >= 5
          const practiced = item.practiceCount > 0
          return (
            <div key={item.id} className={`random-set-card${practiced ? ' is-done' : ''}`}>
              <div className="random-card-header">
                <span className="random-card-cat">{item.categoryTitle}</span>
                {mastered && <span className="mastered-badge">🏅 Mastered</span>}
              </div>
              <h4 className="random-card-name">{item.name}</h4>
              <p className="random-card-expl">{item.explanation}</p>
              <div className="random-card-examples">
                {item.examples.slice(0, 1).map((ex) => (
                  <span key={ex} className="example-inline">"{ex}"</span>
                ))}
              </div>
              <div className="random-card-footer">
                <button
                  type="button"
                  className="primary-button mini-btn"
                  onClick={() => onMarkPractice(item.categoryId, item.id)}
                >
                  {practiced ? `✓ Practiced (${item.practiceCount}×)` : '✅ Practiced'}
                </button>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

/* ─── main component ───────────────────────────────────────────── */
export default function StructuresSection({ structures, onMarkPractice }) {
  const allStructures = useMemo(() => getAllStructures(structures), [structures])
  const [currentId, setCurrentId] = useState(() => {
    if (!allStructures.length) return null
    return allStructures[Math.floor(Math.random() * allStructures.length)].id
  })
  const [skippedIds, setSkippedIds] = useState(new Set())
  const [recentHistory, setRecentHistory] = useState([])

  const current = allStructures.find((s) => s.id === currentId) ?? null
  const xp = totalXp(structures)

  const advance = useCallback(
    (excludeId) => {
      const next = pickRandom(allStructures, excludeId)
      setCurrentId(next?.id ?? null)
    },
    [allStructures],
  )

  const handleRemember = useCallback(() => {
    if (!current) return
    onMarkPractice(current.categoryId, current.id)
    setRecentHistory((prev) => [current, ...prev].slice(0, 5))
    setSkippedIds((prev) => { const c = new Set(prev); c.delete(current.id); return c })
    advance(current.id)
  }, [current, onMarkPractice, advance])

  const handleSkip = useCallback(() => {
    if (!current) return
    setSkippedIds((prev) => new Set(prev).add(current.id))
    advance(current.id)
  }, [current, advance])

  return (
    <SectionShell
      id="structures"
      title="English Structure Training"
      description="Build automatic sentence patterns. The app picks a structure — you recall it, say it out loud, then mark it."
    >
      <InstructionPanel />
      <XpBar xp={xp} />
      <GlobalProgress structures={structures} />

      <div className="flashcard-area">
        <div className="flashcard-area-label">
          <span className="section-label">⚡ Current structure</span>
        </div>
        <Flashcard
          structure={current}
          onRemember={handleRemember}
          onSkip={handleSkip}
          skipped={current ? skippedIds.has(current.id) : false}
        />
      </div>

      {recentHistory.length > 0 && (
        <div className="recent-history">
          <span className="section-label">✅ Recently practiced</span>
          <div className="recent-list">
            {recentHistory.map((s, i) => (
              <div key={`${s.id}-${i}`} className="recent-chip">
                <span className="recent-cat">{s.categoryTitle}</span>
                <span className="recent-name">{s.name}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <RandomSetBrowser
        structures={structures}
        allStructures={allStructures}
        onMarkPractice={onMarkPractice}
      />

      <CategoryBrowser structures={structures} />
    </SectionShell>
  )
}
