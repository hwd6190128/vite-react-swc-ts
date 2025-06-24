import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import DialogManager from './DialogManager';
import { useDialogStore } from '../../stores/dialogStore';
import { DialogType } from '../../types/dialog';
import React from 'react';

describe('DialogManager', () => {
  beforeEach(() => {
    useDialogStore.getState().closeDialog(DialogType.DialogA);
    useDialogStore.getState().closeDialog(DialogType.DialogB);
  });

  it('should render DialogA and handle open/close', async () => {
    render(<DialogManager />);
    // 先開啟 DialogA
    useDialogStore.getState().openDialog(DialogType.DialogA, { message: 'TestA', count: 1 });
    // 重新渲染
    render(<DialogManager />);
    expect(screen.getByText('對話框 A')).toBeInTheDocument();
    expect(screen.getByText('訊息：TestA')).toBeInTheDocument();
    // 關閉 DialogA
    fireEvent.click(screen.getByText('取消'));
    await waitFor(() => {
      expect(screen.queryByText('對話框 A')).not.toBeInTheDocument();
    });
  });

  it('should render DialogB and handle open/close', async () => {
    render(<DialogManager />);
    useDialogStore.getState().openDialog(DialogType.DialogB, { value: 123, extra: 'Extra' });
    render(<DialogManager />);
    expect(screen.getByText('對話框 B')).toBeInTheDocument();
    expect(screen.getByText('數值：123')).toBeInTheDocument();
    fireEvent.click(screen.getByText('取消'));
    await waitFor(() => {
      expect(screen.queryByText('對話框 B')).not.toBeInTheDocument();
    });
  });

  it('should call onSubmit callback for DialogA', async () => {
    const mockOnSubmit = jest.fn();
    render(<DialogManager />);
    useDialogStore.getState().openDialog(DialogType.DialogA, { message: 'TestA', count: 1 }, mockOnSubmit);
    render(<DialogManager />);
    fireEvent.click(screen.getByText('確定'));
    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith({ message: 'TestA', count: 1 });
    });
  });

  it('should call onSubmit callback for DialogB', async () => {
    const mockOnSubmit = jest.fn();
    render(<DialogManager />);
    useDialogStore.getState().openDialog(DialogType.DialogB, { value: 456, extra: 'ExtraB' }, mockOnSubmit);
    render(<DialogManager />);
    fireEvent.click(screen.getByText('確定'));
    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith({ value: 456, extra: 'ExtraB' });
    });
  });
}); 