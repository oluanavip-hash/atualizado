import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Crown } from "lucide-react";
import { useNavigate } from "react-router-dom";

export const UpgradePrompt = () => {
  const navigate = useNavigate();

  return (
    <div className="flex items-center justify-center h-full p-4">
      <Card className="max-w-lg w-full bg-gradient-card border-glass-border shadow-card text-center animate-fadeIn">
        <CardHeader>
          <Crown className="mx-auto h-12 w-12 text-primary animate-float mb-4" />
          <CardTitle className="text-2xl text-foreground">Recurso Exclusivo PRO</CardTitle>
          <CardDescription className="text-muted-foreground">
            Esta funcionalidade está disponível apenas para assinantes do plano PRO.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="mb-6">
            Faça o upgrade agora para desbloquear este e muitos outros recursos que irão transformar sua gestão financeira.
          </p>
          <Button 
            onClick={() => navigate('/subscription')}
            className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-primary-foreground shadow-neon"
          >
            <Crown className="mr-2 h-4 w-4" />
            Ver Planos PRO
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};
