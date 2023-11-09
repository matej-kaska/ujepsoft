import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import SuccessSnackbar from './SuccessSnackbar';
import ErrorSnackbar from './ErrorSnackbar';
import { useSelector, useDispatch } from 'react-redux';
import { closeSnackbar as closeReduxSnackbar } from '../../redux/snackbarSlice';
import { RootState } from 'redux/store';

type SnackbarContextType = {
  openSnackbar: (msg: string) => void;
  openErrorSnackbar: (msg: string) => void;
  closeSnackbar: () => void;
}

export const SnackbarContext = createContext<SnackbarContextType | null>(null);

export const SnackbarProvider = ({ children }: { children: ReactNode }) => {
  const dispatch = useDispatch();
  const reduxSnackbarState = useSelector((state: RootState) => state.snackbar);
  const [open, setOpen] = useState<boolean>(false);
  const [fade, setFade] = useState("fade-in");
  const [message, setMessage] = useState<string>("");
  const [error, setError] = useState<boolean>(false);
  const [timer, setTimer] = useState<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (reduxSnackbarState.open) {
      if (reduxSnackbarState.error) {
        openErrorSnackbar(reduxSnackbarState.message);
      } else {
        openSnackbar(reduxSnackbarState.message);
      }
    } else {
      closeSnackbar();
    }
  }, [reduxSnackbarState]);

  const openSnackbar = (msg: string, error?: boolean) => {
    if (error) setError(true);
    else setError(false);
    setMessage(msg);
    setOpen(true);

    // Automatically close the snackbar after 4 seconds
    if (timer) clearTimeout(timer);

    setTimer(setTimeout(() => {
      closeSnackbar();
    }, 4000));
  };

  const openErrorSnackbar = (msg: string) => {
    openSnackbar(msg, true);
  };

  const closeSnackbar = () => {
    setFade("fade-out");

    setTimeout(() => {
      setOpen(false);
      setMessage("");
      setError(false);
      setFade("fade-in");
      dispatch(closeReduxSnackbar());
    }, 300);
  };

  return (
    <SnackbarContext.Provider value={{ openSnackbar, openErrorSnackbar, closeSnackbar }}>
      {children}
      {open && (
        !error ? <SuccessSnackbar message={message} closeSnackbar={closeSnackbar} fade={fade} />
          : <ErrorSnackbar message={message} closeSnackbar={closeSnackbar} fade={fade} />
      )}
    </SnackbarContext.Provider>
  );
};

export const useSnackbar = () => {
  const currentContext = useContext(SnackbarContext);

  if (!currentContext) {
    throw new Error('useSnackbar must be used within SnackbarProvider');
  }

  return currentContext;
};
