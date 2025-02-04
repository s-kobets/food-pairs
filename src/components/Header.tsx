import { Link, useLocation } from 'react-router-dom'
import { useState } from 'react'

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const location = useLocation()

  const links = [
    { to: "/", label: "Home" },
    { to: "/foods", label: "Foods" },
    { to: "/combinations", label: "Combinations" },
    { to: "/checker", label: "Checker" },
  ]

  return (
    <header className="bg-white shadow">
      <nav className="container mx-auto px-4">
        {/* Desktop Menu */}
        <div className="hidden md:flex items-center justify-between h-16">
          <Link to="/" className="text-xl font-bold text-blue-600">
            FoodPairs
          </Link>
          <ul className="flex gap-6">
            {links.map(link => (
              <li key={link.to}>
                <Link 
                  to={link.to}
                  className={`hover:text-blue-600 ${
                    location.pathname === link.to ? 'text-blue-600 font-medium' : 'text-gray-600'
                  }`}
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Mobile Menu */}
        <div className="md:hidden flex items-center justify-between h-14">
          <Link to="/" className="text-lg font-bold text-blue-600">
            FoodPairs
          </Link>
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="p-2 rounded-lg hover:bg-gray-100"
          >
            {isMenuOpen ? (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>

        {/* Mobile Menu Dropdown */}
        {isMenuOpen && (
          <div className="md:hidden py-2 border-t">
            <ul className="space-y-1">
              {links.map(link => (
                <li key={link.to}>
                  <Link
                    to={link.to}
                    className={`block px-4 py-2 rounded-lg ${
                      location.pathname === link.to 
                        ? 'bg-blue-50 text-blue-600 font-medium' 
                        : 'text-gray-600 hover:bg-gray-50'
                    }`}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}
      </nav>
    </header>
  )
}

export default Header 