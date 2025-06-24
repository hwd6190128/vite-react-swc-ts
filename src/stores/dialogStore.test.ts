import { act } from 'react';
import { useDialogStore, initialDialogsState } from './dialogStore';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { DialogType } from '../types/dialog';

describe('useDialogStore', () => {
  beforeEach(() => {
    // 每次測試前重置 store 狀態
    act(() => {
      // 使用 immer 的方式來重置 dialogs 狀態
      useDialogStore.setState((state) => {
        // 深度複製 initialDialogsState 以確保不會修改原始物件
        state.dialogs = JSON.parse(JSON.stringify(initialDialogsState));
        // 確保所有可能在測試中被修改的屬性都被重置
        for (const key in state.dialogs) {
          if (Object.prototype.hasOwnProperty.call(state.dialogs, key)) {
            const dialogType = key as DialogType;
            state.dialogs[dialogType].isOpen = false;
            state.dialogs[dialogType].data = undefined;
            state.dialogs[dialogType].isLoading = undefined;
            state.dialogs[dialogType].onSubmit = undefined;
          }
        }
      });
    });
  });

  it('should open a dialog with data and onSubmit callback', () => {
    const mockOnSubmit = vi.fn();
    act(() => {
      useDialogStore.getState().openDialog(DialogType.DialogA, { message: 'Hello', count: 1 }, mockOnSubmit);
    });

    const state = useDialogStore.getState().dialogs[DialogType.DialogA];
    expect(state.isOpen).toBe(true);
    expect(state.data).toEqual({ message: 'Hello', count: 1 });
    expect(state.onSubmit).toBe(mockOnSubmit);
  });

  it('should close a dialog', () => {
    act(() => {
      useDialogStore.getState().openDialog(DialogType.DialogA, { message: 'Hello', count: 1 });
      useDialogStore.getState().closeDialog(DialogType.DialogA);
    });

    const state = useDialogStore.getState().dialogs[DialogType.DialogA];
    expect(state.isOpen).toBe(false);
  });

  it('should submit a dialog and execute onSubmit callback', () => {
    const mockOnSubmit = vi.fn();
    act(() => {
      useDialogStore.getState().openDialog(DialogType.DialogA, { message: 'Hello', count: 1 }, mockOnSubmit);
      useDialogStore.getState().submitDialog(DialogType.DialogA, { message: 'Bye', count: 2 });
    });

    const state = useDialogStore.getState().dialogs[DialogType.DialogA];
    expect(mockOnSubmit).toHaveBeenCalledWith({ message: 'Bye', count: 2 });
    expect(state.isOpen).toBe(false);
    expect(state.isLoading).toBe(false);
  });

  it('should set dialog loading state', () => {
    act(() => {
      useDialogStore.getState().openDialog(DialogType.DialogA, { message: 'Hello', count: 1 });
      useDialogStore.getState().setDialogLoading(DialogType.DialogA, true);
    });

    let state = useDialogStore.getState().dialogs[DialogType.DialogA];
    expect(state.isLoading).toBe(true);

    act(() => {
      useDialogStore.getState().setDialogLoading(DialogType.DialogA, false);
    });

    state = useDialogStore.getState().dialogs[DialogType.DialogA];
    expect(state.isLoading).toBe(false);
  });
}); 