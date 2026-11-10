import { useEffect, type ReactElement } from 'react'
import { Route, Routes, useLocation } from 'react-router'
import { Characters, Pharmacy, Species } from './pages/CardPages'
import Lobby from './pages/Lobby'
import Lore from './pages/Lore'
import NotFound from './pages/NotFound'
import Profile from './pages/Profile'
import { PAGE_IDS, PAGES, type PageId } from './routes'

// Typed by PageId, so adding a page to routes.ts without a component here is
// a compile error.
const ELEMENTS: Record<PageId, ReactElement> = {
  lobby: <Lobby />,
  info: <Profile />,
  lore: <Lore />,
  characters: <Characters />,
  species: <Species />,
  pharmacy: <Pharmacy />,
}

function ScrollToTopOnNavigate() {
  const { pathname, search } = useLocation()
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname, search])
  return null
}

function App() {
  return (
    <>
      <ScrollToTopOnNavigate />
      <Routes>
        {PAGE_IDS.map((id) => (
          <Route key={id} path={PAGES[id].path} element={ELEMENTS[id]} />
        ))}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  )
}

export default App
