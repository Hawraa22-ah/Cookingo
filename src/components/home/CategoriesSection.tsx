import React from 'react';
import { Link } from 'react-router-dom';

const categories = [
  {
    name: 'Breakfast',
    image: 'https://images.pexels.com/photos/103124/pexels-photo-103124.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    description: 'Start your day right'
  },
  {
    name: 'Vitamins',
    image: 'https://images.pexels.com/photos/1527603/pexels-photo-1527603.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    // description: 'Pizza, pasta and more'
  },
  {
    name: 'Calories',
    image: 'https://images.pexels.com/photos/291528/pexels-photo-291528.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    // description: 'Sweet treats for everyone'
  },
  {
    name: 'Vegetarian',
    image: 'https://images.pexels.com/photos/1092730/pexels-photo-1092730.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    description: 'Plant-based goodness'
  }
];

const CategoriesSection: React.FC = () => {
  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold font-serif text-gray-800 mb-2 text-center">Browse by Category</h2>
        <p className="text-gray-600 text-center mb-10">Discover recipes tailored to your tastes and dietary needs</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {categories.map((category) => (
            <Link 
              key={category.name}
              to={`/recipes?tag=${category.name}`}
              className="group relative rounded-xl overflow-hidden shadow-md transition-transform hover:scale-[1.02] hover:shadow-lg"
            >
              <div className="aspect-square">
                <img 
                  src={category.image} 
                  alt={category.name}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex flex-col justify-end p-6">
                <h3 className="text-xl font-bold text-white mb-1">{category.name}</h3>
                <p className="text-gray-200 text-sm">{category.description}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CategoriesSection;