import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { 
  Target, 
  Plus, 
  Calendar, 
  Trash2, 
  CheckCircle,
  Loader2
} from "lucide-react";
import { Goal } from "@/hooks/useGoals";
import { format, isAfter } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface GoalCardProps {
  goal: Goal;
  onDeleteGoal: (id: string) => Promise<void>;
  onAddAmount: (id: string, amount: number) => Promise<void>;
}

export function GoalCard({ goal, onDeleteGoal, onAddAmount }: GoalCardProps) {
  const [addAmount, setAddAmount] = useState("");
  const [loading, setLoading] = useState(false);

  const progress = (goal.current_amount / goal.target_amount) * 100;
  const remaining = Math.max(0, goal.target_amount - goal.current_amount);
  const isOverdue = goal.deadline && isAfter(new Date(), new Date(goal.deadline));
  const isCompleted = goal.current_amount >= goal.target_amount;

  const handleAddAmount = async () => {
    if (!addAmount || parseFloat(addAmount) <= 0) return;

    setLoading(true);
    try {
      await onAddAmount(goal.id, parseFloat(addAmount));
      setAddAmount("");
    } catch (error) {
      console.error("Error adding amount:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteGoal = async () => {
    try {
      await onDeleteGoal(goal.id);
    } catch (error) {
      console.error("Error deleting goal:", error);
    }
  };

  return (
    <Card className="bg-card/50 backdrop-blur-sm border-glass-border hover:border-primary/30 transition-all duration-300">
      <CardHeader className="space-y-2">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <Target className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg text-foreground line-clamp-1">
              {goal.name}
            </CardTitle>
          </div>
          <div className="flex items-center gap-2">
            {isCompleted && (
              <Badge variant="secondary" className="bg-primary/20 text-primary border-primary/30">
                <CheckCircle className="h-3 w-3 mr-1" />
                Concluída
              </Badge>
            )}
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent className="bg-card border-glass-border">
                <AlertDialogHeader>
                  <AlertDialogTitle className="text-foreground">
                    Excluir Meta
                  </AlertDialogTitle>
                  <AlertDialogDescription>
                    Tem certeza que deseja excluir a meta "{goal.name}"? 
                    Esta ação não pode ser desfeita.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel className="border-glass-border">
                    Cancelar
                  </AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleDeleteGoal}
                    className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
                  >
                    Excluir
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>

        {goal.description && (
          <p className="text-sm text-muted-foreground line-clamp-2">
            {goal.description}
          </p>
        )}

        {goal.deadline && (
          <div className="flex items-center gap-2 text-sm">
            <Calendar className="h-4 w-4" />
            <span className={`${isOverdue ? 'text-destructive' : 'text-muted-foreground'}`}>
              {format(new Date(goal.deadline), "dd/MM/yyyy", { locale: ptBR })}
            </span>
            {isOverdue && !isCompleted && (
              <Badge variant="destructive" className="text-xs">
                Atrasada
              </Badge>
            )}
          </div>
        )}
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Progresso</span>
            <span className="text-foreground font-medium">
              {Math.min(100, Math.round(progress))}%
            </span>
          </div>
          <Progress 
            value={Math.min(100, progress)} 
            className="h-2 bg-muted"
          />
        </div>

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-muted-foreground">Atual</p>
            <p className="font-semibold text-foreground">
              {new Intl.NumberFormat('pt-BR', {
                style: 'currency',
                currency: 'BRL'
              }).format(goal.current_amount)}
            </p>
          </div>
          <div>
            <p className="text-muted-foreground">Meta</p>
            <p className="font-semibold text-foreground">
              {new Intl.NumberFormat('pt-BR', {
                style: 'currency',
                currency: 'BRL'
              }).format(goal.target_amount)}
            </p>
          </div>
        </div>

        {!isCompleted && (
          <>
            <div className="text-sm">
              <p className="text-muted-foreground">Restam</p>
              <p className="font-semibold text-primary">
                {new Intl.NumberFormat('pt-BR', {
                  style: 'currency',
                  currency: 'BRL'
                }).format(remaining)}
              </p>
            </div>

            <div className="flex gap-2">
              <Input
                type="number"
                step="0.01"
                placeholder="R$ 0,00"
                value={addAmount}
                onChange={(e) => setAddAmount(e.target.value)}
                className="bg-input/50 border-glass-border"
              />
              <Button
                onClick={handleAddAmount}
                disabled={!addAmount || parseFloat(addAmount) <= 0 || loading}
                className="bg-primary hover:bg-primary/90 text-primary-foreground px-3"
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Plus className="h-4 w-4" />
                )}
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
