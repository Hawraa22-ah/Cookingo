// import React, { useState, useEffect } from 'react';
// import { Heart, Star, MessageSquare, Send } from 'lucide-react';
// import { useAuth } from '../../contexts/AuthContext';
// import { Comment, Rating } from '../../types';
// import { addComment, rateRecipe, toggleFavorite, getRecipeInteractions } from '../../lib/api';
// import toast from 'react-hot-toast';
// import { useNavigate } from 'react-router-dom';

// interface RecipeInteractionsProps {
//   recipeId: string;
//   initialRating?: number;
//   initialIsFavorite?: boolean;
// }

// const RecipeInteractions: React.FC<RecipeInteractionsProps> = ({
//   recipeId,
//   initialRating,
//   initialIsFavorite = false,
// }) => {
//   const { user, handleAuthError } = useAuth();
//   const navigate = useNavigate();
//   const [comments, setComments] = useState<Comment[]>([]);
//   const [newComment, setNewComment] = useState('');
//   const [userRating, setUserRating] = useState(initialRating || 0);
//   const [isFavorite, setIsFavorite] = useState(initialIsFavorite);
//   const [isLoading, setIsLoading] = useState(false);

//   useEffect(() => {
//     loadInteractions();
//   }, [recipeId]);

//   const loadInteractions = async () => {
//     try {
//       const { comments, userRating, isFavorite, error } = await getRecipeInteractions(recipeId);
      
//       if (error) {
//         console.error('Recipe not found:', error);
//         toast.error('Recipe not found');
//         navigate('/recipes');
//         return;
//       }
      
//       setComments(comments || []);
//       if (userRating) setUserRating(userRating);
//       setIsFavorite(isFavorite);
//     } catch (error) {
//       console.error('Failed to load interactions:', error);
//       if (error instanceof Error && error.message.includes('session has expired')) {
//         navigate('/login');
//       } else {
//         toast.error('Failed to load recipe interactions');
//       }
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
//       const comment = await addComment(recipeId, newComment);
//       setComments([comment, ...comments]);
//       setNewComment('');
//       toast.success('Comment added successfully');
//     } catch (error) {
//       if (error instanceof Error) {
//         if (error.message.includes('session has expired')) {
//           await handleAuthError(error);
//         } else if (error.message.includes('not found')) {
//           toast.error('Recipe not found');
//           navigate('/recipes');
//         } else {
//           console.error('Failed to add comment:', error);
//           toast.error('Failed to add comment');
//         }
//       }
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
//       await rateRecipe(recipeId, rating);
//       setUserRating(rating);
//       toast.success('Rating updated successfully');
//     } catch (error) {
//       if (error instanceof Error) {
//         if (error.message.includes('session has expired')) {
//           await handleAuthError(error);
//         } else if (error.message.includes('not found')) {
//           toast.error('Recipe not found');
//           navigate('/recipes');
//         } else {
//           console.error('Failed to update rating:', error);
//           toast.error('Failed to update rating');
//         }
//       }
//     }
//   };

//   const handleFavorite = async () => {
//     if (!user) {
//       toast.error('Please sign in to favorite');
//       return;
//     }

//     try {
//       const newFavoriteStatus = await toggleFavorite(recipeId);
//       setIsFavorite(newFavoriteStatus);
//       toast.success(newFavoriteStatus ? 'Added to favorites' : 'Removed from favorites');
//     } catch (error) {
//       if (error instanceof Error) {
//         if (error.message.includes('session has expired')) {
//           await handleAuthError(error);
//         } else if (error.message.includes('not found')) {
//           toast.error('Recipe not found');
//           navigate('/recipes');
//         } else {
//           console.error('Failed to update favorite status:', error);
//           toast.error('Failed to update favorite status');
//         }
//       }
//     }
//   };

//   return (
//     <div className="space-y-8">
//       <div className="flex items-center gap-6">
//         {/* Rating */}
//         <div className="flex items-center gap-1">
//           {[1, 2, 3, 4, 5].map((star) => (
//             <button
//               key={star}
//               onClick={() => handleRating(star)}
//               className="focus:outline-none"
//               disabled={!user}
//             >
//               <Star
//                 className={`w-6 h-6 ${
//                   star <= userRating
//                     ? 'text-yellow-400 fill-current'
//                     : 'text-gray-300'
//                 } ${!user ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}
//               />
//             </button>
//           ))}
//         </div>

//         {/* Favorite */}
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

//       {/* Comments Section */}
//       <div>
//         <h3 className="text-xl font-bold mb-4">Comments</h3>
        
//         {/* Comment Form */}
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

//         {/* Comments List */}
//         <div className="space-y-4">
//           {comments.map((comment) => (
//             <div key={comment.id} className="bg-gray-50 p-4 rounded-lg">
//               <div className="flex items-center gap-2 mb-2">
//                 <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
//                   {comment.user.username.charAt(0).toUpperCase()}
//                 </div>
//                 <div>
//                   <p className="font-medium">{comment.user.username}</p>
//                   <p className="text-sm text-gray-500">
//                     {new Date(comment.createdAt).toLocaleDateString()}
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
import { Heart, Star, MessageSquare, Send } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { Comment, Rating } from '../../types';
import { addComment, rateRecipe, toggleFavorite, getRecipeInteractions } from '../../lib/api';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

