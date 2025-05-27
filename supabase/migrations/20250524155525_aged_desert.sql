/*
  # Create recipes table and policies

  1. New Tables
    - recipes
      - id (uuid, primary key)
      - title (text)
      - description (text)
      - image_url (text)
      - cook_time (integer)
      - prep_time (integer, default: 15)
      - servings (integer, default: 4)
      - difficulty (text, default: 'Medium')
      - chef_id (uuid, references profiles)
      - ingredients (jsonb)
      - instructions (jsonb)
      - tags (text[])
      - views (integer)
      - likes (integer)
      - created_at (timestamptz)
      - updated_at (timestamptz)

  2. Security
    - Enable RLS
    - Add policies for viewing, creating, updating, and deleting recipes

  3. Data
    - Seed initial recipe data
*/

-- Create recipes table if it doesn't exist
CREATE TABLE IF NOT EXISTS recipes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  image_url text,
  cook_time integer,
  prep_time integer DEFAULT 15,
  servings integer DEFAULT 4,
  difficulty text DEFAULT 'Medium',
  chef_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  ingredients jsonb NOT NULL DEFAULT '[]'::jsonb,
  instructions jsonb NOT NULL DEFAULT '[]'::jsonb,
  tags text[] DEFAULT ARRAY[]::text[],
  views integer DEFAULT 0,
  likes integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE recipes ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DO $$ BEGIN
  DROP POLICY IF EXISTS "Anyone can view recipes" ON recipes;
  DROP POLICY IF EXISTS "Chefs can insert their own recipes" ON recipes;
  DROP POLICY IF EXISTS "Chefs can update their own recipes" ON recipes;
  DROP POLICY IF EXISTS "Chefs can delete their own recipes" ON recipes;
END $$;

-- Create policies
CREATE POLICY "Anyone can view recipes"
  ON recipes
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Chefs can insert their own recipes"
  ON recipes
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'chef'::user_role
    )
    AND chef_id = auth.uid()
  );

CREATE POLICY "Chefs can update their own recipes"
  ON recipes
  FOR UPDATE
  TO authenticated
  USING (chef_id = auth.uid())
  WITH CHECK (chef_id = auth.uid());

CREATE POLICY "Chefs can delete their own recipes"
  ON recipes
  FOR DELETE
  TO authenticated
  USING (chef_id = auth.uid());

-- Seed initial recipe data
INSERT INTO recipes (
  id,
  title,
  description,
  image_url,
  cook_time,
  chef_id,
  ingredients,
  instructions,
  tags
) VALUES
(
  '223e4567-e89b-12d3-a456-426614174001',
  'Spaghetti Carbonara',
  'Creamy Italian pasta dish with eggs, cheese, pancetta, and black pepper',
  'https://images.pexels.com/photos/1527603/pexels-photo-1527603.jpeg',
  25,
  (SELECT id FROM profiles WHERE role = 'chef' LIMIT 1),
  '[
    {"name": "Spaghetti", "amount": "400", "unit": "g"},
    {"name": "Eggs", "amount": "3", "unit": "whole"},
    {"name": "Pecorino Romano", "amount": "100", "unit": "g"},
    {"name": "Pancetta", "amount": "150", "unit": "g"},
    {"name": "Black Pepper", "amount": "2", "unit": "tsp"}
  ]'::jsonb,
  '[
    {"step": 1, "text": "Cook pasta in salted water"},
    {"step": 2, "text": "Prepare egg and cheese mixture"},
    {"step": 3, "text": "Cook pancetta until crispy"},
    {"step": 4, "text": "Combine all ingredients"}
  ]'::jsonb,
  ARRAY['Italian', 'Pasta', 'Quick']
);