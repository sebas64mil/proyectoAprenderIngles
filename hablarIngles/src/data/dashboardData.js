import { defaultConversation } from './conversationData'
import { defaultGuide } from './guideData'
import { defaultJournalDraft } from './journalData'
import { phoneticCategories } from './phoneticsData'
import { structureCategories } from './structuresData'

export const STORAGE_KEY = 'english-training-dashboard-state-v1'

export function getTodayDate() {
  return new Date().toISOString().slice(0, 10)
}

export function createId(prefix) {
  return `${prefix}-${Math.random().toString(36).slice(2, 10)}`
}

export function formatDate(dateValue) {
  return new Date(dateValue).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

export function formatDuration(totalSeconds) {
  const safeSeconds = Math.max(0, totalSeconds)
  const hours = Math.floor(safeSeconds / 3600)
  const minutes = Math.floor((safeSeconds % 3600) / 60)
  const seconds = safeSeconds % 60

  if (hours > 0) {
    return `${hours}h ${minutes}m ${seconds}s`
  }

  return `${minutes}m ${String(seconds).padStart(2, '0')}s`
}

export function createDefaultDashboard() {
  return {
    phonetics: phoneticCategories,
    structures: structureCategories,
    conversation: defaultConversation,
    guide: defaultGuide,
    journal: {
      entries: [],
    },
  }
}

export function hydrateDashboard(savedValue) {
  const base = createDefaultDashboard()

  if (!savedValue || typeof savedValue !== 'object') {
    return base
  }

  // Merge saved phonetics with base data to fetch newly added symbols/attributes
  let phonetics = base.phonetics;
  if (Array.isArray(savedValue.phonetics) && savedValue.phonetics.length > 0) {
    phonetics = base.phonetics.map((baseCat) => {
      const savedCat = savedValue.phonetics.find((sc) => sc.id === baseCat.id);
      if (!savedCat) return baseCat;

      const mergeItems = (baseItems, savedItems) => {
        if (!Array.isArray(baseItems)) return undefined;
        return baseItems.map((baseItem) => {
          const savedItem = Array.isArray(savedItems) ? savedItems.find((si) => si.id === baseItem.id) : null;
          if (!savedItem) return baseItem;
          return {
            ...baseItem,
            symbol: baseItem.symbol || savedItem.symbol, // copy symbol from base code
            practiceCount: typeof savedItem.practiceCount === 'number' ? savedItem.practiceCount : baseItem.practiceCount,
            lastPracticed: savedItem.lastPracticed || baseItem.lastPracticed,
            notes: savedItem.notes !== undefined ? savedItem.notes : baseItem.notes,
            words: Array.isArray(savedItem.words) ? [...new Set([...(baseItem.words ?? []), ...savedItem.words])] : baseItem.words,
          };
        });
      };

      return {
        ...baseCat,
        sounds: mergeItems(baseCat.sounds, savedCat.sounds),
        pairs: mergeItems(baseCat.pairs, savedCat.pairs),
      };
    });
  }

  // Merge saved structures with base definitions to integrate newly added structures/categories
  let structures = base.structures;
  if (Array.isArray(savedValue.structures) && savedValue.structures.length > 0) {
    structures = base.structures.map((baseCat) => {
      const savedCat = savedValue.structures.find((sc) => sc.id === baseCat.id);
      if (!savedCat) return baseCat;

      const mergeItems = (baseItems, savedItems) => {
        if (!Array.isArray(baseItems)) return undefined;
        return baseItems.map((baseItem) => {
          const savedItem = Array.isArray(savedItems) ? savedItems.find((si) => si.id === baseItem.id) : null;
          if (!savedItem) return baseItem;
          return {
            ...baseItem,
            practiceCount: typeof savedItem.practiceCount === 'number' ? savedItem.practiceCount : baseItem.practiceCount,
            lastPracticed: savedItem.lastPracticed || baseItem.lastPracticed,
            notes: savedItem.notes !== undefined ? savedItem.notes : baseItem.notes,
          };
        });
      };

      return {
        ...baseCat,
        items: mergeItems(baseCat.items, savedCat.items),
      };
    });
  }

  return {
    phonetics,
    structures,
    conversation: savedValue.conversation ? { ...base.conversation, ...savedValue.conversation } : base.conversation,
    guide: savedValue.guide ? { ...base.guide, ...savedValue.guide } : base.guide,
    journal: savedValue.journal && Array.isArray(savedValue.journal.entries) ? savedValue.journal : base.journal,
  }
}

export function createDefaultJournalDraft() {
  return {
    ...defaultJournalDraft,
    date: getTodayDate(),
  }
}