import React, { useState, useEffect } from 'react';
import { Menu, X, ChefHat, User } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import AuthButtons from '../auth/AuthButtons';

const Header: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [isChef, setIsChef] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      const offset = window.scrollY;
      setScrolled(offset > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setIsMenuOpen(false);
  }, [location]);

  useEffect(() => {
    const checkChefStatus = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single();
        
        setIsChef(profile?.role === 'chef');
      }
    };

    checkChefStatus();
  }, []);


  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      scrolled ? 'bg-white shadow-md py-2' : 'bg-transparent py-4'
    }`}>
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center space-x-2">
            <ChefHat size={28} className="text-orange-500" />
            <span className="text-2xl font-bold font-serif text-gray-800">Cookingo</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link to="/" className={`text-lg font-medium hover:text-orange-500 transition-colors ${
              location.pathname === '/' ? 'text-orange-500' : 'text-gray-700'
            }`}>
              Home
            </Link>
            <Link to="/recipes" className={`text-lg font-medium hover:text-orange-500 transition-colors ${
              location.pathname.includes('/recipes') ? 'text-orange-500' : 'text-gray-700'
            }`}>
              Recipes
            </Link>
            <Link to="/daily-dish" className={`text-lg font-medium hover:text-orange-500 transition-colors ${
              location.pathname.includes('/daily-dish') ? 'text-orange-500' : 'text-gray-700'
            }`}>
              Daily Dishes
            </Link>
            {isChef && (
              <Link to="/chef/dashboard" className={`text-lg font-medium hover:text-orange-500 transition-colors ${
                location.pathname.includes('/chef/dashboard') ? 'text-orange-500' : 'text-gray-700'
              }`}>
                Chef Dashboard
              </Link>
            )}
            <AuthButtons />
          </nav>

          {/* Mobile Menu Button */}
          <button 
            onClick={toggleMenu}
            className="md:hidden text-gray-700 focus:outline-none"
            aria-label={isMenuOpen ? "Close menu" : "Open menu"}
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className="md:hidden absolute top-full left-0 right-0 bg-white shadow-md py-4 px-4 transition-all duration-300">
          <nav className="flex flex-col space-y-4">
            <Link to="/" className={`text-lg font-medium hover:text-orange-500 transition-colors ${
              location.pathname === '/' ? 'text-orange-500' : 'text-gray-700'
            }`}>
              Home
            </Link>
            <Link to="/recipes" className={`text-lg font-medium hover:text-orange-500 transition-colors ${
              location.pathname.includes('/recipes') ? 'text-orange-500' : 'text-gray-700'
            }`}>
              Recipes
            </Link>
            <Link to="/daily-dish" className={`text-lg font-medium hover:text-orange-500 transition-colors ${
              location.pathname.includes('/daily-dish') ? 'text-orange-500' : 'text-gray-700'
            }`}>
              Daily Dishes
            </Link>
            {isChef && (
              <Link to="/chef/dashboard" className={`text-lg font-medium hover:text-orange-500 transition-colors ${
                location.pathname.includes('/chef/dashboard') ? 'text-orange-500' : 'text-gray-700'
              }`}>
                Chef Dashboard
              </Link>
            )}
            <div className="pt-2 border-t border-gray-200">
              <AuthButtons />
            </div>
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header;