import React from 'react';
import CustomDialog from './CustomDialog';
import { useDialogStore } from '../../stores/dialogStore';
import {DialogType, DialogsState, DialogAProps} from '../../types/dialog';

const DialogA = ({ isOpen, abTypeName, sourceName, sourceID, isLoading, onClose, onCreate }: DialogAProps) => {
  return (
    <CustomDialog
      dialogType={DialogType.DialogA}
      isOpen={isOpen}
      isLoading={isLoading}
      onClose={onClose}
      onSubmit={() => {}}
      title="對話框 A"
    >
      <div>這是對話框 A 的內容。</div>
      <p>群組名稱：{abTypeName}</p>
      <p>來源名稱：{sourceName}</p>
      <p>來源ID：{sourceID}</p>
      <button onClick={() => onCreate(abTypeName)}>建立</button>
    </CustomDialog>
  );
};

const DialogB= (props) => {
  const { isOpen, abTypeName, sourceName, isLoading, onClose, onCreate } = props;
  return (
    <CustomDialog
      dialogType={DialogType.DialogB}
      isOpen={isOpen}
      isLoading={isLoading}
      onClose={onClose}
      onSubmit={() => {}}
      title="對話框 B"
    >
      <div>這是對話框 B 的內容。</div>
      <p>群組名稱：{abTypeName}</p>
      <p>來源名稱：{sourceName}</p>
      <button onClick={() => onCreate(abTypeName)}>建立</button>
    </CustomDialog>
  );
};

const DialogC = (props) => {
  const { isOpen, abTypeName, isLoading, onClose, onDelete } = props;
  return (
    <CustomDialog
      dialogType={DialogType.DialogC}
      isOpen={isOpen}
      isLoading={isLoading}
      onClose={onClose}
      onSubmit={() => {}}
      title="對話框 C"
    >
      <div>這是對話框 C 的內容。</div>
      <p>群組名稱：{abTypeName}</p>
      <button onClick={() => onDelete(true)}>刪除</button>
      <button onClick={() => onDelete(false)}>取消</button>
    </CustomDialog>
  );
};

const dialogComponentMap: { [K in DialogType]: React.FC<DialogsState[K]> } = {
  [DialogType.DialogA]: DialogA,
  [DialogType.DialogB]: DialogB,
  [DialogType.DialogC]: DialogC,
};

const DialogManager= React.memo(() => {
  const { dialogs, closeDialog } = useDialogStore();

  function renderDialog<T extends DialogType>(type: T) {
    const DialogComponent = dialogComponentMap[type] as DialogsState[T];
    const dialogState = dialogs[type] as DialogsState[T];
    // 自動注入 onClose
    return <DialogComponent key={type} {...dialogState} onClose={() => closeDialog(type)} />;
  }

  return (
    <>
      {(Object.keys(dialogComponentMap) as DialogType[]).map(type => renderDialog(type))}
    </>
  );
});

export default DialogManager;