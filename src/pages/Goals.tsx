import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Target, TrendingUp, DollarSign } from "lucide-react";
import { AddGoalDialog } from "@/components/goals/AddGoalDialog";
import { GoalCard } from "@/components/goals/GoalCard";
import { useGoals } from "@/hooks/useGoals";
import { ProPageGuard } from "@/components/ProPageGuard";

const GoalsContent = () => {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const { goals, loading, fetchGoals, deleteGoal, updateGoalAmount } = useGoals();

  const totalGoals = goals.length;
  const achievedGoals = goals.filter(goal => goal.current_amount >= goal.target_amount).length;
  const totalSaved = goals.reduce((sum, goal) => sum + goal.current_amount, 0);
  const totalTargets = goals.reduce((sum, goal) => sum + goal.target_amount, 0);

  const handleGoalAdded = () => {
    fetchGoals();
    setIsAddDialogOpen(false);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-foreground">Metas</h1>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="bg-card/50 backdrop-blur-sm border-glass-border animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                <div className="h-8 bg-muted rounded w-1/2"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Metas</h1>
          <p className="text-muted-foreground mt-1">
            Defina e acompanhe suas metas financeiras
          </p>
        </div>
        <Button 
          onClick={() => setIsAddDialogOpen(true)}
          className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-neon"
        >
          <Plus className="h-4 w-4 mr-2" />
          Nova Meta
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-card/50 backdrop-blur-sm border-glass-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total de Metas
            </CardTitle>
            <Target className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{totalGoals}</div>
          </CardContent>
        </Card>

        <Card className="bg-card/50 backdrop-blur-sm border-glass-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Metas Alcançadas
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{achievedGoals}</div>
            <p className="text-xs text-muted-foreground">
              {totalGoals > 0 ? `${Math.round((achievedGoals / totalGoals) * 100)}%` : '0%'} do total
            </p>
          </CardContent>
        </Card>

        <Card className="bg-card/50 backdrop-blur-sm border-glass-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Economizado
            </CardTitle>
            <DollarSign className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {new Intl.NumberFormat('pt-BR', {
                style: 'currency',
                currency: 'BRL'
              }).format(totalSaved)}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card/50 backdrop-blur-sm border-glass-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Objetivo Total
            </CardTitle>
            <Target className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {new Intl.NumberFormat('pt-BR', {
                style: 'currency',
                currency: 'BRL'
              }).format(totalTargets)}
            </div>
            <p className="text-xs text-muted-foreground">
              {totalTargets > 0 ? `${Math.round((totalSaved / totalTargets) * 100)}%` : '0%'} alcançado
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Goals Grid */}
      {goals.length === 0 ? (
        <Card className="bg-card/50 backdrop-blur-sm border-glass-border">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Target className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">
              Nenhuma meta criada ainda
            </h3>
            <p className="text-muted-foreground text-center mb-4">
              Comece definindo suas primeiras metas financeiras para acompanhar seu progresso.
            </p>
            <Button 
              onClick={() => setIsAddDialogOpen(true)}
              className="bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              <Plus className="h-4 w-4 mr-2" />
              Criar Primeira Meta
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {goals.map((goal) => (
            <GoalCard 
              key={goal.id} 
              goal={goal} 
              onDeleteGoal={deleteGoal}
              onAddAmount={updateGoalAmount}
            />
          ))}
        </div>
      )}

      <AddGoalDialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        onGoalAdded={handleGoalAdded}
      />
    </div>
  );
};

const Goals = () => {
  return (
    <ProPageGuard>
      <GoalsContent />
    </ProPageGuard>
  );
};

export default Goals;
