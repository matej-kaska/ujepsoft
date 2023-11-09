import { createContext, useContext } from 'react';
import { useSnackbar } from './SnackbarProvider';
import Login from '../components/authetication/Login';
import { useModal } from './ModalProvider';

type AuthContextType = {
  checkIsLoggedIn: (isLoggedIn: boolean) => void;
};

export const AuthContext = createContext<AuthContextType | null>(null);

type AuthProviderProps = {
  children: React.ReactNode;
};

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const { showModal } = useModal();
  const { openErrorSnackbar } = useSnackbar();

  const checkIsLoggedIn = (isLoggedIn: boolean) => {
    if (isLoggedIn) return;
    showModal(<Login />);
    openErrorSnackbar("Pro tuto akci musíte být přihlášeni");
    console.warn("You must be logged in to perform this action!");
  }

  const contextValue = {
    checkIsLoggedIn
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const currentContext = useContext(AuthContext);

  if (!currentContext) {
    throw new Error('useAuth must be used within AuthProvider');
  }

  return currentContext;
};
