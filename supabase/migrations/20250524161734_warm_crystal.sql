/*
  # Daily Dish Orders Schema

  1. New Tables
    - `daily_dish_orders`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references profiles)
      - `dish_id` (uuid, references recipes)
      - `quantity` (integer)
      - `delivery_date` (date)
      - `delivery_time` (time)
      - `status` (text)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS
    - Add policies for order management
    - Add indexes for performance

  3. Changes
    - Add trigger for updated_at
*/

-- Create daily dish orders table if it doesn't exist
DO $$ BEGIN
  CREATE TABLE IF NOT EXISTS daily_dish_orders (
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
END $$;

-- Enable RLS if not already enabled
ALTER TABLE daily_dish_orders ENABLE ROW LEVEL SECURITY;

-- Create indexes if they don't exist
CREATE INDEX IF NOT EXISTS idx_daily_dish_orders_user ON daily_dish_orders(user_id);
CREATE INDEX IF NOT EXISTS idx_daily_dish_orders_dish ON daily_dish_orders(dish_id);
CREATE INDEX IF NOT EXISTS idx_daily_dish_orders_status ON daily_dish_orders(status);

-- Drop existing policies if they exist
DO $$ BEGIN
  DROP POLICY IF EXISTS "Users can create orders" ON daily_dish_orders;
  DROP POLICY IF EXISTS "Users can view own orders" ON daily_dish_orders;
  DROP POLICY IF EXISTS "Users can update own orders" ON daily_dish_orders;
END $$;

-- Create policies
CREATE POLICY "Users can create orders"
ON daily_dish_orders
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own orders"
ON daily_dish_orders
FOR SELECT
TO authenticated
USING (
  auth.uid() = user_id OR
  EXISTS (
    SELECT 1 FROM recipes
    WHERE recipes.id = daily_dish_orders.dish_id
    AND recipes.chef_id = auth.uid()
  )
);

CREATE POLICY "Users can update own orders"
ON daily_dish_orders
FOR UPDATE
TO authenticated
USING (
  auth.uid() = user_id OR
  EXISTS (
    SELECT 1 FROM recipes
    WHERE recipes.id = daily_dish_orders.dish_id
    AND recipes.chef_id = auth.uid()
  )
)
WITH CHECK (
  auth.uid() = user_id OR
  EXISTS (
    SELECT 1 FROM recipes
    WHERE recipes.id = daily_dish_orders.dish_id
    AND recipes.chef_id = auth.uid()
  )
);

-- Create updated_at trigger if it doesn't exist
DO $$ BEGIN
  CREATE OR REPLACE TRIGGER update_daily_dish_orders_updated_at
    BEFORE UPDATE ON daily_dish_orders
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
END $$;