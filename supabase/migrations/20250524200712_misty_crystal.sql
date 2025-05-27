/*
  # Fix profiles table RLS policies

  1. Changes
    - Add policy to allow new users to create their own profile during signup
    - Keep existing policies for profile updates and viewing

  2. Security
    - Enable RLS on profiles table (already enabled)
    - Add policy for authenticated users to create their own profile
    - Maintain existing policies for profile updates and viewing
*/

-- Add policy to allow new users to create their own profile
CREATE POLICY "Users can create their own profile"
ON public.profiles
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = id);