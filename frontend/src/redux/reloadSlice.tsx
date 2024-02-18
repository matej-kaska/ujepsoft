import { PayloadAction, createSlice } from "@reduxjs/toolkit";

type ReloadState = {
	location: string;
};

const initialState: ReloadState = {
	location: "",
};

const reloadState = createSlice({
	name: "location",
	initialState,
	reducers: {
		setReload: (state, action: PayloadAction<string>) => {
			state.location = action.payload;
		},
	},
});

export const { setReload } = reloadState.actions;

export default reloadState.reducer;
