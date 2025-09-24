import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Home, AlertTriangle } from "lucide-react";

const NotFound = () => {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 text-center relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-glow opacity-30"></div>
      <div className="relative z-10 animate-fadeIn">
        <AlertTriangle className="mx-auto h-16 w-16 text-primary animate-float mb-6" />
        <h1 className="text-6xl font-extrabold text-foreground mb-4">404</h1>
        <p className="text-xl text-muted-foreground mb-8">
          Oops! A página que você está procurando não foi encontrada.
        </p>
        <Button asChild className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-neon">
          <Link to="/dashboard">
            <Home className="mr-2 h-4 w-4" />
            Voltar para o Dashboard
          </Link>
        </Button>
      </div>
    </div>
  );
};

export default NotFound;
