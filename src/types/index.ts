export interface Recipe {
  id: string;
  title: string;
  description: string;
  image_url: string;
  cook_time: number;
  chef_id: string;
  ingredients: Ingredient[];
  instructions: Instruction[];
  tags: string[];
  views: number;
  likes: number;
  ratings?: Rating[];
  userRating?: number;
  isFavorite?: boolean;
  servings?: number;
  difficulty?: string;
  chef_id_text: string
  // avg_rating?: number;
  avg_rating?: number | null; // make sure this is added


}

export interface Dish {
  id: string;
  title: string;
  description: string;
  image_url: string;
  price: number;
  seller_id: string;
  available: boolean;
  tags: string[];
  created_at: string;
  updated_at: string;
  orders: number;
  rating: number;
  status: 'draft' | 'published' | 'archived';
  donation_amount: number;
}

export interface Ingredient {
  name: string;
  amount: string;
  unit: string;
}

export interface Instruction {
  step: number;
  text: string;
}

export interface Comment {
  id: string;
  recipe_id: string;
  user_id: string;
  content: string;
  created_at: string;
  user?: {
    username: string;
    avatar_url: string | null;
  };
}

export interface Rating {
  id: string;
  recipe_id: string;
  user_id: string;
  rating: number;
  created_at: string;
}

export interface Favorite {
  id: string;
  recipe_id: string;
  user_id: string;
  created_at: string;
}

export interface DailyDishOrder {
  id: string;
  user_id: string;
  dish_id: string;
  quantity: number;
  delivery_date: string;
  delivery_time: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  created_at: string;
  updated_at: string;
  dish?: Dish;
}

export interface ShoppingList {
  id: string;
  user_id: string;
  name: string;
  created_at: string;
  updated_at: string;
  items?: ShoppingListItem[];
}

export interface ShoppingListItem {
  id: string;
  list_id: string;
  ingredient: string;
  amount: string;
  unit: string;
  checked: boolean;
  created_at: string;
}