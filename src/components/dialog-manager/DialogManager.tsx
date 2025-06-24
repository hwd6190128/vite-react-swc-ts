import React from 'react';
import CustomDialog from './CustomDialog';
import { useDialogStore } from '../../stores/dialogStore';
import { DialogType, DialogAData, DialogBData, BaseDialogProps } from '../../types/dialog';

const DialogA: React.FC<BaseDialogProps<DialogAData>> = React.memo((props) => {
  const { isOpen, data, isLoading, onClose, onSubmit } = props;
  return (
    <CustomDialog
      dialogType={DialogType.DialogA}
      isOpen={isOpen}
      data={data}
      isLoading={isLoading}
      onClose={onClose}
      onSubmit={onSubmit}
      title="對話框 A"
    >
      <div>這是對話框 A 的內容。</div>
      {data && <>
        <p>訊息：{data.message}</p>
        <p>次數：{data.count}</p>
      </>}
    </CustomDialog>
  );
});

const DialogB: React.FC<BaseDialogProps<DialogBData>> = React.memo((props) => {
  const { isOpen, data, isLoading, onClose, onSubmit } = props;
  return (
    <CustomDialog
      dialogType={DialogType.DialogB}
      isOpen={isOpen}
      data={data}
      isLoading={isLoading}
      onClose={onClose}
      onSubmit={onSubmit}
      title="對話框 B"
    >
      <div>這是對話框 B 的內容。</div>
      {data && <>
        <p>數值：{data.value}</p>
        <p>額外：{data.extra}</p>
      </>}
    </CustomDialog>
  );
});

const DialogManager: React.FC = React.memo(() => {
  const { dialogs, closeDialog, submitDialog, setDialogLoading } = useDialogStore();

  // DialogA onSubmit callback
  const handleDialogASubmit = React.useCallback(() => {
    setDialogLoading(DialogType.DialogA, true);
    setTimeout(() => {
      submitDialog(DialogType.DialogA, { message: 'DialogA submit', count: (dialogs[DialogType.DialogA].data?.count ?? 0) + 1 });
      setDialogLoading(DialogType.DialogA, false);
      console.log('DialogA onSubmit: 處理完成', dialogs[DialogType.DialogA].data);
    }, 1000);
  }, [dialogs[DialogType.DialogA].data, setDialogLoading, submitDialog]);

  // DialogB onSubmit callback
  const handleDialogBSubmit = React.useCallback(() => {
    setDialogLoading(DialogType.DialogB, true);
    setTimeout(() => {
      submitDialog(DialogType.DialogB, { value: (dialogs[DialogType.DialogB].data?.value ?? 0) * 10, extra: 'DialogB submit' });
      setDialogLoading(DialogType.DialogB, false);
      console.log('DialogB onSubmit: 處理完成', dialogs[DialogType.DialogB].data);
    }, 1000);
  }, [dialogs[DialogType.DialogB].data, setDialogLoading, submitDialog]);

  return (
    <>
      <DialogA
        isOpen={dialogs[DialogType.DialogA].isOpen}
        data={dialogs[DialogType.DialogA].data}
        isLoading={dialogs[DialogType.DialogA].isLoading}
        onClose={() => closeDialog(DialogType.DialogA)}
        onSubmit={handleDialogASubmit}
      />
      <DialogB
        isOpen={dialogs[DialogType.DialogB].isOpen}
        data={dialogs[DialogType.DialogB].data}
        isLoading={dialogs[DialogType.DialogB].isLoading}
        onClose={() => closeDialog(DialogType.DialogB)}
        onSubmit={handleDialogBSubmit}
      />
    </>
  );
});

export default DialogManager; 