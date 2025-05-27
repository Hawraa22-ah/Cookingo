import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import SearchBar from '../components/ui/SearchBar';
import RecipeGrid from '../components/recipes/RecipeGrid';
import CategoryFilter from '../components/ui/CategoryFilter';
import { searchRecipes, getAllRecipes } from '../data/recipes';
import { getAllTags } from '../utils/helpers';

const SearchPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const queryParam = searchParams.get('q') || '';
  const tagParam = searchParams.get('tag');
  
  const [searchResults, setSearchResults] = useState(getAllRecipes());
  const [selectedTag, setSelectedTag] = useState<string | null>(tagParam);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  
  const allRecipes = getAllRecipes();
  const tags = getAllTags(allRecipes);
  
  // Generate search suggestions based on recipe titles and tags
  const generateSuggestions = (query: string): string[] => {
    if (!query) return [];
    
    const lowercaseQuery = query.toLowerCase();
    const suggestionSet = new Set<string>();
    
    // Add matching recipe titles
    allRecipes.forEach(recipe => {
      if (recipe.title.toLowerCase().includes(lowercaseQuery)) {
        suggestionSet.add(recipe.title);
      }
    });
    
    // Add matching tags
    tags.forEach(tag => {
      if (tag.toLowerCase().includes(lowercaseQuery)) {
        suggestionSet.add(tag);
      }
    });
    
    // Add matching ingredients
    allRecipes.forEach(recipe => {
      recipe.ingredients.forEach(ingredient => {
        const mainIngredient = ingredient.split(',')[0].trim();
        if (mainIngredient.toLowerCase().includes(lowercaseQuery)) {
          suggestionSet.add(mainIngredient);
        }
      });
    });
    
    return Array.from(suggestionSet).slice(0, 5);
  };
  
  useEffect(() => {
    if (queryParam) {
      const results = searchRecipes(queryParam);
      setSearchResults(tagParam 
        ? results.filter(recipe => recipe.tags.includes(tagParam))
        : results
      );
      setSuggestions(generateSuggestions(queryParam));
    } else if (tagParam) {
      setSearchResults(allRecipes.filter(recipe => recipe.tags.includes(tagParam)));
    } else {
      setSearchResults(allRecipes);
    }
  }, [queryParam, tagParam, allRecipes]);
  
  const handleSearch = (query: string) => {
    setSearchParams(prev => {
      if (query) {
        prev.set('q', query);
      } else {
        prev.delete('q');
      }
      return prev;
    });
    
    if (query) {
      const results = searchRecipes(query);
      setSearchResults(selectedTag 
        ? results.filter(recipe => recipe.tags.includes(selectedTag))
        : results
      );
      setSuggestions(generateSuggestions(query));
    } else if (selectedTag) {
      setSearchResults(allRecipes.filter(recipe => recipe.tags.includes(selectedTag)));
    } else {
      setSearchResults(allRecipes);
    }
  };
  
  const handleTagChange = (tag: string | null) => {
    setSelectedTag(tag);
    
    setSearchParams(prev => {
      if (tag) {
        prev.set('tag', tag);
      } else {
        prev.delete('tag');
      }
      return prev;
    });
    
    if (queryParam) {
      const results = searchRecipes(queryParam);
      setSearchResults(tag 
        ? results.filter(recipe => recipe.tags.includes(tag))
        : results
      );
    } else if (tag) {
      setSearchResults(allRecipes.filter(recipe => recipe.tags.includes(tag)));
    } else {
      setSearchResults(allRecipes);
    }
  };
  
  return (
    <div className="container mx-auto px-4 py-16">
      <div className="mb-8 text-center">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-800 font-serif mb-4">
          Search Recipes
        </h1>
        <p className="text-gray-600 max-w-2xl mx-auto mb-8">
          Looking for something specific? Search our recipe collection by name, ingredient, or category.
        </p>
        
        <SearchBar 
          initialQuery={queryParam} 
          onSearch={handleSearch}
          className="max-w-2xl mx-auto"
          suggestions={suggestions}
        />
      </div>
      
      <CategoryFilter 
        categories={tags}
        selectedCategory={selectedTag}
        onChange={handleTagChange}
      />
      
      <div className="mb-4">
        <p className="text-gray-600">
          {searchResults.length} {searchResults.length === 1 ? 'recipe' : 'recipes'} found
          {queryParam && ` for "${queryParam}"`}
          {selectedTag && ` in ${selectedTag}`}
        </p>
      </div>
      
      <RecipeGrid 
        recipes={searchResults} 
        emptyMessage={`No recipes found${queryParam ? ` for "${queryParam}"` : ''}${selectedTag ? ` in ${selectedTag}` : ''}. Try adjusting your search criteria.`}
      />
    </div>
  );
};

export default SearchPage;