/*
  # Add Shopping List Functionality

  1. New Tables
    - `shopping_lists`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references profiles)
      - `name` (text)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `shopping_list_items`
      - `id` (uuid, primary key)
      - `list_id` (uuid, references shopping_lists)
      - `ingredient` (text)
      - `amount` (text)
      - `unit` (text)
      - `checked` (boolean)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on both tables
    - Add policies for user access control
*/

-- Create shopping lists table
CREATE TABLE IF NOT EXISTS shopping_lists (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create shopping list items table
CREATE TABLE IF NOT EXISTS shopping_list_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  list_id uuid REFERENCES shopping_lists(id) ON DELETE CASCADE NOT NULL,
  ingredient text NOT NULL,
  amount text,
  unit text,
  checked boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE shopping_lists ENABLE ROW LEVEL SECURITY;
ALTER TABLE shopping_list_items ENABLE ROW LEVEL SECURITY;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_shopping_lists_user ON shopping_lists(user_id);
CREATE INDEX IF NOT EXISTS idx_shopping_list_items_list ON shopping_list_items(list_id);

-- Create updated_at trigger for shopping_lists
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger 
    WHERE tgname = 'update_shopping_lists_updated_at'
  ) THEN
    CREATE TRIGGER update_shopping_lists_updated_at
      BEFORE UPDATE ON shopping_lists
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can create shopping lists" ON shopping_lists;
DROP POLICY IF EXISTS "Users can view own shopping lists" ON shopping_lists;
DROP POLICY IF EXISTS "Users can update own shopping lists" ON shopping_lists;
DROP POLICY IF EXISTS "Users can delete own shopping lists" ON shopping_lists;

DROP POLICY IF EXISTS "Users can create list items" ON shopping_list_items;
DROP POLICY IF EXISTS "Users can view own list items" ON shopping_list_items;
DROP POLICY IF EXISTS "Users can update own list items" ON shopping_list_items;
DROP POLICY IF EXISTS "Users can delete own list items" ON shopping_list_items;

-- Create policies for shopping_lists
CREATE POLICY "Users can create shopping lists"
ON shopping_lists
FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can view own shopping lists"
ON shopping_lists
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Users can update own shopping lists"
ON shopping_lists
FOR UPDATE
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete own shopping lists"
ON shopping_lists
FOR DELETE
TO authenticated
USING (user_id = auth.uid());

-- Create policies for shopping_list_items
CREATE POLICY "Users can create list items"
ON shopping_list_items
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM shopping_lists
    WHERE shopping_lists.id = shopping_list_items.list_id
    AND shopping_lists.user_id = auth.uid()
  )
);

CREATE POLICY "Users can view own list items"
ON shopping_list_items
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM shopping_lists
    WHERE shopping_lists.id = shopping_list_items.list_id
    AND shopping_lists.user_id = auth.uid()
  )
);

CREATE POLICY "Users can update own list items"
ON shopping_list_items
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM shopping_lists
    WHERE shopping_lists.id = shopping_list_items.list_id
    AND shopping_lists.user_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM shopping_lists
    WHERE shopping_lists.id = shopping_list_items.list_id
    AND shopping_lists.user_id = auth.uid()
  )
);

CREATE POLICY "Users can delete own list items"
ON shopping_list_items
FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM shopping_lists
    WHERE shopping_lists.id = shopping_list_items.list_id
    AND shopping_lists.user_id = auth.uid()
  )
);