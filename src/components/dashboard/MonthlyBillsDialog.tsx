import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useCategories } from "@/hooks/useCategories";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface MonthlyBill {
  id: string;
  name: string;
  amount: number;
  category_id: string;
  day_of_month: number;
  is_active: boolean;
  categories?: {
    name: string;
    color: string;
  };
}

interface MonthlyBillsDialogProps {
  onBillsChange?: () => void;
  children: React.ReactNode;
}

export function MonthlyBillsDialog({ onBillsChange, children }: MonthlyBillsDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [bills, setBills] = useState<MonthlyBill[]>([]);
  const [loading, setLoading] = useState(false);
  const [newBill, setNewBill] = useState({
    name: "",
    amount: "",
    category_id: "",
    day_of_month: "1"
  });
  
  const { toast } = useToast();
  const { user } = useAuth();
  const { categories } = useCategories();

  const fetchBills = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("monthly_bills")
        .select(`
          *,
          categories (
            name,
            color
          )
        `)
        .eq("user_id", user.id)
        .order("day_of_month");

      if (error) throw error;
      setBills((data as MonthlyBill[]) || []);
    } catch (error) {
      console.error("Error fetching bills:", error);
      toast({
        title: "Erro",
        description: "Erro ao carregar contas mensais.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleOpen = (open: boolean) => {
    setIsOpen(open);
    if (open) {
      fetchBills();
    }
  };

  const handleAddBill = async () => {
    if (!newBill.name.trim() || !newBill.amount || !newBill.category_id) {
      toast({
        title: "Erro",
        description: "Todos os campos são obrigatórios.",
        variant: "destructive"
      });
      return;
    }

    if (!user) return;

    try {
      const { error } = await supabase
        .from("monthly_bills")
        .insert({
          user_id: user.id,
          name: newBill.name,
          amount: Number(newBill.amount),
          category_id: newBill.category_id,
          day_of_month: Number(newBill.day_of_month)
        });

      if (error) throw error;

      setNewBill({ name: "", amount: "", category_id: "", day_of_month: "1" });
      fetchBills();
      onBillsChange?.();
      
      toast({
        title: "Conta adicionada!",
        description: `A conta "${newBill.name}" foi adicionada com sucesso.`
      });
    } catch (error) {
      console.error("Error creating bill:", error);
      toast({
        title: "Erro",
        description: "Erro ao criar conta mensal.",
        variant: "destructive"
      });
    }
  };

  const handleDeleteBill = async (id: string) => {
    try {
      const { error } = await supabase
        .from("monthly_bills")
        .delete()
        .eq("id", id);

      if (error) throw error;

      setBills(bills.filter(bill => bill.id !== id));
      onBillsChange?.();
      toast({
        title: "Conta removida!",
        description: "A conta foi removida com sucesso."
      });
    } catch (error) {
      console.error("Error deleting bill:", error);
      toast({
        title: "Erro",
        description: "Erro ao remover conta.",
        variant: "destructive"
      });
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(amount);
  };

  const expenseCategories = categories.filter(cat => cat.type === "expense");

  return (
    <Dialog open={isOpen} onOpenChange={handleOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="bg-card border-glass-border max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-foreground">Gerenciar Contas Mensais</DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Registre suas contas fixas mensais para melhor controle financeiro.
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Add new bill form */}
          <Card className="bg-gradient-card border-glass-border">
            <CardHeader>
              <CardTitle className="text-foreground text-lg">Nova Conta Mensal</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="billName">Nome da Conta</Label>
                <Input
                  id="billName"
                  value={newBill.name}
                  onChange={(e) => setNewBill({ ...newBill, name: e.target.value })}
                  placeholder="Ex: Luz, Água, Internet..."
                  className="bg-input/50 border-glass-border"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="billAmount">Valor (R$)</Label>
                <Input
                  id="billAmount"
                  type="number"
                  step="0.01"
                  value={newBill.amount}
                  onChange={(e) => setNewBill({ ...newBill, amount: e.target.value })}
                  placeholder="0,00"
                  className="bg-input/50 border-glass-border"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="billCategory">Categoria</Label>
                <Select value={newBill.category_id} onValueChange={(value) => setNewBill({ ...newBill, category_id: value })}>
                  <SelectTrigger className="bg-input/50 border-glass-border">
                    <SelectValue placeholder="Selecione uma categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    {expenseCategories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        <div className="flex items-center gap-2">
                          <div 
                            className="w-3 h-3 rounded-full" 
                            style={{ backgroundColor: category.color }}
                          />
                          {category.name}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="billDay">Dia do Vencimento</Label>
                <Select value={newBill.day_of_month} onValueChange={(value) => setNewBill({ ...newBill, day_of_month: value })}>
                  <SelectTrigger className="bg-input/50 border-glass-border">
                    <SelectValue placeholder="Dia do mês" />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 31 }, (_, i) => i + 1).map((day) => (
                      <SelectItem key={day} value={day.toString()}>
                        Dia {day}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Button 
                onClick={handleAddBill}
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
              >
                <Plus className="h-4 w-4 mr-2" />
                Adicionar Conta
              </Button>
            </CardContent>
          </Card>

          {/* Bills list */}
          <Card className="bg-gradient-card border-glass-border">
            <CardHeader>
              <CardTitle className="text-foreground text-lg">Contas Cadastradas</CardTitle>
              <CardDescription className="text-muted-foreground">
                {loading ? "Carregando..." : `${bills.length} contas mensais`}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center text-muted-foreground py-8">
                  Carregando contas...
                </div>
              ) : bills.length === 0 ? (
                <div className="text-center text-muted-foreground py-8">
                  Nenhuma conta mensal cadastrada.
                </div>
              ) : (
                <div className="space-y-3 max-h-[400px] overflow-y-auto">
                  {bills.map((bill) => (
                    <div key={bill.id} className="flex items-center justify-between p-3 bg-secondary/10 rounded-lg border border-glass-border">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <div 
                            className="w-3 h-3 rounded-full" 
                            style={{ backgroundColor: bill.categories?.color }}
                          />
                          <span className="font-medium text-foreground">{bill.name}</span>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {formatCurrency(bill.amount)} • Dia {bill.day_of_month}
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 text-red-400 hover:text-red-300"
                        onClick={() => handleDeleteBill(bill.id)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
}
