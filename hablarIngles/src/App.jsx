import { useEffect, useMemo, useState } from 'react'
import './App.css'
import ConversationSection from './components/ConversationSection'
import ListeningSection from './components/ListeningSection'
import HeroHeader from './components/HeroHeader'
import JournalSection from './components/JournalSection'
import OverviewSection from './components/OverviewSection'
import PillButton from './components/PillButton'
import PhoneticsSection from './components/PhoneticsSection'
import StructuresSection from './components/StructuresSection'
import { navSections } from './data/navSections'
import { STORAGE_KEY, createDefaultDashboard, createDefaultJournalDraft, createId, formatDate, formatDuration, getTodayDate, hydrateDashboard } from './data/dashboardData'

function getPhoneticItems(category) {
  return category?.sounds ?? category?.pairs ?? []
}

function App() {
  const [dashboard, setDashboard] = useState(() => {
    if (typeof window === 'undefined') {
      return createDefaultDashboard()
    }

    try {
      const stored = window.localStorage.getItem(STORAGE_KEY)
      return stored ? hydrateDashboard(JSON.parse(stored)) : createDefaultDashboard()
    } catch {
      return createDefaultDashboard()
    }
  })
  const [activeSection, setActiveSection] = useState('overview')
  const [wordDrafts, setWordDrafts] = useState({})
  const [nowTick, setNowTick] = useState(Date.now())
  const [journalDraft, setJournalDraft] = useState(createDefaultJournalDraft)

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(dashboard))
  }, [dashboard])

  useEffect(() => {
    setJournalDraft((currentDraft) => ({
      ...currentDraft,
      date: currentDraft.date || getTodayDate(),
    }))
  }, [])

  useEffect(() => {
    if (!dashboard.conversation.activeSession.startedAt) {
      return undefined
    }

    const timerId = window.setInterval(() => {
      setNowTick(Date.now())
    }, 1000)

    return () => window.clearInterval(timerId)
  }, [dashboard.conversation.activeSession.startedAt])

  const allStructures = useMemo(
    () => dashboard.structures.flatMap((category) => category.items.map((item) => ({ ...item, categoryTitle: category.title }))),
    [dashboard.structures],
  )

  const totalPhoneticPairs = dashboard.phonetics.reduce((sum, category) => sum + getPhoneticItems(category).length, 0)
  const totalStructureItems = allStructures.length
  const totalConversationSessions = dashboard.conversation.sessions.length
  const totalJournalEntries = dashboard.journal.entries.length

  const activeSession = dashboard.conversation.activeSession
  const elapsedSeconds = activeSession.startedAt ? Math.max(0, Math.floor((nowTick - activeSession.startedAt) / 1000)) : 0

  const updatePhoneticPair = (categoryId, soundId, updater) => {
    setDashboard((currentDashboard) => ({
      ...currentDashboard,
      phonetics: currentDashboard.phonetics.map((category) => {
        if (category.id !== categoryId) {
          return category
        }

        // Support both 'sounds' and 'pairs' arrays
        if (Array.isArray(category.sounds)) {
          return {
            ...category,
            sounds: category.sounds.map((sound) =>
              sound.id === soundId ? updater(sound) : sound,
            ),
          }
        }

        if (Array.isArray(category.pairs)) {
          return {
            ...category,
            pairs: category.pairs.map((pair) =>
              pair.id === soundId ? updater(pair) : pair,
            ),
          }
        }

        return category
      }),
    }))
  }

  const updateStructureItem = (categoryId, itemId, updater) => {
    setDashboard((currentDashboard) => ({
      ...currentDashboard,
      structures: currentDashboard.structures.map((category) => {
        if (category.id !== categoryId) {
          return category
        }

        return {
          ...category,
          items: category.items.map((item) => {
            if (item.id !== itemId) {
              return item
            }

            return updater(item)
          }),
        }
      }),
    }))
  }

  const updateGuideField = (field, value) => {
    setDashboard((currentDashboard) => ({
      ...currentDashboard,
      guide: {
        ...currentDashboard.guide,
        [field]: value,
      },
    }))
  }

  const updateConversationField = (field, value) => {
    setDashboard((currentDashboard) => ({
      ...currentDashboard,
      conversation: {
        ...currentDashboard.conversation,
        activeSession: {
          ...currentDashboard.conversation.activeSession,
          [field]: value,
        },
      },
    }))
  }

  const addPhoneticWord = (categoryId, soundId) => {
    const draftValue = (wordDrafts[soundId] || '').trim()

    if (!draftValue) {
      return
    }

    updatePhoneticPair(categoryId, soundId, (sound) => ({
      ...sound,
      words: [...(sound.words ?? []), draftValue],
    }))

    setWordDrafts((currentDrafts) => ({
      ...currentDrafts,
      [soundId]: '',
    }))
  }

  const markPhoneticPractice = (categoryId, soundId) => {
    updatePhoneticPair(categoryId, soundId, (sound) => ({
      ...sound,
      practiceCount: sound.practiceCount + 1,
      lastPracticed: getTodayDate(),
    }))
  }

  const markStructurePractice = (categoryId, itemId) => {
    updateStructureItem(categoryId, itemId, (item) => ({
      ...item,
      practiceCount: item.practiceCount + 1,
      lastPracticed: getTodayDate(),
    }))
  }

  const startConversationSession = () => {
    if (dashboard.conversation.activeSession.startedAt) {
      return
    }

    setNowTick(Date.now())
    setDashboard((currentDashboard) => ({
      ...currentDashboard,
      conversation: {
        ...currentDashboard.conversation,
        activeSession: {
          ...currentDashboard.conversation.activeSession,
          startedAt: Date.now(),
        },
      },
    }))
  }

  const stopConversationSession = () => {
    if (!dashboard.conversation.activeSession.startedAt) {
      return
    }

    const durationSeconds = Math.max(1, Math.floor((Date.now() - dashboard.conversation.activeSession.startedAt) / 1000))
    const logEntry = {
      id: createId('conversation'),
      date: new Date().toISOString(),
      durationSeconds,
      topic: dashboard.conversation.activeSession.topic.trim(),
      mistakes: dashboard.conversation.activeSession.mistakes.trim(),
      structuresPracticed: dashboard.conversation.activeSession.structuresPracticed.trim(),
      improvements: dashboard.conversation.activeSession.improvements.trim(),
      notes: dashboard.conversation.activeSession.notes.trim(),
    }

    setNowTick(Date.now())
    setDashboard((currentDashboard) => ({
      ...currentDashboard,
      conversation: {
        sessions: [logEntry, ...currentDashboard.conversation.sessions],
        activeSession: {
          topic: '',
          mistakes: '',
          structuresPracticed: '',
          improvements: '',
          notes: '',
          startedAt: null,
        },
      },
    }))
  }

  const saveJournalEntry = () => {
    const cleanContent = journalDraft.content.trim()

    if (!cleanContent) {
      return
    }

    const entry = {
      id: createId('journal'),
      date: journalDraft.date || getTodayDate(),
      type: journalDraft.type,
      title: journalDraft.title.trim() || journalDraft.type,
      content: cleanContent,
    }

    setDashboard((currentDashboard) => ({
      ...currentDashboard,
      journal: {
        entries: [entry, ...currentDashboard.journal.entries],
      },
    }))

    setJournalDraft({
      date: getTodayDate(),
      type: journalDraft.type,
      title: '',
      content: '',
    })
  }

  return (
    <div className="app-shell">
      <HeroHeader
        eyebrow="Personal English training dashboard"
        title="Organize pronunciation, structures, conversation practice, and technical English in one workspace."
        description="Everything saves locally, so you can keep your study notes, practice history, and next-session reminders in one place."
        stats={[
          { label: 'Phonetic pairs', value: totalPhoneticPairs, detail: 'Sound contrasts to drill' },
          { label: 'Structures', value: totalStructureItems, detail: 'Reusable sentence patterns' },
          { label: 'Speaking sessions', value: totalConversationSessions, detail: 'Saved conversation logs' },
          { label: 'Journal entries', value: totalJournalEntries, detail: 'Daily notes and review items' },
        ]}
      />

      <nav className="section-nav" aria-label="Dashboard sections">
        {navSections.map((section) => (
          <PillButton key={section.id} active={activeSection === section.id} onClick={() => setActiveSection(section.id)}>
            {section.label}
          </PillButton>
        ))}
      </nav>

      {activeSection === 'overview' ? (
        <OverviewSection
          learningGoals={dashboard.guide.currentLearningGoals}
          conversationRules={dashboard.guide.conversationRules}
          importantPatterns={dashboard.guide.importantPatterns}
        />
      ) : null}

      {activeSection === 'phonetics' ? (
        <PhoneticsSection
          phonetics={dashboard.phonetics}
          wordDrafts={wordDrafts}
          setWordDrafts={setWordDrafts}
          onMarkPractice={markPhoneticPractice}
          onAddWord={addPhoneticWord}
          onUpdateNotes={(categoryId, pairId, value) =>
            updatePhoneticPair(categoryId, pairId, (currentPair) => ({
              ...currentPair,
              notes: value,
            }))
          }
          formatDate={formatDate}
        />
      ) : null}

      {activeSection === 'structures' ? (
        <StructuresSection
          structures={dashboard.structures}
          onMarkPractice={markStructurePractice}
          formatDate={formatDate}
        />
      ) : null}

      {activeSection === 'conversation' ? (
        <ConversationSection />
      ) : null}

      {activeSection === 'listening' ? (
        <ListeningSection />
      ) : null}

      {activeSection === 'journal' ? (
        <JournalSection journal={dashboard.journal} draft={journalDraft} setDraft={setJournalDraft} onSave={saveJournalEntry} formatDate={formatDate} />
      ) : null}
    </div>
  )
}

export default App
