import { Footer } from './components/layout/Footer'
import { DashboardSection } from './components/sections/DashboardSection'
import { developerTools, managerTools } from './data/tools'

function App() {
  return (
    <div className="page-bg text-gray-900 font-sans">
      <main>
        <DashboardSection
          developerTools={developerTools}
          managerTools={managerTools}
        />
      </main>
      <Footer />
    </div>
  )
}

export default App
