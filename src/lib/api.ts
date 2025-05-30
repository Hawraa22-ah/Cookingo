import { supabase } from './supabase';
import { Comment, Rating, Favorite } from '../types';

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

    // First check if recipe exists
    const { data: recipe, error: recipeError } = await supabase
      .from('recipes')
      .select('id')
      .eq('id', recipeId)
      .maybeSingle();

    if (recipeError) throw recipeError;
    if (!recipe) throw new Error(`Recipe with ID ${recipeId} not found`);

    // Ensure user profile exists
    const { data: userProfile, error: profileError } = await supabase
      .from('user_profiles')
      .select('id, username')
      .eq('id', user.id)
      .maybeSingle();

    if (!userProfile) {
      // Create user profile if it doesn't exist
      const { data: newProfile, error: insertError } = await supabase
        .from('user_profiles')
        .insert([{
          id: user.id,
          username: user.email?.split('@')[0] || `user_${user.id.substring(0, 8)}`,
        }])
        .select()
        .single();

      if (insertError) throw insertError;
    }

    const { data: comment, error } = await supabase
      .from('recipe_comments')
      .insert([{ 
        recipe_id: recipeId, 
        content,
        user_id: user.id 
      }])
      .select(`
        *,
        user:user_profiles (
          username,
          avatar_url
        )
      `)
      .single();

    if (error) throw error;
    return comment;
  } catch (error) {
    return handleSupabaseError(error);
  }
};

export const updateComment = async (commentId: string, content: string): Promise<Comment> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data: comment, error } = await supabase
      .from('recipe_comments')
      .update({ content })
      .eq('id', commentId)
      .eq('user_id', user.id)
      .select(`
        *,
        user:user_profiles (
          username,
          avatar_url
        )
      `)
      .single();

    if (error) throw error;
    return comment;
  } catch (error) {
    return handleSupabaseError(error);
  }
};

export const deleteComment = async (commentId: string): Promise<void> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { error } = await supabase
      .from('recipe_comments')
      .delete()
      .eq('id', commentId)
      .eq('user_id', user.id);

    if (error) throw error;
  } catch (error) {
    return handleSupabaseError(error);
  }
};

export const rateRecipe = async (recipeId: string, rating: number): Promise<Rating> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    // First check if recipe exists
    const { data: recipe, error: recipeError } = await supabase
      .from('recipes')
      .select('id')
      .eq('id', recipeId)
      .maybeSingle();

    if (recipeError) throw recipeError;
    if (!recipe) throw new Error(`Recipe with ID ${recipeId} not found`);

    // Ensure user profile exists
    const { data: userProfile, error: profileError } = await supabase
      .from('user_profiles')
      .select('id, username')
      .eq('id', user.id)
      .maybeSingle();

    if (!userProfile) {
      // Create user profile if it doesn't exist
      const { data: newProfile, error: insertError } = await supabase
        .from('user_profiles')
        .insert([{
          id: user.id,
          username: user.email?.split('@')[0] || `user_${user.id.substring(0, 8)}`,
        }])
        .select()
        .single();

      if (insertError) throw insertError;
    }

    const { data, error } = await supabase
      .from('recipe_ratings')
      .upsert(
        { 
          recipe_id: recipeId, 
          rating,
          user_id: user.id 
        },
        { onConflict: 'user_id,recipe_id' }
      )
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    return handleSupabaseError(error);
  }
};

export const toggleFavorite = async (recipeId: string): Promise<boolean> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    // Check if it's a recipe or a dish
    const [{ data: recipe }, { data: dish }] = await Promise.all([
      supabase
        .from('recipes')
        .select('id')
        .eq('id', recipeId)
        .maybeSingle(),
      supabase
        .from('dishes')
        .select('id')
        .eq('id', recipeId)
        .maybeSingle()
    ]);

    if (!recipe && !dish) {
      throw new Error(`Recipe or dish with ID ${recipeId} not found`);
    }

    // Ensure user profile exists
    const { data: userProfile } = await supabase
      .from('user_profiles')
      .select('id, username')
      .eq('id', user.id)
      .maybeSingle();

    if (!userProfile) {
      const { error: insertError } = await supabase
        .from('user_profiles')
        .insert([{
          id: user.id,
          username: user.email?.split('@')[0] || `user_${user.id.substring(0, 8)}`,
        }]);

      if (insertError) throw insertError;
    }

    // Check if the favorite already exists
    const { data: existingFavorite } = await supabase
      .from('favorites')
      .select()
      .eq(recipe ? 'recipe_id' : 'dish_id', recipeId)
      .eq('user_id', user.id)
      .maybeSingle();

    if (existingFavorite) {
      const { error: deleteError } = await supabase
        .from('favorites')
        .delete()
        .eq('id', existingFavorite.id);

      if (deleteError) throw deleteError;
      return false;
    } else {
      // Use spread syntax to include only one of recipe_id or dish_id
      const insertPayload = {
        user_id: user.id,
        ...(recipe && { recipe_id: recipeId }),
        ...(dish && { dish_id: recipeId })
      };

      const { error: insertError } = await supabase
        .from('favorites')
        .insert([insertPayload]);

      if (insertError) throw insertError;
      return true;
    }
  } catch (error) {
    return handleSupabaseError(error);
  }
};

export const getRecipeInteractions = async (recipeId: string) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    // First check if recipe exists
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
      { data: comments, error: commentsError },
      { data: ratings, error: ratingsError },
      { data: favorites, error: favoritesError },
      { data: userRating, error: userRatingError },
      { data: userFavorite, error: userFavoriteError }
    ] = await Promise.all([
      // Get all comments for the recipe
      supabase
        .from('recipe_comments')
        .select(`
          *,
          user:user_profiles (
            username,
            avatar_url
          )
        `)
        .eq('recipe_id', recipeId)
        .order('created_at', { ascending: false }),
      
      // Get all ratings for the recipe
      supabase
        .from('recipe_ratings')
        .select()
        .eq('recipe_id', recipeId),
      
      // Get all favorites for the recipe
      supabase
        .from('favorites')
        .select()
        .eq('recipe_id', recipeId),
      
      // Get user's rating if authenticated
      user ? supabase
        .from('recipe_ratings')
        .select()
        .eq('recipe_id', recipeId)
        .eq('user_id', user.id)
        .maybeSingle() : Promise.resolve({ data: null, error: null }),
      
      // Get user's favorite status if authenticated
      user ? supabase
        .from('favorites')
        .select()
        .eq('recipe_id', recipeId)
        .eq('user_id', user.id)
        .maybeSingle() : Promise.resolve({ data: null, error: null })
    ]);

    if (commentsError) throw commentsError;
    if (ratingsError) throw ratingsError;
    if (favoritesError) throw favoritesError;
    if (userRatingError && userRatingError.code !== 'PGRST116') throw userRatingError;
    if (userFavoriteError && userFavoriteError.code !== 'PGRST116') throw userFavoriteError;

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