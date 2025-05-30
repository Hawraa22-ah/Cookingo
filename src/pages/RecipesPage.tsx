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
}

export interface Chef {
  id: string;
  full_name: string;
  avatar_url?: string;
  bio?: string;
}


const RecipesPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const tagParam = searchParams.get('tag');
  const queryParam = searchParams.get('q');
  const difficultyParam = searchParams.get('difficulty');
  const timeParam = searchParams.get('time');
  const servingsParam = searchParams.get('servings');
  const cuisineParam = searchParams.get('cuisine');

  const [search, setSearch] = useState<string>(queryParam || '');
  const [selectedTag, setSelectedTag] = useState<string | null>(tagParam);
  const [difficulty, setDifficulty] = useState<string | null>(difficultyParam);
  const [cuisine, setCuisine] = useState<string | null>(cuisineParam);
  const [cookingTime, setCookingTime] = useState<number | null>(timeParam ? parseInt(timeParam) : null);
  const [servings, setServings] = useState<number | null>(servingsParam ? parseInt(servingsParam) : null);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [suggestions, setSuggestions] = useState<string[]>([]);

  const tags = Array.from(new Set(recipes.flatMap((r) => r.tags || [])));

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

    if (difficulty) {
      filteredRecipes = filteredRecipes.filter(recipe => recipe.difficulty === difficulty);
    }

    if (cuisine) {
      filteredRecipes = filteredRecipes.filter(recipe => recipe.cuisine === cuisine);
    }

    if (cookingTime) {
      filteredRecipes = filteredRecipes.filter(recipe =>
        (recipe.prep_time + recipe.cook_time) <= cookingTime
      );
    }

    // if (servings) {
    //   filteredRecipes = filteredRecipes.filter(recipe => recipe.servings === servings);
    // }
    if (servings !== null && !isNaN(servings)) {
  filteredRecipes = filteredRecipes.filter(recipe => recipe.servings === Number(servings));
}


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

        // Apply query & tag filter
        let filtered = data;

        if (queryParam) {
          filtered = filtered.filter(r =>
            r.title.toLowerCase().includes(queryParam.toLowerCase()) ||
            (r.tags || []).some(tag => tag.toLowerCase().includes(queryParam.toLowerCase()))
          );
          setSuggestions(generateSuggestions(queryParam));
        }

        if (tagParam) {
          filtered = filtered.filter(r => (r.tags || []).includes(tagParam));
        }

        filtered = applyFilters(filtered);
        setRecipes(filtered);
      } catch (err) {
        console.error('Failed to load recipes:', err);
      }
    };

    fetchRecipes();
  }, [queryParam, tagParam, difficulty, cookingTime, servings, cuisine]);

  const updateSearchParams = () => {
    setSearchParams(prev => {
      difficulty ? prev.set('difficulty', difficulty) : prev.delete('difficulty');
      cuisine ? prev.set('cuisine', cuisine) : prev.delete('cuisine');
      cookingTime ? prev.set('time', cookingTime.toString()) : prev.delete('time');
      servings ? prev.set('servings', servings.toString()) : prev.delete('servings');
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

  const handleTagChange = (tag: string | null) => {
    setSelectedTag(tag);
    setSearchParams(prev => {
      tag ? prev.set('tag', tag) : prev.delete('tag');
      return prev;
    });
  };

  const handleDifficultyChange = (newDifficulty: string | null) => {
    setDifficulty(newDifficulty);
    updateSearchParams();
  };

  const handleCuisineChange = (newCuisine: string | null) => {
    setCuisine(newCuisine);
    updateSearchParams();
  };

  const handleCookingTimeChange = (newTime: number | null) => {
    setCookingTime(newTime);
    updateSearchParams();
  };

  const handleServingsChange = (newServings: number | null) => {
    setServings(newServings);
    updateSearchParams();
  };

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-3xl md:text-4xl font-bold text-gray-800 font-serif mb-6 text-center">
        All Recipes
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <input
          type="text"
          placeholder="Search recipes..."
          value={search}
          onChange={(e) => handleSearch(e.target.value)}
          className="p-2 border rounded"
        />

        <select value={selectedTag || 'All'} onChange={(e) => handleTagChange(e.target.value === 'All' ? null : e.target.value)} className="p-2 border rounded">
          <option value="All">All Categories</option>
          {tags.map(tag => (
            <option key={tag} value={tag}>{tag}</option>
          ))}
        </select>

        <select value={cuisine || 'All'} onChange={(e) => handleCuisineChange(e.target.value === 'All' ? null : e.target.value)} className="p-2 border rounded">
          <option value="All">All Cuisines</option>
          <option value="Italian">Italian</option>
          <option value="Thai">Thai</option>
          <option value="American">American</option>
        </select>

        <select value={difficulty || 'All'} onChange={(e) => handleDifficultyChange(e.target.value === 'All' ? null : e.target.value)} className="p-2 border rounded">
          <option value="All">All Difficulties</option>
          <option value="Easy">Easy</option>
          <option value="Medium">Medium</option>
          <option value="Hard">Hard</option>
        </select>
      </div>

      <div className="mb-4">
        <p className="text-gray-600">
          {recipes.length} {recipes.length === 1 ? 'recipe' : 'recipes'} found
          {queryParam && ` for "${queryParam}"`}
          {selectedTag && ` in ${selectedTag}`}
          {difficulty && ` with ${difficulty} difficulty`}
          {cuisine && ` of ${cuisine} cuisine`}
          {cookingTime && ` under ${cookingTime} minutes`}
          {servings && ` for ${servings} people`}
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
