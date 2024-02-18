import * as ReactDOM from "react-dom/client";
import { Provider } from "react-redux";
import App from "./App";
import { store } from "./redux/store";

const rootElement = document.getElementById("root");

if (rootElement) {
	ReactDOM.createRoot(rootElement).render(
		<Provider store={store}>
			<App />
		</Provider>,
	);
} else {
	console.error("Failed to find the root element");
}
