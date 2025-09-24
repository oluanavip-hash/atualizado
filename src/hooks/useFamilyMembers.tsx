import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { useToast } from "./use-toast";

export interface FamilyMember {
  id: string;
  name: string;
  color: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  user_id: string;
}

export function useFamilyMembers() {
  const [members, setMembers] = useState<FamilyMember[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchMembers = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from("family_members")
        .select("*")
        .eq("user_id", user.id)
        .eq("is_active", true)
        .order("name");

      if (error) throw error;
      setMembers(data || []);
    } catch (error) {
      console.error("Error fetching family members:", error);
      toast({
        title: "Erro",
        description: "Erro ao carregar membros da família.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const addMember = async (name: string, color: string) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from("family_members")
        .insert({
          user_id: user.id,
          name,
          color,
        })
        .select()
        .single();

      if (error) throw error;

      setMembers(prev => [...prev, data]);
      toast({
        title: "Sucesso",
        description: "Membro da família adicionado com sucesso!",
      });
      return data;
    } catch (error) {
      console.error("Error adding family member:", error);
      toast({
        title: "Erro",
        description: "Erro ao adicionar membro da família.",
        variant: "destructive",
      });
    }
  };

  const updateMember = async (id: string, updates: Partial<FamilyMember>) => {
    try {
      const { data, error } = await supabase
        .from("family_members")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;

      setMembers(prev => prev.map(m => m.id === id ? data : m));
      toast({
        title: "Sucesso",
        description: "Membro da família atualizado com sucesso!",
      });
    } catch (error) {
      console.error("Error updating family member:", error);
      toast({
        title: "Erro",
        description: "Erro ao atualizar membro da família.",
        variant: "destructive",
      });
    }
  };

  const deleteMember = async (id: string) => {
    try {
      const { error } = await supabase
        .from("family_members")
        .update({ is_active: false })
        .eq("id", id);

      if (error) throw error;

      setMembers(prev => prev.filter(m => m.id !== id));
      toast({
        title: "Sucesso",
        description: "Membro da família removido com sucesso!",
      });
    } catch (error) {
      console.error("Error deleting family member:", error);
      toast({
        title: "Erro",
        description: "Erro ao remover membro da família.",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchMembers();
  }, [user]);

  return {
    members,
    loading,
    fetchMembers,
    addMember,
    updateMember,
    deleteMember,
  };
}
