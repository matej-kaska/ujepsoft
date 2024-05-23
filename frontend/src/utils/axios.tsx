import axios, { AxiosError, AxiosRequestConfig } from "axios";
import Login from "../components/authetication/Login";
import { removeUser } from "../redux/authSlice";
import { openModal } from "../redux/modalSlice";
import { openErrorSnackbar } from "../redux/snackbarSlice";
import { store } from "../redux/store";

const instance = axios.create();

instance.interceptors.response.use(
	(response) => {
		return response;
	},
	(error) => {
		if (error.response && error.response.status === 401) {
			// If it's 401 (Unauthorized), remove user info from Redux store
			store.dispatch(removeUser());

			store.dispatch(openErrorSnackbar("Pro tuto akci musíte být přihlášeni"));
			store.dispatch(openModal(<Login />));
			console.warn("You must be logged in to perform this action!");
		}

		return Promise.reject(error);
	},
);

instance.interceptors.request.use(
	(config) => {
		const state = store.getState();
		const token = state.auth.token;

		if (token && token !== "") {
			config.headers.Authorization = `Token ${token}`;
		}

		return config;
	},
	(error) => {
		console.warn(error);
		return Promise.reject(error);
	},
);

type SuccessResponse<T> = {
	success: true;
	status: number;
	data: T;
};

type ErrorResponse = {
	success: false;
	status: number;
	message: {
		en: string;
		cz: string;
	};
};

type ApiResponse<T> = SuccessResponse<T> | ErrorResponse;

export const clearAxiosAuthorization = () => {
	instance.defaults.headers.common.Authorization = undefined;
};

const isValidErrorData = (value: any): value is { en: string; cz: string } => {
	return typeof value === "object" && value !== null && typeof value.en === "string" && typeof value.cz === "string";
};

const axiosRequest = async <T,>(method: "GET" | "POST" | "PUT" | "DELETE", url: string, data?: any, config: AxiosRequestConfig = {}): Promise<ApiResponse<T>> => {
	try {
		const response = await instance.request<T>({ ...config, method, url, data });
		return {
			success: true,
			status: response.status,
			data: response.data,
		};
	} catch (error) {
		if (axios.isCancel(error)) {
			console.warn("Request canceled:", error.message);
			throw error;
		}
		const axiosError = error as AxiosError;
		const responseData = axiosError.response?.data;
		const errorData = isValidErrorData(responseData) && "en" in responseData && "cz" in responseData ? (responseData as { en: string; cz: string }) : { en: "An unexpected error occurred", cz: "Došlo k neočekávané chybě" };

		return {
			success: false,
			status: axiosError.response?.status || 500,
			message: errorData,
		};
	}
};

export default axiosRequest;
