import { useState, useEffect } from 'react'
import Sidebar from '@/components/Sidebar'
import AboutSection from '@/components/AboutSection'
import ExploreSection from '@/components/ExploreSection'

const VALID_ERAS         = ['1960s', '1980s', '2000s', '2020s']
const VALID_OCCUPATIONS  = ['cashier', 'janitor', 'bus_driver', 'electrician', 'teacher', 'nurse', 'developer', 'lawyer', 'dentist']
const VALID_SECTIONS     = ['about', 'explore']

function readParams() {
  const p = new URLSearchParams(window.location.search)
  const section    = VALID_SECTIONS.includes(p.get('section'))    ? p.get('section')    : 'about'
  const era        = VALID_ERAS.includes(p.get('era'))             ? p.get('era')        : null
  const occupation = VALID_OCCUPATIONS.includes(p.get('occupation')) ? p.get('occupation') : 'cashier'
  const dual       = p.get('dual') === 'true'
  return { section, era, occupation, dual }
}

function App() {
  const initial = readParams()
  const [section,      setSection]      = useState(initial.section)
  const [era,          setEra]          = useState(initial.era)
  const [occupationId, setOccupationId] = useState(initial.occupation)
  const [dualIncome,   setDualIncome]   = useState(initial.dual)

  // Sync state → URL on every change
  useEffect(() => {
    const p = new URLSearchParams()
    p.set('section', section)
    if (era) p.set('era', era)
    p.set('occupation', occupationId)
    if (dualIncome) p.set('dual', 'true')
    window.history.replaceState(null, '', `?${p.toString()}`)
  }, [section, era, occupationId, dualIncome])

  function handleSectionChange(s) {
    setSection(s)
  }

  function handleEraChange(e) {
    setEra(e)
    setSection('explore')
  }

  return (
    <>
      {/* Mobile blocker */}
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-background p-8 text-center text-sm text-muted-foreground lg:hidden">
        can't you afford a laptop lol? if so, no need to traumatize yourself
      </div>

      {/* Main app — desktop only */}
      <div className="hidden lg:flex h-screen w-screen overflow-hidden bg-stone-800">
        <Sidebar
          section={section}
          era={era}
          onSectionChange={handleSectionChange}
          onEraChange={handleEraChange}
        />
        <div className="flex-1 min-w-0 h-full pt-3 pr-3 pb-3">
          <main className="w-full h-full bg-stone-50 overflow-hidden rounded-[32px] shadow-[inset_0_0_0_4px_rgba(41,37,36,0.2)]">
            {section === 'about' ? (
              <AboutSection onExplore={() => setSection('explore')} />
            ) : (
              <ExploreSection
                era={era}
                occupationId={occupationId}
                dualIncome={dualIncome}
                onOccupationChange={setOccupationId}
                onDualIncomeChange={setDualIncome}
              />
            )}
          </main>
        </div>
      </div>
    </>
  )
}

export default App
