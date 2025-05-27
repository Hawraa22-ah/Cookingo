/*
  # Create recipes table and policies

  1. New Tables
    - `recipes`
      - `id` (uuid, primary key)
      - `title` (text)
      - `description` (text)
      - `image_url` (text)
      - `cook_time` (integer)
      - `prep_time` (integer, default: 15)
      - `servings` (integer, default: 4)
      - `difficulty` (text, default: 'Medium')
      - `chef_id` (uuid, references profiles)
      - `ingredients` (jsonb)
      - `instructions` (jsonb)
      - `tags` (text[])
      - `views` (integer, default: 0)
      - `likes` (integer, default: 0)
      - Timestamps: created_at, updated_at

  2. Security
    - Enable RLS
    - Policies for:
      - Public viewing
      - Chef-only creation
      - Owner-only updates
      - Owner-only deletion

  3. Initial Data
    - Sample recipe for testing
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

-- Safely drop existing policies
DO $$ 
BEGIN
    DROP POLICY IF EXISTS "Anyone can view recipes" ON recipes;
    DROP POLICY IF EXISTS "Chefs can insert their own recipes" ON recipes;
    DROP POLICY IF EXISTS "Chefs can update their own recipes" ON recipes;
    DROP POLICY IF EXISTS "Chefs can delete their own recipes" ON recipes;
EXCEPTION
    WHEN undefined_object THEN 
        NULL;
END $$;

-- Create policies
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'recipes' 
        AND policyname = 'Anyone can view recipes'
    ) THEN
        CREATE POLICY "Anyone can view recipes"
          ON recipes
          FOR SELECT
          TO public
          USING (true);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'recipes' 
        AND policyname = 'Chefs can insert their own recipes'
    ) THEN
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
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'recipes' 
        AND policyname = 'Chefs can update their own recipes'
    ) THEN
        CREATE POLICY "Chefs can update their own recipes"
          ON recipes
          FOR UPDATE
          TO authenticated
          USING (chef_id = auth.uid())
          WITH CHECK (chef_id = auth.uid());
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'recipes' 
        AND policyname = 'Chefs can delete their own recipes'
    ) THEN
        CREATE POLICY "Chefs can delete their own recipes"
          ON recipes
          FOR DELETE
          TO authenticated
          USING (chef_id = auth.uid());
    END IF;
END $$;

-- Seed initial recipe data if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM recipes 
        WHERE id = '223e4567-e89b-12d3-a456-426614174001'
    ) THEN
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
        ) VALUES (
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
    END IF;
END $$;