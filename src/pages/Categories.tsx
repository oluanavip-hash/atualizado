import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Edit, Trash2, Tag, RefreshCw, Crown } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useCategories } from "@/hooks/useCategories";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const CATEGORY_LIMIT_FREE = 5;

const Categories = () => {
  const { categories, loading, fetchCategories, deleteCategory } = useCategories();
  const [newCategory, setNewCategory] = useState({ name: "", type: "expense", color: "#ff0040" });
  const [isOpen, setIsOpen] = useState(false);
  const [showUpgradeAlert, setShowUpgradeAlert] = useState(false);
  const { toast } = useToast();
  const { user, isProUser } = useAuth();
  const navigate = useNavigate();

  const handleOpenAddDialog = () => {
    if (!isProUser && categories.length >= CATEGORY_LIMIT_FREE) {
      setShowUpgradeAlert(true);
    } else {
      setIsOpen(true);
    }
  };

  const handleAddCategory = async () => {
    if (!newCategory.name.trim()) {
      toast({
        title: "Erro",
        description: "Nome da categoria é obrigatório.",
        variant: "destructive"
      });
      return;
    }

    if (!user) return;

    try {
      const { error } = await supabase
        .from("categories")
        .insert({
          user_id: user.id,
          name: newCategory.name,
          type: newCategory.type,
          color: newCategory.color
        });

      if (error) throw error;

      setNewCategory({ name: "", type: "expense", color: "#ff0040" });
      setIsOpen(false);
      fetchCategories();
      
      toast({
        title: "Categoria criada!",
        description: `A categoria "${newCategory.name}" foi adicionada com sucesso.`
      });
    } catch (error) {
      console.error("Error creating category:", error);
      toast({
        title: "Erro",
        description: "Erro ao criar categoria.",
        variant: "destructive"
      });
    }
  };

  const handleDeleteCategory = async (id: string) => {
    await deleteCategory(id);
  };

  const getTypeLabel = (type: string) => {
    return type === "income" ? "Receita" : "Despesa";
  };

  const getTypeBadgeVariant = (type: string) => {
    return type === "income" ? "default" : "secondary";
  };

  return (
    <>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Gerenciar Categorias</h1>
          <p className="text-muted-foreground">
            Organize suas transações com categorias personalizadas.
          </p>
        </div>
        
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={fetchCategories}
            disabled={loading}
            className="border-glass-border"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Atualizar
          </Button>
        
          <Button onClick={handleOpenAddDialog} className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-neon">
            <Plus className="h-4 w-4 mr-2" />
            Nova Categoria
          </Button>
        </div>
      </div>

      {/* Categories Table */}
      <Card className="bg-gradient-card border-glass-border shadow-card animate-fadeIn">
        <CardHeader>
          <CardTitle className="text-foreground flex items-center gap-2">
            <Tag className="h-5 w-5" />
            Suas Categorias
          </CardTitle>
          <CardDescription className="text-muted-foreground">
            {loading ? "Carregando..." : `${categories.length} categorias criadas`}
            {!isProUser && ` de ${CATEGORY_LIMIT_FREE} disponíveis no plano Free.`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-glass-border">
                  <TableHead className="text-muted-foreground">Categoria</TableHead>
                  <TableHead className="text-muted-foreground">Tipo</TableHead>
                  <TableHead className="text-muted-foreground">Cor</TableHead>
                  <TableHead className="text-right text-muted-foreground">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                      Carregando categorias...
                    </TableCell>
                  </TableRow>
                ) : categories.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                      Nenhuma categoria encontrada.
                    </TableCell>
                  </TableRow>
                ) : (
                  categories.map((category) => (
                    <TableRow key={category.id} className="border-glass-border hover:bg-secondary/20">
                      <TableCell className="text-foreground font-medium">
                        {category.name}
                      </TableCell>
                      <TableCell>
                        <Badge variant={getTypeBadgeVariant(category.type)}>
                          {getTypeLabel(category.type)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div
                            className="w-4 h-4 rounded-full border border-glass-border"
                            style={{ backgroundColor: category.color }}
                          />
                          <span className="text-muted-foreground text-sm">{category.color}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 text-red-400 hover:text-red-300"
                            onClick={() => handleDeleteCategory(category.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Add Category Dialog */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="bg-card border-glass-border">
          <DialogHeader>
            <DialogTitle className="text-foreground">Criar Nova Categoria</DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Adicione uma nova categoria para organizar suas transações.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome da Categoria</Label>
              <Input
                id="name"
                value={newCategory.name}
                onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
                placeholder="Ex: Alimentação, Lazer, etc."
                className="bg-input/50 border-glass-border"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="type">Tipo</Label>
              <Select value={newCategory.type} onValueChange={(value) => setNewCategory({ ...newCategory, type: value })}>
                <SelectTrigger className="bg-input/50 border-glass-border">
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="expense">Despesa</SelectItem>
                  <SelectItem value="income">Receita</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="color">Cor</Label>
              <div className="flex items-center gap-2">
                <input
                  id="color"
                  type="color"
                  value={newCategory.color}
                  onChange={(e) => setNewCategory({ ...newCategory, color: e.target.value })}
                  className="w-12 h-10 border border-glass-border rounded-md cursor-pointer"
                />
                <Input
                  value={newCategory.color}
                  onChange={(e) => setNewCategory({ ...newCategory, color: e.target.value })}
                  placeholder="#ff0040"
                  className="bg-input/50 border-glass-border"
                />
              </div>
            </div>
            <div className="flex gap-2 pt-4">
              <Button onClick={handleAddCategory} className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground">
                Criar Categoria
              </Button>
              <Button variant="outline" onClick={() => setIsOpen(false)} className="flex-1">
                Cancelar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Upgrade Alert Dialog */}
      <AlertDialog open={showUpgradeAlert} onOpenChange={setShowUpgradeAlert}>
        <AlertDialogContent className="bg-card border-glass-border">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-foreground">
              <Crown className="h-6 w-6 text-primary" />
              Limite do Plano Gratuito Atingido
            </AlertDialogTitle>
            <AlertDialogDescription className="text-muted-foreground">
              Você atingiu o limite de {CATEGORY_LIMIT_FREE} categorias. Para criar categorias ilimitadas e desbloquear todos os recursos, faça o upgrade para o plano PRO.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-glass-border">Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => navigate('/subscription')}
              className="bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              Fazer Upgrade
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default Categories;
