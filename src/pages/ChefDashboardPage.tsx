// import React, { useState, useEffect } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { Plus, Edit2, Trash2, Eye } from 'lucide-react';
// import { useAuth } from '../contexts/AuthContext';
// import { supabase } from '../lib/supabase';
// import { Recipe, Dish } from '../types';
// import RecipeForm from '../components/recipes/RecipeForm';
// import toast from 'react-hot-toast';
// import DishForm from '../components/dishes/DishForm'; 
// import ChefStats from '../pages/GhefsStat';

// // [imports remain unchanged]
// const ChefDashboardPage: React.FC = () => {
//   const { user } = useAuth();
//   const navigate = useNavigate();

//   const [recipes, setRecipes] = useState<Recipe[]>([]);
//   const [dishes, setDishes] = useState<Dish[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [showRecipeForm, setShowRecipeForm] = useState(false);
//   const [editingRecipe, setEditingRecipe] = useState<Recipe | null>(null);
//   const [tab, setTab] = useState<'dishes' | 'recipes'>('dishes');
//   const [showDishForm, setShowDishForm] = useState(false);

//   useEffect(() => {
//     if (!user?.id) {
//       navigate('/login');
//       return;
//     }

//     checkChefAccess();
//     loadContent();
//   }, [user?.id]);

//   const checkChefAccess = async () => {
//     try {
//       const { data: profile, error } = await supabase
//         .from('profiles')
//         .select('role')
//         .eq('id', user?.id)
//         .single();

//       if (error) throw error;
//       if (profile?.role !== 'chef') {
//         toast.error('Access denied. Only chefs can view this page.');
//         navigate('/');
//       }
//     } catch (err: any) {
//       console.error('Error checking chef access:', err.message);
//       navigate('/');
//     }
//   };

//   const loadContent = async () => {
//     try {
//       const [recipesResponse, dishesResponse] = await Promise.all([
//         supabase.from('recipes').select('*').eq('chef_id', user?.id).order('created_at', { ascending: false }),
//         supabase.from('dishes').select('*').eq('chef_id', user?.id).order('created_at', { ascending: false }),
//       ]);

//       if (recipesResponse.error) throw recipesResponse.error;
//       if (dishesResponse.error) throw dishesResponse.error;

//       setRecipes(recipesResponse.data || []);
//       setDishes(dishesResponse.data || []);
//     } catch (err: any) {
//       console.error('Error loading content:', err.message);
//       toast.error('Failed to load content');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleDeleteRecipe = async (id: string) => {
//     if (!confirm('Are you sure you want to delete this recipe?')) return;
//     try {
//       const { error } = await supabase.from('recipes').delete().eq('id', id);
//       if (error) throw error;
//       setRecipes((prev) => prev.filter((r) => r.id !== id));
//       toast.success('Recipe deleted');
//     } catch (err: any) {
//       console.error('Delete recipe error:', err.message);
//       toast.error('Could not delete recipe');
//     }
//   };

//   const handleDeleteDish = async (id: string) => {
//     if (!confirm('Are you sure you want to delete this dish?')) return;
//     try {
//       const { error } = await supabase.from('dishes').delete().eq('id', id);
//       if (error) throw error;
//       setDishes((prev) => prev.filter((d) => d.id !== id));
//       toast.success('Dish deleted');
//     } catch (err: any) {
//       console.error('Delete dish error:', err.message);
//       toast.error('Could not delete dish');
//     }
//   };

//   const handleRecipeSubmit = async () => {
//     setShowRecipeForm(false);
//     setEditingRecipe(null);
//     loadContent();
//   };

//   const openDishForm = () => {
//     setShowDishForm(true);
//   };

//   if (loading) {
//     return (
//       <div className="container mx-auto px-4 py-16">
//         <div className="text-center text-lg font-medium">Loading...</div>
//       </div>
//     );
//   }

//   return (
//     <>
//       <div className="bg-orange-500 text-white py-10 px-4 rounded-b-xl shadow">
//         <div className="container mx-auto">
//           <h1 className="text-3xl font-bold mb-2">Chef Dashboard</h1>
//           <p className="text-lg">
//             Welcome back, {user?.user_metadata?.full_name || 'Chef'}! Manage your dishes and recipes here.
//           </p>
//         </div>
//       </div>

//       <div className="container mx-auto px-4 py-10">
//         {user?.id && (
//           <div className="mb-10">
//             <ChefStats userId={user.id} />
//           </div>
//         )}

