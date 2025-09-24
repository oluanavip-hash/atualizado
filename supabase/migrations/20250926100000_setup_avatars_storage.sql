/*
# [Feature] Avatar Storage Setup
This script configures Supabase Storage to allow users to upload and manage their profile pictures.

## Query Description:
This migration creates a new storage bucket named `avatars` and applies Row Level Security (RLS) policies to it. These policies ensure that users can only manage their own avatars, while allowing public read access for displaying the images. This operation is safe and does not affect any existing user data.

## Metadata:
- Schema-Category: "Structural"
- Impact-Level: "Low"
- Requires-Backup: false
- Reversible: true (Policies and the bucket can be manually removed)

## Structure Details:
- Creates a new storage bucket: `avatars`
- Adds RLS policies to `storage.objects` for the `avatars` bucket.

## Security Implications:
- RLS Status: Enabled
- Policy Changes: Yes
  - `avatars_public_read`: Allows anyone to read/view avatars.
  - `avatars_owner_insert`: Allows authenticated users to upload their own avatar.
  - `avatars_owner_update`: Allows authenticated users to update their own avatar.
  - `avatars_owner_delete`: Allows authenticated users to delete their own avatar.
- Auth Requirements: Authenticated users for insert/update/delete operations.

## Performance Impact:
- Indexes: None
- Triggers: None
- Estimated Impact: Negligible. Standard storage operations.
*/

-- 1. Create Storage Bucket
-- Creates a new bucket named 'avatars' that is publicly accessible.
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('avatars', 'avatars', true, 5242880, ARRAY['image/png', 'image/jpeg', 'image/jpg'])
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- 2. RLS Policy: Public Read Access
-- Allows anyone to view files in the 'avatars' bucket.
DROP POLICY IF EXISTS "avatars_public_read" ON storage.objects;
CREATE POLICY "avatars_public_read"
ON storage.objects FOR SELECT
TO public
USING ( bucket_id = 'avatars' );

-- 3. RLS Policy: Authenticated User Insert
-- Allows authenticated users to upload files to their own folder within the 'avatars' bucket.
-- The folder is named after the user's ID (uid).
DROP POLICY IF EXISTS "avatars_owner_insert" ON storage.objects;
CREATE POLICY "avatars_owner_insert"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'avatars' AND
  auth.uid() = owner AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- 4. RLS Policy: Authenticated User Update
-- Allows authenticated users to update their own files in the 'avatars' bucket.
DROP POLICY IF EXISTS "avatars_owner_update" ON storage.objects;
CREATE POLICY "avatars_owner_update"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'avatars' AND
  auth.uid() = owner AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- 5. RLS Policy: Authenticated User Delete
-- Allows authenticated users to delete their own files in the 'avatars' bucket.
DROP POLICY IF EXISTS "avatars_owner_delete" ON storage.objects;
CREATE POLICY "avatars_owner_delete"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'avatars' AND
  auth.uid() = owner AND
  (storage.foldername(name))[1] = auth.uid()::text
);
