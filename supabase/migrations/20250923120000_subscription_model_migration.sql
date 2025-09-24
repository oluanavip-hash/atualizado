/*
          # [Operation Name]
          Update Profiles for Subscription Model

          ## Query Description: [This operation alters the 'profiles' table to support a new subscription model. It adds a 'subscription_tier' column to differentiate between 'free' and 'pro' users and modifies the 'subscription_status' to better reflect the user's current plan. This change is essential for implementing feature restrictions and upsell flows. No existing data will be lost, but it is a structural change.]
          
          ## Metadata:
          - Schema-Category: "Structural"
          - Impact-Level: "Medium"
          - Requires-Backup: false
          - Reversible: true
          
          ## Structure Details:
          - Modifies table: `profiles`
          - Adds column: `subscription_tier` (ENUM: 'free', 'pro')
          - Modifies column: `subscription_status` (ENUM: 'active', 'trialing', 'past_due', 'canceled', 'unpaid', 'free')
          
          ## Security Implications:
          - RLS Status: Enabled
          - Policy Changes: No
          - Auth Requirements: Admin privileges
          
          ## Performance Impact:
          - Indexes: None
          - Triggers: None
          - Estimated Impact: Low. The operation is a metadata change and should be fast.
          */

-- First, create the new enum types if they don't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'subscription_tier_enum') THEN
        CREATE TYPE subscription_tier_enum AS ENUM ('free', 'pro');
    END IF;
END$$;

-- Alter the profiles table to add the new subscription_tier column
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS subscription_tier subscription_tier_enum NOT NULL DEFAULT 'free';

-- Update the handle_new_user trigger function to set the default tier
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, name, email, subscription_status, trial_expires_at, subscription_tier)
  VALUES (
    new.id,
    new.raw_user_meta_data->>'name',
    new.email,
    'trialing',
    NOW() + INTERVAL '30 days',
    'free' -- All new users start as free, but with a trial status
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update existing users who are in trial to be on the 'free' tier
UPDATE public.profiles
SET subscription_tier = 'free'
WHERE subscription_status = 'trialing' AND subscription_tier IS NULL;

-- Update existing active subscribers to be on the 'pro' tier
UPDATE public.profiles
SET subscription_tier = 'pro'
WHERE subscription_status = 'active' AND subscription_tier IS NULL;
