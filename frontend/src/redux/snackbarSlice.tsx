import { createSlice, PayloadAction } from '@reduxjs/toolkit';

type SnackbarState = {
  open: boolean;
  message: string;
  error: boolean;
}

const initialState: SnackbarState = {
  open: false,
  message: "",
  error: false
};

const snackbarSlice = createSlice({
  name: 'snackbar',
  initialState,
  reducers: {
    openSnackbar: (state, action: PayloadAction<string>) => {
      state.open = true;
      state.message = action.payload;
      state.error = false;
    },
    openErrorSnackbar: (state, action: PayloadAction<string>) => {
      state.open = true;
      state.message = action.payload;
      state.error = true;
    },
    closeSnackbar: (state) => {
      state.open = false;
      state.message = "";
      state.error = false;
    }
  }
});

export const { openSnackbar, openErrorSnackbar, closeSnackbar } = snackbarSlice.actions;

export default snackbarSlice.reducer;
