import { useState } from 'react'
import SectionShell from './SectionShell'

const INSTRUCTIONS = [
  "Save the most important mistake from the session.",
  "Write the incorrect sentence.",
  "Write the corrected version.",
  "Create two new examples using the corrected structure.",
  "Review previous mistakes regularly."
]

const EXAMPLE = {
  mistake: "I like create shaders.",
  correction: "I like creating shaders.",
  practice: [
    "I like designing environments.",
    "I like experimenting with lighting."
  ]
}

function InstructionPanel() {
  const [open, setOpen] = useState(false)
  return (
    <div className="instruction-panel" style={{ marginBottom: '18px' }}>
      <button type="button" className="instruction-toggle" onClick={() => setOpen((v) => !v)} aria-expanded={open}>
        <span>📋 Error of the Day — How to record mistakes</span>
        <span className="toggle-chevron">{open ? '▲' : '▼'}</span>
      </button>
      {open && (
        <div className="instruction-body">
          <p className="instruction-intro">
            <strong>Methodology:</strong> Turn mistakes into learning opportunities by registering them systematically.
          </p>
          <p className="instruction-label">Instructions:</p>
          <ol className="instruction-list">
            {INSTRUCTIONS.map((step, i) => <li key={i}>{step}</li>)}
          </ol>
          <p className="instruction-label">Example format:</p>
          <div style={{ padding: '14px', background: 'var(--surface-strong)', borderRadius: '12px', border: '1px solid var(--border)', fontSize: '0.9rem' }}>
            <p style={{ margin: '0 0 6px', color: '#ef4444' }}>❌ <strong>Mistake:</strong> "{EXAMPLE.mistake}"</p>
            <p style={{ margin: '0 0 10px', color: '#10b981' }}>✅ <strong>Correction:</strong> "{EXAMPLE.correction}"</p>
            <p style={{ margin: '0 0 6px', fontWeight: 600 }}>⚡ <strong>Practice examples:</strong></p>
            <ul style={{ margin: 0, paddingLeft: '20px' }}>
              {EXAMPLE.practice.map((pr, i) => <li key={i} style={{ fontStyle: 'italic', color: 'var(--accent-strong)' }}>"{pr}"</li>)}
            </ul>
          </div>
        </div>
      )}
    </div>
  )
}

export default function JournalSection({ journal, draft, setDraft, onSave, formatDate }) {
  return (
    <SectionShell
      id="journal"
      title="Notes / Progress Journal"
      description="Log daily notes, mistakes, vocabulary, and review items by date."
    >
      <InstructionPanel />
      <div className="journal-layout">
        <article className="panel-card">
          <div className="panel-header">
            <div>
              <h3>Add new entry</h3>
              <p>Save anything you want to review before the next practice session.</p>
            </div>
          </div>

          <div className="form-stack">
            <label className="field-block">
              <span>Date</span>
              <input type="date" value={draft.date} onChange={(event) => setDraft((currentDraft) => ({ ...currentDraft, date: event.target.value }))} />
            </label>

            <label className="field-block">
              <span>Type</span>
              <select value={draft.type} onChange={(event) => setDraft((currentDraft) => ({ ...currentDraft, type: event.target.value }))}>
                <option>Daily note</option>
                <option>Mistake</option>
                <option>Vocabulary</option>
                <option>Review item</option>
              </select>
            </label>

            <label className="field-block">
              <span>Title</span>
              <input type="text" value={draft.title} onChange={(event) => setDraft((currentDraft) => ({ ...currentDraft, title: event.target.value }))} placeholder="Short reminder for later" />
            </label>

            <label className="field-block">
              <span>Entry</span>
              <textarea rows="6" value={draft.content} onChange={(event) => setDraft((currentDraft) => ({ ...currentDraft, content: event.target.value }))} placeholder="Write your note, vocabulary, or mistake here" />
            </label>

            <button type="button" className="primary-button" onClick={onSave}>
              Save journal entry
            </button>
          </div>
        </article>

        <article className="panel-card">
          <div className="panel-header">
            <div>
              <h3>Recent entries</h3>
              <p>Everything stays grouped by date so review sessions are easy to scan.</p>
            </div>
          </div>

          <div className="journal-list">
            {journal.entries.length === 0 ? (
              <p className="empty-state">No notes yet. Add your first entry to build a review history.</p>
            ) : (
              journal.entries.map((entry) => (
                <article key={entry.id} className="history-card">
                  <div className="history-head">
                    <strong>{entry.title}</strong>
                    <span>
                      {formatDate(entry.date)} · {entry.type}
                    </span>
                  </div>
                  <p>{entry.content}</p>
                </article>
              ))
            )}
          </div>
        </article>
      </div>
    </SectionShell>
  )
}