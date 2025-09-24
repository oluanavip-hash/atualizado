import React from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useTransactions } from "@/hooks/useTransactions";
import { useCategories } from "@/hooks/useCategories";

// Chart colors using CSS variables for consistency
const chartColors = [
  "hsl(var(--chart-color-1))",
  "hsl(var(--chart-color-2))", 
  "hsl(var(--chart-color-3))",
  "hsl(var(--chart-color-4))",
  "hsl(var(--chart-color-5))",
  "hsl(var(--chart-color-6))",
  "hsl(var(--chart-color-7))",
  "hsl(var(--chart-color-8))",
  "hsl(var(--chart-color-9))",
  "hsl(var(--chart-color-10))",
];

const RADIAN = Math.PI / 180;

const renderCustomizedLabel = ({
  cx, cy, midAngle, innerRadius, outerRadius, percent
}: any) => {
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  return (
    <text 
      x={x} 
      y={y} 
      fill="white" 
      textAnchor={x > cx ? 'start' : 'end'} 
      dominantBaseline="central"
      fontSize={12}
      fontWeight="bold"
    >
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
};

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0];
    return (
      <div className="bg-card/90 backdrop-blur-sm border border-glass-border rounded-lg p-3 shadow-elevated">
        <p className="text-foreground font-medium">{data.name}</p>
        <p className="text-primary font-bold">
          R$ {data.value.toLocaleString('pt-BR')}
        </p>
      </div>
    );
  }
  return null;
};

export function ExpenseChart() {
  const { transactions } = useTransactions();
  const { categories } = useCategories();

  // Calculate expense data from real transactions
  const expenseData = React.useMemo(() => {
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    
    const monthlyExpenses = transactions.filter(t => {
      const transactionDate = new Date(t.date);
      return t.type === "expense" && 
             transactionDate.getMonth() === currentMonth && 
             transactionDate.getFullYear() === currentYear;
    });

    const categoryTotals = monthlyExpenses.reduce((acc, transaction) => {
      const categoryName = transaction.categories?.name || "Outros";
      acc[categoryName] = (acc[categoryName] || 0) + Math.abs(Number(transaction.amount));
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(categoryTotals)
      .map(([name, value], index) => ({
        name,
        value,
        color: chartColors[index % chartColors.length]
      }))
      .sort((a, b) => b.value - a.value);
  }, [transactions]);

  if (expenseData.length === 0) {
    return (
      <Card className="bg-gradient-card border-glass-border shadow-card animate-fadeIn">
        <CardHeader>
          <CardTitle className="text-foreground">Distribuição de Gastos</CardTitle>
          <CardDescription className="text-muted-foreground">
            Percentual por categoria neste mês
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] w-full flex items-center justify-center">
            <p className="text-muted-foreground">Nenhuma despesa registrada neste mês</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-gradient-card border-glass-border shadow-card animate-fadeIn">
      <CardHeader>
        <CardTitle className="text-foreground">Distribuição de Gastos</CardTitle>
        <CardDescription className="text-muted-foreground">
          Percentual por categoria neste mês
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={expenseData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={renderCustomizedLabel}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {expenseData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend 
                wrapperStyle={{ 
                  color: '#fff',
                  fontSize: '14px'
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
