import { useState, useRef, useEffect, useCallback } from 'react'
import SectionShell from './SectionShell'

/* ─── YouTube helpers ──────────────────────────────────────────── */
function extractYouTubeId(url) {
  const patterns = [
    /(?:youtube\.com\/watch\?(?:.*&)?v=|youtu\.be\/|youtube\.com\/embed\/)([^&?/\s]{11})/,
    /youtube\.com\/shorts\/([^&?/\s]{11})/,
  ]
  for (const re of patterns) {
    const m = url.match(re)
    if (m) return m[1]
  }
  return null
}

function parseTimestamp(str) {
  const parts = str.trim().split(':').map(Number)
  if (parts.some(isNaN)) return NaN
  if (parts.length === 2) return parts[0] * 60 + parts[1]
  if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2]
  return NaN
}

/* ─── About tab ────────────────────────────────────────────────── */
function AboutSection() {
  return (
    <div className="about-section">
      <div className="about-card">
        <div className="about-card-icon">📥</div>
        <div className="about-card-body">
          <h3>Session Log — Comprehensible Input</h3>
          <p>
            El <strong>Comprehensible Input</strong> es el principio más poderoso para aprender idiomas: exponate a audio que entendés
            parcialmente y tu cerebro adquiere el idioma de forma natural.
          </p>
          <ol className="about-steps">
            <li>Pegá el link de un video de YouTube en <strong>Session Log</strong>.</li>
            <li>Reproducí el video sin subtítulos y escribí en el <strong>Primer intento</strong> cada palabra que logres entender.</li>
            <li>Volvé a escuchar y registrá en el <strong>Segundo intento</strong> lo que captaste ahora.</li>
            <li>Escribí en <strong>Transcripción real</strong> las palabras correctas del video (subtítulos o letra).</li>
            <li>Pulsá <strong>Comparar</strong>: cada palabra tuya aparece en verde si la acertaste o en rojo si te faltó.</li>
            <li>Con el tiempo verás cómo tu porcentaje de aciertos crece sesión a sesión.</li>
          </ol>
        </div>
      </div>

      <div className="about-card">
        <div className="about-card-icon">🔁</div>
        <div className="about-card-body">
          <h3>Shadowing Method</h3>
          <p>
            El <strong>Shadowing</strong> es la técnica de imitar en tiempo real el ritmo, la entonación y la pronunciación de un
            hablante nativo. Entrenás tu boca y oído al mismo tiempo.
          </p>
          <ol className="about-steps">
            <li>Pegá el link de un video de YouTube en <strong>Shadowing Method</strong>.</li>
            <li>Agregá <strong>fragmentos (loops)</strong>: definí el tiempo de inicio y fin del segmento que querés practicar (ej. 2:15 → 2:20).</li>
            <li>Indicá cuántas veces querés que se repita ese fragmento.</li>
            <li>Pulsá <strong>▶ Play loop</strong> y repetí en voz alta lo que escuchás, copiando el ritmo y la entonación exactos.</li>
            <li>Podés agregar múltiples loops de distintos fragmentos del mismo video para entrenar varias frases.</li>
          </ol>
        </div>
      </div>
    </div>
  )
}

/* ─── Word comparison ──────────────────────────────────────────── */
function tokenize(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s'áéíóúüñ]/g, '')
    .split(/\s+/)
    .filter(Boolean)
}

function CompareResult({ attempt, transcript, label }) {
  const transcriptWords = new Set(tokenize(transcript))
  const words = tokenize(attempt)
  if (!words.length) return null
  const correct = words.filter((w) => transcriptWords.has(w)).length
  const pct = Math.round((correct / words.length) * 100)
  const color = pct >= 70 ? '#10b981' : pct >= 40 ? 'var(--accent)' : '#ef4444'

  return (
    <div className="compare-result">
      <div className="compare-result-header">
        <span className="section-label">{label} — resultado</span>
        <span className="compare-pct" style={{ color }}>{pct}% acertado</span>
      </div>
      <div className="compare-words">
        {words.map((word, i) => (
          <span key={i} className={`compare-word ${transcriptWords.has(word) ? 'is-correct' : 'is-wrong'}`}>
            {word}
          </span>
        ))}
      </div>
    </div>
  )
}

