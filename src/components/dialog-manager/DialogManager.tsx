import React from 'react';
import CustomDialog from './CustomDialog';
import { useDialogStore } from '../../stores/dialogStore';
import {DialogType, DialogAData, DialogBData, BaseDialogProps, DialogCData} from '../../types/dialog';

const DialogA = (props) => {
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
};

const DialogB = (props) => {
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
};

// DialogC
const DialogC = (props) => {
  const { isOpen, data, isLoading, onClose, onSubmit } = props;
  const d = data as DialogCData | undefined;
  // 這裡可根據實際需求加上 onCreateDialogC
  return (
    <CustomDialog
      dialogType={DialogType.DialogC}
      isOpen={isOpen}
      data={data}
      isLoading={isLoading}
      onClose={onClose}
      onSubmit={onSubmit}
      title="對話框 C"
    >
      <div>這是對話框 C 的內容。</div>
      {d && <>
        <p>群組名稱：{d.abTypeName}</p>
        {/* 這裡可加上建立按鈕等 */}
      </>}
    </CustomDialog>
  );
};

type DialogComponentMap = {
  [K in DialogType]: React.FC<BaseDialogProps<unknown>>;
};

const DialogManager: React.FC = React.memo(() => {
  const { dialogs, closeDialog } = useDialogStore();

  const dialogComponentMap: DialogComponentMap = {
    [DialogType.DialogA]: DialogA,
    [DialogType.DialogB]: DialogB,
    [DialogType.DialogC]: DialogC,
  };

  function renderDialog(type: DialogType) {
    const DialogComponent = dialogComponentMap[type];
    const dialogState = dialogs[type];
    if (!dialogState) return null;
    return (
      <DialogComponent
        key={type}
        isOpen={dialogState.isOpen}
        data={dialogState.data}
        isLoading={dialogState.isLoading}
        onClose={() => closeDialog(type)}
        onSubmit={() => {}}
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