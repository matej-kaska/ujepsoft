import { createSlice } from "@reduxjs/toolkit";

const settingsSlice = createSlice({
	name: "settings",
	initialState: {
		showClosedIssues: false,
	},
	reducers: {
		setShowClosedIssues: (state, action) => {
			state.showClosedIssues = action.payload;
		},
	},
});

export const { setShowClosedIssues } = settingsSlice.actions;
export default settingsSlice.reducer;
