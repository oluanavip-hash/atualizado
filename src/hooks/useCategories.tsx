import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { useToast } from "./use-toast";

export interface Category {
  id: string;
  name: string;
  type: string;
  color: string;
  created_at: string;
  user_id: string;
}

export function useCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchCategories = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from("categories")
        .select("*")
        .eq("user_id", user.id)
        .order("name");

      if (error) throw error;
      setCategories(data || []);
    } catch (error) {
      console.error("Error fetching categories:", error);
      toast({
        title: "Erro",
        description: "Erro ao carregar categorias.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const deleteCategory = async (id: string) => {
    try {
      const { error } = await supabase
        .from("categories")
        .delete()
        .eq("id", id);

      if (error) throw error;

      setCategories(prev => prev.filter(c => c.id !== id));
      toast({
        title: "Sucesso",
        description: "Categoria excluída com sucesso!",
      });
    } catch (error) {
      console.error("Error deleting category:", error);
      toast({
        title: "Erro",
        description: "Erro ao excluir categoria.",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchCategories();
  }, [user]);

  return {
    categories,
    loading,
    fetchCategories,
    deleteCategory,
  };
}
