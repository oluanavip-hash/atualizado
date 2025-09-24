import { useAuth } from "@/hooks/useAuth";
import { UpgradePrompt } from "./UpgradePrompt";

interface ProPageGuardProps {
  children: React.ReactNode;
}

export const ProPageGuard = ({ children }: ProPageGuardProps) => {
  const { isProUser, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (!isProUser) {
    return <UpgradePrompt />;
  }

  return <>{children}</>;
};
