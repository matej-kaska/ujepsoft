import { configureStore, combineReducers } from '@reduxjs/toolkit'
import {  persistStore } from 'redux-persist';
import authReducer from './authSlice'
import errorReducer, { errorHandlingMiddleware } from './errorSlice';
import modalReducer from './modalSlice';
import navigateSlice from './navigateSlice';
import snackbarReducer from './snackbarSlice';
import reloadSlice from './reloadSlice';

const rootReducers = combineReducers({ 
  auth: authReducer,
  error: errorReducer,
  modal: modalReducer,
  snackbar: snackbarReducer,
  navigator: navigateSlice,
  reload: reloadSlice
})

export const store = configureStore({
  reducer: rootReducers,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false
    }).concat(errorHandlingMiddleware),
})

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>
// Inferred type: {posts: PostsState, comments: CommentsState, users: UsersState}
export type AppDispatch = typeof store.dispatch

export const persistedStore = persistStore(store);