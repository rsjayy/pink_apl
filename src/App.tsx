import { NavLink, Route, Routes } from 'react-router'

function Home() {
  return <h1 className="text-3xl font-bold text-pink-600">pink_apl</h1>
}

function About() {
  return <h1 className="text-3xl font-bold text-pink-600">About</h1>
}

function NotFound() {
  return <h1 className="text-3xl font-bold text-pink-600">Page not found</h1>
}

function App() {
  const linkClass = ({ isActive }: { isActive: boolean }) =>
    isActive
      ? 'font-semibold text-pink-600'
      : 'text-gray-600 hover:text-pink-600'

  return (
    <div className="mx-auto max-w-3xl p-6">
      <nav className="mb-8 flex gap-4">
        <NavLink to="/" end className={linkClass}>
          Home
        </NavLink>
        <NavLink to="/about" className={linkClass}>
          About
        </NavLink>
      </nav>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </div>
  )
}

export default App
