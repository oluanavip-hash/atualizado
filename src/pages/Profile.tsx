import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { User, Lock, Save, Loader2, Crown } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { ProfilePictureUploader } from "@/components/ProfilePictureUploader";
import { useNavigate } from "react-router-dom";

const Profile = () => {
  const { user, profile, loading: authLoading, fetchProfile, isProUser } = useAuth();
  const [name, setName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (profile?.name) {
      setName(profile.name);
    }
  }, [profile]);

  const handleSaveProfile = async () => {
    if (!user || !name.trim()) {
      toast({ title: "Erro", description: "O nome não pode estar vazio.", variant: "destructive" });
      return;
    }
    
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ name: name.trim() })
        .eq('user_id', user.id);
        
      if (error) throw error;
      
      await fetchProfile(user); // Refetch profile to update UI
      toast({
        title: "Perfil atualizado!",
        description: "Suas informações foram salvas com sucesso."
      });
    } catch (error) {
      console.error('Error saving profile', error);
      toast({ title: 'Erro', description: 'Não foi possível salvar seu perfil.', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleChangePassword = async () => {
    toast({
      title: "Recurso em desenvolvimento",
      description: "A alteração de senha estará disponível em breve."
    });
  };

  return (
    <>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-foreground">Meu Perfil</h1>
        <p className="text-muted-foreground">
          Gerencie suas informações pessoais e configurações da conta.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile & Subscription Card */}
        <div className="space-y-6">
          <Card className="bg-gradient-card border-glass-border shadow-card animate-fadeIn">
            <CardHeader className="text-center flex flex-col items-center">
              <ProfilePictureUploader />
              <CardTitle className="text-foreground mt-4">{profile?.name}</CardTitle>
              <CardDescription className="text-muted-foreground">
                Membro desde {profile ? new Date(profile.created_at).toLocaleDateString('pt-BR') : ''}
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="bg-gradient-card border-glass-border shadow-card animate-fadeIn">
            <CardHeader>
              <CardTitle className="text-foreground flex items-center gap-2">
                <Crown className="h-5 w-5 text-primary" />
                Minha Assinatura
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-secondary/20 rounded-lg border border-glass-border">
                <div>
                  <h4 className="text-foreground font-medium">Plano Atual</h4>
                  <Badge className={isProUser ? "bg-primary/80 text-primary-foreground" : ""}>
                    {isProUser ? "PRO" : "Gratuito"}
                  </Badge>
                </div>
                <Button
                  variant="outline"
                  onClick={() => navigate('/subscription')}
                  className="border-primary/30 hover:bg-primary/10"
                >
                  {isProUser ? "Gerenciar" : "Fazer Upgrade"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Profile Information & Security */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="bg-gradient-card border-glass-border shadow-card animate-fadeIn">
            <CardHeader>
              <CardTitle className="text-foreground flex items-center gap-2">
                <User className="h-5 w-5" />
                Informações Pessoais
              </CardTitle>
              <CardDescription className="text-muted-foreground">
                Atualize seus dados pessoais
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nome Completo</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Seu nome completo"
                  className="bg-input/50 border-glass-border"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={user?.email || ""}
                  disabled
                  className="bg-input/50 border-glass-border disabled:opacity-70"
                />
              </div>
              <div className="flex justify-end pt-4">
                <Button
                  onClick={handleSaveProfile}
                  disabled={isLoading || authLoading}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-neon"
                >
                  {isLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                  {isLoading ? "Salvando..." : "Salvar Alterações"}
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-card border-glass-border shadow-card animate-fadeIn">
            <CardHeader>
              <CardTitle className="text-foreground flex items-center gap-2">
                <Lock className="h-5 w-5" />
                Segurança
              </CardTitle>
              <CardDescription className="text-muted-foreground">
                Gerencie a segurança da sua conta
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-secondary/20 rounded-lg border border-glass-border">
                <div>
                  <h4 className="text-foreground font-medium">Alterar Senha</h4>
                  <p className="text-sm text-muted-foreground">
                    Recomendamos alterar sua senha periodicamente.
                  </p>
                </div>
                <Button
                  variant="outline"
                  onClick={handleChangePassword}
                  className="border-primary/30 hover:bg-primary/10"
                >
                  <Lock className="h-4 w-4 mr-2" />
                  Alterar
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
};

export default Profile;