//         <div className="flex space-x-6 border-b mb-6">
//           <button
//             className={`pb-2 border-b-2 text-orange-500 font-semibold flex items-center gap-2 ${
//               tab === 'dishes' ? 'border-orange-500' : 'border-transparent'
//             }`}
//             onClick={() => setTab('dishes')}
//           >
//             🍽️ My Dishes
//           </button>
//           <button
//             className={`pb-2 border-b-2 text-gray-600 font-semibold flex items-center gap-2 ${
//               tab === 'recipes' ? 'border-orange-500 text-orange-500' : 'border-transparent'
//             }`}
//             onClick={() => setTab('recipes')}
//           >
//             📖 My Recipes
//           </button>
//         </div>

//         {/* Dish Tab */}
//         {tab === 'dishes' ? (
//           <>
//             <div className="flex justify-between items-center mb-4">
//               <h2 className="text-2xl font-bold">My Dishes</h2>
//               <button
//                 onClick={openDishForm}
//                 className="bg-orange-500 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-orange-600"
//               >
//                 <Plus className="w-5 h-5" />
//                 Add New Dish
//               </button>
//             </div>

//             {showDishForm && (
//               <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
//                 <div className="bg-white rounded-lg p-8 max-w-3xl w-full max-h-[90vh] overflow-y-auto">
//                   <h2 className="text-2xl font-bold mb-6">Add New Dish</h2>
//                   <DishForm
//                     onSubmit={() => {
//                       setShowDishForm(false);
//                       loadContent();
//                     }}
//                     onCancel={() => setShowDishForm(false)}
//                   />
//                 </div>
//               </div>
//             )}

//             {dishes.length === 0 ? (
//               <div className="bg-gray-50 p-10 rounded-lg text-center">
//                 <p className="text-gray-800 font-medium mb-2">No dishes yet</p>
//                 <p className="text-gray-500 mb-4">Start by adding your first dish to showcase on Cookingo.</p>
//                 <button
//                   onClick={openDishForm}
//                   className="bg-orange-500 text-white px-5 py-2 rounded hover:bg-orange-600"
//                 >
//                   + Add Your First Dish
//                 </button>
//               </div>
//             ) : (
//               <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
//                 {dishes.map((dish) => (
//                   <div key={dish.id} className="bg-white rounded-lg shadow overflow-hidden">
//                     <img src={dish.image_url} alt={dish.title} className="w-full h-48 object-cover" />
//                     <div className="p-4">
//                       <h3 className="text-xl font-bold mb-2">{dish.title}</h3>
//                       <p className="text-gray-600 mb-3 line-clamp-2">{dish.description}</p>
//                       <div className="flex justify-between items-center">
//                         <span className="text-lg font-semibold text-orange-600">${dish.price.toFixed(2)}</span>
//                         <button onClick={() => handleDeleteDish(dish.id)} className="text-gray-600 hover:text-red-500">
//                           <Trash2 className="w-5 h-5" />
//                         </button>
//                       </div>
//                     </div>
//                   </div>
//                 ))}
//               </div>
//             )}
//           </>
//         ) : (
//           <>
//             <div className="flex justify-between items-center mb-4">
//               <h2 className="text-2xl font-bold">My Recipes</h2>
//               <button
//                 onClick={() => {
//                   setShowRecipeForm(true);
//                   setEditingRecipe(null);
//                 }}
//                 className="bg-orange-500 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-orange-600"
//               >
//                 <Plus className="w-5 h-5" />
//                 Add New Recipe
//               </button>
//             </div>

