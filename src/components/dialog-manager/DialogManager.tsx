import React from 'react';
import CustomDialog from './CustomDialog';
import { useDialogStore } from '../../stores/dialogStore';
import { DialogType, DialogAData, DialogBData, BaseDialogProps } from '../../types/dialog';

const DialogA: React.FC<BaseDialogProps<unknown>> = React.memo((props) => {
  const { isOpen, data, isLoading, onClose, onSubmit } = props;
  const d = data as DialogAData | undefined;
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
      {d && <>
        <p>訊息：{d.message}</p>
        <p>次數：{d.count}</p>
      </>}
    </CustomDialog>
  );
});

const DialogB: React.FC<BaseDialogProps<unknown>> = React.memo((props) => {
  const { isOpen, data, isLoading, onClose, onSubmit } = props;
  const d = data as DialogBData | undefined;
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
      {d && <>
        <p>數值：{d.value}</p>
        <p>額外：{d.extra}</p>
      </>}
    </CustomDialog>
  );
});

type DialogComponentMap = {
  [K in DialogType]: React.FC<BaseDialogProps<unknown>>;
};

const DialogManager: React.FC = React.memo(() => {
  const { dialogs, closeDialog } = useDialogStore();

  const dialogComponentMap: DialogComponentMap = {
    [DialogType.DialogA]: DialogA,
    [DialogType.DialogB]: DialogB,
  };

  function renderDialog(type: DialogType) {
    const DialogComponent = dialogComponentMap[type];
    const dialogState = dialogs[type];

    return (
      <DialogComponent
        key={type}
        isOpen={dialogState.isOpen}
        data={dialogState.data as unknown}
        isLoading={dialogState.isLoading}
        onClose={() => closeDialog(type)}
        onSubmit={() => {
          // 這裡 onSubmit 可根據 type 做簡單分派，或直接傳空函式
        }}
      />
    );
  }

  return (
    <>
      {(Object.keys(dialogComponentMap) as DialogType[]).map(type => renderDialog(type))}
    </>
  );
});

export default DialogManager;