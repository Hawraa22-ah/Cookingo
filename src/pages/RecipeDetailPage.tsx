import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import RecipeDetail from '../components/recipes/RecipeDetail';
import { supabase } from '../lib/supabase';
import { Recipe } from '../types';

interface Chef {
  id: string;
  full_name: string;
  avatar_url?: string;
  bio?: string;
}


const RecipeDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [loading, setLoading] = useState(true);

  const [chef, setChef] = useState<Chef | null>(null);

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
        if (data.chef_id) {
          const { data: chefData, error:chefError } = await supabase
            .from('profiles')
            .select('id, full_name, avatar_url, bio')
            .eq('id', data.chef_id)
            .single();
            if (chefError) {
              console.error('Chef fetch error:', chefError.message);
            }
          setChef(chefData ?? null);
        }
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
      {chef && (
        <div className="mt-10 border-t pt-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Chef</h3>
          <div className="flex items-center space-x-4">
            {chef.avatar_url && (
              <img
                src={chef.avatar_url}
                alt={chef.full_name}
                className="w-12 h-12 rounded-full object-cover"
              />
            )}
            <div>
              <p className="text-gray-800 font-medium">{chef.full_name}</p>
              {chef.bio && <p className="text-gray-600 text-sm">{chef.bio}</p>}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RecipeDetailPage;

