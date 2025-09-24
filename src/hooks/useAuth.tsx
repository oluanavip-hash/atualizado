import { createContext, useContext, useEffect, useState } from 'react';
import { User, Session, AuthError } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Database } from '@/integrations/supabase/types';

type Profile = Database['public']['Tables']['profiles']['Row'];

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  loading: boolean;
  isProUser: boolean;
  fetchProfile: (currentUser: User | null) => Promise<void>;
  signUp: (email: string, password: string, name?: string) => Promise<{ error: AuthError | null }>;
  signIn: (email: string, password: string) => Promise<{ error: AuthError | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const isProUser = profile?.subscription_tier === 'pro';

  const fetchProfile = async (currentUser: User | null) => {
    if (currentUser) {
      const { data: profileData, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', currentUser.id)
        .single();
      
      if (error) {
        console.error('Error fetching profile:', error.message);
        setProfile(null);
      } else {
        setProfile(profileData as Profile);
      }
    } else {
      setProfile(null);
    }
  };

  useEffect(() => {
    setLoading(true);
    // Get initial session
    supabase.auth.getSession()
      .then(async ({ data: { session } }) => {
        setSession(session);
        const currentUser = session?.user ?? null;
        setUser(currentUser);
        await fetchProfile(currentUser);
      })
      .catch((err) => {
        console.error("Error getting session:", err);
        toast({
          title: "Erro de Autenticação",
          description: "Não foi possível conectar ao serviço de autenticação. Verifique suas credenciais do Supabase.",
          variant: "destructive",
        });
      })
      .finally(() => {
        setLoading(false);
      });

    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        const currentUser = session?.user ?? null;
        setUser(currentUser);
        await fetchProfile(currentUser);
        if (event !== 'INITIAL_SESSION') {
          setLoading(false);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string, name?: string) => {
    const redirectUrl = `${window.location.origin}/`;
    
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: {
          name: name || 'Usuário'
        }
      }
    });

    if (error) {
      toast({
        title: "Erro no cadastro",
        description: error.message,
        variant: "destructive"
      });
    } else {
      toast({
        title: "Conta criada com sucesso!",
        description: "Verifique seu email para confirmar a conta.",
      });
    }

    return { error };
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      toast({
        title: "Erro no login",
        description: error.message,
        variant: "destructive"
      });
    } else {
      toast({
        title: "Login realizado com sucesso!",
        description: "Redirecionando para o dashboard...",
      });
    }

    return { error };
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast({
        title: "Erro ao sair",
        description: error.message,
        variant: "destructive"
      });
    } else {
      toast({
        title: "Logout realizado",
        description: "Até logo!",
      });
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      session,
      profile,
      loading,
      isProUser,
      fetchProfile,
      signUp,
      signIn,
      signOut
    }}>
      {children}
    </AuthContext.Provider>
  );
};
