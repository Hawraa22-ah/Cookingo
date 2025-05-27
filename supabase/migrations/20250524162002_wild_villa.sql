/*
  # Fix daily dish orders foreign key reference

  1. Changes
    - Drop existing foreign key constraint that incorrectly references recipes table
    - Add new foreign key constraint to reference dishes table instead
    - Update RLS policies to match the correct table relationships

  2. Security
    - Maintain existing RLS enabled status
    - Update policies to properly check dish ownership through dishes table
*/

-- First drop the existing foreign key that points to recipes
ALTER TABLE daily_dish_orders
DROP CONSTRAINT daily_dish_orders_dish_id_fkey;

-- Add the correct foreign key constraint to reference dishes
ALTER TABLE daily_dish_orders
ADD CONSTRAINT daily_dish_orders_dish_id_fkey
FOREIGN KEY (dish_id) REFERENCES dishes(id) ON DELETE CASCADE;

-- Drop existing policies
DROP POLICY IF EXISTS "Users can create orders" ON daily_dish_orders;
DROP POLICY IF EXISTS "Users can update own orders" ON daily_dish_orders;
DROP POLICY IF EXISTS "Users can view own orders" ON daily_dish_orders;

-- Create updated policies with correct table references
CREATE POLICY "Users can create orders"
ON daily_dish_orders
FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() = user_id
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