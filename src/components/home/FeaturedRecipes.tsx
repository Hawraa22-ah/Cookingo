import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { Recipe } from '../../types';
import RecipeCard from '../recipes/RecipeCard';

interface FeaturedRecipesProps {
  recipes: Recipe[];
}

const FeaturedRecipes: React.FC<FeaturedRecipesProps> = ({ recipes }) => {
  // Take the first 3 recipes for featured section
  const featuredRecipes = recipes.slice(0, 3);

  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center mb-10">
          <h2 className="text-3xl font-bold font-serif text-gray-800">Featured Recipes</h2>
          <Link 
            to="/recipes" 
            className="flex items-center text-orange-500 hover:text-orange-600 font-medium transition-colors"
          >
            View all recipes
            <ChevronRight size={18} className="ml-1" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {featuredRecipes.map((recipe) => (
            <RecipeCard key={recipe.id} recipe={recipe} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturedRecipes;