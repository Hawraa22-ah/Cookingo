// import React, { useState, useEffect } from 'react';
// import { supabase } from '../lib/supabase';
// import { useSearchParams } from 'react-router-dom';
// import RecipeGrid from '../components/recipes/RecipeGrid';

// interface Recipe {
//   id: string;
//   title: string;
//   description: string;
//   image_url: string;
//   cook_time: number;
//   prep_time: number;
//   servings: number;
//   difficulty: string;
//   ingredients: any[];
//   instructions: any[];
//   tags: string[];
//   cuisine?: string;
//   status: string;
// }

// export interface Chef {
//   id: string;
//   full_name: string;
//   avatar_url?: string;
//   bio?: string;
// }

// const RecipesPage: React.FC = () => {
//   const [searchParams, setSearchParams] = useSearchParams();
//   const queryParam = searchParams.get('q');
//   const difficultyParam = searchParams.get('difficulty');
//   const cuisineParam = searchParams.get('cuisine');
//   const timeOfDayParam = searchParams.get('timeOfDay');
//   const typeParam = searchParams.get('type');
//   const vitaminParam = searchParams.get('vitamin');

//   const [search, setSearch] = useState<string>(queryParam || '');
//   const [difficulty, setDifficulty] = useState<string | null>(difficultyParam);
//   const [cuisine, setCuisine] = useState<string | null>(cuisineParam);
//   const [timeOfDay, setTimeOfDay] = useState<string | null>(timeOfDayParam);
//   const [type, setType] = useState<string | null>(typeParam);
//   const [vitamin, setVitamin] = useState<string | null>(vitaminParam);

//   const [recipes, setRecipes] = useState<Recipe[]>([]);
//   const [suggestions, setSuggestions] = useState<string[]>([]);

//   const generateSuggestions = (query: string): string[] => {
//     if (!query) return [];
//     const lowercaseQuery = query.toLowerCase();
//     const suggestionSet = new Set<string>();

//     recipes.forEach(recipe => {
//       if (recipe.title.toLowerCase().includes(lowercaseQuery)) {
//         suggestionSet.add(recipe.title);
//       }

//       (recipe.tags || []).forEach(tag => {
//         if (tag.toLowerCase().includes(lowercaseQuery)) {
//           suggestionSet.add(tag);
//         }
//       });

//       (recipe.ingredients || []).forEach(ingredient => {
//         const mainIngredient = typeof ingredient === 'string'
//           ? ingredient.split(',')[0].trim()
//           : ingredient.name;
//         if (mainIngredient.toLowerCase().includes(lowercaseQuery)) {
//           suggestionSet.add(mainIngredient);
//         }
//       });
//     });

//     return Array.from(suggestionSet).slice(0, 5);
//   };

//   const applyFilters = (baseRecipes: Recipe[]) => {
//     let filteredRecipes = [...baseRecipes];

//     if (difficulty) {
//       filteredRecipes = filteredRecipes.filter(recipe => recipe.difficulty === difficulty);
//     }

//     if (cuisine) {
//       filteredRecipes = filteredRecipes.filter(recipe => recipe.cuisine === cuisine);
//     }

//     if (timeOfDay) {
//       filteredRecipes = filteredRecipes.filter(recipe =>
//         recipe.tags?.includes(timeOfDay)
//       );
//     }

//     if (type) {
//       filteredRecipes = filteredRecipes.filter(recipe =>
//         recipe.tags?.includes(type)
//       );
//     }

//     if (vitamin) {
//       filteredRecipes = filteredRecipes.filter(recipe =>
//         recipe.tags?.includes(vitamin)
//       );
//     }

//     return filteredRecipes;
//   };

//   useEffect(() => {
//     const fetchRecipes = async () => {
//       try {
//         let { data, error } = await supabase
//           .from('recipes')
//           .select('*')
//           .eq('status', 'published')
//           .order('created_at', { ascending: false });

//         if (error) throw error;
//         if (!data) return;

//         let filtered = data;

