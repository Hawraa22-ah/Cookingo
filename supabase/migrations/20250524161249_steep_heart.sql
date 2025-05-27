/*
  # Update recipes table and policies

  1. Changes
    - Add missing columns and constraints to recipes table
    - Update indexes for better performance
    - Add sample recipe data
  
  2. Security
    - Ensure RLS is enabled
    - Update policies for proper access control
*/

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Anyone can view recipes" ON recipes;
DROP POLICY IF EXISTS "Chefs can insert their own recipes" ON recipes;
DROP POLICY IF EXISTS "Chefs can update their own recipes" ON recipes;
DROP POLICY IF EXISTS "Chefs can delete their own recipes" ON recipes;

-- Update recipes table
CREATE TABLE IF NOT EXISTS recipes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  image_url text,
  cook_time integer,
  chef_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  ingredients jsonb NOT NULL DEFAULT '[]'::jsonb,
  instructions jsonb NOT NULL DEFAULT '[]'::jsonb,
  tags text[] DEFAULT ARRAY[]::text[],
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  views integer DEFAULT 0,
  likes integer DEFAULT 0
);

-- Enable Row Level Security
ALTER TABLE recipes ENABLE ROW LEVEL SECURITY;

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

-- Create updated_at trigger
DO $$ BEGIN
  CREATE TRIGGER update_recipes_updated_at
    BEFORE UPDATE ON recipes
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- Create indexes for better performance
DROP INDEX IF EXISTS idx_recipes_chef;
DROP INDEX IF EXISTS idx_recipes_tags;
CREATE INDEX idx_recipes_chef ON recipes(chef_id);
CREATE INDEX idx_recipes_tags ON recipes USING gin(tags);

-- Insert sample recipe for testing
INSERT INTO recipes (
  id,
  title,
  description,
  image_url,
  cook_time,
  ingredients,
  instructions,
  tags
) VALUES (
  '323e4567-e89b-12d3-a456-426614174002',
  'Sample Recipe',
  'A delicious sample recipe',
  'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg',
  30,
  '[{"name": "Ingredient 1", "amount": "1", "unit": "cup"}, {"name": "Ingredient 2", "amount": "2", "unit": "tbsp"}]'::jsonb,
  '[{"step": 1, "text": "First step"}, {"step": 2, "text": "Second step"}]'::jsonb,
  ARRAY['sample', 'test']
)
ON CONFLICT (id) DO NOTHING;