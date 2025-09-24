import * as React from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { 
  LayoutDashboard, 
  Tag, 
  Target,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Users,
  CalendarDays,
  CreditCard,
  PieChart,
  Crown,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { FamilyMembersDialog } from "@/components/dashboard/FamilyMembersDialog";
import { MonthlyBillsDialog } from "@/components/dashboard/MonthlyBillsDialog";
import { PaidBillsDialog } from "@/components/dashboard/PaidBillsDialog";
import { FamilyStatsDialog } from "@/components/dashboard/FamilyStatsDialog";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Badge } from "../ui/badge";

const ProFeatureWrapper = ({ children }: { children: React.ReactNode }) => {
  const { isProUser } = useAuth();
  const navigate = useNavigate();

  if (isProUser) {
    return <>{children}</>;
  }

  const child = React.Children.only(children) as React.ReactElement;
  
  return (
    <div className="relative" onClick={() => navigate('/subscription')}>
      {React.cloneElement(child, {
        ...child.props,
        disabled: true,
        className: `${child.props.className} opacity-50 cursor-not-allowed`,
      })}
      <Badge variant="destructive" className="absolute top-1 right-1 bg-primary/80 text-primary-foreground text-[10px] px-1.5 py-0.5 pointer-events-none">
        PRO
      </Badge>
    </div>
  );
};

export function AppSidebar() {
  const { state, toggleSidebar } = useSidebar();
  const location = useLocation();
  const navigate = useNavigate();
  const { signOut, profile, isProUser } = useAuth();
  const currentPath = location.pathname;
  const collapsed = state === "collapsed";

  const isActive = (path: string) => currentPath === path;
  
  const getNavClassName = (path: string) => {
    const baseClasses = "flex items-center gap-3 rounded-lg px-3 py-2 transition-all duration-200 hover:bg-secondary/50";
    return isActive(path) 
      ? `${baseClasses} bg-primary/20 text-primary border border-primary/30 shadow-neon` 
      : `${baseClasses} text-muted-foreground hover:text-foreground`;
  };

  const handleLogout = () => {
    signOut();
  };

  const handleDialogChange = () => {};
  
  const getInitials = (name: string | null | undefined) => {
    if (!name) return 'U';
    const names = name.split(' ');
    if (names.length > 1) {
      return `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase();
    }
    return name.charAt(0).toUpperCase();
  };

  const navigationItems = [
    { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard, pro: false },
    { title: "Categorias", url: "/categories", icon: Tag, pro: false },
    { title: "Metas", url: "/goals", icon: Target, pro: true },
  ];

  const shortcutItems = [
    { title: "Gerenciar Família", icon: Users, pro: true, dialog: <FamilyMembersDialog onMembersChange={handleDialogChange} /> },
    { title: "Contas Mensais", icon: CalendarDays, pro: true, dialog: <MonthlyBillsDialog onBillsChange={handleDialogChange} /> },
    { title: "Contas Pagas", icon: CreditCard, pro: true, dialog: <PaidBillsDialog onBillPaid={handleDialogChange} /> },
    { title: "Relatórios", icon: PieChart, pro: true, dialog: <FamilyStatsDialog /> },
  ];

  return (
    <Sidebar className={`${collapsed ? "w-16" : "w-64"} border-r border-glass-border bg-card/30 backdrop-blur-sm transition-all duration-300`}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-glass-border">
        {!collapsed && (
          <NavLink to="/dashboard" className="flex items-center gap-2 cursor-pointer">
            <img src="/src/assets/logo.png" alt="Souza Gestão" className="h-8 w-auto" />
            <span className="font-semibold text-primary">Souza Gestão</span>
          </NavLink>
        )}
        <Button
          variant="ghost"
          size="sm"
          onClick={toggleSidebar}
          className="h-8 w-8 p-0 hover:bg-secondary/50"
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </Button>
      </div>

      <SidebarContent className="px-2 py-4">
        {/* Profile Section */}
        <div className="px-2 mb-4">
          <NavLink to="/profile" className={getNavClassName("/profile")}>
            <Avatar className="h-8 w-8">
              <AvatarImage src={profile?.avatar_url || undefined} alt={profile?.name || 'User'} />
              <AvatarFallback className="bg-primary/20 text-primary">
                {getInitials(profile?.name)}
              </AvatarFallback>
            </Avatar>
            {!collapsed && (
              <div className="flex flex-col">
                <span className="font-medium text-sm text-foreground">{profile?.name || 'Usuário'}</span>
                <span className="text-xs text-muted-foreground">Ver Perfil</span>
              </div>
            )}
          </NavLink>
        </div>

        <SidebarGroup>
          <SidebarGroupLabel className={`px-3 text-xs font-medium text-muted-foreground ${collapsed ? "hidden" : ""}`}>
            MENU PRINCIPAL
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {navigationItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  {item.pro && !isProUser ? (
                     <div className="relative" onClick={() => navigate('/subscription')}>
                        <NavLink to={item.url} className={`${getNavClassName(item.url)} opacity-50 cursor-not-allowed`} onClick={(e) => e.preventDefault()}>
                          <item.icon className={`h-5 w-5`} />
                          {!collapsed && <span>{item.title}</span>}
                        </NavLink>
                        <Badge variant="destructive" className="absolute top-1 right-1 bg-primary/80 text-primary-foreground text-[10px] px-1.5 py-0.5 pointer-events-none">PRO</Badge>
                     </div>
                  ) : (
                    <NavLink to={item.url} className={getNavClassName(item.url)} title={collapsed ? item.title : undefined}>
                      <item.icon className={`h-5 w-5 ${isActive(item.url) ? "text-primary" : ""}`} />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  )}
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel className={`px-3 text-xs font-medium text-muted-foreground ${collapsed ? "hidden" : ""}`}>
            ATALHOS
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {shortcutItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  {item.pro && !isProUser ? (
                    <ProFeatureWrapper>
                      <SidebarMenuButton className="w-full justify-start" title={collapsed ? item.title : undefined}>
                        <item.icon className="h-5 w-5" />
                        {!collapsed && <span>{item.title}</span>}
                      </SidebarMenuButton>
                    </ProFeatureWrapper>
                  ) : (
                    React.cloneElement(item.dialog, { children: (
                      <SidebarMenuButton className="w-full justify-start" title={collapsed ? item.title : undefined}>
                        <item.icon className="h-5 w-5" />
                        {!collapsed && <span>{item.title}</span>}
                      </SidebarMenuButton>
                    )})
                  )}
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {!isProUser && !collapsed && (
          <div className="px-4 mt-6">
            <div className="bg-primary/10 border border-primary/30 rounded-lg p-4 text-center">
              <Crown className="mx-auto h-8 w-8 text-primary mb-2" />
              <h4 className="font-semibold text-foreground">Seja PRO</h4>
              <p className="text-xs text-muted-foreground mb-3">Desbloqueie todos os recursos.</p>
              <Button size="sm" className="w-full bg-primary text-primary-foreground" onClick={() => navigate('/subscription')}>
                Fazer Upgrade
              </Button>
            </div>
          </div>
        )}

        {/* Logout button at bottom */}
        <div className="mt-auto p-2">
          <Button
            onClick={handleLogout}
            variant="ghost"
            className={`w-full justify-start gap-3 text-muted-foreground hover:text-foreground hover:bg-destructive/10 ${collapsed ? "px-2" : "px-3"}`}
            title={collapsed ? "Sair" : undefined}
          >
            <LogOut className="h-5 w-5" />
            {!collapsed && <span>Sair</span>}
          </Button>
        </div>
      </SidebarContent>
    </Sidebar>
  );
}
