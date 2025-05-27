/*
  # Fix RLS policies for daily dish orders

  1. Changes
    - Drop existing RLS policies for daily_dish_orders table
    - Create new policies that properly handle order creation and management
    
  2. Security
    - Enable RLS on daily_dish_orders table
    - Add policies for:
      - Users can create their own orders
      - Users can view their own orders
      - Sellers can view orders for their dishes
      - Users can update their own orders (status changes)
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Users can create orders" ON daily_dish_orders;
DROP POLICY IF EXISTS "Users can update own orders" ON daily_dish_orders;
DROP POLICY IF EXISTS "Users can view own orders" ON daily_dish_orders;

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