/* ─── Session Log ──────────────────────────────────────────────── */
function SessionLog() {
  const [rawUrl, setRawUrl] = useState('')
  const [embedId, setEmbedId] = useState('')
  const [attempt1, setAttempt1] = useState('')
  const [attempt2, setAttempt2] = useState('')
  const [realText, setRealText] = useState('')
  const [compared, setCompared] = useState(false)
  const [entries, setEntries] = useState([])
  const [urlError, setUrlError] = useState('')

  const handleLoadVideo = () => {
    const id = extractYouTubeId(rawUrl)
    if (id) { setEmbedId(id); setCompared(false); setUrlError('') }
    else setUrlError('No se pudo detectar el video. Revisá el link.')
  }

  const handleCompare = () => { if (realText.trim()) setCompared(true) }

  const handleSave = () => {
    if (!attempt1.trim() && !attempt2.trim()) return
    setEntries((prev) => [{ id: Date.now(), url: rawUrl, attempt1, attempt2, realText }, ...prev])
    setRawUrl(''); setEmbedId(''); setAttempt1(''); setAttempt2(''); setRealText(''); setCompared(false)
  }

  return (
    <div className="listening-log">
      <div className="listening-log-header">
        <span className="section-label">📓 Session Log — Comprehensible Input</span>
        <p>Pegá el link de un video, escuchá y escribí lo que entendés en cada intento.</p>
      </div>

      <div className="video-url-row">
        <input
          id="session-log-url"
          type="text"
          className={`video-url-input${urlError ? ' has-error' : ''}`}
          value={rawUrl}
          onChange={(e) => { setRawUrl(e.target.value); setUrlError('') }}
          placeholder="https://www.youtube.com/watch?v=..."
          onKeyDown={(e) => e.key === 'Enter' && handleLoadVideo()}
        />
        <button id="session-log-load-btn" type="button" className="primary-button" onClick={handleLoadVideo}>
          ▶ Cargar video
        </button>
      </div>
      {urlError && <p className="url-error">{urlError}</p>}

      {embedId && (
        <div className="yt-embed-wrap">
          <iframe
            src={`https://www.youtube.com/embed/${embedId}`}
            title="YouTube — Session Log"
            allowFullScreen
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          />
        </div>
      )}

      <div className="attempt-grid">
        <div className="attempt-container">
          <label className="attempt-label">
            <span className="attempt-num">1</span> Primer intento
          </label>
          <textarea rows={6} value={attempt1} onChange={(e) => setAttempt1(e.target.value)}
            placeholder="Escribí las palabras que entendiste sin subtítulos…" />
          {compared && attempt1.trim() && <CompareResult attempt={attempt1} transcript={realText} label="Intento 1" />}
        </div>

        <div className="attempt-container">
          <label className="attempt-label">
            <span className="attempt-num">2</span> Segundo intento
          </label>
          <textarea rows={6} value={attempt2} onChange={(e) => setAttempt2(e.target.value)}
            placeholder="Volviste a escuchar. ¿Captaste más ahora?…" />
          {compared && attempt2.trim() && <CompareResult attempt={attempt2} transcript={realText} label="Intento 2" />}
        </div>

        <div className="attempt-container is-transcript">
          <label className="attempt-label">
            <span className="attempt-num">📖</span> Transcripción real
          </label>
          <textarea rows={6} value={realText} onChange={(e) => setRealText(e.target.value)}
            placeholder="Pegá aquí la transcripción o subtítulos del video…" />
        </div>
      </div>

      <div className="button-row">
        <button id="session-compare-btn" type="button" className="compare-button" onClick={handleCompare}
          disabled={!realText.trim() || (!attempt1.trim() && !attempt2.trim())}>
          🔍 Comparar
        </button>
        <button id="session-save-btn" type="button" className="primary-button" onClick={handleSave}
          disabled={!attempt1.trim() && !attempt2.trim()}>
          ✅ Guardar sesión
        </button>
      </div>

      {entries.length > 0 && (
        <div className="log-history">
          <span className="section-label">Sesiones guardadas</span>
          <div className="log-entry-list">
            {entries.map((entry) => (
              <div key={entry.id} className="log-entry">
                <div className="log-entry-head">
                  <strong>{entry.url || 'Sesión sin URL'}</strong>
                </div>
                <div className="log-entry-grid">
                  <div><span className="section-label">Intento 1</span><p>{entry.attempt1 || '—'}</p></div>
                  <div><span className="section-label">Intento 2</span><p>{entry.attempt2 || '—'}</p></div>
                  <div><span className="section-label">Transcripción</span><p>{entry.realText || '—'}</p></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

/* ─── YouTube IFrame API hook ──────────────────────────────────── */
let ytApiLoading = false

function useYTPlayer(containerId, videoId) {
  const playerRef = useRef(null)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    if (!videoId || !containerId) return
    setReady(false)

    const create = () => {
      if (playerRef.current) { try { playerRef.current.destroy() } catch (_) {} playerRef.current = null }
      const el = document.getElementById(containerId)
      if (!el) return
      playerRef.current = new window.YT.Player(containerId, {
        videoId,
        width: '100%',
        height: '100%',
        playerVars: { enablejsapi: 1, rel: 0, modestbranding: 1 },
        events: { onReady: () => setReady(true) },
      })
    }

    if (window.YT && window.YT.Player) {
      create()
    } else {
      const prev = window.onYouTubeIframeAPIReady
      window.onYouTubeIframeAPIReady = () => { if (prev) prev(); create() }
      if (!ytApiLoading) {
        ytApiLoading = true
        const s = document.createElement('script')
        s.src = 'https://www.youtube.com/iframe_api'
        document.head.appendChild(s)
      }
    }

    return () => {
      if (playerRef.current) { try { playerRef.current.destroy() } catch (_) {} playerRef.current = null }
      setReady(false)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [videoId])

  return { playerRef, ready }
}

/* ─── Shadowing Method ─────────────────────────────────────────── */
function ShadowingMethod() {
  const [rawUrl, setRawUrl] = useState('')
  const [videoId, setVideoId] = useState('')
  const [urlError, setUrlError] = useState('')
  const [loops, setLoops] = useState([])
  const [draft, setDraft] = useState({ start: '', end: '', reps: 3 })
  const [draftError, setDraftError] = useState('')
  const [activeLoopId, setActiveLoopId] = useState(null)
  const intervalRef = useRef(null)

  const PLAYER_DIV = 'shadowing-yt-player'
  const { playerRef, ready } = useYTPlayer(videoId ? PLAYER_DIV : null, videoId)

  const handleLoadVideo = () => {
    const id = extractYouTubeId(rawUrl)
    if (id) { setVideoId(id); setUrlError(''); setActiveLoopId(null); clearInterval(intervalRef.current) }
    else setUrlError('No se pudo detectar el video. Revisá el link.')
  }

  const handleAddLoop = () => {
    const s = parseTimestamp(draft.start)
    const e = parseTimestamp(draft.end)
    if (isNaN(s) || isNaN(e)) { setDraftError('Ingresá los tiempos en formato mm:ss (ej. 2:15)'); return }
    if (e <= s) { setDraftError('El tiempo final debe ser mayor al inicial'); return }
    setLoops((prev) => [...prev, { ...draft, id: Date.now() }])
    setDraft({ start: '', end: '', reps: 3 })
    setDraftError('')
  }

  const handleRemoveLoop = useCallback((id) => {
    if (activeLoopId === id) { clearInterval(intervalRef.current); setActiveLoopId(null); try { playerRef.current?.pauseVideo() } catch (_) {} }
    setLoops((prev) => prev.filter((l) => l.id !== id))
  }, [activeLoopId, playerRef])

  const handlePlayLoop = useCallback((loop) => {
    if (!playerRef.current || !ready) return
    const startSec = parseTimestamp(loop.start)
    const endSec = parseTimestamp(loop.end)
    if (isNaN(startSec) || isNaN(endSec)) return

    clearInterval(intervalRef.current)
    setActiveLoopId(loop.id)

    let repsLeft = Number(loop.reps)
    const go = () => { try { playerRef.current.seekTo(startSec, true); playerRef.current.playVideo() } catch (_) {} }
    go()

    intervalRef.current = setInterval(() => {
      try {
        const current = playerRef.current?.getCurrentTime?.() ?? 0
        if (current >= endSec - 0.15) {
          repsLeft -= 1
          if (repsLeft <= 0) { clearInterval(intervalRef.current); setActiveLoopId(null); try { playerRef.current.pauseVideo() } catch (_) {} }
          else go()
        }
      } catch (_) { clearInterval(intervalRef.current) }
    }, 150)
  }, [playerRef, ready])

  const handleStopLoop = useCallback(() => {
    clearInterval(intervalRef.current); setActiveLoopId(null); try { playerRef.current?.pauseVideo() } catch (_) {}
  }, [playerRef])

  useEffect(() => () => clearInterval(intervalRef.current), [])

  return (
    <div className="shadowing-method-section">
      <div className="listening-log-header">
        <span className="section-label">🔁 Shadowing Method</span>
        <p>Cargá un video y definí los fragmentos que querés practicar en loop.</p>
      </div>

      <div className="video-url-row">
        <input id="shadowing-url" type="text" className={`video-url-input${urlError ? ' has-error' : ''}`}
          value={rawUrl} onChange={(e) => { setRawUrl(e.target.value); setUrlError('') }}
          placeholder="https://www.youtube.com/watch?v=..."
          onKeyDown={(e) => e.key === 'Enter' && handleLoadVideo()} />
        <button id="shadowing-load-btn" type="button" className="primary-button" onClick={handleLoadVideo}>▶ Cargar video</button>
      </div>
      {urlError && <p className="url-error">{urlError}</p>}

      {videoId && (
        <div className="yt-embed-wrap">
          <div id={PLAYER_DIV} style={{ width: '100%', height: '100%' }} />
        </div>
      )}

      {videoId && (
        <div className="loop-manager">
          <div className="loop-manager-header">
            <span className="section-label">⏱ Fragmentos en loop</span>
            {!ready && <span className="step-hint">⏳ Cargando reproductor…</span>}
          </div>

          <div className="loop-add-form">
            <label className="loop-field">
              <span>Inicio</span>
              <input id="loop-start" type="text" value={draft.start}
                onChange={(e) => setDraft((p) => ({ ...p, start: e.target.value }))} placeholder="2:15" />
            </label>
            <span className="loop-arrow">→</span>
            <label className="loop-field">
              <span>Fin</span>
              <input id="loop-end" type="text" value={draft.end}
                onChange={(e) => setDraft((p) => ({ ...p, end: e.target.value }))} placeholder="2:20" />
            </label>
            <label className="loop-field">
              <span>Repeticiones</span>
              <input id="loop-reps" type="number" min={1} max={99} value={draft.reps}
                onChange={(e) => setDraft((p) => ({ ...p, reps: e.target.value }))} />
            </label>
            <button id="loop-add-btn" type="button" className="primary-button loop-add-btn" onClick={handleAddLoop}>
              + Agregar
            </button>
          </div>
          {draftError && <p className="url-error">{draftError}</p>}

          {loops.length > 0 ? (
            <div className="loop-list">
              {loops.map((loop, i) => {
                const isActive = activeLoopId === loop.id
                return (
                  <div key={loop.id} className={`loop-item${isActive ? ' is-active' : ''}`}>
                    <span className="loop-index">{i + 1}</span>
                    <div className="loop-info">
                      <span className="loop-range">
                        <span>{loop.start}</span>
                        <span className="loop-arrow-sm">→</span>
                        <span>{loop.end}</span>
                      </span>
                      <span className="loop-reps">× {loop.reps} veces</span>
                    </div>
                    {isActive
                      ? <button type="button" className="loop-stop-btn" onClick={handleStopLoop}>⏹ Detener</button>
                      : <button type="button" className="loop-play-btn" onClick={() => handlePlayLoop(loop)} disabled={!ready}>▶ Play loop</button>}
                    <button type="button" className="loop-remove-btn" onClick={() => handleRemoveLoop(loop.id)} title="Eliminar">✕</button>
                  </div>
                )
              })}
            </div>
          ) : (
            <p className="loop-empty-hint">Todavía no hay fragmentos. Agregá uno arriba para empezar.</p>
          )}
        </div>
      )}
    </div>
  )
}

/* ─── Main component ───────────────────────────────────────────── */
export default function ListeningSection() {
  const [tab, setTab] = useState('about')

  return (
    <SectionShell
      id="listening"
      title="Listening & Shadowing"
      description="Desarrollá tu comprensión auditiva con Comprehensible Input y tu pronunciación con el método Shadowing."
    >
      <div className="listening-tabs">
        <button id="tab-about" type="button" className={`pill-button${tab === 'about' ? ' is-active' : ''}`} onClick={() => setTab('about')}>
          📋 ¿Cómo funciona?
        </button>
        <button id="tab-shadowing" type="button" className={`pill-button${tab === 'method' ? ' is-active' : ''}`} onClick={() => setTab('method')}>
          🔁 Shadowing Method
        </button>
        <button id="tab-log" type="button" className={`pill-button${tab === 'log' ? ' is-active' : ''}`} onClick={() => setTab('log')}>
          📓 Session Log
        </button>
      </div>

      {tab === 'about' && <AboutSection />}
      {tab === 'method' && <ShadowingMethod />}
      {tab === 'log' && <SessionLog />}
    </SectionShell>
  )
}
