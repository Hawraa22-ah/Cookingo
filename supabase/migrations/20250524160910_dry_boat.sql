/*
  # Create orders and shopping list tables

  1. New Tables
    - `daily_dish_orders`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references profiles)
      - `dish_id` (uuid, references recipes)
      - `quantity` (integer)
      - `delivery_date` (date)
      - `delivery_time` (time)
      - `status` (text)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
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
    - Enable RLS on all tables
    - Add policies for user access control
*/

-- Create daily dish orders table
CREATE TABLE daily_dish_orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  dish_id uuid REFERENCES recipes(id) ON DELETE CASCADE NOT NULL,
  quantity integer NOT NULL CHECK (quantity > 0),
  delivery_date date NOT NULL,
  delivery_time time NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'completed', 'cancelled')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create shopping lists table
CREATE TABLE shopping_lists (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create shopping list items table
CREATE TABLE shopping_list_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  list_id uuid REFERENCES shopping_lists(id) ON DELETE CASCADE NOT NULL,
  ingredient text NOT NULL,
  amount text,
  unit text,
  checked boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE daily_dish_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE shopping_lists ENABLE ROW LEVEL SECURITY;
ALTER TABLE shopping_list_items ENABLE ROW LEVEL SECURITY;

-- Policies for daily_dish_orders
CREATE POLICY "Users can view own orders"
  ON daily_dish_orders
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can create orders"
  ON daily_dish_orders
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own orders"
  ON daily_dish_orders
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Policies for shopping_lists
CREATE POLICY "Users can view own shopping lists"
  ON shopping_lists
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can create shopping lists"
  ON shopping_lists
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

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

-- Policies for shopping_list_items
CREATE POLICY "Users can view own list items"
  ON shopping_list_items
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM shopping_lists
      WHERE shopping_lists.id = list_id
      AND shopping_lists.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create list items"
  ON shopping_list_items
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM shopping_lists
      WHERE shopping_lists.id = list_id
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
      WHERE shopping_lists.id = list_id
      AND shopping_lists.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM shopping_lists
      WHERE shopping_lists.id = list_id
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
      WHERE shopping_lists.id = list_id
      AND shopping_lists.user_id = auth.uid()
    )
  );

-- Create indexes for better performance
CREATE INDEX idx_daily_dish_orders_user ON daily_dish_orders(user_id);
CREATE INDEX idx_daily_dish_orders_dish ON daily_dish_orders(dish_id);
CREATE INDEX idx_daily_dish_orders_status ON daily_dish_orders(status);
CREATE INDEX idx_shopping_lists_user ON shopping_lists(user_id);
CREATE INDEX idx_shopping_list_items_list ON shopping_list_items(list_id);