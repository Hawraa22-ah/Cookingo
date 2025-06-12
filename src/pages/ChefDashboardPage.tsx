import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { Recipe, Dish } from '../types';
import RecipeForm from '../components/recipes/RecipeForm';
import toast from 'react-hot-toast';
import DishForm from '../components/dishes/DishForm';
import ChefStats from './GhefsStat';

const ChefDashboardPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [dishes, setDishes] = useState<Dish[]>([]);
  const [loading, setLoading] = useState(true);
  const [showRecipeForm, setShowRecipeForm] = useState(false);
  const [editingRecipe, setEditingRecipe] = useState<Recipe | null>(null);
  const [tab, setTab] = useState<'dishes' | 'recipes'>('dishes');
  const [showDishForm, setShowDishForm] = useState(false);

  useEffect(() => {
    if (!user?.id) {
      navigate('/login');
      return;
    }

    checkChefAccess();
    loadContent();
  }, [user?.id]);

  const checkChefAccess = async () => {
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user?.id)
      .single();

    if (error || profile?.role !== 'chef') {
      toast.error('Access denied. Only chefs can view this page.');
      navigate('/');
    }
  };

  const loadContent = async () => {
    if (!user?.id) return;

    try {
      const [recipesResponse, dishesResponse] = await Promise.all([
        supabase
          .from('recipes')
          .select('*')
          .eq('chef_id', user.id)
          .order('created_at', { ascending: false }),
        supabase
          .from('dishes')
          .select('*')
          .eq('chef_id', user.id)
          .order('created_at', { ascending: false }),
      ]);

      if (recipesResponse.error) throw recipesResponse.error;
      if (dishesResponse.error) throw dishesResponse.error;

      setRecipes(recipesResponse.data || []);
      setDishes(dishesResponse.data || []);
    } catch (err: any) {
      console.error('Failed to load content:', err.message);
      toast.error('Failed to load content');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteRecipe = async (id: string) => {
    if (!confirm('Are you sure you want to delete this recipe?')) return;
    try {
      const { error } = await supabase.from('recipes').delete().eq('id', id);
      if (error) throw error;
      setRecipes(prev => prev.filter(r => r.id !== id));
      toast.success('Recipe deleted');
    } catch (err: any) {
      toast.error('Could not delete recipe');
    }
  };

  const handleDeleteDish = async (id: string) => {
    if (!confirm('Are you sure you want to delete this dish?')) return;
    try {
      const { error } = await supabase.from('dishes').delete().eq('id', id);
      if (error) throw error;
      setDishes(prev => prev.filter(d => d.id !== id));
      toast.success('Dish deleted');
    } catch (err: any) {
      toast.error('Could not delete dish');
    }
  };

  const handleRecipeSubmit = async () => {
    setShowRecipeForm(false);
    setEditingRecipe(null);
    await loadContent();
  };

  return (
    <>
      <div className="bg-orange-500 text-white py-10 px-4 rounded-b-xl shadow">
        <div className="container mx-auto">
          <h1 className="text-3xl font-bold mb-2">Chef Dashboard</h1>
          <p className="text-lg">
            Welcome back, {user?.user_metadata?.full_name || 'Chef'}! Manage your dishes and recipes here.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-10">
        <ChefStats userId={user.id} />

        <div className="flex space-x-6 border-b mb-6">
          <button
            className={`pb-2 border-b-2 font-semibold ${tab === 'dishes' ? 'border-orange-500 text-orange-500' : 'border-transparent text-gray-600'}`}
            onClick={() => setTab('dishes')}
          >
            🍽️ My Dishes
          </button>
          <button
            className={`pb-2 border-b-2 font-semibold ${tab === 'recipes' ? 'border-orange-500 text-orange-500' : 'border-transparent text-gray-600'}`}
            onClick={() => setTab('recipes')}
          >
            📖 My Recipes
          </button>
        </div>

        {tab === 'dishes' ? (
          <div>
            <button
              onClick={() => setShowDishForm(true)}
              className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded mb-4 flex items-center gap-2"
            >
              <Plus size={18} /> Add Dish
            </button>
            {dishes.map(dish => (
              <div key={dish.id} className="p-4 border rounded shadow flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-semibold">{dish.name}</h3>
                  <p className="text-sm text-gray-600">{dish.description}</p>
                </div>
                <button onClick={() => handleDeleteDish(dish.id)}>
                  <Trash2 className="text-red-500 hover:text-red-700" />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div>
            <button
              onClick={() => setShowRecipeForm(true)}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded mb-4 flex items-center gap-2"
            >
              <Plus size={18} /> Add Recipe
            </button>
            {recipes.map(recipe => (
              <div key={recipe.id} className="p-4 border rounded shadow flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-semibold">{recipe.title}</h3>
                  <p className="text-sm text-gray-600">{recipe.description}</p>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => {
                    setEditingRecipe(recipe);
                    setShowRecipeForm(true);
                  }}>
                    <Edit2 className="text-blue-500 hover:text-blue-700" />
                  </button>
                  <button onClick={() => handleDeleteRecipe(recipe.id)}>
                    <Trash2 className="text-red-500 hover:text-red-700" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showRecipeForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold mb-6">{editingRecipe ? 'Edit Recipe' : 'Create New Recipe'}</h2>
            <RecipeForm
              initialData={editingRecipe || undefined}
              onSubmit={handleRecipeSubmit}
              onCancel={() => {
                setShowRecipeForm(false);
                setEditingRecipe(null);
              }}
            />
          </div>
        </div>
      )}

      {showDishForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold mb-6">Create New Dish</h2>
            <DishForm
              onSubmit={() => {
                setShowDishForm(false);
                loadContent();
              }}
              onCancel={() => setShowDishForm(false)}
            />
          </div>
        </div>
      )}
    </>
  );
};

export default ChefDashboardPage;

