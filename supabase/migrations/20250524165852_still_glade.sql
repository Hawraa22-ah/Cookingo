/*
  # Cart Items Schema

  1. New Tables
    - `cart_items`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references profiles)
      - `product_id` (uuid, references kitchen_products)
      - `quantity` (integer)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS
    - Add policies for CRUD operations
    - Ensure users can only access their own cart items

  3. Constraints
    - Unique constraint on user_id and product_id
    - Check constraint on quantity > 0
*/

-- Create cart items table if it doesn't exist
DO $$ BEGIN
  CREATE TABLE IF NOT EXISTS cart_items (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
    product_id uuid REFERENCES kitchen_products(id) ON DELETE CASCADE,
    quantity integer NOT NULL CHECK (quantity > 0),
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
  );
EXCEPTION
  WHEN duplicate_table THEN NULL;
END $$;

-- Add unique constraint if it doesn't exist
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 
    FROM pg_constraint 
    WHERE conname = 'cart_items_user_id_product_id_key'
  ) THEN
    ALTER TABLE cart_items
    ADD CONSTRAINT cart_items_user_id_product_id_key
    UNIQUE (user_id, product_id);
  END IF;
EXCEPTION
  WHEN others THEN NULL;
END $$;

-- Enable RLS
ALTER TABLE cart_items ENABLE ROW LEVEL SECURITY;

-- Create policies if they don't exist
DO $$ BEGIN
  CREATE POLICY "cart_items_select_policy"
  ON cart_items
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "cart_items_insert_policy"
  ON cart_items
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "cart_items_update_policy"
  ON cart_items
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "cart_items_delete_policy"
  ON cart_items
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- Create triggers if they don't exist
DO $$ BEGIN
  CREATE TRIGGER update_cart_items_updated_at
    BEFORE UPDATE ON cart_items
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TRIGGER on_order_insert
    AFTER INSERT ON cart_items
    FOR EACH ROW
    EXECUTE FUNCTION increment_dish_orders();
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;