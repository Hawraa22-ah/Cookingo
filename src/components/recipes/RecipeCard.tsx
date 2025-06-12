import React from 'react';
import { Link } from 'react-router-dom';
import { Clock, ChefHat } from 'lucide-react';
import { Recipe } from '../../types';
import { calculateAverageRating } from '../../utils/helpers';

interface RecipeCardProps {
  recipe: Recipe;
}

const RecipeCard: React.FC<RecipeCardProps> = ({ recipe }) => {
  const averageRating = calculateAverageRating(recipe.ratings);
  
  return (
    <Link 
      to={`/recipes/${recipe.id}`}
      className="group bg-white rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-shadow"
    >
      <div className="relative overflow-hidden aspect-[4/3]">
        <img 
          src={recipe.image_url} 
          alt={recipe.title}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
        

        <div className="absolute top-3 right-3 bg-white rounded-full py-1 px-2 flex items-center shadow-md">
          <span className="text-yellow-500 mr-1">★</span>
          {/* <span className="text-sm font-medium">{averageRating}</span> */}
          <span className="text-sm font-medium">
            {/* {typeof averageRating === 'number' && !isNaN(averageRating)
              ? averageRating.toFixed(1)
              : '0.0'} */}
            {typeof recipe.avg_rating === 'number' && !isNaN(recipe.avg_rating)
      ? recipe.avg_rating.toFixed(1)
      : '0.0'}

          </span>
        </div>
      </div>
      
      <div className="p-5">
        <div className="flex flex-wrap gap-2 mb-3">
          {recipe.tags.slice(0, 3).map((tag, index) => (
            <span 
              key={index} 
              className="text-xs font-medium bg-orange-100 text-orange-800 rounded-full py-1 px-2"
            >
              {tag}
            </span>
          ))}
        </div>
        
        <h3 className="text-xl font-bold text-gray-800 mb-2 group-hover:text-orange-500 transition-colors">
          {recipe.title}
        </h3>
        
        <p className="text-gray-600 text-sm mb-4 line-clamp-2">
          {recipe.description}
        </p>
        <p className="text-sm text-gray-500">
          By: {recipe.chef?.username || 'Unknown Chef'}
        </p>
        
        <div className="flex items-center justify-between text-sm text-gray-500">
          <div className="flex items-center">
            <Clock size={16} className="mr-1" />
            <span>{recipe.cook_time} min</span>
          </div>
          <div className="flex items-center">
            <ChefHat size={16} className="mr-1" />
          </div>
        </div>
      </div>
    </Link>
  );
};

export default RecipeCard;