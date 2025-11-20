
import React, { createContext, useContext, useState, useEffect } from 'react';
import { AuthContextType, User, UserRole, UserLevel } from '../types';
import { supabase } from '../lib/supabaseClient';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch detailed profile after auth
  const fetchProfile = async (sessionUser: any) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', sessionUser.id)
        .single();

      if (error) {
        // If profile doesn't exist (shouldn't happen with trigger, but fallback), create mock structure
        console.warn("Profile fetch error, using session data", error);
        return mapSessionToUser(sessionUser, null);
      }
      return mapSessionToUser(sessionUser, data);
    } catch (e) {
      console.error(e);
      return mapSessionToUser(sessionUser, null);
    }
  };

  const mapSessionToUser = (sessionUser: any, profileData: any): User => {
    return {
      id: sessionUser.id,
      email: sessionUser.email || '',
      name: profileData?.name || sessionUser.email?.split('@')[0] || 'User',
      token: sessionUser.access_token, // Use session token
      role: (profileData?.role as UserRole) || 'personal',
      level: (profileData?.level as UserLevel) || 'MEMBER',
      riskLevel: profileData?.risk_level || 'Balanced',
      isPlatinum: profileData?.level === 'PLATINUM' || profileData?.level === 'BLACK_GOLD',
    };
  };

  useEffect(() => {
    // 1. Check active session
    const initSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        const userData = await fetchProfile(session.user);
        setUser(userData);
      }
      setIsLoading(false);
    };

    initSession();

    // 2. Listen for changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        const userData = await fetchProfile(session.user);
        setUser(userData);
      } else {
        setUser(null);
      }
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const login = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
  };

  const signup = async (name: string, email: string, password: string, type: UserRole = 'personal') => {
    // 1. Create Auth User
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name, role: type } // Metadata passed to trigger
      }
    });

    if (error) throw error;

    // Note: We rely on a Postgres Trigger (in SQL schema) to create the 'profiles' row 
    // and 'assets' row automatically. This ensures data consistency.
    
    // If auto-login is not enabled by Supabase settings, we might need to ask user to log in.
    // Assuming default settings allow immediate session if email confirm is off.
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    localStorage.removeItem('market_db'); // Clear local cache
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, isLoading, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
