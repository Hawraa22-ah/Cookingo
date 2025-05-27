import React from 'react';
import { Link } from 'react-router-dom';
import { Clock, Users } from 'lucide-react';
import { DailyDish } from '../../types';
import { formatDate } from '../../utils/helpers';

interface DailyDishSectionProps {
  dailyDish: DailyDish;
}

const DailyDishSection: React.FC<DailyDishSectionProps> = ({ dailyDish }) => {
  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold font-serif text-gray-800 mb-10 text-center">Today's Special</h2>
        
        <div className="bg-white rounded-xl shadow-lg overflow-hidden max-w-5xl mx-auto">
          <div className="flex flex-col lg:flex-row">
            <div className="lg:w-1/2">
              <img 
                src={dailyDish.image} 
                alt={dailyDish.title}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="lg:w-1/2 p-8 flex flex-col justify-center">
              <div className="text-orange-500 font-medium mb-2">
                {formatDate(dailyDish.date)}
              </div>
              <h3 className="text-2xl font-bold font-serif text-gray-800 mb-4">{dailyDish.title}</h3>
              <p className="text-gray-600 mb-6">{dailyDish.description}</p>
              
              <Link 
                to="/daily-dish"
                className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-lg font-medium inline-block text-center transition-colors w-full sm:w-auto"
              >
                View Daily Dishes
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default DailyDishSection;