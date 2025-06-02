import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { Recipe } from '../../types';
import RecipeCard from '../recipes/RecipeCard'; // or whatever component you use to render a recipe

const SavedRecipesPage: React.FC = () => {
  const { user } = useAuth();
  const [savedRecipes, setSavedRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSavedRecipes = async () => {
      if (!user) return;

      const { data, error } = await supabase
        .from('saved_recipes')
        .select('recipe:recipe_id(*)') // assuming FK to recipes table
        .eq('user_id', user.id);

      if (error) {
        console.error('Error fetching saved recipes:', error.message);
        setSavedRecipes([]);
      } else {
        const recipes = data.map((entry) => entry.recipe).filter(Boolean);
        setSavedRecipes(recipes);
      }
      setLoading(false);
    };

    fetchSavedRecipes();
  }, [user]);

  if (loading) {
    return <div className="text-center py-12">Loading saved recipes...</div>;
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Saved Recipes</h1>

      {savedRecipes.length === 0 ? (
        <div className="text-center py-20 text-gray-600">
          <div className="text-4xl mb-2">👨‍🍳</div>
          <p className="mb-2">You haven't saved any recipes yet.</p>
          <a href="/recipes" className="text-orange-500 hover:underline">
            Browse Recipes
          </a>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {savedRecipes.map((recipe) => (
            <RecipeCard key={recipe.id} recipe={recipe} />
          ))}
        </div>
      )}
    </div>
  );
};

export default SavedRecipesPage;
