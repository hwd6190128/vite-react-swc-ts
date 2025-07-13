import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { DialogsState, DialogType } from '../types/dialog';

interface DialogStore {
  dialogs: DialogsState;
  openDialog: <T extends DialogType>(type: T, data: DialogsState[T]) => void;
  closeDialog: (type: DialogType) => void;
  setDialogLoading: (type: DialogType, isLoading: boolean) => void;
}

export const initialDialogsState: DialogsState = {
  dialogA: {
    isOpen: false,
    abTypeName: '',
    sourceName: '',
    sourceID: '',
    isLoading: false,
    onClose: () => {},
    onCreate: () => {},
  },
  dialogB: {
    isOpen: false,
    abTypeName: '',
    sourceName: '',
    isLoading: false,
    onClose: () => {},
    onCreate: () => {},
  },
  dialogC: {
    isOpen: false,
    abTypeName: '',
    isLoading: false,
    onClose: () => {},
    onDelete: () => {},
  },
};

export const useDialogStore = create<DialogStore>()(
  immer((set) => ({
    dialogs: initialDialogsState,
    openDialog: (type, data) => {
      set((state) => {
        state.dialogs[type] = { ...data };
      });
    },
    closeDialog: (type) => {
      set((state) => {
        state.dialogs[type] = { ...initialDialogsState[type] };
      });
    },
    setDialogLoading: (type, isLoading) => {
      set((state) => {
        state.dialogs[type].isLoading = isLoading;
      });
    },
  }))
); 