//         if (queryParam) {
//           filtered = filtered.filter(r =>
//             r.title.toLowerCase().includes(queryParam.toLowerCase()) ||
//             (r.tags || []).some(tag => tag.toLowerCase().includes(queryParam.toLowerCase()))
//           );
//           setSuggestions(generateSuggestions(queryParam));
//         }

//         filtered = applyFilters(filtered);
//         setRecipes(filtered);
//       } catch (err) {
//         console.error('Failed to load recipes:', err);
//       }
//     };

//     fetchRecipes();
//   }, [queryParam, difficulty, cuisine, timeOfDay, type, vitamin]);

//   const updateSearchParams = () => {
//     setSearchParams(prev => {
//       difficulty ? prev.set('difficulty', difficulty) : prev.delete('difficulty');
//       cuisine ? prev.set('cuisine', cuisine) : prev.delete('cuisine');
//       timeOfDay ? prev.set('timeOfDay', timeOfDay) : prev.delete('timeOfDay');
//       type ? prev.set('type', type) : prev.delete('type');
//       vitamin ? prev.set('vitamin', vitamin) : prev.delete('vitamin');
//       return prev;
//     });
//   };

//   const handleSearch = (query: string) => {
//     setSearch(query);
//     setSearchParams(prev => {
//       query ? prev.set('q', query) : prev.delete('q');
//       return prev;
//     });
//   };

//   return (
//     <div className="container mx-auto px-4 py-12">
//       <h1 className="text-3xl md:text-4xl font-bold text-gray-800 font-serif mb-6 text-center">
//         All Recipes
//       </h1>

//       {/* Filters and Search Bar */}
//       <div className="flex flex-wrap items-center gap-4 mb-8">
//         {/* Styled Search Input with Icon */}
//         <div className="relative">
//           <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-lg">🔍</span>
//           <input
//             type="text"
//             placeholder="Search recipes..."
//             value={search}
//             onChange={(e) => handleSearch(e.target.value)}
//             className="pl-10 pr-4 py-3 border border-gray-300 rounded text-lg min-w-[200px]"
//           />
//         </div>

//         {/* Filters */}

//         <select
//           value={timeOfDay || 'All'}
//           onChange={(e) => {
//             const value = e.target.value === 'All' ? null : e.target.value;
//             setTimeOfDay(value);
//             updateSearchParams();
//           }}
//           className="border rounded px-4 py-3 text-lg min-w-[350px]"
//         >
//           <option value="All">Time</option>
//           <option value="breakfast">Breakfast</option>
//           <option value="lunch">Lunch</option>
//           <option value="dinner">Dinner</option>
//         </select>
        

//         <select
//           value={type || 'All'}
//           onChange={(e) => {
//             const value = e.target.value === 'All' ? null : e.target.value;
//             setType(value);
//             updateSearchParams();
//           }}
//           className="border rounded px-4 py-3 text-lg min-w-[350px]"
//         >
//           <option value="All">Type</option>
//           <option value="veg">Vegetarian</option>
//           <option value="chicken">Chicken</option>
//           <option value="fish">Fish</option>
//         </select>

//         <select
//           value={vitamin || 'All'}
//           onChange={(e) => {
//             const value = e.target.value === 'All' ? null : e.target.value;
//             setVitamin(value);
//             updateSearchParams();
//           }}
//           className="border rounded px-4 py-3 text-lg min-w-[350px]"
//         >
//           <option value="All">Rich In Vitamin</option>
//           <option value="vitamin_a">Vitamin A</option>
//           <option value="vitamin_c">Vitamin C</option>
//           <option value="vitamin_b12">Vitamin B12</option>
//         </select>
//       </div>

//       {/* Filter Summary */}
//       <div className="mb-4">
//         <p className="text-gray-600 text-lg">
//           {recipes.length} {recipes.length === 1 ? 'recipe' : 'recipes'} found
//           {queryParam && ` for "${queryParam}"`}
//           {difficulty && ` with ${difficulty} difficulty`}
//           {cuisine && ` of ${cuisine} cuisine`}
//           {timeOfDay && ` for ${timeOfDay}`}
//           {type && ` | ${type}`}
//           {vitamin && ` | ${vitamin.replace('vitamin_', 'Vitamin ')}`}
//         </p>
//       </div>

