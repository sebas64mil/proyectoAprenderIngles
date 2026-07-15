import SectionShell from './SectionShell'

export default function GuideSection({ guide, onUpdateField }) {
  return (
    <SectionShell
      id="guide"
      title="ChatGPT Practice Guide"
      description="Keep the rules, preferences, and goals you want ChatGPT to follow during practice."
    >
      <div className="guide-grid">
        <label className="field-block">
          <span>Conversation rules</span>
          <textarea rows="5" value={guide.conversationRules} onChange={(event) => onUpdateField('conversationRules', event.target.value)} />
        </label>

        <label className="field-block">
          <span>Correction preferences</span>
          <textarea rows="5" value={guide.correctionPreferences} onChange={(event) => onUpdateField('correctionPreferences', event.target.value)} />
        </label>

        <label className="field-block">
          <span>Current learning goals</span>
          <textarea rows="5" value={guide.currentLearningGoals} onChange={(event) => onUpdateField('currentLearningGoals', event.target.value)} />
        </label>

        <label className="field-block">
          <span>Important patterns to practice</span>
          <textarea rows="5" value={guide.importantPatterns} onChange={(event) => onUpdateField('importantPatterns', event.target.value)} />
        </label>
      </div>
    </SectionShell>
  )
}