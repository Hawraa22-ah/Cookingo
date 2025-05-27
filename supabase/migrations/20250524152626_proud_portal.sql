/*
  # Add Recipe Interactions

  1. New Tables
    - `recipe_comments`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references user_profiles)
      - `recipe_id` (uuid, references recipes)
      - `content` (text)
      - `created_at` (timestamp)
    
    - `recipe_ratings`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references user_profiles)
      - `recipe_id` (uuid, references recipes)
      - `rating` (integer, 1-5)
      - `created_at` (timestamp)
    
    - `favorite_recipes`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references user_profiles)
      - `recipe_id` (uuid, references recipes)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users
*/

-- Recipe Comments
CREATE TABLE recipe_comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES user_profiles ON DELETE CASCADE NOT NULL,
  recipe_id uuid REFERENCES recipes ON DELETE CASCADE NOT NULL,
  content text NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE recipe_comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view all comments"
  ON recipe_comments
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can create comments"
  ON recipe_comments
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own comments"
  ON recipe_comments
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own comments"
  ON recipe_comments
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Recipe Ratings
CREATE TABLE recipe_ratings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES user_profiles ON DELETE CASCADE NOT NULL,
  recipe_id uuid REFERENCES recipes ON DELETE CASCADE NOT NULL,
  rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, recipe_id)
);

ALTER TABLE recipe_ratings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view all ratings"
  ON recipe_ratings
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can create ratings"
  ON recipe_ratings
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own ratings"
  ON recipe_ratings
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Favorite Recipes
CREATE TABLE favorite_recipes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES user_profiles ON DELETE CASCADE NOT NULL,
  recipe_id uuid REFERENCES recipes ON DELETE CASCADE NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, recipe_id)
);

ALTER TABLE favorite_recipes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own favorites"
  ON favorite_recipes
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create favorites"
  ON favorite_recipes
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own favorites"
  ON favorite_recipes
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX idx_recipe_comments_recipe ON recipe_comments(recipe_id);
CREATE INDEX idx_recipe_comments_user ON recipe_comments(user_id);
CREATE INDEX idx_recipe_ratings_recipe ON recipe_ratings(recipe_id);
CREATE INDEX idx_recipe_ratings_user ON recipe_ratings(user_id);
CREATE INDEX idx_favorite_recipes_recipe ON favorite_recipes(recipe_id);
CREATE INDEX idx_favorite_recipes_user ON favorite_recipes(user_id);