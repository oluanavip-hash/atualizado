import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";
import { Crown, LogOut, Check } from "lucide-react";
import { useToast } from "./ui/use-toast";

export const SubscriptionModal = () => {
  const { signOut } = useAuth();
  const { toast } = useToast();

  const handleSubscribe = () => {
    // Placeholder for payment integration
    toast({
      title: "Funcionalidade em desenvolvimento",
      description: "A integração de pagamento estará disponível em breve. Entre em contato com o suporte para mais informações.",
    });
  };

  return (
    <div className="min-h-screen bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-card border-glass-border shadow-elevated animate-fadeIn">
        <CardHeader className="text-center">
          <Crown className="mx-auto h-12 w-12 text-primary animate-float" />
          <CardTitle className="text-2xl text-foreground mt-4">Seu período de teste terminou</CardTitle>
          <CardDescription className="text-muted-foreground">
            Para continuar usando todos os recursos do Souza Gestão, por favor, assine nosso plano.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          <div className="bg-primary/10 border border-primary/30 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-foreground">Plano Mensal</h3>
            <p className="text-4xl font-bold text-primary my-2">R$ 9,99</p>
            <p className="text-muted-foreground">por mês</p>
          </div>
          <ul className="text-left mt-6 space-y-2 text-sm text-muted-foreground">
            <li className="flex items-center gap-2"><Check className="h-4 w-4 text-primary" /> Transações ilimitadas</li>
            <li className="flex items-center gap-2"><Check className="h-4 w-4 text-primary" /> Gerenciamento de família</li>
            <li className="flex items-center gap-2"><Check className="h-4 w-4 text-primary" /> Relatórios detalhados</li>
            <li className="flex items-center gap-2"><Check className="h-4 w-4 text-primary" /> Metas financeiras</li>
          </ul>
        </CardContent>
        <CardFooter className="flex flex-col gap-4">
          <Button onClick={handleSubscribe} className="w-full bg-primary hover:bg-primary/90 text-primary-foreground shadow-neon">
            <Crown className="mr-2 h-4 w-4" />
            Assinar Agora
          </Button>
          <Button variant="ghost" onClick={signOut} className="w-full text-muted-foreground">
            <LogOut className="mr-2 h-4 w-4" />
            Sair
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};
