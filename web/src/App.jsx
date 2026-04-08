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
      <div className="hidden lg:flex h-screen w-screen overflow-hidden">
        <Sidebar
          section={section}
          era={era}
          onSectionChange={handleSectionChange}
          onEraChange={handleEraChange}
        />
        <main className="flex-1 min-w-0 h-full">
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
    </>
  )
}

export default App
