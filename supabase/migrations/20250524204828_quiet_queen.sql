/*
  # Fix chef tables and policies

  1. Changes
    - Drop and recreate recipes table with proper chef_id reference
    - Drop and recreate dishes table with proper chef_id reference
    - Update policies to properly handle chef permissions
    
  2. Security
    - Enable RLS on both tables
    - Add policies for public viewing and chef management
*/

-- First, drop existing tables and their dependencies
DROP TABLE IF EXISTS recipes CASCADE;
DROP TABLE IF EXISTS dishes CASCADE;

-- Create recipes table
CREATE TABLE recipes (
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

-- Create dishes table
CREATE TABLE dishes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  image_url text,
  price numeric(10,2) NOT NULL,
  chef_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  available boolean DEFAULT true,
  tags text[] DEFAULT ARRAY[]::text[],
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  orders integer DEFAULT 0,
  rating numeric(3,2) DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE recipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE dishes ENABLE ROW LEVEL SECURITY;

-- Create policies for recipes
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

-- Create policies for dishes
CREATE POLICY "Anyone can view dishes" ON dishes
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Chefs can manage their own dishes" ON dishes
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

-- Create updated_at trigger function if it doesn't exist
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_recipes_updated_at
  BEFORE UPDATE ON recipes
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_dishes_updated_at
  BEFORE UPDATE ON dishes
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();