interface RecipeInteractionsProps {
  recipeId: string;
  initialRating?: number;
  initialIsFavorite?: boolean;
}

const RecipeInteractions: React.FC<RecipeInteractionsProps> = ({
  recipeId,
  initialRating,
  initialIsFavorite = false,
}) => {
  const { user, handleAuthError } = useAuth();
  const navigate = useNavigate();
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [userRating, setUserRating] = useState(initialRating || 0);
  const [isFavorite, setIsFavorite] = useState(initialIsFavorite);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadInteractions();
  }, [recipeId]);

  const loadInteractions = async () => {
    try {
      const { comments, userRating, isFavorite, error } = await getRecipeInteractions(recipeId);

      if (error) {
        console.error('Recipe not found:', error);
        toast.error('Recipe not found');
        navigate('/recipes');
        return;
      }

      setComments(comments || []);
      if (userRating) setUserRating(userRating);
      setIsFavorite(isFavorite);
    } catch (error) {
      console.error('Failed to load interactions:', error);
      if (error instanceof Error && error.message.includes('session has expired')) {
        navigate('/login');
      } else {
        toast.error('Failed to load recipe interactions');
      }
    }
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast.error('Please sign in to comment');
      return;
    }
    if (!newComment.trim()) return;

    setIsLoading(true);
    try {
      const comment = await addComment(recipeId, newComment);
      setComments([comment, ...comments]);
      setNewComment('');
      toast.success('Comment added successfully');
    } catch (error) {
      if (error instanceof Error) {
        if (error.message.includes('session has expired')) {
          await handleAuthError(error);
        } else if (error.message.includes('not found')) {
          toast.error('Recipe not found');
          navigate('/recipes');
        } else {
          console.error('Failed to add comment:', error);
          toast.error('Failed to add comment');
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleRating = async (rating: number) => {
    if (!user) {
      toast.error('Please sign in to rate');
      return;
    }

    try {
      await rateRecipe(recipeId, rating);
      setUserRating(rating);
      toast.success('Rating updated successfully');
    } catch (error) {
      if (error instanceof Error) {
        if (error.message.includes('session has expired')) {
          await handleAuthError(error);
        } else if (error.message.includes('not found')) {
          toast.error('Recipe not found');
          navigate('/recipes');
        } else {
          console.error('Failed to update rating:', error);
          toast.error('Failed to update rating');
        }
      }
    }
  };

  const handleFavorite = async () => {
    if (!user) {
      toast.error('Please sign in to favorite');
      return;
    }

    try {
      const newFavoriteStatus = await toggleFavorite(recipeId);
      setIsFavorite(newFavoriteStatus);
      toast.success(newFavoriteStatus ? 'Added to favorites' : 'Removed from favorites');
    } catch (error) {
      if (error instanceof Error) {
        if (error.message.includes('session has expired')) {
          await handleAuthError(error);
        } else if (error.message.includes('not found')) {
          toast.error('Recipe not found');
          navigate('/recipes');
        } else {
          console.error('Failed to update favorite status:', error);
          toast.error('Failed to update favorite status');
        }
      }
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-6">
        {/* Rating */}
        <div className="flex items-center gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              onClick={() => handleRating(star)}
              className="focus:outline-none"
              disabled={!user}
            >
              <Star
                className={`w-6 h-6 ${
                  star <= userRating
                    ? 'text-yellow-400 fill-current'
                    : 'text-gray-300'
                } ${!user ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}
              />
            </button>
          ))}
        </div>

        {/* Favorite */}
        <button
          onClick={handleFavorite}
          className={`flex items-center gap-2 transition-colors ${
            !user ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'
          } ${
            isFavorite ? 'text-red-500' : 'text-gray-600 hover:text-red-500'
          }`}
          disabled={!user}
        >
          <Heart className={isFavorite ? 'fill-current' : ''} />
          <span>{isFavorite ? 'Saved' : 'Save'}</span>
        </button>
      </div>
      

      {/* Comments Section */}
      <div>
        <h3 className="text-xl font-bold mb-4">Comments</h3>

        {/* Comment Form */}
        <form onSubmit={handleAddComment} className="mb-6">
          <div className="flex gap-2">
            <input
              type="text"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder={user ? "Add a comment..." : "Please sign in to comment"}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              disabled={!user || isLoading}
            />
            <button
              type="submit"
              disabled={!user || isLoading || !newComment.trim()}
              className="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </form>

        {/* Comments List */}
        <div className="space-y-4">
          {comments.map((comment) => (
            <div key={comment.id} className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                  {comment.user?.username?.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="font-medium">{comment.user?.username}</p>
                  <p className="text-sm text-gray-500">
                    {new Date(comment.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <p className="text-gray-700">{comment.content}</p>
            </div>
          ))}

          {comments.length === 0 && (
            <p className="text-center text-gray-500">No comments yet. Be the first to comment!</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default RecipeInteractions;
