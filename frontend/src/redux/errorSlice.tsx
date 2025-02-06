import { type Action, type Dispatch, type Middleware, type PayloadAction, createSlice } from "@reduxjs/toolkit";
import { GlobalErrorService } from "utils/ErrorHandling";

type ErrorState = {
	message: string | null;
};

const initialState: ErrorState = {
	message: null,
};

const errorSlice = createSlice({
	name: "error",
	initialState,
	reducers: {
		setError: (state, action: PayloadAction<string>) => {
			state.message = action.payload;
		},
	},
});

export const { setError } = errorSlice.actions;

export const errorHandlingMiddleware: Middleware = (storeAPI) => (next: Dispatch) => (action: Action) => {
	try {
		return next(action);
	} catch (err: any) {
		storeAPI.dispatch(setError(err.message));
		GlobalErrorService.handleReduxError(err);
		throw err;
	}
};

export default errorSlice.reducer;
