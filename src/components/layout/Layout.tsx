import React, { FC, useState, useEffect } from "react";
import { Outlet, NavLink, useLocation } from "react-router-dom";
import { FiClock, FiCalendar, FiMenu, FiX, FiSettings } from "react-icons/fi";
import { MdOutlineFactory } from "react-icons/md";

interface Company {
  name: string;
  [key: string]: any;
}

interface NavItem {
  name: string;
  path: string;
  icon: React.ReactNode;
}

const Layout: FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);
  const location = useLocation();

  // Close mobile menu when location changes
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location]);

  const navItems: NavItem[] = [
    { name: "Companies", path: "/companies", icon: <MdOutlineFactory /> },
    { name: "Employees", path: "/employee", icon: <FiCalendar /> },
    { name: "Stamp Types", path: "/stamp-types", icon: <FiSettings /> },
  ];

  return (
    <div className="h-screen flex flex-col bg-neutral-50">
      {/* Header */}
      <header className="flex-none bg-white border-b border-neutral-200 shadow-sm">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <span className="text-primary-600 font-bold text-xl tracking-tight">
                  Jotbar
                </span>
              </div>
            </div>
            {/* Mobile menu button */}
            <div className="md:hidden">
              <button
                onClick={() => setMobileMenuOpen((open) => !open)}
                className="inline-flex items-center justify-center p-2 rounded-md text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500 transition-colors duration-200"
              >
                <span className="sr-only">Open sidebar menu</span>
                {mobileMenuOpen ? (
                  <FiX className="block h-6 w-6" />
                ) : (
                  <FiMenu className="block h-6 w-6" />
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <aside
          className={`fixed md:relative bg-white border-r border-neutral-200 w-64 flex-none z-40 transition-all duration-300 ease-in-out ${
            mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
          } md:translate-x-0`}
        >
          <nav className="h-full px-2 py-3 space-y-1">
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 ${
                    isActive
                      ? "bg-primary-50 text-primary-700 shadow-sm"
                      : "text-neutral-700 hover:text-primary-600 hover:bg-neutral-50"
                  }`
                }
                onClick={() => setMobileMenuOpen(false)}
              >
                <span className="mr-3 text-lg">{item.icon}</span>
                {item.name}
              </NavLink>
            ))}
          </nav>
        </aside>

        {/* Main content */}
        <main className="flex-1 overflow-y-auto">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <Outlet />
          </div>
        </main>
      </div>

      {/* Footer */}
      <footer className="flex-none bg-white border-t border-neutral-200 py-2">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center text-sm text-neutral-500">
            &copy; {new Date().getFullYear()} WorkTime Manager. All rights
            reserved.
          </div>
        </div>
      </footer>

      {/* Mobile menu overlay */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-neutral-900/50 z-30 md:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}
    </div>
  );
};

export default Layout;
