-- Create family_members table
CREATE TABLE public.family_members (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  color TEXT DEFAULT '#3b82f6',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.family_members ENABLE ROW LEVEL SECURITY;

-- Create policies for family_members
CREATE POLICY "Users can view their own family members" 
ON public.family_members 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own family members" 
ON public.family_members 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own family members" 
ON public.family_members 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own family members" 
ON public.family_members 
FOR DELETE 
USING (auth.uid() = user_id);

-- Add family_member_id to transactions table
ALTER TABLE public.transactions 
ADD COLUMN family_member_id UUID;

-- Create trigger for family_members timestamps
CREATE TRIGGER update_family_members_updated_at
BEFORE UPDATE ON public.family_members
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
