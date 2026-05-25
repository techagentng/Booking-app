import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Menu, X, Calendar, Info, CalendarDays, Users, Images, Phone, ChevronDown } from 'lucide-react';

export default function PublicHeader() {
  const [isSticky, setIsSticky] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsSticky(window.scrollY > 0);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navigation = [
    { name: 'Home', href: '/', icon: null },
    { 
      name: 'Hire & Info', 
      href: '/hire',
      icon: Info,
      submenu: [
        { name: 'Hall Hire', href: '/hire/hall' },
        { name: 'Pricing', href: '/hire/pricing' },
        { name: 'Facilities', href: '/hire/facilities' },
        { name: 'Terms & Conditions', href: '/hire/terms' }
      ]
    },
    { 
      name: 'Whats On', 
      href: '/events',
      icon: Calendar,
      submenu: [
        { name: 'Upcoming Events', href: '/events/upcoming' },
        { name: 'Past Events', href: '/events/past' },
        { name: 'Community Calendar', href: '/events/calendar' }
      ]
    },
    { 
      name: 'Groups', 
      href: '/groups',
      icon: Users,
      submenu: [
        { name: 'Regular Groups', href: '/groups/regular' },
        { name: 'Community Groups', href: '/groups/community' },
        { name: 'Start a Group', href: '/groups/start' }
      ]
    },
    { name: 'Gallery', href: '/gallery', icon: Images },
    { name: 'Contact Us', href: '/contact', icon: Phone },
  ];

  return (
    <>
      {/* Announcement Bar (optional) */}
      <div className="bg-blue-600 text-white text-center py-2 text-sm">
        <p>🎉 Book your event now! Special rates available for community groups.</p>
      </div>

      {/* Main Header */}
      <header className={`bg-white shadow-md transition-all duration-300 z-50 ${
        isSticky ? 'fixed top-0 left-0 right-0' : 'relative'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex-shrink-0">
              <Link href="/" className="flex items-center">
                <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center mr-3">
                  <span className="text-white font-bold text-xl">LV</span>
                </div>
                <span className="text-xl font-bold text-gray-900">Lakeview Village Hall</span>
              </Link>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center space-x-8">
              {navigation.map((item) => (
                <div key={item.name} className="relative group">
                  {item.submenu ? (
                    <div className="flex items-center space-x-1 py-5">
                      <Link
                        href={item.href}
                        className="text-gray-700 hover:text-blue-600 px-3 py-2 text-sm font-medium transition-colors flex items-center"
                      >
                        {item.icon && <item.icon className="w-4 h-4 mr-1" />}
                        {item.name}
                        <ChevronDown className="w-4 h-4 ml-1" />
                      </Link>
                      
                      {/* Dropdown Menu */}
                      <div className="absolute left-0 mt-0 w-48 bg-white rounded-lg shadow-lg border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 transform group-hover:translate-y-0 translate-y-2">
                        <div className="py-1">
                          {item.submenu.map((subItem) => (
                            <Link
                              key={subItem.name}
                              href={subItem.href}
                              className="block px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                            >
                              {subItem.name}
                            </Link>
                          ))}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <Link
                      href={item.href}
                      className="text-gray-700 hover:text-blue-600 px-3 py-2 text-sm font-medium transition-colors flex items-center"
                    >
                      {item.icon && <item.icon className="w-4 h-4 mr-1" />}
                      {item.name}
                    </Link>
                  )}
                </div>
              ))}
            </nav>

            {/* CTA Button */}
            <div className="hidden lg:block">
              <Link
                href="/bookings/new"
                className="bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors shadow-md hover:shadow-lg"
              >
                Book the Hall
              </Link>
            </div>

            {/* Mobile menu button */}
            <div className="lg:hidden">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="text-gray-700 hover:text-blue-600 p-2"
              >
                {mobileMenuOpen ? (
                  <X className="w-6 h-6" />
                ) : (
                  <Menu className="w-6 h-6" />
                )}
              </button>
            </div>
          </div>

          {/* Mobile Navigation */}
          {mobileMenuOpen && (
            <div className="lg:hidden border-t border-gray-200">
              <div className="px-2 pt-2 pb-3 space-y-1">
                {navigation.map((item) => (
                  <div key={item.name}>
                    <Link
                      href={item.href}
                      className="text-gray-700 hover:text-blue-600 block px-3 py-2 text-base font-medium transition-colors"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      {item.icon && <item.icon className="w-4 h-4 mr-2 inline" />}
                      {item.name}
                    </Link>
                    
                    {/* Mobile Submenu */}
                    {item.submenu && (
                      <div className="pl-6 space-y-1">
                        {item.submenu.map((subItem) => (
                          <Link
                            key={subItem.name}
                            href={subItem.href}
                            className="text-gray-600 hover:text-blue-600 block px-3 py-2 text-sm transition-colors"
                            onClick={() => setMobileMenuOpen(false)}
                          >
                            {subItem.name}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
                
                {/* Mobile CTA Button */}
                <div className="px-3 py-2">
                  <Link
                    href="/bookings/new"
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors w-full text-center block"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Book the Hall
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Spacer for sticky header */}
      {isSticky && <div className="h-16"></div>}
    </>
  );
}
