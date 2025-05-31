import React from 'react';
import { Link } from 'react-router-dom';
import { Search, ArrowRight } from 'lucide-react';


const HeroSection: React.FC = () => {
  return (
    <div className="relative bg-cover bg-center h-[80vh] flex items-center" 
      style={{ backgroundImage: 'url(https://images.pexels.com/photos/1640773/pexels-photo-1640773.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2)' }}>
      <div className="absolute inset-0 bg-black bg-opacity-50"></div>
      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-2xl">
          <h1 className="text-5xl md:text-6xl font-bold text-white font-serif mb-4 leading-tight">
            Discover Delicious Recipes For Every Occasion
          </h1>
          <p className="text-xl text-white mb-8">
            From quick weeknight dinners to impressive party dishes, find your next culinary inspiration at Cookingo.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Link to="/recipes" className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-lg font-medium flex items-center justify-center transition-colors">
              Browse Recipes
              <ArrowRight size={18} className="ml-2" />
            </Link>
            <Link to="/search" className="bg-white hover:bg-gray-100 text-gray-800 px-6 py-3 rounded-lg font-medium flex items-center justify-center transition-colors">
              <Search size={18} className="mr-2" />
              Search Recipes
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroSection;