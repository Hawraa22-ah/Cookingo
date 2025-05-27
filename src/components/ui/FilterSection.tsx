import React from 'react';
import { Sliders } from 'lucide-react';

interface FilterSectionProps {
  difficulty: string | null;
  cookingTime: number | null;
  servings: number | null;
  onDifficultyChange: (difficulty: string | null) => void;
  onCookingTimeChange: (time: number | null) => void;
  onServingsChange: (servings: number | null) => void;
}

const FilterSection: React.FC<FilterSectionProps> = ({
  difficulty,
  cookingTime,
  servings,
  onDifficultyChange,
  onCookingTimeChange,
  onServingsChange,
}) => {
  const difficulties = ['Easy', 'Medium', 'Hard'];
  const cookingTimes = [30, 60, 90, 120];
  const servingSizes = [2, 4, 6, 8];

  return (
    <div className="mb-8 bg-white p-6 rounded-lg shadow-sm">
      <div className="flex items-center gap-2 mb-4">
        <Sliders className="w-5 h-5 text-orange-500" />
        <h3 className="text-lg font-medium text-gray-800">Filters</h3>
      </div>

      <div className="space-y-6">
        {/* Difficulty Filter */}
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-2">Difficulty Level</h4>
          <div className="flex flex-wrap gap-2">
            {difficulties.map((level) => (
              <button
                key={level}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  difficulty === level
                    ? 'bg-orange-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
                onClick={() => onDifficultyChange(difficulty === level ? null : level)}
              >
                {level}
              </button>
            ))}
          </div>
        </div>

        {/* Cooking Time Filter */}
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-2">Total Time</h4>
          <div className="flex flex-wrap gap-2">
            {cookingTimes.map((time) => (
              <button
                key={time}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  cookingTime === time
                    ? 'bg-orange-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
                onClick={() => onCookingTimeChange(cookingTime === time ? null : time)}
              >
                ≤ {time} min
              </button>
            ))}
          </div>
        </div>

        {/* Servings Filter */}
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-2">Servings</h4>
          <div className="flex flex-wrap gap-2">
            {servingSizes.map((size) => (
              <button
                key={size}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  servings === size
                    ? 'bg-orange-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
                onClick={() => onServingsChange(servings === size ? null : size)}
              >
                {size} people
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FilterSection;