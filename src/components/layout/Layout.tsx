import React, { FC, useState, useEffect } from "react";
import { Outlet, NavLink, useLocation } from "react-router-dom";
import { FiClock, FiCalendar, FiMenu, FiX } from "react-icons/fi";
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
    // { name: 'Parameters', path: '/parameters', icon: <FiSettings /> },
    { name: "Employees", path: "/employee", icon: <FiCalendar /> },
    { name: "Calculations", path: "/calculations", icon: <FiClock /> },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-white border-b border-neutral-200 fixed w-full z-10 h-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <span className="text-primary-600 font-semibold text-xl">
                  Jotbar
                </span>
              </div>
            </div>
            {/* Mobile menu button for sidebar */}
            <div className="md:hidden">
              <button
                onClick={() => setMobileMenuOpen((open) => !open)}
                className="inline-flex items-center justify-center p-2 rounded-md text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500"
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

      <div className="flex flex-1 pt-16">
        {/* Sidebar */}
        <aside
          className={`bg-white border-r border-neutral-200 w-64 min-h-screen px-4 py-6 fixed md:static z-20 transition-transform duration-200 ${
            mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
          } md:translate-x-0`}
        >
          <nav className="space-y-2">
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors duration-200 ${
                    isActive
                      ? "bg-primary-50 text-primary-700"
                      : "text-neutral-700 hover:text-primary-600 hover:bg-neutral-50"
                  }`
                }
                onClick={() => setMobileMenuOpen(false)}
              >
                <span className="mr-2">{item.icon}</span>
                {item.name}
              </NavLink>
            ))}
          </nav>
        </aside>
        {/* Main content */}
        <main className="flex-grow pb-8  transition-all duration-200">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 h-full">
            <Outlet />
          </div>
        </main>
      </div>

      <footer className="bg-white border-t border-neutral-200 py-4">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center text-sm text-neutral-500">
            &copy; {new Date().getFullYear()} WorkTime Manager. All rights
            reserved.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
