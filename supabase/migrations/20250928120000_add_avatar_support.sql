/*
          # [Operation Name]
          Enable Profile Picture Uploads

          ## Query Description:
          This operation prepares the database and storage for handling user profile pictures. It adds a column to store the avatar URL, creates a dedicated storage bucket for avatars, and sets security policies to ensure users can only manage their own images. This is a non-destructive operation and should not impact existing data.

          ## Metadata:
          - Schema-Category: "Structural"
          - Impact-Level: "Low"
          - Requires-Backup: false
          - Reversible: true

          ## Structure Details:
          - Modifies `public.profiles` table by adding an `avatar_url` column.
          - Creates a new storage bucket named `avatars`.
          - Adds Row Level Security (RLS) policies to `storage.objects` for the `avatars` bucket.

          ## Security Implications:
          - RLS Status: Enabled on storage.
          - Policy Changes: Yes. New policies are added to allow authenticated users to upload, view, and update their own avatars, enhancing security and privacy.
          - Auth Requirements: Users must be authenticated.

          ## Performance Impact:
          - Indexes: None.
          - Triggers: None.
          - Estimated Impact: Negligible performance impact.
          */

-- 1. Add avatar_url column to profiles table
ALTER TABLE public.profiles
ADD COLUMN avatar_url TEXT;

-- 2. Create a storage bucket for avatars
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- 3. Add RLS policies for the avatars bucket

-- Allow authenticated users to view their own avatars
CREATE POLICY "Allow authenticated read access on avatars"
ON storage.objects FOR SELECT
USING (bucket_id = 'avatars' AND auth.uid() = owner);

-- Allow authenticated users to upload their own avatar
CREATE POLICY "Allow authenticated insert on avatars"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'avatars' AND auth.uid() = owner);

-- Allow authenticated users to update their own avatar
CREATE POLICY "Allow authenticated update on avatars"
ON storage.objects FOR UPDATE
USING (bucket_id = 'avatars' AND auth.uid() = owner);

-- 4. Add RLS policy for profiles table to allow users to update their own profile
CREATE POLICY "Allow individual profile update"
ON public.profiles FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);
