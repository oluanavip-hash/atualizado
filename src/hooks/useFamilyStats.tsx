import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

export interface FamilyTransactionStats {
  memberId: string;
  memberName: string;
  memberColor: string;
  totalIncome: number;
  totalExpenses: number;
  balance: number;
  transactionCount: number;
  expensesByCategory: Array<{
    categoryName: string;
    categoryColor: string;
    amount: number;
  }>;
}

export function useFamilyStats(startDate?: Date, endDate?: Date) {
  const [stats, setStats] = useState<FamilyTransactionStats[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchFamilyStats = async () => {
    if (!user) return;

    try {
      setLoading(true);
      
      // Primeiro buscar membros da família
      const { data: members, error: membersError } = await supabase
        .from("family_members")
        .select("id, name, color")
        .eq("user_id", user.id)
        .eq("is_active", true);

      if (membersError) throw membersError;

      const familyStats: FamilyTransactionStats[] = [];

      for (const member of members || []) {
        // Query base para transações
        let query = supabase
          .from("transactions")
          .select(`
            amount,
            type,
            categories (
              name,
              color
            )
          `)
          .eq("user_id", user.id)
          .eq("family_member_id", member.id);

        // Adicionar filtros de data se fornecidos
        if (startDate) {
          query = query.gte("date", startDate.toISOString().split('T')[0]);
        }
        if (endDate) {
          query = query.lte("date", endDate.toISOString().split('T')[0]);
        }

        const { data: transactions, error: transactionsError } = await query;

        if (transactionsError) throw transactionsError;

        const income = transactions
          ?.filter(t => t.type === "income")
          .reduce((sum, t) => sum + Number(t.amount), 0) || 0;

        const expenses = Math.abs(transactions
          ?.filter(t => t.type === "expense")
          .reduce((sum, t) => sum + Number(t.amount), 0) || 0);

        // Agrupar despesas por categoria
        const expensesByCategory = transactions
          ?.filter(t => t.type === "expense")
          .reduce((acc, t) => {
            const categoryName = t.categories?.name || "Outros";
            const categoryColor = t.categories?.color || "#888888";
            const amount = Math.abs(Number(t.amount));

            const existing = acc.find(c => c.categoryName === categoryName);
            if (existing) {
              existing.amount += amount;
            } else {
              acc.push({
                categoryName,
                categoryColor,
                amount
              });
            }
            return acc;
          }, [] as Array<{ categoryName: string; categoryColor: string; amount: number }>) || [];

        familyStats.push({
          memberId: member.id,
          memberName: member.name,
          memberColor: member.color,
          totalIncome: income,
          totalExpenses: expenses,
          balance: income - expenses,
          transactionCount: transactions?.length || 0,
          expensesByCategory: expensesByCategory.sort((a, b) => b.amount - a.amount)
        });
      }

      setStats(familyStats);
    } catch (error) {
      console.error("Error fetching family stats:", error);
      setStats([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFamilyStats();
  }, [user, startDate, endDate]);

  return {
    stats,
    loading,
    refetch: fetchFamilyStats,
  };
}
