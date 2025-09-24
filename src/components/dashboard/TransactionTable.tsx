import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Filter, Search, X } from "lucide-react";
import { EditTransactionDialog } from "./EditTransactionDialog";
import { useTransactions } from "@/hooks/useTransactions";
import { useCategories } from "@/hooks/useCategories";
import { AddTransactionDialog } from "./AddTransactionDialog";
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

interface TransactionTableProps {
  onTransactionChange?: () => void;
}

export function TransactionTable({ onTransactionChange }: TransactionTableProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [visibleCount, setVisibleCount] = useState(10);
  const { transactions, loading, fetchTransactions, deleteTransaction } = useTransactions();
  const { categories } = useCategories();

  // Reset pagination on filters/updates
  useEffect(() => {
    setVisibleCount(10);
  }, [transactions, searchTerm, categoryFilter]);

  const handleTransactionAdded = () => {
    fetchTransactions();
    onTransactionChange?.();
  };

  const handleTransactionDeleted = async (id: string) => {
    await deleteTransaction(id);
    onTransactionChange?.();
  };

const filteredTransactions = transactions.filter(transaction => {
  const matchesSearch = transaction.description.toLowerCase().includes(searchTerm.toLowerCase());
  const matchesCategory = categoryFilter === "all" || transaction.categories?.name === categoryFilter;
  return matchesSearch && matchesCategory;
});

const visibleTransactions = filteredTransactions.slice(0, visibleCount);

const formatCurrency = (amount: number) => {
    const sign = amount >= 0 ? "+" : "";
    return `${sign} R$ ${Math.abs(amount).toLocaleString('pt-BR')}`;
  };

const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const formatDateTime = (dateTimeString: string) => {
    const date = new Date(dateTimeString);
    const dateStr = date.toLocaleDateString('pt-BR');
    const timeStr = date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    return { date: dateStr, time: timeStr };
  };

  const getAmountStyle = (amount: number) => {
    return amount >= 0 ? "text-green-400" : "text-red-400";
  };

  const getBadgeVariant = (type: string) => {
    return type === "income" ? "default" : "secondary";
  };

  return (
    <Card className="bg-gradient-card border-glass-border shadow-card animate-fadeIn">
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <CardTitle className="text-foreground">Transações Recentes</CardTitle>
            <CardDescription className="text-muted-foreground">
              Histórico de entradas e saídas
            </CardDescription>
          </div>
          <AddTransactionDialog onTransactionAdded={handleTransactionAdded} />
        </div>
        
        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mt-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar transações..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-input/50 border-glass-border"
            />
          </div>
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-full sm:w-[180px] bg-input/50 border-glass-border">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Filtrar por categoria" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas as categorias</SelectItem>
              {categories.map((category) => (
                <SelectItem key={category.id} value={category.name}>
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: category.color }}
                    />
                    {category.name}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-glass-border">
                <TableHead className="text-muted-foreground">Data</TableHead>
                <TableHead className="text-muted-foreground">Descrição</TableHead>
                <TableHead className="text-muted-foreground">Categoria</TableHead>
                <TableHead className="text-right text-muted-foreground">Valor</TableHead>
                <TableHead className="text-right text-muted-foreground">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                    Carregando transações...
                  </TableCell>
                </TableRow>
              ) : filteredTransactions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                    Nenhuma transação encontrada.
                  </TableCell>
                </TableRow>
              ) : (
                visibleTransactions.map((transaction) => (
                  <TableRow key={transaction.id} className="border-glass-border hover:bg-secondary/20">
                    <TableCell className="text-foreground">
                      <div className="flex flex-col">
                        <span>{formatDateTime(transaction.created_at).date}</span>
                        <span className="text-xs text-muted-foreground">{formatDateTime(transaction.created_at).time}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-foreground font-medium">
                      <div className="flex flex-col">
                        <span>{transaction.description}</span>
                        {transaction.family_members && (
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <div 
                              className="w-2 h-2 rounded-full" 
                              style={{ backgroundColor: transaction.family_members.color }}
                            />
                            {transaction.family_members.name}
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getBadgeVariant(transaction.type)}>
                        <div className="flex items-center gap-1">
                          <div 
                            className="w-2 h-2 rounded-full" 
                            style={{ backgroundColor: transaction.categories?.color }}
                          />
                          {transaction.categories?.name}
                        </div>
                      </Badge>
                    </TableCell>
                    <TableCell className={`text-right font-semibold ${getAmountStyle(transaction.amount)}`}>
                      {formatCurrency(transaction.amount)}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex gap-1 justify-end">
                        <EditTransactionDialog 
                          transaction={transaction} 
                          onTransactionUpdated={handleTransactionAdded}
                        />
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-destructive hover:bg-destructive/10"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent className="bg-card border-glass-border">
                            <AlertDialogHeader>
                              <AlertDialogTitle className="text-foreground">Excluir Transação</AlertDialogTitle>
                              <AlertDialogDescription className="text-muted-foreground">
                                Tem certeza que deseja excluir esta transação? Esta ação não pode ser desfeita.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel className="border-glass-border">Cancelar</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleTransactionDeleted(transaction.id)}
                                className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
                              >
                                Excluir
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
        {filteredTransactions.length > visibleCount && (
          <div className="flex justify-center mt-4">
            <Button variant="outline" className="border-glass-border" onClick={() => setVisibleCount((c) => c + 10)}>
              Ver mais compras
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
