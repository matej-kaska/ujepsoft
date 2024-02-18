import { createSlice } from "@reduxjs/toolkit";
import { TUserInfo, blankUserInfo } from "../types/userInfo";

type SetUserAction = {
	type: string;
	payload: {
		userInfo: TUserInfo;
		rememberMe: boolean;
	};
};

type SetTokenAction = {
	type: string;
	payload: {
		token: string;
		rememberMe: boolean;
	};
};

// Load stored data from local/session storage
const storedUserInfo = localStorage.getItem("userInfo") || sessionStorage.getItem("userInfo");
const storedToken = localStorage.getItem("authToken") || sessionStorage.getItem("authToken");

// Set initial state based on stored data
const initialState: { userInfo: TUserInfo; token: string } = {
	userInfo: storedUserInfo ? JSON.parse(storedUserInfo) : blankUserInfo,
	token: storedToken || "",
};

const authSlice = createSlice({
	name: "auth",
	initialState,
	reducers: {
		setUser: (state, action: SetUserAction) => {
			state.userInfo = action.payload.userInfo;

			if (action.payload.rememberMe) {
				localStorage.setItem("userInfo", JSON.stringify(action.payload.userInfo));
			} else {
				sessionStorage.setItem("userInfo", JSON.stringify(action.payload.userInfo));
			}
		},
		setToken: (state, action: SetTokenAction) => {
			state.token = action.payload.token;

			if (action.payload.rememberMe) {
				localStorage.setItem("authToken", action.payload.token);
			} else {
				sessionStorage.setItem("authToken", action.payload.token);
			}
		},
		removeUser: (state) => {
			state.userInfo = blankUserInfo;
			state.token = "";
			localStorage.removeItem("userInfo");
			localStorage.removeItem("authToken");
			sessionStorage.removeItem("userInfo");
			sessionStorage.removeItem("authToken");
		},
	},
});

export const { setUser, setToken, removeUser } = authSlice.actions;

export default authSlice.reducer;
