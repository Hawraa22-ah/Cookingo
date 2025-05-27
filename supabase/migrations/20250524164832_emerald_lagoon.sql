/*
  # Add dishes table and policies

  1. New Tables
    - `dishes` table for storing available dishes
      - `id` (uuid, primary key)
      - `title` (text)
      - `description` (text)
      - `image_url` (text)
      - `price` (numeric)
      - `seller_id` (uuid, references profiles)
      - `available` (boolean)
      - `tags` (text[])
      - `status` (text)
      - `donation_amount` (numeric)
      - `orders` (integer)
      - `rating` (numeric)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on dishes table
    - Add policies for viewing, creating, updating, and deleting dishes
*/

-- Create dishes table if it doesn't exist
CREATE TABLE IF NOT EXISTS dishes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  image_url text,
  price numeric(10,2) NOT NULL,
  seller_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  available boolean DEFAULT true,
  tags text[] DEFAULT ARRAY[]::text[],
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  donation_amount numeric(10,2) DEFAULT 0,
  orders integer DEFAULT 0,
  rating numeric(3,2) DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE dishes ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Anyone can view dishes" ON dishes;
DROP POLICY IF EXISTS "Sellers can insert their own dishes" ON dishes;
DROP POLICY IF EXISTS "Sellers can update their own dishes" ON dishes;
DROP POLICY IF EXISTS "Sellers can delete their own dishes" ON dishes;

-- Create policies
CREATE POLICY "Anyone can view dishes"
ON dishes
FOR SELECT
TO public
USING (true);

CREATE POLICY "Sellers can insert their own dishes"
ON dishes
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'seller'::user_role
  )
  AND seller_id = auth.uid()
);

CREATE POLICY "Sellers can update their own dishes"
ON dishes
FOR UPDATE
TO authenticated
USING (seller_id = auth.uid())
WITH CHECK (seller_id = auth.uid());

CREATE POLICY "Sellers can delete their own dishes"
ON dishes
FOR DELETE
TO authenticated
USING (seller_id = auth.uid());

-- Create updated_at trigger
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger 
    WHERE tgname = 'update_dishes_updated_at'
  ) THEN
    CREATE TRIGGER update_dishes_updated_at
      BEFORE UPDATE ON dishes
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;

-- Insert sample dishes
INSERT INTO dishes (
  title,
  description,
  image_url,
  price,
  tags,
  status
) VALUES 
(
  'Homemade Pizza',
  'Fresh and delicious pizza made with premium ingredients',
  'https://images.pexels.com/photos/905847/pexels-photo-905847.jpeg',
  15.99,
  ARRAY['Italian', 'Pizza', 'Vegetarian'],
  'published'
),
(
  'Chicken Curry',
  'Aromatic curry with tender chicken pieces',
  'https://images.pexels.com/photos/2474661/pexels-photo-2474661.jpeg',
  12.99,
  ARRAY['Indian', 'Curry', 'Spicy'],
  'published'
),
(
  'Vegetable Stir Fry',
  'Healthy and colorful vegetable stir fry',
  'https://images.pexels.com/photos/1640774/pexels-photo-1640774.jpeg',
  10.99,
  ARRAY['Asian', 'Vegetarian', 'Healthy'],
  'published'
)
ON CONFLICT (id) DO NOTHING;