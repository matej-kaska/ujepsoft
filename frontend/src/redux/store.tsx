import { combineReducers, configureStore } from "@reduxjs/toolkit";
import { persistStore } from "redux-persist";
import authReducer from "./authSlice";
import errorReducer, { errorHandlingMiddleware } from "./errorSlice";
import modalReducer from "./modalSlice";
import navigateSlice from "./navigateSlice";
import reloadSlice from "./reloadSlice";
import settingsSlice from "./settingsSlice";
import snackbarReducer from "./snackbarSlice";

const rootReducers = combineReducers({
	auth: authReducer,
	error: errorReducer,
	modal: modalReducer,
	snackbar: snackbarReducer,
	navigator: navigateSlice,
	reload: reloadSlice,
	settings: settingsSlice,
});

export const store = configureStore({
	reducer: rootReducers,
	middleware: (getDefaultMiddleware) =>
		getDefaultMiddleware({
			serializableCheck: false,
		}).concat(errorHandlingMiddleware),
});

export type RootState = ReturnType<typeof store.getState>;

export type AppDispatch = typeof store.dispatch;

export const persistedStore = persistStore(store);
