import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { CalendarIcon, Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface AddGoalDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onGoalAdded: () => void;
}

export function AddGoalDialog({ open, onOpenChange, onGoalAdded }: AddGoalDialogProps) {
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [targetAmount, setTargetAmount] = useState("");
  const [deadline, setDeadline] = useState<Date>();

  const { user } = useAuth();
  const { toast } = useToast();

  const resetForm = () => {
    setName("");
    setDescription("");
    setTargetAmount("");
    setDeadline(undefined);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    if (!name || !targetAmount) {
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
        .from("goals")
        .insert({
          user_id: user.id,
          name,
          description: description || null,
          target_amount: parseFloat(targetAmount),
          current_amount: 0,
          deadline: deadline ? format(deadline, "yyyy-MM-dd") : null,
          is_achieved: false,
        });

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Meta criada com sucesso!",
      });

      resetForm();
      onGoalAdded();
    } catch (error) {
      console.error("Error creating goal:", error);
      toast({
        title: "Erro",
        description: "Erro ao criar meta.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => {
      onOpenChange(isOpen);
      if (!isOpen) resetForm();
    }}>
      <DialogContent className="sm:max-w-[500px] bg-card border-glass-border">
        <DialogHeader>
          <DialogTitle className="text-foreground">Nova Meta</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-foreground">Nome da Meta *</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Viagem para Europa"
              className="bg-input/50 border-glass-border"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description" className="text-foreground">Descrição</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Descreva sua meta (opcional)"
              className="bg-input/50 border-glass-border"
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="target" className="text-foreground">Valor Objetivo (R$) *</Label>
            <Input
              id="target"
              type="number"
              step="0.01"
              value={targetAmount}
              onChange={(e) => setTargetAmount(e.target.value)}
              placeholder="0,00"
              className="bg-input/50 border-glass-border"
              required
            />
          </div>

          <div className="space-y-2">
            <Label className="text-foreground">Data Limite (opcional)</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal bg-input/50 border-glass-border",
                    !deadline && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {deadline ? format(deadline, "dd/MM/yyyy") : <span>Selecione uma data</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0 bg-card border-glass-border" align="start">
                <Calendar
                  mode="single"
                  selected={deadline}
                  onSelect={setDeadline}
                  initialFocus
                  month={deadline || new Date()}
                  className="p-3 pointer-events-auto"
                  fromDate={new Date()}
                  toYear={new Date().getFullYear() + 10}
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="flex justify-end gap-4 pt-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)}
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
              Criar Meta
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
