/*
  # Fix user profiles policies

  1. Changes
    - Drop existing policy if it exists
    - Create policy for authenticated users to view all profiles
    - Handle errors gracefully
  
  2. Security
    - Maintain RLS enabled status
    - Ensure authenticated users can view all profiles
*/

-- Safely handle the policy
DO $$ 
BEGIN
    -- Drop the policy if it exists
    DROP POLICY IF EXISTS "Users can view all profiles" ON user_profiles;
    
    -- Create the policy
    CREATE POLICY "Users can view all profiles"
      ON user_profiles
      FOR SELECT
      TO authenticated
      USING (true);
EXCEPTION
    WHEN undefined_object THEN 
        NULL;
END $$;