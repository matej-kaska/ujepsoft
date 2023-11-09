import { createSlice } from '@reduxjs/toolkit';

const modalSlice = createSlice({
  name: 'modal',
  initialState: {
    showModal: false,
    component: null
  },
  reducers: {
    openModal: (state, action) => {
      state.showModal = true;
      state.component = action.payload;
    },
    closeModal: (state) => {
      state.showModal = false;
      state.component = null;
    }
  }
});

export const { openModal, closeModal } = modalSlice.actions;
export default modalSlice.reducer;
