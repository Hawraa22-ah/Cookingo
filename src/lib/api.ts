import { supabase } from './supabase';
import { Comment, Rating } from '../types';


const handleSupabaseError = async (error: any) => {
  if (
    error?.status === 403 &&
    (error?.message?.includes('JWT expired') ||
      error?.message?.includes('session_not_found'))
  ) {
    const { error: signOutError } = await supabase.auth.signOut();
    if (!signOutError) {
      window.location.href = '/login';
    }
    throw new Error('Your session has expired. Please sign in again.');
  }
  throw error;
};

export const addComment = async (recipeId: string, content: string): Promise<Comment> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data: recipe, error: recipeError } = await supabase
      .from('recipes')
      .select('id')
      .eq('id', recipeId)
      .maybeSingle();

    if (recipeError) throw recipeError;
    if (!recipe) throw new Error(`Recipe with ID ${recipeId} not found`);

    const { data: comment, error } = await supabase
      .from('recipe_comments')
      .insert([{ recipe_id: recipeId, content, user_id: user.id }])
      .select(`*, user:user_profiles (username, avatar_url)`).single();

    if (error) throw error;
    return comment;
  } catch (error) {
    return handleSupabaseError(error);
  }
};

export const rateRecipe = async (recipeId: string, rating: number): Promise<Rating> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data: recipe, error: recipeError } = await supabase
      .from('recipes')
      .select('id')
      .eq('id', recipeId)
      .maybeSingle();

    if (recipeError) throw recipeError;
    if (!recipe) throw new Error(`Recipe with ID ${recipeId} not found`);

    const { data, error } = await supabase
      .from('recipe_ratings')
      .upsert({ recipe_id: recipeId, rating, user_id: user.id }, { onConflict: 'user_id,recipe_id' })
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    return handleSupabaseError(error);
  }
};

export const getRecipeInteractions = async (recipeId: string) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();

    const { data: recipe, error: recipeError } = await supabase
      .from('recipes')
      .select('id')
      .eq('id', recipeId)
      .maybeSingle();

    if (recipeError) throw recipeError;
    if (!recipe) {
      return {
        comments: [],
        ratings: [],
        favorites: [],
        userRating: null,
        isFavorite: false,
        error: `Recipe with ID ${recipeId} not found`
      };
    }

    const [
      { data: comments },
      { data: ratings },
      { data: favorites },
      { data: userRating },
      { data: userFavorite }
    ] = await Promise.all([
      supabase.from('recipe_comments').select('*, user:user_profiles (username, avatar_url)').eq('recipe_id', recipeId).order('created_at', { ascending: false }),
      supabase.from('recipe_ratings').select().eq('recipe_id', recipeId),
      supabase.from('favorites').select().eq('recipe_id', recipeId),
      user ? supabase.from('recipe_ratings').select().eq('recipe_id', recipeId).eq('user_id', user.id).maybeSingle() : Promise.resolve({ data: null }),
      user ? supabase.from('favorites').select().eq('recipe_id', recipeId).eq('user_id', user.id).maybeSingle() : Promise.resolve({ data: null })
    ]);

    return {
      comments: comments || [],
      ratings: ratings || [],
      favorites: favorites || [],
      userRating: userRating?.rating || null,
      isFavorite: !!userFavorite,
      error: null
    };
  } catch (error) {
    return handleSupabaseError(error);
  }
};

// ✅ At the top-level scope
export const toggleFavorite = async (recipeId: string): Promise<boolean> => {
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  console.log('toggleFavorite user', user);

  if (!user) throw new Error('User not authenticated');

  const { data: existing, error: fetchError } = await supabase
    .from('favorites')
    .select()
    .eq('user_id', user.id)
    .eq('recipe_id', recipeId)
    .maybeSingle();

  console.log('existing favorite:', existing, fetchError);

  if (existing) {
    const { error: deleteError } = await supabase
      .from('favorites')
      .delete()
      .eq('id', existing.id);
    if (deleteError) throw deleteError;
    return false;
  } else {
    const { error: insertError } = await supabase
      .from('favorites')
      .insert([{ user_id: user.id, recipe_id: recipeId }]);

    if (insertError) throw insertError;
    return true;
  }
};
