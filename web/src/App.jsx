import { useState } from 'react'
import Sidebar from '@/components/Sidebar'
import AboutSection from '@/components/AboutSection'
import ExploreSection from '@/components/ExploreSection'

function App() {
  const [section, setSection] = useState('about')
  const [era, setEra] = useState(null)
  const [occupationId, setOccupationId] = useState('cashier')
  const [dualIncome, setDualIncome] = useState(false)

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
          <main className="w-full h-full bg-stone-50 overflow-hidden rounded-[32px] shadow-[inset_0_0_0_3px_rgba(41,37,36,0.3)]">
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
