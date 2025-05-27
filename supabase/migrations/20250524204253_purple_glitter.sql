/*
  # Update dishes table schema and policies

  1. Changes
    - Rename seller_id to chef_id
    - Update policies to work with chefs instead of sellers
    - Set default values for numeric columns

  2. Security
    - Enable RLS
    - Update policies for chef access
*/

-- Drop existing policies
DO $$ 
BEGIN
  DROP POLICY IF EXISTS "Anyone can view dishes" ON dishes;
  DROP POLICY IF EXISTS "Sellers can insert their own dishes" ON dishes;
  DROP POLICY IF EXISTS "Sellers can update their own dishes" ON dishes;
  DROP POLICY IF EXISTS "Sellers can delete their own dishes" ON dishes;
EXCEPTION
  WHEN undefined_object THEN NULL;
END $$;

-- Rename seller_id to chef_id
DO $$
BEGIN
  ALTER TABLE dishes RENAME COLUMN seller_id TO chef_id;
EXCEPTION
  WHEN undefined_column THEN NULL;
END $$;

-- Update dishes table
ALTER TABLE dishes 
  ALTER COLUMN price SET NOT NULL,
  ALTER COLUMN available SET DEFAULT true,
  ALTER COLUMN orders SET DEFAULT 0,
  ALTER COLUMN rating SET DEFAULT 0;

-- Create new policies
CREATE POLICY "Anyone can view dishes"
  ON dishes
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Chefs can insert their own dishes"
  ON dishes
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND role = 'chef'
    )
    AND chef_id = auth.uid()
  );

CREATE POLICY "Chefs can update their own dishes"
  ON dishes
  FOR UPDATE
  TO authenticated
  USING (chef_id = auth.uid())
  WITH CHECK (chef_id = auth.uid());

CREATE POLICY "Chefs can delete their own dishes"
  ON dishes
  FOR DELETE
  TO authenticated
  USING (chef_id = auth.uid());