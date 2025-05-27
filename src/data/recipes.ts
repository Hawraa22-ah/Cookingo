import { Recipe } from '../types';

// Sample recipe data with UUID strings
export const recipes: Recipe[] = [
  {
    id: "123e4567-e89b-12d3-a456-426614174000",
    title: "Classic Margherita Pizza",
    description: "Traditional Italian pizza with fresh mozzarella, tomatoes, and basil",
    image_url: "https://images.pexels.com/photos/905847/pexels-photo-905847.jpeg",
    cook_time: 30,
    chef_id: "123e4567-e89b-12d3-a456-426614174111",
    ingredients: [
      { name: "Pizza Dough", amount: "1", unit: "ball" },
      { name: "Fresh Mozzarella", amount: "200", unit: "g" },
      { name: "Tomatoes", amount: "3", unit: "whole" },
      { name: "Fresh Basil", amount: "10", unit: "leaves" },
      { name: "Olive Oil", amount: "2", unit: "tbsp" }
    ],
    instructions: [
      { step: 1, text: "Preheat oven to 450°F (230°C)" },
      { step: 2, text: "Roll out the pizza dough" },
      { step: 3, text: "Add toppings" },
      { step: 4, text: "Bake for 15-20 minutes" }
    ],
    tags: ["Italian", "Pizza", "Vegetarian"],
    views: 1200,
    likes: 450,
    ratings: [],
    userRating: null,
    isFavorite: false
  },
  {
    id: "223e4567-e89b-12d3-a456-426614174001",
    title: "Spaghetti Carbonara",
    description: "Creamy Italian pasta dish with eggs, cheese, pancetta, and black pepper",
    image_url: "https://images.pexels.com/photos/1527603/pexels-photo-1527603.jpeg",
    cook_time: 25,
    chef_id: "223e4567-e89b-12d3-a456-426614174112",
    ingredients: [
      { name: "Spaghetti", amount: "400", unit: "g" },
      { name: "Eggs", amount: "3", unit: "whole" },
      { name: "Pecorino Romano", amount: "100", unit: "g" },
      { name: "Pancetta", amount: "150", unit: "g" },
      { name: "Black Pepper", amount: "2", unit: "tsp" }
    ],
    instructions: [
      { step: 1, text: "Cook pasta in salted water" },
      { step: 2, text: "Prepare egg and cheese mixture" },
      { step: 3, text: "Cook pancetta until crispy" },
      { step: 4, text: "Combine all ingredients" }
    ],
    tags: ["Italian", "Pasta", "Quick"],
    views: 800,
    likes: 320,
    ratings: [],
    userRating: null,
    isFavorite: false
  },
  {
    id: "323e4567-e89b-12d3-a456-426614174002",
    title: "Fresh Garden Salad",
    description: "Light and refreshing salad with seasonal vegetables and homemade vinaigrette",
    image_url: "https://images.pexels.com/photos/1059905/pexels-photo-1059905.jpeg",
    cook_time: 15,
    chef_id: "323e4567-e89b-12d3-a456-426614174113",
    ingredients: [
      { name: "Mixed Greens", amount: "200", unit: "g" },
      { name: "Cherry Tomatoes", amount: "100", unit: "g" },
      { name: "Cucumber", amount: "1", unit: "whole" },
      { name: "Red Onion", amount: "1/2", unit: "whole" },
      { name: "Olive Oil", amount: "3", unit: "tbsp" },
      { name: "Balsamic Vinegar", amount: "1", unit: "tbsp" }
    ],
    instructions: [
      { step: 1, text: "Wash and dry all vegetables" },
      { step: 2, text: "Slice vegetables into bite-sized pieces" },
      { step: 3, text: "Make vinaigrette" },
      { step: 4, text: "Combine and toss" }
    ],
    tags: ["Salad", "Vegetarian", "Healthy", "Quick"],
    views: 600,
    likes: 280,
    ratings: [],
    userRating: null,
    isFavorite: false
  },
  {
    id: "423e4567-e89b-12d3-a456-426614174003",
    title: "Chocolate Lava Cake",
    description: "Decadent chocolate dessert with a warm, gooey center",
    image_url: "https://images.pexels.com/photos/291528/pexels-photo-291528.jpeg",
    cook_time: 20,
    chef_id: "423e4567-e89b-12d3-a456-426614174114",
    ingredients: [
      { name: "Dark Chocolate", amount: "200", unit: "g" },
      { name: "Butter", amount: "100", unit: "g" },
      { name: "Eggs", amount: "4", unit: "whole" },
      { name: "Sugar", amount: "100", unit: "g" },
      { name: "Flour", amount: "50", unit: "g" }
    ],
    instructions: [
      { step: 1, text: "Melt chocolate and butter" },
      { step: 2, text: "Mix eggs and sugar" },
      { step: 3, text: "Combine all ingredients" },
      { step: 4, text: "Bake until edges are set but center is soft" }
    ],
    tags: ["Dessert", "Chocolate", "Baking"],
    views: 900,
    likes: 450,
    ratings: [],
    userRating: null,
    isFavorite: false
  },
  {
    id: "523e4567-e89b-12d3-a456-426614174004",
    title: "Grilled Salmon",
    description: "Perfectly grilled salmon with lemon and herbs",
    image_url: "https://images.pexels.com/photos/3763847/pexels-photo-3763847.jpeg",
    cook_time: 20,
    chef_id: "523e4567-e89b-12d3-a456-426614174115",
    ingredients: [
      { name: "Salmon Fillet", amount: "400", unit: "g" },
      { name: "Lemon", amount: "1", unit: "whole" },
      { name: "Olive Oil", amount: "2", unit: "tbsp" },
      { name: "Fresh Dill", amount: "1", unit: "bunch" },
      { name: "Garlic", amount: "2", unit: "cloves" }
    ],
    instructions: [
      { step: 1, text: "Marinate salmon with oil, lemon, and herbs" },
      { step: 2, text: "Preheat grill to medium-high" },
      { step: 3, text: "Grill salmon for 4-5 minutes per side" },
      { step: 4, text: "Rest for 5 minutes before serving" }
    ],
    tags: ["Seafood", "Healthy", "Grilling"],
    views: 750,
    likes: 380,
    ratings: [],
    userRating: null,
    isFavorite: false
  }
];

