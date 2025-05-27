/*
  # Update Recipe Management System

  1. Changes
    - Add 'chef' role to user_role enum if not exists
    - Alter existing recipes table with new columns and constraints
    - Add RLS policies for recipe management
    - Create necessary indexes and triggers
    
  2. Security
    - Enable RLS on recipes table
    - Add policies for public viewing and chef management
*/

-- Check and update user_role enum
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_type 
    WHERE typname = 'user_role' 
    AND 'chef' = ANY(enum_range(NULL::user_role)::text[])
  ) THEN
    ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'chef';
  END IF;
END $$;

-- Add new columns to recipes table
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'recipes' AND column_name = 'publication_status'
  ) THEN
    ALTER TABLE recipes 
    ADD COLUMN publication_status text DEFAULT 'draft',
    ADD COLUMN cuisine text,
    ADD COLUMN difficulty text,
    ADD COLUMN servings integer,
    ADD COLUMN prep_time integer,
    ADD CONSTRAINT valid_recipe_status CHECK (publication_status IN ('draft', 'published', 'archived')),
    ADD CONSTRAINT valid_recipe_difficulty CHECK (difficulty IN ('Easy', 'Medium', 'Hard'));
  END IF;
END $$;

-- Enable RLS if not already enabled
ALTER TABLE recipes ENABLE ROW LEVEL SECURITY;

-- Create indexes if they don't exist
CREATE INDEX IF NOT EXISTS idx_recipes_chef_id ON recipes(chef_id);
CREATE INDEX IF NOT EXISTS idx_recipes_publication_status ON recipes(publication_status);
CREATE INDEX IF NOT EXISTS idx_recipes_tags ON recipes USING gin(tags);

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Anyone can view published recipes" ON recipes;
DROP POLICY IF EXISTS "Chefs can manage their own recipes" ON recipes;

-- Create new policies
CREATE POLICY "Anyone can view published recipes"
ON recipes
FOR SELECT
TO public
USING (publication_status = 'published');

CREATE POLICY "Chefs can manage their own recipes"
ON recipes
FOR ALL
TO authenticated
USING (
  chef_id = auth.uid() AND
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'chef'::user_role
  )
)
WITH CHECK (
  chef_id = auth.uid() AND
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'chef'::user_role
  )
);

-- Create updated_at trigger if it doesn't exist
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger 
    WHERE tgname = 'update_recipes_updated_at'
  ) THEN
    CREATE TRIGGER update_recipes_updated_at
      BEFORE UPDATE ON recipes
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;

-- Create or replace view count function
CREATE OR REPLACE FUNCTION increment_recipe_views()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE recipes
  SET views = views + 1
  WHERE id = NEW.recipe_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;