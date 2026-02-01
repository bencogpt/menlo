import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { User } from '../types';
import { GMAIL_CONFIG } from '../config/gmail';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  accessToken: string | null;
  signIn: () => Promise<void>;
  signOut: () => void;
  error: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Load Google Identity Services script
const loadGoogleScript = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    if (document.getElementById('google-identity-script')) {
      resolve();
      return;
    }
    const script = document.createElement('script');
    script.id = 'google-identity-script';
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Failed to load Google Identity Services'));
    document.body.appendChild(script);
  });
};

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tokenClient, setTokenClient] = useState<google.accounts.oauth2.TokenClient | null>(null);

  // Initialize Google Identity Services
  useEffect(() => {
    const initAuth = async () => {
      try {
        await loadGoogleScript();

        // Check for stored token
        const storedToken = localStorage.getItem('gmail_access_token');
        const storedUser = localStorage.getItem('gmail_user');
        const tokenExpiry = localStorage.getItem('gmail_token_expiry');

        if (storedToken && storedUser && tokenExpiry) {
          const expiryTime = parseInt(tokenExpiry, 10);
          if (Date.now() < expiryTime) {
            setAccessToken(storedToken);
            setUser(JSON.parse(storedUser));
          } else {
            // Token expired, clear storage
            localStorage.removeItem('gmail_access_token');
            localStorage.removeItem('gmail_user');
            localStorage.removeItem('gmail_token_expiry');
          }
        }

        // Initialize token client
        const client = google.accounts.oauth2.initTokenClient({
          client_id: GMAIL_CONFIG.clientId,
          scope: GMAIL_CONFIG.scopes,
          callback: async (response) => {
            if (response.error) {
              setError(response.error);
              return;
            }

            const token = response.access_token;
            setAccessToken(token);

            // Store token with expiry
            const expiryTime = Date.now() + (response.expires_in * 1000);
            localStorage.setItem('gmail_access_token', token);
            localStorage.setItem('gmail_token_expiry', expiryTime.toString());

            // Fetch user info
            try {
              const userResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
                headers: { Authorization: `Bearer ${token}` }
              });
              const userData = await userResponse.json();
              const userInfo: User = {
                email: userData.email,
                name: userData.name,
                picture: userData.picture
              };
              setUser(userInfo);
              localStorage.setItem('gmail_user', JSON.stringify(userInfo));
            } catch (err) {
              console.error('Failed to fetch user info:', err);
              setError('Failed to fetch user information');
            }
          },
        });

        setTokenClient(client);
      } catch (err) {
        console.error('Failed to initialize auth:', err);
        setError('Failed to initialize Google authentication');
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, []);

  const signIn = useCallback(async () => {
    if (!tokenClient) {
      setError('Authentication not initialized');
      return;
    }
    setError(null);
    tokenClient.requestAccessToken({ prompt: 'consent' });
  }, [tokenClient]);

  const signOut = useCallback(() => {
    if (accessToken) {
      google.accounts.oauth2.revoke(accessToken, () => {
        console.log('Token revoked');
      });
    }
    setUser(null);
    setAccessToken(null);
    localStorage.removeItem('gmail_access_token');
    localStorage.removeItem('gmail_user');
    localStorage.removeItem('gmail_token_expiry');
  }, [accessToken]);

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user && !!accessToken,
    isLoading,
    accessToken,
    signIn,
    signOut,
    error
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

// Type declarations for Google Identity Services
declare global {
  interface Window {
    google: typeof google;
  }
  namespace google.accounts.oauth2 {
    interface TokenClient {
      requestAccessToken: (config?: { prompt?: string }) => void;
    }
    interface TokenResponse {
      access_token: string;
      expires_in: number;
      error?: string;
    }
    function initTokenClient(config: {
      client_id: string;
      scope: string;
      callback: (response: TokenResponse) => void;
    }): TokenClient;
    function revoke(token: string, callback: () => void): void;
  }
}
