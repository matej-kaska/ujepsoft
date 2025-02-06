import { createRoot } from "react-dom/client";
import { HelmetProvider } from "react-helmet-async";
import { Provider } from "react-redux";
import App from "./App";
import { store } from "./redux/store";

const rootElement = document.getElementById("root");

if (rootElement) {
	createRoot(rootElement).render(
		<Provider store={store}>
			<HelmetProvider>
				<App />
			</HelmetProvider>
		</Provider>,
	);
} else {
	console.error("Failed to find the root element");
}
