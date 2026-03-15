import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

interface UiState {
  toastMessage: string | null;
  toastType: 'success' | 'error' | 'info';
}

const initialState: UiState = {
  toastMessage: null,
  toastType: 'info'
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    showToast: (state, action: PayloadAction<{ message: string; type?: 'success' | 'error' | 'info' }>) => {
      state.toastMessage = action.payload.message;
      state.toastType = action.payload.type || 'info';
    },
    hideToast: (state) => {
      state.toastMessage = null;
    }
  }
});

export const { showToast, hideToast } = uiSlice.actions;
export default uiSlice.reducer;
