import React from 'react';
import { Recipe } from '../../types';
import RecipeCard from './RecipeCard';

interface RecipeGridProps {
  recipes: Recipe[];
  emptyMessage?: string;
}

const RecipeGrid: React.FC<RecipeGridProps> = ({ 
  recipes, 
  emptyMessage = "No recipes found. Try adjusting your search criteria." 
}) => {
  if (recipes.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 text-lg">{emptyMessage}</p>
      </div>
    );
  }
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {recipes.map((recipe) => (
        <RecipeCard key={recipe.id} recipe={recipe} />
      ))}
    </div>
  );
};

export default RecipeGrid;