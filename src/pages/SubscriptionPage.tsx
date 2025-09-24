import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, Crown } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

const SubscriptionPage = () => {
  const { isProUser } = useAuth();

  const proFeatures = [
    "Transações e categorias ilimitadas",
    "Gerenciamento de membros da família",
    "Criação e acompanhamento de metas",
    "Relatórios financeiros detalhados",
    "Controle de contas mensais e pagas",
    "Suporte prioritário",
  ];

  const handleCheckout = (url: string) => {
    window.open(url, "_blank");
  };

  return (
    <div className="container mx-auto max-w-4xl py-8">
      <div className="text-center mb-12">
        <Crown className="mx-auto h-12 w-12 text-primary animate-float mb-4" />
        <h1 className="text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl">
          {isProUser ? "Você já é PRO!" : "Desbloqueie seu Potencial Financeiro"}
        </h1>
        <p className="mt-4 max-w-2xl mx-auto text-lg text-muted-foreground">
          {isProUser 
            ? "Obrigado por fazer parte da nossa comunidade PRO. Aproveite todos os recursos ilimitados."
            : "Escolha o plano PRO para ter acesso a todas as ferramentas e transformar sua gestão financeira."
          }
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
        {/* Plano Mensal */}
        <Card className="bg-gradient-card border-glass-border shadow-card">
          <CardHeader>
            <CardTitle className="text-2xl text-foreground">Plano Mensal</CardTitle>
            <CardDescription className="text-muted-foreground">Flexibilidade total para suas finanças.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center">
              <span className="text-4xl font-bold text-primary">R$ 9,99</span>
              <span className="text-muted-foreground">/mês</span>
            </div>
            <ul className="space-y-3 text-sm">
              {proFeatures.map((feature) => (
                <li key={feature} className="flex items-start gap-3">
                  <Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                  <span className="text-muted-foreground">{feature}</span>
                </li>
              ))}
            </ul>
          </CardContent>
          <CardFooter>
            <Button 
              className="w-full bg-primary/20 text-primary border border-primary/30 hover:bg-primary/30"
              onClick={() => handleCheckout("https://pay.cakto.com.br/3dtoyka_582425")}
              disabled={isProUser}
            >
              {isProUser ? "Plano Ativo" : "Assinar Plano Mensal"}
            </Button>
          </CardFooter>
        </Card>

        {/* Plano Anual */}
        <Card className="bg-gradient-card border-primary/50 shadow-neon relative overflow-hidden">
          <Badge className="absolute top-0 right-0 -mr-4 mt-4 bg-primary text-primary-foreground text-sm py-1 px-8 transform rotate-45">
            42% OFF
          </Badge>
          <CardHeader>
            <CardTitle className="text-2xl text-primary">Plano Anual</CardTitle>
            <CardDescription className="text-muted-foreground">O melhor custo-benefício para um ano de controle.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center">
              <span className="text-4xl font-bold text-primary">R$ 69,99</span>
              <span className="text-muted-foreground">/ano</span>
            </div>
            <ul className="space-y-3 text-sm">
              {proFeatures.map((feature) => (
                <li key={feature} className="flex items-start gap-3">
                  <Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                  <span className="text-muted-foreground">{feature}</span>
                </li>
              ))}
            </ul>
          </CardContent>
          <CardFooter>
            <Button 
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground shadow-neon"
              onClick={() => handleCheckout("https://pay.cakto.com.br/37zzfos_582426")}
              disabled={isProUser}
            >
              <Crown className="mr-2 h-4 w-4" />
              {isProUser ? "Plano Ativo" : "Quero ser PRO"}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default SubscriptionPage;
