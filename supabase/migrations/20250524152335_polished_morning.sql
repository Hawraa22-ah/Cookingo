/*
  # Add insert policy for user profiles

  1. Changes
    - Add RLS policy to allow users to create their own profiles during registration
  
  2. Security
    - Enable RLS on user_profiles table (if not already enabled)
    - Add policy for authenticated users to insert their own profiles
    - Policy ensures users can only create profiles with their own ID
*/

-- Enable RLS if not already enabled
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Add policy for profile creation during registration
CREATE POLICY "Users can create their own profile"
  ON user_profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);