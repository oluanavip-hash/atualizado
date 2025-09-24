import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { useToast } from "./use-toast";

export interface Transaction {
  id: string;
  description: string;
  amount: number;
  category_id: string;
  type: string;
  date: string;
  created_at: string;
  updated_at: string;
  user_id: string;
  family_member_id?: string | null;
  categories?: {
    name: string;
    color: string;
    type: string;
  };
  family_members?: {
    name: string;
    color: string;
  };
}

export function useTransactions() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchTransactions = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from("transactions")
        .select(`
          *,
          categories (
            name,
            color,
            type
          ),
          family_members (
            name,
            color
          )
        `)
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setTransactions(data as unknown as Transaction[] || []);
    } catch (error) {
      console.error("Error fetching transactions:", error);
      toast({
        title: "Erro",
        description: "Erro ao carregar transações.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const deleteTransaction = async (id: string) => {
    try {
      const { error } = await supabase
        .from("transactions")
        .delete()
        .eq("id", id);

      if (error) throw error;

      setTransactions(prev => prev.filter(t => t.id !== id));
      toast({
        title: "Sucesso",
        description: "Transação excluída com sucesso!",
      });
    } catch (error) {
      console.error("Error deleting transaction:", error);
      toast({
        title: "Erro",
        description: "Erro ao excluir transação.",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, [user]);

  const updateTransaction = async (id: string, updates: Partial<Transaction>) => {
    try {
      const { error } = await supabase
        .from("transactions")
        .update(updates)
        .eq("id", id);

      if (error) throw error;

      await fetchTransactions();
      toast({
        title: "Sucesso",
        description: "Transação atualizada com sucesso!",
      });
    } catch (error) {
      console.error("Error updating transaction:", error);
      toast({
        title: "Erro",
        description: "Erro ao atualizar transação.",
        variant: "destructive",
      });
    }
  };

  return {
    transactions,
    loading,
    fetchTransactions,
    deleteTransaction,
    updateTransaction,
  };
}
