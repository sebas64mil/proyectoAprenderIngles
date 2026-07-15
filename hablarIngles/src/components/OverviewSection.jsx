import SectionShell from './SectionShell'

export default function OverviewSection({ learningGoals, conversationRules, importantPatterns }) {
  return (
    <div className="overview-grid">
      <SectionShell id="overview-quick-start" title="Quick start" description="Use the sections below in the same order you usually study.">
        <div className="card-grid two-up">
          <article className="feature-card">
            <h3>1. Phonetics</h3>
            <p>Pick one sound pair, add a few practice words, and log each repetition.</p>
          </article>
          <article className="feature-card">
            <h3>2. Structures</h3>
            <p>Review a pattern, write your own example, and pull a random practice set.</p>
          </article>
          <article className="feature-card">
            <h3>3. Conversation</h3>
            <p>Start a timer before speaking with ChatGPT or another conversation partner.</p>
          </article>
          <article className="feature-card">
            <h3>4. Journal</h3>
            <p>Capture mistakes, vocabulary, and review items while they are still fresh.</p>
          </article>
        </div>
      </SectionShell>

      <SectionShell id="overview-focus" title="Current focus" description="A single place to keep your main learning rules visible.">
        <div className="stack-panel">
          <article className="callout-card">
            <strong>Learning goals</strong>
            <p>{learningGoals || 'Add your current goals in the ChatGPT Practice Guide section.'}</p>
          </article>
          <article className="callout-card">
            <strong>Conversation rules</strong>
            <p>{conversationRules || 'Write the rules you want ChatGPT to follow during speaking practice.'}</p>
          </article>
          <article className="callout-card">
            <strong>Important patterns</strong>
            <p>{importantPatterns || 'Store the structures you want to practice more often.'}</p>
          </article>
        </div>
      </SectionShell>
    </div>
  )
}