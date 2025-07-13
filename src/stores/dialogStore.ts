import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { DialogsState, DialogType, DialogDataMap, DialogState } from '../types/dialog';

interface DialogStore {
  dialogs: DialogsState;
  openDialog: <T extends DialogType>(type: T, data?: DialogDataMap[T], onSubmit?: (data: DialogDataMap[T]) => void) => void;
  closeDialog: (type: DialogType) => void;
  submitDialog: <T extends DialogType>(type: T, data: DialogDataMap[T]) => void;
  setDialogLoading: (type: DialogType, isLoading: boolean) => void;
}

export const initialDialogsState: DialogsState = {
  [DialogType.DialogA]: { isOpen: false },
  [DialogType.DialogB]: { isOpen: false },
};

export const useDialogStore = create<DialogStore>()(
  immer((set) => ({
    dialogs: initialDialogsState,
    openDialog: (type, data, onSubmit) => {
      set((state) => {
        (state.dialogs[type] as DialogState<DialogDataMap[typeof type]>) = {
          isOpen: true,
          data,
          onSubmit,
        };
      });
    },
    closeDialog: (type) => {
      set((state) => {
        state.dialogs[type] = { isOpen: false };
      });
    },
    submitDialog: (type, data) => {
      set((state) => {
        state.dialogs[type].onSubmit?.(data);
        state.dialogs[type].isOpen = false;
        state.dialogs[type].isLoading = false;
      });
    },
    setDialogLoading: (type, isLoading) => {
      set((state) => {
        state.dialogs[type].isLoading = isLoading;
      });
    },
  })),
); 