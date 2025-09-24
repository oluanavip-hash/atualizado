-- Add foreign key constraint between transactions and family_members
ALTER TABLE public.transactions 
ADD CONSTRAINT fk_transactions_family_member 
FOREIGN KEY (family_member_id) 
REFERENCES public.family_members(id) 
ON DELETE SET NULL;
