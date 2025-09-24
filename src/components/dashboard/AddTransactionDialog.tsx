import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, Plus } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { useCategories } from "@/hooks/useCategories";
import { useFamilyMembers } from "@/hooks/useFamilyMembers";

interface AddTransactionDialogProps {
  onTransactionAdded: () => void;
}

export function AddTransactionDialog({ onTransactionAdded }: AddTransactionDialogProps) {
  const [open, setOpen] = useState(false);
  const [date, setDate] = useState<Date>(new Date());
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [familyMemberId, setFamilyMemberId] = useState("");
  const [type, setType] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();
  const { categories } = useCategories();
  const { members } = useFamilyMembers();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user || !description || !amount || !categoryId || !type) {
      toast({
        title: "Erro",
        description: "Por favor, preencha todos os campos obrigatórios.",
        variant: "destructive",
      });
      return;
    }

    if (members.length > 0 && !familyMemberId) {
      toast({
        title: "Selecione o membro",
        description: "Quem está registrando esta transação?",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase
        .from("transactions")
        .insert({
          user_id: user.id,
          description,
          amount: type === "expense" ? -Math.abs(parseFloat(amount)) : Math.abs(parseFloat(amount)),
          category_id: categoryId,
          family_member_id: familyMemberId || null,
          type,
          date: format(date, "yyyy-MM-dd"),
        });

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Transação adicionada com sucesso!",
      });

      // Reset form
      setDescription("");
      setAmount("");
      setCategoryId("");
      setFamilyMemberId("");
      setType("");
      setDate(new Date());
      setOpen(false);
      onTransactionAdded();
    } catch (error) {
      console.error("Error adding transaction:", error);
      toast({
        title: "Erro",
        description: "Erro ao adicionar transação. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredCategories = categories.filter(cat => cat.type === type);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-neon">
          <Plus className="h-4 w-4 mr-2" />
          Nova Transação
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px] bg-card border-glass-border">
        <DialogHeader>
          <DialogTitle className="text-foreground">Adicionar Nova Transação</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="type">Tipo</Label>
              <Select value={type} onValueChange={setType} required>
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
              <Label htmlFor="amount">Valor (R$)</Label>
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
            <Label htmlFor="description">Descrição</Label>
            <Input
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Descrição da transação"
              className="bg-input/50 border-glass-border"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Categoria</Label>
            <Select value={categoryId} onValueChange={setCategoryId} required>
              <SelectTrigger className="bg-input/50 border-glass-border">
                <SelectValue placeholder="Selecione uma categoria" />
              </SelectTrigger>
              <SelectContent className="max-h-[200px] overflow-y-auto">
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
              <Label htmlFor="familyMember">Quem está registrando?</Label>
              <Select value={familyMemberId} onValueChange={setFamilyMemberId}>
                <SelectTrigger className="bg-input/50 border-glass-border">
                  <SelectValue placeholder="Selecione um membro" />
                </SelectTrigger>
                <SelectContent>
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
            <Label>Data</Label>
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
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={(newDate) => newDate && setDate(newDate)}
                  initialFocus
                  month={date}
                  className={cn("p-3 pointer-events-auto")}
                  fromYear={new Date().getFullYear() - 5}
                  toYear={new Date().getFullYear() + 5}
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="flex justify-end gap-2 pt-4">
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
              {loading ? "Salvando..." : "Salvar Transação"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
