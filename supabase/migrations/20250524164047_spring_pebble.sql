/*
  # Fix daily dish orders table and relationships
  
  1. Changes
    - Drop existing policies to avoid conflicts
    - Ensure correct foreign key relationship with dishes table
    - Create updated policies with proper permissions
  
  2. Security
    - Enable RLS on daily_dish_orders table
    - Add policies for users to manage their orders
    - Add policies for sellers to view orders for their dishes
*/

-- Drop all existing policies first
DROP POLICY IF EXISTS "Users can create orders" ON daily_dish_orders;
DROP POLICY IF EXISTS "Users can view own orders" ON daily_dish_orders;
DROP POLICY IF EXISTS "Users can update own orders" ON daily_dish_orders;
DROP POLICY IF EXISTS "Sellers can view orders for their dishes" ON daily_dish_orders;

-- Drop and recreate the foreign key to ensure it's correct
ALTER TABLE daily_dish_orders
DROP CONSTRAINT IF EXISTS daily_dish_orders_dish_id_fkey;

ALTER TABLE daily_dish_orders
ADD CONSTRAINT daily_dish_orders_dish_id_fkey
FOREIGN KEY (dish_id) REFERENCES dishes(id) ON DELETE CASCADE;

-- Enable RLS
ALTER TABLE daily_dish_orders ENABLE ROW LEVEL SECURITY;

-- Create new policies
CREATE POLICY "Users can create orders"
ON daily_dish_orders
FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() = user_id
);

CREATE POLICY "Users can view own orders"
ON daily_dish_orders
FOR SELECT
TO authenticated
USING (
  auth.uid() = user_id OR
  EXISTS (
    SELECT 1 FROM dishes
    WHERE dishes.id = daily_dish_orders.dish_id
    AND dishes.seller_id = auth.uid()
  )
);

CREATE POLICY "Users can update own orders"
ON daily_dish_orders
FOR UPDATE
TO authenticated
USING (
  auth.uid() = user_id OR
  EXISTS (
    SELECT 1 FROM dishes
    WHERE dishes.id = daily_dish_orders.dish_id
    AND dishes.seller_id = auth.uid()
  )
)
WITH CHECK (
  auth.uid() = user_id OR
  EXISTS (
    SELECT 1 FROM dishes
    WHERE dishes.id = daily_dish_orders.dish_id
    AND dishes.seller_id = auth.uid()
  )
);