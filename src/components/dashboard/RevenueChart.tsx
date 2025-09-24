import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { useRevenueData } from "@/hooks/useRevenueData";
import { useState } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-card/90 backdrop-blur-sm border border-glass-border rounded-lg p-3 shadow-elevated">
        <p className="text-foreground font-medium mb-2">{label}</p>
        {payload.map((entry: any, index: number) => (
          <p key={index} style={{ color: entry.color }} className="font-semibold">
            {entry.dataKey === 'receitas' ? 'Receitas' : 'Despesas'}: R$ {entry.value.toLocaleString('pt-BR')}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export function RevenueChart() {
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();
  const { data, loading } = useRevenueData(startDate, endDate);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const totalReceitas = data.reduce((sum, item) => sum + item.receitas, 0);
  const totalDespesas = data.reduce((sum, item) => sum + item.despesas, 0);

  const clearFilters = () => {
    setStartDate(undefined);
    setEndDate(undefined);
  };

  return (
    <Card className="bg-gradient-card border-glass-border shadow-card animate-fadeIn">
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <CardTitle className="text-foreground">Receitas vs Despesas</CardTitle>
            <CardDescription className="text-muted-foreground">
              {startDate && endDate 
                ? `Período: ${format(startDate, "dd/MM/yyyy")} - ${format(endDate, "dd/MM/yyyy")}`
                : "Comparativo mensal dos últimos 6 meses"
              }
            </CardDescription>
          </div>
          <div className="flex gap-2">
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

            {(startDate || endDate) && (
              <Button variant="outline" onClick={clearFilters} className="border-glass-border">
                Limpar
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {startDate && endDate && (
          <div className="mb-4 grid grid-cols-2 gap-4">
            <div className="bg-card/30 rounded-lg p-3 border border-glass-border">
              <p className="text-sm text-muted-foreground">Total Receitas</p>
              <p className="text-lg font-semibold text-green-400">{formatCurrency(totalReceitas)}</p>
            </div>
            <div className="bg-card/30 rounded-lg p-3 border border-glass-border">
              <p className="text-sm text-muted-foreground">Total Despesas</p>
              <p className="text-lg font-semibold text-red-400">{formatCurrency(totalDespesas)}</p>
            </div>
          </div>
        )}
        
        <div className="h-[300px] w-full">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <p className="text-muted-foreground">Carregando dados...</p>
            </div>
          ) : data.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <p className="text-muted-foreground">Nenhum dado encontrado para o período selecionado</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                <XAxis 
                  dataKey="month" 
                  stroke="#888"
                  fontSize={12}
                />
                <YAxis 
                  stroke="#888"
                  fontSize={12}
                  tickFormatter={(value) => `R$ ${value}`}
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="receitas" fill="hsl(var(--chart-color-2))" radius={[4, 4, 0, 0]} />
                <Bar dataKey="despesas" fill="hsl(var(--chart-color-3))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
