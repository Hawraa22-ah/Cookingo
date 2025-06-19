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

// Type for Impact Updates entries
type Update = {
  id: number;
  title: string;
  description: string;
  image_url: string;
  created_at: string;
};

const ChefDashboardPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Recipes & Dishes
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [dishes, setDishes]   = useState<Dish[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab]         = useState<'dishes' | 'recipes' | 'impact'>('dishes');

  // Recipe form state
  const [showRecipeForm, setShowRecipeForm] = useState(false);
  const [editingRecipe, setEditingRecipe]   = useState<Recipe | null>(null);

  // Dish form state
  const [showDishForm, setShowDishForm] = useState(false);

  // Impact updates state + form fields
  const [updates, setUpdates]             = useState<Update[]>([]);
  const [newTitle, setNewTitle]           = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newImageUrl, setNewImageUrl]     = useState('');
  const [updateSuccess, setUpdateSuccess] = useState('');
  const [editingUpdate, setEditingUpdate] = useState<Update | null>(null);

  // --- Initialization ---
  useEffect(() => {
    if (!user?.id) {
      navigate('/login');
      return;
    }
    init();
  }, [user?.id]);

  const init = async () => {
    await checkChefAccess();
    await loadContent();
    await fetchUpdates();
  };

  // --- Access Control ---
  const checkChefAccess = async () => {
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user!.id)
      .single();
    if (error || profile?.role !== 'chef') {
      toast.error('Access denied. Only chefs can view this page.');
      navigate('/');
    }
  };

  // --- Load Dishes & Recipes ---
  const loadContent = async () => {
    try {
      const [rRes, dRes] = await Promise.all([
        supabase
          .from('recipes')
          .select('*')
          .eq('chef_id', user!.id)
          .order('created_at', { ascending: false }),
        supabase
          .from('dishes')
          .select('*')
          .eq('chef_id', user!.id)
          .order('created_at', { ascending: false }),
      ]);
      if (rRes.error) throw rRes.error;
      if (dRes.error) throw dRes.error;
      setRecipes(rRes.data || []);
      setDishes(dRes.data || []);
    } catch (e: any) {
      toast.error('Failed to load content');
    } finally {
      setLoading(false);
    }
  };

  // --- Fetch Impact Updates ---
  const fetchUpdates = async () => {
    const { data, error } = await supabase
      .from<Update>('impact_updates')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(5);
    if (!error && data) setUpdates(data);
  };

  // --- Handlers for D/R CRUD ---
  const handleDeleteRecipe = async (id: string) => {
    if (!confirm('Delete this recipe?')) return;
    const { error } = await supabase.from('recipes').delete().eq('id', id);
    if (error) return toast.error('Could not delete recipe');
    setRecipes(r => r.filter(x => x.id !== id));
    toast.success('Recipe deleted');
  };

  const handleDeleteDish = async (id: string) => {
    if (!confirm('Delete this dish?')) return;
    const { error } = await supabase.from('dishes').delete().eq('id', id);
    if (error) return toast.error('Could not delete dish');
    setDishes(d => d.filter(x => x.id !== id));
    toast.success('Dish deleted');
  };

  const handleRecipeSubmit = async () => {
    setShowRecipeForm(false);
    setEditingRecipe(null);
    await loadContent();
  };

  // --- Add or Update Impact Update ---
  const handleAddOrUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return alert('Please enter a title.');

    if (editingUpdate) {
      // update existing
      const { error } = await supabase
        .from('impact_updates')
        .update({
          title:       newTitle,
          description: newDescription,
          image_url:   newImageUrl,
        })
        .eq('id', editingUpdate.id);
      if (error) return alert('Error updating: ' + error.message);
      setUpdateSuccess('Update saved!');
    } else {
      // insert new
      const { error } = await supabase
        .from('impact_updates')
        .insert([{ title: newTitle, description: newDescription, image_url: newImageUrl }]);
      if (error) return alert('Error creating: ' + error.message);
      setUpdateSuccess('Update posted!');
    }

    // reset form
    setNewTitle('');
    setNewDescription('');
    setNewImageUrl('');
    setEditingUpdate(null);
    fetchUpdates();
  };

  // --- Delete an Impact Update ---
  const handleDeleteUpdate = async (id: number) => {
    if (!confirm('Delete this impact update?')) return;
    const { error } = await supabase.from('impact_updates').delete().eq('id', id);
    if (error) return alert('Error deleting: ' + error.message);
    setUpdates(u => u.filter(x => x.id !== id));
    toast.success('Impact update deleted');
  };

  // --- Begin Editing an Impact Update ---
  const startEditUpdate = (u: Update) => {
    setEditingUpdate(u);
    setNewTitle(u.title);
    setNewDescription(u.description);
    setNewImageUrl(u.image_url);
    setTab('impact');
  };

  return (
    <>
      {/* Header */}
      <div className="bg-orange-500 text-white py-10 px-4 rounded-b-xl shadow">
        <div className="container mx-auto">
          <h1 className="text-3xl font-bold mb-2">Chef Dashboard</h1>
          <p className="text-lg">
            Welcome back, {user?.user_metadata?.full_name || 'Chef'}!
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-10">
        <ChefStats userId={user!.id} />

        {/* Tabs */}
        <div className="flex space-x-6 border-b mb-6">
          <button
            className={`pb-2 border-b-2 font-semibold ${
              tab === 'dishes' ? 'border-orange-500 text-orange-500' : 'border-transparent text-gray-600'
            }`}
            onClick={() => setTab('dishes')}
          >
            🍽️ My Dishes
          </button>
          <button
            className={`pb-2 border-b-2 font-semibold ${
              tab === 'recipes' ? 'border-orange-500 text-orange-500' : 'border-transparent text-gray-600'
            }`}
            onClick={() => setTab('recipes')}
          >
            📖 My Recipes
          </button>
          <button
            className={`pb-2 border-b-2 font-semibold ${
              tab === 'impact' ? 'border-orange-500 text-orange-500' : 'border-transparent text-gray-600'
            }`}
            onClick={() => setTab('impact')}
          >
            📢 Donations
          </button>
        </div>

        {/* Tab Content */}
        {tab === 'dishes' && (
          <div>
            <button
              onClick={() => setShowDishForm(true)}
              className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded mb-4 flex items-center gap-2"
            >
              <Plus size={18} /> Add Dish
            </button>
            {dishes.map(d => (
              <div key={d.id} className="p-4 border rounded shadow flex justify-between">
                <div>
                  <h3 className="text-lg font-semibold">{d.name}</h3>
                  <p className="text-sm text-gray-600">{d.description}</p>
                </div>
                <button onClick={() => handleDeleteDish(d.id)}>
                  <Trash2 className="text-red-500 hover:text-red-700" />
                </button>
              </div>
            ))}
          </div>
        )}

        {tab === 'recipes' && (
          <div>
            <button
              onClick={() => setShowRecipeForm(true)}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded mb-4 flex items-center gap-2"
            >
              <Plus size={18} /> Add Recipe
            </button>
            {recipes.map(r => (
              <div key={r.id} className="p-4 border rounded shadow flex justify-between">
                <div>
                  <h3 className="text-lg font-semibold">{r.title}</h3>
                  <p className="text-sm text-gray-600">{r.description}</p>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => { setEditingRecipe(r); setShowRecipeForm(true); }}>
                    <Edit2 className="text-blue-500 hover:text-blue-700" />
                  </button>
                  <button onClick={() => handleDeleteRecipe(r.id)}>
                    <Trash2 className="text-red-500 hover:text-red-700" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {tab === 'impact' && (
          <div>
            {/* Post or Edit Update */}
            <div className="bg-white p-6 rounded-lg shadow-md mb-8">
              <h3 className="text-xl font-semibold mb-3">
                {editingUpdate ? 'Edit Update' : 'Post a New Donation'}
              </h3>
              <form onSubmit={handleAddOrUpdate}>
                <label className="block mb-3">
                  <span className="block font-medium mb-1">Title:</span>
                  <input
                    type="text"
                    value={newTitle}
                    onChange={e => setNewTitle(e.target.value)}
                    className="w-full p-2 border rounded"
                    placeholder="Update title"
                  />
                </label>
                <label className="block mb-3">
                  <span className="block font-medium mb-1">Description:</span>
                  <textarea
                    value={newDescription}
                    onChange={e => setNewDescription(e.target.value)}
                    className="w-full p-2 border rounded"
                    placeholder="Describe the impact"
                  />
                </label>
                <label className="block mb-3">
                  <span className="block font-medium mb-1">Image URL:</span>
                  <input
                    type="text"
                    value={newImageUrl}
                    onChange={e => setNewImageUrl(e.target.value)}
                    className="w-full p-2 border rounded"
                    placeholder="https://..."
                  />
                </label>
                <button
                  type="submit"
                  className="py-2 px-4 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors"
                >
                  {editingUpdate ? 'Save Changes' : 'Add Update'}
                </button>
                {updateSuccess && <p className="mt-2 text-green-600">{updateSuccess}</p>}
              </form>
            </div>

            {/* Carousel of Updates */}
            <div className="overflow-x-auto flex space-x-4 py-2">
              {updates.map(u => (
                <div key={u.id} className="min-w-[200px] bg-white rounded-lg shadow-md relative">
                  {u.image_url && (
                    <img
                      src={u.image_url}
                      alt={u.title}
                      className="w-full h-32 object-cover rounded-t-lg"
                    />
                  )}
                  <div className="p-3">
                    <div className="flex justify-between items-start">
                      <p className="font-semibold mb-1">{u.title}</p>
                      <div className="flex space-x-2">
                        <button onClick={() => startEditUpdate(u)}>
                          <Edit2 className="text-blue-500 hover:text-blue-700" />
                        </button>
                        <button onClick={() => handleDeleteUpdate(u.id)}>
                          <Trash2 className="text-red-500 hover:text-red-700" />
                        </button>
                      </div>
                    </div>
                    <p className="text-sm mb-2">{u.description}</p>  
                    <p className="text-xs text-gray-500">
                      {new Date(u.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Recipe Modal */}
      {showRecipeForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold mb-6">
              {editingRecipe ? 'Edit Recipe' : 'Create New Recipe'}
            </h2>
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

      {/* Dish Modal */}
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
