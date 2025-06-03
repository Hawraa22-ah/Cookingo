// import React, { useState, useEffect } from 'react';
// import { Heart, Star, Send } from 'lucide-react';
// import { useAuth } from '../../contexts/AuthContext';
// import { Comment } from '../../types';
// import toast from 'react-hot-toast';
// import { useNavigate } from 'react-router-dom';
// import { supabase } from '../../lib/supabase';

// interface RecipeInteractionsProps {
//   recipeId: string;
// }

// const RecipeInteractions: React.FC<RecipeInteractionsProps> = ({ recipeId }) => {
//   const { user, handleAuthError } = useAuth();
//   const navigate = useNavigate();
//   const [comments, setComments] = useState<Comment[]>([]);
//   const [newComment, setNewComment] = useState('');
//   const [userRating, setUserRating] = useState(0);
//   const [isFavorite, setIsFavorite] = useState(false);
//   const [isLoading, setIsLoading] = useState(false);

//   useEffect(() => {
//     loadInteractions();
//   }, [recipeId]);

//   const loadInteractions = async () => {
//     try {
//       if (user) {
//         const { data: favData } = await supabase
//           .from('saved_recipes')
//           .select('*')
//           .eq('user_id', user.id)
//           .eq('recipe_id', recipeId)
//           .single();
//         setIsFavorite(!!favData);

//         const { data: ratingData } = await supabase
//           .from('ratings')
//           .select('*')
//           .eq('user_id', user.id)
//           .eq('recipe_id', recipeId)
//           .single();
//         if (ratingData) setUserRating(ratingData.rating);
//       }

//       const { data: commentData, error } = await supabase
//         .from('comments')
//         .select('*, profiles(username)')
//         .eq('recipe_id', recipeId)
//         .order('created_at', { ascending: false });
//       if (error) throw error;
//       setComments(commentData);
//     } catch (error) {
//       console.error('Error loading interactions:', error);
//     }
//   };

//   const handleAddComment = async (e: React.FormEvent) => {
//     e.preventDefault();
//     if (!user) {
//       toast.error('Please sign in to comment');
//       return;
//     }
//     if (!newComment.trim()) return;

//     setIsLoading(true);
//     try {
//       const { error } = await supabase.from('comments').insert([
//         {
//           user_id: user.id,
//           recipe_id: recipeId,
//           content: newComment,
//         },
//       ]);

//       if (error) throw error;

//       await supabase.rpc('increment_recipe_comments', { recipe_id_input: recipeId });

