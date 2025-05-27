/*
  # Fix user profiles policies

  1. Changes
    - Safely handle existing policies
    - Ensure policy exists for viewing all profiles
    - Use DO block for safer execution

  2. Security
    - Maintain RLS enabled status
    - Keep policy for authenticated users
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