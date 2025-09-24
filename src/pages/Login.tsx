import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LogIn, UserPlus } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

const Login = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [loginData, setLoginData] = useState({ email: '', password: '' });
  const [registerData, setRegisterData] = useState({ name: '', email: '', password: '' });
  const navigate = useNavigate();
  const { signIn, signUp, user } = useAuth();

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      navigate("/dashboard");
    }
  }, [user, navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    const { error } = await signIn(loginData.email, loginData.password);
    
    if (!error) {
      navigate("/dashboard");
    }
    
    setIsLoading(false);
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    const { error } = await signUp(registerData.email, registerData.password, registerData.name);
    
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background glow effect */}
      <div className="absolute inset-0 bg-gradient-glow opacity-30"></div>
      
      <div className="w-full max-w-md relative z-10 animate-fadeIn">
        {/* Logo Section */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <img src="/src/assets/logo.png" alt="Souza Gestão" className="h-20 w-auto animate-glow" />
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Souza Gestão
          </h1>
          <p className="text-muted-foreground">
            Controle financeiro inteligente
          </p>
        </div>

        <Card className="bg-card/50 backdrop-blur-sm border-glass-border shadow-card">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl text-center text-foreground">
              Acesse sua conta
            </CardTitle>
            <CardDescription className="text-center text-muted-foreground">
              Entre com suas credenciais ou crie uma nova conta
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="login" className="w-full">
              <TabsList className="grid w-full grid-cols-2 bg-secondary/50">
                <TabsTrigger value="login" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                  <LogIn className="h-4 w-4 mr-2" />
                  Entrar
                </TabsTrigger>
                <TabsTrigger value="register" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                  <UserPlus className="h-4 w-4 mr-2" />
                  Cadastrar
                </TabsTrigger>
              </TabsList>

              <TabsContent value="login">
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="seu@email.com"
                      required
                      value={loginData.email}
                      onChange={(e) => setLoginData(prev => ({ ...prev, email: e.target.value }))}
                      className="bg-input/50 border-glass-border focus:border-primary focus:ring-primary"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">Senha</Label>
                    <Input
                      id="password"
                      type="password"
                      placeholder="••••••••"
                      required
                      value={loginData.password}
                      onChange={(e) => setLoginData(prev => ({ ...prev, password: e.target.value }))}
                      className="bg-input/50 border-glass-border focus:border-primary focus:ring-primary"
                    />
                  </div>
                  <Button 
                    type="submit" 
                    className="w-full bg-primary hover:bg-primary/90 text-primary-foreground shadow-neon transition-all duration-300 hover:shadow-elevated"
                    disabled={isLoading}
                  >
                    {isLoading ? "Entrando..." : "Entrar"}
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="register">
                <form onSubmit={handleRegister} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nome completo</Label>
                    <Input
                      id="name"
                      type="text"
                      placeholder="Seu nome"
                      required
                      value={registerData.name}
                      onChange={(e) => setRegisterData(prev => ({ ...prev, name: e.target.value }))}
                      className="bg-input/50 border-glass-border focus:border-primary focus:ring-primary"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email-register">Email</Label>
                    <Input
                      id="email-register"
                      type="email"
                      placeholder="seu@email.com"
                      required
                      value={registerData.email}
                      onChange={(e) => setRegisterData(prev => ({ ...prev, email: e.target.value }))}
                      className="bg-input/50 border-glass-border focus:border-primary focus:ring-primary"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password-register">Senha</Label>
                    <Input
                      id="password-register"
                      type="password"
                      placeholder="••••••••"
                      required
                      value={registerData.password}
                      onChange={(e) => setRegisterData(prev => ({ ...prev, password: e.target.value }))}
                      className="bg-input/50 border-glass-border focus:border-primary focus:ring-primary"
                    />
                  </div>
                  <Button 
                    type="submit" 
                    className="w-full bg-primary hover:bg-primary/90 text-primary-foreground shadow-neon transition-all duration-300 hover:shadow-elevated"
                    disabled={isLoading}
                  >
                    {isLoading ? "Criando conta..." : "Criar conta"}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        <p className="text-center text-sm text-muted-foreground mt-6">
          Sistema seguro de gestão financeira
        </p>
      </div>
    </div>
  );
};

export default Login;