//             {recipes.length === 0 ? (
//               <div className="bg-gray-50 p-10 rounded-lg text-center">
//                 <p className="text-gray-800 font-medium mb-2">No recipes yet</p>
//                 <p className="text-gray-500 mb-4">Share your cooking creations with the community!</p>
//               </div>
//             ) : (
//               <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
//                 {recipes.map((recipe) => (
//                   <div key={recipe.id} className="bg-white rounded-lg shadow overflow-hidden">
//                     <img src={recipe.image_url} alt={recipe.title} className="w-full h-48 object-cover" />
//                     <div className="p-4">
//                       <h3 className="text-xl font-bold mb-2">{recipe.title}</h3>
//                       <p className="text-gray-600 mb-3 line-clamp-2">{recipe.description}</p>
//                       <div className="flex justify-between items-center">
//                         <span className={`px-2 py-1 rounded-full text-sm ${
//                           recipe.status === 'published'
//                             ? 'bg-green-100 text-green-800'
//                             : recipe.status === 'archived'
//                             ? 'bg-gray-100 text-gray-800'
//                             : 'bg-yellow-100 text-yellow-800'
//                         }`}>
//                           {recipe.status.charAt(0).toUpperCase() + recipe.status.slice(1)}
//                         </span>
//                         <div className="flex gap-2">
//                           <button onClick={() => navigate(`/recipes/${recipe.id}`)} className="text-gray-600 hover:text-orange-500">
//                             <Eye className="w-5 h-5" />
//                           </button>
//                           <button onClick={() => { setEditingRecipe(recipe); setShowRecipeForm(true); }} className="text-gray-600 hover:text-blue-500">
//                             <Edit2 className="w-5 h-5" />
//                           </button>
//                           <button onClick={() => handleDeleteRecipe(recipe.id)} className="text-gray-600 hover:text-red-500">
//                             <Trash2 className="w-5 h-5" />
//                           </button>
//                         </div>
//                       </div>
//                     </div>
//                   </div>
//                 ))}
//               </div>
//             )}
//           </>
//         )}
//       </div>

//       {showRecipeForm && (
//         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
//           <div className="bg-white rounded-lg p-8 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
//             <h2 className="text-2xl font-bold mb-6">
//               {editingRecipe ? 'Edit Recipe' : 'Create New Recipe'}
//             </h2>
//             <RecipeForm
//               initialData={editingRecipe || undefined}
//               onSubmit={handleRecipeSubmit}
//               onCancel={() => {
//                 setShowRecipeForm(false);
//                 setEditingRecipe(null);
//               }}
//             />
//           </div>
//         </div>
//       )}
//     </>
//   );
// };

// export default ChefDashboardPage;

