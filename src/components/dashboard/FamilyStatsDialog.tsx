import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, PieChart as PieChartIcon } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useFamilyStats } from "@/hooks/useFamilyStats";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";

interface FamilyStatsDialogProps {
  children: React.ReactNode;
}

export function FamilyStatsDialog({ children }: FamilyStatsDialogProps) {
  const [open, setOpen] = useState(false);
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();
  const [selectedMemberId, setSelectedMemberId] = useState<string>("all");
  
  const { stats, loading } = useFamilyStats(startDate, endDate);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const clearFilters = () => {
    setStartDate(undefined);
    setEndDate(undefined);
  };

  const getExpenseChartData = (memberStats: any) => {
    return memberStats.expensesByCategory.map((cat: any, index: number) => ({
      name: cat.categoryName,
      value: cat.amount,
      color: cat.categoryColor,
    }));
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      return (
        <div className="bg-card/90 backdrop-blur-sm border border-glass-border rounded-lg p-3 shadow-elevated">
          <p className="text-foreground font-medium">{data.name}</p>
          <p className="text-foreground font-semibold">{formatCurrency(data.value)}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Relatório da Família</DialogTitle>
          <DialogDescription>
            Veja os gastos e ganhos de cada membro da família por período.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Filtros de período e escopo */}
          <div className="flex flex-wrap gap-2 items-center">
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "justify-start text-left font-normal border-glass-border",
                    !startDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {startDate ? format(startDate, "dd/MM/yyyy") : "Data inicial"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={startDate}
                  onSelect={setStartDate}
                  initialFocus
                  className={cn("p-3 pointer-events-auto")}
                  fromYear={2020}
                  toYear={2030}
                />
              </PopoverContent>
            </Popover>

            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "justify-start text-left font-normal border-glass-border",
                    !endDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {endDate ? format(endDate, "dd/MM/yyyy") : "Data final"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={endDate}
                  onSelect={setEndDate}
                  initialFocus
                  className={cn("p-3 pointer-events-auto")}
                  fromYear={2020}
                  toYear={2030}
                />
              </PopoverContent>
            </Popover>

            <Select value={selectedMemberId} onValueChange={setSelectedMemberId}>
              <SelectTrigger className="w-[200px] border-glass-border">
                <SelectValue placeholder="Escopo do relatório" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Família inteira</SelectItem>
                {stats.map((m) => (
                  <SelectItem key={m.memberId} value={m.memberId}>{m.memberName}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            {(startDate || endDate) && (
              <Button variant="outline" onClick={clearFilters} className="border-glass-border">
                Limpar
              </Button>
            )}
          </div>

          {/* Estatísticas por membro */}
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <p className="text-muted-foreground">Carregando dados...</p>
            </div>
          ) : stats.length === 0 ? (
            <div className="flex items-center justify-center py-8">
              <p className="text-muted-foreground">Nenhum membro ou transação encontrado</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {(selectedMemberId === 'all' ? stats : stats.filter(s => s.memberId === selectedMemberId)).map((memberStats) => (
                <Card key={memberStats.memberId} className="bg-gradient-card border-glass-border">
                  <CardHeader>
                    <div className="flex items-center gap-2">
                      <div
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: memberStats.memberColor }}
                      />
                      <CardTitle className="text-lg">{memberStats.memberName}</CardTitle>
                    </div>
                    <CardDescription>
                      {memberStats.transactionCount} transações no período
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                      {/* Resumo financeiro */}
                      <div className="space-y-3">
                        <div className="grid grid-cols-3 gap-2">
                          <div className="bg-card/30 rounded-lg p-3 border border-glass-border">
                            <p className="text-xs text-muted-foreground">Receitas</p>
                            <p className="text-sm font-semibold text-green-400">
                              {formatCurrency(memberStats.totalIncome)}
                            </p>
                          </div>
                          <div className="bg-card/30 rounded-lg p-3 border border-glass-border">
                            <p className="text-xs text-muted-foreground">Despesas</p>
                            <p className="text-sm font-semibold text-red-400">
                              {formatCurrency(memberStats.totalExpenses)}
                            </p>
                          </div>
                          <div className="bg-card/30 rounded-lg p-3 border border-glass-border">
                            <p className="text-xs text-muted-foreground">Saldo</p>
                            <p className={`text-sm font-semibold ${
                              memberStats.balance >= 0 ? "text-green-400" : "text-red-400"
                            }`}>
                              {formatCurrency(memberStats.balance)}
                            </p>
                          </div>
                        </div>

                        {/* Lista de categorias */}
                        <div className="space-y-2">
                          <h4 className="text-sm font-medium">Gastos por Categoria</h4>
                          {memberStats.expensesByCategory.length === 0 ? (
                            <p className="text-xs text-muted-foreground">Nenhuma despesa registrada</p>
                          ) : (
                            <div className="space-y-1">
                              {memberStats.expensesByCategory.slice(0, 5).map((category, index) => (
                                <div key={index} className="flex items-center justify-between text-sm">
                                  <div className="flex items-center gap-2">
                                    <div
                                      className="w-3 h-3 rounded-full"
                                      style={{ backgroundColor: category.categoryColor }}
                                    />
                                    <span className="text-xs">{category.categoryName}</span>
                                  </div>
                                  <span className="text-xs font-medium">
                                    {formatCurrency(category.amount)}
                                  </span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Gráfico de despesas */}
                      {memberStats.expensesByCategory.length > 0 && (
                        <div className="h-48">
                          <h4 className="text-sm font-medium mb-2">Distribuição de Gastos</h4>
                          <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                              <Pie
                                data={getExpenseChartData(memberStats)}
                                cx="50%"
                                cy="50%"
                                innerRadius={40}
                                outerRadius={80}
                                paddingAngle={2}
                                dataKey="value"
                              >
                                {getExpenseChartData(memberStats).map((entry, index) => (
                                  <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                              </Pie>
                              <Tooltip content={<CustomTooltip />} />
                            </PieChart>
                          </ResponsiveContainer>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
