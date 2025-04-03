
import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Session, User } from '@supabase/supabase-js';
import { toast } from '@/hooks/use-toast';

type AuthContextType = {
  session: Session | null;
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{error: any}>;
  signUp: (email: string, password: string, username: string) => Promise<{error: any}>;
  signOut: () => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  availableAccounts: any[];
  switchAccount: (userId: string) => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [availableAccounts, setAvailableAccounts] = useState<any[]>([]);

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log("Auth state changed:", event, session?.user?.email);
        setSession(session);
        setUser(session?.user ?? null);
        
        // When auth state changes, update available accounts
        setTimeout(() => {
          updateAvailableAccounts();
        }, 0);
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log("Initial session check:", session?.user?.email);
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
      
      // Get available accounts from local storage
      updateAvailableAccounts();
    });

    return () => subscription.unsubscribe();
  }, []);

  const updateAvailableAccounts = () => {
    try {
      const storedAccounts = localStorage.getItem('availableAccounts');
      const accounts = storedAccounts ? JSON.parse(storedAccounts) : [];
      
      // Add current user if not already in the list
      if (user && !accounts.find((acc: any) => acc.id === user.id)) {
        const newAccount = { 
          id: user.id, 
          email: user.email,
          username: user.user_metadata?.username || user.email?.split('@')[0] || 'User'
        };
        const updatedAccounts = [...accounts, newAccount];
        localStorage.setItem('availableAccounts', JSON.stringify(updatedAccounts));
        setAvailableAccounts(updatedAccounts);
      } else {
        setAvailableAccounts(accounts);
      }
    } catch (error) {
      console.error('Error updating available accounts:', error);
      setAvailableAccounts([]);
    }
  };

  const signIn = async (email: string, password: string) => {
    console.log("Signing in with:", email);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      
      if (error) {
        console.error("Sign in error:", error);
        return { error };
      }
      
      console.log("Sign in successful:", data);
      return { error: null };
    } catch (error) {
      console.error("Unexpected sign in error:", error);
      return { error };
    }
  };

  const signUp = async (email: string, password: string, username: string) => {
    console.log("Signing up with:", email, username);
    try {
      const { data, error } = await supabase.auth.signUp({ 
        email, 
        password,
        options: {
          data: {
            username
          }
        }
      });
      
      if (error) {
        console.error("Sign up error:", error);
        return { error };
      }
      
      console.log("Sign up successful:", data);
      
      // Check if email confirmation is required
      if (data.user && !data.user.confirmed_at) {
        toast({
          title: "Verification email sent",
          description: "Please check your email to complete registration"
        });
      }
      
      return { error: null };
    } catch (error) {
      console.error("Unexpected sign up error:", error);
      return { error };
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  const signInWithGoogle = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin + '/dashboard'
      }
    });
  };

  const switchAccount = async (userId: string) => {
    // This is a simplified approach. In a real app, you'd need a more secure method
    // Typically, users would need to sign in again to switch accounts
    const account = availableAccounts.find(acc => acc.id === userId);
    if (account) {
      // For demonstration - in reality, you'd prompt for password again
      toast({
        title: "Account switching",
        description: "In a real app, this would prompt for credentials"
      });
      // Simplified approach for demo
      await signIn(account.email, '');
    }
  };

  const value = {
    session,
    user,
    loading,
    signIn,
    signUp,
    signOut,
    signInWithGoogle,
    availableAccounts,
    switchAccount
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
