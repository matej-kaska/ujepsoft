import { PayloadAction, createSlice } from "@reduxjs/toolkit";

type SnackbarState = {
	open: boolean;
	message: string;
	type: "success" | "info" | "error";
};

const initialState: SnackbarState = {
	open: false,
	message: "",
	type: "success",
};

const snackbarSlice = createSlice({
	name: "snackbar",
	initialState,
	reducers: {
		openSuccessSnackbar: (state, action: PayloadAction<string>) => {
			state.open = true;
			state.message = action.payload;
			state.type = "success";
		},
		openErrorSnackbar: (state, action: PayloadAction<string>) => {
			state.open = true;
			state.message = action.payload;
			state.type = "error";
		},
		closeSnackbar: (state) => {
			state.open = false;
			state.message = "";
			state.type = "success";
		},
	},
});

export const { openSuccessSnackbar, openErrorSnackbar, closeSnackbar } = snackbarSlice.actions;

export default snackbarSlice.reducer;
