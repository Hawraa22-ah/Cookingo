/*
  # Update recipes table schema and policies

  1. Changes
    - Drops existing policies if they exist
    - Creates recipes table if it doesn't exist
    - Adds RLS policies for viewing and managing recipes
    - Adds trigger for updating timestamps

  2. Security
    - Enables RLS on recipes table
    - Adds policy for public viewing of published recipes
    - Adds policy for chef management of their own recipes
*/

-- Drop existing policies if they exist
DO $$ BEGIN
  DROP POLICY IF EXISTS "Anyone can view published recipes" ON recipes;
  DROP POLICY IF EXISTS "Chefs can manage their own recipes" ON recipes;
EXCEPTION
  WHEN undefined_table THEN
    NULL;
END $$;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS update_recipes_updated_at ON recipes;

-- Create recipes table if it doesn't exist
CREATE TABLE IF NOT EXISTS recipes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  image_url text,
  cook_time integer,
  prep_time integer,
  servings integer,
  difficulty text CHECK (difficulty IN ('Easy', 'Medium', 'Hard')),
  chef_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  ingredients jsonb NOT NULL DEFAULT '[]'::jsonb,
  instructions jsonb NOT NULL DEFAULT '[]'::jsonb,
  tags text[] DEFAULT ARRAY[]::text[],
  publication_status text NOT NULL DEFAULT 'draft' CHECK (publication_status IN ('draft', 'published', 'archived')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE recipes ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Anyone can view published recipes" ON recipes
  FOR SELECT
  TO public
  USING (publication_status = 'published');

CREATE POLICY "Chefs can manage their own recipes" ON recipes
  FOR ALL
  TO authenticated
  USING (
    chef_id = auth.uid() AND 
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND role = 'chef'
    )
  )
  WITH CHECK (
    chef_id = auth.uid() AND 
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND role = 'chef'
    )
  );

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_recipes_updated_at
  BEFORE UPDATE ON recipes
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();