-- Create table to track paid bills
CREATE TABLE public.paid_bills (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  monthly_bill_id UUID NOT NULL,
  paid_date DATE NOT NULL DEFAULT CURRENT_DATE,
  amount_paid NUMERIC NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.paid_bills ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own paid bills" 
ON public.paid_bills 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own paid bills" 
ON public.paid_bills 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own paid bills" 
ON public.paid_bills 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own paid bills" 
ON public.paid_bills 
FOR DELETE 
USING (auth.uid() = user_id);
