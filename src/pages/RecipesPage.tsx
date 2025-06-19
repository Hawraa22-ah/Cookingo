import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useSearchParams } from 'react-router-dom';
import RecipeGrid from '../components/recipes/RecipeGrid';

interface Recipe {
  id: string;
  title: string;
  description: string;
  image_url: string;
  cook_time: number;
  prep_time: number;
  servings: number;
  difficulty: string;
  ingredients: any[];
  instructions: any[];
  tags: string[];
  cuisine?: string;
  status: string;
  calories_level?: string;
  meal_time?: string;
  type?: string;
  rich_in?: string;
  chef_id: string;
  chef?: {
    id: string;
    username: string;
  };
}

const RecipesPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const queryParam = searchParams.get('q');
  const difficultyParam = searchParams.get('difficulty');
  const cuisineParam = searchParams.get('cuisine');
  const timeOfDayParam = searchParams.get('timeOfDay');
  const typeParam = searchParams.get('type');
  const vitaminParam = searchParams.get('vitamin');
  const caloriesParam = searchParams.get('calories');

  const [search, setSearch] = useState(queryParam || '');
  const [difficulty, setDifficulty] = useState(difficultyParam);
  const [cuisine, setCuisine] = useState(cuisineParam);
  const [timeOfDay, setTimeOfDay] = useState(timeOfDayParam);
  const [type, setType] = useState(typeParam);
  const [vitamin, setVitamin] = useState(vitaminParam);
  const [calories, setCalories] = useState(caloriesParam);

  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [suggestions, setSuggestions] = useState<string[]>([]);

  const generateSuggestions = (query: string): string[] => {
    if (!query) return [];
    const q = query.toLowerCase();
    const set = new Set<string>();

    recipes.forEach(recipe => {
      if (recipe.title.toLowerCase().includes(q)) set.add(recipe.title);
      recipe.tags?.forEach(tag => {
        if (tag.toLowerCase().includes(q)) set.add(tag);
      });
      recipe.ingredients?.forEach(ing => {
        const ingName = typeof ing === 'string' ? ing.split(',')[0].trim() : ing.name;
        if (ingName?.toLowerCase().includes(q)) set.add(ingName);
      });
    });

    return Array.from(set).slice(0, 5);
  };

  const applyFilters = (base: Recipe[]): Recipe[] => {
    return base.filter(r =>
      (!difficulty || r.difficulty === difficulty) &&
      (!cuisine || r.cuisine === cuisine) &&
      (!timeOfDay || r.meal_time?.toLowerCase() === timeOfDay.toLowerCase()) &&
      (!type || r.type?.toLowerCase() === type.toLowerCase()) &&
      (!vitamin || r.rich_in?.toLowerCase() === vitamin.toLowerCase()) &&
      (!calories || r.calories_level?.toLowerCase() === calories.toLowerCase())
    );
  };

  useEffect(() => {
    const fetchRecipes = async () => {
      try {
        const { data, error } = await supabase
          .from('recipes')
          .select(`
            *,
            chef:profiles!fk_chef (
              id,
              username
            )
          `)
          .eq('status', 'published')
          .order('created_at', { ascending: false });

        if (error) throw error;
        if (!data) return;

        let filtered = data as Recipe[];

        if (queryParam) {
          filtered = filtered.filter(r =>
            r.title.toLowerCase().includes(queryParam.toLowerCase()) ||
            r.tags?.some(tag => tag.toLowerCase().includes(queryParam.toLowerCase()))
          );
          setSuggestions(generateSuggestions(queryParam));
        }

        filtered = applyFilters(filtered);
        setRecipes(filtered);
      } catch (err) {
        console.error('Error loading recipes:', err);
      }
    };

    fetchRecipes();

    const handleUpdate = () => fetchRecipes();
    window.addEventListener('recipes-updated', handleUpdate);
    return () => window.removeEventListener('recipes-updated', handleUpdate);

  }, [queryParam, difficulty, cuisine, timeOfDay, type, vitamin, calories]);

  const updateSearchParams = () => {
    setSearchParams(prev => {
      difficulty ? prev.set('difficulty', difficulty) : prev.delete('difficulty');
      cuisine ? prev.set('cuisine', cuisine) : prev.delete('cuisine');
      timeOfDay ? prev.set('timeOfDay', timeOfDay) : prev.delete('timeOfDay');
      type ? prev.set('type', type) : prev.delete('type');
      vitamin ? prev.set('vitamin', vitamin) : prev.delete('vitamin');
      calories ? prev.set('calories', calories) : prev.delete('calories');
      return prev;
    });
  };

  const handleSearch = (query: string) => {
    setSearch(query);
    setSearchParams(prev => {
      query ? prev.set('q', query) : prev.delete('q');
      return prev;
    });
  };

  return (
    <div className="relative">
      {/* Background image layer */}
      <div
        className="absolute inset-0 bg-cover bg-center opacity-10 z-[-1]"
        style={{
          backgroundImage:
            "url('https://images.pexels.com/photos/1640773/pexels-photo-1640773.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2')",
        }}
      />

      {/* Content */}
      <div className="container mx-auto px-4 py-12 relative z-10">
        <h1 className="text-4xl font-bold text-center text-gray-800 mb-6">All Recipes</h1>

        <div className="flex flex-wrap gap-4 items-center mb-8">
          {/* Search Box */}
          <div className="relative">
            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">🔍</span>
            <input
              type="text"
              value={search}
              placeholder="Search recipes..."
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-10 pr-4 py-3 border rounded text-lg"
            />
          </div>

          {/* Calories Filter */}
          <select
            value={calories || 'All'}
            onChange={e => {
              const value = e.target.value === 'All' ? null : e.target.value;
              setCalories(value);
              updateSearchParams();
            }}
            className="border px-4 py-3 rounded text-lg"
          >
            <option value="All">Calories</option>
            <option value="Low">Low</option>
            <option value="Medium">Medium</option>
            <option value="High">High</option>
          </select>

          {/* Meal Time Filter */}
          <select
            value={timeOfDay || 'All'}
            onChange={e => {
              const value = e.target.value === 'All' ? null : e.target.value;
              setTimeOfDay(value);
              updateSearchParams();
            }}
            className="border px-4 py-3 rounded text-lg"
          >
            <option value="All">Time</option>
            <option value="Breakfast">Breakfast</option>
            <option value="Lunch">Lunch</option>
            <option value="Dinner">Dinner</option>
          </select>

          {/* Type Filter */}
          <select
            value={type || 'All'}
            onChange={e => {
              const value = e.target.value === 'All' ? null : e.target.value;
              setType(value);
              updateSearchParams();
            }}
            className="border px-4 py-3 rounded text-lg"
          >
            <option value="All">Type</option>
            <option value="Vegetarian">Vegetarian</option>
            <option value="Chicken">Chicken</option>
            <option value="Fish">Fish</option>
          </select>

          {/* Rich In Vitamin Filter */}
          <select
            value={vitamin || 'All'}
            onChange={e => {
              const value = e.target.value === 'All' ? null : e.target.value;
              setVitamin(value);
              updateSearchParams();
            }}
            className="border px-4 py-3 rounded text-lg"
          >
            <option value="All">Rich In Vitamin</option>
            <option value="Vitamin A">Vitamin A</option>
            <option value="Vitamin C">Vitamin C</option>
            <option value="Vitamin B12">Vitamin B12</option>
          </select>
        </div>

        {/* Summary Text */}
        <div className="mb-4 text-gray-700 text-lg">
          {recipes.length} {recipes.length === 1 ? 'recipe' : 'recipes'} found
          {queryParam && ` for "${queryParam}"`}
          {difficulty && ` with ${difficulty} difficulty`}
          {cuisine && ` in ${cuisine} cuisine`}
          {timeOfDay && ` for ${timeOfDay}`}
          {type && ` | ${type}`}
          {vitamin && ` | ${vitamin}`}
          {calories && ` | ${calories} calories`}
        </div>

        {/* Recipe Grid */}
        <RecipeGrid
          recipes={recipes}
          emptyMessage="No recipes found matching your criteria. Try adjusting your filters."
        />
      </div>
    </div>
  );
};

export default RecipesPage;