// [Your imports remain unchanged]
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Edit2, Trash2, Eye } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { Recipe, Dish } from '../types';
import RecipeForm from '../components/recipes/RecipeForm';
import toast from 'react-hot-toast';
import DishForm from '../components/dishes/DishForm'; 
import ChefStats from '../pages/GhefsStat';

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
    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user?.id)
        .single();

      if (error) throw error;
      if (profile?.role !== 'chef') {
        toast.error('Access denied. Only chefs can view this page.');
        navigate('/');
      }
    } catch (err: any) {
      console.error('Error checking chef access:', err.message);
      navigate('/');
    }
  };

  const loadContent = async () => {
    try {
      const [recipesResponse, dishesResponse] = await Promise.all([
        supabase.from('recipes').select('*').eq('chef_id', user?.id).order('created_at', { ascending: false }),
        supabase.from('dishes').select('*').eq('chef_id', user?.id).order('created_at', { ascending: false }),
      ]);

      if (recipesResponse.error) throw recipesResponse.error;
      if (dishesResponse.error) throw dishesResponse.error;

      setRecipes(recipesResponse.data || []);
      setDishes(dishesResponse.data || []);
    } catch (err: any) {
      console.error('Error loading content:', err.message);
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
      setRecipes((prev) => prev.filter((r) => r.id !== id));
      toast.success('Recipe deleted');
    } catch (err: any) {
      console.error('Delete recipe error:', err.message);
      toast.error('Could not delete recipe');
    }
  };

  const handleDeleteDish = async (id: string) => {
    if (!confirm('Are you sure you want to delete this dish?')) return;
    try {
      const { error } = await supabase.from('dishes').delete().eq('id', id);
      if (error) throw error;
      setDishes((prev) => prev.filter((d) => d.id !== id));
      toast.success('Dish deleted');
    } catch (err: any) {
      console.error('Delete dish error:', err.message);
      toast.error('Could not delete dish');
    }
  };

  const handleRecipeSubmit = async () => {
    setShowRecipeForm(false);
    setEditingRecipe(null);
    loadContent();
  };

  const openDishForm = () => {
    setShowDishForm(true);
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="text-center text-lg font-medium">Loading...</div>
      </div>
    );
  }

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
        {user?.id && (
          <div className="mb-10">
            <ChefStats userId={user.id} />
          </div>
        )}

        <div className="flex space-x-6 border-b mb-6">
          <button
            className={`pb-2 border-b-2 text-orange-500 font-semibold flex items-center gap-2 ${
              tab === 'dishes' ? 'border-orange-500' : 'border-transparent'
            }`}
            onClick={() => setTab('dishes')}
          >
            🍽️ My Dishes
          </button>
          <button
            className={`pb-2 border-b-2 text-gray-600 font-semibold flex items-center gap-2 ${
              tab === 'recipes' ? 'border-orange-500 text-orange-500' : 'border-transparent'
            }`}
            onClick={() => setTab('recipes')}
          >
            📖 My Recipes
          </button>
        </div>

        {/* Dish Tab */}
        {tab === 'dishes' ? (
          <>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">My Dishes</h2>
              <button
                onClick={openDishForm}
                className="bg-orange-500 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-orange-600"
              >
                <Plus className="w-5 h-5" />
                Add New Dish
              </button>
            </div>

            {showDishForm && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white rounded-lg p-8 max-w-3xl w-full max-h-[90vh] overflow-y-auto">
                  <h2 className="text-2xl font-bold mb-6">Add New Dish</h2>
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

            {dishes.length === 0 ? (
              <div className="bg-gray-50 p-10 rounded-lg text-center">
                <p className="text-gray-800 font-medium mb-2">No dishes yet</p>
                <p className="text-gray-500 mb-4">Start by adding your first dish to showcase on Cookingo.</p>
                <button
                  onClick={openDishForm}
                  className="bg-orange-500 text-white px-5 py-2 rounded hover:bg-orange-600"
                >
                  + Add Your First Dish
                </button>
              </div>
            ) : (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {dishes.map((dish) => (
                  <div key={dish.id} className="bg-white rounded-lg shadow overflow-hidden">
                    <img src={dish.image_url} alt={dish.title} className="w-full h-48 object-cover" />
                    <div className="p-4">
                      <h3 className="text-xl font-bold mb-2">{dish.title}</h3>
                      <p className="text-gray-600 mb-3 line-clamp-2">{dish.description}</p>

                      <p className="text-gray-600 mb-2">
                        <strong>Servings:</strong> {dish.servings || 'N/A'}
                      </p>
                      <p className="text-gray-600 mb-2">
                        <strong>Time:</strong> {dish.time ? `${dish.time} min` : 'N/A'}
                      </p>

                      <div className="flex justify-between items-center">
                        <span className="text-lg font-semibold text-orange-600">${dish.price.toFixed(2)}</span>
                        <button onClick={() => handleDeleteDish(dish.id)} className="text-gray-600 hover:text-red-500">
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        ) : (
          <>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">My Recipes</h2>
              <button
                onClick={() => {
                  setShowRecipeForm(true);
                  setEditingRecipe(null);
                }}
                className="bg-orange-500 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-orange-600"
              >
                <Plus className="w-5 h-5" />
                Add New Recipe
              </button>
            </div>

            {recipes.length === 0 ? (
              <div className="bg-gray-50 p-10 rounded-lg text-center">
                <p className="text-gray-800 font-medium mb-2">No recipes yet</p>
                <p className="text-gray-500 mb-4">Share your cooking creations with the community!</p>
              </div>
            ) : (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {recipes.map((recipe) => (
                  <div key={recipe.id} className="bg-white rounded-lg shadow overflow-hidden">
                    <img src={recipe.image_url} alt={recipe.title} className="w-full h-48 object-cover" />
                    <div className="p-4">
                      <h3 className="text-xl font-bold mb-2">{recipe.title}</h3>
                      <p className="text-gray-600 mb-3 line-clamp-2">{recipe.description}</p>
                      <div className="flex justify-between items-center">
                        <span className={`px-2 py-1 rounded-full text-sm ${
                          recipe.status === 'published'
                            ? 'bg-green-100 text-green-800'
                            : recipe.status === 'archived'
                            ? 'bg-gray-100 text-gray-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {recipe.status.charAt(0).toUpperCase() + recipe.status.slice(1)}
                        </span>
                        <div className="flex gap-2">
                          <button onClick={() => navigate(`/recipes/${recipe.id}`)} className="text-gray-600 hover:text-orange-500">
                            <Eye className="w-5 h-5" />
                          </button>
                          <button onClick={() => { setEditingRecipe(recipe); setShowRecipeForm(true); }} className="text-gray-600 hover:text-blue-500">
                            <Edit2 className="w-5 h-5" />
                          </button>
                          <button onClick={() => handleDeleteRecipe(recipe.id)} className="text-gray-600 hover:text-red-500">
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>

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
    </>
  );
};

export default ChefDashboardPage;


