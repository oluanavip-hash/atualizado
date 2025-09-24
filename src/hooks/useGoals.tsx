import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { useToast } from "./use-toast";

export interface Goal {
  id: string;
  name: string;
  description?: string;
  target_amount: number;
  current_amount: number;
  deadline?: string;
  is_achieved: boolean;
  created_at: string;
  updated_at: string;
  user_id: string;
}

export function useGoals() {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchGoals = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from("goals")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setGoals(data || []);
    } catch (error) {
      console.error("Error fetching goals:", error);
      toast({
        title: "Erro",
        description: "Erro ao carregar metas.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const deleteGoal = async (id: string) => {
    try {
      const { error } = await supabase
        .from("goals")
        .delete()
        .eq("id", id);

      if (error) throw error;

      setGoals(prev => prev.filter(g => g.id !== id));
      toast({
        title: "Sucesso",
        description: "Meta excluída com sucesso!",
      });
    } catch (error) {
      console.error("Error deleting goal:", error);
      toast({
        title: "Erro",
        description: "Erro ao excluir meta.",
        variant: "destructive",
      });
    }
  };

  const updateGoalAmount = async (id: string, amount: number) => {
    try {
      const goal = goals.find(g => g.id === id);
      if (!goal) return;

      const newAmount = goal.current_amount + amount;
      const isAchieved = newAmount >= goal.target_amount;

      const { error } = await supabase
        .from("goals")
        .update({ 
          current_amount: newAmount,
          is_achieved: isAchieved
        })
        .eq("id", id);

      if (error) throw error;

      await fetchGoals();
      
      if (isAchieved && !goal.is_achieved) {
        toast({
          title: "🎉 Meta Alcançada!",
          description: `Parabéns! Você alcançou a meta "${goal.name}"!`,
        });
      } else {
        toast({
          title: "Sucesso",
          description: "Valor adicionado à meta!",
        });
      }
    } catch (error) {
      console.error("Error updating goal amount:", error);
      toast({
        title: "Erro",
        description: "Erro ao atualizar meta.",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchGoals();
  }, [user]);

  return {
    goals,
    loading,
    fetchGoals,
    deleteGoal,
    updateGoalAmount,
  };
}
