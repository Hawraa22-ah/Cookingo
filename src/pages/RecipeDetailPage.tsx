import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import RecipeDetail from '../components/recipes/RecipeDetail';
import { supabase } from '../lib/supabase';
import { Recipe } from '../types';

const RecipeDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRecipe = async () => {
      if (!id) return;

      const { data, error } = await supabase
        .from('recipes')
        .select('*')
        .eq('id', id)
        .single();

      if (error || !data || data.status !== 'published') {
        setRecipe(null);
      } else {
        setRecipe(data);
      }

      setLoading(false);
    };

    fetchRecipe();
  }, [id]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-16 flex justify-center">
        <div className="animate-pulse">Loading recipe...</div>
      </div>
    );
  }

  if (!recipe) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Recipe Not Found</h2>
        <p className="text-gray-600 mb-6">
          The recipe you're looking for doesn't exist, is private, or has been removed.
        </p>
        <button
          onClick={() => navigate('/recipes')}
          className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-lg font-medium transition-colors"
        >
          Browse All Recipes
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="mb-6">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center text-gray-600 hover:text-orange-500 transition-colors"
        >
          <ArrowLeft size={18} className="mr-2" />
          Back
        </button>
      </div>

      <RecipeDetail recipe={recipe} />
    </div>
  );
};

export default RecipeDetailPage;