//       await loadInteractions();
//       setNewComment('');
//       toast.success('Comment added!');
//     } catch (error) {
//       console.error('Failed to add comment:', error);
//       toast.error('Failed to add comment');
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const handleRating = async (rating: number) => {
//     if (!user) {
//       toast.error('Please sign in to rate');
//       return;
//     }
//     try {
//       await supabase.from('ratings').upsert({
//         user_id: user.id,
//         recipe_id: recipeId,
//         rating,
//       });

//       await supabase.rpc('update_recipe_rating', {
//         recipe_id_input: recipeId,
//       });
//       setUserRating(rating);
//       toast.success('Rating submitted');
//     } catch (error) {
//       console.error('Rating error:', error);
//       toast.error('Failed to submit rating');
//     }
//   };

//   const handleFavorite = async () => {
//     if (!user) {
//       toast.error('Please sign in to favorite');
//       return;
//     }
//     try {
//       if (isFavorite) {
//         await supabase.from('saved_recipes')
//           .delete()
//           .eq('user_id', user.id)
//           .eq('recipe_id', recipeId);
//         setIsFavorite(false);
//         toast.success('Removed from favorites');
//       } else {
//         await supabase.from('saved_recipes')
//           .insert({ user_id: user.id, recipe_id: recipeId });
//         setIsFavorite(true);
//         toast.success('Saved to favorites');
//       }

//       await supabase.rpc('update_favorite_count', {
//         recipe_id_input: recipeId,
//       });
//     } catch (error) {
//       console.error('Favorite error:', error);
//       toast.error('Failed to update favorite status');
//     }
//   };

//   return (
//     <div className="space-y-8">
//       <div className="flex items-center gap-6">
//         <div className="flex items-center gap-1">
//           {[1, 2, 3, 4, 5].map((star) => (
//             <button
//               key={star}
//               onClick={() => handleRating(star)}
//               disabled={!user}
//             >
//               <Star
//                 className={`w-6 h-6 ${
//                   star <= userRating ? 'text-yellow-400 fill-current' : 'text-gray-300'
//                 } ${!user ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}
//               />
//             </button>
//           ))}
//         </div>

//         <button
//           onClick={handleFavorite}
//           className={`flex items-center gap-2 transition-colors ${
//             !user ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'
//           } ${
//             isFavorite ? 'text-red-500' : 'text-gray-600 hover:text-red-500'
//           }`}
//           disabled={!user}
//         >
//           <Heart className={isFavorite ? 'fill-current' : ''} />
//           <span>{isFavorite ? 'Saved' : 'Save'}</span>
//         </button>
//       </div>

//       <div>
//         <h3 className="text-xl font-bold mb-4">Comments</h3>
//         <form onSubmit={handleAddComment} className="mb-6">
//           <div className="flex gap-2">
//             <input
//               type="text"
//               value={newComment}
//               onChange={(e) => setNewComment(e.target.value)}
//               placeholder={user ? "Add a comment..." : "Please sign in to comment"}
//               className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
//               disabled={!user || isLoading}
//             />
//             <button
//               type="submit"
//               disabled={!user || isLoading || !newComment.trim()}
//               className="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
//             >
//               <Send className="w-5 h-5" />
//             </button>
//           </div>
//         </form>

//         <div className="space-y-4">
//           {comments.map((comment) => (
//             <div key={comment.id} className="bg-gray-50 p-4 rounded-lg">
//               <div className="flex items-center gap-2 mb-2">
//                 <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
//                   {comment.profiles?.username?.charAt(0).toUpperCase() || 'U'}
//                 </div>
//                 <div>
//                   <p className="font-medium">{comment.profiles?.username || 'User'}</p>
//                   <p className="text-sm text-gray-500">
//                     {new Date(comment.created_at).toLocaleDateString()}
//                   </p>
//                 </div>
//               </div>
//               <p className="text-gray-700">{comment.content}</p>
//             </div>
//           ))}

//           {comments.length === 0 && (
//             <p className="text-center text-gray-500">No comments yet. Be the first to comment!</p>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// };

// export default RecipeInteractions;

import React, { useState, useEffect } from 'react';
import { Heart, Star, Send } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { Comment } from '../../types';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';

interface RecipeInteractionsProps {
  recipeId: string;
}

const RecipeInteractions: React.FC<RecipeInteractionsProps> = ({ recipeId }) => {
  const { handleAuthError } = useAuth();
  const navigate = useNavigate();

  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [userRating, setUserRating] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  useEffect(() => {
    const getUserAndLoad = async () => {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error || !user) return;
      setCurrentUserId(user.id);
      await loadInteractions(user.id);
    };
    getUserAndLoad();
  }, [recipeId]);

  const loadInteractions = async (userId: string) => {
    try {
      const { data: favData } = await supabase
        .from('favorites')
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
        .select('*, profiles(username)')
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
      const { error } = await supabase.from('comments').insert([
        {
          user_id: currentUserId,
          recipe_id: recipeId,
          content: newComment,
        },
      ]);
      if (error) throw error;

      await supabase.rpc('increment_recipe_comments', { recipe_id_input: recipeId });

      await loadInteractions(currentUserId);
      setNewComment('');
      toast.success('Comment added!');
    } catch (error) {
      console.error('Failed to add comment:', error);
      toast.error('Failed to add comment');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRating = async (rating: number) => {
    if (!currentUserId) return toast.error('Please sign in to rate');
    try {
      const { error } = await supabase.from('recipe_ratings').upsert({
        user_id: currentUserId,
        recipe_id: recipeId,
        rating,
      }, {
        onConflict: ['user_id', 'recipe_id'],
      });

      if (error) {
        console.error('Rating insert error:', error);
        toast.error('Failed to save rating');
        return;
      }

      await supabase.rpc('update_recipe_rating', { recipe_id_input: recipeId });
      setUserRating(rating);
      toast.success('Rating submitted');
    } catch (error) {
      console.error('Rating error:', error);
      toast.error('Failed to submit rating');
    }
  };

  const handleFavorite = async () => {
    if (!currentUserId) return toast.error('Please sign in to favorite');
    try {
      if (isFavorite) {
        await supabase
          .from('favorites')
          .delete()
          .eq('user_id', currentUserId)
          .eq('recipe_id', recipeId);
        setIsFavorite(false);
        toast.success('Removed from favorites');
      } else {
        await supabase
          .from('favorites')
          .insert({ user_id: currentUserId, recipe_id: recipeId });
        setIsFavorite(true);
        toast.success('Saved to favorites');
      }

      await supabase.rpc('update_favorite_count', { recipe_id_input: recipeId });
    } catch (error) {
      console.error('Favorite error:', error);
      toast.error('Failed to update favorite status');
    }
  };

  return (
    <div className="space-y-8">
      {/* Rating & Save */}
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button key={star} onClick={() => handleRating(star)} disabled={!currentUserId}>
              <Star
                className={`w-6 h-6 ${
                  star <= userRating ? 'text-yellow-400 fill-current' : 'text-gray-300'
                } ${!currentUserId ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}
              />
            </button>
          ))}
        </div>

        <button
          onClick={handleFavorite}
          className={`flex items-center gap-2 ${
            !currentUserId ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'
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
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              disabled={!currentUserId || isLoading}
            />
            <button
              type="submit"
              disabled={!currentUserId || isLoading || !newComment.trim()}
              className="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </form>

        <div className="space-y-4">
          {comments.length === 0 && (
            <p className="text-center text-gray-500">No comments yet. Be the first to comment!</p>
          )}
          {comments.map((comment) => (
            <div key={comment.id} className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                  {comment.profiles?.username?.charAt(0).toUpperCase() || 'U'}
                </div>
                <div>
                  <p className="font-medium">{comment.profiles?.username || 'User'}</p>
                  <p className="text-sm text-gray-500">
                    {new Date(comment.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <p className="text-gray-700">{comment.content}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default RecipeInteractions;
