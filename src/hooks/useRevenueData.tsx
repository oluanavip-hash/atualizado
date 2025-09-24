import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { startOfMonth, endOfMonth, format, subMonths } from "date-fns";
import { ptBR } from "date-fns/locale";

export interface RevenueData {
  month: string;
  receitas: number;
  despesas: number;
}

export function useRevenueData(startDate?: Date, endDate?: Date) {
  const [data, setData] = useState<RevenueData[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchRevenueData = async () => {
    if (!user) return;

    try {
      setLoading(true);
      
      // Se não há datas específicas, buscar últimos 6 meses
      if (!startDate || !endDate) {
        const months: RevenueData[] = [];
        const currentDate = new Date();
        
        for (let i = 5; i >= 0; i--) {
          const monthDate = subMonths(currentDate, i);
          const monthStart = startOfMonth(monthDate);
          const monthEnd = endOfMonth(monthDate);
          
          const { data: transactions, error } = await supabase
            .from("transactions")
            .select("amount, type")
            .eq("user_id", user.id)
            .gte("date", monthStart.toISOString().split('T')[0])
            .lte("date", monthEnd.toISOString().split('T')[0]);

          if (error) throw error;

          const receitas = transactions
            ?.filter(t => t.type === "income")
            .reduce((sum, t) => sum + Number(t.amount), 0) || 0;

          const despesas = Math.abs(transactions
            ?.filter(t => t.type === "expense")
            .reduce((sum, t) => sum + Number(t.amount), 0) || 0);

          months.push({
            month: format(monthDate, "MMM", { locale: ptBR }),
            receitas,
            despesas,
          });
        }
        
        setData(months);
      } else {
        // Buscar dados para período específico
        const { data: transactions, error } = await supabase
          .from("transactions")
          .select("amount, type")
          .eq("user_id", user.id)
          .gte("date", startDate.toISOString().split('T')[0])
          .lte("date", endDate.toISOString().split('T')[0]);

        if (error) throw error;

        const receitas = transactions
          ?.filter(t => t.type === "income")
          .reduce((sum, t) => sum + Number(t.amount), 0) || 0;

        const despesas = Math.abs(transactions
          ?.filter(t => t.type === "expense")
          .reduce((sum, t) => sum + Number(t.amount), 0) || 0);

        setData([{
          month: "Período",
          receitas,
          despesas,
        }]);
      }
    } catch (error) {
      console.error("Error fetching revenue data:", error);
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRevenueData();
  }, [user, startDate, endDate]);

  return {
    data,
    loading,
    refetch: fetchRevenueData,
  };
}
