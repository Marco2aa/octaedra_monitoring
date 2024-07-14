import React, { createContext, useState, ReactNode, useContext } from "react";
import axios from "axios";
import querystring from "querystring";

interface AuthState {
  isAuthenticated: boolean;
  user: any | null;
  token: string | null;
}

interface AuthContextProps {
  authState: AuthState;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    user: null,
    token: null,
  });

  const login = async (username: string, password: string) => {
    try {
      const data = {
        username: username,
        password: password,
        grant_type: "",
        scope: "",
        client_id: "",
        client_secret: "",
      };

      const response = await axios.post(
        "http://35.180.190.115:8000/token",
        querystring.stringify(data),
        {
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
        }
      );

      setAuthState({
        isAuthenticated: true,
        user: response.data.user,
        token: response.data.access_token,
      });
    } catch (error) {
      console.error("Failed to login:", error);
    }
  };

  const logout = () => {
    setAuthState({
      isAuthenticated: false,
      user: null,
      token: null,
    });
  };

  return (
    <AuthContext.Provider value={{ authState, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

const useAuth = (): AuthContextProps => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export { AuthProvider, useAuth };
