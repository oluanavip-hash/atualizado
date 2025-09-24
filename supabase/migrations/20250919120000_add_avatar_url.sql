/*
          # [Operation Name]
          Add avatar_url to profiles

          ## Query Description: [This operation adds a new 'avatar_url' column to the 'profiles' table to store user profile image URLs. It also creates a new storage bucket named 'avatars' for these images and sets up the necessary access policies. This change is non-destructive and reversible.]
          
          ## Metadata:
          - Schema-Category: "Structural"
          - Impact-Level: "Low"
          - Requires-Backup: false
          - Reversible: true
          
          ## Structure Details:
          - Tables affected: `profiles`
          - Columns added: `avatar_url` (TEXT)
          - Storage buckets created: `avatars`
          - Policies added: Policies for avatar access and management.
          
          ## Security Implications:
          - RLS Status: Enabled
          - Policy Changes: Yes
          - Auth Requirements: Users can only manage their own avatars.
          
          ## Performance Impact:
          - Indexes: None
          - Triggers: None
          - Estimated Impact: Low
          */

-- 1. Add avatar_url column to profiles table
ALTER TABLE public.profiles
ADD COLUMN avatar_url TEXT;

-- 2. Create avatars storage bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('avatars', 'avatars', TRUE, 5242880, ARRAY['image/jpeg', 'image/png'])
ON CONFLICT (id) DO NOTHING;

-- 3. Create policies for avatars bucket
-- Allow public read access to avatars
CREATE POLICY "Public read access for avatars"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'avatars');

-- Allow authenticated users to upload their own avatar
CREATE POLICY "Authenticated users can upload avatars"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'avatars'
  AND auth.uid() = (storage.foldername(name))[1]::uuid
);

-- Allow authenticated users to update their own avatar
CREATE POLICY "Authenticated users can update their own avatars"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'avatars'
  AND auth.uid() = (storage.foldername(name))[1]::uuid
);

-- Allow authenticated users to delete their own avatar
CREATE POLICY "Authenticated users can delete their own avatars"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'avatars'
  AND auth.uid() = (storage.foldername(name))[1]::uuid
);
