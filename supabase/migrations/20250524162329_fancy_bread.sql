/*
  # Fix daily dish orders policies

  1. Changes
    - Drop all existing policies
    - Ensure foreign key relationship exists
    - Recreate policies with proper permissions
*/

-- Drop all existing policies first
DROP POLICY IF EXISTS "Users can create orders" ON daily_dish_orders;
DROP POLICY IF EXISTS "Users can view own orders" ON daily_dish_orders;
DROP POLICY IF EXISTS "Users can update own orders" ON daily_dish_orders;
DROP POLICY IF EXISTS "Sellers can view orders for their dishes" ON daily_dish_orders;

-- First ensure the foreign key relationship exists
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'daily_dish_orders_dish_id_fkey'
  ) THEN
    ALTER TABLE daily_dish_orders
    ADD CONSTRAINT daily_dish_orders_dish_id_fkey
    FOREIGN KEY (dish_id) REFERENCES dishes(id) ON DELETE CASCADE;
  END IF;
END $$;

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