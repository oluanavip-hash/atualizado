import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Check, CreditCard, Calendar } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

interface MonthlyBill {
  id: string;
  name: string;
  amount: number;
  day_of_month: number;
  category_id: string;
  categories: {
    name: string;
    color: string;
  };
}

interface PaidBill {
  id: string;
  monthly_bill_id: string;
  paid_date: string;
  amount_paid: number;
}

interface PaidBillsDialogProps {
  onBillPaid?: () => void;
  children: React.ReactNode;
}

export function PaidBillsDialog({ onBillPaid, children }: PaidBillsDialogProps) {
  const [monthlyBills, setMonthlyBills] = useState<MonthlyBill[]>([]);
  const [paidBills, setPaidBills] = useState<PaidBill[]>([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchMonthlyBills = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from("monthly_bills")
        .select(`
          id,
          name,
          amount,
          day_of_month,
          category_id,
          categories (name, color)
        `)
        .eq("user_id", user.id)
        .eq("is_active", true);

      if (error) throw error;
      setMonthlyBills(data || []);
    } catch (error) {
      console.error("Error fetching monthly bills:", error);
    }
  };

  const fetchPaidBills = async () => {
    if (!user) return;

    try {
      const currentMonth = new Date().getMonth();
      const currentYear = new Date().getFullYear();
      const startOfMonth = new Date(currentYear, currentMonth, 1);
      const endOfMonth = new Date(currentYear, currentMonth + 1, 0);

      const { data, error } = await supabase
        .from("paid_bills")
        .select("*")
        .eq("user_id", user.id)
        .gte("paid_date", format(startOfMonth, 'yyyy-MM-dd'))
        .lte("paid_date", format(endOfMonth, 'yyyy-MM-dd'));

      if (error) throw error;
      setPaidBills(data || []);
    } catch (error) {
      console.error("Error fetching paid bills:", error);
    }
  };

  const markBillAsPaid = async (bill: MonthlyBill) => {
    if (!user) return;

    setLoading(true);
    try {
      const paidDate = format(new Date(), 'yyyy-MM-dd');
      
      // 1. Insert into paid_bills
      const { error: paidBillError } = await supabase
        .from("paid_bills")
        .insert({
          user_id: user.id,
          monthly_bill_id: bill.id,
          amount_paid: bill.amount,
          paid_date: paidDate
        });

      if (paidBillError) throw paidBillError;

      // 2. Insert into transactions
      const { error: transactionError } = await supabase
        .from("transactions")
        .insert({
          user_id: user.id,
          description: `Pagamento: ${bill.name}`,
          amount: -Math.abs(bill.amount),
          category_id: bill.category_id,
          type: 'expense',
          date: paidDate,
        });

      if (transactionError) {
        console.error("Transaction creation failed after marking bill as paid:", transactionError);
        toast({
          title: "Atenção",
          description: `A conta foi marcada como paga, mas houve um erro ao criar a transação.`,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Conta paga!",
          description: `${bill.name} foi marcada como paga e a transação foi registrada.`,
        });
      }

      fetchPaidBills();
      onBillPaid?.();
    } catch (error) {
      console.error("Error marking bill as paid:", error);
      toast({
        title: "Erro",
        description: "Não foi possível marcar a conta como paga.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const isBillPaid = (billId: string) => {
    return paidBills.some(paid => paid.monthly_bill_id === billId);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  useEffect(() => {
    fetchMonthlyBills();
    fetchPaidBills();
  }, [user]);

  return (
    <Dialog>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Registrar Contas Pagas
          </DialogTitle>
          <DialogDescription>
            Selecione as contas que foram pagas este mês para registrá-las.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 max-h-96 overflow-y-auto">
          {monthlyBills.length === 0 ? (
            <p className="text-muted-foreground text-center py-4">
              Nenhuma despesa fixa cadastrada.
            </p>
          ) : (
            monthlyBills.map((bill) => {
              const isPaid = isBillPaid(bill.id);
              
              return (
                <Card key={bill.id} className={`${isPaid ? 'opacity-60' : ''}`}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-medium">{bill.name}</h3>
                          <Badge 
                            variant="outline" 
                            style={{ backgroundColor: `${bill.categories.color}20`, borderColor: bill.categories.color }}
                          >
                            {bill.categories.name}
                          </Badge>
                          {isPaid && (
                            <Badge variant="default" className="bg-green-500 text-white">
                              <Check className="h-3 w-3 mr-1" />
                              Paga
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span className="font-semibold text-foreground">
                            {formatCurrency(bill.amount)}
                          </span>
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            <span>Dia {bill.day_of_month}</span>
                          </div>
                        </div>
                      </div>
                      
                      <Button
                        variant={isPaid ? "outline" : "default"}
                        size="sm"
                        onClick={() => markBillAsPaid(bill)}
                        disabled={loading || isPaid}
                      >
                        {isPaid ? (
                          <>
                            <Check className="h-4 w-4 mr-1" />
                            Paga
                          </>
                        ) : (
                          "Marcar como Paga"
                        )}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