//       {/* Recipe Grid */}
//       <RecipeGrid
//         recipes={recipes}
//         emptyMessage="No recipes found matching your criteria. Try adjusting your filters."
//       />
//     </div>
//   );
// };

// export default RecipesPage;

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
  calories?: string; // <-- new optional field
}

export interface Chef {
  id: string;
  full_name: string;
  avatar_url?: string;
  bio?: string;
}

const RecipesPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const queryParam = searchParams.get('q');
  const difficultyParam = searchParams.get('difficulty');
  const cuisineParam = searchParams.get('cuisine');
  const timeOfDayParam = searchParams.get('timeOfDay');
  const typeParam = searchParams.get('type');
  const vitaminParam = searchParams.get('vitamin');
  const caloriesParam = searchParams.get('calories'); // <-- NEW

  const [search, setSearch] = useState<string>(queryParam || '');
  const [difficulty, setDifficulty] = useState<string | null>(difficultyParam);
  const [cuisine, setCuisine] = useState<string | null>(cuisineParam);
  const [timeOfDay, setTimeOfDay] = useState<string | null>(timeOfDayParam);
  const [type, setType] = useState<string | null>(typeParam);
  const [vitamin, setVitamin] = useState<string | null>(vitaminParam);
  const [calories, setCalories] = useState<string | null>(caloriesParam); // <-- NEW

  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [suggestions, setSuggestions] = useState<string[]>([]);

  const generateSuggestions = (query: string): string[] => {
    if (!query) return [];
    const lowercaseQuery = query.toLowerCase();
    const suggestionSet = new Set<string>();

    recipes.forEach(recipe => {
      if (recipe.title.toLowerCase().includes(lowercaseQuery)) {
        suggestionSet.add(recipe.title);
      }

      (recipe.tags || []).forEach(tag => {
        if (tag.toLowerCase().includes(lowercaseQuery)) {
          suggestionSet.add(tag);
        }
      });

      (recipe.ingredients || []).forEach(ingredient => {
        const mainIngredient = typeof ingredient === 'string'
          ? ingredient.split(',')[0].trim()
          : ingredient.name;
        if (mainIngredient.toLowerCase().includes(lowercaseQuery)) {
          suggestionSet.add(mainIngredient);
        }
      });
    });

    return Array.from(suggestionSet).slice(0, 5);
  };

  const applyFilters = (baseRecipes: Recipe[]) => {
    let filteredRecipes = [...baseRecipes];

    if (difficulty) filteredRecipes = filteredRecipes.filter(r => r.difficulty === difficulty);
    if (cuisine) filteredRecipes = filteredRecipes.filter(r => r.cuisine === cuisine);
    if (timeOfDay) filteredRecipes = filteredRecipes.filter(r => r.tags?.includes(timeOfDay));
    if (type) filteredRecipes = filteredRecipes.filter(r => r.tags?.includes(type));
    if (vitamin) filteredRecipes = filteredRecipes.filter(r => r.tags?.includes(vitamin));
    if (calories) filteredRecipes = filteredRecipes.filter(r => r.calories === calories); // <-- NEW

    return filteredRecipes;
  };

  useEffect(() => {
    const fetchRecipes = async () => {
      try {
        let { data, error } = await supabase
          .from('recipes')
          .select('*')
          .eq('status', 'published')
          .order('created_at', { ascending: false });

        if (error) throw error;
        if (!data) return;

        let filtered = data;

        if (queryParam) {
          filtered = filtered.filter(r =>
            r.title.toLowerCase().includes(queryParam.toLowerCase()) ||
            (r.tags || []).some(tag => tag.toLowerCase().includes(queryParam.toLowerCase()))
          );
          setSuggestions(generateSuggestions(queryParam));
        }

        filtered = applyFilters(filtered);
        setRecipes(filtered);
      } catch (err) {
        console.error('Failed to load recipes:', err);
      }
    };

    fetchRecipes();
  }, [queryParam, difficulty, cuisine, timeOfDay, type, vitamin, calories]);

  const updateSearchParams = () => {
    setSearchParams(prev => {
      difficulty ? prev.set('difficulty', difficulty) : prev.delete('difficulty');
      cuisine ? prev.set('cuisine', cuisine) : prev.delete('cuisine');
      timeOfDay ? prev.set('timeOfDay', timeOfDay) : prev.delete('timeOfDay');
      type ? prev.set('type', type) : prev.delete('type');
      vitamin ? prev.set('vitamin', vitamin) : prev.delete('vitamin');
      calories ? prev.set('calories', calories) : prev.delete('calories'); // <-- NEW
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
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-3xl md:text-4xl font-bold text-gray-800 font-serif mb-6 text-center">
        All Recipes
      </h1>

      {/* Filters and Search Bar */}
      <div className="flex flex-wrap items-center gap-4 mb-8">
        {/* Search */}
        <div className="relative">
          <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-lg">🔍</span>
          <input
            type="text"
            placeholder="Search recipes..."
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
            className="pl-10 pr-4 py-3 border border-gray-300 rounded text-lg min-w-[200px]"
          />
        </div>

        {/* Calories Filter */}
        <select
          value={calories || 'All'}
          onChange={(e) => {
            const value = e.target.value === 'All' ? null : e.target.value;
            setCalories(value);
            updateSearchParams();
          }}
          className="border rounded px-4 py-3 text-lg min-w-[250px]"
        >
          <option value="All">Calories</option>
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </select>

        {/* Existing filters below */}
        <select
          value={timeOfDay || 'All'}
          onChange={(e) => {
            const value = e.target.value === 'All' ? null : e.target.value;
            setTimeOfDay(value);
            updateSearchParams();
          }}
          className="border rounded px-4 py-3 text-lg min-w-[250px]"
        >
          <option value="All">Time</option>
          <option value="breakfast">Breakfast</option>
          <option value="lunch">Lunch</option>
          <option value="dinner">Dinner</option>
        </select>

        <select
          value={type || 'All'}
          onChange={(e) => {
            const value = e.target.value === 'All' ? null : e.target.value;
            setType(value);
            updateSearchParams();
          }}
          className="border rounded px-4 py-3 text-lg min-w-[250px]"
        >
          <option value="All">Type</option>
          <option value="veg">Vegetarian</option>
          <option value="chicken">Chicken</option>
          <option value="fish">Fish</option>
        </select>

        <select
          value={vitamin || 'All'}
          onChange={(e) => {
            const value = e.target.value === 'All' ? null : e.target.value;
            setVitamin(value);
            updateSearchParams();
          }}
          className="border rounded px-4 py-3 text-lg min-w-[250px]"
        >
          <option value="All">Rich In Vitamin</option>
          <option value="vitamin_a">Vitamin A</option>
          <option value="vitamin_c">Vitamin C</option>
          <option value="vitamin_b12">Vitamin B12</option>
        </select>
      </div>

      {/* Filter Summary */}
      <div className="mb-4">
        <p className="text-gray-600 text-lg">
          {recipes.length} {recipes.length === 1 ? 'recipe' : 'recipes'} found
          {queryParam && ` for "${queryParam}"`}
          {difficulty && ` with ${difficulty} difficulty`}
          {cuisine && ` of ${cuisine} cuisine`}
          {timeOfDay && ` for ${timeOfDay}`}
          {type && ` | ${type}`}
          {vitamin && ` | ${vitamin.replace('vitamin_', 'Vitamin ')}`}
          {calories && ` | ${calories} calories`}
        </p>
      </div>

      <RecipeGrid
        recipes={recipes}
        emptyMessage="No recipes found matching your criteria. Try adjusting your filters."
      />
    </div>
  );
};

export default RecipesPage;
