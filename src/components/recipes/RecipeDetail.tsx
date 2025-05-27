import React from 'react';
import { Clock, Users, ChefHat, Star } from 'lucide-react';
import { Recipe } from '../../types';
import { calculateAverageRating } from '../../utils/helpers';
import RecipeInteractions from './RecipeInteractions';

interface RecipeDetailProps {
  recipe: Recipe;
}

const RecipeDetail: React.FC<RecipeDetailProps> = ({ recipe }) => {
  const averageRating = calculateAverageRating(recipe.ratings);

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-800 font-serif mb-4">{recipe.title}</h1>
        <p className="text-lg text-gray-600 mb-6">{recipe.description}</p>
        
        <div className="flex flex-wrap gap-3 mb-6">
          {recipe.tags.map((tag, index) => (
            <span 
              key={index} 
              className="bg-orange-100 text-orange-800 rounded-full py-1 px-3 text-sm font-medium"
            >
              {tag}
            </span>
          ))}
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-gray-50 p-4 rounded-lg text-center">
            <Clock className="w-6 h-6 mx-auto mb-2 text-orange-500" />
            <p className="text-sm text-gray-500">Cook Time</p>
            <p className="font-medium">{recipe.cook_time} min</p>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg text-center">
            <Users className="w-6 h-6 mx-auto mb-2 text-orange-500" />
            <p className="text-sm text-gray-500">Servings</p>
            <p className="font-medium">4</p>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg text-center">
            <ChefHat className="w-6 h-6 mx-auto mb-2 text-orange-500" />
            <p className="text-sm text-gray-500">Difficulty</p>
            <p className="font-medium">Medium</p>
          </div>
        </div>
      </div>
      
      <div className="mb-10">
        <img 
          src={recipe.image_url} 
          alt={recipe.title}
          className="w-full h-[400px] object-cover rounded-xl"
        />
      </div>
      
      <div className="grid md:grid-cols-3 gap-8 mb-12">
        <div className="md:col-span-1">
          <h2 className="text-2xl font-bold text-gray-800 mb-4 font-serif">Ingredients</h2>
          <ul className="space-y-3">
            {recipe.ingredients.map((ingredient, index) => (
              <li key={index} className="flex items-start">
                <span className="inline-block w-2 h-2 rounded-full bg-orange-500 mt-2 mr-3 flex-shrink-0"></span>
                <span>{ingredient.amount} {ingredient.unit} {ingredient.name}</span>
              </li>
            ))}
          </ul>
        </div>
        
        <div className="md:col-span-2">
          <h2 className="text-2xl font-bold text-gray-800 mb-4 font-serif">Instructions</h2>
          <ol className="space-y-6">
            {recipe.instructions.map((instruction, index) => (
              <li key={index} className="flex">
                <span className="flex-shrink-0 bg-orange-500 text-white w-8 h-8 rounded-full flex items-center justify-center mr-4 mt-1">
                  {instruction.step}
                </span>
                <p>{instruction.text}</p>
              </li>
            ))}
          </ol>
        </div>
      </div>
      
      <div className="border-t border-gray-200 pt-8">
        <RecipeInteractions 
          recipeId={recipe.id}
          initialRating={recipe.userRating}
          initialIsFavorite={recipe.isFavorite}
        />
      </div>
    </div>
  );
};

export default RecipeDetail;