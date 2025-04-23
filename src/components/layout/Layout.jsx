import React from 'react'
import { useState, useEffect } from 'react'
import { Outlet, NavLink, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { 
  FiSettings, 
  FiClock, 
  FiCalendar, 
  FiMenu, 
  FiX 
} from 'react-icons/fi'

const Layout = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const location = useLocation()
  
  // Close mobile menu when location changes
  useEffect(() => {
    setMobileMenuOpen(false)
  }, [location])

  const navItems = [
    { name: 'Parameters', path: '/parameters', icon: <FiSettings /> },
    { name: 'Schedule', path: '/schedule', icon: <FiCalendar /> },
    { name: 'Calculations', path: '/calculations', icon: <FiClock /> },
  ]

  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-white border-b border-neutral-200 fixed w-full z-10">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <span className="text-primary-600 font-semibold text-xl">WorkTime</span>
              </div>
            </div>
            
            {/* Desktop navigation */}
            <nav className="hidden md:flex space-x-8">
              {navItems.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) => 
                    `flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors duration-200 ${
                      isActive 
                        ? 'bg-primary-50 text-primary-700' 
                        : 'text-neutral-700 hover:text-primary-600 hover:bg-neutral-50'
                    }`
                  }
                >
                  <span className="mr-2">{item.icon}</span>
                  {item.name}
                </NavLink>
              ))}
            </nav>
            
            {/* Mobile menu button */}
            <div className="md:hidden">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="inline-flex items-center justify-center p-2 rounded-md text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500"
              >
                <span className="sr-only">Open main menu</span>
                {mobileMenuOpen ? <FiX className="block h-6 w-6" /> : <FiMenu className="block h-6 w-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <motion.div 
            className="md:hidden"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white shadow-lg border-t border-neutral-200">
              {navItems.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) => 
                    `flex items-center px-3 py-2 rounded-md text-base font-medium ${
                      isActive 
                        ? 'bg-primary-50 text-primary-700' 
                        : 'text-neutral-700 hover:text-primary-600 hover:bg-neutral-50'
                    }`
                  }
                >
                  <span className="mr-3">{item.icon}</span>
                  {item.name}
                </NavLink>
              ))}
            </div>
          </motion.div>
        )}
      </header>

      <main className="flex-grow pt-16 pb-8">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 h-full">
          <Outlet />
        </div>
      </main>

      <footer className="bg-white border-t border-neutral-200 py-4">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center text-sm text-neutral-500">
            &copy; {new Date().getFullYear()} WorkTime Manager. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  )
}

export default Layout