import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import DialogManager from './DialogManager';
import { useDialogStore } from '../../stores/dialogStore';
import { DialogType } from '../../types/dialog';
import React from 'react';
import { act } from 'react-dom/test-utils';

describe('DialogManager', () => {
  beforeEach(() => {
    useDialogStore.getState().closeDialog(DialogType.DialogA);
    useDialogStore.getState().closeDialog(DialogType.DialogB);
    document.body.innerHTML = '';
  });

  it('should render DialogA and handle open/close', async () => {
    render(<DialogManager />);
    act(() => {
      useDialogStore.getState().openDialog(DialogType.DialogA, {
        isOpen: true,
        abTypeName: 'A群組',
        sourceName: '來源A',
        sourceID: 'A001',
        isLoading: false,
        onClose: () => {},
        onCreate: () => {},
      });
    });
    expect(screen.getByText('對話框 A')).toBeInTheDocument();
    expect(screen.getByText('訊息：TestA')).toBeInTheDocument();
    fireEvent.click(screen.getByText('取消'));
    await waitFor(() => {
      expect(screen.queryByText('對話框 A')).not.toBeInTheDocument();
    });
  });

  it('should render DialogB and handle open/close', async () => {
    render(<DialogManager />);
    act(() => {
      useDialogStore.getState().openDialog(DialogType.DialogB, { value: 123, extra: 'Extra' });
    });
    expect(screen.getByText('對話框 B')).toBeInTheDocument();
    expect(screen.getByText('數值：123')).toBeInTheDocument();
    fireEvent.click(screen.getByText('取消'));
    await waitFor(() => {
      expect(screen.queryByText('對話框 B')).not.toBeInTheDocument();
    });
  });
}); 