export const getRecipeById = (id: string): Recipe | undefined => {
  return recipes.find(recipe => recipe.id === id);
};

export const getAllRecipes = (): Recipe[] => {
  return recipes;
};

// Search recipes by title, ingredients, or tags
export const searchRecipes = (query: string): Recipe[] => {
  const searchTerm = query.toLowerCase().trim();
  
  return recipes.filter(recipe => {
    // Search in title
    if (recipe.title.toLowerCase().includes(searchTerm)) {
      return true;
    }
    
    // Search in ingredients
    if (recipe.ingredients.some(ingredient => 
      ingredient.name.toLowerCase().includes(searchTerm)
    )) {
      return true;
    }
    
    // Search in tags
    if (recipe.tags.some(tag => 
      tag.toLowerCase().includes(searchTerm)
    )) {
      return true;
    }
    
    // Search in description
    if (recipe.description?.toLowerCase().includes(searchTerm)) {
      return true;
    }
    
    return false;
  });
};

// Daily dishes are recipes featured for the current day
export const getDailyDishes = () => {
  return recipes.map(recipe => ({
    id: recipe.id,
    recipeId: recipe.id,
    title: recipe.title,
    description: recipe.description,
    image: recipe.image_url,
    date: new Date(),
    prepTime: 15, // Default prep time
    cookTime: recipe.cook_time,
    servings: 4, // Default servings
    difficulty: "Medium", // Default difficulty
    ratings: [], // Empty ratings array
    ingredients: recipe.ingredients.map(i => `${i.name}`),
    tags: recipe.tags,
    userRating: null,
    isFavorite: false
  }));
};