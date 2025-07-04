import React, { useState, useEffect } from 'react';
import { Heart, Star, Send } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { Comment } from '../../types';
import toast from 'react-hot-toast';
import { supabase } from '../../lib/supabase';

interface RecipeInteractionsProps {
  recipeId: string;
}

const RecipeInteractions: React.FC<RecipeInteractionsProps> = ({ recipeId }) => {
  const { handleAuthError } = useAuth();
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [userRating, setUserRating] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  useEffect(() => {
    const init = async () => {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error || !user) return;
      setCurrentUserId(user.id);
      await loadInteractions(user.id);
    };
    init();
  }, [recipeId]);

  const loadInteractions = async (userId: string) => {
    try {
      const { data: favData } = await supabase
        .from('favorite_recipes')
        .select('*')
        .eq('user_id', userId)
        .eq('recipe_id', recipeId)
        .single();
      setIsFavorite(!!favData);

      const { data: ratingData } = await supabase
        .from('recipe_ratings')
        .select('*')
        .eq('user_id', userId)
        .eq('recipe_id', recipeId)
        .single();
      if (ratingData) setUserRating(ratingData.rating);

      const { data: commentData, error } = await supabase
        .from('comments')
        .select(`
          *,
          user:profiles!user_id ( username )
        `)
        .eq('recipe_id', recipeId)
        .order('created_at', { ascending: false });
      if (error) throw error;
      setComments(commentData);
    } catch (error) {
      console.error('Error loading interactions:', error);
    }
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUserId) return toast.error('Please sign in to comment');
    if (!newComment.trim()) return;

    setIsLoading(true);
    try {
      const { error } = await supabase.from('comments').insert([{
        user_id: currentUserId,
        recipe_id: recipeId,
        content: newComment,
      }]);
      if (error) throw error;

      await supabase.rpc('increment_recipe_comments', { recipe_id_input: recipeId });
      await loadInteractions(currentUserId);
      setNewComment('');
      toast.success('Comment added!');
    } catch {
      toast.error('Failed to add comment');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRating = async (rating: number) => {
    if (!currentUserId) return toast.error('Please sign in to rate');
    try {
      const { error } = await supabase.from('recipe_ratings').upsert(
        [{ user_id: currentUserId, recipe_id: recipeId, rating }],
        { onConflict: ['user_id', 'recipe_id'] }
      );
      if (error) throw error;

      await supabase.rpc('update_recipe_rating', { recipe_id_input: recipeId });
      setUserRating(rating);
      toast.success('Rating submitted');
    } catch {
      toast.error('Failed to submit rating');
    }
  };

  const handleFavorite = async () => {
    if (!currentUserId) return toast.error('Please sign in to favorite');

    try {
      if (isFavorite) {
        // ← delete from favorite_recipes
        const { error } = await supabase
          .from('favorite_recipes')
          .delete()
          .eq('user_id', currentUserId)
          .eq('recipe_id', recipeId);
        if (error) throw error;

        setIsFavorite(false);
        toast.success('Removed from favorites');
      } else {
        // ← insert into favorite_recipes
        const { error } = await supabase
          .from('favorite_recipes')
          .insert({ user_id: currentUserId, recipe_id: recipeId });
        if (error) throw error;

        setIsFavorite(true);
        toast.success('Saved to favorites');
      }

      await supabase.rpc('update_favorite_count', { recipe_id_input: recipeId });
    } catch (err: any) {
      console.error('Favorite error:', err);
      toast.error('Something went wrong');
    }
  };

  return (
    <div className="space-y-8">
      {/* Rating & Save */}
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-1">
          {[1,2,3,4,5].map((star) => (
            <button
              key={star}
              onClick={() => handleRating(star)}
              disabled={!currentUserId}
            >
              <Star
                className={`w-6 h-6 ${
                  star <= userRating
                    ? 'text-yellow-400 fill-current'
                    : 'text-gray-300'
                } ${!currentUserId ? 'opacity-50' : 'cursor-pointer'}`}
              />
            </button>
          ))}
        </div>

        <button
          onClick={handleFavorite}
          className={`flex items-center gap-2 ${
            !currentUserId ? 'opacity-50' : 'cursor-pointer'
          } ${isFavorite ? 'text-red-500' : 'text-gray-600 hover:text-red-500'}`}
          disabled={!currentUserId}
        >
          <Heart className={isFavorite ? 'fill-current' : ''} />
          <span>{isFavorite ? 'Saved' : 'Save'}</span>
        </button>
      </div>

      {/* Comments */}
      <div>
        <h3 className="text-xl font-bold mb-4">Comments</h3>
        <form onSubmit={handleAddComment} className="mb-6">
          <div className="flex gap-2">
            <input
              type="text"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder={currentUserId ? 'Add a comment...' : 'Please sign in to comment'}
              className="flex-1 px-4 py-2 border rounded focus:ring-2 focus:ring-orange-500"
              disabled={!currentUserId || isLoading}
            />
            <button
              type="submit"
              disabled={!currentUserId || isLoading || !newComment.trim()}
              className="bg-orange-500 text-white px-4 py-2 rounded disabled:opacity-50"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </form>

        {comments.length === 0 ? (
          <p className="text-center text-gray-500">No comments yet. Be the first to comment!</p>
        ) : (
          <div className="space-y-4">
            {comments.map((c) => (
              <div key={c.id} className="bg-gray-50 p-4 rounded">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                    {c.user?.username?.[0].toUpperCase() || 'U'}
                  </div>
                  <div>
                    <p className="font-medium">{c.user?.username || 'User'}</p>
                    <p className="text-sm text-gray-500">
                      {new Date(c.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <p className="text-gray-700">{c.content}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default RecipeInteractions;
