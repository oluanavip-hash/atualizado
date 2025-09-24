-- Add foreign key constraint for monthly_bills to categories
ALTER TABLE public.monthly_bills 
ADD CONSTRAINT fk_monthly_bills_category 
FOREIGN KEY (category_id) REFERENCES public.categories(id) ON DELETE CASCADE;
