import { useState, useEffect } from 'react'
import logo from '../../assets/Imagem9.png'

export function Navbar() {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <nav
      className={`fixed top-0 w-full z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-white/90 backdrop-blur-xl shadow-sm border-b border-gray-200/60'
          : 'bg-white/60 backdrop-blur-md border-b border-gray-200/30'
      }`}
    >
      <div className="max-w-5xl mx-auto px-6 h-14 flex items-center">
        <a href="#" className="flex items-center gap-2 group">
          <img
            src={logo}
            alt="GRAEST"
            className="h-8 transition-opacity duration-200 group-hover:opacity-80"
          />
        </a>
      </div>
    </nav>
  )
}
