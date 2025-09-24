import { useState, useEffect } from "react";
import { StatCard } from "@/components/dashboard/StatCard";
import { ExpenseChart } from "@/components/dashboard/ExpenseChart";
import { RevenueChart } from "@/components/dashboard/RevenueChart";
import { TransactionTable } from "@/components/dashboard/TransactionTable";
import { MonthlyBillsDialog } from "@/components/dashboard/MonthlyBillsDialog";
import { PaidBillsDialog } from "@/components/dashboard/PaidBillsDialog";
import { FamilyMembersDialog } from "@/components/dashboard/FamilyMembersDialog";
import { FamilyStatsDialog } from "@/components/dashboard/FamilyStatsDialog";
import { TrendingUp, TrendingDown, DollarSign, Calendar, Users, PieChart, CreditCard, CalendarDays } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import { useDashboardStats } from "@/hooks/useDashboardStats";
import { useTransactions } from "@/hooks/useTransactions";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { format, addMonths } from "date-fns";
import { ptBR } from "date-fns/locale";

const Dashboard = () => {
  const { stats, loading, refetchStats } = useDashboardStats();
  const { fetchTransactions } = useTransactions();
  const { profile } = useAuth();
  const [currentMonthValue, setCurrentMonthValue] = useState<string>("");

  const generateMonthOptions = () => {
    const options = [];
    const now = new Date();
    for (let i = 0; i < 12; i++) {
      const date = addMonths(now, i);
      const value = format(date, "yyyy-MM");
      const label = format(date, "MMMM yyyy", { locale: ptBR });
      options.push({ value, label: label.charAt(0).toUpperCase() + label.slice(1) });
    }
    return options;
  };

  const monthOptions = generateMonthOptions();

  useEffect(() => {
    setCurrentMonthValue(format(new Date(), "yyyy-MM"));
  }, []);

  const handleRefresh = () => {
    fetchTransactions();
    refetchStats();
  };

  const handleTransactionUpdate = () => {
    fetchTransactions();
    refetchStats();
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const getChangeIndicator = (current: number, isPositive: boolean = true) => {
    if (current === 0) return "0%";
    return isPositive ? "+0%" : "0%"; // Para dados simulados, pode ser melhorado com dados históricos
  };
  return (
    <>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Olá, {profile?.name?.split(' ')[0] || 'Usuário'} 👋</h1>
          <p className="text-muted-foreground">
            Bem-vindo de volta! Aqui está o resumo das suas finanças.
          </p>
        </div>
        <div className="overflow-x-auto -mx-2">
          <div className="flex gap-2 px-2 whitespace-nowrap">
            <Button 
              variant="outline" 
              onClick={handleRefresh}
              disabled={loading}
              className="border-glass-border shrink-0"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Atualizar
            </Button>
            <FamilyMembersDialog onMembersChange={handleTransactionUpdate}>
              <Button variant="outline" className="border-glass-border shrink-0">
                <Users className="h-4 w-4 mr-2" />
                Gerenciar Família
              </Button>
            </FamilyMembersDialog>
            <FamilyStatsDialog>
              <Button variant="outline" className="border-glass-border shrink-0">
                <PieChart className="h-4 w-4 mr-2" />
                Relatórios
              </Button>
            </FamilyStatsDialog>
            <MonthlyBillsDialog onBillsChange={handleTransactionUpdate}>
               <Button variant="outline" className="border-glass-border">
                  <CalendarDays className="h-4 w-4 mr-2" />
                  Contas Mensais
                </Button>
            </MonthlyBillsDialog>
            <PaidBillsDialog onBillPaid={handleTransactionUpdate}>
              <Button variant="outline" className="border-glass-border">
                <CreditCard className="h-4 w-4 mr-2" />
                Registrar Conta Paga
              </Button>
            </PaidBillsDialog>
            <Select value={currentMonthValue} onValueChange={setCurrentMonthValue}>
              <SelectTrigger className="w-full sm:w-[180px] bg-input/50 border-glass-border shrink-0">
                <SelectValue placeholder="Selecionar período" />
              </SelectTrigger>
              <SelectContent>
                {monthOptions.map(option => (
                  <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard
          title="Receitas Totais"
          value={loading ? "Carregando..." : formatCurrency(stats.totalIncome)}
          change={getChangeIndicator(stats.totalIncome, true)}
          icon={TrendingUp}
          variant="positive"
        />
        <StatCard
          title="Despesas Totais"
          value={loading ? "Carregando..." : formatCurrency(stats.totalExpenses)}
          change={getChangeIndicator(stats.totalExpenses, false)}
          icon={TrendingDown}
          variant="negative"
        />
        <StatCard
          title="Saldo Atual"
          value={loading ? "Carregando..." : formatCurrency(stats.currentBalance)}
          change={getChangeIndicator(stats.currentBalance, stats.currentBalance >= 0)}
          icon={DollarSign}
          variant={stats.currentBalance >= 0 ? "positive" : "negative"}
        />
        <StatCard
          title="Despesas Mensais Fixas"
          value={loading ? "Carregando..." : formatCurrency(stats.monthlyFixedExpenses)}
          change={getChangeIndicator(stats.monthlyFixedExpenses, false)}
          icon={Calendar}
          variant={stats.monthlyFixedExpenses > 0 ? "negative" : "default"}
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <RevenueChart />
        <ExpenseChart />
      </div>

      {/* Transactions Table */}
      <TransactionTable onTransactionChange={handleTransactionUpdate} />
    </>
  );
};

export default Dashboard;
