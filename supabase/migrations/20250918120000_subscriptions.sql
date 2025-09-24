/*
          # [Feature: Subscription System]
          This migration introduces a subscription system by adding status and trial expiration fields to the user profiles. It also sets up a trigger to automatically grant a 30-day free trial to new users upon registration.

          ## Query Description: This operation will alter the `profiles` table to include subscription data. It adds two new columns: `subscription_status` and `trial_expires_at`. It also creates a new function and a trigger on the `auth.users` table. When a new user signs up, the trigger will automatically create their profile, set their subscription status to 'free_trial', and set the trial expiration date to 30 days in the future. This operation is safe and will not affect existing user data, as default values are handled gracefully.

          ## Metadata:
          - Schema-Category: "Structural"
          - Impact-Level: "Low"
          - Requires-Backup: false
          - Reversible: true

          ## Structure Details:
          - Tables Modified: `public.profiles`
          - Columns Added: `subscription_status`, `trial_expires_at`
          - New Types: `subscription_status` (ENUM)
          - New Functions: `public.handle_new_user()`
          - New Triggers: `on_auth_user_created` on `auth.users`

          ## Security Implications:
          - RLS Status: Unchanged. Existing RLS policies on `profiles` will apply.
          - Policy Changes: No
          - Auth Requirements: This trigger interacts with `auth.users` but does not modify its security.

          ## Performance Impact:
          - Indexes: None added.
          - Triggers: Adds one `AFTER INSERT` trigger to `auth.users`. The impact is minimal, affecting only new user creation.
          - Estimated Impact: Negligible performance impact on day-to-day operations.
          */

-- 1. Create the subscription status ENUM type
CREATE TYPE public.subscription_status AS ENUM ('free_trial', 'active', 'inactive', 'canceled');

-- 2. Add new columns to the profiles table
ALTER TABLE public.profiles
ADD COLUMN subscription_status public.subscription_status DEFAULT 'inactive',
ADD COLUMN trial_expires_at TIMESTAMPTZ;

-- 3. Create a function to handle new user setup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, name, email, subscription_status, trial_expires_at)
  VALUES (
    new.id,
    new.raw_user_meta_data->>'name',
    new.email,
    'free_trial',
    now() + interval '30 days'
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Create the trigger to call the function on new user creation
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
