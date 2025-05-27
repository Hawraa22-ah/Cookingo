import React from 'react';
import { Link } from 'react-router-dom';
import { ChefHat, Instagram, Facebook, Twitter, Mail } from 'lucide-react';

const Footer: React.FC = () => {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-gray-800 text-white pt-12 pb-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo and Tagline */}
          <div className="col-span-1 md:col-span-1">
            <Link to="/" className="flex items-center space-x-2 mb-4">
              <ChefHat size={24} className="text-orange-400" />
              <span className="text-xl font-bold font-serif">Cookingo</span>
            </Link>
            <p className="text-gray-300 mb-6">
              Discover delicious recipes for every occasion. From quick weeknight dinners to impressive dinner party dishes.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-300 hover:text-orange-400 transition-colors">
                <Instagram size={20} />
              </a>
              <a href="#" className="text-gray-300 hover:text-orange-400 transition-colors">
                <Facebook size={20} />
              </a>
              <a href="#" className="text-gray-300 hover:text-orange-400 transition-colors">
                <Twitter size={20} />
              </a>
              <a href="#" className="text-gray-300 hover:text-orange-400 transition-colors">
                <Mail size={20} />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="col-span-1">
            <h3 className="text-lg font-semibold mb-4 border-b border-gray-700 pb-2">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-gray-300 hover:text-orange-400 transition-colors">Home</Link>
              </li>
              <li>
                <Link to="/recipes" className="text-gray-300 hover:text-orange-400 transition-colors">All Recipes</Link>
              </li>
              <li>
                <Link to="/daily-dish" className="text-gray-300 hover:text-orange-400 transition-colors">Daily Dishes</Link>
              </li>
              <li>
                <Link to="/search" className="text-gray-300 hover:text-orange-400 transition-colors">Search</Link>
              </li>
            </ul>
          </div>

          {/* Recipe Categories */}
          <div className="col-span-1">
            <h3 className="text-lg font-semibold mb-4 border-b border-gray-700 pb-2">Categories</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/recipes?tag=Breakfast" className="text-gray-300 hover:text-orange-400 transition-colors">Breakfast</Link>
              </li>
              <li>
                <Link to="/recipes?tag=Lunch" className="text-gray-300 hover:text-orange-400 transition-colors">Lunch</Link>
              </li>
              <li>
                <Link to="/recipes?tag=Dinner" className="text-gray-300 hover:text-orange-400 transition-colors">Dinner</Link>
              </li>
              <li>
                <Link to="/recipes?tag=Dessert" className="text-gray-300 hover:text-orange-400 transition-colors">Desserts</Link>
              </li>
              <li>
                <Link to="/recipes?tag=Vegetarian" className="text-gray-300 hover:text-orange-400 transition-colors">Vegetarian</Link>
              </li>
            </ul>
          </div>

          {/* Newsletter */}
          <div className="col-span-1">
            <h3 className="text-lg font-semibold mb-4 border-b border-gray-700 pb-2">Stay Updated</h3>
            <p className="text-gray-300 mb-4">Subscribe to our newsletter for new recipes and cooking tips.</p>
            <form className="flex flex-col space-y-2">
              <input 
                type="email" 
                placeholder="Your email address" 
                className="px-4 py-2 bg-gray-700 text-white rounded focus:outline-none focus:ring-2 focus:ring-orange-400"
              />
              <button 
                type="submit" 
                className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded transition-colors"
              >
                Subscribe
              </button>
            </form>
          </div>
        </div>

        <div className="mt-12 pt-4 border-t border-gray-700 text-center text-gray-400 text-sm">
          <p>© {year} Cookingo. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;