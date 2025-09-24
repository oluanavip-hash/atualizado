import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "./AppSidebar";
import { Outlet } from "react-router-dom";

export function DashboardLayout() {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar />
        
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Top header with mobile trigger */}
          <header className="h-14 border-b border-glass-border bg-card/30 backdrop-blur-sm flex items-center px-4 lg:hidden">
            <SidebarTrigger className="mr-4 rounded-md border border-primary/40 text-primary bg-primary/10 hover:bg-primary/20 shadow-neon" />
            <h1 className="font-semibold text-foreground">Souza Gestão</h1>
          </header>
          
          {/* Main content */}
          <main className="flex-1 overflow-auto">
            <div className="container mx-auto p-4 lg:p-6 space-y-6">
              <Outlet />
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
