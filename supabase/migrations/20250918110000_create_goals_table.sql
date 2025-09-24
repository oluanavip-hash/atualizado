/*
  # [Operation Name]
  Create Goals Table

  ## Query Description: [This operation creates a new 'goals' table to store user-defined financial goals. It includes columns for the goal's name, description, target and current amounts, deadline, and status. It also establishes a foreign key relationship to the 'auth.users' table to associate goals with users and enables Row Level Security to ensure users can only access their own goals.]

  ## Metadata:
  - Schema-Category: "Structural"
  - Impact-Level: "Low"
  - Requires-Backup: false
  - Reversible: true

  ## Structure Details:
  - Table: public.goals
  - Columns:
    - id: uuid, primary key, default gen_random_uuid()
    - user_id: uuid, foreign key to auth.users(id)
    - name: text, not null
    - description: text
    - target_amount: numeric, not null
    - current_amount: numeric, not null, default 0
    - deadline: date
    - is_achieved: boolean, not null, default false
    - created_at: timestamptz, default now()
    - updated_at: timestamptz, default now()

  ## Security Implications:
  - RLS Status: Enabled
  - Policy Changes: Yes (New policies for SELECT, INSERT, UPDATE, DELETE)
  - Auth Requirements: User must be authenticated to interact with their own goals.

  ## Performance Impact:
  - Indexes: Added on `id` (primary key) and `user_id`.
  - Triggers: Added `handle_updated_at` trigger to automatically update `updated_at` column.
  - Estimated Impact: Low. The table is new and queries will be efficient due to indexing on `user_id`.
*/

-- Create the goals table
CREATE TABLE public.goals (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL,
    name text NOT NULL,
    description text NULL,
    target_amount numeric NOT NULL,
    current_amount numeric NOT NULL DEFAULT 0,
    deadline date NULL,
    is_achieved boolean NOT NULL DEFAULT false,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT goals_pkey PRIMARY KEY (id),
    CONSTRAINT goals_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Add indexes
CREATE INDEX goals_user_id_idx ON public.goals USING btree (user_id);

-- Enable Row Level Security
ALTER TABLE public.goals ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Allow users to view their own goals" ON public.goals
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Allow users to insert their own goals" ON public.goals
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Allow users to update their own goals" ON public.goals
FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Allow users to delete their own goals" ON public.goals
FOR DELETE USING (auth.uid() = user_id);

-- Trigger to update 'updated_at' timestamp
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_goals_updated
BEFORE UPDATE ON public.goals
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();
