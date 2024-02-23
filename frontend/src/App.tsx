import AdministrationPage from "pages/AdministrationPage";
import GuidePage from "pages/GuidePage";
import IssuePage from "pages/IssuePage";
import IssuesPage from "pages/IssuesPage";
import OfferPage from "pages/OfferPage";
import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import "./App.scss";
import { AuthProvider } from "./contexts/AuthProvider";
import { ModalProvider } from "./contexts/ModalProvider";
import ProtectedRoute from "./contexts/ProtectedRoute";
import SnackbarProvider from "./contexts/SnackbarProvider";
import HomePage from "./pages/HomePage";
import { setError } from "./redux/errorSlice";
import { ErrorBoundary } from "./utils/ErrorHandling";

const App = () => {
	const dispatch = useDispatch();

	useEffect(() => {
		// Global error handler for uncaught exceptions
		window.onerror = (message, source, lineno, colno, error) => {
			console.error("App handler: Uncaught Error:", { message, source, lineno, colno, error });
			dispatch(setError(JSON.stringify({ message, source, lineno, colno, error })));
		};

		// Global handler for unhandled promise rejections
		window.onunhandledrejection = (event) => {
			console.error("App handler: Unhandled Promise Rejection:", event.promise, "Reason:", event.reason);
			dispatch(setError(JSON.stringify({ event })));
		};
	}, []);

	return (
		<ErrorBoundary>
			<BrowserRouter>
				<SnackbarProvider>
					<ModalProvider>
						<AuthProvider>
							<Routes>
								<Route
									path="/"
									element={
										<ProtectedRoute>
											<HomePage />
										</ProtectedRoute>
									}
								/>
								<Route
									path="/offer/:id"
									element={
										<ProtectedRoute>
											<OfferPage />
										</ProtectedRoute>
									}
								/>
								<Route
									path="/issues"
									element={
										<ProtectedRoute userIsNeeded>
											<IssuesPage />
										</ProtectedRoute>
									}
								/>
								<Route
									path="/issue/:id"
									element={
										<ProtectedRoute>
											<IssuePage />
										</ProtectedRoute>
									}
								/>
								<Route
									path="/guides"
									element={
										<ProtectedRoute userIsNeeded>
											<GuidePage />
										</ProtectedRoute>
									}
								/>
								<Route
									path="/repo-administration"
									element={
										<ProtectedRoute userIsNeeded>
											<AdministrationPage />
										</ProtectedRoute>
									}
								/>
							</Routes>
						</AuthProvider>
					</ModalProvider>
				</SnackbarProvider>
			</BrowserRouter>
		</ErrorBoundary>
	);
};

export default App;
