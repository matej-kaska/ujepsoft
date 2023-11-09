import { createSlice, PayloadAction } from '@reduxjs/toolkit';

type NavigateState = {
  link: string;
}

const initialState: NavigateState = {
  link: "",
};

const navigateSlice = createSlice({
  name: 'navigate',
  initialState,
  reducers: {
    navigate: (state, action: PayloadAction<string>) => {
      state.link = action.payload;
    }
  }
});

export const { navigate } = navigateSlice.actions;

export default navigateSlice.reducer;
