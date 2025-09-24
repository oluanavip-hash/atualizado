import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

export function useDashboardStats() {
  const [stats, setStats] = useState({
    totalIncome: 0,
    totalExpenses: 0,
    currentBalance: 0,
    monthlyIncome: 0,
    monthlyExpenses: 0,
    monthlyFixedExpenses: 0,
  });
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const calculateStats = async () => {
    if (!user) return;

    try {
      // Buscar todas as transações do usuário
      const { data: transactions, error } = await supabase
        .from("transactions")
        .select("amount, type, date")
        .eq("user_id", user.id);

      if (error) throw error;

      if (!transactions || transactions.length === 0) {
        // Still need to fetch monthly bills even if no transactions
        const { data: billsData, error: billsError } = await supabase
          .from("monthly_bills")
          .select("amount")
          .eq("user_id", user.id)
          .eq("is_active", true);

        const monthlyFixedExpenses = billsData
          ? billsData.reduce((sum, bill) => sum + Number(bill.amount), 0)
          : 0;

        setStats({
          totalIncome: 0,
          totalExpenses: 0,
          currentBalance: 0,
          monthlyIncome: 0,
          monthlyExpenses: 0,
          monthlyFixedExpenses,
        });
        setLoading(false);
        return;
      }

      // Calcular totais
      const totalIncome = transactions
        .filter(t => t.type === "income")
        .reduce((sum, t) => sum + Number(t.amount), 0);

      const totalExpenses = Math.abs(transactions
        .filter(t => t.type === "expense")
        .reduce((sum, t) => sum + Number(t.amount), 0));

      const currentBalance = totalIncome - totalExpenses;

      // Calcular valores do mês atual
      const currentMonth = new Date().getMonth();
      const currentYear = new Date().getFullYear();
      
      const currentMonthTransactions = transactions.filter(t => {
        const transactionDate = new Date(t.date);
        return transactionDate.getMonth() === currentMonth && 
               transactionDate.getFullYear() === currentYear;
      });

      const monthlyIncome = currentMonthTransactions
        .filter(t => t.type === "income")
        .reduce((sum, t) => sum + Number(t.amount), 0);

      const monthlyExpenses = Math.abs(currentMonthTransactions
        .filter(t => t.type === "expense")
        .reduce((sum, t) => sum + Number(t.amount), 0));

      // Fetch monthly fixed expenses from monthly_bills table
      const { data: billsData, error: billsError } = await supabase
        .from("monthly_bills")
        .select("amount")
        .eq("user_id", user.id)
        .eq("is_active", true);

      if (billsError) {
        console.error("Error fetching monthly bills:", billsError);
      }

      const monthlyFixedExpenses = billsData
        ? billsData.reduce((sum, bill) => sum + Number(bill.amount), 0)
        : 0;

      setStats({
        totalIncome,
        totalExpenses,
        currentBalance,
        monthlyIncome,
        monthlyExpenses,
        monthlyFixedExpenses,
      });
    } catch (error) {
      console.error("Error calculating stats:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    calculateStats();
  }, [user]);

  return {
    stats,
    loading,
    refetchStats: calculateStats,
  };
}
