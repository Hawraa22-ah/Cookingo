import React from 'react';
import { Star } from 'lucide-react';
import { Review } from '../../types';
import { formatDate } from '../../utils/helpers';

interface RecipeReviewsProps {
  reviews: Review[];
}

const RecipeReviews: React.FC<RecipeReviewsProps> = ({ reviews }) => {
  if (reviews.length === 0) {
    return (
      <div className="text-center py-8 bg-gray-50 rounded-lg">
        <p className="text-gray-500">No reviews yet. Be the first to review this recipe!</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {reviews.map((review) => (
        <div key={review.id} className="border-b border-gray-200 pb-6 last:border-b-0">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-orange-100 text-orange-800 rounded-full flex items-center justify-center font-medium">
                {review.author.charAt(0).toUpperCase()}
              </div>
              <div className="ml-3">
                <div className="font-medium text-gray-800">{review.author}</div>
                <div className="text-sm text-gray-500">{formatDate(review.date)}</div>
              </div>
            </div>
            <div className="flex items-center">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`w-4 h-4 ${
                    i < review.rating
                      ? 'text-yellow-400 fill-current'
                      : 'text-gray-300'
                  }`}
                />
              ))}
            </div>
          </div>
          <p className="text-gray-600">{review.comment}</p>
        </div>
      ))}
    </div>
  );
};

export default RecipeReviews;