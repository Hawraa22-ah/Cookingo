  /*
  # Create dishes table and policies

  1. New Tables
    - dishes
      - id (uuid, primary key)
      - title (text, required)
      - description (text)
      - image_url (text)
      - price (numeric, required)
      - chef_id (uuid, foreign key to profiles)
      - available (boolean)
      - tags (text array)
      - status (text, enum: draft/published/archived)
      - orders (integer)
      - rating (numeric)
      - created_at (timestamp)
      - updated_at (timestamp)

  2. Security
    - Enable RLS
    - Public can view all dishes
    - Chefs can manage their own dishes
*/

-- Create dishes table
CREATE TABLE IF NOT EXISTS dishes (
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
ALTER TABLE dishes ENABLE ROW LEVEL SECURITY;

-- Create policies
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

-- Create updated_at trigger
CREATE TRIGGER update_dishes_updated_at
  BEFORE UPDATE ON dishes
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();