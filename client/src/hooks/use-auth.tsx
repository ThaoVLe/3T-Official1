
import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { useRouter } from "./use-router";

interface AuthContextType {
  userEmail: string | null;
  setUserEmail: (email: string | null) => void;
  isAuthenticated: boolean;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  userEmail: null,
  setUserEmail: () => {},
  isAuthenticated: false,
  logout: () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const { navigate } = useRouter();

  useEffect(() => {
    // Check for stored email on mount
    const storedEmail = localStorage.getItem("userEmail");
    if (storedEmail) {
      setUserEmail(storedEmail);
    }
  }, []);

  const logout = () => {
    localStorage.removeItem("userEmail");
    setUserEmail(null);
    navigate("/auth");
  };

  return (
    <AuthContext.Provider
      value={{
        userEmail,
        setUserEmail,
        isAuthenticated: !!userEmail,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
