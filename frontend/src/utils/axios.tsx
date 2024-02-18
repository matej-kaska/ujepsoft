import axios from "axios";
import Login from "../components/authetication/Login";
import { removeUser } from "../redux/authSlice";
import { openModal } from "../redux/modalSlice";
import { openErrorSnackbar } from "../redux/snackbarSlice";
import { store } from "../redux/store";

const instance = axios.create();

instance.interceptors.response.use(
	(response) => {
		// If the request succeeds, just return the response
		return response;
	},
	(error) => {
		if (error.response && error.response.status === 401) {
			// If it's 401 (Unauthorized), remove user info from Redux store
			store.dispatch(removeUser());

			store.dispatch(openErrorSnackbar("Pro tuto akci musíte být přihlášeni"));
			// Open the LoginModal
			store.dispatch(openModal(<Login />));
			console.warn("You must be logged in to perform this action!");
		}

		// Return the error
		return Promise.reject(error);
	},
);

// Add the token to the request headers
instance.interceptors.request.use(
	(config) => {
		const state = store.getState();
		const token = state.auth.token;

		// TODO: Remove this console.log
		console.log("Token ", token);

		if (token && token !== "") {
			config.headers.Authorization = `Token ${token}`;
		}

		return config;
	},
	(error) => {
		return Promise.reject(error);
	},
);

export default instance;
