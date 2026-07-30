import { useEffect, useMemo, useState } from 'react'
import content from './data/content.json'
import {
  buildScreenSequence,
  decisionOrder,
  computeState,
} from './engine/gameEngine'
import { saveGame, loadGame, resetGame } from './engine/persistence'

import GameChrome from './components/GameChrome'
import RulesOverlay from './components/RulesOverlay'

import TitleScreen from './screens/TitleScreen'
import RulesScreen from './screens/RulesScreen'
import MancheOuvertureScreen from './screens/MancheOuvertureScreen'
import DecisionPresentationScreen from './screens/DecisionPresentationScreen'
import DecisionReflexionScreen from './screens/DecisionReflexionScreen'
import DecisionSaisieScreen from './screens/DecisionSaisieScreen'
import DecisionConsequencesScreen from './screens/DecisionConsequencesScreen'
import EventScreen from './screens/EventScreen'
import SuiviScreen from './screens/SuiviScreen'
import FinalScreen from './screens/FinalScreen'

const sequence = buildScreenSequence(content)
const order = decisionOrder(content)
const manchesByNum = Object.fromEntries(content.manches.map((m) => [m.numero, m]))

function findMancheForScreenIndex(index) {
  for (let i = index; i >= 0; i -= 1) {
    if (sequence[i].manche) return manchesByNum[sequence[i].manche]
  }
  return content.manches[0]
}

export default function App() {
  const [history, setHistory] = useState([])
  const [screenIndex, setScreenIndex] = useState(0)
  const [pendingChoices, setPendingChoices] = useState({})
  const [showRules, setShowRules] = useState(false)
  const [showSuivi, setShowSuivi] = useState(false)
  const [loaded, setLoaded] = useState(false)

  // Chargement initial depuis localStorage
  useEffect(() => {
    const saved = loadGame()
    if (saved) {
      setHistory(saved.history)
      setScreenIndex(Math.min(saved.screenIndex, sequence.length - 1))
    }
    setLoaded(true)
  }, [])

  // Sauvegarde automatique à chaque changement d'écran ou de saisie
  useEffect(() => {
    if (!loaded) return
    saveGame({ history, screenIndex })
  }, [history, screenIndex, loaded])

  const { companies, resultsByDecision } = useMemo(() => computeState(content, history), [history])

  const screen = sequence[screenIndex]

  // Initialise les choix en attente quand on arrive sur un écran de saisie
  useEffect(() => {
    if (screen.type === 'decision-saisie') {
      const existing = history.find((h) => h.decisionId === screen.decisionId)
      setPendingChoices(existing ? { ...existing.choices } : {})
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [screenIndex])

  function goPrev() {
    setScreenIndex((i) => Math.max(0, i - 1))
  }

  function goNext() {
    setScreenIndex((i) => Math.min(sequence.length - 1, i + 1))
  }

  function validateSaisie() {
    const decisionId = screen.decisionId
    const idx = order.indexOf(decisionId)
    const truncated = history.filter((h) => order.indexOf(h.decisionId) < idx)
    truncated.push({ decisionId, choices: pendingChoices })
    setHistory(truncated)
    goNext()
  }

  function handleNewGame() {
    resetGame()
    setHistory([])
    setScreenIndex(0)
  }

  function toggleFullscreen() {
    if (document.fullscreenElement) {
      document.exitFullscreen()
    } else {
      document.documentElement.requestFullscreen().catch(() => {})
    }
  }

  useEffect(() => {
    function onKey(e) {
      if (e.target.closest('input, textarea')) return
      if (e.key === 'ArrowRight') {
        if (screen.type !== 'decision-saisie') goNext()
      } else if (e.key === 'ArrowLeft') {
        goPrev()
      } else if (e.key.toLowerCase() === 'f') {
        toggleFullscreen()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [screen])

  if (!loaded) return null

  const currentManche = findMancheForScreenIndex(screenIndex)
  const showChrome = screen.type !== 'titre'

  return (
    <>
      {renderScreen()}
      {showChrome && (
        <GameChrome
          onShowRules={() => setShowRules(true)}
          onShowSuivi={() => setShowSuivi(true)}
          onToggleFullscreen={toggleFullscreen}
        />
      )}
      {showRules && <RulesOverlay onClose={() => setShowRules(false)} />}
      {showSuivi && (
        <SuiviScreen
          isModal
          companies={companies}
          manche={currentManche}
          onClose={() => setShowSuivi(false)}
        />
      )}
    </>
  )

  function renderScreen() {
    switch (screen.type) {
      case 'titre':
        return <TitleScreen onStart={goNext} />

      case 'regles':
        return <RulesScreen onPrev={goPrev} onNext={goNext} />

      case 'manche-ouverture':
        return <MancheOuvertureScreen manche={manchesByNum[screen.manche]} onPrev={goPrev} onNext={goNext} />

      case 'decision-presentation':
        return (
          <DecisionPresentationScreen
            decision={content.decisions[screen.decisionId]}
            onPrev={goPrev}
            onNext={goNext}
          />
        )

      case 'decision-reflexion': {
        const decision = content.decisions[screen.decisionId]
        const durationSec = decision.type === 'strategique'
          ? content.parametres.minuteur_strategique_sec
          : content.parametres.minuteur_tactique_sec
        return (
          <DecisionReflexionScreen
            decision={decision}
            durationSec={durationSec}
            onPrev={goPrev}
            onNext={goNext}
          />
        )
      }

      case 'decision-saisie':
        return (
          <DecisionSaisieScreen
            decision={content.decisions[screen.decisionId]}
            choices={pendingChoices}
            onChoiceChange={(companyId, letter) =>
              setPendingChoices((c) => ({ ...c, [companyId]: letter }))
            }
            onPrev={goPrev}
            onValidate={validateSaisie}
          />
        )

      case 'decision-consequences':
        return (
          <DecisionConsequencesScreen
            decision={content.decisions[screen.decisionId]}
            results={resultsByDecision[screen.decisionId] || {}}
            onPrev={goPrev}
            onNext={goNext}
          />
        )

      case 'evenement':
        return <EventScreen manche={manchesByNum[screen.manche]} onPrev={goPrev} onNext={goNext} />

      case 'suivi':
        return (
          <SuiviScreen
            companies={companies}
            manche={manchesByNum[screen.manche]}
            onPrev={goPrev}
            onNext={goNext}
          />
        )

      case 'final':
        return <FinalScreen companies={companies} onNewGame={handleNewGame} />

      default:
        return null
    }
  }
}
