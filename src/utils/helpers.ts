/**
 * Calculate the average rating from an array of ratings
 */
export const calculateAverageRating = (ratings: number[] | undefined | null): number => {
  if (!Array.isArray(ratings) || ratings.length === 0) return 0;
  const sum = ratings.reduce((acc, rating) => acc + rating, 0);
  return Math.round((sum / ratings.length) * 10) / 10;
};

/**
 * Format minutes into a readable time string
 */
export const formatTime = (minutes: number): string => {
  if (minutes < 60) return `${minutes} min`;
  
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  
  if (mins === 0) return `${hours} hr`;
  return `${hours} hr ${mins} min`;
};

/**
 * Format date string to a more readable format
 */
export const formatDate = (dateString: string): string => {
  const options: Intl.DateTimeFormatOptions = { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  };
  return new Date(dateString).toLocaleDateString(undefined, options);
};

/**
 * Generate a unique ID
 */
export const generateId = (): string => {
  return Math.random().toString(36).substring(2, 15);
};

/**
 * Get all unique tags from recipes
 */
export const getAllTags = (recipes: any[]): string[] => {
  const tagsSet = new Set<string>();
  
  recipes.forEach(recipe => {
    recipe.tags.forEach((tag: string) => {
      tagsSet.add(tag);
    });
  });
  
  return Array.from(tagsSet).sort();
};

/**
 * Truncate a string to a specific length and add ellipsis
 */
export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};