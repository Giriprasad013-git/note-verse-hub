
import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Session, User } from '@supabase/supabase-js';
import { toast } from '@/hooks/use-toast';
import { v4 as uuidv4 } from 'uuid';
import { useNavigate } from 'react-router-dom';

type AuthContextType = {
  session: Session | null;
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{error: any}>;
  signUp: (email: string, password: string, username: string) => Promise<{error: any}>;
  signOut: () => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signInAsGuest: () => Promise<void>;
  isGuest: boolean;
  guestId: string | null;
  availableAccounts: any[];
  switchAccount: (userId: string) => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Guest user data stored in local storage
const GUEST_USER_KEY = 'note_verse_guest_user';

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [availableAccounts, setAvailableAccounts] = useState<any[]>([]);
  const [isGuest, setIsGuest] = useState<boolean>(false);
  const [guestId, setGuestId] = useState<string | null>(null);

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log("Auth state changed:", event, session?.user?.email);
        setSession(session);
        setUser(session?.user ?? null);
        setIsGuest(false); // Reset guest status when auth state changes
        setGuestId(null);  // Clear guest ID when auth state changes
        
        // When auth state changes, update available accounts
        setTimeout(() => {
          updateAvailableAccounts();
        }, 0);
      }
    );

    // Check for existing session or guest user
    const initializeAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      console.log("Initial session check:", session?.user?.email);
      
      if (session) {
        setSession(session);
        setUser(session.user);
        setIsGuest(false);
        setGuestId(null);
      } else {
        // Check if there's a guest user
        const guestUser = localStorage.getItem(GUEST_USER_KEY);
        if (guestUser) {
          setIsGuest(true);
          setGuestId(guestUser);
          // We don't set session or user here as they remain null for guest users
        }
      }
      
      setLoading(false);
      
      // Get available accounts from local storage
      updateAvailableAccounts();
    };

    initializeAuth();

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
      // Sign in without the incorrect expiresIn option
      const { data, error } = await supabase.auth.signInWithPassword({ 
        email, 
        password
      });
      
      if (error) {
        console.error("Sign in error:", error);
        return { error };
      }
      
      // Clear guest user if exists
      localStorage.removeItem(GUEST_USER_KEY);
      setIsGuest(false);
      setGuestId(null);
      
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
      
      // Clear guest user if exists
      localStorage.removeItem(GUEST_USER_KEY);
      setIsGuest(false);
      setGuestId(null);
      
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
    // Clear guest user if exists
    localStorage.removeItem(GUEST_USER_KEY);
    setIsGuest(false);
    setGuestId(null);
    
    // Sign out from Supabase
    await supabase.auth.signOut();

    // Use toast to notify user
    toast({
      title: "Signed out successfully",
      description: "You have been logged out of your account"
    });
    
    // No need to manually redirect here as the AuthCheck component will handle redirection
  };

  const signInWithGoogle = async () => {
    // Clear guest user if exists
    localStorage.removeItem(GUEST_USER_KEY);
    setIsGuest(false);
    setGuestId(null);
    
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin + '/dashboard'
      }
    });
  };

  const signInAsGuest = async () => {
    // Create a unique identifier for the guest user
    const newGuestId = uuidv4();
    localStorage.setItem(GUEST_USER_KEY, newGuestId);
    setIsGuest(true);
    setGuestId(newGuestId);
    
    toast({
      title: "Signed in as guest",
      description: "Your data will only be stored in this browser."
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
    signInAsGuest,
    isGuest,
    guestId,
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
