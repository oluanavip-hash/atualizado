-- Create monthly bills table for recurring expenses
CREATE TABLE public.monthly_bills (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  amount NUMERIC NOT NULL,
  category_id UUID NOT NULL,
  day_of_month INTEGER NOT NULL CHECK (day_of_month >= 1 AND day_of_month <= 31),
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.monthly_bills ENABLE ROW LEVEL SECURITY;

-- Create policies for monthly bills
CREATE POLICY "Users can view their own monthly bills" 
ON public.monthly_bills 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own monthly bills" 
ON public.monthly_bills 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own monthly bills" 
ON public.monthly_bills 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own monthly bills" 
ON public.monthly_bills 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_monthly_bills_updated_at
BEFORE UPDATE ON public.monthly_bills
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
