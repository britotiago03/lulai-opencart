'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Link as ScrollLink } from 'react-scroll';
import React, { useEffect, useState } from 'react';
import { animateScroll as scroll } from 'react-scroll';
import { usePathname } from 'next/navigation';

const Header: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const pathname = usePathname();

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { to: 'home', label: 'Home' },
    { to: 'process-section', label: 'Process' },
    { to: 'features-section', label: 'Features' },
  ];

  const handleLogoClick = (e: React.MouseEvent) => {
    e.preventDefault();
    // If not on homepage, navigate to homepage
    if (pathname !== '/') {
      window.location.href = '/';
    } else {
      // If on homepage, scroll to top
      scroll.scrollToTop({ duration: 1000, smooth: 'easeInOutQuart' });
    }
  };

  // Don't render the header on the chatbot page
  if (pathname === '/botpage') {
    return null;
  }

  // Determine what button to show based on the current page
  const renderActionButton = () => {
    // On service selection, webscraper, or jsonupload page, don't show any button
    if (['/service', '/webscraper', '/jsonupload'].includes(pathname)) {
      return null;
    }

    // On home page or any other page, show the sign up button
    return (
        <Link
            href={`/service`}
            className="bg-black font-sans shadow-md rounded-md py-2 px-5 text-white font-semibold hover:bg-slate-600 duration-300 hidden md:flex"
        >
          Try Our AI Agent
        </Link>
    );
  };

  return (
      <>
        <header
            className={`text-black w-full fixed z-[9999] transition-all duration-300 px-5 sm:px-10
          ${isScrolled
                ? 'py-2 border-b border-slate-200 bg-gray-100 shadow-md backdrop-blur-sm bg-opacity-90'
                : 'py-5 bg-white bg-opacity-95'
            }
          ${isMenuOpen ? 'shadow-md bg-opacity-100 bg-gray-100' : ''}`}
        >
          <div className="flex flex-wrap justify-between items-center max-w-7xl mx-auto lg:px-4 xl:px-8 py-2">
            <a href="/" onClick={handleLogoClick}>
              <Image
                  src="/assets/header/lulai-logo-black.png"
                  alt="LulAI Logo"
                  width={180}
                  height={44}
                  className="w-[140px] h-[34px] md:w-[180px] md:h-[44px] hover:cursor-pointer"
              />
            </a>
            <button
                onClick={toggleMenu}
                className="text-black focus:outline-none md:hidden"
            >
              <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
              >
                <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d={isMenuOpen ? 'M6 18L18 6M6 6l12 12' : 'M4 6h16M4 12h16m-7 6h7'}
                ></path>
              </svg>
            </button>
            <nav
                className={`w-full md:w-auto items-center flex flex-col gap-8 lg:gap-16 md:flex-row md:flex text-md lg:text-base font-sans mt-10 md:mt-0 font-normal text-zinc-500
              ${isMenuOpen ? 'block' : 'hidden'} md:block`}
            >
              {pathname === '/' ? (
                  // On homepage, use scroll links
                  navLinks.map((link) => (
                      <ScrollLink
                          key={link.to}
                          to={link.to}
                          smooth={true}
                          duration={1000}
                          spy={true}
                          activeClass="text-black"
                          className="relative cursor-pointer transition-all ease-in-out before:transition-[width] before:ease-in-out
                    before:duration-300 before:absolute before:bg-black before:origin-center before:h-[1px] before:w-0
                    hover:before:w-[50%] before:bottom-0 before:left-[45%] after:transition-[width] after:ease-in-out
                    after:duration-300 after:absolute after:bg-black after:origin-center after:h-[1px] after:w-0
                    hover:after:w-[50%] after:bottom-0 after:right-[45%] font-medium"
                      >
                        {link.label}
                      </ScrollLink>
                  ))
              ) : (
                  // On other pages, use standard links to homepage
                  navLinks.map((link) => (
                      <Link
                          key={link.to}
                          href={`/#${link.to}`}
                          className="relative cursor-pointer transition-all ease-in-out before:transition-[width] before:ease-in-out
                    before:duration-300 before:absolute before:bg-black before:origin-center before:h-[1px] before:w-0
                    hover:before:w-[50%] before:bottom-0 before:left-[45%] after:transition-[width] after:ease-in-out
                    after:duration-300 after:absolute after:bg-black after:origin-center after:h-[1px] after:w-0
                    hover:after:w-[50%] after:bottom-0 after:right-[45%] font-medium"
                      >
                        {link.label}
                      </Link>
                  ))
              )}
              {/* Mobile version of action button */}
              {!(['/service', '/webscraper', '/jsonupload'].includes(pathname)) && (
                  <Link
                      href={`/service`}
                      className="bg-black shadow-md rounded-md py-2 px-5 text-white font-semibold hover:bg-slate-600 duration-300 flex md:hidden"
                  >
                    Try Our AI Agent
                  </Link>
              )}
            </nav>
            {/* Desktop version of action button */}
            {renderActionButton()}
          </div>
        </header>
        {/* Add spacing div to prevent content from being hidden under the fixed header */}
        <div className="h-24"></div>
      </>
  );
};

export default Header;