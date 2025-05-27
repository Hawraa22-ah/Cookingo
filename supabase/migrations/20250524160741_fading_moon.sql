/*
  # Seed recipes data

  1. Data Changes
    - Seeds initial recipes data into the recipes table
    - Includes test recipe with ID '123e4567-e89b-12d3-a456-426614174000'
    - Sets up basic recipe data with required fields

  2. Security
    - No changes to security policies
    - Uses existing RLS policies
*/

-- Insert test recipe and some sample recipes
INSERT INTO recipes (
  id,
  title,
  description,
  cook_time,
  ingredients,
  instructions,
  tags
) VALUES (
  '123e4567-e89b-12d3-a456-426614174000',
  'Classic Margherita Pizza',
  'A traditional Neapolitan pizza with fresh ingredients',
  30,
  '[
    {"item": "Pizza Dough", "amount": "1", "unit": "ball"},
    {"item": "Tomato Sauce", "amount": "1/2", "unit": "cup"},
    {"item": "Fresh Mozzarella", "amount": "200", "unit": "g"},
    {"item": "Fresh Basil", "amount": "10", "unit": "leaves"},
    {"item": "Olive Oil", "amount": "2", "unit": "tbsp"}
  ]'::jsonb,
  '[
    "Preheat oven to 450°F (230°C)",
    "Roll out the pizza dough",
    "Spread tomato sauce evenly",
    "Add torn mozzarella pieces",
    "Bake for 12-15 minutes",
    "Add fresh basil leaves and drizzle with olive oil"
  ]'::jsonb,
  ARRAY['italian', 'pizza', 'vegetarian']
) ON CONFLICT (id) DO NOTHING;

-- Insert additional sample recipes
INSERT INTO recipes (
  title,
  description,
  cook_time,
  ingredients,
  instructions,
  tags
) VALUES (
  'Spaghetti Carbonara',
  'Classic Roman pasta dish with eggs and pancetta',
  25,
  '[
    {"item": "Spaghetti", "amount": "400", "unit": "g"},
    {"item": "Pancetta", "amount": "150", "unit": "g"},
    {"item": "Eggs", "amount": "3", "unit": "whole"},
    {"item": "Pecorino Romano", "amount": "100", "unit": "g"},
    {"item": "Black Pepper", "amount": "2", "unit": "tsp"}
  ]'::jsonb,
  '[
    "Cook pasta in salted water",
    "Crisp pancetta in a pan",
    "Mix eggs with grated cheese",
    "Combine hot pasta with egg mixture",
    "Add pancetta and black pepper"
  ]'::jsonb,
  ARRAY['italian', 'pasta']
),
(
  'Chicken Tikka Masala',
  'Creamy and aromatic Indian curry',
  45,
  '[
    {"item": "Chicken Breast", "amount": "600", "unit": "g"},
    {"item": "Yogurt", "amount": "200", "unit": "ml"},
    {"item": "Tomato Sauce", "amount": "400", "unit": "ml"},
    {"item": "Heavy Cream", "amount": "200", "unit": "ml"},
    {"item": "Garam Masala", "amount": "2", "unit": "tbsp"}
  ]'::jsonb,
  '[
    "Marinate chicken in yogurt and spices",
    "Grill chicken until charred",
    "Prepare curry sauce",
    "Combine chicken with sauce",
    "Simmer until thick"
  ]'::jsonb,
  ARRAY['indian', 'curry', 'chicken']
) ON CONFLICT DO NOTHING;