import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { CalendarIcon, Edit, Loader2 } from "lucide-react";
import { useCategories } from "@/hooks/useCategories";
import { useFamilyMembers } from "@/hooks/useFamilyMembers";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Transaction } from "@/hooks/useTransactions";

interface EditTransactionDialogProps {
  transaction: Transaction;
  onTransactionUpdated: () => void;
}

export function EditTransactionDialog({ transaction, onTransactionUpdated }: EditTransactionDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [date, setDate] = useState<Date>(new Date(transaction.date));
  const [description, setDescription] = useState(transaction.description);
  const [amount, setAmount] = useState(transaction.amount.toString());
  const [categoryId, setCategoryId] = useState(transaction.category_id);
  const [familyMemberId, setFamilyMemberId] = useState(transaction.family_member_id || "none");
  const [type, setType] = useState(transaction.type);

  const { categories } = useCategories();
  const { members } = useFamilyMembers();
  const { user } = useAuth();
  const { toast } = useToast();

  const filteredCategories = categories.filter(category => category.type === type);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    if (!description || !amount || !categoryId) {
      toast({
        title: "Erro",
        description: "Por favor, preencha todos os campos obrigatórios.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase
        .from("transactions")
        .update({
          description,
          amount: parseFloat(amount),
          category_id: categoryId,
          family_member_id: familyMemberId === "none" ? null : familyMemberId,
          type,
          date: format(date, "yyyy-MM-dd"),
        })
        .eq("id", transaction.id);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Transação atualizada com sucesso!",
      });

      setOpen(false);
      onTransactionUpdated();
    } catch (error) {
      console.error("Error updating transaction:", error);
      toast({
        title: "Erro",
        description: "Erro ao atualizar transação.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setDate(new Date(transaction.date));
    setDescription(transaction.description);
    setAmount(transaction.amount.toString());
    setCategoryId(transaction.category_id);
    setFamilyMemberId(transaction.family_member_id || "none");
    setType(transaction.type);
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => {
      setOpen(isOpen);
      if (!isOpen) resetForm();
    }}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-secondary/50"
        >
          <Edit className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] bg-card border-glass-border">
        <DialogHeader>
          <DialogTitle className="text-foreground">Editar Transação</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="type" className="text-foreground">Tipo *</Label>
              <Select value={type} onValueChange={setType}>
                <SelectTrigger className="bg-input/50 border-glass-border">
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="income">Receita</SelectItem>
                  <SelectItem value="expense">Despesa</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="amount" className="text-foreground">Valor *</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0,00"
                className="bg-input/50 border-glass-border"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description" className="text-foreground">Descrição *</Label>
            <Input
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Ex: Almoço no restaurante"
              className="bg-input/50 border-glass-border"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="category" className="text-foreground">Categoria *</Label>
            <Select value={categoryId} onValueChange={setCategoryId}>
              <SelectTrigger className="bg-input/50 border-glass-border">
                <SelectValue placeholder="Selecione uma categoria" />
              </SelectTrigger>
              <SelectContent>
                {filteredCategories.map((category) => (
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

          {members.length > 0 && (
            <div className="space-y-2">
              <Label htmlFor="family-member" className="text-foreground">Membro da Família</Label>
              <Select value={familyMemberId} onValueChange={setFamilyMemberId}>
                <SelectTrigger className="bg-input/50 border-glass-border">
                  <SelectValue placeholder="Selecione um membro (opcional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Nenhum</SelectItem>
                  {members.map((member) => (
                    <SelectItem key={member.id} value={member.id}>
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-3 h-3 rounded-full" 
                          style={{ backgroundColor: member.color }}
                        />
                        {member.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="space-y-2">
            <Label className="text-foreground">Data *</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal bg-input/50 border-glass-border",
                    !date && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date ? format(date, "dd/MM/yyyy") : <span>Selecione uma data</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0 bg-card border-glass-border" align="start">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={(newDate) => newDate && setDate(newDate)}
                  initialFocus
                  month={date}
                  className="p-3 pointer-events-auto"
                  fromYear={new Date().getFullYear() - 5}
                  toYear={new Date().getFullYear() + 5}
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="flex justify-end gap-4 pt-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => setOpen(false)}
              className="border-glass-border"
            >
              Cancelar
            </Button>
            <Button 
              type="submit" 
              disabled={loading}
              className="bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Salvar Alterações
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
