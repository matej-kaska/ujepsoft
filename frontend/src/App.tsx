import './App.scss';
import { useEffect } from 'react';
import { BrowserRouter, Routes, Route } from "react-router-dom";
import ProtectedRoute from './contexts/ProtectedRoute';
import SnackbarProvider from "./contexts/SnackbarProvider";
import { ModalProvider } from "./contexts/ModalProvider";
import { setError } from './redux/errorSlice';
import { useDispatch } from 'react-redux';
import { ErrorBoundary } from './utils/ErrorHandling';
import HomePage from './pages/HomePage';
import { AuthProvider } from './contexts/AuthProvider';

const App = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    // Global error handler for uncaught exceptions
    window.onerror = (message, source, lineno, colno, error) => {
      console.error('App handler: Uncaught Error:', { message, source, lineno, colno, error });
      dispatch(setError(JSON.stringify({ message, source, lineno, colno, error })));
    }

    // Global handler for unhandled promise rejections
    window.onunhandledrejection = (event) => {
      console.error('App handler: Unhandled Promise Rejection:', event.promise, 'Reason:', event.reason);
      dispatch(setError(JSON.stringify({ event })));
    }
  }, []);

  return (
    <ErrorBoundary>
      <BrowserRouter>
        <SnackbarProvider>
          <ModalProvider>
            <AuthProvider>
              <Routes>
                <Route path="/" element={<ProtectedRoute><HomePage /></ProtectedRoute>} />
              </Routes>
            </AuthProvider>
          </ModalProvider>
        </SnackbarProvider>
      </BrowserRouter>
    </ErrorBoundary >
  )
}

export default App