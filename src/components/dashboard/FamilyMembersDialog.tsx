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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, X } from "lucide-react";
import { useFamilyMembers } from "@/hooks/useFamilyMembers";

interface FamilyMembersDialogProps {
  onMembersChange?: () => void;
  children: React.ReactNode;
}

const colors = [
  "#3b82f6", "#ef4444", "#10b981", "#f59e0b", "#8b5cf6", 
  "#ec4899", "#06b6d4", "#84cc16", "#f97316", "#6366f1"
];

export function FamilyMembersDialog({ onMembersChange, children }: FamilyMembersDialogProps) {
  const [open, setOpen] = useState(false);
  const [newMemberName, setNewMemberName] = useState("");
  const [selectedColor, setSelectedColor] = useState(colors[0]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { members, loading, addMember, deleteMember } = useFamilyMembers();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMemberName.trim()) return;

    setIsSubmitting(true);
    try {
      await addMember(newMemberName.trim(), selectedColor);
      setNewMemberName("");
      setSelectedColor(colors[0]);
      onMembersChange?.();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteMember = async (id: string) => {
    await deleteMember(id);
    onMembersChange?.();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Membros da Família</DialogTitle>
          <DialogDescription>
            Gerencie os membros da família que podem registrar transações.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Lista de membros existentes */}
          <div className="space-y-2">
            <Label>Membros Atuais</Label>
            {loading ? (
              <p className="text-sm text-muted-foreground">Carregando...</p>
            ) : members.length === 0 ? (
              <p className="text-sm text-muted-foreground">Nenhum membro cadastrado</p>
            ) : (
              <div className="space-y-2">
                {members.map((member) => (
                  <div
                    key={member.id}
                    className="flex items-center justify-between p-2 border border-glass-border rounded-lg bg-card/30"
                  >
                    <div className="flex items-center gap-2">
                      <div
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: member.color }}
                      />
                      <span className="text-sm">{member.name}</span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteMember(member.id)}
                      className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Formulário para adicionar novo membro */}
          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="space-y-2">
              <Label htmlFor="memberName">Adicionar Novo Membro</Label>
              <Input
                id="memberName"
                placeholder="Nome do membro"
                value={newMemberName}
                onChange={(e) => setNewMemberName(e.target.value)}
                className="bg-input/50 border-glass-border"
              />
            </div>

            <div className="space-y-2">
              <Label>Cor</Label>
              <div className="flex gap-2 flex-wrap">
                {colors.map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => setSelectedColor(color)}
                    className={`w-6 h-6 rounded-full border-2 ${
                      selectedColor === color ? "border-foreground" : "border-transparent"
                    }`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>

            <Button
              type="submit"
              disabled={!newMemberName.trim() || isSubmitting}
              className="w-full"
            >
              <Plus className="h-4 w-4 mr-2" />
              {isSubmitting ? "Adicionando..." : "Adicionar Membro"}
            </Button>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
